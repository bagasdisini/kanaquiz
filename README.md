# Kana Quiz
Kana Quiz made with React.js.

See live at `https://kana.pro/legacy` when mounted behind the main site, or on its
own Cloudflare Pages deployment domain.


Install deps: `npm install`

Development: `npm start`

Production: `npm run build`

Cloudflare Pages:
- Build command: `npm ci && npm run build`
- Build output directory: `dist`
- Deploy this as its own Pages project, then point the root-domain `/legacy/` proxy to that Pages hostname.
