"""Command-line entry point for pyburp: proxy / history / repeater / ca-cert."""

import argparse
import datetime
import sys

from urllib.parse import urlsplit, urlunsplit

from .certauth import CertAuthority
from .intercept import edit_in_editor
from .proxy import run_proxy
from .rawhttp import build_raw, parse_raw
from .repeater import send_raw
from .storage import Storage


def cmd_proxy(args):
    storage = Storage(args.db)
    certauth = CertAuthority()
    run_proxy(args.host, args.port, storage, certauth, args.intercept)


def cmd_history(args):
    storage = Storage(args.db)
    if args.id is not None:
        row = storage.get(args.id)
        if row is None:
            print(f"No entry with id {args.id}")
            return 1
        print(f"#{row['id']}  {datetime.datetime.fromtimestamp(row['ts'])}")
        print(f"{row['method']} {row['url']} -> {row['status']}")
        print("\n-- Request headers --")
        for k, v in row["req_headers"].items():
            print(f"{k}: {v}")
        if row["req_body"]:
            print("\n-- Request body --")
            print(row["req_body"][:2000].decode("utf-8", errors="replace"))
        print("\n-- Response headers --")
        for k, v in row["resp_headers"].items():
            print(f"{k}: {v}")
        if row["resp_body"]:
            print("\n-- Response body --")
            print(row["resp_body"][:2000].decode("utf-8", errors="replace"))
        return 0

    rows = storage.list(args.limit)
    if not rows:
        print("(no requests logged yet)")
        return 0
    print(f"{'ID':>5}  {'STATUS':>6}  {'METHOD':<7} URL")
    for rid, ts, method, url, status in rows:
        print(f"{rid:>5}  {status if status else '-':>6}  {method:<7} {url}")
    return 0


def cmd_repeater(args):
    if args.id is None and args.file is None:
        print("Provide --id (load from history) or --file (load a raw request file)")
        return 1

    if args.id is not None:
        storage = Storage(args.db)
        row = storage.get(args.id)
        if row is None:
            print(f"No entry with id {args.id}")
            return 1
        method, url, headers, body = row["method"], row["url"], row["req_headers"], row["req_body"]
    else:
        with open(args.file, "rb") as f:
            raw = f.read()
        method, path, headers, body = parse_raw(raw)
        if not args.url:
            print("--url is required when loading a request from --file (e.g. https://example.com)")
            return 1
        base = args.url.rstrip("/")
        url = base if path in ("", "/") else base + path

    while True:
        print(f"\n{method} {url}")
        for k, v in headers.items():
            print(f"{k}: {v}")
        if body:
            print()
            print(body[:1000].decode("utf-8", errors="replace"))

        choice = input("\n[s]end / [e]dit / [q]uit ? ").strip().lower()
        if choice.startswith("q"):
            return 0
        if choice.startswith("e"):
            parsed = urlsplit(url)
            path_and_query = parsed.path or "/"
            if parsed.query:
                path_and_query += "?" + parsed.query
            raw = build_raw(method, path_and_query, headers, body)
            raw = edit_in_editor(raw)
            method, new_path, headers, body = parse_raw(raw)
            url = urlunsplit((parsed.scheme, parsed.netloc, *urlsplit(new_path)[2:]))
            continue
        if not choice.startswith("s") and choice != "":
            print("Please enter s, e, or q.")
            continue

        try:
            status, reason, resp_headers, resp_body = send_raw(
                url, method, headers, body, verify=not args.insecure
            )
        except Exception as e:
            print(f"Request failed: {e}")
            continue

        print(f"\n<< {status} {reason}")
        for k, v in resp_headers.items():
            print(f"{k}: {v}")
        print()
        print(resp_body[:4000].decode("utf-8", errors="replace"))


def cmd_ca_cert(args):
    certauth = CertAuthority()
    print(certauth.ca_cert_path)


def main(argv=None):
    parser = argparse.ArgumentParser(
        prog="pyburp",
        description=(
            "A lightweight, Burp-Suite-like HTTP(S) intercepting proxy and repeater. "
            "Use only against systems/traffic you own or are authorized to test."
        ),
    )
    sub = parser.add_subparsers(dest="command", required=True)

    p_proxy = sub.add_parser("proxy", help="Start the intercepting HTTP(S) proxy")
    p_proxy.add_argument("--host", default="127.0.0.1", help="Address to listen on (default: 127.0.0.1)")
    p_proxy.add_argument("--port", type=int, default=8080, help="Port to listen on (default: 8080)")
    p_proxy.add_argument(
        "--intercept", action="store_true", help="Pause each request for manual review/edit before forwarding"
    )
    p_proxy.add_argument("--db", default="pyburp_history.db", help="SQLite history file")
    p_proxy.set_defaults(func=cmd_proxy)

    p_hist = sub.add_parser("history", help="List or inspect logged requests")
    p_hist.add_argument("--db", default="pyburp_history.db")
    p_hist.add_argument("--limit", type=int, default=50)
    p_hist.add_argument("--id", type=int, help="Show full detail for one entry")
    p_hist.set_defaults(func=cmd_history)

    p_rep = sub.add_parser("repeater", help="Resend/edit a request interactively (like Burp Repeater)")
    p_rep.add_argument("--db", default="pyburp_history.db")
    p_rep.add_argument("--id", type=int, help="Load a request from history by id")
    p_rep.add_argument("--file", help="Load a raw HTTP request from a text file")
    p_rep.add_argument("--url", help="Target base URL, e.g. https://example.com (required with --file)")
    p_rep.add_argument("--insecure", action="store_true", help="Do not verify TLS certificates")
    p_rep.set_defaults(func=cmd_repeater)

    p_ca = sub.add_parser(
        "ca-cert", help="Print the path to the local MITM CA certificate (install it in your test browser)"
    )
    p_ca.set_defaults(func=cmd_ca_cert)

    args = parser.parse_args(argv)
    return args.func(args) or 0


if __name__ == "__main__":
    sys.exit(main())
