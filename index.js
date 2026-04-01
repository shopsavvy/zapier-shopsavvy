'use strict'

const authentication = require('./authentication')
const priceDrop = require('./triggers/price_drop')
const newDeal = require('./triggers/new_deal')
const findProduct = require('./searches/find_product')
const getPriceHistory = require('./searches/get_price_history')
const scheduleMonitoring = require('./creates/schedule_monitoring')

module.exports = {
  version: require('./package.json').version,
  platformVersion: require('zapier-platform-core').version,

  authentication,

  beforeRequest: [
    (request, z, bundle) => {
      request.headers.Authorization = `Bearer ${bundle.authData.api_key}`
      request.headers['User-Agent'] = `ShopSavvy-Zapier/${require('./package.json').version}`
      return request
    },
  ],

  triggers: {
    [priceDrop.key]: priceDrop,
    [newDeal.key]: newDeal,
  },

  searches: {
    [findProduct.key]: findProduct,
    [getPriceHistory.key]: getPriceHistory,
  },

  creates: {
    [scheduleMonitoring.key]: scheduleMonitoring,
  },
}
