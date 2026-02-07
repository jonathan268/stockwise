const mongoose = require("mongoose");
const produitSchema = new mongoose.Schema(
    {

        minstock:{
            type:Number,

        },

        fournisseur:{
            type:String,


        },

        name:{
            type:String,
            required:true,
        },
        montant:{
            type:Number,
            required:true,
        },
        stock:{
            type:Number,
            default:0,
        },

        category:{
            type:String,

        },

    },
    {timestamps:true}
);

module.exports = mongoose.model("Produit", produitSchema);