import OpenAI from "openai";
import { getOpenAiKey, selectOpenAiChatModel } from "./util";
import { ChatCompletionMessageParam } from "openai/resources";

const openai = new OpenAI({
  apiKey: getOpenAiKey(), // defaults to process.env["OPENAI_API_KEY"]
});

export const chatBot = async (messages: ChatCompletionMessageParam[]) => {
  const chatCompletion = await openai.chat.completions.create({
    messages,
    model: selectOpenAiChatModel(),
  });
  const aiMessage = chatCompletion.choices[0].message.content;
  return aiMessage;
};
