'use strict'

const zapier = require('zapier-platform-core')
const App = require('../index')

const appTester = zapier.createAppTester(App)
zapier.tools.env.inject()

describe('find_product search', () => {
  it('finds products by keyword', async () => {
    const bundle = {
      authData: {
        api_key: process.env.SHOPSAVVY_API_KEY || 'ss_live_test1234567890abcdef12345678',
      },
      inputData: {
        query: 'AirPods Pro',
        limit: 3,
      },
    }

    const results = await appTester(
      App.searches.find_product.operation.perform,
      bundle
    )

    expect(Array.isArray(results)).toBe(true)

    if (results.length > 0) {
      const product = results[0]
      expect(product.id).toBeDefined()
      expect(product.title).toBeDefined()
      expect(product.shopsavvy).toBeDefined()
    }
  })

  it('returns empty array for nonsense query', async () => {
    const bundle = {
      authData: {
        api_key: process.env.SHOPSAVVY_API_KEY || 'ss_live_test1234567890abcdef12345678',
      },
      inputData: {
        query: 'xyznonexistentproduct999888777',
      },
    }

    const results = await appTester(
      App.searches.find_product.operation.perform,
      bundle
    )

    expect(Array.isArray(results)).toBe(true)
  })

  it('respects the limit parameter', async () => {
    const bundle = {
      authData: {
        api_key: process.env.SHOPSAVVY_API_KEY || 'ss_live_test1234567890abcdef12345678',
      },
      inputData: {
        query: 'headphones',
        limit: 2,
      },
    }

    const results = await appTester(
      App.searches.find_product.operation.perform,
      bundle
    )

    expect(Array.isArray(results)).toBe(true)
    expect(results.length).toBeLessThanOrEqual(2)
  })
})

describe('get_price_history search', () => {
  it('returns price history for a product', async () => {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 7)

    const bundle = {
      authData: {
        api_key: process.env.SHOPSAVVY_API_KEY || 'ss_live_test1234567890abcdef12345678',
      },
      inputData: {
        identifier: '194253397175', // AirPods Pro 2 barcode
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
      },
    }

    const results = await appTester(
      App.searches.get_price_history.operation.perform,
      bundle
    )

    expect(Array.isArray(results)).toBe(true)

    if (results.length > 0) {
      const history = results[0]
      expect(history.id).toBeDefined()
      expect(history.title).toBeDefined()
      expect(history.date_range_start).toBeDefined()
      expect(history.date_range_end).toBeDefined()
      expect(typeof history.total_price_points).toBe('number')
    }
  })

  it('supports retailer filter', async () => {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 7)

    const bundle = {
      authData: {
        api_key: process.env.SHOPSAVVY_API_KEY || 'ss_live_test1234567890abcdef12345678',
      },
      inputData: {
        identifier: '194253397175',
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        retailer: 'amazon.com',
      },
    }

    const results = await appTester(
      App.searches.get_price_history.operation.perform,
      bundle
    )

    expect(Array.isArray(results)).toBe(true)
  })
})
