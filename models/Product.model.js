const { Schema, model } = require('mongoose')

const productSchema = new Schema({
    price: Number,
    priceType: {type:String, enum:['unit','kg'],default:"unit", required:true},
    pictures:[{type:String}],
    name: {type: String, required:true, unique:true},
    stockQuantity: {type: Number, required:true},
    brand: {type: String, required:true},
    caracteristics: Object,
},{
    timestamps:true
})

const Product = new model('Product', productSchema)

module.exports = Product