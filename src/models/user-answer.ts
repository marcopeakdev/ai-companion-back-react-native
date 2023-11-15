import { Schema, model } from "mongoose";
import { IUserAnswer } from "./schema-types";

const userAnswerSchema = new Schema<IUserAnswer>({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  user_question_id: {
    type: Schema.Types.ObjectId,
    ref: "User_question",
  },
  content: {
    type: String,
    required: true,
  },
});

export default model<IUserAnswer>("User_answer", userAnswerSchema);
