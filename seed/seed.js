require('../db/index')
const Product = require('../models/Product.model')

const productList = require('./products.json')

const seed = () =>{
    return new Promise ( async (resolve, reject)=>{
        try{
            const delAns = await Product.deleteMany()
            
            const ans = await Product.create(productList)
            console.log('answer : ',ans)


            resolve()
        }catch(e){
            reject(e)
        }
    })
}

seed().then(x=>console.log('------>DONE !'))