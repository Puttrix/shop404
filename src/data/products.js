export const products = [
  { id: 'p-1', name: 'Aurora Hoodie', category: 'Apparel', price: 59.0, image: '/images/product-1.svg' },
  { id: 'p-2', name: 'Nebula Sneakers', category: 'Footwear', price: 89.0, image: '/images/product-2.svg' },
  { id: 'p-3', name: 'Cosmic Backpack', category: 'Accessories', price: 74.0, image: '/images/product-3.svg' },
  { id: 'p-4', name: 'Stellar Bottle', category: 'Lifestyle', price: 24.0, image: '/images/product-4.svg' },
  { id: 'p-5', name: 'Orbit Headphones', category: 'Electronics', price: 129.0, image: '/images/product-5.svg' },
  { id: 'p-6', name: 'Nova Cowboy Boots', category: 'Footwear', price: 149.0, image: '/images/product-6.svg' }
];

export function getProduct(id) { return products.find(p => p.id === id); }
