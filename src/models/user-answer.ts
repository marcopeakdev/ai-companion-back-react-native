import mongoose from "mongoose";
const { Schema } = mongoose;

const userAnswerSchema = new Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
  },
  user_questioin_id: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User_questin',
  },
  content: {
    type: String,
    required: true,
  }
});

export default mongoose.model("User_answer", userAnswerSchema);