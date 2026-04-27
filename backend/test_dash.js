import dotenv from "dotenv";
dotenv.config();
import { connectDB } from './src/config/database.js';
import { getDashboardSummary } from './src/services/dashboard.service.js';
import Organization from './src/models/Organization.js';

async function run() {
  await connectDB();
  const org = await Organization.findOne();
  if(!org) return console.log('No org built');
  try {
    // First time (loads from db and caches)
    const summary1 = await getDashboardSummary(org._id);
    JSON.stringify(summary1);
    console.log("First time JSON.stringify successful");
    
    // Second time (loads from cache)
    const summary2 = await getDashboardSummary(org._id);
    JSON.stringify(summary2);
    console.log("Second time JSON.stringify successful");
  } catch(e) {
    console.error("Error stringifying!", e);
  }
  process.exit(0);
}
run();
