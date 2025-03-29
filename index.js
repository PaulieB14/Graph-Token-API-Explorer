require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001; // Changed to 3001 to avoid conflicts

// Enable CORS for all routes
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    return res.status(200).json({});
  }
  next();
});

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
    
    // Validate network (for reference only)
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
    
    // Based on the documentation, the API endpoint format is:
    // https://token-api.thegraph.com/balances/evm/${address}
    let apiUrl = `${GRAPH_TOKEN_API_ENDPOINT}/${address}`;
    console.log(`Using API URL: ${apiUrl}`);
    console.log(`Network parameter (for reference only): ${network}`);
    
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
      console.error('Requested URL:', apiUrl);
      console.error('Headers:', {
        'Accept': 'application/json',
        'Authorization': 'Bearer TOKEN_PRESENT: ' + !!GRAPH_API_TOKEN
      });
      
      return res.status(response.status).json({ 
        error: 'Error from The Graph API', 
        status: response.status,
        details: errorText,
        requestedUrl: apiUrl
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

// Fallback route to serve index.html for any unmatched routes (SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`API endpoints:`);
  console.log(`- GET /api/balances/:network/:address`);
  console.log(`- GET /api/balances/:address (backward compatibility, uses ethereum network)`);
});
