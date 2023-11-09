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
  question_display_date: {
		type: Date,
		default: new Date(+new Date() + (24 + 1)*60*60*1000),
	},
  tip_display_interval: {  // 0: A day, 1 : A week:, 2: A month 
    type: Number,
    required: true,
    default: 0
  },
  tip_display_date: {
    type: Date,
    default: +new Date() + (24 + 1)*60*60*1000,
  },
  children: {
    type: Schema.Types.ObjectId,
    ref: "Children",
  },
  user_question_id: {       // user_question_id to ask a question about user everyday or weekly so this field is changed everyday or weekly
    type: Schema.Types.ObjectId,
    ref: "User_question",
  },
  goal_id: {      // goal_id to ask a question about goal everyday or weekly so this field is updated if question of this goal is ended 
    type: Schema.Types.ObjectId,
    ref: "Goal",
  },
  goal_question_id: {      // goal_question_id to ask a question about goal everyday or weekly so this field is changed everyday or weekly
    type: Schema.Types.ObjectId,
    ref: "Goal_question",
  },
  tip_id: {
    type: String,
    default: "0",
  },
});

export default mongoose.model("User", userSchema);
