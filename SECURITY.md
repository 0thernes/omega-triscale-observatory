# Security Policy (`SECURITY.md`)

## Supported Versions

| Version | Supported |
|---|---|
| `6.8.x` | Yes |
| `< 6.8.0` | No — please upgrade to `6.8.0` |

## Security Model Summary

`omega-triscale-observatory` is designed **strictly for local loopback (`127.0.0.1`) execution**. It enforces:
- Strict loopback `Host` (`127.0.0.1`, `localhost`, `[::1]`) and `Origin` verification on all state-mutating HTTP endpoints, SSE streams, and WebSocket upgrades (`isSafeLoopbackRequest`).
- `Sec-Fetch-Site` filtering and required `application/json` content-type on `POST /api/stack/action`.
- Canonical `path.relative` static file containment (`resolveSafePath`) blocking `..`, backslash, NUL-byte, UNC, and drive-letter traversal.
- Bounded request/response payload caps (`2 MiB` proxy request, `16 MiB` proxy rewrite response, `256 KiB` JSON command body, `32` concurrent SSE clients).

See [`docs/threat-model.md`](docs/threat-model.md) for the full STRIDE analysis.

## Reporting a Vulnerability

Please **do not open a public GitHub issue** for security vulnerabilities.

1. Use GitHub Private Security Advisories: `https://github.com/0thernes/omega-triscale-observatory/security/advisories/new`
2. Or email the maintainer directly at `0_0@0thernes.art` with `[SECURITY] omega-triscale-observatory` in the subject line.

Include reproduction steps, affected route or module, and version/commit SHA. Reports are acknowledged within 72 hours.
