import mongoose from "mongoose";
const { Schema } = mongoose;

interface IChat {
  user_id: mongoose.Schema.Types.ObjectId;
  user_message: string;
  ai_message?: String;
}

const chatSchema = new Schema<IChat>({
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

export default mongoose.model<IChat>("Chat", chatSchema);