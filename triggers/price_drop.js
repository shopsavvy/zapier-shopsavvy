'use strict'

const { apiGet } = require('../lib/api-client')

/**
 * Polling trigger: fires when a product's price drops below a user-defined threshold.
 *
 * Calls GET /v1/products/offers with the given identifier, then filters results
 * where the offer price is at or below the threshold. Each qualifying offer gets
 * a dedup ID of `{offer_id}_{price}_{timestamp}` so the same price point is only
 * triggered once.
 */
const perform = async (z, bundle) => {
  const params = { ids: bundle.inputData.identifier }

  if (bundle.inputData.retailer) {
    params.retailer = bundle.inputData.retailer
  }

  const result = await apiGet(z, bundle, '/products/offers', params)

  if (!result || !result.success || !result.data || result.data.length === 0) {
    return []
  }

  const threshold = parseFloat(bundle.inputData.threshold_price)
  const items = []

  for (const product of result.data) {
    const offers = product.offers || []

    for (const offer of offers) {
      const price = parseFloat(offer.price)

      if (isNaN(price) || price > threshold) {
        continue
      }

      const savings = threshold - price
      const timestamp = offer.timestamp || new Date().toISOString()

      items.push({
        id: `${offer.id}_${price}_${timestamp}`,
        product_title: product.title,
        product_barcode: product.barcode || '',
        product_brand: product.brand || '',
        offer_price: price,
        offer_currency: offer.currency || 'USD',
        retailer: offer.retailer,
        offer_url: offer.URL,
        offer_availability: offer.availability || 'unknown',
        offer_condition: offer.condition || 'new',
        threshold_price: threshold,
        savings: Math.round(savings * 100) / 100,
        savings_percent: threshold > 0 ? Math.round((savings / threshold) * 10000) / 100 : 0,
        timestamp,
        credits_remaining: result.meta?.credits_remaining,
      })
    }
  }

  // Sort newest first so Zapier processes them in chronological order
  items.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

  return items
}

module.exports = {
  key: 'price_drop',
  noun: 'Price Drop',

  display: {
    label: 'Price Drop Alert',
    description:
      'Triggers when a product\'s price drops below your specified threshold at any retailer (or a specific one).',
    important: true,
  },

  operation: {
    type: 'polling',
    perform,

    inputFields: [
      {
        key: 'identifier',
        label: 'Product Identifier',
        type: 'string',
        required: true,
        helpText:
          'The product to monitor. Accepts a barcode (UPC/EAN/ISBN), Amazon ASIN, product URL, model number, or ShopSavvy product ID.',
      },
      {
        key: 'threshold_price',
        label: 'Price Threshold',
        type: 'number',
        required: true,
        helpText:
          'Trigger when the price is at or below this amount (in USD). For example, enter 499.99 to be alerted when the price drops to $499.99 or lower.',
      },
      {
        key: 'retailer',
        label: 'Retailer (Optional)',
        type: 'string',
        required: false,
        helpText:
          'Optionally limit to a specific retailer domain, e.g. "amazon.com" or "bestbuy.com". Leave blank to monitor all retailers.',
      },
    ],

    sample: {
      id: 'offer_abc123_449.99_2026-04-01T12:00:00Z',
      product_title: 'Apple AirPods Pro (2nd Generation)',
      product_barcode: '194253397175',
      product_brand: 'Apple',
      offer_price: 189.99,
      offer_currency: 'USD',
      retailer: 'amazon.com',
      offer_url: 'https://www.amazon.com/dp/B0D1XD1ZV3',
      offer_availability: 'in_stock',
      offer_condition: 'new',
      threshold_price: 200,
      savings: 10.01,
      savings_percent: 5.01,
      timestamp: '2026-04-01T12:00:00Z',
      credits_remaining: 847,
    },

    outputFields: [
      { key: 'id', label: 'Dedup ID', type: 'string' },
      { key: 'product_title', label: 'Product Title', type: 'string' },
      { key: 'product_barcode', label: 'Barcode', type: 'string' },
      { key: 'product_brand', label: 'Brand', type: 'string' },
      { key: 'offer_price', label: 'Offer Price', type: 'number' },
      { key: 'offer_currency', label: 'Currency', type: 'string' },
      { key: 'retailer', label: 'Retailer', type: 'string' },
      { key: 'offer_url', label: 'Offer URL', type: 'string' },
      { key: 'offer_availability', label: 'Availability', type: 'string' },
      { key: 'offer_condition', label: 'Condition', type: 'string' },
      { key: 'threshold_price', label: 'Threshold Price', type: 'number' },
      { key: 'savings', label: 'Savings (USD)', type: 'number' },
      { key: 'savings_percent', label: 'Savings (%)', type: 'number' },
      { key: 'timestamp', label: 'Timestamp', type: 'datetime' },
      { key: 'credits_remaining', label: 'Credits Remaining', type: 'integer' },
    ],
  },
}
