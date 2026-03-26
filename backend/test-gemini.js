const geminiService = require("./src/services/gemini");

async function run() {
  console.log("Testing Gemini API...");
  try {
    const works = await geminiService.testConnection();
    console.log("Gemini API Connection Test:", works ? "SUCCESS" : "FAILED");
    
    // Si connection OK, essayons un petit prompt
    if(works) {
      const res = await geminiService.customPrompt("Dis bonjour en un mot.");
      console.log("Response:", res);
    }
  } catch(e) {
    console.error("Error connecting to Gemini:", e);
  }
}

run();