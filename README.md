# easybay

Minimal TypeScript helpers to prepare sale drafts for `ebay.es` and `olx.pt`.

## What it does

- accepts photos and a short description
- suggests localized categories for both marketplaces
- generates marketplace-ready descriptions in Spanish and Portuguese
- estimates a price from currently active comparable listings
- leaves the price unset when no comparable active listing is found

## Usage

```ts
import { createListingSuggestion } from "easybay";

const draft = createListingSuggestion({
  shortDescription: "iPhone 13 azul de 128GB con batería al 90%",
  photos: ["/photos/front.jpg", "/photos/back.jpg"],
  condition: "used",
  activeListings: [
    { title: "iPhone 13 128GB", price: 410, active: true, category: "Telemóveis" },
    { title: "Apple iPhone 13 azul", price: 430, active: true, category: "Móviles y telefonía" }
  ]
});
```

## Commands

- `npm run typecheck`
- `npm test`