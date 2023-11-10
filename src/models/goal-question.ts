import mongoose from "mongoose";
const { Schema } = mongoose;

interface IGoalQuestionSchema {
  content: String
}

const goalQuestionSchema = new Schema<IGoalQuestionSchema>({
  content: {
    type: String,
    required: true,
  }
});

export default mongoose.model<IGoalQuestionSchema>("Goal_question", goalQuestionSchema);