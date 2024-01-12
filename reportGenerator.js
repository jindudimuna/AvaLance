const path = require('path');
const fs = require('fs');
const accessibilityAnalyser = require('./accessibilityAnalyser2');
const actions = require("./index");

(async function main() {
    await accessibilityAnalyser.initBrowser()

    const outputFolder = './output';
    
    if (!fs.existsSync(outputFolder)) {
        console.log(`The specified output folder '${outputFolder}' does not exist.`);
        return [];
    }
    
    // Read the contents of the output folder
    const items = fs.readdirSync(outputFolder);
    
    // Filter out only folders from the list of items
    const folderNames = items.filter(item => fs.statSync(path.join(outputFolder, item)).isDirectory());
    

    for(let folder of folderNames) {
        const outputPath = path.join("./output/", folder, "output.html");
        const reportPath = path.join("./output/", folder, "report.json");
        console.log(outputPath)
        if(fs.existsSync(reportPath)) {
            continue;
        }

        let evaluation;
        
        try {
            evaluation = await accessibilityAnalyser.analyzeFile(outputPath);
        } catch(e) {
            evaluation = {
                error: e
            }
        }
        
        actions.saveReport("./output/" + folder, evaluation);

        console.log(folder);
    }


    await accessibilityAnalyser.closeBrowser();
})()
