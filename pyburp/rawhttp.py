"""Helpers to convert between raw HTTP request text and (method, path, headers, body)."""


def build_raw(method: str, path: str, headers, body: bytes) -> bytes:
    lines = [f"{method} {path} HTTP/1.1".encode("latin-1")]
    for k, v in headers.items():
        lines.append(f"{k}: {v}".encode("latin-1"))
    return b"\r\n".join(lines) + b"\r\n\r\n" + (body or b"")


def parse_raw(raw: bytes):
    # Accept both "\r\n" (wire-correct) and plain "\n" (what a text editor
    # saves on Unix after a user hand-edits an intercepted/repeated request).
    raw = raw.replace(b"\r\n", b"\n")
    head, _, body = raw.partition(b"\n\n")
    lines = head.split(b"\n")
    request_line = lines[0].decode("latin-1").strip()
    parts = request_line.split(" ", 2)
    method = parts[0] if parts else "GET"
    path = parts[1] if len(parts) > 1 else "/"

    headers = {}
    for line in lines[1:]:
        if not line.strip():
            continue
        k, sep, v = line.decode("latin-1").partition(":")
        if sep:
            headers[k.strip()] = v.strip()

    headers["Content-Length"] = str(len(body))
    return method, path, headers, body
