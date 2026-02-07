const User = require('../models/User');

// Liste des utilisateurs

exports.getUser = async(req, res) =>{
    const users = await User.find();
    res.json(users);
 };

 // Récupérer un utilisateur

 exports.getUserById = async(req, res) =>{
    const user = await User.findById(req.params.id);

    if(!user){
        return res.status(404).json({message: "Utlisateur non trouvé"});
    }

    res.json(user);

 };

 // Créer un utilisateur

 exports.createUser = async(req, res) =>{
    const user = new User(req.body);
    const saveUser = await  user.save();

    res.status(201).json({message: "Utilisateur créer avec succès"});

    res.json(saveUser);
 };

 // Mise à jour d'un utilisateur

 exports.updateUser = async (req, res) =>{
    const user = User.findByIdAndUpdate(
        req.params.id,
        req.body,
        {new:true},
    );

    if(!user){
        res.status(404).json({message: "Utilisateur non trouvé"});
    }

    res.json(user);

 };

 // Supprimé un Utilisateur

 exports.deleteUser = async (req, res) =>{
    await User.findByIdAndDelete(req.params.id);
    res.json({message: "Utilisateur supprimé avec succès"});

 };