import mongoose from "mongoose";
const { Schema } = mongoose;

interface IGoalAnswer {
  goal_id: mongoose.Schema.Types.ObjectId,
  goal_question_id: mongoose.Schema.Types.ObjectId,
  content: String, 
}

const goalAnswerSchema = new Schema<IGoalAnswer>({
  goal_id: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
  },
  goal_question_id: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Goal_question',
  },
  content: {
    type: String,
    required: true,
  }
});

export default mongoose.model<IGoalAnswer>("Goal_answer", goalAnswerSchema);