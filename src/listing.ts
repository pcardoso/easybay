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

interface CategoryRule {
  keywords: string[];
  labels: Record<Marketplace, string>;
}

const CATEGORY_RULES: CategoryRule[] = [
  {
    keywords: ["iphone", "android", "smartphone", "phone", "mobile", "telemovel"],
    labels: {
      "ebay.es": "Móviles y telefonía",
      "olx.pt": "Telemóveis",
    },
  },
  {
    keywords: ["laptop", "notebook", "macbook", "pc", "computer", "portatil"],
    labels: {
      "ebay.es": "Informática",
      "olx.pt": "Computadores - Portáteis",
    },
  },
  {
    keywords: ["playstation", "xbox", "nintendo", "console", "gaming", "game"],
    labels: {
      "ebay.es": "Consolas y videojuegos",
      "olx.pt": "Consolas - Videojogos",
    },
  },
  {
    keywords: ["sofa", "chair", "table", "desk", "wardrobe", "furniture"],
    labels: {
      "ebay.es": "Hogar y jardín",
      "olx.pt": "Móveis",
    },
  },
  {
    keywords: ["fridge", "washing", "microwave", "vacuum", "appliance"],
    labels: {
      "ebay.es": "Electrodomésticos",
      "olx.pt": "Eletrodomésticos",
    },
  },
  {
    keywords: ["dress", "jacket", "shoes", "bag", "fashion"],
    labels: {
      "ebay.es": "Moda",
      "olx.pt": "Moda",
    },
  },
  {
    keywords: ["bike", "bicycle", "treadmill", "fitness", "sports"],
    labels: {
      "ebay.es": "Deportes y ocio",
      "olx.pt": "Desporto",
    },
  },
  {
    keywords: ["car", "motorcycle", "moto", "scooter"],
    labels: {
      "ebay.es": "Motor",
      "olx.pt": "Carros, motos e barcos",
    },
  },
];

const DEFAULT_CATEGORIES: Record<Marketplace, string> = {
  "ebay.es": "Otros",
  "olx.pt": "Outros",
};

const DEFAULT_PLATFORMS: Marketplace[] = ["ebay.es", "olx.pt"];

export function createListingSuggestion(input: ListingInput): ListingSuggestion {
  const platforms = input.requestedPlatforms?.length
    ? input.requestedPlatforms
    : DEFAULT_PLATFORMS;
  const title = buildTitle(input);
  const allCategorySuggestions = getCategorySuggestions(title, input.shortDescription);
  const categorySuggestions = Object.fromEntries(
    platforms.map((platform) => [platform, allCategorySuggestions[platform]]),
  ) as Partial<Record<Marketplace, string>>;
  const suggestedPrice = estimatePrice(title, input.shortDescription, input.activeListings);

  const drafts = platforms.map((platform) => ({
    platform,
    title,
    description: buildDescription(platform, input, title, categorySuggestions[platform] ?? DEFAULT_CATEGORIES[platform]),
    category: categorySuggestions[platform] ?? DEFAULT_CATEGORIES[platform],
    photos: [...input.photos],
    currency: "EUR" as const,
    ...(suggestedPrice === undefined ? {} : { price: suggestedPrice }),
  }));

  return {
    title,
    ...(suggestedPrice === undefined ? {} : { suggestedPrice }),
    categorySuggestions,
    drafts,
  };
}

function buildTitle(input: ListingInput): string {
  if (input.title?.trim()) {
    return input.title.trim();
  }

  const baseParts = [input.brand, input.shortDescription]
    .filter((value): value is string => Boolean(value?.trim()))
    .map((value) => value.trim());
  const rawTitle = baseParts.join(" - ").slice(0, 80);

  return rawTitle || "Listing draft";
}

function buildDescription(
  platform: Marketplace,
  input: ListingInput,
  title: string,
  category: string,
): string {
  const conditionByPlatform: Record<Marketplace, Record<NonNullable<ListingInput["condition"]>, string>> = {
    "ebay.es": {
      new: "nuevo",
      used: "usado",
      refurbished: "reacondicionado",
    },
    "olx.pt": {
      new: "novo",
      used: "usado",
      refurbished: "recondicionado",
    },
  };

  const condition = input.condition
    ? conditionByPlatform[platform][input.condition]
    : platform === "ebay.es"
      ? "en buen estado"
      : "em bom estado";
  const photoSentence =
    platform === "ebay.es"
      ? `Incluye ${input.photos.length} foto${input.photos.length === 1 ? "" : "s"} para revisar el estado.`
      : `Inclui ${input.photos.length} foto${input.photos.length === 1 ? "" : "s"} para confirmar o estado.`;
  const summary =
    normalizeText(title) === normalizeText(input.shortDescription)
      ? title
      : `${title}. ${input.shortDescription.trim()}`;

  if (platform === "ebay.es") {
    return `${summary}. Producto ${condition}, listo para publicar en la categoría ${category}. ${photoSentence}`;
  }

  return `${summary}. Produto ${condition}, pronto para publicar na categoria ${category}. ${photoSentence}`;
}

function getCategorySuggestions(title: string, shortDescription: string): Record<Marketplace, string> {
  const tokens = new Set(tokenize(`${title} ${shortDescription}`));
  const matchedRule = CATEGORY_RULES.find((rule) =>
    rule.keywords.some((keyword) => tokens.has(normalizeText(keyword))),
  );

  return matchedRule ? { ...matchedRule.labels } : { ...DEFAULT_CATEGORIES };
}

function estimatePrice(
  title: string,
  shortDescription: string,
  activeListings: ActiveListing[] | undefined,
): number | undefined {
  if (!activeListings?.length) {
    return undefined;
  }

  const keywords = new Set(tokenize(`${title} ${shortDescription}`).filter((keyword) => keyword.length > 2));
  const comparablePrices = activeListings
    .filter((listing) => listing.active !== false && Number.isFinite(listing.price) && listing.price > 0)
    .filter((listing) => {
      const listingTokens = new Set(tokenize(`${listing.title ?? ""} ${listing.category ?? ""}`));
      const sharedKeyword = [...keywords].some((keyword) => listingTokens.has(keyword));

      return sharedKeyword;
    })
    .map((listing) => listing.price)
    .sort((left, right) => left - right);

  if (comparablePrices.length === 0) {
    return undefined;
  }

  const middle = Math.floor(comparablePrices.length / 2);
  const median =
    comparablePrices.length % 2 === 0
      ? (comparablePrices[middle - 1] + comparablePrices[middle]) / 2
      : comparablePrices[middle];

  return Number(median.toFixed(2));
}

function tokenize(value: string): string[] {
  return normalizeText(value)
    .split(" ")
    .map((token) => token.trim())
    .filter(Boolean);
}

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
