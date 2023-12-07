import { Schema, model } from "mongoose";
import { IFeedback } from "../types/schema";

const goalSchema = new Schema<IFeedback>({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  content: {
    type: String,
    required: true,
  },
});

export default model<IFeedback>("Feedback", goalSchema);
