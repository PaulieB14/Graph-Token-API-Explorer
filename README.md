# The Graph Token API Explorer

A modern web application for exploring token balances and data across multiple EVM networks using The Graph's Token API.

![The Graph Token API Explorer](https://i.imgur.com/placeholder.png)

## Features

- **Token Visualization**: View all tokens owned by an Ethereum address with balances and USD values
- **Portfolio Analysis**: Analyze portfolio distribution with interactive charts
- **Token Comparison**: Compare different tokens in your portfolio
- **Network Support**: Explore tokens across multiple EVM networks (Ethereum, Base, BSC, Polygon, Arbitrum, Optimism)
- **Wrapped Token Analysis**: View detailed information about wrapped tokens on each network
- **Dark Mode**: Toggle between light and dark themes for comfortable viewing
- **Responsive Design**: Works on desktop and mobile devices

## Installation

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/graph-token-api-explorer.git
   cd graph-token-api-explorer
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with your JWT token from The Graph Market:
   ```
   GRAPH_API_TOKEN=your_jwt_token_here
   ```

4. Start the development server:
   ```bash
   npm start
   ```

5. Open your browser and navigate to:
   ```
   http://localhost:3001
   ```

## Usage

1. Enter an Ethereum address in the input field
2. Select a network from the dropdown menu
3. Click "Fetch Balances" to retrieve token data
4. Navigate through the different tabs to explore the data:
   - **Token Visualization**: View all tokens with balances and values
   - **Portfolio Analysis**: See portfolio distribution in a pie chart
   - **Token Comparison**: Compare different tokens in your portfolio
   - **Wrapped Token Analysis**: View details about wrapped tokens on the selected network
   - **Raw JSON**: See the raw API response data

## API Endpoints

The application provides the following API endpoints:

- `GET /api/balances/:network/:address` - Get token balances for a specific address on a specific network
- `GET /api/balances/:address` - Get token balances for a specific address on Ethereum (backward compatibility)

## Technologies Used

- **Frontend**:
  - HTML5, CSS3, JavaScript
  - Chart.js for data visualization

- **Backend**:
  - Node.js
  - Express.js
  - node-fetch for API requests

- **API**:
  - The Graph Token API

## Dark Mode

The application includes a dark mode feature that can be toggled with the button in the top-right corner. The theme preference is saved in localStorage and will persist between sessions.

## Development

### Project Structure

```
graph-token-api-explorer/
├── public/               # Static files
│   ├── index.html        # Main HTML file
│   └── styles.css        # CSS styles
├── .env                  # Environment variables (create this file)
├── index.js              # Express server and API endpoints
├── package.json          # Project dependencies
└── README.md             # Project documentation
```

### Customizing

- **Adding Networks**: Edit the network dropdown in `public/index.html` and update the `validNetworks` array in `index.js`
- **Styling**: Modify the CSS variables in `public/index.html` to change the theme colors
- **Adding Features**: The modular design makes it easy to add new tabs and visualizations

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [The Graph](https://thegraph.com/) for providing the Token API
- [Chart.js](https://www.chartjs.org/) for the data visualization tools
