'use strict'

const { apiGet } = require('./lib/api-client')

/**
 * Test the API key by fetching current usage/credit info.
 * Zapier calls this after the user enters their API key to verify it works.
 */
const test = async (z, bundle) => {
  const result = await apiGet(z, bundle, '/usage')

  return {
    credits_remaining: result.data.current_period.credits_remaining,
    credits_limit: result.data.current_period.credits_limit,
    credits_used: result.data.current_period.credits_used,
    usage_percentage: result.usage_percentage,
  }
}

/**
 * Build a human-readable connection label shown in Zapier's connected accounts list.
 */
const getConnectionLabel = (z, bundle) => {
  return `ShopSavvy (${bundle.inputData.credits_remaining} credits remaining)`
}

module.exports = {
  type: 'custom',
  fields: [
    {
      key: 'api_key',
      label: 'ShopSavvy API Key',
      type: 'string',
      required: true,
      helpText:
        'Your ShopSavvy Data API key. Get one at [shopsavvy.com/data](https://shopsavvy.com/data). Keys start with `ss_live_`.',
    },
  ],
  test,
  connectionLabel: getConnectionLabel,
}
