require('../db/index')
const Product = require('../models/Product.model')

const productList = require('./fullData.1000.json')

const extractWeight= (fullName)=>{
    const res=fullName.match(/(\d*)(g|kg|cl|ml|l)$/)
    return {
        quantity:parseInt(res[1]),
        unity:res[2]
    }
}


const seed = () =>{
    return new Promise ( async (resolve, reject)=>{
        try{
            const delAns = await Product.deleteMany()
            const ans = await Promise.allSettled(productList
                .filter(rawSetteldResp=>rawSetteldResp.status==='fulfilled')
                .map(async(rawSetteldResp)=>{
                    const rawProduct=rawSetteldResp.value
                    let weight=extractWeight(rawProduct.name)
                    const newObject = {
                        brand:rawProduct.brand,
                        name:rawProduct.name,
                        price:parseFloat(rawProduct.price),
                        stockQuantity:Math.floor(Math.random()*30)+10,
                        pictures:rawProduct.images.length>0 ? rawProduct.images : [rawProduct.image],
                        caracteristics:rawProduct.caracteristics2 ? rawProduct.caracterisctics.concat(rawProduct.caracteristics2) : rawProduct.caracterisctics,
                        categories:rawProduct.categories,
                        weight
                    }
                    return await Product.create(newObject)
                }))
            console.log('answer : ',ans)
            resolve()
        }catch(e){
            reject(e)
        }
    })
}

seed().then(x=>console.log('------>DONE !'))