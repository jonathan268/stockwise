require("dotenv").config();
const mongoose = require("mongoose");
const Stock = require("./src/models/Stock");

async function addStockQuantities() {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGO_URI_LOCAL;
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB");

    // Update stocks with quantities
    const result = await Stock.updateMany(
      {},
      [
        {
          $set: {
            quantity: {
              $cond: [
                { $eq: ["$product", new mongoose.Types.ObjectId("69a57b64cde69c83fc8f2160")] },
                100,
                50,
              ],
            },
          },
        },
      ]
    );

    console.log(`Updated ${result.modifiedCount} stock records`);

    // Verify the update
    const stocks = await Stock.find()
      .populate("product", "name pricing")
      .lean();
    
    console.log("\n=== UPDATED STOCKS ===");
    let totalValue = 0;
    stocks.forEach((s) => {
      const value = s.quantity * (s.product?.pricing?.cost || 0);
      totalValue += value;
      console.log(
        `- ${s.product?.name}: qty=${s.quantity}, cost=${s.product?.pricing?.cost}, value=${value}`
      );
    });
    console.log(`Total Stock Value: ${totalValue}`);

    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

addStockQuantities();
