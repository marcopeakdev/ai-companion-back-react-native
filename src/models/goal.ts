import { Schema, model } from "mongoose";
import { IGoal } from "./schema-types";

const goalSchema = new Schema<IGoal>({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  domain_id: {
    type: Schema.Types.ObjectId,
    ref: "Domain",
  },
  content: {
    type: String,
    required: true,
  },
  tips: {
    type: String,
  },
  progress: {
    type: Number, //1-10 number
    default: 0,
  },
});

export default model<IGoal>("Goal", goalSchema);
