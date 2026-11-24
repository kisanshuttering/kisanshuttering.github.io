# CSS loading fix

The shared compiled stylesheet is now also included at `public/style.css`, which GitHub Pages/Vite copies to the deployment root. HTML pages reference it as `/style.css` so nested pages do not resolve it relative to their own folder.

The Tailwind source stylesheet at `src/index.css` remains a Vite-processed stylesheet and is intentionally not copied raw into `public`, because it contains `@import "tailwindcss"` and must be compiled by the Vite Tailwind plugin.

After pushing, check these URLs:
- https://kisanshuttering.com/style.css
- https://kisanshuttering.com/assets/ (not a directory listing; verify the CSS URL emitted in page source for Tailwind pages)

Then hard-refresh the browser (Ctrl+Shift+R / Cmd+Shift+R).
