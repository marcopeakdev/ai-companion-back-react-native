import { Request, Response } from "express";
import mongoose from "mongoose";
import UserQuestion from "../models/user-question";
import UserAnswer from "../models/user-answer";
import Goal from "../models/goal";
import GoalQuestion from "../models/goal-question";
import GoalAnswer from "../models/goal-answer";
import User from "../models/user";

const getQestionsandTips = async (req: Request, res: Response) => {
  const userId = req.body.userId;
  const questions = await User.findById(userId)
    .populate("user_question_id")
    .populate("goal_id")
    .populate("goal_question_id")
    .exec();

  res.status(200).send(questions);
};

const saveUserAnswer = async (req: Request, res: Response) => {
  const { userId, isSkipUserAnswer, userAnswer, userQuestionId } = req.body;

  if (!isSkipUserAnswer) {
    const savingUserAnswerRow = {
      user_id: userId,
      user_question_id: userQuestionId,
      content: userAnswer,
    };
    await UserAnswer.create(savingUserAnswerRow);
  }

  const questions = await User.findById(userId)
    .populate("user_question_id")
    .populate("goal_question_id")
    .exec();
  //operation to add new user question collection id in user collection
  //To display the user questions iterally
  const userQuestionIds = await UserQuestion.find({}).select("_id");
  let newUserQuestionId: any = "";
  const userQuestionIdsLength = userQuestionIds.length;
  const currentUserQuestionId = questions?.user_question_id?._id.toString();
  if (
    currentUserQuestionId === //when current question is last item in user question collection
    userQuestionIds[userQuestionIdsLength - 1]._id.toString()
  ) {
    newUserQuestionId = userQuestionIds[0]._id; // question is displayed first item
  } else {
    //when current question is not last item in user question collection
    for (let i = 0; i < userQuestionIdsLength - 1; i++) {
      if (currentUserQuestionId === userQuestionIds[i]._id.toString()) {
        newUserQuestionId = userQuestionIds[i + 1]._id;
        break;
      }
    }
  }

  await User.findOneAndUpdate(
    { _id: userId },
    { user_question_id: newUserQuestionId }
  );
  res.status(200).send({ message: "user answer is saved successfully!" });
};

const saveGoalAnswer = async (req: Request, res: Response) => {
  const { userId, isSkipGoalAnswer, goalId, goalAnswer, goalQuestionId } =
    req.body;

  if (!isSkipGoalAnswer) {
    const savingGoalAnswerRow = {
      goal_id: goalId,
      goal_question_id: goalQuestionId,
      content: goalAnswer,
    };
    await GoalAnswer.create(savingGoalAnswerRow);
  }

  const questions = await User.findById(userId)
    .populate("user_question_id")
    .populate("goal_question_id")
    .exec();

  //operation to add new goal question collection id in user collection

  const goalQuestionIds = await GoalQuestion.find({}).select("_id");
  let newGoalQuestionId: any = "";
  const goalQuestionIdsLength = goalQuestionIds.length;
  const currentGoalQuestionId = questions?.goal_question_id?._id.toString();
  if (
    currentGoalQuestionId === //when current question is last item in goal question collection
    goalQuestionIds[goalQuestionIdsLength - 1]._id.toString()
  ) {
    // question of first item is displayed
    newGoalQuestionId = goalQuestionIds[0]._id;
    //also we have to chage goal_id in user collections in order to display the question of the another goal
    const goalIds = await Goal.find({ user_id: userId }).select("_id");
    let newGoalId: any = "";
    const goalIdsLength = goalIds.length;
    const currentGoalId = questions?.goal_id?.toString();
    if (
      currentGoalId === //when current goal is last item in goal collection
      goalIds[goalIdsLength - 1]._id.toString()
    ) {
      console.log(
        "newGoalQuestionId",
        newGoalQuestionId,
      );
      // goal of first item is displayed
      newGoalId = goalIds[0]._id;
    } else {
      //when current question is not last item in user question collection
      for (let i = 0; i < goalIdsLength - 1; i++) {
        if (currentGoalId === goalIds[i]._id.toString()) {
          newGoalId = goalIds[i + 1]._id;
          break;
        }
      }
    }
    await User.findOneAndUpdate(
      { _id: userId },
      { goal_id: newGoalId, goal_question_id: newGoalQuestionId }
    );
  } else {
    //when current question is not last item in user question collection
    for (let i = 0; i < goalQuestionIdsLength - 1; i++) {
      if (currentGoalQuestionId === goalQuestionIds[i]._id.toString()) {
        newGoalQuestionId = goalQuestionIds[i + 1]._id;
        break;
      }
    }
    await User.findOneAndUpdate(
      { _id: userId },
      { goal_question_id: newGoalQuestionId }
    );
  }
  res.status(200).send({ message: "goal answer is saved successfully!" });
};

export default {
  getQestionsandTips,
  saveUserAnswer,
  saveGoalAnswer,
};
