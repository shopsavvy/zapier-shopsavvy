'use strict'

const { apiGet } = require('../lib/api-client')

/**
 * Polling trigger: fires when new deals are found on ShopSavvy.
 *
 * Calls GET /v1/deals?sort=new to get the latest deals.
 * Supports optional filtering by category and minimum deal grade (A/B/C/D).
 * Each deal is deduped by its unique path.
 */
const perform = async (z, bundle) => {
  const params = { sort: 'new', limit: 25 }

  if (bundle.inputData.category) {
    params.category = bundle.inputData.category
  }

  if (bundle.inputData.min_grade) {
    params.grade = bundle.inputData.min_grade
  }

  const result = await apiGet(z, bundle, '/deals', params)

  if (!result || !result.success || !result.deals || result.deals.length === 0) {
    return []
  }

  // Grade hierarchy for filtering: A > B > C > D
  const gradeRank = { A: 4, B: 3, C: 2, D: 1 }
  const minRank = bundle.inputData.min_grade ? (gradeRank[bundle.inputData.min_grade] || 0) : 0

  const items = result.deals
    .filter((deal) => {
      if (minRank === 0) return true
      const dealLetter = (deal.grade?.letter || '').toUpperCase()
      return (gradeRank[dealLetter] || 0) >= minRank
    })
    .map((deal) => ({
      id: deal.path,
      title: deal.title,
      subtitle: deal.subtitle || '',
      description: deal.description || '',
      emoji: deal.emoji || '',
      grade_letter: deal.grade?.letter || '',
      grade_suffix: deal.grade?.suffix || '',
      grade_value: deal.grade?.value,
      grade_justification: deal.grade?.justification || '',
      price_current: deal.pricing?.current,
      price_original: deal.pricing?.original,
      price_currency: deal.pricing?.currency || 'USD',
      retailer_name: deal.retailer?.name || '',
      url: deal.url,
      image: deal.image || '',
      votes_upvotes: deal.votes?.upvotes || 0,
      votes_downvotes: deal.votes?.downvotes || 0,
      votes_score: deal.votes?.score || 0,
      comment_count: deal.comment_count || 0,
      expires_at: deal.expires_at || '',
      created_at: deal.created_at,
      credits_remaining: result.meta?.credits_remaining,
    }))

  return items
}

module.exports = {
  key: 'new_deal',
  noun: 'Deal',

  display: {
    label: 'New Deal Found',
    description:
      'Triggers when a new deal is posted on ShopSavvy. Optionally filter by category or minimum deal grade.',
    important: true,
  },

  operation: {
    type: 'polling',
    perform,

    inputFields: [
      {
        key: 'category',
        label: 'Category (Optional)',
        type: 'string',
        required: false,
        helpText:
          'Filter deals to a specific category, e.g. "electronics", "home", "clothing". Leave blank for all categories.',
      },
      {
        key: 'min_grade',
        label: 'Minimum Deal Grade (Optional)',
        type: 'string',
        required: false,
        choices: {
          A: 'A - Exceptional deal',
          B: 'B - Great deal',
          C: 'C - Good deal',
          D: 'D - Decent deal',
        },
        helpText:
          'Only trigger for deals graded at this level or above. ShopSavvy grades deals from A (best) to D. Leave blank for all grades.',
      },
    ],

    sample: {
      id: 'deals/2026/04/01/airpods-pro-2-amazon-189',
      title: 'AirPods Pro 2 dropped to $189',
      subtitle: 'Lowest price in 3 months',
      description: 'The Apple AirPods Pro (2nd Generation) with USB-C have dropped to $189.99 on Amazon, down from the usual $249.',
      emoji: '🎧',
      grade_letter: 'A',
      grade_suffix: '',
      grade_value: 92,
      grade_justification: 'Historic low price on a popular product with strong demand.',
      price_current: 189.99,
      price_original: 249.00,
      price_currency: 'USD',
      retailer_name: 'Amazon',
      url: 'https://www.amazon.com/dp/B0D1XD1ZV3',
      image: 'https://images.shopsavvy.com/products/airpods-pro-2.jpg',
      votes_upvotes: 142,
      votes_downvotes: 3,
      votes_score: 139,
      comment_count: 24,
      expires_at: '',
      created_at: '2026-04-01T08:30:00Z',
      credits_remaining: 940,
    },

    outputFields: [
      { key: 'id', label: 'Deal ID', type: 'string' },
      { key: 'title', label: 'Title', type: 'string' },
      { key: 'subtitle', label: 'Subtitle', type: 'string' },
      { key: 'description', label: 'Description', type: 'string' },
      { key: 'emoji', label: 'Emoji', type: 'string' },
      { key: 'grade_letter', label: 'Grade Letter', type: 'string' },
      { key: 'grade_suffix', label: 'Grade Suffix', type: 'string' },
      { key: 'grade_value', label: 'Grade Value', type: 'integer' },
      { key: 'grade_justification', label: 'Grade Justification', type: 'string' },
      { key: 'price_current', label: 'Current Price', type: 'number' },
      { key: 'price_original', label: 'Original Price', type: 'number' },
      { key: 'price_currency', label: 'Currency', type: 'string' },
      { key: 'retailer_name', label: 'Retailer', type: 'string' },
      { key: 'url', label: 'Deal URL', type: 'string' },
      { key: 'image', label: 'Image URL', type: 'string' },
      { key: 'votes_upvotes', label: 'Upvotes', type: 'integer' },
      { key: 'votes_downvotes', label: 'Downvotes', type: 'integer' },
      { key: 'votes_score', label: 'Vote Score', type: 'integer' },
      { key: 'comment_count', label: 'Comment Count', type: 'integer' },
      { key: 'expires_at', label: 'Expires At', type: 'datetime' },
      { key: 'created_at', label: 'Created At', type: 'datetime' },
      { key: 'credits_remaining', label: 'Credits Remaining', type: 'integer' },
    ],
  },
}
