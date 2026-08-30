# Security Policy

Obsin handles GitHub authentication and may access private note repositories, so please report security issues responsibly.

## Reporting a vulnerability

Please do **not** open a public GitHub issue for security vulnerabilities.

Instead, contact the maintainer privately:

- GitHub: [@shreyansh-singh74](https://github.com/shreyansh-singh74)

If you prefer email, open a minimal private contact request through GitHub first if no security email is listed on the maintainer profile.

## What to include

Please include:

- A clear description of the issue
- Steps to reproduce
- Affected routes/files/features, if known
- Potential impact
- Any suggested fix or mitigation

Do not include real access tokens, private vault content, or sensitive personal data.

## Security model

- GitHub is the source of truth for vault data.
- Notes are stored locally in the browser through IndexedDB.
- OAuth serverless functions perform token exchange/handoff but do not persist tokens.
- OAuth handoff cookies are short-lived and HttpOnly.
- Browser-side tokens are stored locally, so users should protect their browser profile/device.

## Recommended user precautions

- Use the least-privileged GitHub token that works for your vault.
- Avoid using Obsin on untrusted/shared browsers for private repositories.
- Revoke GitHub tokens from GitHub settings if a device/browser profile may be compromised.
