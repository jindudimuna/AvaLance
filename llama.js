const data = require("./zipTraverser");
const llamaConnector = require("./llamaConnector");
const actions = require("./index");
const accessibilityAnalyser = require("./accessibilityAnalyser.js");
const { jsonrepair } = require("jsonrepair");
const path = require("path");

const maxInputLength = 100;

function delay(delayInms) {
  return new Promise((resolve) => setTimeout(resolve, delayInms));
}

function isInputLengthValid(input) {
  return input.length <= maxInputLength;
}

async function waitForModelToBeRunning() {
  let timeStart = Date.now();
  let modelRunning = await llamaConnector.modelRunning();
  while (!modelRunning) {
    console.log("waiting for model");
    modelRunning = await llamaConnector.modelRunning();
    if (!modelRunning) {
      await delay(10000);
    }
  }
  console.log("Model Running - Delta Time:", Date.now() - timeStart, "ms");
}

(async function () {
  llamaConnector.setModel("/models/llama-2-13b-chat.bin", "Llama 2 13B", 12000, 4000);
  llamaConnector.setPrompt(`
  You are an engineer tasked with fixing web accessibilities. Only return your output in the json format:
  {
     
      fixedHtml: "",
      report: ""
  }
  where fixedhtml is the new html you've fixed and your description of the fix is in the report property. I would give you a json snippet that has the html I want you to fix, along with more information about the error, so look at it and only respond in the new json format above. Respond very concisely.
  `);

  llamaConnector.setTemperature(0.5);

  async function whatToDoPerPage(domain, url, html, report) {
    if (domain != url) {
      return;
    }

    console.log("On page:", url);
    /**
     * Process the html content and report data, send the html to the source.html and extract the violations and html we want to pass to llama to fix from the json report
     */
    const pagePath = actions.createPageFolder(url);

    if (!actions.initialReportExists(pagePath)) {
      actions.saveInitialReport(pagePath, report);
    }

    if (actions.allFilesExist(pagePath)) {
      return;
    }

    actions.saveHtmlFromZip(pagePath, html);

    if (!actions.instructionsFileExists(pagePath)) {
      const requestData = report;

      /**
       * prepare the data for llama, format it to the json format we ant to pass in to llama
       */
      let nodesString = null;
      if (requestData == null || requestData.accessibility == null || requestData.accessibility.violations == null) {
        return;
      }

      nodesString = requestData.accessibility.violations.flatMap((error) => {
        const errorId = error.id;
        return error.nodes.map((node) => {
          return {
            id: errorId,
            html: node.html,
            failureSummary: node.failureSummary,
          };
        });
      });

      let finalBarriers = [];

      //change this to a loop to select the errors one by one.
      //open loop here
      for (let selectNodes of nodesString) {
        let inputPrompt = JSON.stringify(selectNodes);
        inputPrompt = inputPrompt.replaceAll("\n", "");

        let timeStart = Date.now();

        await waitForModelToBeRunning();

        let result = null;
        try {
          console.log("Sending Prompt:", inputPrompt);
          result = await llamaConnector.sendMessage(inputPrompt);
        } catch (e) {
          console.log(e);
          result = {
            error: e.message,
          };
          await waitForModelToBeRunning();
        }

        if (typeof result == "string") {
          try {
            result = result.replaceAll("\"'", "'");
            result = result.replaceAll("'\"", "'");
            let repair = jsonrepair(result);
            result = JSON.parse(repair);
          } catch (e) {
            try {
              result = await llamaConnector.sendMessage(inputPrompt);
              if (typeof result == "string") {
                result = result.replaceAll("\"'", "'");
                result = result.replaceAll("'\"", "'");
                repair = jsonrepair(result);
                result = JSON.parse(repair);
              }
            } catch (e) {
              console.log(e);
              result = {
                error: e.message,
              };
              await waitForModelToBeRunning();
            }
          }
        }

        var delta = Date.now() - timeStart;
        console.log("Request took:", delta, "ms");

        //merge the response from llama to the original nodestring
        let updatedResult = Object.assign({}, selectNodes, result);

        finalBarriers.push(updatedResult);

        await delay(5000);
      }

      actions.saveAllInstructions(pagePath, finalBarriers);
    }

    //close the lop here

    /**
     *  run the search and replace fixes and write the fixes to output.html
     *
     */

    const htmlToChange = actions.getSourceHTMLClean(pagePath);
    const instructions = actions.getInstructionList(pagePath);

    const toInsert = actions.insertInstructions(instructions, htmlToChange);

    actions.saveModifiedHtml(pagePath, toInsert);

    /**
     * run the accessibility checker again on our output.html file
     */

    const outputPath = path.join(pagePath, "output.html");

    try {
      const evaluation = await accessibilityAnalyser.analyzeFile(outputPath);
      //console.log(evaluation);
      actions.saveReport(pagePath, evaluation);
    } catch (e) {
      console.log(e);
    }
  }

  await accessibilityAnalyser.initBrowser();

  await data.navigateZip("./assets/1000study.zip", whatToDoPerPage);

  await accessibilityAnalyser.closeBrowser();
})();
