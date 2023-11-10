import mongoose from "mongoose";
const { Schema } = mongoose;

interface IUserQuestion {
  _id: mongoose.Schema.Types.ObjectId,
  content: String
}

const userQuestionSchema = new Schema<IUserQuestion>({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
  },
  content: {
    type: String,
    required: true,
  },
});

export default mongoose.model<IUserQuestion>("User_question", userQuestionSchema);
