const mongoose = require("mongoose")
const fournisseurSchema = new mongoose.Schema(
    {
        name:{
            type:String
        },
        contact:{
            type:Number
        },
        livraison:{
            type:Number
        },

    },
    {timestamps:true},
);

module.exports = mongoose.model("Fournisseur", fournisseurSchema );