const SQLiteClass=require('./test/SQLiteClass')
const sqlite= new SQLiteClass('mining.sqlite')
require('../db/index')
const Product = require('../models/Product.model')

const extractWeight= (fullName)=>{
    const xMatch = fullName.match(/(\d+)\s*x\s*(\d+)\s*(g|kg|cl|ml|l|m²)/i) 
    if(xMatch){        
        return {
            quantity:parseInt(parseInt(xMatch[1])*parseInt(xMatch[2])),
            unity:xMatch[3]
        }
    }
    const res=fullName.match(/(\d*)\s*(g|kg|cl|ml|l|m²)$/)
    console.log("\n===>RES",res)
    return {
        quantity:parseInt(res[1]),
        unity:res[2]
    }
}

const getDBObjects = ()=>{
    return new Promise (async(resolve, reject)=>{
        try {
            const res = await sqlite.all('SELECT * FROM rawData')
            resolve(res.map(obj=>JSON.parse(obj.data)))
        } catch (error) {
            reject(error)
        }
    })
}

const handleProduct = (rawProd) =>{
    return {
        brand:rawProd.brand,
        name:rawProd.name,
        price: parseFloat(rawProd.price) ? parseFloat(rawProd.price) : 'Indisponible',
        stockQuantity:Math.floor(Math.random()*30)+10,
        pictures:rawProd.images.length>0 ? rawProd.images : [rawProd.image],
        caracteristics:rawProd.caracteristics2 ? rawProd.caracterisctics.concat(rawProd.caracteristics2) : rawProd.caracterisctics,
        categories:rawProd.categories,
        weight:extractWeight(rawProd.name)
    }
}

const feedWithProducts = () =>{
    return new Promise ( async (resolve, reject)=>{
        try {
            const delAns = await Product.deleteMany()
            const productsToHandle = await getDBObjects()
            await Promise.all( productsToHandle.filter((prod,i)=>i<=12626).map(async (objProd)=>{
                const isPromo = Math.random()>0.95
                try {
                    const readyProd=handleProduct(objProd)
                    if(isPromo){
                        readyProd.promo=Math.ceil(Math.random()*40)+10
                    }
                    console.log("===>ready Product : ", readyProd)
                    const ans = await Product.create(readyProd)
                    if (ans) resolve(true)
                    resolve(false)
                } catch (error) {
                    console.log("ERROR : ",error)
                    resolve(false)
                }
            }))
            //console.log( Array.from(new Set(productsToHandle.map(prod=>prod.name))).length)
        } catch (error) {
            reject(error)
        }
    })
}


const feedAll = async ()=>{
    await feedWithProducts()
    console.log("FINISHED ! ")
}

feedAll()
