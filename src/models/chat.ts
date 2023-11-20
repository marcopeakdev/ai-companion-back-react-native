import { Schema, model } from "mongoose";
import { IChat } from "../types/schema";

const chatSchema = new Schema<IChat>({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  user_message: {
    type: String,
  },
  ai_message: {
    type: String,
  },
});

export default model<IChat>("Chat", chatSchema);
