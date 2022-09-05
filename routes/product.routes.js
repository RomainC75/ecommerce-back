const router = require('express').Router()
const Product = require('../models/Product.model')
const {categoriesTranslator} = require('../config/catTranslator')
const util = require('util')

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
    console.log('==>page : ',req.query)
    const PAGE_SIZE=20
    const page = parseInt(req.query.page || "0")
    
    try {
        console.log("=================================")
        console.log("=================================")
        console.log("=================================")
        console.log("=================================")
        console.log('-->',req.params.category)
        console.log('==>',categoriesTranslator)
        const translateLine = categoriesTranslator.find(bothT=>bothT[1]===req.params.category)

        const subCategories = [...new Set((await Product.find({categories:{$in:[translateLine[0]]}})).map(prod=>prod.categories.filter((subCat,i)=>i===1)).flat())]
        console.log('SUBCategories : ',subCategories)

        const rq= Object.keys(req.query).includes('subCat') ? {
            $and:[
                {price:{$gt:parseInt(req.query.minPrice)}},
                {price:{$lt:parseInt(req.query.maxPrice)}},
                {categories:
                    req.query.subCat==="All" ? {$in:[translateLine[0]]} : {$in:[req.query.subCat]}
                },
            ]
            }:{categories:{$in:[translateLine[0]]}}

        console.log('RQ : ', JSON.stringify(rq))
        
        const maxPrice = await Product.find(rq).sort({price:-1}).limit(1)
        console.log("maxPrice : ", maxPrice[0].price)

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
            subCategories,
            maxPrice
        })
    } catch (error) {
        next(error)
    }
})

router.get("/promo", async(req,res,next)=>{
    console.log('===>PROMO ! ')
    const PAGE_SIZE=12
    const page = parseInt(req.query.page || "1")
    try {
        // const total = await Product.countDocuments({promo:{$exists:true}})
        const total = await Product.countDocuments({promo:{$exists:true}})
        const ans = await Product.find({promo:{$exists:true}})
            .limit(PAGE_SIZE)
            .skip(PAGE_SIZE*(page-1))
        if(ans.length===0){
            res.status(404).json({message:"category not found"})
            return
        }
        console.log("***TOTAL*** : ",total,ans.length)
        console.log('result :',ans.map(prod=>prod.name),'total results',total,' || page',page,' || totalPages',Math.ceil(total/PAGE_SIZE))
        res.status(200).json({
            data:ans,
            page:page,
            total,
            totalPages:Math.ceil(total/PAGE_SIZE)
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

// { categories: { '$in': [ 'Epicerie salée' ] } }

// {
//     '$and': [
//       { price: {$gt:0}},
//       { price: {$lt:33} },
//       { categories: {$in:["Riz bio"]} }
//     ]
//   }

module.exports = router