const router = require('express').Router()
const Cart = require("../models/Cart.model")
const authentication = require('../middlewares/authentication.mid')

router.get('/',authentication, async(req,res,next)=>{
    console.log(req.user)
    try {
        const ans = await Cart.find({userId:req.user._id})
        res.status(200).json(ans[0])
    } catch (error) {
        next(error)
    }
})

router.post('/',authentication, async(req,res,next)=>{
    try {
        const ans = await Cart.find({userId:req.user._id})
        if(ans.length>0){
            res.status(400).json({message: 'cart already exists !'})
            return
        }
        //test values inside the request
        if(Array.isArray(req.body)){
            req.body.forEach(val=>{
              if(!'productId' in val || !'quantity' in val){
                res.status(404).json({message:'data format problem (object)'})
                return
              }  
            })
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
        
    } catch (error) {
        next(error)
    }
})

module.exports=router