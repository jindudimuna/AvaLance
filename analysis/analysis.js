const data = require("./zipAnalyis");

const zipFolderPath = "./analysis/zipfiles";

const fs = require("fs").promises;
const csvWriter = require("fs");
const path = require("path");
const oldImpact = [];
const newImpact = [];
/**
 * the getFilesInFolder function looks into a given filepath and returns an object of the files in that directory
 *
 *
 */

async function getFilesInFolder(zipFolderPath) {
  try {
    const files = await fs.readdir(zipFolderPath);

    const fullPaths = files.map((file) => path.join(zipFolderPath, file));

    return { zipFolderPath, files: fullPaths };
  } catch (err) {
    throw new Error(`Error reading folder: ${err.message}`);
  }
}

let result;

//this function gets the files returned above and then uses it to call the navigatezip function
(async () => {
  try {
    result = await getFilesInFolder(zipFolderPath);

    console.log(result);
    console.log("Folder path:", result.zipFolderPath);
    console.log("Files in the folder with full paths:");

    // csvWriter.appendFileSync("./analysis/report.csv", `Website, Error ID,Impact,Impact Score,Report Type`);
    const status = hasCsvHeader("./analysis/report.csv", `Website, Error ID,Impact,Impact Score,Report Type`);

    if (!status) {
      csvWriter.appendFileSync("./analysis/report.csv", `Website, Error ID,Impact,Impact Score,Report Type`);
    }

    const avgStatus = hasCsvHeader("./analysis/averages.csv", `Website, Report Type, Average`);
    if (!avgStatus) {
      csvWriter.appendFileSync("./analysis/averages.csv", `Website, Report Type, Average`);
    }
    // console.log(...result.files);

    // result.files.forEach((filePath) => {
    //   data.navigateZip(filePath, analysis);

    //   // .then((response) => {});
    // });

    data.navigateZip(...result.files, analysis);
  } catch (error) {
    console.error(error.message);
  }
})();

function hasCsvHeader(filePath, expectedHeader) {
  try {
    // Read the contents of the CSV file
    const fileContent = fs.readFileSync(filePath, "utf8");

    // Split the file content into lines
    const lines = fileContent.split("\n");

    // Check if the first line (header) matches the expected header
    const actualHeader = lines[0].trim();
    return actualHeader === expectedHeader;
  } catch (error) {
    console.error("Error reading the CSV file:", error.message);
    return false;
  }
}

async function analysis(report, is_new) {
  /**This function checks for the severity of each violation, and adds a score to it.
   * We use this score to calculate the average severity of violatons found on a page.
   * we acheive this using the following steps
   * Go into the report for a website,
   * check if its an old report or new one,
   * if old set is_new to false, if new set is_new to true
   * go into the violations array,
   * count the number of violations
   * loop over each node, select the id, the impact, the html.
   */

  // console.log("hello");
  let nodesArray;

  const reportData = report;

  function getWebHost(url) {
    if (url.startsWith("file:///")) {
      const urlWithoutFilePrefix = url.substring(8); //remove unwanted characters
      const parts = urlWithoutFilePrefix.split("/"); //create an array seperated by the /
      return parts[parts.length - 2]; //select the second to the last element
    } else {
      const parts = new URL(url);
      return parts.hostname;
    }
  }

  if (is_new) {
    const Webname = getWebHost(reportData.url);

    nodesArray = reportData.violations.flatMap((error) => {
      const errorId = error.id;
      return error.nodes.map((node) => {
        return {
          webpage: Webname,
          id: errorId,
          impact: node.impact,
          html: node.html,
          reportType: "New Report",
        };
      });
    });
  } else {
    const Webname = getWebHost(reportData.url);
    nodesArray = reportData.accessibility.violations.flatMap((error) => {
      const errorId = error.id;
      return error.nodes.map((node) => {
        return {
          webpage: Webname,
          id: errorId,
          impact: node.impact,
          html: node.html,
          reportType: "Old Report",
        };
      });
    });
  }

  const oldReportImpactScores = [];
  const newReportImpactScores = [];
  /*
      * run another loop to check the impact in each node, if the impact is 'critical' create an impact score property and set it to 4
      if the impact is 'serious' set the impact score property to 3, if the impact is 'moderate' set the impact score property to 2,
      and if the impact is minor set the impact property to 1.
      * 
      */

  for (let node of nodesArray) {
    if (node.impact === "critical") {
      node.impactScore = 4;
    } else if (node.impact === "serious") {
      node.impactScore = 3;
    } else if (node.impact === "moderate") {
      node.impactScore = 2;
    } else if (node.impact === "minor") {
      node.impactScore = 1;
    } else {
      node.impactScore = 0;
    }

    // Check the reportType property of the node and add the impactScore to the corresponding array
    if (node.reportType === "Old Report") {
      oldImpact.push(node.impactScore);
    } else if (node.reportType === "New Report") {
      newImpact.push(node.impactScore);
    }
  }

  // console.log([...oldImpact, ...newImpact].length);

  // Group nodesArray by webpage
  const groupedByWebpage = nodesArray.reduce((acc, node) => {
    const key = `${node.webpage}-${node.reportType}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(node);
    return acc;
  }, {});

  // Calculate average impact score for each webpage
  const averages = Object.entries(groupedByWebpage).map(([key, nodes]) => {
    const [webpage, reportType] = key.split("-");
    const totalScore = nodes.reduce((sum, node) => sum + node.impactScore, 0);
    const averageScore = (totalScore / nodes.length).toFixed(2);
    return { webpage, reportType, averageScore };
  });

  // Convert averages to CSV string
  const avgCsv = averages.map((entry) => `${entry.webpage},${entry.reportType},${entry.averageScore}`).join("\n");

  // Append data to the file
  csvWriter.appendFileSync("./analysis/averages.csv", `\n ${avgCsv}`);

  console.log('CSV file "averages.csv" written successfully.');

  // console.log(nodesArray);
  // console.log(`number of errors on this page :  ${nodesArray.length}`);
  const csvData = nodesArray.map((node) => ` ${node.webpage},${node.id},${node.impact},${node.impactScore}, ${node.reportType}`).join("\n");

  // Write CSV string to a file
  csvWriter.appendFileSync("./analysis/report.csv", `\n ${csvData}`);

  console.log(`CSV file 'report.csv' written successfully.`);
}

// analysis of variants, graph the mean and SD of the severity per website.
