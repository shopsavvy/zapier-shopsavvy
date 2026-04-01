'use strict'

const { apiGet } = require('../lib/api-client')

/**
 * Search: find products by keyword query.
 *
 * Calls GET /v1/products/search with a text query and returns matching products
 * ranked by relevance. Useful for looking up products by name before setting up
 * triggers or creates.
 */
const perform = async (z, bundle) => {
  const params = {
    q: bundle.inputData.query,
    limit: bundle.inputData.limit || 5,
  }

  const result = await apiGet(z, bundle, '/products/search', params)

  if (!result || !result.success || !result.data || result.data.length === 0) {
    return []
  }

  return result.data.map((product) => ({
    id: product.shopsavvy || product.barcode || product.amazon || product.title,
    title: product.title,
    title_short: product.title_short || '',
    shopsavvy: product.shopsavvy,
    brand: product.brand || '',
    category: product.category || '',
    barcode: product.barcode || '',
    amazon: product.amazon || '',
    model: product.model || '',
    mpn: product.mpn || '',
    images: product.images || [],
    description: product.description || '',
    rating_value: product.rating?.value,
    rating_count: product.rating?.count,
    score_overall: product.score?.overall,
    credits_remaining: result.meta?.credits_remaining,
  }))
}

module.exports = {
  key: 'find_product',
  noun: 'Product',

  display: {
    label: 'Find Product',
    description: 'Search for a product by name, keyword, or description.',
    important: true,
  },

  operation: {
    perform,

    inputFields: [
      {
        key: 'query',
        label: 'Search Query',
        type: 'string',
        required: true,
        helpText:
          'Search query to find products. Examples: "AirPods Pro", "Samsung Galaxy S24", "KitchenAid mixer".',
      },
      {
        key: 'limit',
        label: 'Max Results',
        type: 'integer',
        required: false,
        default: '5',
        helpText: 'Maximum number of results to return (1-100, default 5).',
      },
    ],

    sample: {
      id: 'products/apple-airpods-pro-2nd-generation',
      title: 'Apple AirPods Pro (2nd Generation) with USB-C MagSafe Charging Case',
      title_short: 'AirPods Pro 2',
      shopsavvy: 'products/apple-airpods-pro-2nd-generation',
      brand: 'Apple',
      category: 'Electronics',
      barcode: '194253397175',
      amazon: 'B0D1XD1ZV3',
      model: 'MTJV3AM/A',
      mpn: '',
      images: ['https://images.shopsavvy.com/products/airpods-pro-2.jpg'],
      description: 'The Apple AirPods Pro (2nd generation) with USB-C deliver up to 2x more Active Noise Cancellation than the previous generation.',
      rating_value: 4.7,
      rating_count: 89432,
      score_overall: 88,
      credits_remaining: 935,
    },

    outputFields: [
      { key: 'id', label: 'Product ID', type: 'string' },
      { key: 'title', label: 'Title', type: 'string' },
      { key: 'title_short', label: 'Short Title', type: 'string' },
      { key: 'shopsavvy', label: 'ShopSavvy ID', type: 'string' },
      { key: 'brand', label: 'Brand', type: 'string' },
      { key: 'category', label: 'Category', type: 'string' },
      { key: 'barcode', label: 'Barcode', type: 'string' },
      { key: 'amazon', label: 'Amazon ASIN', type: 'string' },
      { key: 'model', label: 'Model Number', type: 'string' },
      { key: 'mpn', label: 'MPN', type: 'string' },
      { key: 'images', label: 'Images', type: 'string' },
      { key: 'description', label: 'Description', type: 'string' },
      { key: 'rating_value', label: 'Rating (out of 5)', type: 'number' },
      { key: 'rating_count', label: 'Rating Count', type: 'integer' },
      { key: 'score_overall', label: 'ShopSavvy Score', type: 'integer' },
      { key: 'credits_remaining', label: 'Credits Remaining', type: 'integer' },
    ],
  },
}
