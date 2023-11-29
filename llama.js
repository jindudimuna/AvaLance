const data = require("./zipTraverser");
const llamaConnector = require("./llamaConnector");
const actions = require("./index");
const accessibilityAnalyser = require("./accessibilityAnalyser.js");

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

  async function whatToDoPerPage(domain, url,html, report) {
    /**
     * Process the html content and report data, send the html to the source.html and extract the violations and html we want to pass to llama to fix from the json report
     */
    const pagePath = actions.createPageFolder(url);    

    actions.saveHtmlFromZip(pagePath, html);

    const requestData = report;

    /**
     * prepare the data for llama, format it to the json format we ant to pass in to llama
     */

    const nodesString = requestData.accessibility.violations
      .flatMap((error) => {
        const errorId = error.id;
        return error.nodes.map((node) => {
          return {
            'id': errorId,
            'html': node.html,
            'failureSummary': node.failureSummary,
          } 
        });
      });

    let finalBarriers = [];

    //change this to a loop to select the errors one by one.
    //open loop here
    for (const selectNodes of nodesString) {
      let inputPrompt = `{
            'id' : ${selectNodes.id},
            'html' : ${selectNodes.html},
            'failureSummary': ${selectNodes.failureSummary}, 
          }`;

      let input = inputPrompt;
      let timeStart = Date.now();
      /**
       * Send to llama
       */

      // [COMMENT THIS OUT TO SEE THE PROCESSED INPUT]
      // console.log(JSON.stringify(nodesString, null, 2));

      /**
       * Receive llama's response and send to the instructions.json file.
       *
       */
      let result = await llamaConnector.sendMessage(input);

      var delta = Date.now() - timeStart;
      console.log(`Request took: ${delta}ms`);

      //merge the response from llama to the original nodestring
      let updatedResult = Object.assign({}, inputPrompt, result);

      finalBarriers.push(updatedResult);
    }

    actions.saveAllInstructions(pagePath, finalBarriers);

    return;

    //close the lop here

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
