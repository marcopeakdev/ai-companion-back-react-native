import { Request, Response } from "express";
import { ChatCompletionMessageParam } from "openai/resources";
import UserQuestion from "../models/user-question";
import mongoose from "mongoose";
import UserAnswer from "../models/user-answer";
import Goal from "../models/goal";
import GoalQuestion from "../models/goal-question";
import GoalAnswer from "../models/goal-answer";
import User from "../models/user";
import { IUserQuestion, IGoalQuestion, IGoal } from "../types/schema";
import { getTipCount } from "../util";
import { chatBot } from "../chat";

const getQestions = async (req: Request, res: Response) => {
  const userId = req.body.userId;
  const questions = await User.findById(userId)
    .populate("user_question_id")
    .populate("goal_id")
    .populate("goal_question_id")
    .exec();

  const today = new Date();
  const todayDate = today.getDate();
  const todayDay = today.getDay();
  const questionDisplayDate = questions?.question_display_date.getDate()
    ? questions?.question_display_date.getDate()
    : 0;
  switch (questions?.question_display_interval) {
    case 0: // 0: ask a question A day
      if (questionDisplayDate * 1 <= 1 + todayDate) {
        return res.status(200).send(questions);
      }
      res.status(200).send({ message: "no" });
      break;
    case 1: // 1 : ask a question A week:
      if (todayDay * 1 === 1) {
        //display questions per Monday
        return res.status(200).send(questions);
      }
      res.status(200).send({ message: "no" });
      break;

    default: // 2: ask a question A month
      if (todayDate * 1 === 1) {
        // display questions per  first day of every month
        //display questions per Monday
        return res.status(200).send(questions);
      }
      res.status(200).send({ message: "no" });
      break;
  }
};

const saveUserAnswer = async (req: Request, res: Response) => {
  const { userId, isSkipUserAnswer, userAnswer, userQuestionId } = req.body;

  if (!isSkipUserAnswer) {
    console.log("existUseranswer->", "existUserAnswer");
    const existUserAnswer = await UserAnswer.find({
      user_id: userId,
      user_question_id: userQuestionId,
    });
    console.log("existUseranswer->", existUserAnswer);
    if (existUserAnswer.length !== 0) {
      await UserAnswer.findOneAndUpdate(
        { user_id: userId, user_question_id: userQuestionId },
        { content: userAnswer }
      );
    } else {
      const savingUserAnswerRow = {
        user_id: userId,
        user_question_id: userQuestionId,
        content: userAnswer,
      };
      console.log("savingUserAnswerRow>", savingUserAnswerRow);
      await UserAnswer.create(savingUserAnswerRow);
    }
  }

  const user = await User.findById(userId);
  //operation to add new user question collection id in user collection
  //To display the user questions iterally
  const currentUserQuestionId = user?.user_question_id;
  let newUserQuestionId = currentUserQuestionId;
  const userQuestionIds = await UserQuestion.find({}).select("_id");
  const nextUserQuestion = await UserQuestion.find({
    _id: { $gt: currentUserQuestionId },
  })
    .sort({ _id: 1 })
    .limit(1);
  if (nextUserQuestion.length === 1) {
    newUserQuestionId = nextUserQuestion[0]._id;
  } else {
    newUserQuestionId = userQuestionIds[0]._id;
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
  console.log(req.body);
  if (!isSkipGoalAnswer) {
    const existGoalAnswer = await GoalAnswer.find({
      goal_id: goalId,
      goal_question_id: goalQuestionId,
    });
    if (existGoalAnswer.length !== 0) {
      await GoalAnswer.findOneAndUpdate(
        { goal_id: goalId, goal_question_id: goalQuestionId },
        { content: goalAnswer }
      );
    } else {
      const savingGoalAnswerRow = {
        user_id: new mongoose.Types.ObjectId(userId),
        goal_id: new mongoose.Types.ObjectId(goalId),
        goal_question_id: new mongoose.Types.ObjectId(goalQuestionId),
        content: goalAnswer,
      };
      await GoalAnswer.create(savingGoalAnswerRow);
    }
  }

  const user = await User.findById(userId);
  //operation to add new goal question collection id in user collection
  const currentGoalQuestionId = user?.goal_question_id;
  let newGoalQuestionId = currentGoalQuestionId;
  const goalQuestionIds = await GoalQuestion.find({}).select("_id");
  const nextGoalQuestion = await GoalQuestion.find({
    _id: { $gt: currentGoalQuestionId },
  })
    .sort({ _id: 1 })
    .limit(1);
  if (nextGoalQuestion.length === 1) {
    newGoalQuestionId = nextGoalQuestion[0]._id;
  } else {
    newGoalQuestionId = goalQuestionIds[0]._id;
  }
  //operation to add new goal collection id in user collection
  const currentGoalId = user?.goal_id;
  let newGoalId = currentGoalId;
  const goalIds = await Goal.find({ user_id: userId }).select("_id");
  const nextGoal = await Goal.find({
    _id: { $gt: currentGoalId },
  })
    .sort({ _id: 1 })
    .limit(1);
  if (nextGoal.length === 1) {
    newGoalId = nextGoal[0]._id;
  } else {
    newGoalId = goalIds[0]._id;
  }
  await User.findOneAndUpdate(
    { _id: userId },
    { goal_id: newGoalId, goal_question_id: newGoalQuestionId }
  );

  res.status(200).send({ message: "goal answer is saved successfully!" });
};

const updateQuestionDisplayDate = async (req: Request, res: Response) => {
  const userId = req.body.userId;
  console.log("userId", userId);
  // when the question is displayed every day, update questiondisplaydate
  const newQuestionDisplayDate = new Date(
    +new Date() + (2 * 24 + 1) * 60 * 60 * 1000
  );
  await User.findOneAndUpdate(
    { _id: userId },
    {
      question_display_date: newQuestionDisplayDate,
    }
  );
  res.status(200).send({ message: "date update success!" });
};

const updateTips = async (req: Request, res: Response) => {
  const { userId, goalId } = req.body;
  const goal = await Goal.findOne({ _id: goalId });
  if (!goal) return res.status(400).send({ message: "Goal doesn't exist" });
  let tipPrompt = `These are my information consists of questions and answers. \n`;

  const userAnswers = await UserAnswer.find({ user_id: userId })
    .populate<{ user_question_id: IUserQuestion }>("user_question_id")
    .exec();
  userAnswers.forEach((item) => {
    tipPrompt += item.user_question_id?.content + " " + item.content + "\n ";
  });

  tipPrompt += `Also, this is my goal. Give me ${getTipCount()} tips to achieve the goal based on my information. ${
    goal.content
  }\nThese are my goal information consists of questions and answers.`;

  const goalAnswers = await GoalAnswer.find({ goal_id: goalId })
    .populate<{ goal_question_id: IGoalQuestion }>("goal_question_id")
    .exec();
  goalAnswers.forEach((item) => {
    tipPrompt += item.goal_question_id?.content + " " + item.content + "\n ";
  });
  console.log("=>>>>", tipPrompt);
  const tipgeneratingMessages: ChatCompletionMessageParam[] = [
    { role: "user", content: tipPrompt },
  ];
  const tips = await chatBot(tipgeneratingMessages);
  await Goal.findOneAndUpdate({ _id: goalId }, { tips });
  res.status(200).send({ message: "tip update success!" });
};

export default {
  getQestions,
  saveUserAnswer,
  saveGoalAnswer,
  updateQuestionDisplayDate,
  updateTips,
};
