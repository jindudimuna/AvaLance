// @ts-check
"use strict";

const fs = require("fs"); // Import file system module from the standard Node.js library
const jsdom = require("jsdom");
const path = require("path");

// Path to asset directory
const ASSET_DIR_PATH = "./assets";
// Path to output directory
const OUTPUT_DIR_PATH = "./output";
// Path to instructions list JSON file
const INSTRUCTION_LIST_PATH = `${ASSET_DIR_PATH}/instructions.json`;
// Path to source HTML file to be modified
const SOURCE_HTML_PATH = `${ASSET_DIR_PATH}/source.html`;
// Path of output HTML file
const OUTPUT_HTML_PATH = `${OUTPUT_DIR_PATH}/output.html`;

/**
 * This function retrieves the JSON file containing the instructions from the `/assets/instructions.json` path and
 * parses it into a Plain Old JavaScript Object (POJO).
 *
 * In this case, the POJO is an array, as that is the shape of the JSON object.
 *
 * The parsed POJO is returned by this function.
 */
function getInstructionList(folderPath) {
  /*
    We expect a valid JSON string, so we parse the string to a valid JS object.

    If it's not valid or the file is not found, an error will be thrown and the process will exit.
  */

  const instructionFilePath = path.join(folderPath, "instructions.json");
  try {
    const instructionList = JSON.parse(
      // Read the file at the given path and convert the content to its string representation for easy parsing
      fs.readFileSync(instructionFilePath).toString()
    );

    // Uncomment these to log assertions on parsed instruction list
    console.log("(object) Parsed instruction list type => ", typeof instructionList);
    console.log("(true) Is parsed instruction list an array? => ", Array.isArray(instructionList));

    return instructionList;
  } catch (error) {
    console.error("Error retrieving or parsing instruction list:", error);
    process.exit(1); // Exit the process with an error code
  }
}

/**
 * This function retrieves the source HTML to be modified from the `/assets/source.html` path and parses it into
 * a HTML node.
 *
 * The parsed HTML node is returned by this function.
 */

function getSourceHtmlDoc() {
  /*
    Read the HTML file at the given path and convert it to a string.

    If the file is not found, an error will be thrown and the process will exit
  */

  try {
    const rawHtmlString = fs.readFileSync(SOURCE_HTML_PATH).toString();

    //  Uncomment this to log string representaion of HTML file
    console.log(rawHtmlString);

    // Convert HTML string to a HTML element node and return it
    const parsedHtmlNode = new jsdom.JSDOM(rawHtmlString);
    return parsedHtmlNode.window.document.documentElement;
  } catch (error) {
    console.error("Error retrieving or parsing HTML:", error);
    process.exit(1); // Exit the process with an error code
  }
}

/**
 * Given a HTML string, this function converts it into a HTML node.
 *
 * This is used when preparing instructions for application.
 * The new HTML in the instruction needs to be converted to a HTML node to be used in modifying the source node.
 */
function convertStringToHtmlNode(htmlString) {
  // Convert given string to HTML node
  const parsedHtmlNode = new jsdom.JSDOM(htmlString);

  /*
    The parsed HTML node will be a document in this form

    <html>
      <body>
        <converted-html-node></converted-html-node>
      </body>
    </html>

    In order to get the exact converted node matching the string that was provided, the
    first element child of the document body should be taken and returned.
  */
  return parsedHtmlNode.window.document.body.firstElementChild;
}

/**
 * Given a list of instructions and a source HTML node, this function applies
 * the instructions to the given source HTML node.
 *
 * This function assumes that every instruction is to effect a replacement of some
 * content in the given source node with a new content provided in the instruction.
 *
 * The instructions are performed in the order in which they are in the list and they mutate
 * the given source node.
 */
