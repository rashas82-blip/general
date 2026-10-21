# Serene Mind Hypnotherapy — Website

A single-page, mobile-friendly website for a hypnotherapy practice. Plain HTML, CSS and JavaScript — no build tools needed.

## Structure
```
index.html        – all page content (text, services, prices, FAQ, contact)
css/styles.css    – design; colours are at the top (:root) for easy re-theming
js/main.js        – interactions
images/           – your photos (see images/README.md for the file names)
```

## Page flow
Header (sticky, mobile menu, light/dark toggle) → Hero → "Breathe with me" exercise → About + stats → Services (tap a card for details) → How it works → Pricing → Testimonials carousel → FAQ → Booking & contact form → Footer.

## Customising
- **Business name / your name / address / phone / email:** search `index.html` for `Serene`, `[Your Name]`, `[Your Town]`, `[Your clinic address]`, `+44 0000`, `hello@yourdomain.com`.
- **Services:** each card is a `<button class="service-card">`; its `data-title`, `data-desc`, `data-duration` and `data-price` fill the pop-up.
- **Prices:** edit the `.price-card` blocks.
- **Online booking:** replace `https://calendly.com/your-link` with your booking link.
- **Contact form:** connected to Formspree form `xgaojraj` (messages go to the email on that Formspree account). To change it, edit the form's `action` in `index.html`.
- **Colours:** edit `--primary`, `--accent` etc. at the top of `css/styles.css`.

## Preview locally
```
python3 -m http.server 8000
```
then open http://localhost:8000.

## Publishing
Live (free) on GitHub Pages: https://rashas82-blip.github.io/general/ — it updates automatically a minute or two after each push to the `claude/magical-gauss-hwibl1` branch.
