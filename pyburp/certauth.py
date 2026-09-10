"""Local MITM certificate authority, used to decrypt HTTPS for interception.

A root CA keypair is generated once under ~/.pyburp/ca and reused. Per-host
"leaf" certificates are generated on demand and signed by that root CA, so
the proxy can terminate TLS from the client and re-establish TLS to the
real server.

This only works for clients that are configured to trust the generated CA
certificate (install pyburp-ca.pem into the browser/OS trust store used for
testing). Never install this CA outside of a controlled testing setup.
"""

import datetime
import ipaddress
import os

from cryptography import x509
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.x509.oid import NameOID


class CertAuthority:
    def __init__(self, ca_dir=None):
        self.ca_dir = ca_dir or os.path.expanduser("~/.pyburp/ca")
        os.makedirs(self.ca_dir, exist_ok=True)

        self.ca_cert_path = os.path.join(self.ca_dir, "pyburp-ca.pem")
        self.ca_key_path = os.path.join(self.ca_dir, "pyburp-ca-key.pem")
        self.keyfile = os.path.join(self.ca_dir, "leaf-key.pem")

        self._leaf_key = self._load_or_create_key(self.keyfile)
        self._ensure_ca()
        self._cache = {}

    def _load_or_create_key(self, path):
        if os.path.exists(path):
            with open(path, "rb") as f:
                return serialization.load_pem_private_key(f.read(), password=None)
        key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
        with open(path, "wb") as f:
            f.write(
                key.private_bytes(
                    serialization.Encoding.PEM,
                    serialization.PrivateFormat.TraditionalOpenSSL,
                    serialization.NoEncryption(),
                )
            )
        os.chmod(path, 0o600)
        return key

    def _ensure_ca(self):
        if os.path.exists(self.ca_cert_path) and os.path.exists(self.ca_key_path):
            with open(self.ca_key_path, "rb") as f:
                self.ca_key = serialization.load_pem_private_key(f.read(), password=None)
            with open(self.ca_cert_path, "rb") as f:
                self.ca_cert = x509.load_pem_x509_certificate(f.read())
            return

        self.ca_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
        subject = issuer = x509.Name(
            [x509.NameAttribute(NameOID.COMMON_NAME, "pyburp Local MITM CA (do not trust globally)")]
        )
        now = datetime.datetime.now(datetime.timezone.utc)
        self.ca_cert = (
            x509.CertificateBuilder()
            .subject_name(subject)
            .issuer_name(issuer)
            .public_key(self.ca_key.public_key())
            .serial_number(x509.random_serial_number())
            .not_valid_before(now - datetime.timedelta(days=1))
            .not_valid_after(now + datetime.timedelta(days=3650))
            .add_extension(x509.BasicConstraints(ca=True, path_length=0), critical=True)
            .add_extension(
                x509.KeyUsage(
                    digital_signature=True,
                    content_commitment=False,
                    key_encipherment=False,
                    data_encipherment=False,
                    key_agreement=False,
                    key_cert_sign=True,
                    crl_sign=True,
                    encipher_only=False,
                    decipher_only=False,
                ),
                critical=True,
            )
            .sign(self.ca_key, hashes.SHA256())
        )

        with open(self.ca_key_path, "wb") as f:
            f.write(
                self.ca_key.private_bytes(
                    serialization.Encoding.PEM,
                    serialization.PrivateFormat.TraditionalOpenSSL,
                    serialization.NoEncryption(),
                )
            )
        os.chmod(self.ca_key_path, 0o600)
        with open(self.ca_cert_path, "wb") as f:
            f.write(self.ca_cert.public_bytes(serialization.Encoding.PEM))

    def get_cert(self, host):
        """Return path to a leaf certificate (PEM) for `host`, signed by the local CA."""
        if host in self._cache:
            return self._cache[host]

        safe_name = host.replace("/", "_").replace("\\", "_")
        cert_path = os.path.join(self.ca_dir, f"host-{safe_name}.pem")
        if os.path.exists(cert_path):
            self._cache[host] = cert_path
            return cert_path

        subject = x509.Name([x509.NameAttribute(NameOID.COMMON_NAME, host)])
        now = datetime.datetime.now(datetime.timezone.utc)
        builder = (
            x509.CertificateBuilder()
            .subject_name(subject)
            .issuer_name(self.ca_cert.subject)
            .public_key(self._leaf_key.public_key())
            .serial_number(x509.random_serial_number())
            .not_valid_before(now - datetime.timedelta(days=1))
            .not_valid_after(now + datetime.timedelta(days=825))
        )

        try:
            ipaddress.ip_address(host)
            san = x509.SubjectAlternativeName([x509.IPAddress(ipaddress.ip_address(host))])
        except ValueError:
            san = x509.SubjectAlternativeName([x509.DNSName(host)])
        builder = builder.add_extension(san, critical=False)

        cert = builder.sign(self.ca_key, hashes.SHA256())

        # Leaf cert + key together so ssl.wrap_socket can load them from one file.
        with open(cert_path, "wb") as f:
            f.write(cert.public_bytes(serialization.Encoding.PEM))
            f.write(
                self._leaf_key.private_bytes(
                    serialization.Encoding.PEM,
                    serialization.PrivateFormat.TraditionalOpenSSL,
                    serialization.NoEncryption(),
                )
            )

        self._cache[host] = cert_path
        return cert_path
