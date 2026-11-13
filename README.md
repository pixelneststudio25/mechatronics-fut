# Mechatronics Engineering, FUT Minna (website rebuild)

Plain HTML, CSS and JavaScript. Hosted on GitHub, deployed on Vercel (mechatronics-fut.vercel.app).

## Folders
- `css/`      tokens.css (colours, type, spacing), base.css (reset, fonts), components.css (header, menu, footer, buttons)
- `js/`       site-config.js (nav, email, socials: the file you edit), components.js (builds header, menu, footer)
- `fonts/`    self-hosted Inter, Space Grotesk, JetBrains Mono (latin, woff2)
- `images/`   logo files, og-image.png, staff/, projects/, events/, stock/
- root        favicon set, apple-touch-icon, Android icons, site.webmanifest
- `_templates/` head-snippet.html and page-template.html (copy from these when making a page; not part of the site)

## Making a page
Copy `_templates/page-template.html`, paste `head-snippet.html` into its head, then edit the title, description and the two URLs.

## Testing locally
Use the VS Code "Live Server" extension. Opening files by double-click will break the absolute `/css/...` paths.

## Not yet written
Home page and the other pages. Delete the old `css/style.css`, `js/script.js`, old HTML pages and old images from the repo once the new pages replace them.
