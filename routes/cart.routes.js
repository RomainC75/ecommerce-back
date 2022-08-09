const router = require('express').Router()
const Cart = require("../models/Cart.model")
const authentication = require('../middlewares/authentication.mid')
const Product = require('../models/Product.model')

router.get('/',authentication, async(req,res,next)=>{
    console.log(req.user)
    try {
        const ans = await Cart.findOne({userId:req.user._id}).select({userId:0}).populate('products.productId')
        res.status(200).json(ans)
    } catch (error) {
        next(error)
    }
})

router.post('/',authentication, async(req,res,next)=>{
    try {
        const ans = await Cart.find({userId:req.user._id})
        console.log('BODY : ',req.body)
        if(ans.length>0){
            res.status(400).json({message: 'cart already exists !'})
            return
        }
        //test values inside the request
        if(Array.isArray(req.body)){
            // req.body.forEach(val=>{
            //   if(!'productId' in val || !'quantity' in val){
            //     res.status(404).json({message:'data format problem (object)'})
            //     return
            //   }  
            // })
            const ans = await Cart.create({
                userId:req.user._id,
                products:req.body
            })
            res.status(200).json(ans)
            return

        }
        res.status(404).json({message: 'data format problem (array'})
    } catch (error) {
        next(error)
    }
})

router.patch('/',authentication, async (req,res,next)=>{
    try {
        const ans = await Cart.find({userId:req.user._id})
        if(ans.length===0){
            res.json(404).json({message:"cart doesn\'t exist !"})
            return
        }
        const ansUpdate = await Cart.findOneAndUpdate({userId:req.user._id},{products:req.body},{new:true}).populate('products.productId')
        res.status(200).json(ansUpdate)
    } catch (error) {
        next(error)
    }
})

router.delete('/', authentication, async (req,res,next)=>{
    try {
        const ans = await Cart.findOneAndDelete({userId:req.user._id})
        console.log('delete : ',ans )
        res.status(400).json(ans)
    } catch (error) {
        next(error)
    }
})

module.exports=router