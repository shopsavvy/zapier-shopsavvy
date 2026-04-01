'use strict'

const { apiGet } = require('../lib/api-client')

/**
 * Search: get historical pricing data for a product.
 *
 * Calls GET /v1/products/offers/history with the given identifier and date range.
 * Returns offers with their price history over the requested period.
 */
const perform = async (z, bundle) => {
  const params = {
    ids: bundle.inputData.identifier,
    start: bundle.inputData.start_date,
    end: bundle.inputData.end_date,
  }

  if (bundle.inputData.retailer) {
    params.retailer = bundle.inputData.retailer
  }

  const result = await apiGet(z, bundle, '/products/offers/history', params)

  if (!result || !result.success || !result.data || result.data.length === 0) {
    return []
  }

  return result.data.map((product) => {
    const offers = product.offers || []

    // Flatten: one result per product with aggregated offer history
    const allPricePoints = []
    let lowestPrice = Infinity
    let highestPrice = -Infinity
    let lowestRetailer = ''
    let highestRetailer = ''

    for (const offer of offers) {
      const history = offer.history || []
      for (const point of history) {
        const price = parseFloat(point.price)
        if (!isNaN(price)) {
          allPricePoints.push({
            retailer: offer.retailer,
            price,
            availability: point.availability || 'unknown',
            timestamp: point.timestamp,
          })

          if (price < lowestPrice) {
            lowestPrice = price
            lowestRetailer = offer.retailer
          }
          if (price > highestPrice) {
            highestPrice = price
            highestRetailer = offer.retailer
          }
        }
      }
    }

    const avgPrice =
      allPricePoints.length > 0
        ? Math.round(
            (allPricePoints.reduce((sum, p) => sum + p.price, 0) / allPricePoints.length) * 100
          ) / 100
        : null

    return {
      id: product.shopsavvy || product.barcode || product.amazon || product.title,
      title: product.title,
      shopsavvy: product.shopsavvy,
      barcode: product.barcode || '',
      amazon: product.amazon || '',
      date_range_start: bundle.inputData.start_date,
      date_range_end: bundle.inputData.end_date,
      total_price_points: allPricePoints.length,
      total_retailers: [...new Set(offers.map((o) => o.retailer))].length,
      lowest_price: lowestPrice === Infinity ? null : lowestPrice,
      lowest_price_retailer: lowestRetailer,
      highest_price: highestPrice === -Infinity ? null : highestPrice,
      highest_price_retailer: highestRetailer,
      average_price: avgPrice,
      offers_count: offers.length,
      credits_remaining: result.meta?.credits_remaining,
    }
  })
}

module.exports = {
  key: 'get_price_history',
  noun: 'Price History',

  display: {
    label: 'Get Price History',
    description:
      'Retrieve historical pricing data for a product over a date range. Returns price stats across all retailers.',
  },

  operation: {
    perform,

    inputFields: [
      {
        key: 'identifier',
        label: 'Product Identifier',
        type: 'string',
        required: true,
        helpText:
          'The product to look up. Accepts a barcode (UPC/EAN/ISBN), Amazon ASIN, product URL, model number, or ShopSavvy product ID.',
      },
      {
        key: 'start_date',
        label: 'Start Date',
        type: 'string',
        required: true,
        helpText: 'Start of the date range in YYYY-MM-DD format, e.g. "2026-01-01".',
      },
      {
        key: 'end_date',
        label: 'End Date',
        type: 'string',
        required: true,
        helpText: 'End of the date range in YYYY-MM-DD format, e.g. "2026-03-31". Must be today or earlier.',
      },
      {
        key: 'retailer',
        label: 'Retailer (Optional)',
        type: 'string',
        required: false,
        helpText:
          'Limit history to a specific retailer domain, e.g. "amazon.com". Leave blank for all retailers.',
      },
    ],

    sample: {
      id: 'products/apple-airpods-pro-2nd-generation',
      title: 'Apple AirPods Pro (2nd Generation) with USB-C MagSafe Charging Case',
      shopsavvy: 'products/apple-airpods-pro-2nd-generation',
      barcode: '194253397175',
      amazon: 'B0D1XD1ZV3',
      date_range_start: '2026-01-01',
      date_range_end: '2026-03-31',
      total_price_points: 287,
      total_retailers: 12,
      lowest_price: 179.99,
      lowest_price_retailer: 'amazon.com',
      highest_price: 249.99,
      highest_price_retailer: 'apple.com',
      average_price: 213.47,
      offers_count: 15,
      credits_remaining: 895,
    },

    outputFields: [
      { key: 'id', label: 'Product ID', type: 'string' },
      { key: 'title', label: 'Product Title', type: 'string' },
      { key: 'shopsavvy', label: 'ShopSavvy ID', type: 'string' },
      { key: 'barcode', label: 'Barcode', type: 'string' },
      { key: 'amazon', label: 'Amazon ASIN', type: 'string' },
      { key: 'date_range_start', label: 'Date Range Start', type: 'string' },
      { key: 'date_range_end', label: 'Date Range End', type: 'string' },
      { key: 'total_price_points', label: 'Total Price Points', type: 'integer' },
      { key: 'total_retailers', label: 'Retailers Tracked', type: 'integer' },
      { key: 'lowest_price', label: 'Lowest Price', type: 'number' },
      { key: 'lowest_price_retailer', label: 'Lowest Price Retailer', type: 'string' },
      { key: 'highest_price', label: 'Highest Price', type: 'number' },
      { key: 'highest_price_retailer', label: 'Highest Price Retailer', type: 'string' },
      { key: 'average_price', label: 'Average Price', type: 'number' },
      { key: 'offers_count', label: 'Offers Count', type: 'integer' },
      { key: 'credits_remaining', label: 'Credits Remaining', type: 'integer' },
    ],
  },
}
