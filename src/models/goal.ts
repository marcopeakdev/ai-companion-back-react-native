import mongoose from "mongoose";
const { Schema } = mongoose;

interface IGoal {
  user_id: mongoose.Schema.Types.ObjectId,
  domain_id: mongoose.Schema.Types.ObjectId,
  content: String,
  progress: Number,
}

const goalSchema = new Schema<IGoal>({
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

export default mongoose.model<IGoal>("Goal", goalSchema);