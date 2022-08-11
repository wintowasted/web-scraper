const scrape = require('./scrape.js')
const cheerio = require('cheerio');
const request = require('request');
const fs = require('fs');
const { start } = require('repl');
const { reject } = require('bluebird');

const crawledPages = [];
let foundPages = [];
let index = 0;

const domain = "markastok.com";

crawl = async () => {
	

	// if it's the first start
    if (index === 0) {
        // use / as first page.
        foundPages.push(domain + '/');
    }

    const pageToCrawl = foundPages[index];	

    const finish = new Promise(resolve =>{

        resolve()
    })
    
    // exit the process if both arrays are the same or the next page is not defined
    if (foundPages === crawledPages || !pageToCrawl) {
        // stop
        
        finish.then(await scrape.start(foundPages))
        process.exit()
        
    }
    

    // if pageToCrawl is not yet in list of crawledPages
    if (crawledPages.indexOf(pageToCrawl) === -1) {
        if (pageToCrawl) {
            new Promise(resolve => {
            	// visit the page
            	visitPage(pageToCrawl, resolve);
            }).then(function() {
                index++;
                crawl();
            });
        } else {
             process.nextTick(crawl);
        }
    } else {
        // go to next crawl
         process.nextTick(crawl);
    }
   
}

visitPage =  (url, callback) => {
    process.stdout.write(crawledPages.length + '/' + foundPages.length + '\n');
	 // Make the request
    request('https://' + url, async function(error, response, body) {
        // Check status code (200 is HTTP OK)
        if (!response || response.statusCode !== 200) {
            process.nextTick(callback);
            return;
        }

        // Add URL to crawled Pages
        crawledPages.push(url);

        // Parse the document body
        const $ = cheerio.load(body);
        
        // collect all links
        collectInternalLinks($, domain, foundPages).then(
            (newFoundPages) => {
                foundPages = newFoundPages;
                callback();
        });
    });
}	

collectInternalLinks =  ($, domain, foundPages) => {
    return new Promise(resolve => {
        
        const elements = "a[href^='http://" + domain + "']:not(a[href^='mailto']), " +
            "a[href^='https://" + domain + "']:not(a[href^='mailto']), " +
            "a[href^='https://www." + domain + "']:not(a[href^='mailto']), " +
            "a[href^='http://www." + domain + "']:not(a[href^='mailto']), " +
            "a[href^='/']:not(a[href^='mailto'])";

        const relativeLinks = $(elements);

        relativeLinks.each(function(i, e) {

            let href = $(this).attr('href');

            if (href.indexOf('www.') !== -1) {
                href = href.substr(href.indexOf('www.') + 4, href.length);
            }
            if (href.indexOf('http') === 0) {
                href = href.substr(href.indexOf('://') + 3, href.length);
            } else if (href.indexOf('/') === 0) {
                href = domain + href;
            }
            
            // only add the href to the foundPages if it's not there yet.
            if (foundPages.indexOf(href) === -1) {
                    console.log(href)
                    foundPages.push(href)
            }        
        })          
    resolve(foundPages);
})
}

crawl()