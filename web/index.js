const express = require('express');
const multer = require('multer');
const XLSX = require('xlsx');
const csvWriter = require('csv-writer').createObjectCsvWriter;
const { shopifyApi, LATEST_API_VERSION } = require('@shopify/shopify-api');

const app = express();
const port = process.env.PORT || 3000;

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Shopify API configuration
const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY || '73d6341662f34d597100cce919d45000',
  apiSecretKey: process.env.SHOPIFY_API_SECRET || 'your-secret-key',
  scopes: ['write_products', 'read_products', 'write_inventory', 'read_inventory'],
  hostName: process.env.HOST || 'localhost:3000',
  apiVersion: LATEST_API_VERSION,
  isEmbeddedApp: true,
});

app.use(express.static('public'));
app.use(express.json());

// Main app page
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>3Best Product Importer</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; background: #f6f6f7; }
            .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            h1 { color: #2c3e50; margin-bottom: 30px; }
            .upload-area { border: 2px dashed #ddd; padding: 40px; text-align: center; margin: 20px 0; border-radius: 8px; }
            .upload-area:hover { border-color: #007cba; }
            input[type="file"] { margin: 20px 0; }
            button { background: #007cba; color: white; padding: 12px 24px; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; }
            button:hover { background: #005a87; }
            .status { margin: 20px 0; padding: 15px; border-radius: 4px; }
            .success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
            .error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
            .info { background: #d1ecf1; color: #0c5460; border: 1px solid #bee5eb; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🧶 3Best Product Importer</h1>
            <p>Upload your Excel file to import products into Shopify</p>
            
            <div class="upload-area">
                <h3>📁 Upload Excel File</h3>
                <form id="uploadForm" enctype="multipart/form-data">
                    <input type="file" id="excelFile" name="excelFile" accept=".xlsx,.xls" required>
                    <br>
                    <button type="submit">🚀 Import Products</button>
                </form>
            </div>
            
            <div id="status"></div>
            
            <div class="info">
                <h4>📋 Supported Excel Format:</h4>
                <ul>
                    <li>Product codes in "Kod" column</li>
                    <li>Product names in "EshopNazev_EN", "EshopNazev_CZ", or "EshopNazev_DE" columns</li>
                    <li>Prices in "CenaEUR", "CenaCZK", or "CenaUSD" columns</li>
                    <li>Descriptions in "EshopDlouhyPopis_*" columns</li>
                    <li>Inventory in "DostupneMnozstvi" column</li>
                </ul>
            </div>
        </div>
        
        <script>
            document.getElementById('uploadForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const fileInput = document.getElementById('excelFile');
                const statusDiv = document.getElementById('status');
                
                if (!fileInput.files[0]) {
                    statusDiv.innerHTML = '<div class="error">Please select a file to upload</div>';
                    return;
                }
                
                const formData = new FormData();
                formData.append('excelFile', fileInput.files[0]);
                
                statusDiv.innerHTML = '<div class="info">Processing your file... Please wait.</div>';
                
                try {
                    const response = await fetch('/upload', {
                        method: 'POST',
                        body: formData
                    });
                    
                    const result = await response.json();
                    
                    if (result.success) {
                        statusDiv.innerHTML = \`
                            <div class="success">
                                <h4>✅ Import Successful!</h4>
                                <p>Processed \${result.productsProcessed} products</p>
                                <p>CSV file created: \${result.csvFile}</p>
                                <p><a href="/download/\${result.csvFile}" target="_blank">📥 Download CSV File</a></p>
                            </div>
                        \`;
                    } else {
                        statusDiv.innerHTML = \`<div class="error">❌ Error: \${result.error}</div>\`;
                    }
                } catch (error) {
                    statusDiv.innerHTML = \`<div class="error">❌ Upload failed: \${error.message}</div>\`;
                }
            });
        </script>
    </body>
    </html>
  `);
});

// Handle file upload and processing
app.post('/upload', upload.single('excelFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.json({ success: false, error: 'No file uploaded' });
    }

    // Read the Excel file
    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    console.log(`Processing ${data.length} products from Excel file`);

    // Convert to Shopify CSV format
    const shopifyHeaders = [
      'Handle', 'Title', 'Body (HTML)', 'Vendor', 'Type', 'Tags', 'Published',
      'Option1 Name', 'Option1 Value', 'Option2 Name', 'Option2 Value',
      'Option3 Name', 'Option3 Value', 'Variant SKU', 'Variant Grams',
      'Variant Inventory Tracker', 'Variant Inventory Qty', 'Variant Inventory Policy',
      'Variant Fulfillment Service', 'Variant Price', 'Variant Compare At Price',
      'Variant Requires Shipping', 'Variant Taxable', 'Variant Barcode',
      'Image Src', 'Image Position', 'Image Alt Text', 'Gift Card',
      'SEO Title', 'SEO Description', 'Google Shopping / Google Product Category',
      'Google Shopping / Gender', 'Google Shopping / Age Group', 'Google Shopping / MPN',
      'Google Shopping / AdWords Grouping', 'Google Shopping / AdWords Labels',
      'Google Shopping / Condition', 'Google Shopping / Custom Product',
      'Google Shopping / Custom Label 0', 'Google Shopping / Custom Label 1',
      'Google Shopping / Custom Label 2', 'Google Shopping / Custom Label 3',
      'Google Shopping / Custom Label 4', 'Variant Image', 'Variant Weight Unit',
      'Variant Tax Code', 'Cost per item', 'Status'
    ];

    const shopifyRows = data.map((product, index) => {
      const handle = String(product.Kod || 'product-' + index).toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const title = product.EshopNazev_EN || product.EshopNazev_CZ || product.EshopNazev_DE || product.Nazev || 'Untitled Product';
      const bodyHTML = product.EshopDlouhyPopis_EN || product.EshopDlouhyPopis_CZ || product.EshopDlouhyPopis_DE || '';
      const seoTitle = product.EshopSEOTitulek_EN || product.EshopSEOTitulek_CZ || product.EshopSEOTitulek_DE || title;
      const seoDescription = product.EshopSEOPopis_EN || product.EshopSEOPopis_CZ || product.EshopSEOPopis_DE || '';
      
      let price = product.CenaEUR || product.CenaCZK || product.CenaUSD || 0;
      if (price === 'NULL' || price === null || price === undefined || isNaN(price)) {
        price = 0;
      }
      
      let quantity = product.DostupneMnozstvi || 0;
      if (quantity === 'NULL' || quantity === null || quantity === undefined || isNaN(quantity)) {
        quantity = 0;
      }
      
      let weightInGrams = product.Hmotnost || 0;
      if (weightInGrams === 'NULL' || weightInGrams === null || weightInGrams === undefined || isNaN(weightInGrams)) {
        weightInGrams = 0;
      }
      
      const sku = product.Kod || '';
      const barcode = product.CarovyKod || '';
      
      return {
        'Handle': handle,
        'Title': title,
        'Body (HTML)': bodyHTML,
        'Vendor': '3Best',
        'Type': 'Yarn',
        'Tags': '',
        'Published': 'TRUE',
        'Option1 Name': '',
        'Option1 Value': '',
        'Option2 Name': '',
        'Option2 Value': '',
        'Option3 Name': '',
        'Option3 Value': '',
        'Variant SKU': sku,
        'Variant Grams': weightInGrams,
        'Variant Inventory Tracker': 'shopify',
        'Variant Inventory Qty': quantity,
        'Variant Inventory Policy': 'deny',
        'Variant Fulfillment Service': 'manual',
        'Variant Price': price,
        'Variant Compare At Price': '',
        'Variant Requires Shipping': 'TRUE',
        'Variant Taxable': 'TRUE',
        'Variant Barcode': barcode,
        'Image Src': '',
        'Image Position': '',
        'Image Alt Text': '',
        'Gift Card': 'FALSE',
        'SEO Title': seoTitle,
        'SEO Description': seoDescription,
        'Google Shopping / Google Product Category': '',
        'Google Shopping / Gender': '',
        'Google Shopping / Age Group': '',
        'Google Shopping / MPN': sku,
        'Google Shopping / AdWords Grouping': '',
        'Google Shopping / AdWords Labels': '',
        'Google Shopping / Condition': 'new',
        'Google Shopping / Custom Product': 'FALSE',
        'Google Shopping / Custom Label 0': '',
        'Google Shopping / Custom Label 1': '',
        'Google Shopping / Custom Label 2': '',
        'Google Shopping / Custom Label 3': '',
        'Google Shopping / Custom Label 4': '',
        'Variant Image': '',
        'Variant Weight Unit': 'g',
        'Variant Tax Code': '',
        'Cost per item': '',
        'Status': product.Hidden === 1 ? 'draft' : 'active'
      };
    });

    // Create CSV file
    const csvFileName = `shopify-products-import-${Date.now()}.csv`;
    const csvPath = `./exports/${csvFileName}`;
    
    // Ensure exports directory exists
    const fs = require('fs');
    if (!fs.existsSync('./exports')) {
      fs.mkdirSync('./exports');
    }

    const csvWriterInstance = csvWriter({
      path: csvPath,
      header: shopifyHeaders
    });

    await csvWriterInstance.writeRecords(shopifyRows);

    res.json({
      success: true,
      productsProcessed: data.length,
      csvFile: csvFileName
    });

  } catch (error) {
    console.error('Error processing file:', error);
    res.json({ success: false, error: error.message });
  }
});

// Download CSV file
app.get('/download/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = `./exports/${filename}`;
  
  res.download(filePath, filename, (err) => {
    if (err) {
      res.status(404).send('File not found');
    }
  });
});

app.listen(port, () => {
  console.log(`3Best Product Importer running on port ${port}`);
});
