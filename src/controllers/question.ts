import { Request, Response } from "express";
import mongoose from "mongoose";
import UserQuestion from "../models/user-question";
import GoalQuestion from "../models/goal-question";
import User from "../models/user";

const getQestionsandTips = async (req: Request, res: Response) => {
  const userId = req.body.userId;
  const questions = await User.findById(userId)
    .populate("user_question_id")
    .populate("goal_question_id")
    .exec();
		//operation to add new user question collection id in user collection
		const userQuestionIds = await UserQuestion.find({}).select("_id");
		let newUserQuestionId: any = "";
		for (let i = 0; i < userQuestionIds.length; i++) {
			if (questions?.user_question_id?._id.toString() === userQuestionIds[i]._id.toString()) {
				newUserQuestionId =
        i === userQuestionIds.length - 1
				? userQuestionIds[0]
				: userQuestionIds[i + 1];
			}
		}
		//operation to add new goal question collection id in user collection

  const goalQuestionIds = await GoalQuestion.find({}).select("_id");
  let newGoalQuestionId: any = "";
  for (let i = 0; i < goalQuestionIds.length; i++) {
    if (questions?.goal_question_id?._id.toString() === goalQuestionIds[i]._id.toString()) {
      newGoalQuestionId =
        i === goalQuestionIds.length - 1
          ? goalQuestionIds[0]
          : goalQuestionIds[i + 1];
    }
  }

  await User.findOneAndUpdate({_id: userId}, {user_question_id: newUserQuestionId, goal_question_id: newGoalQuestionId});
  res.status(200).send(questions);

};

export default {
  getQestionsandTips,
};
