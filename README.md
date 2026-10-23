# Shivani Sharma's Parlour — Website

A static, responsive website for Shivani Sharma's Parlour, Khadi Machine, Yewlewadi, Pune. It uses HTML, CSS and vanilla JavaScript with no build step and no dependencies beyond the Google Fonts link.

## Status of this build (read first)

| Item | Status |
|---|---|
| Original photographs | **Not supplied.** The `assets/images/*.jpg` files are labelled PLACEHOLDER images. Replace them (see below). |
| Owner portrait | **Placeholder.** Replace `assets/images/owner-photo.jpg` with the supplied photograph. |
| Price list | **Not supplied.** All prices show as "To be confirmed". Enter real amounts in `data/services.json` (see below). |
| Opening hours | **Not supplied.** The site says to contact the parlour for timings. |
| Instagram URL | Used exactly as supplied: `https://www.instagram.com/shivanisharma89004gmail.com6/?hl=en`. This looks unusual, so please confirm the handle. |
| Booking / enquiry backend | **None.** Forms prepare a WhatsApp message or email for the customer to review and send. No request is shown as sent or confirmed. |
| AI chatbot | **Basic demo assistant** (keyword and FAQ responses, English / Hindi / Hinglish). No AI model or live availability is connected. |
| Google Maps | Address-based "Get Directions" link. No precise map pin or embed was invented. |

## Run locally

Open `index.html` by double-clicking it. Everything works from disk, including the price list and the forms.

For best results (for example, when editing `services.json`), serve the folder with any static server:

```bash
cd shivani-sharma-parlour
python3 -m http.server 8000
# then open http://localhost:8000
```

## Folder structure

```
index.html              Main page (all sections)
css/style.css           Brand styling, layout, animations, responsive rules
js/script.js            Navigation, forms, price list, FAQ, gallery, chatbot
js/services-data.js     Service data for opening the page straight from disk
data/services.json      Service and price data (the editable source)
assets/images/          Photographs (currently placeholders)
README.md               This file
```

## Replacing the photographs

1. Copy the original photos into `assets/images/` and **keep the same file names**. No code changes are needed. Use the original files, not edited or compressed copies.
2. If you use different names, update the `src` attributes in `index.html`.
3. Update the `alt` text on each image so it describes the real photo.
4. Owner portrait: replace `owner-photo.jpg` with the owner's supplied photograph. Do not use an unrelated model.
5. Bridal and other pages must not present stock photos as real customers. Before-and-after photos should only be used when the client has provided them with consent.

Recommended sizes: hero at least 1600 px wide; other images at least 1200 px wide.

## Updating prices (the price list)

1. Open `data/services.json`. Each service has a `"price"` field set to `null`.
2. Replace `null` with the amount from the official price list, as text, for example `"price": "₹1,500"` (keep the currency and package wording exactly as supplied).
3. Set `"priceListStatus"` to `"supplied"` once all prices are entered. This hides the placeholder banner.
4. If you have packages or conditions, add them to the `description` text of the service.
5. Regenerate the offline copy of the data so the page also works when opened from disk:

```bash
python3 -c "import json;d=json.load(open('data/services.json'));open('js/services-data.js','w').write('// Generated from data/services.json.\nwindow.PARLOUR_DATA = '+json.dumps(d,ensure_ascii=False,indent=2)+';\n')"
```

Do not estimate prices. Unclear prices should stay "To be confirmed" until the owner confirms them.

## Forms: how they work and how to add a real backend

- **Booking form** validates required fields, the Indian mobile number format, and prevents past dates. It then shows a preview of a WhatsApp message (editable by the customer) and a button to open WhatsApp. It states that the request is not a confirmed appointment.
- **Enquiry form** validates the fields and then offers "Contact on WhatsApp" and "Send Email" buttons. It does not claim the enquiry was sent.

To deliver submissions to a real destination later (for example, a form service, an email endpoint, or a calendar/booking API):

1. Add a `fetch()` POST in `js/script.js` inside the submit handlers, to your endpoint.
2. Only show a success message after the server responds successfully.
3. Keep secret keys on the server, never in the browser.

Business timings and real availability should come from a verified calendar or booking backend. Until then, the site must not display available slots.

## Chatbot: connecting a real AI model

The current assistant is a rule-based demo with no external calls. To connect a real AI model:

1. Build a small server endpoint (for example, `POST /api/chat`) that holds the AI API key in an environment variable.
2. Have `js/script.js` send the visitor's message to that endpoint and render the reply.
3. Restrict the system prompt to the parlour's services, the price list in `services.json`, and the contact details. Make it say when a human should be contacted.
4. Never place API keys in HTML or JavaScript.
5. Label the assistant accurately while it is a demo.

## Business information used across the site

- Phone / WhatsApp: +91 9579199431 (`https://wa.me/919579199431`)
- Email: shivanisharma89004@gmail.com
- Address: Opposite Datta Vihar Society, Khadi Machine, Yewlewadi Kondhwa, Pune, Maharashtra, India
- Maps: `https://www.google.com/maps/dir/?api=1&destination=Opposite+Datta+Vihar+Society%2C+Khadi+Machine%2C+Yewlewadi+Kondhwa%2C+Pune%2C+Maharashtra`
- Instagram: `https://www.instagram.com/shivanisharma89004gmail.com6/?hl=en` (please confirm)

Search and replace these in `index.html` and `data/services.json` if they change.

## Accessibility and performance

- Semantic HTML, labelled form fields, visible focus styles, skip link, keyboard-operable menu, filters, accordion, lightbox, and chat (Esc closes panels).
- `prefers-reduced-motion` disables animations and scroll effects.
- Lazy loading for below-the-fold images. Replace placeholders with optimised JPEG or WebP files for best speed.

## Browser support

Current versions of Chrome, Edge, Firefox, Safari and mobile browsers. `<dialog>` is used for the lightbox, with a fallback.

## Not included

- Live Instagram feed (uses a profile link only, as required).
- Embedded interactive Google map (address link only, so no key or invented pin is needed).
- Booking or calendar backend, payment, or customer accounts.
