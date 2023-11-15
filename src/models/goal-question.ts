import { Schema, model } from "mongoose";
import { IGoalQuestion } from "./schema-types";

const goalQuestionSchema = new Schema<IGoalQuestion>({
  content: {
    type: String,
    required: true,
  },
});

export default model<IGoalQuestion>("Goal_question", goalQuestionSchema);
