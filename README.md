# 3Best Product Importer

A traditional Shopify app for importing products from Excel files into your Shopify store.

## 🚀 Features

- **Excel File Processing**: Reads Excel files with product data
- **Multi-language Support**: Handles product names and descriptions in multiple languages (EN, CZ, DE)
- **Shopify CSV Export**: Converts Excel data to Shopify-compatible CSV format
- **Web Interface**: User-friendly interface for file uploads
- **Product Management**: Handles prices, inventory, SKUs, barcodes, and SEO data

## 📋 Supported Excel Format

Your Excel file should contain the following columns:

| Column | Description | Required |
|--------|-------------|----------|
| `Kod` | Product code/SKU | ✅ |
| `EshopNazev_EN` | Product name (English) | ✅ |
| `EshopNazev_CZ` | Product name (Czech) | |
| `EshopNazev_DE` | Product name (German) | |
| `CenaEUR` | Price in EUR | ✅ |
| `CenaCZK` | Price in CZK | |
| `CenaUSD` | Price in USD | |
| `DostupneMnozstvi` | Available quantity | |
| `Hmotnost` | Weight in grams | |
| `CarovyKod` | Barcode | |
| `EshopDlouhyPopis_EN` | Description (English) | |
| `EshopDlouhyPopis_CZ` | Description (Czech) | |
| `EshopDlouhyPopis_DE` | Description (German) | |
| `EshopSEOTitulek_*` | SEO title | |
| `EshopSEOPopis_*` | SEO description | |
| `Hidden` | Product status (1 = draft, 0 = active) | |

## 🛠️ Installation

1. **Clone or download this app**
2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure your app**:
   - Update `shopify.app.toml` with your app credentials
   - Set your store URL and API keys

4. **Run the app**:
   ```bash
   npm run dev
   ```

## 📱 Usage

1. **Start the app**: Run `npm run dev`
2. **Open the web interface**: Navigate to the provided URL
3. **Upload Excel file**: Select your Excel file with product data
4. **Download CSV**: Get the Shopify-compatible CSV file
5. **Import to Shopify**: Upload the CSV file in Shopify Admin → Products → Import

## 🔧 Configuration

### Environment Variables

Set these environment variables:

```bash
SHOPIFY_API_KEY=your_api_key
SHOPIFY_API_SECRET=your_secret_key
HOST=your_app_host
PORT=3000
```

### App Permissions

The app requires these Shopify permissions:
- `write_products`
- `read_products`
- `write_inventory`
- `read_inventory`

## 📁 Project Structure

```
3best-product-importer/
├── web/
│   └── index.js          # Main application server
├── shopify.app.toml      # Shopify app configuration
├── package.json          # Dependencies and scripts
├── README.md            # This file
└── exports/             # Generated CSV files (created automatically)
```

## 🚀 Deployment

### Using Shopify CLI

1. **Build the app**:
   ```bash
   npm run build
   ```

2. **Deploy to Shopify**:
   ```bash
   npm run deploy
   ```

### Manual Deployment

1. **Host the app** on your preferred platform (Heroku, Vercel, etc.)
2. **Update the app URL** in your Shopify Partner Dashboard
3. **Install the app** on your store

## 📊 Example Excel Data

| Kod | EshopNazev_EN | CenaEUR | DostupneMnozstvi | Hmotnost |
|-----|---------------|---------|------------------|----------|
| ART001 | Sport Yarn | 2.19 | 10 | 50 |
| ART002 | Aktiv Cotton | 4.79 | 5 | 100 |

## 🔍 Troubleshooting

### Common Issues

1. **File upload fails**: Check file format (must be .xlsx or .xls)
2. **Missing products**: Verify Excel column names match expected format
3. **Price issues**: Ensure price columns contain numeric values
4. **CSV download fails**: Check if exports directory exists

### Logs

Check the console output for detailed error messages and processing information.

## 📞 Support

For issues or questions:
1. Check the console logs for error messages
2. Verify your Excel file format matches the requirements
3. Ensure all required columns are present

## 📄 License

MIT License - feel free to modify and use as needed.

---

**Made for 3Best** - Simplifying product imports for Shopify stores.
