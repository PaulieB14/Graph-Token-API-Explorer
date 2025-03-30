// Dashboard visualization functionality for The Graph Token API Explorer

// Global variables to store token data
let tokenData = null;
let currentNetwork = '';

// Initialize dashboard when the page loads
document.addEventListener('DOMContentLoaded', function() {
  // Dashboard will be initialized when data is fetched
});

// Main function to update all dashboard visualizations
function updateDashboard(data, network) {
  // Store data globally for reuse
  tokenData = data;
  currentNetwork = network;
  
  // Check if we have valid data
  if (!data || !data.data || data.data.length === 0) {
    showNoDataMessage();
    return;
  }
  
  // Update all charts
  createTokenDistributionChart(data.data);
  createTokenValueGauges(data.data);
  createNetworkComparisonChart(data.data);
  createPriceHistoryChart(data.data);
}

// Show message when no data is available
function showNoDataMessage() {
  const dashboardContent = document.getElementById('dashboard-content');
  dashboardContent.innerHTML = `
    <div class="no-data-message">
      <p>No token data available to visualize.</p>
      <p>Please fetch token data first.</p>
    </div>
  `;
}

// Create token distribution chart (pie chart)
function createTokenDistributionChart(tokens) {
  // Get the container
  const container = document.getElementById('token-distribution-container');
  if (!container) return;
  
  // Filter tokens with value
  const tokensWithValue = tokens.filter(t => t.value_usd && t.value_usd > 0);
  
  // If no tokens have value, show message
  if (tokensWithValue.length === 0) {
    container.innerHTML = '<div class="no-data-message">No tokens with value data available</div>';
    return;
  }
  
  // Sort tokens by value
  tokensWithValue.sort((a, b) => (b.value_usd || 0) - (a.value_usd || 0));
  
  // Take top 10 tokens, group the rest as "Others"
  let chartData = [];
  let otherValue = 0;
  
  tokensWithValue.forEach((token, index) => {
    if (index < 10) {
      chartData.push({
        label: token.symbol || 'Unknown',
        value: token.value_usd || 0,
        color: getTokenColor(index)
      });
    } else {
      otherValue += (token.value_usd || 0);
    }
  });
  
  // Add "Others" category if needed
  if (otherValue > 0) {
    chartData.push({
      label: 'Others',
      value: otherValue,
      color: '#999999'
    });
  }
  
  // Clear previous chart if any
  container.innerHTML = '<canvas id="distribution-chart"></canvas>';
  
  // Create the chart
  const ctx = document.getElementById('distribution-chart').getContext('2d');
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: chartData.map(item => item.label),
      datasets: [{
        data: chartData.map(item => item.value),
        backgroundColor: chartData.map(item => item.color),
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            boxWidth: 15,
            padding: 15
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const value = context.raw;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = ((value / total) * 100).toFixed(1);
              return `${context.label}: $${formatCurrency(value)} (${percentage}%)`;
            }
          }
        }
      },
      animation: {
        animateRotate: true,
        animateScale: true
      }
    }
  });
}

