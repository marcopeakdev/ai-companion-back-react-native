import { Request, Response } from "express";
import Chat from "../models/chat";
import { chatBot } from "../chat";
const getMessages = async (req: Request, res: Response) => {
  const { userId } = req.body;
  const messages = await Chat.find({ user_id: userId });
  res.status(200).send(messages);
};

const sendMessage = async (req: Request, res: Response) => {
  const { userId, userMessage } = req.body;
  const message = `My email is ${userId}. I already said that you use email to identify me.\n ${userMessage}`;

  const aiMessage = await chatBot(message);

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
