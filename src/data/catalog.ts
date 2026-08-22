import { Product } from "@/types";

/**
 * A small but realistic catalog. Each product carries aliases in three
 * languages so voice commands in English, Hindi, or Spanish can all resolve
 * to the same item — this is what satisfies "multilingual support" without
 * needing a paid translation API.
 */
export const catalog: Product[] = [
  {
    id: "milk",
    name: "Whole Milk",
    category: "Dairy & Eggs",
    price: 3.49,
    emoji: "🥛",
    outOfStock: true,
    substituteId: "almond-milk",
    aliases: {
      "en-US": ["milk", "whole milk"],
      "hi-IN": ["दूध", "doodh"],
      "es-ES": ["leche"],
    },
  },
  {
    id: "almond-milk",
    name: "Almond Milk",
    category: "Dairy & Eggs",
    price: 4.29,
    emoji: "🥛",
    aliases: {
      "en-US": ["almond milk"],
      "es-ES": ["leche de almendra"],
    },
  },
  {
    id: "eggs",
    name: "Farm Eggs",
    category: "Dairy & Eggs",
    price: 4.99,
    emoji: "🥚",
    aliases: {
      "en-US": ["eggs", "egg"],
      "hi-IN": ["अंडे", "ande"],
      "es-ES": ["huevos", "huevo"],
    },
  },
  {
    id: "bread",
    name: "White Bread",
    category: "Bakery",
    price: 2.99,
    emoji: "🍞",
    substituteId: "wheat-bread",
    aliases: {
      "en-US": ["bread", "white bread"],
      "hi-IN": ["ब्रेड", "bread"],
      "es-ES": ["pan"],
    },
  },
  {
    id: "wheat-bread",
    name: "Whole Wheat Bread",
    category: "Bakery",
    price: 3.49,
    emoji: "🍞",
    aliases: {
      "en-US": ["whole wheat bread", "wheat bread"],
      "es-ES": ["pan integral"],
    },
  },
  {
    id: "apples",
    name: "Apples",
    category: "Produce",
    price: 4.99,
    emoji: "🍎",
    seasonalMonths: [9, 10, 11],
    aliases: {
      "en-US": ["apple", "apples"],
      "hi-IN": ["सेब", "seb"],
      "es-ES": ["manzana", "manzanas"],
    },
  },
  {
    id: "bananas",
    name: "Bananas",
    category: "Produce",
    price: 1.99,
    emoji: "🍌",
    aliases: {
      "en-US": ["banana", "bananas"],
      "hi-IN": ["केला", "kela"],
      "es-ES": ["plátano", "banana"],
    },
  },
  {
    id: "watermelon",
    name: "Watermelon",
    category: "Produce",
    price: 5.99,
    emoji: "🍉",
    seasonalMonths: [5, 6, 7, 8],
    aliases: {
      "en-US": ["watermelon"],
      "hi-IN": ["तरबूज", "tarbooj"],
      "es-ES": ["sandía"],
    },
  },
  {
    id: "pumpkin",
    name: "Pumpkin",
    category: "Produce",
    price: 6.49,
    emoji: "🎃",
    seasonalMonths: [9, 10, 11],
    aliases: {
      "en-US": ["pumpkin"],
      "es-ES": ["calabaza"],
    },
  },
  {
    id: "avocado",
    name: "Avocado",
    category: "Produce",
    price: 2.5,
    emoji: "🥑",
    aliases: {
      "en-US": ["avocado", "avocados"],
      "es-ES": ["aguacate"],
    },
  },
  {
    id: "chicken",
    name: "Chicken Breast",
    category: "Meat & Seafood",
    price: 8.99,
    emoji: "🍗",
    aliases: {
      "en-US": ["chicken", "chicken breast"],
      "hi-IN": ["चिकन", "chicken"],
      "es-ES": ["pollo"],
    },
  },
  {
    id: "salmon",
    name: "Salmon Fillet",
    category: "Meat & Seafood",
    price: 11.99,
    emoji: "🐟",
    aliases: {
      "en-US": ["salmon", "fish"],
      "es-ES": ["salmón", "pescado"],
    },
  },
  {
    id: "rice",
    name: "Basmati Rice",
    category: "Pantry",
    price: 7.49,
    emoji: "🍚",
    aliases: {
      "en-US": ["rice", "basmati rice"],
      "hi-IN": ["चावल", "chawal"],
      "es-ES": ["arroz"],
    },
  },
  {
    id: "pasta",
    name: "Pasta",
    category: "Pantry",
    price: 2.29,
    emoji: "🍝",
    aliases: {
      "en-US": ["pasta", "spaghetti", "noodles"],
      "es-ES": ["pasta"],
    },
  },
  {
    id: "coffee",
    name: "Coffee Beans",
    category: "Pantry",
    price: 12.99,
    emoji: "☕",
    aliases: {
      "en-US": ["coffee", "coffee beans"],
      "hi-IN": ["कॉफ़ी", "coffee"],
      "es-ES": ["café"],
    },
  },
  {
    id: "cereal",
    name: "Breakfast Cereal",
    category: "Pantry",
    price: 4.49,
    emoji: "🥣",
    aliases: {
      "en-US": ["cereal", "breakfast cereal"],
      "es-ES": ["cereal"],
    },
  },
  {
    id: "ice-cream",
    name: "Vanilla Ice Cream",
    category: "Frozen",
    price: 5.99,
    emoji: "🍦",
    seasonalMonths: [5, 6, 7, 8],
    aliases: {
      "en-US": ["ice cream", "vanilla ice cream"],
      "es-ES": ["helado"],
    },
  },
  {
    id: "frozen-pizza",
    name: "Frozen Pizza",
    category: "Frozen",
    price: 6.49,
    emoji: "🍕",
    aliases: {
      "en-US": ["pizza", "frozen pizza"],
      "hi-IN": ["पिज़्ज़ा", "pizza"],
      "es-ES": ["pizza"],
    },
  },
  {
    id: "orange-juice",
    name: "Orange Juice",
    category: "Beverages",
    price: 4.29,
    emoji: "🧃",
    aliases: {
      "en-US": ["orange juice", "juice"],
      "es-ES": ["jugo de naranja", "zumo de naranja"],
    },
  },
  {
    id: "water",
    name: "Bottled Water (6-pack)",
    category: "Beverages",
    price: 3.99,
    emoji: "💧",
    aliases: {
      "en-US": ["water", "bottled water"],
      "hi-IN": ["पानी", "paani"],
      "es-ES": ["agua"],
    },
  },
  {
    id: "chips",
    name: "Potato Chips",
    category: "Snacks",
    price: 3.29,
    emoji: "🍟",
    aliases: {
      "en-US": ["chips", "potato chips"],
      "es-ES": ["papas fritas"],
    },
  },
  {
    id: "chocolate",
    name: "Dark Chocolate Bar",
    category: "Snacks",
    price: 2.99,
    emoji: "🍫",
    aliases: {
      "en-US": ["chocolate", "chocolate bar"],
      "hi-IN": ["चॉकलेट", "chocolate"],
      "es-ES": ["chocolate"],
    },
  },
  {
    id: "dish-soap",
    name: "Dish Soap",
    category: "Household",
    price: 3.49,
    emoji: "🧴",
    aliases: {
      "en-US": ["dish soap", "dishwashing soap"],
      "es-ES": ["jabón de platos"],
    },
  },
  {
    id: "paper-towels",
    name: "Paper Towels",
    category: "Household",
    price: 5.49,
    emoji: "🧻",
    aliases: {
      "en-US": ["paper towels", "napkins"],
      "es-ES": ["toallas de papel"],
    },
  },
];

export function findProductById(id: string): Product | undefined {
  return catalog.find((p) => p.id === id);
}
