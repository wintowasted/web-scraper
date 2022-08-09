const { off } = require('process')
const puppeteer = require('puppeteer')
const url = 'https://www.markastok.com/tommy-hilfiger-espadril-bayan-ayakkabi-fw0fw06497-ybi-beyaz'
const productNames = []
const productPrices = []
const productCodes = []
const productAvailabilities = []
const productOffers = []
const productSalePrices = []

async function start(){
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.goto(url)
    
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
        return document.querySelector('.campaign-symbol').innerText.match(/\d+/)[0]
    })
    productOffers.push(`%${productOffer}`)

    // Product Sale Price
    const productSalePrice = parseFloat(productPrice.replace(",",".")) - ((parseFloat(productPrice.replace(",",".")) * productOffer) / 100)
    strSalePrice = `${productSalePrice.toFixed(2).replace(".",",")}`
    productSalePrices.push(strSalePrice)

    console.log(productNames,productPrices,productAvailabilities,productOffers,productSalePrices)
    await browser.close()
}


start()