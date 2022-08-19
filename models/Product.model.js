const { Schema, model } = require('mongoose')

const weightSchema = new Schema({
    quantity:{type:Number,required:true},
    unity:{type:String, required:true}
})

const productSchema = new Schema({
    brand: {type: String, required:true},
    name: {type: String, required:true, unique:true},
    price: {type: Number, required:true},
    priceType: {type:String, enum:['unit','kg'],default:"unit", required:true},
    stockQuantity: {type: Number, required:true},
    pictures:[{type:String}],
    caracteristics: {type:Object},
    categories:[ {type:String} ],
    //subCategory:{type:String, required:true},
    originCountry: {type:String},
    weight:weightSchema
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