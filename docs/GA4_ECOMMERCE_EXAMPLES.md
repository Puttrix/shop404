# GA4 Ecommerce — Item Schema Examples Per Event

This guide shows practical GA4 ecommerce payloads for each app event, with minimal and recommended item fields. Use these as references when configuring GA4 Event Tags in GTM.

## Conventions
- Currency: `USD` (adjust to your property)
- Minimal item fields: `item_id`, `item_name`, `price`, optional `quantity`
- Recommended extras: `item_brand`, `item_category`, `item_variant`, `index`, `item_list_name`, `item_list_id`

## view_item_list

Minimal
```
{
  event: 'view_item_list',
  ecommerce: {
    items: [
      { item_id: 'p-1', item_name: 'Aurora Hoodie', item_category: 'Apparel', price: 59.0 },
      { item_id: 'p-2', item_name: 'Nimbus Tee', item_category: 'Apparel', price: 24.0 }
    ]
  }
}
```

Recommended
```
{
  event: 'view_item_list',
  ecommerce: {
    item_list_id: 'home_grid',
    item_list_name: 'Home Featured',
    items: [
      { item_id: 'p-1', item_name: 'Aurora Hoodie', item_category: 'Apparel', item_brand: 'MockShop', price: 59.0, index: 1 },
      { item_id: 'p-2', item_name: 'Nimbus Tee', item_category: 'Apparel', item_brand: 'MockShop', price: 24.0, index: 2 }
    ]
  }
}
```

## view_item

Minimal
```
{
  event: 'view_item',
  ecommerce: {
    items: [ { item_id: 'p-1', item_name: 'Aurora Hoodie', price: 59.0 } ]
  }
}
```

Recommended
```
{
  event: 'view_item',
  ecommerce: {
    items: [ {
      item_id: 'p-1',
      item_name: 'Aurora Hoodie',
      item_category: 'Apparel',
      item_brand: 'MockShop',
      item_variant: 'Green / M',
      price: 59.0
    } ]
  }
}
```

## add_to_cart

Minimal
```
{
  event: 'add_to_cart',
  ecommerce: {
    items: [ { item_id: 'p-1', item_name: 'Aurora Hoodie', price: 59.0, quantity: 1 } ]
  }
}
```

Recommended
```
{
  event: 'add_to_cart',
  ecommerce: {
    currency: 'USD',
    items: [ {
      item_id: 'p-1', item_name: 'Aurora Hoodie', item_category: 'Apparel', item_brand: 'MockShop', item_variant: 'Green / M',
      price: 59.0, quantity: 2
    } ]
  }
}
```

## begin_checkout

Minimal
```
{
  event: 'begin_checkout',
  ecommerce: {
    items: [
      { item_id: 'p-1', item_name: 'Aurora Hoodie', price: 59.0, quantity: 1 },
      { item_id: 'p-2', item_name: 'Nimbus Tee', price: 24.0, quantity: 2 }
    ]
  }
}
```

Recommended
```
{
  event: 'begin_checkout',
  ecommerce: {
    currency: 'USD',
    coupon: 'SUMMER10',
    items: [
      { item_id: 'p-1', item_name: 'Aurora Hoodie', item_category: 'Apparel', item_brand: 'MockShop', price: 59.0, quantity: 1 },
      { item_id: 'p-2', item_name: 'Nimbus Tee', item_category: 'Apparel', item_brand: 'MockShop', price: 24.0, quantity: 2 }
    ]
  }
}
```

## purchase

Minimal
```
{
  event: 'purchase',
  ecommerce: {
    transaction_id: 'ord_12345',
    value: 118.0,
    currency: 'USD',
    items: [ { item_id: 'p-1', item_name: 'Aurora Hoodie', price: 59.0, quantity: 2 } ]
  }
}
```

Recommended
```
{
  event: 'purchase',
  ecommerce: {
    transaction_id: 'ord_12345',
    affiliation: 'Online Store',
    value: 121.8,
    tax: 9.8,
    shipping: 5.0,
    currency: 'USD',
    coupon: 'SUMMER10',
    items: [
      { item_id: 'p-1', item_name: 'Aurora Hoodie', item_category: 'Apparel', item_brand: 'MockShop', price: 59.0, quantity: 2, discount: 10.0 }
    ]
  }
}
```

## Notes
- The app currently pushes the minimal required payloads; you can enrich with optional fields when available.
- In GTM, create GA4 Event Tags for each event and pass the `items` array from the `ecommerce` object. Use Data Layer Variables for `transaction_id`, `value`, `currency`, etc.
- Keep item field names exactly as GA4 expects (e.g., `item_id`, not `id`).

