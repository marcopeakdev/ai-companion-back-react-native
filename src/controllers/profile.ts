import User from "../models/user";
import Domain from "../models/domain";
import Goal from "../models/goal";
import { Request, Response } from "express";

const setQuestionInterval = async (req: Request, res: Response) => {
  const { email, questionDisplayInterval } = req.body;
  const user = await User.findOne({ email });

  if (!user) return res.status(400).send({ message: "User does not exist" });
  user.question_display_interval = questionDisplayInterval;
  user.save();
  res.status(200).send({ message: "Update success" });
};

const setTipInterval = async (req: Request, res: Response) => {
  const { email, tipDisplayInterval } = req.body;
  const user = await User.findOne({ email });

  if (!user) return res.status(400).send({ message: "User does not exist" });
  user.tip_display_interval = tipDisplayInterval;
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

const setGoal = async (req: Request, res: Response) => {
  const { domain, content, userId } = req.body;
  const goalRow = new Goal({
    user_id: userId,
    content,
    domain_id: domain,
  });
  
  const goal = await goalRow.save();

  const goals = await Goal.find({ user_id: userId });
  if (goals.length === 0) {
    await User.findOneAndUpdate(
      { _id: userId },
      {
        goal_id: goal._id,
      }
    );
  }
  res.status(200).send({ message: "goal saving success!" });
};

const deleteGoal = async (req: Request, res: Response) => {
  console.log("id", req.query.id);
  await Goal.deleteOne({ _id: req.query.id });
  res.status(200).send({ message: "deleting success!" });
};

export default {
  setQuestionInterval,
  setTipInterval,
  getDomain,
  setGoal,
  getGoal,
  deleteGoal,
};
