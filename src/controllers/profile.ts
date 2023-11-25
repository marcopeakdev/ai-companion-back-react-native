import { Request, Response } from "express";

import {
  getTipCount,
  getDisplayingTipCount,
  getMessagesPerUser,
} from "../util";
import User from "../models/user";
import Goal from "../models/goal";
import { IGoal } from "../types/schema";
import GoalAnswer from "../models/goal-answer";
import { chatBot } from "../chat";

const getGoals = async (req: Request, res: Response) => {
  const { userId } = req.body;
  const goals = await Goal.find({ user_id: userId });
  res.status(200).send(goals);
};

const setQuestionInterval = async (req: Request, res: Response) => {
  const { email, questionDisplayInterval } = req.body;
  const user = await User.findOne({ email });

  if (!user) return res.status(400).send({ message: "User does not exist" });
  user.question_display_interval = questionDisplayInterval * 1;
  user.save();
  res.status(200).send({ message: "Update success" });
};

const setTipInterval = async (req: Request, res: Response) => {
  const { email, tipDisplayInterval } = req.body;
  const user = await User.findOne({ email });

  if (!user) return res.status(400).send({ message: "User does not exist" });
  user.tip_display_interval = tipDisplayInterval * 1;
  user.save();
  res.status(200).send({ message: "Update success" });
};

const setGoal = async (req: Request, res: Response) => {
  const { goalContent, userId } = req.body;
  const messages = getMessagesPerUser(userId) ? getMessagesPerUser(userId) : [];
  const tipPrompt = `This is my goal. Give me ${getTipCount()} tips to achieve the goal based on my information. ${goalContent}`;
  messages?.push({
    role: "user",
    content: tipPrompt,
  });
  const tips = await chatBot(messages);
  const goalRow = new Goal({
    user_id: userId,
    content: goalContent,
    is_pin: false,
    tips,
  });

  const goal = await goalRow.save();
  const goals = await Goal.find({ user_id: userId });
  const goalId = goal._id;
  //To ask questions of goal, point which goal.
  if (goals.length === 1) {
    await User.findOneAndUpdate(
      { _id: userId },
      {
        goal_id: goalId,
        goal_tip_id: goalId,
      }
    );
  }
  res.status(200).send({ message: "goal saving success!" });
};

const saveGoalProgress = async (req: Request, res: Response) => {
  const { goalId, progress } = req.body;
  await Goal.findOneAndUpdate({ _id: goalId }, { progress });
  res.status(200).send({ message: "goal progress updating success!" });
};

const saveDomainProgress = async (req: Request, res: Response) => {
  const { userId, domain, progress } = req.body;
  switch (domain) {
    case "health":
      await User.findOneAndUpdate({ _id: userId }, { health: progress });
      break;
    case "income":
      await User.findOneAndUpdate({ _id: userId }, { income: progress });
      break;
    case "family":
      await User.findOneAndUpdate({ _id: userId }, { family: progress });
      break;
    case "romantic":
      await User.findOneAndUpdate({ _id: userId }, { romantic: progress });
      break;
    default:
      await User.findOneAndUpdate({ _id: userId }, { happiness: progress });
      break;
  }
  res.status(200).send({ message: "domain progress updating success!" });
};

const pinGoal = async (req: Request, res: Response) => {
  const { userId, goalId, isPin } = req.body;
  await Goal.findOneAndUpdate({ _id: goalId }, { is_pin: isPin });
  if (isPin) {
    await User.findOneAndUpdate({ _id: userId }, { $inc: { pin_count: 1 } });
  } else {
    await User.findOneAndUpdate({ _id: userId }, { $inc: { pin_count: -1 } });
  }
  res.status(200).send({ message: "Pin update success!" });
};

