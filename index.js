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

// API endpoint to fetch token balances for a given address on a specific network
app.get('/api/balances/:network/:address', async (req, res) => {
  try {
    const { network, address } = req.params;
    
    console.log('API endpoint called with network:', network, 'address:', address);
    console.log('API token available:', !!GRAPH_API_TOKEN);
    
    // Validate network (for backward compatibility and future use)
    // Note: The Graph Token API currently doesn't use network in the URL
    const validNetworks = ['ethereum', 'base', 'bsc', 'polygon', 'arbitrum', 'optimism'];
    if (!validNetworks.includes(network)) {
      console.error('Invalid network:', network);
      return res.status(400).json({ error: 'Invalid network. Supported networks: ' + validNetworks.join(', ') });
    }
    
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
    
    // Add network-specific tokens to mock data based on the network
    if (network !== 'ethereum' && mockData) {
      // Add network-specific tokens
      const networkTokens = {
        'base': [
          {
            contract: "0x4200000000000000000000000000000000000006",
            symbol: "WETH",
            name: "Wrapped Ether (Base)",
            decimals: 18,
            amount: "2000000000000000000",
            date: "2025-03-28",
            price_usd: 3500.0,
            value_usd: 7000.0,
            low_liquidity: false
          }
        ],
        'bsc': [
          {
            contract: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
            symbol: "WBNB",
            name: "Wrapped BNB",
            decimals: 18,
            amount: "10000000000000000000",
            date: "2025-03-28",
            price_usd: 600.0,
            value_usd: 6000.0,
            low_liquidity: false
          }
        ],
        'polygon': [
          {
            contract: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
            symbol: "WMATIC",
            name: "Wrapped Matic",
            decimals: 18,
            amount: "5000000000000000000000",
            date: "2025-03-28",
            price_usd: 1.2,
            value_usd: 6000.0,
            low_liquidity: false
          }
        ],
        'arbitrum': [
          {
            contract: "0x912CE59144191C1204E64559FE8253a0e49E6548",
            symbol: "ARB",
            name: "Arbitrum",
            decimals: 18,
            amount: "10000000000000000000000",
            date: "2025-03-28",
            price_usd: 1.5,
            value_usd: 15000.0,
            low_liquidity: false
          }
        ],
        'optimism': [
          {
            contract: "0x4200000000000000000000000000000000000042",
            symbol: "OP",
            name: "Optimism",
            decimals: 18,
            amount: "20000000000000000000000",
            date: "2025-03-28",
            price_usd: 3.2,
            value_usd: 64000.0,
            low_liquidity: false
          }
        ]
      };
      
      // Add network-specific tokens to mock data
      if (networkTokens[network]) {
        mockData.data = [...mockData.data, ...networkTokens[network]];
        mockData.results += networkTokens[network].length;
        mockData.total_results += networkTokens[network].length;
      }
    }
    
    // For debugging and testing, use mock data if needed
    if (process.env.USE_MOCK_DATA === 'true') {
      console.log(`Returning mock data for network: ${network}, address: ${address}`);
      return res.json(mockData);
    }
    
    // Make request to The Graph Token API
    // According to the documentation, the API endpoint doesn't include the network parameter
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
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Backward compatibility route for the old API endpoint format
app.get('/api/balances/:address', async (req, res) => {
  try {
    const { address } = req.params;
    
    // Redirect to the new endpoint format with 'ethereum' as the default network
    console.log(`Redirecting old API format to new format with default network 'ethereum' for address: ${address}`);
    
    // Forward the request to the new endpoint
    req.params.network = 'ethereum';
    app.handle(req, res);
  } catch (error) {
    console.error('Server error in backward compatibility route:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`API endpoints:`);
  console.log(`- GET /api/balances/:network/:address`);
  console.log(`- GET /api/balances/:address (backward compatibility, uses ethereum network)`);
});
