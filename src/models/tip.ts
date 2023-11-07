import mongoose from "mongoose";
const { Schema } = mongoose;

const tipSchema = new Schema({
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

export default mongoose.model("Tip", tipSchema);