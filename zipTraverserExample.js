const zipTraverser = require('./zipTraverser.js');

(async function main() {
    
    function whatToDoPerPage(domain, url, html, report) {
        //console.log(html);
        //console.log(report);

        console.log(domain);
        console.log(url);
    }

    await zipTraverser.navigateZip('./assets/example.zip', whatToDoPerPage);
})();