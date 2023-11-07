import mongoose from "mongoose";
const { Schema } = mongoose;

const userQuestionSchema = new Schema({
  content: {
    type: String,
    required: true,
  },
});

export default mongoose.model("User_question", userQuestionSchema);
