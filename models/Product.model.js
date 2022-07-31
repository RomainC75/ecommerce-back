const { Schema, model } = require('mongoose')

const productSchema = new Schema({
    brand: {type: String, required:true},
    name: {type: String, required:true, unique:true},
    price: {type: Number, required:true},
    priceType: {type:String, enum:['unit','kg'],default:"unit", required:true},
    stockQuantity: {type: Number, required:true},
    pictures:[{type:String}],
    caracteristics: {type:Object},
    categories:[ {type:String} ],
    subCategory:{type:String, required:true},
    originCountry: {type:String},
    weight:{type: Number, required:true}
    // size:{
    //     h:{type:Number},
    //     l:{type:Number},
    //     w:{type:Number}
    // },
},{
    timestamps:true
})

const Product = new model('Product', productSchema)

module.exports = Product