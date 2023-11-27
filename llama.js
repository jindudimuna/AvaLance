const data = require("./zipTraverser");
const llamaConnector = require("./llamaConnector");
const actions = require("./index");
const accessibilityAnalyser = require("./accessibilityAnalyser.js");

(async function () {
  llamaConnector.setModel("/models/llama-2-7b-chat.bin", "Llama 2 7B", 12000, 4000);
  llamaConnector.setPrompt(`
  You are an engineer tasked with fixing web accessibilities. Only return your output in the json format:
  {
      id: "",
      html: "",
      fixedHtml: "",
      failureSummary: "",
      report: ""
  }
  where html is the code to be fixed and fixedhtml is the new html, the id is the id of the accessibility violation, failuresummary is the summary of the accessibility violation and your description of the fix is in the report property. I would give you a json snippet that has the html I want you to fix, along with more information about the error, so look at it and only respond in the new json format above. Respond very concisely.
  `);

  llamaConnector.setTemperature(0.5);

  async function whatToDoPerPage(html, report) {
    /**
     * Process the html content and report data, send the html to the source.html and extract the violations and html we want to pass to llama to fix from the json report
     */
    actions.saveHtmlFromZip(html);

    const requestData = report;

    /**
     * prepare the data for llama, format it to the json format we ant to pass in to llama
     */

    const nodesString = requestData
      .flatMap((info) => info.accessibility.violations)
      .flatMap((error) =>
        error.nodes.map((node) => {
          return ` {
      ' id ': ${node.any[0].id},
      'html': ${node.html},
      'failureSummary': ${node.failureSummary},
    } `;
        })
      );
    /**
     * Send to llama
     */

    // [COMMENT THIS OUT TO SEE THE PROCESSED INPUT]
    // console.log(JSON.stringify(nodesString, null, 2));

    let input = nodesString;

    /**
     * Receive llama's response and send to the instructions.json file.
     *
     */
    let result = await llamaConnector.sendMessage(input, (sendPreviousMessages = false));

    actions.saveInstructions(result); //write the result to the instructions.json file

    /**
     *  run the search and replace fixes and write the fixes to output.html
     *
     */

    const htmlToChange = actions.getSourceHTMLClean();
    const instructions = actions.getInstructionList();

    const toInsert = actions.insertInstructions(instructions, htmlToChange);

    actions.saveModifiedHtml(toInsert);

    /**
     * run the accessibility checker again on our output.html file
     */

    await accessibilityAnalyser.initBrowser();
    const evaluation = await accessibilityAnalyser.analyzeFile("./output/output.html");
    console.log(evaluation);
    await accessibilityAnalyser.closeBrowser();
  }

  await data.navigateZip("./assets/example.zip", whatToDoPerPage);

  console.log("Question:", input);
  console.log("Answer:", result);

  let chatHistory = llamaConnector.getChatHistory();
  console.log("\nChat History\n", chatHistory);
})();
