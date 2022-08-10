const { off } = require('process')
const puppeteer = require('puppeteer')
const reader = require('xlsx')
const root_url = 'https://markastok.com'

const file = reader.readFile('urls.xlsx')
let data = []
const sheets = file.SheetNames
const temp = reader.utils.sheet_to_json(file.Sheets[sheets[0]])
temp.forEach(x => data.push(x))

const productNames = []
const productPrices = []
const productCodes = []
const productAvailabilities = []
const productOffers = []
const productSalePrices = []


async function step1(){
    const browser = await puppeteer.launch({
        headless: true,
    })
    const page = await browser.newPage()

    await page.setRequestInterception(true)
    page.on('request', (request) => {
    if (request.resourceType() === 'image') request.abort()
    else request.continue()
})
    for(let i=0;i<30;i++){
    await page.goto(root_url + data[i].url,{ waitUntil: 'domcontentloaded' })
    
    
    const el = await page.$(".product-name") || ""
   
    const stock = await page.$(".fl.productFunction2") || ""
    /*const name = await page.evaluate(() => {
        return document.querySelector(".product-name")
    })*/

    /*const stock = await page.evaluate(() => {
        return document.querySelector(".fl.productFunction2")
    })*/

    if(el != "" && stock == "")
        await scrapeMetrics(page)
    }

    console.log(productNames,productPrices,productAvailabilities,productOffers,productSalePrices)
    await browser.close()
}


async function scrapeMetrics(page){
    // Product Name
    const productName = await page.evaluate(()=>{
        const fullText = document.querySelector(".product-name")
        return fullText.textContent.slice(fullText.firstElementChild.textContent.length,).replace(/^\s\n|\n$/g,"")
    })
    productNames.push(productName)
    
    
    // Product Price
    const productPrice = await page.evaluate(() =>{
        return document.querySelector(".product-price").textContent.trim()
    })
    productPrices.push(productPrice)

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
        return `${availability}%`
    })
    productAvailabilities.push(productAvailability)

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
    productOffers.push(`%${productOffer}`)

    // Product Sale Price
    const productSalePrice = parseFloat(productPrice.replace(",",".")) - ((parseFloat(productPrice.replace(",",".")) * productOffer) / 100)
    strSalePrice = `${productSalePrice.toFixed(2).replace(".",",")}`
    productSalePrices.push(strSalePrice)
}

step1()