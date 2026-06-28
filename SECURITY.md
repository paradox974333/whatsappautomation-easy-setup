# Security Policy

## Reporting a vulnerability

If you discover a security issue, please **do not open a public issue**. Instead, report it privately via [GitHub Security Advisories](https://github.com/paradox974333/whatsappautomation-easy-setup/security/advisories/new) or by contacting the maintainer directly. We'll respond as quickly as we can.

## Handling secrets (important for all users)

This project connects to WhatsApp and an AI provider, so it handles sensitive data. Please:

- **Never commit your `.env` file.** It is gitignored by default — keep it that way.
- **Never commit the `tokens/` directory.** It contains your live WhatsApp session credentials. Anyone with these files can impersonate your WhatsApp account.
- **Never commit `uploads/` or `logs/`** — they may contain customer messages and media.
- Rotate your `CEREBRAS_API_KEY` if it is ever exposed.
- Treat captured leads and conversations as personal data; comply with WhatsApp's terms and your local privacy laws.

## Disclaimer

This is an unofficial automation tool built on WPPConnect. Automating WhatsApp may violate WhatsApp's Terms of Service. Use it responsibly and at your own risk.
