const router = require('express').Router()
const authentication = require('../middlewares/authentication.mid')
const Order = require('../models/Order.model')

router.get('/',authentication, async(req,res,next)=>{
    try {
        console.log('got the ORDER request ! ', req.user)
        const ans = await Order.find({payementStatus:"paid"}).select({creditCard:0}).sort({createdAt:1}).populate('products.productId')
        console.log('ans : ',ans)
        res.status(200).json(ans)
    } catch (error) {
        next(error)
    }
})

router.get('/shipped/:orderId',authentication, async(req,res,next)=>{
    try {
        const ans = await Order.findOneAndUpdate({_id:req.params.orderId},{payementStatus:'shipped'},{new:true, select:{creditCard:0}})
        if(!ans){
            res.status(400).json({message:"oups .. ^^"})
        }
        res.status(200).json(ans)
    } catch (error) {
        next(error)
    }
})


module.exports=router