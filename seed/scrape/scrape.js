// brand
//     name
//     price
//     priceType
//     stockQuantity
//     pictures
//     caracteristics
//     categories
//     subCategory
//     originCountry
//     weight

const puppeteer = require('puppeteer')
const dataJSON = require('./data.json')
const fs = require('fs')
const { resolve } = require('path')
const { clickCookiesButton } = require('./tools')
const {Cluster} = require('puppeteer-cluster')

const site_url="https://www.greenweez.com/p-tits-dessous-lot-de-300-voiles-de-protection-jetables-couches-lavables-13x30-p126516?objectID=126516_0_3930_8376&queryID=221b1682713cee02fc49590abd186921"



const scrapeProduct = (page, url) =>{
    return new Promise( async(resolve, reject)=>{
        try {
            await page.goto(url, {waitUntil:"networkidle2"})
            
            console.log('click cookies button')
            await page.waitForSelector('#onetrust-accept-btn-handler')
            const buttons = await page.$x("//button[contains(., 'Tout accepter')]");
            //   console.log(buttons)
            if (buttons[1]) {
                await buttons[1].click();
              }

            console.log('-->getting data ...')
            const data = await page.evaluate(()=>{
                const catEl = Array.from(document.querySelectorAll('#fil_ariane li a'))
                const categories = catEl.map(categorie=>categorie.textContent.replace(/[\n\t]/gm,'')).filter(category=>category!=="Accueil")
                console.log('categories', categories)

                const brand = document.querySelector('aside > div > div > div > a').textContent
                console.log('brand :',brand)
                const name = document.querySelector('aside > div > div h1').textContent.replace(/[\n\t]/gm,'')
                console.log('name : ',name)
                const price=document.querySelector('#fp_col_price span').textContent.replace(/[€\s]/gm,'').replace(',','.')
                console.log('price : ',parseFloat(price))

                const image = document.querySelector('#mirakl-main-slider img').getAttribute('src')
                console.log('image : ',image)

                const images = Array.from(document.querySelectorAll('.lp_miniatures a')).map(el=>el.getAttribute('data-img-small')).map(addr=>addr.replace('/50/','/600/'))
                console.log('images : ',images)
                
                const description = document.querySelector('#product_description').textContent
                console.log('description : ',description)

                const caracteristics = document.querySelector('.caracteristiques_fp')
                console.log('caracteristics',caracteristics)
                const caracP = Array.from(caracteristics.querySelectorAll('p')).map(p=>p.textContent)
                console.log('-------------------------')
                console.log('CARACP',caracP)

                const caracteristics2=document.querySelector('.caracteristiques_fp').textContent
                // const caracteristics2=Array.from(document.querySelectorAll('.caracteristiques_fp > *')).map(el=>el.textContent)

                return {
                    categories,
                    brand,
                    name,
                    price,
                    image,
                    images,
                    description,
                    caracterisctics:caracP,
                    caracteristics2
                }
            })
            console.log('-->DATA : ',data)
            resolve(data)

        } catch (error) {
            console.log('-->ERROR  : ',error)
            
        }
    } )
} 

const getCategoriesUrl = () =>{
    const url = "https://www.greenweez.com/"
    return new Promise ( async (resolve, reject)=>{
        try {
            console.log('-->gettingcategories url')
            const browser = await puppeteer.launch({
                headless:false,
                slowmo:300,
                devtools:true
            })
            const page = await browser.newPage()
            await page.setViewport({
                width:1200,
                height:900
            })
            await page.goto(url, {waitUntil:"networkidle2"})
            console.log('click cookies button')

            await page.waitForSelector('#onetrust-accept-btn-handler')
            const buttons = await page.$x("//button[contains(., 'Tout accepter')]");
            //   console.log(buttons)
            if (buttons[1]) {
                await buttons[1].click();
              }
            const categories = await page.evaluate(()=>{
                return Array.from(document.querySelectorAll('.cat_level_2 a')).map(elA=>elA.getAttribute('href'))
            })
            console.log('---->got categories url')
            await browser.close()
            resolve(categories)
        } catch (error) {
            reject(error)
        }
    })
}



