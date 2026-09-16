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
(0, node_test_1.default)("estimates a price when only the category matches", () => {
    const suggestion = (0, listing_1.createListingSuggestion)({
        title: "Wood table vintage",
        shortDescription: "Solid oak dining piece",
        photos: ["/photos/table.jpg"],
        requestedPlatforms: ["olx.pt"],
        activeListings: [
            { title: "Oferta imperdível", price: 210, active: true, category: "Móveis" },
            { title: "Outra oferta", price: 260, active: true, category: "Móveis" },
        ],
    });
    strict_1.default.deepEqual(Object.keys(suggestion.categorySuggestions), ["olx.pt"]);
    strict_1.default.equal(suggestion.suggestedPrice, 235);
    strict_1.default.equal(suggestion.drafts.length, 1);
    strict_1.default.equal(suggestion.drafts[0]?.category, "Móveis");
});
(0, node_test_1.default)("estimates a price when only shared keywords match", () => {
    const suggestion = (0, listing_1.createListingSuggestion)({
        shortDescription: "Canon mirrorless body with spare battery",
        photos: ["/photos/canon.jpg"],
        requestedPlatforms: ["ebay.es"],
        activeListings: [
            { title: "Canon EOS usada", price: 520, active: true, category: "Fotografía" },
            { title: "Canon mirrorless kit", price: 560, active: true, category: "Cámaras" },
            { title: "Oferta sem relação", price: 999, active: true, category: "Móveis" },
        ],
    });
    strict_1.default.deepEqual(Object.keys(suggestion.categorySuggestions), ["ebay.es"]);
    strict_1.default.equal(suggestion.suggestedPrice, 540);
    strict_1.default.equal(suggestion.drafts.length, 1);
    strict_1.default.equal(suggestion.drafts[0]?.category, "Otros");
});
(0, node_test_1.default)("falls back to both marketplaces when requestedPlatforms is empty", () => {
    const suggestion = (0, listing_1.createListingSuggestion)({
        shortDescription: "Nintendo Switch com dois jogos",
        photos: ["/photos/switch.jpg"],
        requestedPlatforms: [],
    });
    strict_1.default.deepEqual(Object.keys(suggestion.categorySuggestions).sort(), ["ebay.es", "olx.pt"]);
    strict_1.default.equal(suggestion.drafts.length, 2);
});
