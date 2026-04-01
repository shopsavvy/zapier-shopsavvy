'use strict'

const zapier = require('zapier-platform-core')
const App = require('../index')

const appTester = zapier.createAppTester(App)
zapier.tools.env.inject()

describe('authentication', () => {
  it('passes authentication with a valid API key', async () => {
    const bundle = {
      authData: {
        api_key: process.env.SHOPSAVVY_API_KEY || 'ss_live_test1234567890abcdef12345678',
      },
    }

    const result = await appTester(App.authentication.test, bundle)

    expect(result).toBeDefined()
    expect(result.credits_remaining).toBeDefined()
    expect(result.credits_limit).toBeDefined()
    expect(typeof result.credits_remaining).toBe('number')
  })

  it('fails with an invalid API key', async () => {
    const bundle = {
      authData: {
        api_key: 'ss_live_invalidkey00000000000000000',
      },
    }

    await expect(appTester(App.authentication.test, bundle)).rejects.toThrow()
  })

  it('sets Authorization header via beforeRequest middleware', async () => {
    const apiKey = 'ss_live_abcdefghij1234567890abcdef'
    const bundle = {
      authData: { api_key: apiKey },
    }

    const request = { headers: {} }
    const result = App.beforeRequest[0](request, {}, bundle)

    expect(result.headers.Authorization).toBe(`Bearer ${apiKey}`)
    expect(result.headers['User-Agent']).toMatch(/^ShopSavvy-Zapier\//)
  })
})
