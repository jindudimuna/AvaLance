const save = require("./index");
const data = require("./zipTraverser");
const llamaConnector = require("./llamaConnector");

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

  function whatToDoPerPage(html, report) {
    //for dev only, uncomment this to see the html
    // console.log(html);

    save.saveHtmlFromZip(html); //save the extracted html file

    return report;
    // console.log(report.accessibility.violations);
  }
  const requestData = await data.navigateZip("./assets/example.zip", whatToDoPerPage); //data is the raw json file we would be extracting from the zip file

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

  console.log(JSON.stringify(nodesString, null, 2));

  let input = nodesString;

  let result = await llamaConnector.sendMessage(input, (sendPreviousMessages = false));

  save.saveInstructions(result); //write the result to the instructions.json file

  console.log("Question:", input);
  console.log("Answer:", result);

  let chatHistory = llamaConnector.getChatHistory();
  console.log("\nChat History\n", chatHistory);
})();
