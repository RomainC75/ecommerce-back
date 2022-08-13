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

const site_url="https://www.greenweez.com/gaia-faux-gras-125g-p77235?objectID=77235_0_0_1107"

const scrapePage = (url) =>{
    return new Promise( async(resolve, reject)=>{
        try {
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

            console.log('-->getting data ...')
            const data = await page.evaluate(()=>{
                const brand = document.querySelector('aside > div > div > div > a').textContent
                console.log('brand :',brand)
                const name = document.querySelector('aside > div > div h1').textContent
                console.log('name : ',name)
                const price=document.querySelector('#fp_col_price span').textContent.replace('€','').replace(',','.')
                console.log('price : ',parseFloat(price))

                const image = document.querySelector('#mirakl-main-slider img').getAttribute('src')
                console.log('image : ',image)

                // const accordion = document.querySelector('#accordion_fp')
                // console.log('collapseOne',collapseOne)

                // const details = accordion.querySelectorAll('.collapse.show')
                // console.log('details : ',details)
                //#product_description
                const description = document.querySelector('#product_description').textContent
                console.log('description : ',description)
                //.caracteristiques_fp  
                    //.sous_titre>Caractéristiques
                const caracteristics = document.querySelector('.caracteristiques_fp')
                console.log('caracteristics',caracteristics)
                const caracP = Array.from(caracteristics.querySelectorAll('p')).map(p=>p.textContent)
                console.log('-------------------------')
                console.log('CARACP',caracP)
            })


        } catch (error) {
            console.log('-->ERROR  : ',error)
            
        }
    } )
} 

scrapePage(site_url)
