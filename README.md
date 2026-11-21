# Jireh Digital — Website

A premium, fully responsive agency website built with plain HTML, CSS and JavaScript (no build step), ready for Netlify.

## Files

```
jireh-digital/
├── index.html          Main one-page website
├── 404.html            Custom "page not found" page (Netlify uses it automatically)
├── thank-you.html      Shown if the contact form is sent without JavaScript
├── css/styles.css      All styling, animations and responsive rules
├── js/main.js          Navigation, scroll animations, tilt effects, filters, contact form
├── js/hero3d.js        Three.js particle/3D layer for the hero (loads only on capable devices)
├── assets/             Logo, favicons and social-sharing image
├── favicon.ico
├── netlify.toml        Netlify settings (security + caching headers)
├── robots.txt / sitemap.xml / site.webmanifest
```

## Before you go live: 2 things to update

1. **Email address.** The site uses `hello@jirehdigital.com` as a placeholder. Search for it in `index.html` (it appears 3 times) and replace it with your real email.
2. **Domain.** The SEO and social-sharing tags use `https://jireh-digital.netlify.app`. Once you know your final address, find and replace it in `index.html`, `robots.txt` and `sitemap.xml`.

## Deploy to Netlify (step by step)

1. Unzip the folder on your computer.
2. Go to **app.netlify.com** and log in (or sign up free).
3. Click **Add new site → Deploy manually**.
4. Drag the whole `jireh-digital` folder onto the upload area.
5. Wait about 30 seconds. Netlify gives you a live link like `random-name.netlify.app`.
6. Rename it: **Site configuration → Change site name** → e.g. `jirehdigital`.
7. Turn on form notifications: **Forms** (left menu) → you'll see the `contact` form after the first deploy → **Form notifications → Add notification → Email** → enter your email. Every enquiry will now arrive in your inbox.
8. (Optional) Custom domain: **Domain management → Add a domain** and follow Netlify's DNS steps.

## How the 3D works

- The floating website mockups in the hero are pure CSS 3D, so they work on every device.
- On capable devices, a Three.js particle field and glowing rings load on top.
- It is skipped automatically on low-memory phones, data-saver mode, "reduce motion" settings, or if WebGL isn't available — the CSS version remains, so nothing breaks.

## Editing tips

- Colours live at the top of `css/styles.css` under `:root`.
- Portfolio items are demo concepts and clearly labelled. When you have real client work, replace a `<article class="project">` block in `index.html` with a screenshot of the real site.
- Every WhatsApp button links to `https://wa.me/27704416035`.
