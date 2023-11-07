import mongoose from "mongoose";
const { Schema } = mongoose;

const chatSchema = new Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
  },
  user_message: {
    type: String,
  },
  ai_message: {
    type: String,
  }
});

export default mongoose.model("Chat", chatSchema);