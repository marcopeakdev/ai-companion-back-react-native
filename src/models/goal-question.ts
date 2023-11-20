import { Schema, model } from "mongoose";
import { IGoalQuestion } from "../types/schema";

const goalQuestionSchema = new Schema<IGoalQuestion>({
  content: {
    type: String,
    required: true,
  },
});

export default model<IGoalQuestion>("Goal_question", goalQuestionSchema);
