'use strict'

const { apiPut } = require('../lib/api-client')

/**
 * Create: schedule a product for automatic price monitoring.
 *
 * Calls PUT /v1/products/scheduled with the product identifier, frequency,
 * and optional retailer filter. ShopSavvy will refresh the product's pricing
 * at the specified interval.
 *
 */
const perform = async (z, bundle) => {
  const params = {
    ids: bundle.inputData.identifier,
    schedule: bundle.inputData.frequency,
  }

  if (bundle.inputData.retailer) {
    params.retailer = bundle.inputData.retailer
  }

  const result = await apiPut(z, bundle, '/products/scheduled', params)

  if (!result || !result.success || !result.data || result.data.length === 0) {
    return {
      id: bundle.inputData.identifier,
      status: 'no_product_found',
      message: 'Could not find a product matching the provided identifier.',
    }
  }

  const product = result.data[0]

  return {
    id: product.shopsavvy || product.barcode || product.amazon || bundle.inputData.identifier,
    title: product.title,
    shopsavvy: product.shopsavvy || '',
    barcode: product.barcode || '',
    amazon: product.amazon || '',
    brand: product.brand || '',
    schedule: product.schedule || bundle.inputData.frequency,
    retailer: bundle.inputData.retailer || 'all',
    status: 'scheduled',
    credits_remaining: result.meta?.credits_remaining,
  }
}

module.exports = {
  key: 'schedule_monitoring',
  noun: 'Monitored Product',

  display: {
    label: 'Schedule Product Monitoring',
    description:
      'Schedule a product for automatic price refresh monitoring at hourly, daily, or weekly intervals.',
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
          'The product to schedule for monitoring. Accepts a barcode (UPC/EAN/ISBN), Amazon ASIN, product URL, model number, or ShopSavvy product ID.',
      },
      {
        key: 'frequency',
        label: 'Refresh Frequency',
        type: 'string',
        required: true,
        choices: {
          hourly: 'Hourly',
          daily: 'Daily',
          weekly: 'Weekly',
        },
        helpText:
          'How often ShopSavvy should refresh pricing data for this product. More frequent refreshes keep data fresher.',
      },
      {
        key: 'retailer',
        label: 'Retailer (Optional)',
        type: 'string',
        required: false,
        helpText:
          'Optionally restrict monitoring to a specific retailer domain, e.g. "amazon.com". Leave blank to monitor all retailers.',
      },
    ],

    sample: {
      id: 'products/apple-airpods-pro-2nd-generation',
      title: 'Apple AirPods Pro (2nd Generation) with USB-C MagSafe Charging Case',
      shopsavvy: 'products/apple-airpods-pro-2nd-generation',
      barcode: '194253397175',
      amazon: 'B0D1XD1ZV3',
      brand: 'Apple',
      schedule: 'daily',
      retailer: 'all',
      status: 'scheduled',
      credits_remaining: 934,
    },

    outputFields: [
      { key: 'id', label: 'Product ID', type: 'string' },
      { key: 'title', label: 'Product Title', type: 'string' },
      { key: 'shopsavvy', label: 'ShopSavvy ID', type: 'string' },
      { key: 'barcode', label: 'Barcode', type: 'string' },
      { key: 'amazon', label: 'Amazon ASIN', type: 'string' },
      { key: 'brand', label: 'Brand', type: 'string' },
      { key: 'schedule', label: 'Schedule Frequency', type: 'string' },
      { key: 'retailer', label: 'Retailer Filter', type: 'string' },
      { key: 'status', label: 'Status', type: 'string' },
      { key: 'credits_remaining', label: 'Credits Remaining', type: 'integer' },
    ],
  },
}
