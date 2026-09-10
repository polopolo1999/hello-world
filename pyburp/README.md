# pyburp

A small, single-purpose Python tool inspired by Burp Suite's Proxy and
Repeater tools: an intercepting HTTP(S) proxy that logs every
request/response, optionally lets you pause and edit requests before
they're forwarded, and a Repeater-style mode to replay and tweak a
request over and over.

**Use this only against systems and traffic you own or are explicitly
authorized to test** (your own apps, a CTF target, an authorized pentest
engagement). Intercepting HTTPS requires installing a locally-generated CA
certificate as trusted — only do this in a disposable browser
profile/VM/test device, never on a machine handling real accounts or
sensitive traffic.

## Install

```bash
pip install -r pyburp/requirements.txt
```

## Usage

Run all commands from the repository root as `python -m pyburp <command>`.

### Start the proxy

```bash
python -m pyburp proxy --host 127.0.0.1 --port 8080
```

Point a browser/client's HTTP(S) proxy settings at `127.0.0.1:8080`. Every
request and response is logged to `pyburp_history.db` (SQLite, override
with `--db`).

To intercept HTTPS, trust the generated CA in your test browser:

```bash
python -m pyburp ca-cert   # prints the path to pyburp-ca.pem
```

Import that file into your browser/OS's certificate trust store for
testing (e.g. Firefox: Settings → Privacy & Security → Certificates →
View Certificates → Authorities → Import).

Add `--intercept` to pause every request in the terminal before it's
forwarded, with the option to forward as-is, edit the raw request in
`$EDITOR`, or drop it:

```bash
python -m pyburp proxy --intercept
```

### Browse logged requests

```bash
python -m pyburp history                 # list recent requests
python -m pyburp history --id 3          # full detail for one entry
```

### Repeater: replay and edit a request

From history:

```bash
python -m pyburp repeater --id 3
```

From a raw request file (a text file starting with `METHOD /path HTTP/1.1`,
followed by headers, a blank line, then an optional body):

```bash
python -m pyburp repeater --file request.txt --url https://example.com
```

At the prompt: `s` to send, `e` to open the raw request in `$EDITOR` and
resend, `q` to quit. Use `--insecure` to skip TLS certificate verification
against the target.

## How it works

- Plain HTTP requests are forwarded directly.
- HTTPS is intercepted via `CONNECT` + on-the-fly leaf certificates signed
  by a local root CA (generated once under `~/.pyburp/ca`), so the proxy
  can decrypt, log, and (optionally) let you edit HTTPS traffic just like
  plain HTTP.
- All history is stored in a local SQLite database.

## Limitations (by design, to keep this a small single-purpose script)

- No GUI — everything is terminal-based.
- No scanner/intruder/fuzzing modules, just Proxy + Repeater equivalents.
- WebSocket upgrades and HTTP/2 are not specially handled.
