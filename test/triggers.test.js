'use strict'

const zapier = require('zapier-platform-core')
const App = require('../index')

const appTester = zapier.createAppTester(App)
zapier.tools.env.inject()

describe('price_drop trigger', () => {
  it('returns results when price is below threshold', async () => {
    const bundle = {
      authData: {
        api_key: process.env.SHOPSAVVY_API_KEY || 'ss_live_test1234567890abcdef12345678',
      },
      inputData: {
        identifier: '194253397175', // AirPods Pro 2 barcode
        threshold_price: 500,
      },
    }

    const results = await appTester(
      App.triggers.price_drop.operation.perform,
      bundle
    )

    expect(Array.isArray(results)).toBe(true)

    if (results.length > 0) {
      const item = results[0]
      expect(item.id).toBeDefined()
      expect(item.product_title).toBeDefined()
      expect(item.offer_price).toBeDefined()
      expect(typeof item.offer_price).toBe('number')
      expect(item.offer_price).toBeLessThanOrEqual(500)
      expect(item.retailer).toBeDefined()
      expect(item.offer_url).toBeDefined()
      expect(item.savings).toBeDefined()
    }
  })

  it('returns empty array when no prices below threshold', async () => {
    const bundle = {
      authData: {
        api_key: process.env.SHOPSAVVY_API_KEY || 'ss_live_test1234567890abcdef12345678',
      },
      inputData: {
        identifier: '194253397175',
        threshold_price: 0.01, // impossibly low
      },
    }

    const results = await appTester(
      App.triggers.price_drop.operation.perform,
      bundle
    )

    expect(Array.isArray(results)).toBe(true)
    expect(results.length).toBe(0)
  })

  it('supports retailer filter', async () => {
    const bundle = {
      authData: {
        api_key: process.env.SHOPSAVVY_API_KEY || 'ss_live_test1234567890abcdef12345678',
      },
      inputData: {
        identifier: '194253397175',
        threshold_price: 500,
        retailer: 'amazon.com',
      },
    }

    const results = await appTester(
      App.triggers.price_drop.operation.perform,
      bundle
    )

    expect(Array.isArray(results)).toBe(true)

    // All results should be from Amazon
    for (const item of results) {
      expect(item.retailer).toMatch(/amazon/i)
    }
  })
})

describe('new_deal trigger', () => {
  it('returns deals sorted by new', async () => {
    const bundle = {
      authData: {
        api_key: process.env.SHOPSAVVY_API_KEY || 'ss_live_test1234567890abcdef12345678',
      },
      inputData: {},
    }

    const results = await appTester(
      App.triggers.new_deal.operation.perform,
      bundle
    )

    expect(Array.isArray(results)).toBe(true)

    if (results.length > 0) {
      const deal = results[0]
      expect(deal.id).toBeDefined()
      expect(deal.title).toBeDefined()
      expect(deal.url).toBeDefined()
      expect(deal.created_at).toBeDefined()
    }
  })

  it('filters by minimum grade', async () => {
    const bundle = {
      authData: {
        api_key: process.env.SHOPSAVVY_API_KEY || 'ss_live_test1234567890abcdef12345678',
      },
      inputData: {
        min_grade: 'A',
      },
    }

    const results = await appTester(
      App.triggers.new_deal.operation.perform,
      bundle
    )

    expect(Array.isArray(results)).toBe(true)

    // All results should be grade A
    for (const deal of results) {
      expect(deal.grade_letter).toBe('A')
    }
  })

  it('filters by category', async () => {
    const bundle = {
      authData: {
        api_key: process.env.SHOPSAVVY_API_KEY || 'ss_live_test1234567890abcdef12345678',
      },
      inputData: {
        category: 'electronics',
      },
    }

    const results = await appTester(
      App.triggers.new_deal.operation.perform,
      bundle
    )

    expect(Array.isArray(results)).toBe(true)
  })
})
