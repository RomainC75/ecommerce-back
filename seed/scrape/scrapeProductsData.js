const puppeteer = require("puppeteer");
const { Cluster } = require("puppeteer-cluster");
const { clickCookiesButton } = require("./tools");
const productsUrls = require("./productUrls.json");
const fs = require('fs')

const getProductInfos = (page, url) => {
  return new Promise(async (resolve, reject) => {
    try {
      await page.goto(url, { waitUntil: "networkidle2" });

      console.log("click cookies button");
      await clickCookiesButton(page);

      console.log("-->getting data ...");
      const data = await page.evaluate(() => {
        const catEl = Array.from(document.querySelectorAll("#fil_ariane li a"));
        const categories = catEl
          .map((categorie) => categorie.textContent.replace(/[\n\t]/gm, ""))
          .filter((category) => category !== "Accueil");
        console.log("categories", categories);

        const brand = document.querySelector(
          "aside > div > div > div > a"
        ).textContent;
        console.log("brand :", brand);
        const name = document
          .querySelector("aside > div > div h1")
          .textContent.replace(/[\n\t]/gm, "");
        console.log("name : ", name);
        const price = document
          .querySelector("#fp_col_price span")
          .textContent.replace(/[€\s]/gm, "")
          .replace(",", ".");
        console.log("price : ", parseFloat(price));

        const image = document
          .querySelector("#mirakl-main-slider img")
          .getAttribute("src");
        console.log("image : ", image);

        const images = Array.from(document.querySelectorAll(".lp_miniatures a"))
          .map((el) => el.getAttribute("data-img-small"))
          .map((addr) => addr.replace("/50/", "/600/"));
        console.log("images : ", images);

        const description = document.querySelector(
          "#product_description"
        ).textContent;
        console.log("description : ", description);

        const caracteristics = document.querySelector(".caracteristiques_fp");
        console.log("caracteristics", caracteristics);
        const caracP = Array.from(caracteristics.querySelectorAll("p")).map(
          (p) => p.textContent
        );
        console.log("-------------------------");
        console.log("CARACP", caracP);

        const caracteristics2 = document.querySelector(
          ".caracteristiques_fp"
        ).textContent;
        // const caracteristics2=Array.from(document.querySelectorAll('.caracteristiques_fp > *')).map(el=>el.textContent)

        return {
          categories,
          brand,
          name,
          price,
          image,
          images,
          description,
          caracterisctics: caracP,
          caracteristics2,
        };
      });
      console.log("-->DATA : ", data);
      resolve(data);
    } catch (error) {
      console.log("-->ERROR  : ", error);
      reject(error);
    }
  });
};

const getTheProductsInfosWithClusters = (productsUrls) => {
  return new Promise(async (resolve, reject) => {
    try {
      const cluster = await Cluster.launch({
        concurrency: Cluster.CONCURRENCY_PAGE,
        maxConcurrency: 3,
        monitor: true,
        timeout: 10000,
        puppeteerOptions: {
          headless: false,
          slowMo: 400,
          args: [`--window-size=${1680},${970}`, "--disable-dev-shm-usage"],
        },
      });
      cluster.on("taskerror", (err, data, willRetry) => {
        if (willRetry) {
          console.warn(
            `Encountered an error while crawling ${data}. ${err.message}\nThis job will be retried`
          );
        } else {
          console.error(`Failed to crawl ${data}: ${err.message}`);
        }
      });
      await cluster.task(async ({ page, data: url }) => {
        console.log("task");
        const productsUrls = await getProductInfos(page, url);
        return productsUrls;
      });

      const infos = await Promise.allSettled(
        Array.from(productsUrls)
          .filter((url, i) => i < 1000)
          .map((productUrl) => {
            console.log("productUrl :", productUrl);
            return cluster.execute(productUrl);
          })
      );
      console.log("==>RESULT : ", infos);
      await cluster.idle();
      await cluster.close();
      console.log("-------FIN-------");

      resolve(infos);
    } catch (error) {
      reject("--->", error);
    }
  });
};

getTheProductsInfosWithClusters(productsUrls)
  .then((data) => {
    fs.writeFile("fullData.json", JSON.stringify(data), "utf8", function (err) {
      if (err) {
        console.log("An error occured while writing JSON Object to File.");
        return console.log(err);
      }
      console.log("JSON file has been saved.");
    });
  })
  .catch((err) => console.log(err));

// const fakeCluster = () =>{
//     return new Promise (async (resolve,reject)=>{
//         try {
//             const browser = await puppeteer.launch({
//                 headless:false,
//                 slowmo:300,
//                 devtools:true
//             })
//             const page = await browser.newPage()
//             await page.setViewport({
//                 width:1200,
//                 height:900
//             })
//             const data = await getProductInfos(page,"https://www.greenweez.com/belledonne-pain-cereales-et-graines-500g-p114390?objectID=114390_0_0_4897")
//             resolve(data)
//         } catch (error) {
//             reject(error)
//         }
//     })
// }

// fakeCluster().then(data=>console.log("data :",data)).catch(err=>console.log("error",error))

exports.getProductInfos=getProductInfos