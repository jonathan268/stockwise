require("dotenv").config();
const express = require("express");
const connectDB = require("./db");
const authRoutes = require("./src/routes/authRoutes");

const app = express();
app.use(express.json());

connectDB();

app.use('/api/auth', authRoutes);
app.use('/api/produits', require('./src/routes/produitRoutes'));
app.use('/api/users', require('./src/routes/userRoutes'));
app.use('/api/stocks', require('./src/routes/stockRoutes'));
app.use('/api/fournisseurs', require('./src/routes/fournisseurRoutes'));

app.get('/', (req, res) =>{
    res.json({message: 'API StockWise fonctionne !'});
});



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
