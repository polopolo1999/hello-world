"""A minimal intercepting HTTP(S) proxy, in the spirit of Burp's Proxy tool.

- Plain HTTP requests are forwarded and logged directly.
- HTTPS is handled via CONNECT + on-the-fly certificate generation (MITM),
  so decrypted requests/responses can also be logged and, if --intercept
  is passed, paused for manual review/edit before forwarding.

Only point browsers/clients you own (and have configured to trust the
local pyburp CA) at this proxy.
"""

import http.client
import http.server
import socketserver
import ssl
from urllib.parse import urlsplit

from .intercept import maybe_intercept
from .rawhttp import build_raw, parse_raw

# Testing proxies commonly hit internal/self-signed targets, so (like Burp)
# don't fail the upstream connection over an untrusted target certificate —
# the client's trust decision is on the local pyburp CA, not on this hop.
_INSECURE_UPSTREAM_CTX = ssl._create_unverified_context()

HOP_BY_HOP = {
    "connection",
    "keep-alive",
    "proxy-authenticate",
    "proxy-authorization",
    "te",
    "trailers",
    "transfer-encoding",
    "upgrade",
}


class ProxyHTTPServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True
    allow_reuse_address = True

    def __init__(self, *args, storage, certauth, intercept_enabled, **kwargs):
        self.storage = storage
        self.certauth = certauth
        self.intercept_enabled = intercept_enabled
        self.tls_targets = {}  # client_address -> (host, port)
        super().__init__(*args, **kwargs)


class ProxyHandler(http.server.BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def log_message(self, fmt, *args):
        pass  # keep stdout clean; history is in the DB / intercept prompts

    # -- HTTPS tunneling -------------------------------------------------

    def do_CONNECT(self):
        host, _, port_s = self.path.partition(":")
        port = int(port_s) if port_s else 443

        try:
            certfile = self.server.certauth.get_cert(host)
        except Exception as e:
            self.send_error(502, f"CA error: {e}")
            return

        self.send_response(200, "Connection Established")
        self.end_headers()

        try:
            ssl_sock = ssl.wrap_socket(
                self.connection, server_side=True, certfile=certfile, keyfile=certfile
            )
        except Exception:
            return

        self.server.tls_targets[self.client_address] = (host, port)
        self.close_connection = True
        try:
            self.__class__(ssl_sock, self.client_address, self.server)
        except (ConnectionError, OSError, ssl.SSLError):
            pass
        finally:
            self.server.tls_targets.pop(self.client_address, None)
            try:
                ssl_sock.close()
            except OSError:
                pass

    # -- Plain HTTP / decrypted-HTTPS methods -----------------------------

    def do_GET(self):
        self._proxy_request("GET")

    def do_POST(self):
        self._proxy_request("POST")

    def do_PUT(self):
        self._proxy_request("PUT")

    def do_DELETE(self):
        self._proxy_request("DELETE")

    def do_PATCH(self):
        self._proxy_request("PATCH")

    def do_HEAD(self):
        self._proxy_request("HEAD")

    def do_OPTIONS(self):
        self._proxy_request("OPTIONS")

    def _proxy_request(self, method):
        tls_target = self.server.tls_targets.get(self.client_address)
        if tls_target:
            host, port = tls_target
            scheme = "https"
            url_path = self.path
        else:
            parsed = urlsplit(self.path)
            host = parsed.hostname
            port = parsed.port or 80
            scheme = "http"
            url_path = parsed.path or "/"
            if parsed.query:
                url_path += "?" + parsed.query

        if not host:
            self.send_error(400, "Bad request (missing host)")
            return

        length = int(self.headers.get("Content-Length", 0) or 0)
        body = self.rfile.read(length) if length else b""

        headers = {k: v for k, v in self.headers.items() if k.lower() not in HOP_BY_HOP}
        raw_request = build_raw(method, url_path, headers, body)

        action, raw_request = maybe_intercept(self.server.intercept_enabled, raw_request)
        if action == "drop":
            self.send_response(403)
            self.send_header("Content-Length", "0")
            self.end_headers()
            return

        method, url_path, headers, body = parse_raw(raw_request)
        full_url = f"{scheme}://{host}{'' if port in (80, 443) else ':' + str(port)}{url_path}"

        if scheme == "https":
            conn = http.client.HTTPSConnection(host, port, timeout=30, context=_INSECURE_UPSTREAM_CTX)
        else:
            conn = http.client.HTTPConnection(host, port, timeout=30)
        try:
            conn.request(method, url_path, body=body, headers=headers)
            resp = conn.getresponse()
            resp_body = resp.read()
        except Exception as e:
            self.send_error(502, f"Proxy error contacting {host}:{port}: {e}")
            return
        finally:
            conn.close()

        resp_headers = [
            (k, v) for k, v in resp.getheaders() if k.lower() not in HOP_BY_HOP
        ]

        self.server.storage.log(
            method,
            full_url,
            headers,
            body,
            resp.status,
            dict(resp_headers),
            resp_body,
        )

        self.send_response(resp.status, resp.reason)
        for k, v in resp_headers:
            # send_response() above already wrote our own Server/Date headers.
            if k.lower() in ("server", "date"):
                continue
            self.send_header(k, v)
        self.send_header("Content-Length", str(len(resp_body)))
        self.end_headers()
        self.wfile.write(resp_body)


def run_proxy(host, port, storage, certauth, intercept_enabled):
    server = ProxyHTTPServer(
        (host, port),
        ProxyHandler,
        storage=storage,
        certauth=certauth,
        intercept_enabled=intercept_enabled,
    )
    print(f"pyburp proxy listening on {host}:{port}")
    print(f"CA certificate: {certauth.ca_cert_path}")
    print("Install/trust that CA in your test browser to intercept HTTPS.")
    if intercept_enabled:
        print("Intercept mode ON: each request will pause for review.")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
