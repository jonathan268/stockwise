const geminiService = require("./src/services/gemini");

async function testGeminiService() {
  console.log('🧪 Test du service Gemini...\n');

  // Test 1: Connexion
  console.log('1️⃣ Test de connexion...');
  const isConnected = await geminiService.testConnection();
  console.log(isConnected ? '✅ Connexion OK\n' : '❌ Connexion échouée\n');

  // Test 2: Analyse de stock
  console.log('2️⃣ Test d\'analyse de stock...');
  const stockData = {
    products: [
      {
        name: "Tomates",
        quantity: 5,
        unit: "kg",
        expirationDate: "2026-02-10"
      },
      {
        name: "Lait",
        quantity: 0,
        unit: "L",
        expirationDate: "2026-02-07"
      },
      {
        name: "Pain",
        quantity: 15,
        unit: "unités",
        expirationDate: "2026-02-08"
      }
    ]
  };

  try {
    const analysis = await geminiService.analyzeStock(stockData);
    console.log('✅ Analyse réussie:');
    console.log(analysis);
    console.log('\n');
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }

  // Test 3: Prédiction de demande
  console.log('3️⃣ Test de prédiction de demande...');
  const productHistory = {
    productName: "Pain",
    lastWeek: [12, 15, 10, 18, 20, 14, 16],
    unit: "unités",
    averagePrice: 2.5
  };

  try {
    const prediction = await geminiService.predictDemand(productHistory);
    console.log('✅ Prédiction réussie:');
    console.log(prediction);
    console.log('\n');
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }

  // Test 4: Prompt personnalisé
  console.log('4️⃣ Test de prompt personnalisé...');
  try {
    const customResponse = await geminiService.customPrompt(
      "Comment réduire le gaspillage alimentaire dans mon restaurant ?",
      {
        type: "restaurant",
        covers: 50,
        wastePercentage: 15
      }
    );
    console.log('✅ Réponse personnalisée:');
    console.log(customResponse);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

// Exécuter les tests
testGeminiService();