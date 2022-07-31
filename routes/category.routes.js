const router = require('express').Router()
const Product = require('../models/Product.model')


router.get('/:category',async (req,res,next)=>{
    console.log('-->',req.params.category)
    try {
        const ans = await Product.find({categories:req.params.category})
        if(ans.length===0){
            res.status(404).json({message:"category not found"})
            return
        }
        res.status(200).json(ans)
    } catch (error) {
        next(error)
    }
})


module.exports = router