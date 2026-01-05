const products = [
    {
        id: 1,
        title: "Royal Jubilee",
        price: 120.00,
        image: "bouquet_elegant_roses.png",
        categories: ["anniversary", "romance"],
        featured: true,
        description: "A majestic arrangement of 50 premium red roses, symbolizing deep, enduring love."
    },
    {
        id: 2,
        title: "Spring Radiance",
        price: 85.00,
        image: "bouquet_spring_mix.png",
        categories: ["birthday", "get-well"],
        featured: true,
        description: "A vibrant mix of seasonal tulips, peonies, and wildflowers to brighten any day."
    },
    {
        id: 3,
        title: "Velvet Dream",
        price: 95.00,
        image: "bouquet_velvet_dream_1767146999117.png",
        categories: ["romance", "valentines"],
        featured: true,
        description: "Soft pink and cream roses wrapped in luxurious velvet paper."
    },
    {
        id: 4,
        title: "Pure Elegance",
        price: 75.00,
        image: "bouquet_pure_elegance_1767147012184.png",
        categories: ["sympathy", "anniversary"],
        featured: false,
        description: "Classic white roses and lilies, perfect for expressing sincere sentiments."
    },
    {
        id: 5,
        title: "Wildflower Whisper",
        price: 60.00,
        image: "bouquet_spring_mix.png", // TODO: Replace with unique wildflower image
        categories: ["birthday", "just-because"],
        featured: false,
        description: "A rustic, hand-tied bunch of field flowers for a natural look."
    },
    {
        id: 6,
        title: "Golden Hour",
        price: 110.00,
        image: "bouquet_spring_mix.png", // TODO: Replace with unique golden/sunset bouquet image
        categories: ["mother-day", "thank-you"],
        featured: true, // Let's feature 4 items
        description: "Warm yellow and orange blooms capturing the glow of sunset."
    }
];

const addOns = [
    { id: 'bear', name: 'Premium Teddy Bear', price: 25.00, image: 'addon_teddy_bear.png' },
    { id: 'chocolates', name: 'Belgian Truffles', price: 18.00, image: 'addon_chocolates.png' },
    { id: 'vase', name: 'Crystal Vase', price: 30.00, image: 'addon_glass_vase.png' },
    { id: 'candle', name: 'Luxury Scented Candle', price: 22.00, image: 'addon_scented_candle.png' }
];
