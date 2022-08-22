const router = require('express').Router()
const Product = require('../models/Product.model')
const {categoriesTranslator} = require('../config/catTranslator')

router.get('/',async (req,res,next)=>{
    console.log('-->',req.params.category)
    try {
        const ans = await Product.find()
        if(ans.length===0){
            res.status(404).json({message:"category not found"})
            return
        }
        console.log('===>PRODUCT',ans.length)
        // console.log('====>FILTERED : ',Array.from(new Set(ans.map(prod=>prod.categories).flat())))
        res.status(200).json(ans.filter((prod,i)=>i<50))
    } catch (error) {
        next(error)
    }
})

router.get('/category/:category',async (req,res,next)=>{
    console.log('page : ',req.query)
    const PAGE_SIZE=20
    const page = parseInt(req.query.page || "0")
    
    try {
        console.log('-->',req.params.category)
        console.log('==>',categoriesTranslator)
        const translateLine = categoriesTranslator.find(bothT=>bothT[1]===req.params.category)

        // const total = await Product.countDocuments({categories:{$in:[translateLine[0]]}})
        
        const subCategories = [...new Set((await Product.find({categories:{$in:[translateLine[0]]}})).map(prod=>prod.categories.filter((subCat,i)=>i===1)).flat())]
        console.log('SUBCategories : ',subCategories)

        const rq= Object.keys(req.query).includes('subCat') ? {
            $and:[
                {price:{$gt:req.query.minPrice}},
                {price:{$lt:req.query.maxPrice}},
                {categories:
                    req.query.subCat==="All" ? {$in:[translateLine[0]]} : {$in:[req.query.subCat]}
                },
            ]
            }:{categories:{$in:[translateLine[0]]}}

        console.log('RQ : ', rq)


        const total = await Product.countDocuments(rq)
        console.log('total : ',total)

        const ans = await Product.find(rq)
            .limit(PAGE_SIZE)
            .skip(PAGE_SIZE*(page-1))

        console.log('-->CATEGORY / ans : ',ans.length)
        if(ans.length===0){
            res.status(404).json({message:"category not found"})
            return
        }
        res.status(200).json({
            data:ans,
            page:page,
            total,
            totalPages:Math.ceil(total/PAGE_SIZE),
            subCategories
        })
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

router.get('/:productId', async(req,res,next)=>{
    try {
        const product = await Product.findOne({_id:req.params.productId})
        if(!product){
            res.status(404).json({message:'not found !'})
            return
        }
        res.status(200).json(product)
    } catch (error) {
        next(error)
    }
})

module.exports = router