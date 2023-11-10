import mongoose from "mongoose";
const { Schema } = mongoose;

interface IUserAnswer {
  user_id: mongoose.Schema.Types.ObjectId,
  user_question_id: mongoose.Schema.Types.ObjectId,
  content: String,
}

const userAnswerSchema = new Schema<IUserAnswer>({
  user_id: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
  },
  user_question_id: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User_questin',
  },
  content: {
    type: String,
    required: true,
  }
});

export default mongoose.model<IUserAnswer>("User_answer", userAnswerSchema);