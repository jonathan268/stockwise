require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./src/models/Product");
const Stock = require("./src/models/Stock");

async function debugStock() {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGO_URI_LOCAL;
    console.log(`Connecting to: ${mongoUri?.substring(0, 50)}...`);
    
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB");

    // Get all products
    const products = await Product.find().select("_id name pricing organization");
    console.log(`\n=== PRODUCTS (${products.length}) ===`);
    products.slice(0, 5).forEach((p) => {
      console.log(
        `- ${p.name}: cost=${p.pricing?.cost}, org=${p.organization}`
      );
    });

    // Get all stocks
    const stocks = await Stock.find()
      .populate("product", "name pricing")
      .lean();
    console.log(`\n=== STOCKS (${stocks.length}) ===`);
    stocks.slice(0, 5).forEach((s) => {
      console.log(
        `- Product: ${s.product?.name}, qty=${s.quantity}, cost=${s.product?.pricing?.cost}, value=${
          s.quantity * (s.product?.pricing?.cost || 0)
        }, org=${s.organization}`
      );
    });

    // Calculate total stock value
    const totalValue = stocks.reduce((sum, s) => {
      return sum + s.quantity * (s.product?.pricing?.cost || 0);
    }, 0);
    console.log(`\n=== TOTAL STOCK VALUE: ${totalValue} ===\n`);

    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

debugStock();
