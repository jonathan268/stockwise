const mongoose = require("mongoose")
const recommandationSchema = new mongoose.Schema(
    {
        id:{
            type:ObjectId()
        },
         produitId:{
            type:OjectId()
         },

         userId:{
            type:ObjectId()
         },

         quantiteRecomnade:{
            type:String
         },
         reason:{
            type:String
         },
    },
    
);

module.exports = mongoose.model("Recommandation", recommandationSchema);