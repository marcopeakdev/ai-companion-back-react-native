import mongoose from "mongoose";
const { Schema } = mongoose;

const goalSchema = new Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
  },
  domain_id: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Domain',
  },
  content: {
    type: String,
    required: true,
  },
  progress: {
    type: Number,   //1-10 number
    default: 0
  }
});

export default mongoose.model("Goal", goalSchema);