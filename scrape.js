const puppeteer = require('puppeteer')
const bluebird = require('bluebird')
const {google} = require('googleapis')
const keys = require('./credentials.json')

const client = new google.auth.JWT(
    keys.client_email,
    null,
    keys.private_key,
    ["https://www.googleapis.com/auth/spreadsheets"]
)
const gsapi = google.sheets({version: 'v4', auth: client})
gsFirstRow()

/*
const base_url = 'https://markastok.com'
const new_url = ['/marcomen-hakiki-deri-gunluk-spor-erkek-ayakkabi-15215152-siyah','/','/kadin','/mavi/','/lela-kare-yaka-kalin-askili-crop-bayan-atlet-6071482-siyah','/lumberjack-cirtli-sneaker-kiz-cocuk-ayakkabi-elf-2fx-pembe','/us-polo-assn-gunluk-spor-bayan-ayakkabi-fox-2fx-gri-gelincik']
*/
const productArray = [{url:'URL',name:'Product Name',availability:'Availability',price:'Price',offer:'Offer',salePrice:'Sale Price'}]

async function start(urlList){
const withBrowser = async (fn) => {
	const browser = await puppeteer.launch({headless: true});
	try {
		return await fn(browser);
	} finally {
		await browser.close();
	}
}

const withPage = (browser) => async (fn) => {
	const page = await browser.newPage();
	try {
		return await fn(page);
	} finally {
		await page.close();
	}
}

const results = await withBrowser(async (browser) => {
    return bluebird.map(urlList, async (url) => {
        return withPage(browser)(async (page) => {

            await page.setDefaultNavigationTimeout(0)
            await page.goto(url)
           
            const el = await page.$(".product-name") || ""   
            const stock = await page.$(".fl.productFunction2") || ""

            if(el != "" && stock == ""){
                const x = await scrapeMetrics(page,'https://'+base_url+ url)
                await gsapi.spreadsheets.values.append({
                    spreadsheetId: '1yLfWcf6T9m-2uWY3DHdnBUA3OJQaFjyAGpGSj-tlqXI',
                    range: `Sayfa1!A:B`,
                    valueInputOption: 'USER_ENTERED',
                    resource: {
                        values: [
                            [x.url,x.name,x.availability,x.price,x.offer,x.salePrice]
                        ]
                    }
                })
                console.log("scrape is worked")                
            }
            else console.log("SCRAPE DIDNT WORK")
        })
        
    },{concurrency: 4})
    
}) 
    console.log(productArray)   
}

async function scrapeMetrics(page,url){
    const productObject = {}
    productObject.url = url
    // Product Name
    const productName = await page.evaluate(()=>{
        const fullText = document.querySelector(".product-name")
        return fullText.textContent.slice(fullText.firstElementChild.textContent.length,).replace(/^\s\n|\n$/g,"")
    })
    //productNames.push(productName)
    productObject.name = productName
    // Product Price
    const productPrice = await page.evaluate(() =>{
        return document.querySelector(".product-price").textContent.trim()
    })
    //productPrices.push(productPrice)
    productObject.price = productPrice

    /*const productCode = await page.evaluate(()=>{
        return document.querySelector(".product-feature-content :nth-child(1)").nextElementSibling.nextSibling.textContent.trim()
    })
    productCodes.push(productCode)*/

    // Product Availability
    const productAvailability = await page.evaluate(() => {
        const allSizes = document.querySelectorAll('.col.box-border')
        let activeSizes = 0
        allSizes.forEach(size => {
            if (!size.classList.contains("passive"))
                activeSizes++
        })
        const availability = (activeSizes/allSizes.length * 100).toFixed(2)
        return availability.toString().replace('.',',') + '%'
    })
    //productAvailabilities.push(productAvailability)
    productObject.availability = productAvailability

    // Product Offer
    const productOffer = await page.evaluate(() => {
        const offer = document.querySelector('.campaign-symbol')
        if(offer == null){
            return 0;
        }
        else{
            return offer.innerText.match(/\d+/)[0]
        }
    })
    //productOffers.push(`%${productOffer}`)
    productObject.offer = productOffer

    // Product Sale Price
    const productSalePrice = parseFloat(productPrice.replace(",",".")) - ((parseFloat(productPrice.replace(",",".")) * productOffer) / 100)
    strSalePrice = `${productSalePrice.toFixed(2).replace(".",",")}`
    //productSalePrices.push(strSalePrice)
    productObject.salePrice = strSalePrice

    productArray.push(productObject)
    return productObject
}

async function gsFirstRow(){
        await gsapi.spreadsheets.values.append({
            spreadsheetId: '1yLfWcf6T9m-2uWY3DHdnBUA3OJQaFjyAGpGSj-tlqXI',
            range: `Sayfa1!A1`,
            valueInputOption: 'USER_ENTERED',
            resource: {
                values: [
                    ["URL","Product Name","Availability","Price","Offer","Sale Price"]
                ]
            }
        })
}


module.exports = {
start
}


