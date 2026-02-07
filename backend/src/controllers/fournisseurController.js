const Fournisseur = require('../models/Fournisseur');


// Liste des fournisseurs

exports.getFournisseur = async (req, res) => {
    const fournisseurs = await Fournisseur.find();
    res.json(fournisseurs);

};

// Récupérer un fournisseur

exports.getFournisseurById = async (req, res) =>{
    const fournisseur = await fournisseur.findById(req.params.id);

    if(!fournisseur){
        
        return res.status(404).json({message: "Fournisseur non disponible !"});
    };

    res.json(fournisseur);

};

// Créer un fournisseur

exports.createFournisseur = async (req, res) =>{
    const fournisseur = new Fournisseur(req.body);
    const saveFournisseur = await fournisseur.save();

    res.status(201).json(saveFournisseur);

};

// Modifier un Fournisseur

exports.updateFournisseur = async (req, res) =>{
    const fournisseur = Fournisseur.findByIdAndUpdate(
        req.params.id,
        req.params.body,
        {new:true}

    );

    if(!fournisseur){
        res.status(404).json({message: "Fournisseur non trouvable"});
    };

    res.json(fournisseur);

};

// Supprimé un fournisseur

exports.deleteFournisseur = async (req, res) =>{
    await  fournisseur.findByIdAndDelete(req.params.id);
    res.json({message: "Fournisseur supprimé avec succès."});

};

