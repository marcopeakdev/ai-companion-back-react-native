import OpenAI from "openai";
import { Request, Response } from "express";
import Chat from "../models/chat";

const openai = new OpenAI({
  apiKey: "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", // defaults to process.env["OPENAI_API_KEY"]
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
    model: "gpt-3.5-turbo",
  });
  const aiMessage = chatCompletion.choices[0].message.content;
  console.log(
    "messagetype->",
    typeof chatCompletion.choices[0].message,
    "aimessage->",
    chatCompletion.choices[0].message.content
  );

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
