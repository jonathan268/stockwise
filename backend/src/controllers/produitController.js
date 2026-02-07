//Liste des produits


const Produit = require('../models/Produit');

exports.getProduit = async(req, res) =>{
    const produits = await Produit.find();
    try{
         res.json(produits);
    } catch{
        res.status(404).json({message: "Aucun produit disponible."})
    };
   
};

// Récupérer un produit

exports.getProduitById = async(req, res) =>{
    const produit = await Produit.findById(req.params.id);

    if(!produit){
        return res.status(404).json({message: "Produit introuvable"});
    }

    res.json(produit);
};

// Créer un nouveau produit

exports.createProduit = async(req, res) =>{
    const produit = new Produit(req.body);
    const saveProduit = await produit.save();

    res.status(201).json(saveProduit);
};

// Mise à jour du produit

exports.updateProduit = async(req, res) =>{
    const produit = Produit.findByIdAndUpdate(
        req.params.id,
        req.body,
        {new:true}

    );

    if(!produit){
        return res.status(404).json({message: "Produit introuvable"});
    }

    res.json(produit);

};

// Supprimé un produit

exports.deleteProduit = async(req, res) =>{
    await Produit.findByIdAndDelete(req.params.id);
    res.json({message: "Produit supprimé"});
};