// Create token value gauges
function createTokenValueGauges(tokens) {
  // Get the container
  const container = document.getElementById('token-value-gauges');
  if (!container) return;
  
  // Clear previous content
  container.innerHTML = '';
  
  // Filter tokens with price data and meaningful value
  const tokensWithPrice = tokens
    .filter(t => t.price_usd && t.value_usd > 100) // Only tokens with price and meaningful value
    .sort((a, b) => (b.value_usd || 0) - (a.value_usd || 0))
    .slice(0, 6); // Limit to top 6 tokens
  
  // If no tokens have price, show message
  if (tokensWithPrice.length === 0) {
    container.innerHTML = '<div class="no-data-message">No tokens with price data available</div>';
    return;
  }
  
  // Create a gauge container
  const gaugesGrid = document.createElement('div');
  gaugesGrid.className = 'gauges-grid';
  container.appendChild(gaugesGrid);
  
  // Create each token gauge
  tokensWithPrice.forEach(token => {
    const gaugeWrapper = document.createElement('div');
    gaugeWrapper.className = 'gauge-wrapper';
    
    // Calculate meaningful gauge values
    const price = token.price_usd;
    
    // Set different scales based on token price range
    let minPrice, maxPrice, thresholds;
    
    if (price < 0.01) {
      // Micro-priced tokens
      minPrice = 0;
      maxPrice = price * 2; // Set max to double current price
      thresholds = [0.25, 0.5, 0.75].map(t => t * maxPrice);
    } else if (price < 1) {
      // Low-priced tokens
      minPrice = 0;
      maxPrice = Math.ceil(price * 1.5 * 100) / 100; // Round to 2 decimal places
      thresholds = [0.3, 0.6, 0.9].map(t => t * maxPrice);
    } else if (price < 100) {
      // Medium-priced tokens
      minPrice = Math.floor(price * 0.7); // Set min to 70% of current price
      maxPrice = Math.ceil(price * 1.3); // Set max to 130% of current price
      thresholds = [
        minPrice + (maxPrice - minPrice) * 0.33,
        minPrice + (maxPrice - minPrice) * 0.66,
        minPrice + (maxPrice - minPrice) * 0.9
      ];
    } else {
      // High-priced tokens
      minPrice = Math.floor(price * 0.8 / 100) * 100; // Round to nearest 100 below
      maxPrice = Math.ceil(price * 1.2 / 100) * 100; // Round to nearest 100 above
      thresholds = [
        minPrice + (maxPrice - minPrice) * 0.33,
        minPrice + (maxPrice - minPrice) * 0.66,
        minPrice + (maxPrice - minPrice) * 0.9
      ];
    }
    
    // Calculate price position as percentage of the range
    const pricePosition = ((price - minPrice) / (maxPrice - minPrice)) * 100;
    
    // Create gauge HTML
    const decimals = token.decimals || 18;
    const balance = parseFloat(token.amount) / Math.pow(10, decimals);
    
    gaugeWrapper.innerHTML = `
      <div class="gauge-header">
        <span class="gauge-symbol">${token.symbol || 'Unknown'}</span>
        <span class="gauge-price">$${formatCurrency(price, price < 0.01 ? 8 : 4)}</span>
      </div>
      <div class="gauge">
        <div class="gauge-scale">
          <span class="gauge-min">$${formatCurrency(minPrice, 2)}</span>
          <span class="gauge-max">$${formatCurrency(maxPrice, 2)}</span>
        </div>
        <div class="gauge-bar">
          <div class="gauge-fill" style="width: ${pricePosition}%"></div>
          <div class="gauge-marker" style="left: ${pricePosition}%"></div>
        </div>
        <div class="gauge-ticks">
          ${thresholds.map(t => `<div class="gauge-tick" style="left: ${((t - minPrice) / (maxPrice - minPrice)) * 100}%"></div>`).join('')}
        </div>
      </div>
      <div class="gauge-info">
        <span>${formatCurrency(token.value_usd, 2)} USD value</span>
        <span>${formatCurrency(balance, 6)} ${token.symbol}</span>
      </div>
    `;
    
    gaugesGrid.appendChild(gaugeWrapper);
  });
}

// Create network comparison chart
function createNetworkComparisonChart(tokens) {
  // Get the container
  const container = document.getElementById('network-comparison-container');
  if (!container) return;
  
  // Group tokens by network
  const networkGroups = {};
  
  tokens.forEach(token => {
    const network = token.network_id || currentNetwork;
    if (!networkGroups[network]) {
      networkGroups[network] = {
        totalValue: 0,
        tokenCount: 0
      };
    }
    
    networkGroups[network].totalValue += (token.value_usd || 0);
    networkGroups[network].tokenCount += 1;
  });
  
  // If we have a total_results value from pagination, use it for the main network
  if (tokenData && tokenData.meta && tokenData.meta.total_results) {
    // Get the main network (the one we're viewing)
    const mainNetwork = currentNetwork;
    
    // If we have this network in our groups, update its token count
    if (networkGroups[mainNetwork]) {
      networkGroups[mainNetwork].tokenCount = tokenData.meta.total_results;
    }
  }
  
  // If no networks, show message
  if (Object.keys(networkGroups).length === 0) {
    container.innerHTML = '<div class="no-data-message">No network data available</div>';
    return;
  }
  
  // Prepare data for chart
  const networks = Object.keys(networkGroups);
  const values = networks.map(network => networkGroups[network].totalValue);
  const counts = networks.map(network => networkGroups[network].tokenCount);
  
  // Clear previous chart if any
  container.innerHTML = '<canvas id="network-chart"></canvas>';
  
  // Create the chart
  const ctx = document.getElementById('network-chart').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: networks.map(formatNetworkName),
      datasets: [
        {
          label: 'Total Value (USD)',
          data: values,
          backgroundColor: 'rgba(46, 125, 50, 0.7)',
          borderColor: 'rgba(46, 125, 50, 1)',
          borderWidth: 1,
          yAxisID: 'y'
        },
        {
          label: 'Token Count',
          data: counts,
          backgroundColor: 'rgba(100, 181, 246, 0.7)',
          borderColor: 'rgba(100, 181, 246, 1)',
          borderWidth: 1,
          yAxisID: 'y1'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          title: {
            display: true,
            text: 'Total Value (USD)'
          },
          ticks: {
            callback: function(value) {
              return '$' + formatCurrency(value);
            }
          }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          title: {
            display: true,
            text: 'Token Count'
          },
          grid: {
            drawOnChartArea: false
          }
        }
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: function(context) {
              const datasetLabel = context.dataset.label;
              const value = context.raw;
              if (datasetLabel.includes('Value')) {
                return `${datasetLabel}: $${formatCurrency(value)}`;
              } else {
                return `${datasetLabel}: ${value}`;
              }
            }
          }
        }
      }
    }
  });
}

