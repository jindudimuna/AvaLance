const llamaConnector = require('./llamaConnector');


(async function () {
    llamaConnector.setModel("/models/llama-2-7b-chat.bin","Llama 2 7B", 12000,4000);
    llamaConnector.setPrompt("You are a helpful and friendly AI assistant. Respond very concisely.");
    llamaConnector.setTemperature(0.5);

    let input = "How are you?";

    let result = await llamaConnector.sendMessage(input, sendPreviousMessages = false);
    console.log("Question:", input)
    console.log("Answer:", result)

    let chatHistory = llamaConnector.getChatHistory();
    console.log("\nChat History\n", chatHistory);
})();