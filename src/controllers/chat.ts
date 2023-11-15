import OpenAI from "openai";
import { Request, Response } from "express";
import Chat from "../models/chat";
import { getOpenAiKey, selectOpenAiChatModel } from "../util";

const openai = new OpenAI({
  apiKey: getOpenAiKey(), // defaults to process.env["OPENAI_API_KEY"]
});

const getMessages = async (req: Request, res: Response) => {
  const { userId } = req.body;
  const messages = await Chat.find({ user_id: userId });
  res.status(200).send(messages);
};

const sendMessage = async (req: Request, res: Response) => {
  const { userId, userMessage } = req.body;

  const chatCompletion = await openai.chat.completions.create({
    messages: [
      {
        role: "user",
        content: userMessage,
      },
    ],
    model: selectOpenAiChatModel(),
  });
  const aiMessage = chatCompletion.choices[0].message.content;
  console.log("aimessage->", chatCompletion.choices[0].message.content);

  const chatRow = {
    user_id: userId,
    user_message: userMessage,
    ai_message: aiMessage,
  };

  await Chat.create(chatRow);
  res.status(200).send(aiMessage);
};

export default {
  sendMessage,
  getMessages,
};
