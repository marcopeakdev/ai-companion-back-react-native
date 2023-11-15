import OpenAI from "openai";
import { Request, Response } from "express";
import mongoose from "mongoose";

import { getOpenAiKey, getTipCount, selectOpenAiChatModel } from "../util";
import User from "../models/user";
import Domain from "../models/domain";
import Goal from "../models/goal";
import UserAnswer from "../models/user-answer";
import user from "../models/user";
import { IUserQuestion } from "../models/schema-types";

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
    tips
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
  await Goal.deleteOne({ _id: req.query.id });
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

const getTips = (req: Request, res: Response) => {};

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
};
