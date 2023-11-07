import mongoose from "mongoose";
//import mongoose from 'mongoose';
const { Schema } = mongoose;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  avatar: {
    type: String,
  },
  password: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  height: {
    type: Number,
    required: true,
  },
  weight: {
    type: Number,
    required: true,
  },
  gender: {            // 0: female, 1: male
    type: Number,
    required: true,
  },
  marial_status: {  // 0: single, 1 : married:, 2: divorced 
    type: Number,
    required: true,
  },
  question_display_interval: {  // 0: A day, 1 : A week:, 2: A month 
    type: Number,
    required: true,
    default: 0
  },
  tip_display_interval: {  // 0: A day, 1 : A week:, 2: A month 
    type: Number,
    required: true,
    default: 0
  },
  children: {
    type: Schema.Types.ObjectId,
    ref: "Children",
  },
  user_question_id: {
    type: Schema.Types.ObjectId,
    ref: "User_question",
  },
  goal_question_id: {
    type: Schema.Types.ObjectId,
    ref: "Goal_question",
  },
  tip_id: {
    type: String,
    default: "0",
  },
});

export default mongoose.model("User", userSchema);
