import OpenAI from "openai";
import { getOpenAiKey, selectOpenAiChatModel } from "./util";

const openai = new OpenAI({
  apiKey: getOpenAiKey(), // defaults to process.env["OPENAI_API_KEY"]
});

export const chatBot = async (message: any) => {
  const chatCompletion = await openai.chat.completions.create({
    messages: [
      {
        role: "user",
        content: message,
      },
    ],
    model: selectOpenAiChatModel(),
  });
  const aiMessage = chatCompletion.choices[0].message.content;
  return aiMessage;
};
