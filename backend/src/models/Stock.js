const mongoose = require("mongoose")
const stockSchema = new mongoose.Schema(
    {
        name:{
            type:String
        },
        
        Type:{
            type:String
        },
        quantite:{
            type:Number
        },

    },
    {timestamps:true},
);

module.exports = mongoose.model("Stock", stockSchema);
