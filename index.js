// @ts-check
"use strict";

const fs = require("fs"); // Import file system module from the standard Node.js library
const jsdom = require("jsdom");

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
function getInstructionList() {
  /*
    We expect a valid JSON string, so we parse the string to a valid JS object.

    If it's not valid or the file is not found, an error will be thrown and the process will exit.
  */
  try {
    const instructionList = JSON.parse(
      // Read the file at the given path and convert the content to its string representation for easy parsing
      fs.readFileSync(INSTRUCTION_LIST_PATH).toString()
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
      console.error(`Target node not found for instruction: ${instruction.id}`);
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

/*
  This is the main function of this entry file.

  It is an Immediately Invoked Function Expression (IIFE).
*/
(function main() {
  const htmlDoc = getSourceHtmlDoc();
  const instructionList = getInstructionList();
  applyInstructionsToHtmlDoc(instructionList, htmlDoc);
  saveModifiedHtmlDoc(htmlDoc);
})();
