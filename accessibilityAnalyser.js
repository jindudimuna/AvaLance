const { loadPage } = require('@axe-core/puppeteer');
const puppeteer = require('puppeteer');
const path = require('path');

let browser = null;

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

    const axeBuilder = await loadPage(
        browser,
        `file://${absolutePath}`
    );

    const results = await axeBuilder.analyze();
    
    return results;
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