const getProductsUrlFromCatPage = (page, url) =>{
    return new Promise( async (resolve,reject)=>{
        try {
            const fullAddress = "https://www.greenweez.com/"+url
            console.log('full address : ',fullAddress)
            await page.goto(fullAddress,{waitUntil:"networkidle2"})
            
            clickCookiesButton(page)
            await page.waitForSelector('#result-page__hits li')
            const productList = await page.evaluate(()=>{
                const lis = Array.from(document.querySelectorAll('#result-page__hits li'))
                console.log('-->lis',lis)
                const as = lis.map(li=>li.querySelector('a').getAttribute('href'))
                console.log('as',as)
                return as
            })
            console.log('productList : ',productList)
            await page.close()
            resolve(productList)
        } catch (error) {
            reject(error)
        }
    })
}

const test = (page,url) =>{
    return new Promise(async (resolve, reject)=>{
        try {
            console.log('-->',url)
            page.on('console', msg => console.log(msg.text()));
            await page.goto('http://www.google.fr',{waitUntil:'networkidle2'})
            const res = await page.evaluate(()=>{
                const h1 = document.querySelector('h1')
                console.log("h1",h1)
            })
            resolve('hey',res)
        } catch (error) {
            reject(error)
        }
    })
}

const getTheProductsUrlWithClusters = (categoriesArray) =>{
    return new Promise(async (resolve,reject)=>{
        try {
            console.log('categoriesArray',categoriesArray)
            const cluster = await Cluster.launch({ 
                concurrency: Cluster.CONCURRENCY_PAGE, 
                maxConcurrency: 3, 
                monitor: false, 
                timeout:10000, 
                puppeteerOptions: { 
                   headless: false, 
                   slowMo: 250, 
                   args: [`--window-size=${1680},${970}`,'--disable-dev-shm-usage'], 
                }, 
            });
            cluster.on('taskerror', (err, data, willRetry) => {
                if (willRetry) {
                  console.warn(`Encountered an error while crawling ${data}. ${err.message}\nThis job will be retried`);
                } else {
                  console.error(`Failed to crawl ${data}: ${err.message}`);
                }
            });
            await cluster.task(async ({ page, data: url }) => {
                console.log('task')
                // const productsUrl = await getProductsUrlFromCatPage(page,url)
                const productsUrl=await getProductsUrlFromCatPage(page,url)
                return productsUrl;
            });

            const infos = await Promise.all(Array.from(categoriesArray).map(categoryAddr=>{
                console.log('categoryAddrr :',categoryAddr)
                return cluster.execute(categoryAddr);
            }))
            await cluster.idle();
            await cluster.close();
            
            resolve(infos)
        } catch (error) {
            reject('--->',error)
        }
    }) 
}


const scrapeSite = () =>{
    return new Promise(async (resolve, reject)=>{
        try {
            const categoriesUrl = await getCategoriesUrl()
            console.log('XXXXX got : ',categoriesUrl)
            const productsUrl = await getTheProductsUrlWithClusters(categoriesUrl)
            console.log('productsUrl',productsUrl)
            resolve('x')
        } catch (error) {
            reject(error)
        }
    })
}

scrapeSite().then(data=>console.log('data')).catch(err=>console.log('err : ',err))

// scrapePage(site_url).then(
//   (result) => {
//     dataJSON.push(result);
//     fs.writeFile(
//       "data.json",
//       JSON.stringify(dataJSON),
//       "utf8",
//       function (err) {
//         if (err) {
//           console.log("An error occured while writing JSON Object to File.");
//           return console.log(err);
//         }
//         console.log("JSON file has been saved.");
//       }
//     );
//   }
// );
