require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the 'public' directory
app.use(express.static('public'));
app.use(express.json());

// Import required modules
const fs = require('fs');
const path = require('path');

// Serve index.html for the root path
app.get('/', (req, res) => {
  try {
    // Check if we can access the API token
    const tokenAvailable = !!process.env.GRAPH_API_TOKEN;
    
    // Log environment info for debugging
    console.log('Environment info:');
    console.log('- NODE_ENV:', process.env.NODE_ENV);
    console.log('- API Token available:', tokenAvailable);
    console.log('- Current directory:', process.cwd());
    
    // Try multiple possible paths for index.html
    const possiblePaths = [
      path.join(process.cwd(), 'public', 'index.html'),
      path.join(process.cwd(), 'index.html'),
      path.join(__dirname, 'public', 'index.html'),
      path.join(__dirname, '..', 'public', 'index.html')
    ];
    
    // Log all possible paths
    console.log('Checking possible paths for index.html:');
    possiblePaths.forEach((p, i) => console.log(`- Path ${i+1}:`, p));
    
    // Find the first path that exists
    let indexPath = null;
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        indexPath = p;
        console.log('Found index.html at:', indexPath);
        break;
      }
    }
    
    if (indexPath) {
      // Serve the file directly using fs.readFile for maximum compatibility
      fs.readFile(indexPath, 'utf8', (err, data) => {
        if (err) {
          console.error('Error reading index.html:', err);
          return res.status(500).json({
            error: 'File Read Error',
            message: err.message
          });
        }
        
        res.setHeader('Content-Type', 'text/html');
        res.send(data);
      });
    } else {
      // If no file is found, return a helpful error
      console.error('index.html not found in any of the checked paths');
      
      // Try to list directories to help with debugging
      let directories = {};
      try {
        possiblePaths.forEach(p => {
          const dir = path.dirname(p);
          if (fs.existsSync(dir)) {
            directories[dir] = fs.readdirSync(dir);
          }
        });
      } catch (e) {
        console.error('Error listing directories:', e);
      }
      
      res.status(500).json({
        error: 'File Not Found',
        message: 'Could not find index.html in any of the expected locations',
        debug: {
          cwd: process.cwd(),
          directories
        }
      });
    }
  } catch (error) {
    console.error('Error serving index.html:', error);
    res.status(500).json({
      error: 'Server Error',
      message: error.message,
      stack: process.env.NODE_ENV === 'production' ? null : error.stack
    });
  }
});

// The Graph Token API endpoint
const GRAPH_TOKEN_API_ENDPOINT = 'https://token-api.thegraph.com/balances/evm';
const GRAPH_API_TOKEN = process.env.GRAPH_API_TOKEN;

// Network mappings from UI names to API network_id values
const NETWORK_MAPPINGS = {
  'ethereum': 'mainnet',
  'eth': 'mainnet',
  'polygon': 'matic',
  'arbitrum': 'arbitrum-one'
};

// Valid networks supported by The Graph Token API
const VALID_NETWORKS = [
  'mainnet',      // Ethereum mainnet
  'base',         // Base
  'bsc',          // Binance Smart Chain
  'matic',        // Polygon (uses 'matic' as network_id)
  'arbitrum-one', // Arbitrum (uses 'arbitrum-one' as network_id)
  'optimism'      // Optimism
];

// Helper to get network_id for API call
function getApiNetworkId(network) {
  return NETWORK_MAPPINGS[network] || network;
}

// Helper for consistent error responses
function errorResponse(res, status, message, details = null) {
  const errorObj = {
    error: message,
    status: status
  };
  
  if (details) {
    errorObj.details = details;
  }
  
  return res.status(status).json(errorObj);
}

