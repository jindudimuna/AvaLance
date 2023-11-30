const axios = require("axios");

const url = "http://localhost:3000/api/chat";

let chatHistory = [];
let prompt = null;
let temperature = 0.5;

const model = {
  id: "/models/llama-2-7b-chat.bin",
  name: "Llama 2 7B",
  maxLength: 12000,
  tokenLimit: 4000,
};

async function setModel(path, name, maxLength = 120000, tokenLimit = 4000) {
  model.id = path;
  model.name = name;
  model.maxLength = maxLength;
  model.tokenLimit = tokenLimit;
}

function setPrompt(tempPrompt) {
  prompt = tempPrompt;
}

function setTemperature(tempTemperature) {
  if (tempTemperature < 0 || tempTemperature > 1) {
    throw new Error("Temperature must be between 0 and 1");
  }
  temperature = tempTemperature;
}

async function sendMessage(message, sendPreviousMessages = false) {
  const newMessage = {
    role: "user",
    content: message,
  };

  chatHistory.push(newMessage);

  let previousMessages = sendPreviousMessages ? chatHistory : [newMessage];
  const messageResponse = await sendChatMessage(prompt, previousMessages, temperature);

  chatHistory.push({
    role: "assistant",
    content: messageResponse,
  });

  return messageResponse;
}

function resetChatHistory() {
  chatHistory = {};
}

function getChatHistory() {
  return chatHistory;
}

async function sendChatMessage(prompt, messages = [], temperature = 0.5) {
  let result = await axios.post(url, {
    model,
    messages,
    prompt,
    temperature,
  });

  if (result.status != 200) {
    throw new Error("Error sending chat message:", result.status);
  }

  if (!result.data) {
    throw new Error("Error sending chat message: No response data");
  }

  return result.data;
}

async function modelRunning() {
  try {
    let result = await axios.post('http://localhost:3000/api/models', { "key": "" });
    return result.status == 200;
  } catch {
    return false;
  }
}



module.exports = {
  setModel,
  setPrompt,
  setTemperature,
  sendMessage,
  resetChatHistory,
  getChatHistory,
  modelRunning
};
