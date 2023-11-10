import mongoose from "mongoose";
const { Schema } = mongoose;

interface ITip {
  user_id: mongoose.Schema.Types.ObjectId,
  goal_id: mongoose.Schema.Types.ObjectId,
  content: String,
}

const tipSchema = new Schema<ITip>({
  user_id: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
  },
  goal_id: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Goal',
  },
  content: {
    type: String,
    required: true,
  }
});

export default mongoose.model<ITip>("Tip", tipSchema);