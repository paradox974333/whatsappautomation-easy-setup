# Contributing

Thanks for your interest in improving this project! Contributions of all sizes are welcome — bug reports, docs, features, and ideas.

## Quick start for contributors

```bash
# 1. Fork and clone
git clone https://github.com/<your-username>/whatsappautomation-easy-setup.git
cd whatsappautomation-easy-setup

# 2. Install dependencies
npm install

# 3. Configure your environment
cp .env.example .env   # then add your CEREBRAS_API_KEY

# 4. Run in dev mode
npm run dev
```

## Before you open a Pull Request

- Create a branch: `git checkout -b feat/short-description`
- Make sure it compiles: `npm run build`
- Keep changes focused — one logical change per PR
- Update the README/docs if you change behavior or config
- Use clear commit messages (e.g. `fix: reconnect after dropped session`)

## Good first contributions

- Improve documentation and setup steps
- Add support for another AI provider (see `src/ai/ai.provider.ts`)
- Add new message types or REST endpoints
- Write a persona example for a new use case in `prompt/`

## Reporting bugs / requesting features

Open an issue and include: what you expected, what happened, steps to reproduce, and your environment (OS, Node version, Docker or local). **Never paste your `.env`, API keys, or session tokens into an issue.**

## Code of conduct

Be respectful and constructive. We want this to be a welcoming project for everyone.
