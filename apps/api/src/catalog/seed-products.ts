export const seedProducts = [
  {
    slug: 'woven-cotton-kurta',
    name: 'Woven Cotton Kurta',
    category: 'ethnic-wear',
    description: 'Breathable everyday kurta with clean tailoring and marketplace-ready sizing.',
    imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=80',
    basePrice: 1299,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Indigo', 'Ivory', 'Sage'],
    channels: [
      { name: 'Amazon', url: 'https://amazon.in', price: 1299, stockStatus: 'In stock' },
      { name: 'Flipkart', url: 'https://flipkart.com', price: 1249, stockStatus: 'In stock' },
      { name: 'Myntra', url: 'https://myntra.com', price: 1399, stockStatus: 'Limited' }
    ]
  },
  {
    slug: 'linen-co-ord-set',
    name: 'Linen Co-ord Set',
    category: 'western-wear',
    description: 'Soft linen-blend set designed for city errands, casual office days, and travel.',
    imageUrl: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=1200&q=80',
    basePrice: 2199,
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Sand', 'Black', 'Rust'],
    channels: [
      { name: 'Myntra', url: 'https://myntra.com', price: 2199, stockStatus: 'In stock' },
      { name: 'Ajio', url: 'https://ajio.com', price: 2099, stockStatus: 'In stock' }
    ]
  },
  {
    slug: 'quick-commerce-tee-pack',
    name: 'Essential Tee Pack',
    category: 'basics',
    description: 'Three-pack cotton tees optimized for quick-commerce replenishment and bundles.',
    imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80',
    basePrice: 899,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['White', 'Charcoal', 'Navy'],
    channels: [
      { name: 'Blinkit', url: 'https://blinkit.com', price: 899, stockStatus: 'In stock' },
      { name: 'Zepto', url: 'https://zeptonow.com', price: 929, stockStatus: 'In stock' },
      { name: 'Swiggy Instamart', url: 'https://www.swiggy.com/instamart', price: 949, stockStatus: 'Limited' }
    ]
  }
];
