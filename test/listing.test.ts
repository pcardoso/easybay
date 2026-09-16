import test from "node:test";
import assert from "node:assert/strict";

import { createListingSuggestion } from "../src/listing";

test("creates localized marketplace drafts and estimates the median price", () => {
  const suggestion = createListingSuggestion({
    shortDescription: "iPhone 13 azul de 128GB con batería al 90%",
    photos: ["/photos/iphone-front.jpg", "/photos/iphone-back.jpg"],
    condition: "used",
    activeListings: [
      { title: "iPhone 13 128GB", price: 410, active: true, category: "Telemóveis" },
      { title: "Apple iPhone 13 azul", price: 430, active: true, category: "Móviles y telefonía" },
      { title: "Laptop usada", price: 700, active: true, category: "Informática" },
    ],
  });

  assert.equal(suggestion.suggestedPrice, 420);
  assert.equal(suggestion.categorySuggestions["ebay.es"], "Móviles y telefonía");
  assert.equal(suggestion.categorySuggestions["olx.pt"], "Telemóveis");
  assert.equal(suggestion.drafts[0]?.price, 420);
  assert.match(suggestion.drafts[0]?.description ?? "", /Producto usado/i);
  assert.match(suggestion.drafts[1]?.description ?? "", /Produto usado/i);
});

test("does not set a price when no comparable active listing is available", () => {
  const suggestion = createListingSuggestion({
    title: "Mesa vintage",
    shortDescription: "Mesa de madeira maciça restaurada",
    photos: ["/photos/table.jpg"],
    activeListings: [
      { title: "Bicicleta urbana", price: 120, active: true, category: "Desporto" },
      { title: "Mesa semelhante", price: 180, active: false, category: "Móveis" },
    ],
  });

  assert.equal(suggestion.suggestedPrice, undefined);
  assert.equal("price" in suggestion.drafts[0], false);
  assert.equal("price" in suggestion.drafts[1], false);
});

test("falls back to generic categories when no keyword rule matches", () => {
  const suggestion = createListingSuggestion({
    shortDescription: "Peça artesanal decorativa feita à mão",
    photos: ["/photos/art.jpg"],
  });

  assert.equal(suggestion.categorySuggestions["ebay.es"], "Otros");
  assert.equal(suggestion.categorySuggestions["olx.pt"], "Outros");
});
