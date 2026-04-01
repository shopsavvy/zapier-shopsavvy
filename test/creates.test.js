'use strict'

const zapier = require('zapier-platform-core')
const App = require('../index')

const appTester = zapier.createAppTester(App)
zapier.tools.env.inject()

describe('schedule_monitoring create', () => {
  it('schedules a product for daily monitoring', async () => {
    const bundle = {
      authData: {
        api_key: process.env.SHOPSAVVY_API_KEY || 'ss_live_test1234567890abcdef12345678',
      },
      inputData: {
        identifier: '194253397175', // AirPods Pro 2 barcode
        frequency: 'daily',
      },
    }

    const result = await appTester(
      App.creates.schedule_monitoring.operation.perform,
      bundle
    )

    expect(result).toBeDefined()
    expect(result.id).toBeDefined()
    expect(result.status).toBeDefined()
  })

  it('schedules with retailer filter', async () => {
    const bundle = {
      authData: {
        api_key: process.env.SHOPSAVVY_API_KEY || 'ss_live_test1234567890abcdef12345678',
      },
      inputData: {
        identifier: '194253397175',
        frequency: 'hourly',
        retailer: 'amazon.com',
      },
    }

    const result = await appTester(
      App.creates.schedule_monitoring.operation.perform,
      bundle
    )

    expect(result).toBeDefined()
    expect(result.id).toBeDefined()
  })

  it('schedules weekly monitoring', async () => {
    const bundle = {
      authData: {
        api_key: process.env.SHOPSAVVY_API_KEY || 'ss_live_test1234567890abcdef12345678',
      },
      inputData: {
        identifier: 'B0D1XD1ZV3', // AirPods Pro 2 ASIN
        frequency: 'weekly',
      },
    }

    const result = await appTester(
      App.creates.schedule_monitoring.operation.perform,
      bundle
    )

    expect(result).toBeDefined()
    expect(result.id).toBeDefined()
  })
})
