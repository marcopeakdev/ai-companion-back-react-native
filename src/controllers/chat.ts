import OpenAI from "openai";
import { Request, Response } from "express";


const openai = new OpenAI({
  apiKey: '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', // defaults to process.env["OPENAI_API_KEY"]
});

const chat = async (req: Request, res: Response) => {
  const chatCompletion = await openai.chat.completions.create({
    messages: [{ role: 'user', content: 'Hey, my goal is to lose 10 kg. Current weight is 100kg. give me 50 tips' }],
    model: 'gpt-3.5-turbo',
  });
  console.log("chat-completion", chatCompletion.choices[0].message);

};

export default {
  chat,
};
