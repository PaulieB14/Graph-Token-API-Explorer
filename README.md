# Graph Token API Explorer

A web application for exploring token balances and data for Ethereum addresses using The Graph's Token API.

## Features

- **Token Visualization**: View token balances and values in a clean, card-based interface
- **Portfolio Analysis**: Analyze portfolio diversification with interactive charts
- **Token Comparison**: Compare different tokens in your portfolio
- **Raw JSON**: View the raw API response data
- **Multiple Wallet Support**: Quickly switch between different Ethereum addresses

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/PaulieB14/Graph-Token-API-Explorer.git
   cd Graph-Token-API-Explorer
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with your Graph API token:
   ```
   GRAPH_API_TOKEN=your_api_token_here
   ```

4. Start the development server:
   ```
   node index.js
   ```

5. Open your browser and navigate to `http://localhost:3000`

## Usage

1. Enter an Ethereum address in the input field or click one of the sample wallet buttons
2. Click "Fetch Balances" to retrieve token data
3. View token information in the different tabs:
   - **Token Visualization**: Card-based view of all tokens
   - **Portfolio Analysis**: Doughnut chart showing portfolio allocation
   - **Token Comparison**: Compare any two tokens in your portfolio
   - **Raw JSON**: View the raw API response
   - **Features & Ideas**: Explore potential use cases for the API

## Mock Data

The application includes mock data for testing purposes. To use real data from The Graph's Token API, uncomment the API code in `index.js` and ensure you have a valid API token in your `.env` file.

## Technologies Used

- **Frontend**: HTML, CSS, JavaScript, Chart.js
- **Backend**: Node.js, Express
- **API**: The Graph Token API

## License

This project is licensed under the MIT License - see the LICENSE file for details.
