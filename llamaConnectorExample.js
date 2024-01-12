const llamaConnector = require('./llamaConnector');


function delay(delayInms) {
    return new Promise(resolve => setTimeout(resolve, delayInms));
}
  

(async function () {
    //llamaConnector.setModel("/models/llama-2-13b-chat.bin","Llama 2 7B", 12000,4000);
    //llamaConnector.setPrompt("You are a helpful and friendly AI assistant. Respond very concisely.");
    /*
    llamaConnector.setPrompt(`
    You are an engineer tasked with fixing web accessibilities. Only return your output in the json format:
    {
       
        fixedHtml: "",
        report: ""
    }
    where fixedhtml is the new html you've fixed and your description of the fix is in the report property. I would give you a json snippet that has the html I want you to fix, along with more information about the error, so look at it and only respond in the new json format above. Respond very concisely.
    `)
    
    llamaConnector.setTemperature(0.5);

    //let input = "How are you?";
    let input = '{"id":"duplicate-id","html":"<path d=\"M8.96404266,16.5434115 C8.82225357,16.4083454 7.5953435,15.1407175 5.28331247,12.740528 C4.90556251,12.3806892 4.90556251,11.7972753 5.28331247,11.4374365 C5.66106242,11.0775977 6.27351611,11.0775977 6.65126607,11.4374365 L10.2512084,14.5164585 L17.3443983,7.27058769 C17.7231401,6.9098041 18.3372019,6.9098041 18.7159437,7.27058769 C19.0946854,7.63137128 19.0946854,8.21631705 18.7159437,8.57710064 C14.5137232,13.5449854 12.1818466,16.2004223 11.720314,16.5434115 C11.0280151,17.0578952 10.5352135,16.9978495 10.2512084,16.9978495 C9.96720333,16.9978495 9.1767263,16.7460106 8.96404266,16.5434115 Zgfddrihihfdihgfduhfdhbjhbvfdkhbfdbfdkhbfdhbkkhbllkjhbkjhblkjhglkhghhfdhvkhkjhkjhkjhkjhkjhkjhkjhvfhfhvfdhgfdhgfdhgfdhghfdghfdghfdghfdhgfdhgfdhgfdhghfdghfdghfdhgfdhgfdhghfdghfdhgfdhgfdhghfdghfdghdghfdhgdfhghfdghfdghdfhgfdhgfdhghfdghfdhgd hhdshgfdfhgfdhgfdhghdhf gdf hgfdhgfdhgfdh fdh hfd hfd ghfd hdf hfdh fdl ldflg dflg lfdglh dflg lfd glfd lg dsgoifdgojfdgjfdjg fdjg fdjg ojfd ojfdj fdoj gofd jgofdj gofd gofdj gofd ogjfdojg fdojg ofdj gofd oj\" id=\"path-1\">","failureSummary":"Fix any of the following:\n  Document has multiple static elements with the same id attribute: path-1"}'

    let result = await llamaConnector.sendMessage(input, sendPreviousMessages = false);
    console.log("Question:", input)
    console.log("Answer:", result)

    let chatHistory = llamaConnector.getChatHistory();
    console.log("\nChat History\n", chatHistory);
    */

    let modelRunning = false;
    let startTime = Date.now();
    while(!modelRunning) {
        console.log("trying");
        modelRunning = await llamaConnector.modelRunning();
        if(!modelRunning) {
            await delay(10000);
        }
    }
    console.log("Model Running - Delta Time:", Date.now() - startTime);
})();