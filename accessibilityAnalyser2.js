const { AxePuppeteer }  = require('@axe-core/puppeteer');
const puppeteer = require('puppeteer');
const path = require('path');

let browser = null;

function delay(delayInms) {
    return new Promise(resolve => setTimeout(resolve, delayInms));
}

async function initBrowser() {
    browser = await puppeteer.launch({
        headless: false,
        ignoreHTTPSErrors: true,
        acceptInsecureCerts: true,
        
        /*
        args: [
            '--single-process',
            '--no-sandbox',
            '--no-zygote',
            '--disable-gpu',
            '--ignore-certificate-errors',
            '--allow-running-insecure-content',
            '--disable-web-security',
            '--mute-audio',
        ]*/
    });
    return browser;
}

async function analyzeFile(filePath) {

    if(browser === null) {
        await initBrowser();
    }

    const absolutePath = path.resolve(filePath);
    const page = await browser.newPage();

    try {

   
    await page.goto(`file://${absolutePath}`, {waitUntil: "networkidle2", timeout: 180000});
    await delay(1000);
    const results = await new AxePuppeteer(page).analyze();
 

    /*
    const axeBuilder = await loadPage(
        browser,
        `file://${absolutePath}`
    );

    await delay(1000);

    const results = await axeBuilder.analyze();*/
    
    
    await page.close();

    return results;
    } catch(e) {
        await page.close()
        throw e
    }
};

async function closeBrowser() {
    if(browser === null) {
        return;
    }
    await browser.close();
}

module.exports = {
    initBrowser,
    analyzeFile,
    closeBrowser
};