function applyInstructionsToHtmlDoc(instructionList, htmlDoc) {
  //  Uncomment this to log HTML structure before applying instructions
  // console.log(htmlDoc);

  for (const instruction of instructionList) {
    // Iterate over the list of instructions
    // Retrieve the HTML content that has the target node of the instruction in the current iteration
    const targetNode = htmlDoc.querySelector(instruction.target[0]);

    // This conditional prevents the process from error-ing and exiting if the target node is not found
    if (!targetNode) {
      // Remove it, if you want the process to error and exit in such a case
      console.error(`Target node not found for instruction: ${instruction.target[0]}`);
      return;
    }

    // Get the HTML node representation of the new HTML content in the instruction
    const newNode = convertStringToHtmlNode(instruction.newHtml);

    // Replace the current content with the new
    targetNode.replaceWith(newNode);
  }

  //  Uncomment this to log HTML structure after applying instructions
  // console.log(htmlDoc);
}

function insertInstructions(instructionList, cleanedFile) {
  //remove escape strings from the instructions json object.
  const cleanedInstructions = instructionList.map((instruction) => {
    return {
      target: instruction.target,
      html: instruction.html.replace(/\\(.)/g, "$1"),
      fixedHtml: instruction.fixedHtml.replace(/\\(.)/g, "$1"),
      report: instruction.report,
    };
  });
  /**
   * loop over the instructions.json
   * run a search and replace in the cleanedhtml. we want to insert the fixedhtml in place of the html found in the cleanedhtml string
   *
   */

  for (const newInstruction of cleanedInstructions) {
    const insertTargets = cleanedFile.replace(newInstruction.html, newInstruction.fixedHtml);

    if (!insertTargets) {
      // Remove it, if you want the process to error and exit in such a case
      console.error(`Target html not found for instruction: ${newInstruction.html}`);
      return;
    }
  }
}
/**
 * Given a HTML node - which must have been modified with applied instructions -
 * this function saves the HTML node as a HTML file in the output directory.
 */
function saveModifiedHtmlDoc(htmlDoc) {
  /*
    To save a valid HTML file, we need the entire structure of the HTML doc node:

    <html>
      <head></head>
      <body></body>
    </html>

    This is gotten by taking the outerHTML property of the HTML doc node.
    This is then written to a file at the specified path.
  */
  fs.writeFileSync(OUTPUT_HTML_PATH, htmlDoc.outerHTML);
}

function saveModifiedHtml(folderPath, cleanedFile) {
  /*
  save the new output into a new file
  */
  const filePath = path.join(folderPath, "output.html");

  fs.writeFileSync(filePath, cleanedFile);
}

/* 

NEW FUNCTIONS
this approach uses the string replacement 

*/

function getSourceHTMLClean(folderPath) {
  try {
    const filePath = path.join(folderPath, "source.html");

    const rawHtmlString = fs.readFileSync(filePath).toString();

    // Remove extra whitespace and newlines
    const trimmedHtml = rawHtmlString.replace(/\s+/g, " ").replace(/[\r\n]+/g, "\n");

    // Remove extra new paragraphs
    const cleanedHtml = trimmedHtml.replace(/(\n\n+)+/g, "\n\n");

    return cleanedHtml;
  } catch (error) {
    console.error("Error retrieving or parsing HTML:", error);
    process.exit(1); // Exit the process with an error code
  }
}

