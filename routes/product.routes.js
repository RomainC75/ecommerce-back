const router = require('express').Router()
const Product = require('../models/Product.model')


router.get('/category/:category',async (req,res,next)=>{
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

router.get('/list/:idList',async (req,res,next)=>{
    try {
        const idList = req.params.idList.split('-')
        const answerList = await Promise.all( idList.map(async(id)=>{
            return await Product.findOne({_id:id})
        }) )
        console.log('answerList',answerList)
        if(!answerList){
            res.status(400).json({message:'error trying to fetch the basket list'})
            return 
        }
        res.status(200).json(answerList)
        // res.status(400).json('no')
    } catch (error) {
        next(error)
    }

})

module.exports = router