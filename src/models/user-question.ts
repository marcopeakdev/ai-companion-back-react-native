import { Schema, model } from "mongoose";
import { IUserQuestion } from "../types/schema";

const userQuestionSchema = new Schema<IUserQuestion>({
  _id: {
    type: Schema.Types.ObjectId,
  },
  content: {
    type: String,
    required: true,
  },
});

export default model<IUserQuestion>("User_question", userQuestionSchema);
