"""Interactive intercept: pause a request, show it, let the user forward/edit/drop it.

Mirrors Burp's Proxy "Intercept" tab in a minimal, terminal-based way.
"""

import os
import subprocess
import tempfile
import threading

_lock = threading.Lock()


def maybe_intercept(enabled: bool, raw_request: bytes):
    """Returns (action, raw_request) where action is 'forward' or 'drop'."""
    if not enabled:
        return "forward", raw_request

    with _lock:
        print("\n" + "=" * 70)
        print("INTERCEPTED REQUEST")
        print("=" * 70)
        try:
            print(raw_request.decode("utf-8"))
        except UnicodeDecodeError:
            print(raw_request.decode("latin-1"))
        print("=" * 70)

        while True:
            choice = input("[f]orward / [e]dit / [d]rop ? ").strip().lower()
            if choice.startswith("f") or choice == "":
                return "forward", raw_request
            if choice.startswith("e"):
                return "forward", edit_in_editor(raw_request)
            if choice.startswith("d"):
                return "drop", raw_request
            print("Please enter f, e, or d.")


def edit_in_editor(raw: bytes) -> bytes:
    editor = os.environ.get("EDITOR", "nano")
    fd, path = tempfile.mkstemp(suffix=".http", prefix="pyburp-")
    try:
        with os.fdopen(fd, "wb") as f:
            f.write(raw)
        subprocess.call([editor, path])
        with open(path, "rb") as f:
            return f.read()
    finally:
        try:
            os.unlink(path)
        except OSError:
            pass
