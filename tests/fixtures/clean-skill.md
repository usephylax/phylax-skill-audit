---
name: clean-skill
description: A simple read-only skill that fetches price data from an oracle. No transactions, no secrets.
category: utility
---

# Clean Price Oracle

This skill reads price data from a Chainlink oracle on Base.

## Input
- `asset`: ETH, BTC, etc.

## Procedure
1. Call `latestRoundData()` on the Chainlink feed.
2. Return the price formatted to 2 decimals.

## Output
```json
{ "asset": "ETH", "price": 3450.12, "timestamp": "2025-01-01T00:00:00Z" }
```
