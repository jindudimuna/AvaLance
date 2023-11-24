const accessibilityAnalyser = require('./accessibilityAnalyser.js');

(async function main() {

    await accessibilityAnalyser.initBrowser();
    const result = await accessibilityAnalyser.analyzeFile('./assets/source.html');
    console.log(result);
    await accessibilityAnalyser.closeBrowser();
    
})();





