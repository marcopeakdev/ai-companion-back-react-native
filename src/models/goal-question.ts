import mongoose from "mongoose";
const { Schema } = mongoose;

const goalQuestionSchema = new Schema({
  content: {
    type: String,
    required: true,
  }
});

export default mongoose.model("Goal_question", goalQuestionSchema);