function insertInstructions(instructionList, cleanedFile) {
  let cleanedInstructions = instructionList.filter(
    (elem) =>
      elem.hasOwnProperty("fixedHtml") &&
      elem.fixedHtml != null &&
      elem.fixedHtml != "" &&
      elem.hasOwnProperty("html") &&
      elem.html != null &&
      elem.html != "" &&
      elem.hasOwnProperty("failureSummary") &&
      elem.hasOwnProperty("report")
  );

  //remove escape strings from the instructions json object.
  cleanedInstructions = cleanedInstructions.map((instruction) => {
    console.log(instruction.html);
    return {
      id: instruction.id,
      html: instruction.html
        .replace(/\\(.)/g, "$1")
        .replace(/\s+/g, " ")
        .replace(/[\r\n]+/g, "\n")
        .replace(/(\n\n+)+/g, "\n\n"),
      fixedHtml: instruction.fixedHtml
        .replace(/\\(.)/g, "$1")
        .replace(/\s+/g, " ")
        .replace(/[\r\n]+/g, "\n")
        .replace(/(\n\n+)+/g, "\n\n"),
      failureSummary: instruction.failureSummary,
      report: instruction.report,
    };
  });
  /**
   * loop over the instructions.json
   * run a search and replace in the cleanedhtml. we want to insert the fixedhtml in place of the html found in the cleanedhtml string
   *
   */

  for (const newInstruction of cleanedInstructions) {
    if (!cleanedFile.includes(newInstruction.html)) {
      // Remove it, if you want the process to error and exit in such a case
      console.error(`Target html not found for instruction: ${newInstruction.html}`);
      //return null;
      continue;
    }

    cleanedFile = cleanedFile.replace(newInstruction.html, newInstruction.fixedHtml);
  }

  return cleanedFile;
}

/*
function saveModifiedHtml(cleanedFile) {
 
  fs.writeFileSync(OUTPUT_HTML_PATH, cleanedFile);
}*/

function instructionsFileExists(folderPath) {
  const filePath = path.join(folderPath, "instructions.json");
  return fs.existsSync(filePath);
}

function allFilesExist(folderPath) {
  const outputPath = path.join(folderPath, "output.html");
  const instructionsPath = path.join(folderPath, "instructions.json");
  const reportPath = path.join(folderPath, "report.json");
  const sourcePath = path.join(folderPath, "source.html");

  return fs.existsSync(outputPath) && fs.existsSync(instructionsPath) && fs.existsSync(reportPath) && fs.existsSync(sourcePath);
}

function initialReportExists(folderPath) {
  const filePath = path.join(folderPath, "initialReport.json");
  return fs.existsSync(filePath);
}

function saveHtmlFromZip(folderPath, htmlZip) {
  /*
  save the extracted html into a new file
  */
  const filePath = path.join(folderPath, "source.html");
  fs.writeFileSync(filePath, htmlZip);
}

function saveReport(folderPath, report) {
  /*
  save the report into a new file
  */
  const filePath = path.join(folderPath, "report.json");
  fs.writeFileSync(filePath, JSON.stringify(report));
}

function saveInitialReport(folderPath, report) {
  /*
  save the report into a new file
  */
  const filePath = path.join(folderPath, "initialReport.json");
  fs.writeFileSync(filePath, JSON.stringify(report));
}

function saveAllInstructions(folderPath, barriers) {
  const filePath = path.join(folderPath, "instructions.json");
  fs.writeFileSync(filePath, JSON.stringify(barriers, null, 2));
}

function saveInstructions(folderPath, response) {
  /*
 this function saves the new response from llama into a new file
  */

  // Check if the directory exists
  if (!fs.existsSync(folderPath)) {
    // Create the directory if it doesn't exist
    fs.mkdirSync(folderPath);
  }

  // Append the new response to the file
  const filePath = `${folderPath}/instructions.json`;

  // Append the new response to the file
  fs.appendFileSync(filePath, `,\n${JSON.stringify(response, null, 2)}`);
}

function createPageFolder(url) {
  const pageFolderPath = path.join(".", OUTPUT_DIR_PATH, url);

  if (!fs.existsSync(pageFolderPath)) {
    fs.mkdirSync(pageFolderPath);
  }

  return pageFolderPath;
}

//remove escape strings from the instructions.

module.exports = {
  saveHtmlFromZip,
  saveInstructions,
  getSourceHTMLClean,
  getInstructionList,
  insertInstructions,
  saveModifiedHtml,
  createPageFolder,
  saveAllInstructions,
  saveReport,
  instructionsFileExists,
  allFilesExist,
  initialReportExists,
  saveInitialReport,
};
