const StreamZip = require('node-stream-zip');

async function navigateZip(zipFilePath, pagefunction) {
    const zip = new StreamZip.async({ file: zipFilePath });
    
    let entries = await zip.entries();
    entries = Object.values(entries);
    entries = entries.filter(entry => entry.isDirectory === false && entry.name.startsWith('data') && entry.name.endsWith(".jsonld"));
    entries = entries.map(entry => {
        const splitted = entry.name.split('.');
        splitted.pop();
        return splitted.join('.');
    });

    for(const entry of entries) {

        let splitBySlash = entry.split('/');
        let domain = splitBySlash[1];
        let url = splitBySlash[2];
        
        let report;
        try {
        report = await zip.entryData(entry + '.jsonld');
        report = JSON.parse(report.toString('utf8'));
        } catch(e) {
            console.log(e)
            console
        }


        let html
        try {
            html = await zip.entryData(entry + '.html');
            html = html.toString('utf8');
        } catch(e) {
            console.log(e)
            continue
        }

    
        await pagefunction(domain, url, html, report);
    }
    await zip.close();
}

module.exports = {
    navigateZip
}
