import OpenAI from "openai";
import { Request, Response } from "express";
import mongoose from "mongoose";

import {
  getOpenAiKey,
  getTipCount,
  selectOpenAiChatModel,
  getDisplayingTipCount,
} from "../util";
import User from "../models/user";
import Domain from "../models/domain";
import Goal from "../models/goal";
import UserAnswer from "../models/user-answer";
import { IUserQuestion, IGoal } from "../models/schema-types";
import GoalAnswer from "../models/goal-answer";

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

const getDomain = async (req: Request, res: Response) => {
  const domains = await Domain.find({});
  res.status(200).send(domains);
};

const getGoal = async (req: Request, res: Response) => {
  const goals = await Goal.find({ user_id: req.body.userId })
    .populate("domain_id")
    .exec();
  res.status(200).send(goals);
};

const openai = new OpenAI({
  apiKey: getOpenAiKey(), // defaults to process.env["OPENAI_API_KEY"]
});

const setGoal = async (req: Request, res: Response) => {
  const { domain, content, userId } = req.body;

  //generate and store the tip of the goal when new goal is created.
  const userAnswers = await UserAnswer.find({ user_id: userId })
    .populate<{ user_question_id: IUserQuestion }>("user_question_id")
    .exec();
  let tipPrompt =
    "These are my information consists of questions and answers. \n";
  userAnswers.forEach((item) => {
    tipPrompt += item.user_question_id?.content + " " + item.content + "\n ";
  });

  tipPrompt += `Also, this is my goal. Give me ${getTipCount()} tips to achieve the goal based on my information. ${content}`;
  const chatCompletion = await openai.chat.completions.create({
    messages: [
      {
        role: "user",
        content: tipPrompt,
      },
    ],
    model: selectOpenAiChatModel(),
  });
  const tips = chatCompletion.choices[0].message.content;

  const goalRow = new Goal({
    user_id: userId,
    content,
    domain_id: domain,
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
  res.status(200).send({ message: "progress updating success!" });
};

const deleteGoal = async (req: Request, res: Response) => {
  const userId = req.body.userId;
  const deletingGoalId = req.query.id;
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
  const domains = await Domain.aggregate([
    {
      $lookup: {
        from: "goals",
        localField: "_id",
        foreignField: "domain_id",
        pipeline: [
          { $match: { user_id: new mongoose.Types.ObjectId(userId) } },
        ],
        as: "goals",
      },
    },
    {
      $addFields: {
        avg_progress: { $avg: "$goals.progress" },
      },
    },
  ]);

  res.json({ domains });
};

const getTips = async (req: Request, res: Response) => {
  const userId = req.body.userId;
  const userTips = await User.findById(userId)
    .populate<{ goal_tip_id: IGoal }>("goal_tip_id")
    .exec();

  const splitTips = userTips?.goal_tip_id.tips
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
      console.log("nextGoal->", nextGoal);
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
  getDomain,
  setGoal,
  getGoal,
  deleteGoal,
  saveGoalProgress,
  getProgress,
  getTips,
  updateTipsDate,
};
