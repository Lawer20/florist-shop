const products = [
    {
        id: 20,
        title: "Cotton Candy",
        price: 250.00,
        image: "cotton_candy.webp",
        categories: ["birthday"],
        featured: true,
        description: "A dreamlike, voluminous bouquet featuring stunning pink peonies and delicate white blooms. Soft, sweet, and absolutely unforgettable.",
        sizes: [
            { id: 'standard', name: 'Standard', price: 250.00 }
        ]
    },
    {
        id: 19,
        title: "Deep Love",
        price: 95.00,
        image: "deep_love.webp",
        categories: ["anniversary"],
        featured: true,
        description: "A breathtaking arrangement of premium red roses — the ultimate expression of deep, enduring love. Available in three sizes to suit every declaration of the heart.",
        sizes: [
            { id: 'small', name: 'Small (25 roses)', price: 95.00 },
            { id: 'medium', name: 'Medium (50 roses)', price: 190.00 },
            { id: 'large', name: 'Large (100 roses)', price: 350.00 }
        ]
    },
    {
        id: 18,
        title: "White Serenity",
        price: 125.00,
        image: "white_serenity.webp",
        categories: ["birthday"],
        featured: false,
        hidden: true,
        description: "An elegant arrangement of pure white chrysanthemums and delicate filler flowers, perfect for conveying peaceful birthday wishes.",
        sizes: [
            { id: 'small', name: 'Small (10 items)', price: 75.00 },
            { id: 'medium', name: 'Medium (18 items)', price: 125.00 },
            { id: 'large', name: 'Large (26 items)', price: 170.00 }
        ]
    },
    {
        id: 17,
        title: "Unspoken Desire",
        price: 130.00,
        image: "unspoken_desire.webp",
        categories: ["romance"],
        featured: false,
        hidden: true,
        description: "A romantic and striking arrangement of pristine white lisianthus and deep burgundy tulips.",
        sizes: [
            { id: 'small', name: 'Small (14 items)', price: 80.00 },
            { id: 'medium', name: 'Medium (22 items)', price: 130.00 },
            { id: 'large', name: 'Large (30 items)', price: 190.00 }
        ]
    },
    {
        id: 16,
        title: "Cloud Nine",
        price: 140.00,
        image: "cloud_nine.webp",
        categories: ["anniversary"],
        featured: false,
        description: "A beautiful basket arrangement of blue hydrangeas, peach roses, and white blooms.",
        sizes: [
            { id: 'standard', name: 'Standard (18 items)', price: 140.00 }
        ]
    },
    {
        id: 12,
        title: "Soft Couture",
        price: 180.00,
        image: "soft_couture.webp",
        categories: ["sympathy"],
        featured: true,
        description: "An exquisite arrangement featuring soft pink roses and delicate white blooms, offering elegant and soft comfort.",
        sizes: [
            { id: 'medium', name: 'Medium (28 items)', price: 180.00 },
            { id: 'large', name: 'Large (36 items)', price: 230.00 }
        ]
    },
    {
        id: 15,
        title: "Modern Grace",
        price: 160.00,
        image: "modern_grace.webp",
        categories: ["birthday"],
        featured: false,
        description: "An elegant floral composition of white orchids, roses, freesia and eucalyptus — a refined and graceful arrangement for a truly special birthday.",
        sizes: [
            { id: 'standard', name: 'Standard (26 items)', price: 160.00 }
        ]
    },
    {
        id: 13,
        title: "Moonlight Blush",
        price: 140.00,
        image: "moonlight_blush.webp",
        categories: ["sympathy"],
        featured: false,
        description: "A calming composition of white chrysanthemums, cream roses, and delicate red tulip accents, perfectly suited to convey heartfelt sympathy.",
        sizes: [
            { id: 'medium', name: 'Medium (28 items)', price: 140.00 },
            { id: 'large', name: 'Large (36 items)', price: 180.00 }
        ]
    },
    {
        id: 14,
        title: "Morning Breeze",
        price: 80.00,
        image: "morning_breeze.webp",
        categories: ["anniversary"],
        featured: false,
        description: "A refreshing blend of soft peach roses, white chrysanthemums, and bright blue hydrangeas, capturing the essence of a serene morning.",
        sizes: [
            { id: 'small', name: 'Small (20 items)', price: 80.00 },
            { id: 'medium', name: 'Medium (30 items)', price: 160.00 },
            { id: 'large', name: 'Large (38 items)', price: 200.00 }
        ]
    },
    {
        id: 11,
        title: "Crimson Promise",
        price: 80.00,
        image: "crimson_promise.webp",
        categories: ["birthday"],
        featured: true,
        description: "An elegant white bouquet featuring roses and lisianthus, beautifully arranged for special birthdays.",
        sizes: [
            { id: 'small', name: 'Small (12 items)', price: 80.00 },
            { id: 'medium', name: 'Medium (22 items)', price: 150.00 }
        ]
    },
    {
        id: 9,
        title: "Sunny Smile",
        price: 65.00,
        image: "sunny_smile.webp",
        categories: ["birthday"],
        featured: false,
        description: "A cheerful mix of bright sunflowers and crisp white blooms, wrapped in natural kraft paper to bring instant joy.",
        sizes: [
            { id: 'small', name: 'Small (12 items)', price: 65.00 },
            { id: 'medium', name: 'Medium (24 items)', price: 110.00 }
        ]
    },
    {
        id: 8,
        title: "Rose Embrace",
        price: 50.00,
        image: "rose_embrace.webp",
        categories: ["sympathy"],
        featured: true,
        description: "A large, comforting bouquet of deep red roses and lush green foliage, expressing profound love and support.",
        sizes: [
            { id: 'small', name: 'Small (12 items)', price: 70.00 },
            { id: 'medium', name: 'Medium (24 items)', price: 130.00 },
            { id: 'large', name: 'Large (36 items)', price: 170.00 }
        ]
    },
    {
        id: 3,
        title: "Silent Bloom",
        price: 50.00,
        image: "silent_bloom.webp",
        categories: ["anniversary"],
        featured: false,
        description: "Elegant white roses paired with fresh eucalyptus, wrapped in crisp white paper with a teal ribbon.",
        sizes: [
            { id: 'xsmall', name: 'Extra Small (12 items)', price: 50.00 },
            { id: 'small', name: 'Small (28 items)', price: 110.00 },
            { id: 'medium', name: 'Medium (36 items)', price: 145.00 },
            { id: 'large', name: 'Large (50 items)', price: 195.00 },
            { id: 'premium', name: 'Premium (100 items)', price: 395.00 }
        ]
    },
    {
        id: 7,
        title: "Wild Harmony",
        price: 45.00,
        image: "wild_harmony.webp",
        categories: ["sympathy"],
        featured: false,
        description: "A graceful arrangement of red and cream roses accented with fresh greenery, offering a gesture of peace and harmony.",
        sizes: [
            { id: 'small', name: 'Small (12 items)', price: 45.00 },
            { id: 'medium', name: 'Medium (24 items)', price: 90.00 }
        ]
    },
    {
        id: 5,
        title: "Yellow Calm",
        price: 70.00,
        image: "yellow_calm.webp",
        categories: ["birthday"],
        featured: false,
        description: "Vibrant yellow roses arranged with lush greenery and delicate filler flowers, radiating warmth and joy.",
        sizes: [
            { id: 'small', name: 'Small (15 items)', price: 70.00 },
            { id: 'medium', name: 'Medium (24 items)', price: 105.00 }
        ]
    },
    {
        id: 4,
        title: "Pure Passion",
        price: 50.00,
        image: "pure_passion.webp",
        categories: ["romance"],
        featured: false,
        description: "A passionate arrangement of premium red roses and eucalyptus, creating a bold statement of love.",
        sizes: [
            { id: 'xsmall', name: 'Extra Small (12 items)', price: 50.00 },
            { id: 'small', name: 'Small (28 items)', price: 110.00 },
            { id: 'medium', name: 'Medium (36 items)', price: 145.00 },
            { id: 'large', name: 'Large (50 items)', price: 195.00 },
            { id: 'premium', name: 'Premium (100 items)', price: 395.00 }
        ]
    },
    {
        id: 1,
        title: "Velvet Dream",
        price: 45.00,
        image: "bouquet_velvet_v2.jpg",
        categories: ["anniversary"],
        featured: false,
        description: "A vibrant arrangement of Spray Roses, Irises, and Limonium.",
        sizes: [
            { id: 'small', name: 'Small (12 items)', price: 45.00 },
            { id: 'medium', name: 'Medium (24 items)', price: 90.00 },
            { id: 'large', name: 'Large (31 items)', price: 120.00 }
        ]
    },
    {
        id: 2,
        title: "Scarlet",
        price: 80.00,
        image: "scarlet.webp",
        categories: ["romance"],
        featured: false,
        description: "A stunning arrangement of red roses with purple and coral accents, wrapped elegantly in white paper.",
        sizes: [
            { id: 'small', name: 'Small (28 items)', price: 80.00 },
            { id: 'medium', name: 'Medium (36 items)', price: 100.00 },
            { id: 'large', name: 'Large (50 items)', price: 145.00 }
        ]
    },
    {
        id: 6,
        title: "Love Balance",
        price: 50.00,
        image: "love_balance.webp",
        categories: ["romance"],
        featured: false, // Let's feature 4 items
        description: "A harmonious blend of red and white roses with delicate baby's breath, symbolizing unity and love.",
        sizes: [
            { id: 'xsmall', name: 'Extra Small (12 items)', price: 50.00 },
            { id: 'small', name: 'Small (28 items)', price: 110.00 },
            { id: 'medium', name: 'Medium (36 items)', price: 145.00 },
            { id: 'large', name: 'Large (50 items)', price: 195.00 },
            { id: 'premium', name: 'Premium (100 items)', price: 395.00 }
        ]
    },
    // ---- Seasonal Products ----
    {
        id: 102,
        title: "Easter Charm",
        price: 80.00,
        image: "bouquet_spring_mix.webp",
        categories: ["seasonal"],
        seasonal: true,
        seasonTag: "Easter",
        featured: false,
        hidden: true,
        description: "A cheerful spring arrangement of white tulips, yellow ranunculus and fresh greenery — bringing joy and the renewal of Easter season.",
        sizes: [
            { id: 'small', name: 'Small (15 items)', price: 80.00 },
            { id: 'medium', name: 'Medium (28 items)', price: 120.00 }
        ]
    },
    {
        id: 103,
        title: "Tulip Contrast",
        price: 70.00,
        image: "tulip_contrast.webp",
        categories: ["seasonal"],
        seasonal: true,
        seasonTag: "Women's Day",
        featured: false,
        description: "A striking contrast of deep burgundy and pure white tulips, elegantly arranged in a glass vase — a bold yet delicate celebration of spring.",
        sizes: [
            { id: 'small', name: 'Small (15 items)', price: 70.00 },
            { id: 'medium', name: 'Medium (25 items)', price: 135.00 },
            { id: 'large', name: 'Large (35 items)', price: 200.00 }
        ]
    },
    {
        id: 104,
        title: "Noir Tulip",
        price: 65.00,
        image: "noir_tulip.webp",
        categories: ["seasonal"],
        seasonal: true,
        seasonTag: "Women's Day",
        featured: false,
        description: "Pure white tulips wrapped in dramatic black paper — a minimalist, editorial statement bouquet that blends elegance with bold contrast.",
        sizes: [
            { id: 'small', name: 'Small (15 items)', price: 65.00 },
            { id: 'medium', name: 'Medium (25 items)', price: 130.00 },
            { id: 'large', name: 'Large (35 items)', price: 190.00 }
        ]
    },
    {
        id: 105,
        title: "Velvet Tulip",
        price: 65.00,
        image: "velvet_tulip.webp",
        categories: ["seasonal"],
        seasonal: true,
        seasonTag: "Women's Day",
        featured: false,
        description: "Rich burgundy tulips wrapped in soft blush-pink paper — a warm and velvety spring arrangement that radiates romance and sophistication.",
        sizes: [
            { id: 'small', name: 'Small (15 items)', price: 65.00 },
            { id: 'medium', name: 'Medium (25 items)', price: 130.00 },
            { id: 'large', name: 'Large (35 items)', price: 190.00 }
        ]
    },
    {
        id: 106,
        title: "Golden Bloom",
        price: 120.00,
        image: "golden_bloom.webp",
        categories: ["seasonal"],
        seasonal: true,
        seasonTag: "Spring Collection",
        featured: false,
        description: "A radiant and cheerful arrangement of golden blooms, perfect for celebrating the vibrant energy of spring.",
        sizes: [
            { id: 'small', name: 'Small (25 items)', price: 120.00 },
            { id: 'medium', name: 'Medium (50 items)', price: 250.00 },
            { id: 'large', name: 'Large (75 items)', price: 350.00 }
        ]
    },
    {
        id: 107,
        title: "Easter Bunny",
        price: 50.00,
        image: "easter_bunny.webp",
        categories: ["seasonal"],
        seasonal: true,
        seasonTag: "Easter",
        featured: false,
        description: "An adorable dressed Easter Bunny figurine — a charming and playful gift for the Easter season, perfect for children and families.",
        sizes: [
            { id: 'standard', name: 'Standard', price: 50.00 }
        ]
    },

    // ---- Wedding Products ----
    {
        id: 201,
        title: "Classic Boutonnière",
        price: 25.00,
        image: "boutonniere_rose.webp",
        categories: ["wedding"],
        wedding: true,
        featured: false,
        description: "A delicate single white rose with wax flowers and eucalyptus — a timeless and elegant touch for the groom's lapel.",
        sizes: [
            { id: 'standard', name: 'Standard', price: 25.00 }
        ]
    },
    {
        id: 202,
        title: "Deluxe Boutonnière",
        price: 25.00,
        image: "boutonniere_trio.webp",
        categories: ["wedding"],
        wedding: true,
        featured: false,
        description: "Three premium white roses framed with soft eucalyptus — a full, lush boutonnière that makes a refined statement.",
        sizes: [
            { id: 'standard', name: 'Standard', price: 25.00 }
        ]
    },
    {
        id: 203,
        title: "Calla Boutonnière",
        price: 27.00,
        image: "boutonniere_calla.webp",
        categories: ["wedding"],
        wedding: true,
        featured: false,
        description: "A sculptural white calla lily surrounded by wax flowers and rosemary — modern, architectural and unforgettable.",
        sizes: [
            { id: 'standard', name: 'Standard', price: 27.00 }
        ]
    },
    {
        id: 206,
        title: "Orchid Boutonnière",
        price: 25.00,
        image: "boutonniere_orchid.webp",
        categories: ["wedding"],
        wedding: true,
        featured: false,
        description: "A graceful white phalaenopsis orchid complemented by delicate wax flowers and rosemary sprigs — an elegant, modern boutonnière with a soft romantic touch.",
        sizes: [
            { id: 'standard', name: 'Standard', price: 25.00 }
        ]
    },
    {
        id: 204,
        title: "Wrist Corsage",
        price: 30.00,
        image: "corsage_rose.webp",
        categories: ["wedding"],
        wedding: true,
        featured: false,
        description: "A romantic wrist corsage of ivory spray roses and delicate wax flowers — perfect for bridesmaids and distinguished guests.",
        sizes: [
            { id: 'standard', name: 'Standard', price: 30.00 }
        ]
    },
    {
        id: 209,
        title: "Pure Calla",
        price: 130.00,
        image: "bouquet_calla.webp",
        categories: ["wedding"],
        wedding: true,
        featured: false,
        description: "A clean, minimalist hand-tied bouquet of white calla lilies only — bold, sculptural and effortlessly chic.",
        sizes: [
            { id: 'standard', name: 'Standard', price: 130.00 }
        ]
    },
    {
        id: 210,
        title: "Calla & Freesia",
        price: 140.00,
        image: "bridal_bouquet_calla.webp",
        categories: ["wedding"],
        wedding: true,
        featured: false,
        description: "White calla lilies paired with yellow freesia buds, delicate wax flowers and eucalyptus — a fresh, luminous bridal bouquet full of grace and natural beauty.",
        sizes: [
            { id: 'standard', name: 'Standard', price: 140.00 }
        ]
    },
    {
        id: 208,
        title: "Orchid Cascade",
        price: 150.00,
        image: "bridal_bouquet_calla_orchid.webp",
        categories: ["wedding"],
        wedding: true,
        featured: false,
        description: "A cascading bridal bouquet of white calla lilies entwined with phalaenopsis orchids and trailing eucalyptus — dramatic, modern, and breathtaking.",
        sizes: [
            { id: 'standard', name: 'Standard', price: 150.00 }
        ]
    },
    {
        id: 207,
        title: "Golden Glow Calla",
        price: 160.00,
        image: "bridal_bouquet_calla_rose.webp",
        categories: ["wedding"],
        wedding: true,
        featured: false,
        description: "White calla lilies mixed with golden freesia buds and delicate wax flowers — a sunny, radiant bridal bouquet full of warmth and elegance.",
        sizes: [
            { id: 'standard', name: 'Standard', price: 160.00 }
        ]
    }
];

// ---- Seasonal Collection Config ----
// Set active: false to hide the seasonal section completely
const seasonalCollection = {
    active: false,
    theme: 'spring',
    badge: 'Limited Season — Spring 2026',
    title: 'Spring Collection',
    subtitle: "Handcrafted arrangements for Women's Day & Easter",
    items: products.filter(p => p.seasonal)
};

// ---- Wedding Collection Config ----
const weddingCollection = {
    active: true,
    items: products.filter(p => p.wedding)
};

const addOns = [
    { id: 'bear', name: 'Premium Teddy Bear', price: 25.00, image: 'addon_teddy_bear.webp' },
    { id: 'chocolates', name: 'Belgian Truffles', price: 18.00, image: 'addon_chocolates.webp' },
    { id: 'vase', name: 'Crystal Vase', price: 30.00, image: 'addon_glass_vase.webp' },
    { id: 'candle', name: 'Luxury Scented Candle', price: 22.00, image: 'addon_scented_candle.webp' }
];