const deleteGoal = async (req: Request, res: Response) => {
  const userId = req.body.userId;
  const deletingGoalId = req.query.id;
  const deletingGoal = await Goal.findById(deletingGoalId);
  if (deletingGoal?.is_pin) {
    await User.findOneAndUpdate({ _id: userId }, { $inc: { pin_count: -1 } });
  }
  //update goal_id and goal_tip_id to display questions and tips
  await Promise.all([
    Goal.deleteOne({ _id: deletingGoalId }),
    GoalAnswer.deleteMany({ goal_id: deletingGoalId }),
  ]);
  const goals = await Goal.find({
    user_id: userId,
    _id: { $ne: deletingGoalId },
  });

  if (goals.length === 0) {
    await User.findOneAndUpdate(
      { _id: userId },
      { goal_id: null, goal_tip_id: null }
    );
  } else {
    const existGoalId = await User.findOne({
      _id: userId,
      goal_id: deletingGoalId,
    });
    const updatingUserGoalId = goals[0]._id;
    if (existGoalId) {
      await User.findOneAndUpdate(
        { _id: userId },
        { goal_id: updatingUserGoalId }
      );
    }
    const existGoalTipId = await User.findOne({
      _id: userId,
      goal_tip_id: deletingGoalId,
    });

    if (existGoalTipId) {
      await User.findOneAndUpdate(
        { _id: userId },
        { goal_tip_id: updatingUserGoalId }
      );
    }
  }

  res.status(200).send({ message: "deleting success!" });
};

const getProgress = async (req: Request, res: Response) => {
  const userId = req.body.userId;
  // get average progress number of 5 domain per every user
  const progresses = await Goal.find({ user_id: userId, is_pin: true });

  res.status(200).send(progresses);
};

const getTips = async (req: Request, res: Response) => {
  const userId = req.body.userId;
  const userTips = await User.findById(userId)
    .populate<{ goal_tip_id: IGoal }>("goal_tip_id")
    .exec();
  if (!userTips?.goal_tip_id) {
    return res.status(200).send({ message: "no" });
  }
  const splitTips = userTips?.goal_tip_id?.tips
    .split(/\d+\.\s+/)
    .filter(Boolean)
    .map((item) => item.trim());

  // Log the result
  const tips = splitTips?.splice(
    userTips?.tip_number as number,
    getDisplayingTipCount()
  );
  const today = new Date();
  const todayDate = today.getDate();
  const todayDay = today.getDay();
  const tipDisplayDate = userTips?.tip_display_date.getDate()
    ? userTips?.tip_display_date.getDate()
    : 0;
  const response = { goal: userTips?.goal_tip_id.content, tips };
  switch (userTips?.tip_display_interval) {
    case 0: // 0: ask a tip A day
      if (tipDisplayDate * 1 <= 1 + todayDate) {
        return res.status(200).send(response);
      }
      break;
    case 1: // 1 : ask a tip A week:
      if (todayDay * 1 === 1) {
        //display userTips per Monday
        return res.status(200).send(response);
      }
      break;

    default: // 2: ask a tip A month
      if (todayDate * 1 === 1) {
        // display userTips per  first day of every month
        //display userTips per Monday
        return res.status(200).send(response);
      }
      break;
  }
  res.status(200).send({ message: "no" });
};

const updateTipsDate = async (req: Request, res: Response) => {
  const { userId } = req.body;
  const user = await User.findById(userId);
  let newTipNumber = (user?.tip_number as number) + getDisplayingTipCount();
  const currentGoalId = user?.goal_tip_id;
  let newGoalId = currentGoalId;
  // when tipnumber is bigger than tipcount
  //operation to add new user goals collection id for tips in user collection
  //To display the user goal tips iterally
  const goals = await Goal.find({ user_id: userId });
  if (newTipNumber >= getTipCount()) {
    newTipNumber = 0;
    if (goals.length !== 1) {
      const nextGoal = await Goal.find({ _id: { $gt: currentGoalId } })
        .sort({ _id: 1 })
        .limit(1);
      if (nextGoal.length !== 0) {
        newGoalId = nextGoal[0]._id;
      } else {
        newGoalId = goals[0]._id;
      }
    }
  }
  const newTipDisplayDate = new Date(
    +new Date() + (2 * 24 + 1) * 60 * 60 * 1000
  );
  await User.findOneAndUpdate(
    { _id: userId },
    {
      goal_tip_id: newGoalId,
      tip_display_date: newTipDisplayDate,
      tip_number: newTipNumber,
    }
  );
  res.status(200).send({ message: "Success tip date updating!" });
};

export default {
  setQuestionInterval,
  setTipInterval,
  setGoal,
  getGoals,
  pinGoal,
  deleteGoal,
  saveGoalProgress,
  saveDomainProgress,
  getProgress,
  getTips,
  updateTipsDate,
};
