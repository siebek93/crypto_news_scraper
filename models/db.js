var mongoose = require('mongoose');



let CoinSchema = new mongoose.Schema({
    _id:{
         type: mongoose.Schema.ObjectId, auto: true },

    coin_name: {
            type:String,required:true,maxlength:100
                },

    data_array: {
        type:[],required:true
    
    },
   
}, {timestamps:true });




module.exports = mongoose.model('CoinModel',CoinSchema);