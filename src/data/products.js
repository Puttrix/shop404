export const products = [
  { id: 'p-1', name: 'Aurora Hoodie', category: 'Apparel', price: 59.0, image: 'https://images.unsplash.com/photo-1544441893-675973e319cf?q=80&w=1200&auto=format&fit=crop' },
  { id: 'p-2', name: 'Nebula Sneakers', category: 'Footwear', price: 89.0, image: 'https://images.unsplash.com/photo-1543508282-6319a3e2621f?q=80&w=1200&auto=format&fit=crop' },
  { id: 'p-3', name: 'Cosmic Backpack', category: 'Accessories', price: 74.0, image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?q=80&w=1200&auto=format&fit=crop' },
  { id: 'p-4', name: 'Stellar Bottle', category: 'Lifestyle', price: 24.0, image: 'https://images.unsplash.com/photo-1516408388733-2f8364f2e00b?q=80&w=1200&auto=format&fit=crop' },
  { id: 'p-5', name: 'Orbit Headphones', category: 'Electronics', price: 129.0, image: 'https://images.unsplash.com/photo-1518449073231-23d28a80bce3?q=80&w=1200&auto=format&fit=crop' }
];

export function getProduct(id) { return products.find(p => p.id === id); }

