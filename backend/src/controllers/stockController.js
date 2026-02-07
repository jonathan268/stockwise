const Stock = require('../models/Stock');

// Liste des Stocks

exports.getStock = async (req, res) =>{
    const stocks = await Stock.find();
    res.json(stocks);

};

// Recpérer un stock

exports.getStockById = async (req,res) =>{
    const stock = await Stock.findById(req.params.id);

    if(!stock){
        res.status(404).json({message: "Stock non disponible"});
    };

    res.json(stock);
};

// Créer un nouveau stock

exports.createStock = async (req, res) =>{
    const stock = new Stock(req.body);
    const saveStock = await stock.save();

    res.status(201).json(saveStock);

};

// Modifier un stock

exports.updateStock = async (req, res) =>{
    const stock =  Stock.findByIdAndUpdate(
        req.params.id,
        req.body,
        {new:true},
    );

    if(!stock){

        return res.status(404).json({mesage: "Aucun stock disponible"});
    };

    res.json(stock);
};

// Supprimé un stock

exports.deleteStock = async (req, res) =>{
   await Stock.findByIdAndDelete(req.params.id);
   res.json({message: "Stock supprimé avec succès"});
};

