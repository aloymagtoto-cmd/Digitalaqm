# Images

## og-cover.jpg

The share card — what LinkedIn, WhatsApp, Messenger, Slack and iMessage show
when a page of the site is linked. Every page points `og:image` and
`twitter:image` at it.

- **Size:** exactly 1200 × 630 px.
- **File size:** keep it under ~300 KB or WhatsApp skips the thumbnail.
- **Format:** JPEG, quality ~85.

To regenerate it, open `tools/og-card.html`, edit the copy or stats there, and
screenshot the `.card` element at 1200 × 630. The card is brand-only by design:
the AQM mark, the headline, the numbers, the domain — no photo.

## About block

`.about__portrait` on the homepage and the About page is a CSS gradient block
carrying the AQM mark. It needs no image file.
