const llamaConnector = require('./llamaConnector');


(async function main() {

    const messages = [
        {
            "role": "user",
            "content": "Hello"
        },
        {
            "role": "assistant",
            "content": "Hi there! How can I assist you today?"
        },
        {
            "role": "user",
            "content": "How are you"
        },
        {
            "role": "assistant",
            "content": "I am doing well, thank you for asking. I hope you're having a great day too. Is there anything specific you would like assistance with or information about?"
        },
        {
            "role": "user",
            "content": "yeah, do you know what day is today?"
        }
    ]

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