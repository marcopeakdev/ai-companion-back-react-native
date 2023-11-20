import { ChatCompletionMessageParam } from "openai/resources";
export type Message = {
  role: string;
  content: string;
};

export type messagesObj = {
  [key: string]: ChatCompletionMessageParam[]
}