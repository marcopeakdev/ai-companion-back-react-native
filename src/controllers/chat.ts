import { ChatCompletionMessageParam } from "openai/resources";
import { Request, Response } from "express";
import Chat from "../models/chat";
import { chatBot } from "../chat";
import { getMessagesPerUser, storeMessagesPerUser } from "../util";

const getMessages = async (req: Request, res: Response) => {
  const { userId } = req.body;
  const messages = await Chat.find({ user_id: userId });
  res.status(200).send(messages);
};

const sendMessage = async (req: Request, res: Response) => {
  const { userId, userMessage } = req.body;
  const messages = getMessagesPerUser(userId);
  messages?.push({
    role: "user",
    content: userMessage,
  });
  const aiMessage = await chatBot(messages);
  messages?.push({
    role: "assistant",
    content: aiMessage,
  });
  storeMessagesPerUser(userId, messages);
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
