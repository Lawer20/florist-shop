const products = [
    {
        id: 1,
        title: "Velvet Dream",
        price: 45.00,
        image: "bouquet_velvet_v2.jpg",
        categories: ["anniversary", "romance"],
        featured: true,
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
        image: "scarlet.png",
        categories: ["birthday", "romance", "anniversary"],
        featured: true,
        description: "A stunning arrangement of red roses with purple and coral accents, wrapped elegantly in white paper.",
        sizes: [
            { id: 'small', name: 'Small (28 items)', price: 80.00 },
            { id: 'medium', name: 'Medium (36 items)', price: 100.00 },
            { id: 'large', name: 'Large (50 items)', price: 145.00 }
        ]
    },
    {
        id: 3,
        title: "Silent Bloom",
        price: 50.00,
        image: "silent_bloom.png",
        categories: ["romance", "sympathy", "anniversary"],
        featured: true,
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
        id: 4,
        title: "Pure Passion",
        price: 50.00,
        image: "pure_passion.png",
        categories: ["romance", "anniversary", "featured"],
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
        id: 5,
        title: "Yellow Calm",
        price: 70.00,
        image: "yellow_calm.png",
        categories: ["birthday", "friendship", "get-well"],
        featured: false,
        description: "Vibrant yellow roses arranged with lush greenery and delicate filler flowers, radiating warmth and joy.",
        sizes: [
            { id: 'small', name: 'Small (15 items)', price: 70.00 },
            { id: 'medium', name: 'Medium (24 items)', price: 105.00 }
        ]
    },
    {
        id: 6,
        title: "Love Balance",
        price: 50.00,
        image: "love_balance.png",
        categories: ["romance", "anniversary", "mother-day"],
        featured: true, // Let's feature 4 items
        description: "A harmonious blend of red and white roses with delicate baby's breath, symbolizing unity and love.",
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
        image: "wild_harmony.png",
        categories: ["sympathy", "condolence"],
        featured: true,
        description: "A graceful arrangement of red and cream roses accented with fresh greenery, offering a gesture of peace and harmony.",
        sizes: [
            { id: 'small', name: 'Small (12 items)', price: 45.00 },
            { id: 'medium', name: 'Medium (24 items)', price: 90.00 }
        ]
    },
    {
        id: 8,
        title: "Rose Embrace",
        price: 50.00,
        image: "rose_embrace.png",
        categories: ["sympathy", "condolence"],
        featured: true,
        description: "A large, comforting bouquet of deep red roses and lush green foliage, expressing profound love and support.",
        sizes: [
            { id: 'small', name: 'Small (12 items)', price: 50.00 },
            { id: 'medium', name: 'Medium (24 items)', price: 95.00 },
            { id: 'large', name: 'Large (36 items)', price: 150.00 }
        ]
    },
    {
        id: 9,
        title: "Sunny Smile",
        price: 65.00,
        image: "sunny_smile.png",
        categories: ["mother-day", "birthday", "get-well"],
        featured: false,
        description: "A cheerful mix of bright sunflowers and crisp white blooms, wrapped in natural kraft paper to bring instant joy.",
        sizes: [
            { id: 'small', name: 'Small (12 items)', price: 65.00 },
            { id: 'medium', name: 'Medium (24 items)', price: 110.00 }
        ]
    }
];

const addOns = [
    { id: 'bear', name: 'Premium Teddy Bear', price: 25.00, image: 'addon_teddy_bear.png' },
    { id: 'chocolates', name: 'Belgian Truffles', price: 18.00, image: 'addon_chocolates.png' },
    { id: 'vase', name: 'Crystal Vase', price: 30.00, image: 'addon_glass_vase.png' },
    { id: 'candle', name: 'Luxury Scented Candle', price: 22.00, image: 'addon_scented_candle.png' }
];
