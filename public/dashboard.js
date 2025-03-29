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
  
  // Filter tokens with price data
  const tokensWithPrice = tokens.filter(t => t.price_usd && t.price_usd > 0);
  
  // If no tokens have price, show message
  if (tokensWithPrice.length === 0) {
    container.innerHTML = '<div class="no-data-message">No tokens with price data available</div>';
    return;
  }
  
  // Sort tokens by value
  tokensWithPrice.sort((a, b) => (b.value_usd || 0) - (a.value_usd || 0));
  
  // Take top 3 tokens
  const topTokens = tokensWithPrice.slice(0, 3);
  
  // Create a row for gauges
  const gaugeRow = document.createElement('div');
  gaugeRow.className = 'chart-row';
  container.appendChild(gaugeRow);
  
  // Create gauge for each top token
  topTokens.forEach((token, index) => {
    // Create card for this gauge
    const gaugeCard = document.createElement('div');
    gaugeCard.className = 'chart-card';
    gaugeRow.appendChild(gaugeCard);
    
    // Add title
    const title = document.createElement('div');
    title.className = 'chart-title';
    title.textContent = token.symbol || 'Unknown';
    gaugeCard.appendChild(title);
    
    // Add subtitle (token name)
    const subtitle = document.createElement('div');
    subtitle.className = 'chart-subtitle';
    subtitle.textContent = token.name || token.symbol || 'Unknown';
    gaugeCard.appendChild(subtitle);
    
    // Create gauge container
    const gaugeContainer = document.createElement('div');
    gaugeContainer.className = 'gauge-container';
    gaugeCard.appendChild(gaugeContainer);
    
    // Create canvas for gauge
    const canvas = document.createElement('canvas');
    canvas.id = `gauge-${index}`;
    gaugeContainer.appendChild(canvas);
    
    // Create the gauge
    createGaugeChart(canvas.id, token.price_usd, token.symbol);
    
    // Add price label
    const priceLabel = document.createElement('div');
    priceLabel.className = 'gauge-label';
    priceLabel.textContent = `$${formatCurrency(token.price_usd)}`;
    gaugeCard.appendChild(priceLabel);
  });
}

// Helper function to create a gauge chart
function createGaugeChart(canvasId, value, symbol) {
  // Determine min and max values based on token price
  let minValue = 0;
  let maxValue = value * 2; // Max is double the current price
  
  // Create the gauge chart
  const ctx = document.getElementById(canvasId).getContext('2d');
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      datasets: [{
        data: [value, maxValue - value],
        backgroundColor: [getTokenColor(0), '#f0f0f0'],
        borderWidth: 0
      }]
    },
    options: {
      circumference: 180,
      rotation: 270,
      cutout: '70%',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          enabled: false
        }
      },
      animation: {
        animateRotate: true,
        animateScale: true
      }
    }
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
