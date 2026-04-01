# ShopSavvy Integration for Zapier

Connect ShopSavvy's price comparison data to thousands of apps through Zapier. Monitor prices, discover deals, search products, and schedule automatic price tracking -- all without writing code.

ShopSavvy has been helping people find the best deals since 2008, with over 40 million downloads and pricing data from tens of thousands of retailers across 100M+ products.

## What You Can Do

### Triggers (Zapier watches for these)

| Trigger | Description |
|---------|-------------|
| **Price Drop Alert** | Fires when a product's price drops below your threshold at any (or a specific) retailer |
| **New Deal Found** | Fires when new deals are posted on ShopSavvy, with optional category and grade filters |

### Searches (Look up data on demand)

| Search | Description |
|--------|-------------|
| **Find Product** | Search for products by name, keyword, or description |
| **Get Price History** | Retrieve historical pricing data for a product over a date range |

### Creates (Take an action)

| Create | Description |
|--------|-------------|
| **Schedule Product Monitoring** | Schedule a product for automatic price refresh at hourly, daily, or weekly intervals |

## Getting Your API Key

1. Go to [shopsavvy.com/data](https://shopsavvy.com/data)
2. Create an account or sign in
3. Generate an API key from your dashboard
4. Your key will start with `ss_live_`

## Example Zaps

- **Price drop -> Slack notification**: Get pinged in Slack when a product you want drops below your target price
- **New deal -> Email digest**: Receive daily email summaries of the best new deals
- **New deal -> Google Sheets**: Log every new deal to a spreadsheet for analysis
- **Price drop -> SMS**: Get a text message the instant a product hits your target price
- **Find product -> Schedule monitoring**: Search for a product, then automatically schedule it for daily price tracking

## Setup

```bash
# Clone the repo
git clone https://github.com/shopsavvy/zapier-shopsavvy.git
cd zapier-shopsavvy

# Install dependencies
npm install

# Run tests (requires SHOPSAVVY_API_KEY env var)
SHOPSAVVY_API_KEY=ss_live_yourkey npm test

# Validate the integration
zapier validate

# Push to Zapier
zapier push
```

## Development

This integration uses [zapier-platform-cli](https://github.com/zapier/zapier-platform) v18.

```
zapier-shopsavvy/
  index.js                      # App definition & middleware
  authentication.js             # API key auth
  lib/
    api-client.js               # Shared HTTP helpers & error handling
  triggers/
    price_drop.js               # Polling: price below threshold
    new_deal.js                 # Polling: new deals
  searches/
    find_product.js             # Product keyword search
    get_price_history.js        # Historical pricing lookup
  creates/
    schedule_monitoring.js      # Schedule product for refresh
  test/
    authentication.test.js
    triggers.test.js
    searches.test.js
    creates.test.js
```

## API Documentation

Full ShopSavvy Data API docs: [shopsavvy.com/data/documentation](https://shopsavvy.com/data/documentation)

## License

MIT -- see [LICENSE](LICENSE).
