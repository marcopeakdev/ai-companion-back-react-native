import { Schema, model } from "mongoose";
import { IGoalAnswer } from "./schema-types";

const goalAnswerSchema = new Schema<IGoalAnswer>({
  goal_id: {
    type: Schema.Types.ObjectId,
    ref: "Goal",
  },
  goal_question_id: {
    type: Schema.Types.ObjectId,
    ref: "Goal_question",
  },
  content: {
    type: String,
    required: true,
  },
});

export default model<IGoalAnswer>("Goal_answer", goalAnswerSchema);
