import { ChatCompletionMessageParam } from "openai/resources";
import { messagesObj } from "./types/message";
let chatMessagesPerUser: messagesObj = {};

export const getJwtSecret = () => {
  return "abc123";
};

export const getOpenAiKey = () => {
  return "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";
};

export const getTipCount = () => {
  return 20;
};

export const getDisplayingTipCount = () => {
  return 3;
};

export const selectOpenAiChatModel = () => {
  const models = [
    "gpt-3.5-turbo-16k",
    "gpt-3.5-turbo",
    "gpt-3.5-turbo-1106",
    "gpt-4-0314",
    "gpt-4",
    "gpt-4-1106-preview",
    "gpt3.5-turbo-0613",
    "gpt-4-0613",
    "gpt-3.5-turbo-16k-0613",
    "gpt-3.5-turbo-0301",
  ];
  return models[4];
};

export const getMongoUri = () => {
  return "mongodb+srv://peakgenius226:AlwaysSuccess226!@ai-companion.4vbg1k2.mongodb.net/ai_companion?retryWrites=true&w=majority";
};

export const storeMessagesPerUser = (
  key: string,
  messages: ChatCompletionMessageParam[]
) => {
  chatMessagesPerUser[key] = messages;
  return;
};

export const getMessagesPerUser = (key: string) => {
  return chatMessagesPerUser[key];
};

export const deleteMessagesPerUser = (key: string) => {
  delete chatMessagesPerUser[key];
};

export const generateFourRandomNumber = (min: number, max: number) => {
  // Use Math.random() to generate a random decimal between 0 and 1
  const randomDecimal = Math.random();
  // Scale and shift the random decimal to the desired range
  const randomInteger = Math.floor(randomDecimal * (max - min + 1)) + min;
  return randomInteger;
};
