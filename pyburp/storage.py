"""SQLite-backed request/response history (Burp's "HTTP history" tab)."""

import json
import sqlite3
import threading
import time


class Storage:
    def __init__(self, path="pyburp_history.db"):
        self.path = path
        self._local = threading.local()
        self._init_db()

    def _conn(self):
        conn = getattr(self._local, "conn", None)
        if conn is None:
            conn = sqlite3.connect(self.path)
            self._local.conn = conn
        return conn

    def _init_db(self):
        conn = sqlite3.connect(self.path)
        conn.execute(
            """CREATE TABLE IF NOT EXISTS requests (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                ts REAL,
                method TEXT,
                url TEXT,
                req_headers TEXT,
                req_body BLOB,
                status INTEGER,
                resp_headers TEXT,
                resp_body BLOB
            )"""
        )
        conn.commit()
        conn.close()

    def log(self, method, url, req_headers, req_body, status, resp_headers, resp_body):
        conn = self._conn()
        conn.execute(
            "INSERT INTO requests "
            "(ts, method, url, req_headers, req_body, status, resp_headers, resp_body) "
            "VALUES (?,?,?,?,?,?,?,?)",
            (
                time.time(),
                method,
                url,
                json.dumps(req_headers),
                req_body,
                status,
                json.dumps(resp_headers),
                resp_body,
            ),
        )
        conn.commit()

    def list(self, limit=50):
        conn = self._conn()
        cur = conn.execute(
            "SELECT id, ts, method, url, status FROM requests ORDER BY id DESC LIMIT ?",
            (limit,),
        )
        return cur.fetchall()

    def get(self, req_id):
        conn = self._conn()
        cur = conn.execute(
            "SELECT id, ts, method, url, req_headers, req_body, status, "
            "resp_headers, resp_body FROM requests WHERE id = ?",
            (req_id,),
        )
        row = cur.fetchone()
        if row is None:
            return None
        (rid, ts, method, url, req_headers, req_body, status, resp_headers, resp_body) = row
        return {
            "id": rid,
            "ts": ts,
            "method": method,
            "url": url,
            "req_headers": json.loads(req_headers) if req_headers else {},
            "req_body": req_body or b"",
            "status": status,
            "resp_headers": json.loads(resp_headers) if resp_headers else {},
            "resp_body": resp_body or b"",
        }
