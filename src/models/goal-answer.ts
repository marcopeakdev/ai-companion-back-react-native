import mongoose from "mongoose";
const { Schema } = mongoose;

const goalAnswerSchema = new Schema({
  goal_id: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
  },
  goal_questioin_id: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Goal_questin',
  },
  content: {
    type: String,
    required: true,
  }
});

export default mongoose.model("Goal_answer", goalAnswerSchema);