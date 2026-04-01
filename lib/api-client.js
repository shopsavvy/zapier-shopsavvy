'use strict'

const BASE_URL = 'https://api.shopsavvy.com/v1'

/**
 * Make an authenticated GET request to the ShopSavvy Data API.
 *
 * @param {object} z - Zapier z object
 * @param {object} bundle - Zapier bundle (contains authData, inputData, etc.)
 * @param {string} path - API path (e.g. '/products/offers')
 * @param {object} [params={}] - Query parameters
 * @returns {Promise<object>} Parsed JSON response
 */
const apiGet = async (z, bundle, path, params = {}) => {
  const response = await z.request({
    url: `${BASE_URL}${path}`,
    method: 'GET',
    params,
  })

  handleErrors(z, response)

  return response.data
}

/**
 * Make an authenticated PUT request to the ShopSavvy Data API.
 *
 * @param {object} z - Zapier z object
 * @param {object} bundle - Zapier bundle
 * @param {string} path - API path
 * @param {object} [params={}] - Query parameters
 * @returns {Promise<object>} Parsed JSON response
 */
const apiPut = async (z, bundle, path, params = {}) => {
  const response = await z.request({
    url: `${BASE_URL}${path}`,
    method: 'PUT',
    params,
  })

  handleErrors(z, response)

  return response.data
}

/**
 * Standard error handler for ShopSavvy API responses.
 * Maps HTTP status codes to appropriate Zapier error types.
 *
 * @param {object} z - Zapier z object
 * @param {object} response - HTTP response object
 */
const handleErrors = (z, response) => {
  if (response.status === 401) {
    throw new z.errors.Error(
      'Your ShopSavvy API key is invalid or has been revoked. Please reconnect your account at shopsavvy.com/data.',
      'AuthenticationError',
      response.status
    )
  }

  if (response.status === 429) {
    throw new z.errors.Error(
      'ShopSavvy API rate limit exceeded. Please wait a moment and try again. See shopsavvy.com/data for details.',
      'ThrottledError',
      response.status
    )
  }

  if (response.status === 402) {
    throw new z.errors.Error(
      'You have reached your ShopSavvy API limit for this billing period. See shopsavvy.com/data to manage your account.',
      'InvalidData',
      response.status
    )
  }

  // 404 is not an error for searches/triggers - it just means no results
  if (response.status === 404) {
    return
  }

  if (response.status >= 400) {
    const message = response.data?.error || response.data?.error_detail?.message || `ShopSavvy API error (${response.status})`
    throw new z.errors.Error(message, 'InvalidData', response.status)
  }
}

module.exports = {
  BASE_URL,
  apiGet,
  apiPut,
  handleErrors,
}
