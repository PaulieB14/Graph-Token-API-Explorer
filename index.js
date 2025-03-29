require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the 'public' directory
app.use(express.static('public'));

// The Graph Token API endpoint
const GRAPH_TOKEN_API_ENDPOINT = 'https://token-api.thegraph.com/balances/evm';
const GRAPH_API_TOKEN = process.env.GRAPH_API_TOKEN;

// API endpoint to fetch token balances for a given Ethereum address
app.get('/api/balances/:address', async (req, res) => {
  try {
    const { address } = req.params;
    
    console.log('API endpoint called with address:', address);
    console.log('API token available:', !!GRAPH_API_TOKEN);
    
    // Validate Ethereum address format (basic validation)
    if (!address.match(/^0x[a-fA-F0-9]{40}$/)) {
      console.error('Invalid Ethereum address format:', address);
      return res.status(400).json({ error: 'Invalid Ethereum address format' });
    }

    console.log('Fetching token balances for address:', address);
    
    // For debugging, let's create different mock responses based on the address
    let mockData;
    
    // Binance Hot Wallet
    if (address === '0x28c6c06298d514db089934071355e5743bf21d60') {
      mockData = {
        data: [
          {
            contract: "0xdac17f958d2ee523a2206206994597c13d831ec7",
            symbol: "USDT",
            name: "Tether USD",
            decimals: 6,
            amount: "1000000000",
            date: "2025-03-28",
            price_usd: 1.0,
            value_usd: 1000.0,
            low_liquidity: false
          },
          {
            contract: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
            symbol: "USDC",
            name: "USD Coin",
            decimals: 6,
            amount: "2000000000",
            date: "2025-03-28",
            price_usd: 1.0,
            value_usd: 2000.0,
            low_liquidity: false
          },
          {
            contract: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
            symbol: "WETH",
            name: "Wrapped Ether",
            decimals: 18,
            amount: "1000000000000000000",
            date: "2025-03-28",
            price_usd: 3500.0,
            value_usd: 3500.0,
            low_liquidity: false
          }
        ],
        pagination: {
          current_page: 1,
          total_pages: 1
        },
        results: 3,
        total_results: 3
      };
    } 
    // Coinbase Wallet
    else if (address === '0x47ac0fb4f2d84898e4d9e7b4dab3c24507a6d503') {
      mockData = {
        data: [
          {
            contract: "0x514910771af9ca656af840dff83e8264ecf986ca",
            symbol: "LINK",
            name: "ChainLink Token",
            decimals: 18,
            amount: "10000000000000000000",
            date: "2025-03-28",
            price_usd: 15.0,
            value_usd: 150.0,
            low_liquidity: false
          },
          {
            contract: "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
            symbol: "UNI",
            name: "Uniswap",
            decimals: 18,
            amount: "5000000000000000000",
            date: "2025-03-28",
            price_usd: 10.0,
            value_usd: 50.0,
            low_liquidity: false
          },
          {
            contract: "0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9",
            symbol: "AAVE",
            name: "Aave Token",
            decimals: 18,
            amount: "2000000000000000000",
            date: "2025-03-28",
            price_usd: 80.0,
            value_usd: 160.0,
            low_liquidity: false
          }
        ],
        pagination: {
          current_page: 1,
          total_pages: 1
        },
        results: 3,
        total_results: 3
      };
    }
    // Binance Wallet 3
    else if (address === '0xbe0eb53f46cd790cd13851d5eff43d12404d33e8') {
      mockData = {
        data: [
          {
            contract: "0x6b175474e89094c44da98b954eedeac495271d0f",
            symbol: "DAI",
            name: "Dai Stablecoin",
            decimals: 18,
            amount: "5000000000000000000000",
            date: "2025-03-28",
            price_usd: 1.0,
            value_usd: 5000.0,
            low_liquidity: false
          },
          {
            contract: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
            symbol: "WBTC",
            name: "Wrapped BTC",
            decimals: 8,
            amount: "10000000",
            date: "2025-03-28",
            price_usd: 65000.0,
            value_usd: 6500.0,
            low_liquidity: false
          }
        ],
        pagination: {
          current_page: 1,
          total_pages: 1
        },
        results: 2,
        total_results: 2
      };
    }
    // LINK Whale
    else if (address === '0xc6b0562605d35ee710138402b878ffe6f2e23807') {
      mockData = {
        data: [
          {
            contract: "0x514910771af9ca656af840dff83e8264ecf986ca",
            symbol: "LINK",
            name: "ChainLink Token",
            decimals: 18,
            amount: "1000000000000000000000",
            date: "2025-03-28",
            price_usd: 15.0,
            value_usd: 15000.0,
            low_liquidity: false
          }
        ],
        pagination: {
          current_page: 1,
          total_pages: 1
        },
        results: 1,
        total_results: 1
      };
    }
    // Default for any other address
    else {
      mockData = {
        data: [
          {
            contract: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
            symbol: "WETH",
            name: "Wrapped Ether",
            decimals: 18,
            amount: "500000000000000000",
            date: "2025-03-28",
            price_usd: 3500.0,
            value_usd: 1750.0,
            low_liquidity: false
          },
          {
            contract: "0xdac17f958d2ee523a2206206994597c13d831ec7",
            symbol: "USDT",
            name: "Tether USD",
            decimals: 6,
            amount: "500000000",
            date: "2025-03-28",
            price_usd: 1.0,
            value_usd: 500.0,
            low_liquidity: false
          }
        ],
        pagination: {
          current_page: 1,
          total_pages: 1
        },
        results: 2,
        total_results: 2
      };
    }
    
    console.log('Returning mock data for address:', address);
    return res.json(mockData);
    
    /*
    // Make request to The Graph Token API
    const apiUrl = `${GRAPH_TOKEN_API_ENDPOINT}/${address}`;
    console.log('API URL:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${GRAPH_API_TOKEN}`
      }
    });
    
    console.log('Response status:', response.status);

    // Check if response is ok
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API response error:', response.status, errorText);
      return res.status(response.status).json({ 
        error: 'Error from The Graph API', 
        status: response.status,
        details: errorText 
      });
    }
    
    const data = await response.json();
    
    // Check for errors in the GraphQL response
    if (data.errors) {
      console.error('GraphQL errors:', data.errors);
      return res.status(500).json({ 
        error: 'Error fetching data from The Graph API',
        details: data.errors 
      });
    }

    // Log the data structure for debugging
    console.log('API Response Data Structure:', JSON.stringify(data, null, 2));
    
    // Return the data
    res.json(data);
    */
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
