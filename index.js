const puppeteer = require('puppeteer')
const url = 'https://www.markastok.com/navigli-erkek-saat-nvg2581-e-k01-bordo'
const productNames = []
const productPrices = []
const productCodes = []
const productAvailabilities = []

async function start(){
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.goto(url)
    
    const productName = await page.evaluate(()=>{
        const fullText = document.querySelector(".product-name")
        return fullText.textContent.slice(fullText.firstElementChild.textContent.length,).replace(/^\s\n|\n$/g,"")
    })
    productNames.push(productName)

    const productPrice = await page.evaluate(() =>{
        return document.querySelector(".product-price").textContent.trim()
    })
    productPrices.push(productPrice)

    /*const productCode = await page.evaluate(()=>{
        return document.querySelector(".product-feature-content :nth-child(1)").nextElementSibling.nextSibling.textContent.trim()
    })
    productCodes.push(productCode)*/

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

    console.log(productNames,productCodes,productPrices,productAvailabilities)
    
    await browser.close()
}


start()