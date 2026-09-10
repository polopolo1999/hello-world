"""Send/edit/resend a single HTTP request, Burp "Repeater"-style."""

import http.client
import ssl
from urllib.parse import urlsplit


def send_raw(url: str, method: str, headers: dict, body: bytes, verify: bool = True, timeout: int = 30):
    """Send one request to `url` and return (status, reason, headers_dict, body_bytes)."""
    parsed = urlsplit(url)
    scheme = parsed.scheme or "http"
    host = parsed.hostname
    if not host:
        raise ValueError(f"URL missing host: {url!r}")
    port = parsed.port or (443 if scheme == "https" else 80)
    path = parsed.path or "/"
    if parsed.query:
        path += "?" + parsed.query

    if scheme == "https":
        ctx = ssl.create_default_context()
        if not verify:
            ctx.check_hostname = False
            ctx.verify_mode = ssl.CERT_NONE
        conn = http.client.HTTPSConnection(host, port, timeout=timeout, context=ctx)
    else:
        conn = http.client.HTTPConnection(host, port, timeout=timeout)

    try:
        conn.request(method, path, body=body, headers=headers)
        resp = conn.getresponse()
        resp_body = resp.read()
        return resp.status, resp.reason, dict(resp.getheaders()), resp_body
    finally:
        conn.close()
