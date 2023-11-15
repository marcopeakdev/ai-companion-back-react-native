import { Types } from "mongoose";

export interface IUserQuestion {
  _id: Types.ObjectId;
  content: String;
}

export interface IChat {
  user_id: Types.ObjectId;
  user_message: string;
  ai_message?: String;
}

export interface IChildren {
  name: String;
  age: Number;
  gender: Number;
}

export interface IDomain {
  content: String;
}

export interface IGoalAnswer {
  goal_id: Types.ObjectId;
  goal_question_id: Types.ObjectId;
  content: String;
}

export interface IGoalQuestion {
  content: String;
}

export interface IGoal {
  user_id: Types.ObjectId;
  domain_id: Types.ObjectId;
  content: String;
  tips: String;
  progress: Number;
}

export interface IUserAnswer {
  user_id: Types.ObjectId;
  user_question_id?: Types.ObjectId;
  content: String;
}

export interface IUser {
  name: String;
  email: String;
  avatar: String;
  password: string;
  age: Number;
  height: Number;
  weight: Number;
  gender: Number;
  marial_status: Number;
  question_display_interval: Number;
  question_display_date: Date;
  tip_display_interval: Number;
  tip_display_date: Date;
  children: Types.ObjectId;
  user_question_id: Types.ObjectId;
  goal_id: Types.ObjectId;
  goal_question_id: Types.ObjectId;
  goal_id_for_tip: Types.ObjectId;
  tip_number: Number;
  _id: Types.ObjectId;
}
