const zipTraverser = require('./zipTraverser.js');

(async function main() {
    
    function whatToDoPerPage(html, report) {
        console.log(html);
        console.log(report.accessibility.violations);
    }

    await zipTraverser.navigateZip('./assets/example.zip', whatToDoPerPage);
})();