// Create price history chart (simulated data since we don't have historical data)
function createPriceHistoryChart(tokens) {
  // Get the container
  const container = document.getElementById('price-history-container');
  if (!container) return;
  
  // Filter tokens with price
  const tokensWithPrice = tokens.filter(t => t.price_usd && t.price_usd > 0);
  
  // If no tokens have price, show message
  if (tokensWithPrice.length === 0) {
    container.innerHTML = '<div class="no-data-message">No tokens with price data available</div>';
    return;
  }
  
  // Sort tokens by value and take top 3
  tokensWithPrice.sort((a, b) => (b.value_usd || 0) - (a.value_usd || 0));
  const topTokens = tokensWithPrice.slice(0, 3);
  
  // Generate simulated historical data (last 7 days)
  const labels = [];
  const datasets = [];
  
  // Generate date labels (last 7 days)
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
  }
  
  // Generate datasets for each token
  topTokens.forEach((token, index) => {
    const currentPrice = token.price_usd;
    const priceData = [];
    
    // Generate random historical prices with a trend toward current price
    for (let i = 0; i < 7; i++) {
      // More variance in older data, converging to current price
      const variance = 0.2 - (i * 0.02); // 20% to 8% variance
      const randomFactor = 1 + ((Math.random() * 2 - 1) * variance);
      
      if (i === 6) {
        // Last day is current price
        priceData.push(currentPrice);
      } else {
        priceData.push(currentPrice * randomFactor);
      }
    }
    
    datasets.push({
      label: token.symbol || 'Unknown',
      data: priceData,
      borderColor: getTokenColor(index),
      backgroundColor: `${getTokenColor(index)}33`,
      borderWidth: 2,
      tension: 0.4,
      fill: false,
      pointRadius: 3,
      pointHoverRadius: 5
    });
  });
  
  // Clear previous chart if any
  container.innerHTML = '<canvas id="price-chart"></canvas>';
  
  // Create the chart
  const ctx = document.getElementById('price-chart').getContext('2d');
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          ticks: {
            callback: function(value) {
              return '$' + formatCurrency(value);
            }
          }
        }
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: function(context) {
              return `${context.dataset.label}: $${formatCurrency(context.raw)}`;
            }
          }
        },
        legend: {
          position: 'top'
        }
      },
      interaction: {
        mode: 'index',
        intersect: false
      }
    }
  });
}

// Helper function to format currency values
function formatCurrency(value) {
  if (value === null || value === undefined || isNaN(value)) return '0';
  
  // For very small numbers, use scientific notation
  if (Math.abs(value) < 0.00001) return value.toExponential(4);
  
  // For small numbers, show more decimals
  if (Math.abs(value) < 0.0001) return value.toFixed(8);
  if (Math.abs(value) < 0.01) return value.toFixed(6);
  
  // For large numbers, use K, M, B notation
  if (value >= 1e9) return (value / 1e9).toFixed(2) + 'B';
  if (value >= 1e6) return (value / 1e6).toFixed(2) + 'M';
  if (value >= 1e3) return (value / 1e3).toFixed(2) + 'K';
  
  return value.toFixed(2);
}

// Helper function to get a color for a token based on index
function getTokenColor(index) {
  const colors = [
    '#2e7d32', // Primary green
    '#1976d2', // Blue
    '#f57c00', // Orange
    '#7b1fa2', // Purple
    '#c62828', // Red
    '#0097a7', // Teal
    '#fbc02d', // Yellow
    '#5d4037', // Brown
    '#455a64', // Blue Grey
    '#616161', // Grey
    '#009688', // Teal
    '#ff5722'  // Deep Orange
  ];
  
  return colors[index % colors.length];
}

// Helper function to format network names
function formatNetworkName(networkId) {
  const networkNames = {
    'mainnet': 'Ethereum',
    'matic': 'Polygon',
    'arbitrum-one': 'Arbitrum',
    'bsc': 'Binance',
    'optimism': 'Optimism',
    'base': 'Base'
  };
  
  return networkNames[networkId] || networkId;
}
