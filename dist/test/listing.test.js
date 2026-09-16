"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const strict_1 = __importDefault(require("node:assert/strict"));
const listing_1 = require("../src/listing");
(0, node_test_1.default)("creates localized marketplace drafts and estimates the median price", () => {
    const suggestion = (0, listing_1.createListingSuggestion)({
        shortDescription: "iPhone 13 azul de 128GB con batería al 90%",
        photos: ["/photos/iphone-front.jpg", "/photos/iphone-back.jpg"],
        condition: "used",
        activeListings: [
            { title: "iPhone 13 128GB", price: 410, active: true, category: "Telemóveis" },
            { title: "Apple iPhone 13 azul", price: 430, active: true, category: "Móviles y telefonía" },
            { title: "Laptop usada", price: 700, active: true, category: "Informática" },
        ],
    });
    strict_1.default.equal(suggestion.suggestedPrice, 420);
    strict_1.default.equal(suggestion.categorySuggestions["ebay.es"], "Móviles y telefonía");
    strict_1.default.equal(suggestion.categorySuggestions["olx.pt"], "Telemóveis");
    strict_1.default.equal(suggestion.drafts[0]?.price, 420);
    strict_1.default.match(suggestion.drafts[0]?.description ?? "", /Producto usado/i);
    strict_1.default.match(suggestion.drafts[1]?.description ?? "", /Produto usado/i);
});
(0, node_test_1.default)("does not set a price when no comparable active listing is available", () => {
    const suggestion = (0, listing_1.createListingSuggestion)({
        title: "Mesa vintage",
        shortDescription: "Mesa de madeira maciça restaurada",
        photos: ["/photos/table.jpg"],
        activeListings: [
            { title: "Bicicleta urbana", price: 120, active: true, category: "Desporto" },
            { title: "Mesa semelhante", price: 180, active: false, category: "Móveis" },
        ],
    });
    strict_1.default.equal(suggestion.suggestedPrice, undefined);
    strict_1.default.equal("price" in suggestion.drafts[0], false);
    strict_1.default.equal("price" in suggestion.drafts[1], false);
});
(0, node_test_1.default)("falls back to generic categories when no keyword rule matches", () => {
    const suggestion = (0, listing_1.createListingSuggestion)({
        shortDescription: "Peça artesanal decorativa feita à mão",
        photos: ["/photos/art.jpg"],
    });
    strict_1.default.equal(suggestion.categorySuggestions["ebay.es"], "Otros");
    strict_1.default.equal(suggestion.categorySuggestions["olx.pt"], "Outros");
});