// API endpoint to fetch token balances for a given address with network specified
app.get('/api/balances/:network/:address', async (req, res) => {
  try {
    const { network, address } = req.params;
    
    console.log('API endpoint called with network:', network, 'address:', address);
    console.log('API token available:', !!GRAPH_API_TOKEN);
    
    if (!GRAPH_API_TOKEN) {
      return res.status(401).json({
        error: 'Authentication Required',
        message: 'API token not configured. Please add GRAPH_API_TOKEN to your environment variables.',
        status: 401
      });
    }
    
    // Get the appropriate network_id for the API
    const apiNetworkId = getApiNetworkId(network);
    
    // Validate network
    if (!VALID_NETWORKS.includes(apiNetworkId)) {
      console.error('Invalid network:', network, '(mapped to:', apiNetworkId, ')');
      
      const validNetworksFormatted = [
        'ethereum (mainnet)', 
        ...VALID_NETWORKS.filter(n => n !== 'mainnet')
      ].join(', ');
      
      return errorResponse(res, 400, 'Invalid network', {
        message: `Supported networks: ${validNetworksFormatted}`,
        requested: network,
        valid_networks: VALID_NETWORKS
      });
    }
    
    // Construct API URL with the correct network_id
    const apiUrl = `${GRAPH_TOKEN_API_ENDPOINT}/${address}?network_id=${apiNetworkId}`;
    
    console.log(`Using API URL: ${apiUrl}`);
    
    // Make request to The Graph's Token API
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${GRAPH_API_TOKEN}`
      }
    });
    
    // Handle error responses
    if (!response.ok) {
      let errorData;
      
      try {
        // Try to parse error as JSON
        errorData = await response.json();
        console.error('API Error:', response.status, JSON.stringify(errorData));
      } catch (e) {
        // If not JSON, get error as text
        const errorText = await response.text();
        console.error('API Error (non-JSON):', response.status, errorText);
        errorData = { message: errorText };
      }
      
      return errorResponse(res, response.status, 'API Error', errorData);
    }
    
    // Parse and return the successful response
    const data = await response.json();
    
    // Enhance the response with additional meta information
    const enhancedResponse = {
      ...data,
      meta: {
        network: apiNetworkId,
        original_network_param: network,
        address: address,
        timestamp: new Date().toISOString()
      }
    };
    
    res.json(enhancedResponse);
  } catch (error) {
    console.error('Error fetching balances:', error);
    return errorResponse(res, 500, 'Internal server error', { message: error.message });
  }
});

// API endpoint to fetch token balances for a given address (defaults to Ethereum mainnet)
app.get('/api/balances/:address', async (req, res) => {
  try {
    const { address } = req.params;
    
    console.log('API endpoint called with default network and address:', address);
    console.log('API token available:', !!GRAPH_API_TOKEN);
    
    if (!GRAPH_API_TOKEN) {
      return res.status(401).json({
        error: 'Authentication Required',
        message: 'API token not configured. Please add GRAPH_API_TOKEN to your environment variables.',
        status: 401
      });
    }
    
    // Construct API URL - no network_id means API defaults to Ethereum mainnet
    const apiUrl = `${GRAPH_TOKEN_API_ENDPOINT}/${address}`;
    
    console.log(`Using default API URL: ${apiUrl}`);
    
    // Make request to The Graph's Token API
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${GRAPH_API_TOKEN}`
      }
    });
    
    // Handle error responses
    if (!response.ok) {
      let errorData;
      
      try {
        // Try to parse error as JSON
        errorData = await response.json();
        console.error('API Error:', response.status, JSON.stringify(errorData));
      } catch (e) {
        // If not JSON, get error as text
        const errorText = await response.text();
        console.error('API Error (non-JSON):', response.status, errorText);
        errorData = { message: errorText };
      }
      
      return errorResponse(res, response.status, 'API Error', errorData);
    }
    
    // Parse and return the successful response
    const data = await response.json();
    
    // Enhance the response with additional meta information
    const enhancedResponse = {
      ...data,
      meta: {
        network: 'mainnet',
        address: address,
        timestamp: new Date().toISOString()
      }
    };
    
    res.json(enhancedResponse);
  } catch (error) {
    console.error('Error fetching balances:', error);
    return errorResponse(res, 500, 'Internal server error', { message: error.message });
  }
});

// API endpoint to get a list of supported networks
app.get('/api/networks', (req, res) => {
  const networks = [
    { id: 'ethereum', name: 'Ethereum Mainnet', api_id: 'mainnet' },
    { id: 'base', name: 'Base', api_id: 'base' },
    { id: 'bsc', name: 'Binance Smart Chain', api_id: 'bsc' },
    { id: 'polygon', name: 'Polygon', api_id: 'matic' },
    { id: 'arbitrum', name: 'Arbitrum', api_id: 'arbitrum-one' },
    { id: 'optimism', name: 'Optimism', api_id: 'optimism' }
  ];
  
  res.json({ networks });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    api_token: !!GRAPH_API_TOKEN,
    timestamp: new Date().toISOString()
  });
});

// Catch-all for 404 errors
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `The requested endpoint ${req.path} does not exist.`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Server Error',
    message: process.env.NODE_ENV === 'production' 
      ? 'An unexpected error occurred' 
      : err.message
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`┌─────────────────────────────────────────────┐`);
  console.log(`│ The Graph Token API Explorer                │`);
  console.log(`│ Server running at http://localhost:${PORT}      │`);
  console.log(`│ Token API configured: ${!!GRAPH_API_TOKEN ? '✓' : '✗'}                │`);
  console.log(`└─────────────────────────────────────────────┘`);
});
