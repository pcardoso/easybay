export type Marketplace = "ebay.es" | "olx.pt";
export interface ActiveListing {
    title?: string;
    price: number;
    active?: boolean;
    category?: string;
}
export interface ListingInput {
    title?: string;
    shortDescription: string;
    photos: string[];
    brand?: string;
    condition?: "new" | "used" | "refurbished";
    activeListings?: ActiveListing[];
    requestedPlatforms?: Marketplace[];
}
export interface ListingDraft {
    platform: Marketplace;
    title: string;
    description: string;
    category: string;
    photos: string[];
    currency: "EUR";
    price?: number;
}
export interface ListingSuggestion {
    title: string;
    suggestedPrice?: number;
    categorySuggestions: Partial<Record<Marketplace, string>>;
    drafts: ListingDraft[];
}
export declare function createListingSuggestion(input: ListingInput): ListingSuggestion;
