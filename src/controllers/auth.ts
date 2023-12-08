import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import mongoose from "mongoose";
import { ServerClient } from "postmark";

import { IUser, IUserQuestion } from "../types/schema";
import User from "../models/user";
import UserQuestion from "../models/user-question";
import UserAnswer from "../models/user-answer";
import GoalQuestion from "../models/goal-question";
import Chat from "../models/chat";
import Goal from "../models/goal";
import {
  deleteMessagesPerUser,
  getJwtSecret,
  storeMessagesPerUser,
  generateFourRandomNumber,
  getPostMarkKey,
} from "../util";
import { chatBot } from "../chat";
import { ChatCompletionMessageParam } from "openai/resources";

const signup = async (req: Request, res: Response) => {
  const {
    name,
    email,
    password,
    age,
    height,
    weight,
    gender,
    marial_status,
    health,
    income,
    family,
    romantic,
    happiness,
  } = req.body;
  const user = await User.findOne({ email });
  if (!name) {
    return res.status(400).send({ message: "name field is required" });
  }
  if (!email || !email.includes("@")) {
    return res.status(400).send({ message: "email field is invalid" });
  }
  if (!password) {
    return res.status(400).send({ message: "password field is required" });
  }
  if (!age) {
    return res.status(400).send({ message: "age field is required" });
  }
  if (!height) {
    return res.status(400).send({ message: "height field is required" });
  }
  if (!weight) {
    return res.status(400).send({ message: "weight field is required" });
  }
  if (gender !== 0 && !gender) {
    return res.status(400).send({ message: "gender field is required" });
  }
  if (!marial_status && marial_status !== 0) {
    return res.status(400).send({ message: "marial_status field is required" });
  }
  if (user) {
    return res.status(400).json({ message: "User already exist!" });
  }
  const userQuestions = await UserQuestion.find({});
  const goalQuestions = await GoalQuestion.find({});
  const userInfo = {
    name,
    email,
    age,
    password,
    height,
    weight,
    gender,
    marial_status,
    user_question_id: userQuestions[0]?._id,
    goal_question_id: goalQuestions[0]?._id,
    health,
    income,
    family,
    romantic,
    happiness,
  };

  // Crypt the password
  const salt = await bcrypt.genSalt(10);
  userInfo.password = await bcrypt.hash(password, salt);
  // Create the user
  const newUser = await User.create(userInfo);
  //progress of the doamin is stored initially between 1-10;
  const { id } = newUser;
  const jwtsecret = getJwtSecret();
  if (!jwtsecret) {
    return;
  }

  const token = await jwt.sign({ id }, jwtsecret);
  res.status(200).send({
    message: "login success",
    token,
    user: {
      name: newUser.name,
      avatar: newUser.avatar,
      age: newUser.age,
      userEmail: newUser.email,
      height: newUser.height,
      weight: newUser.weight,
      gender: newUser.gender,
      marial_status: newUser.marial_status,
      question_display_interval: newUser.question_display_interval,
      tip_display_interval: newUser.tip_display_interval,
      health: newUser.health,
      income: newUser.income,
      family: newUser.family,
      romantic: newUser.romantic,
      happiness: newUser.happiness,
      pin_count: newUser.pin_count,
    },
  });
};

const signin = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  // Find the user
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const validUser = await bcrypt.compare(password, user.password);
  if (!validUser) {
    return res.status(400).json({ message: "Password is incorrect" });
  }

  // Generate token
  const {
    id,
    name,
    email: userEmail,
    avatar,
    age,
    height,
    weight,
    gender,
    marial_status,
    question_display_interval,
    tip_display_interval,
    health,
    income,
    family,
    romantic,
    happiness,
    pin_count,
  } = user;
  // In jwt.sign set the data that you want to get
  // const jwtsecret = process.env.JWT_SECRET;
  const jwtsecret = getJwtSecret();
  if (!jwtsecret) {
    return;
  }

  const token = await jwt.sign({ id }, jwtsecret);
  res.status(200).send({
    message: "login success",
    token,
    user: {
      name,
      avatar,
      age,
      userEmail,
      height,
      weight,
      gender,
      marial_status,
      question_display_interval,
      tip_display_interval,
      health,
      income,
      family,
      romantic,
      happiness,
      pin_count,
    },
  });
};

const getUser = (req: Request, res: Response) => {
  const token = req.query.token as string;
  // const secret = process.env.JWT_SECRET as string;
  const secret = getJwtSecret();

  if (!token) {
    return res.status(400).send({ message: "UserId is required" });
  }
  jwt.verify(token, secret, async (err: any, decodedId: any) => {
    const userInfo = await User.findById(decodedId.id);
    if (!userInfo) {
      return res.status(400).send({ message: "User is not exist" });
    }
    const {
      name,
      avatar,
      age,
      email,
      height,
      weight,
      gender,
      marial_status,
      question_display_interval,
      tip_display_interval,
      health,
      income,
      family,
      romantic,
      happiness,
      pin_count,
    } = userInfo;
    res.status(200).send({
      user: {
        name,
        avatar,
        age,
        userEmail: email,
        height,
        weight,
        gender,
        marial_status,
        question_display_interval,
        tip_display_interval,
        health,
        income,
        family,
        romantic,
        happiness,
        pin_count,
      },
    });
  });
};

const load = async (req: Request, res: Response) => {
  const { userId } = req.body;
  const user = (await User.findById(userId)) as IUser;
  const genderArr = ["female", "male"];
  const marialStatusArr = ["single", "married", "divorced"];
  const { name, age, height, weight, gender, email, marial_status } = user;

  let startUserMessage = `Hello, Your role is my assistant. You need to remember my information in order to help me to achieve my goals. 
  My identification informatin is something like. 
  Email: ${email}, Name: ${name}, Age: ${age}, Height: ${height}, Weight: ${weight}, 
  gender: ${genderArr[gender as number]}, marial_status: ${
    marialStatusArr[marial_status as number]
  }`;

  const userAnswer = await UserAnswer.find({ user_id: userId })
    .populate<{ user_question_id: IUserQuestion }>("user_question_id")
    .exec();
  userAnswer.forEach((item, index) => {
    startUserMessage +=
      "\n" + item.user_question_id.content + "\n" + item.content;
  });

  startUserMessage += "\nThese are my goals and information of the goals\n";

  const goalAnswers = await Goal.aggregate([
    {
      $lookup: {
        from: "goal_answers",
        localField: "_id",
        foreignField: "goal_id",
        as: "answers_per_goal",
        pipeline: [
          {
            $lookup: {
              from: "goal_questions",
              localField: "goal_question_id",
              foreignField: "_id",
              as: "goal_question",
            },
          },
        ],
      },
    },
    { $match: { user_id: new mongoose.Types.ObjectId(userId) } },
  ]);

  goalAnswers.forEach((goal, index) => {
    startUserMessage += `${index + 1}. ${goal.content}\n`;
    goal.answers_per_goal.forEach((answer: any, answerIndex: number) => {
      startUserMessage += `${answerIndex + 1}) ${
        answer.goal_question[0].content
      }\n ${answer.content}\n`;
    });
  });
  const statrtMessages: ChatCompletionMessageParam[] = [
    { role: "user", content: startUserMessage },
  ];

  const aiStartMessage = (await chatBot(statrtMessages)) as string;
  const messages: ChatCompletionMessageParam[] = [
    { role: "user", content: startUserMessage },
    { role: "assistant", content: aiStartMessage },
  ];
  const chatMessages = await Chat.find({
    user_id: userId,
    is_train: true,
  }).limit(1000);
  chatMessages.forEach((item, index) => {
    messages.push({ role: "user", content: item.user_message });
  });
  // req.session.messages = messages;
  storeMessagesPerUser(userId, messages);
  res.status(200).send({ message: "Loading Success!" });
};

const logout = (req: Request, res: Response) => {
  const userId = req.body.userId;
  deleteMessagesPerUser(userId);
  res.status(200).send({ message: "logout success!" });
};

const sendCode = async (req: Request, res: Response) => {
  // Example: Generate a random number between 1000 and 9999
  const code = generateFourRandomNumber(1000, 9999);
  const user = await User.findOneAndUpdate({ email: req.body.email }, { code });
  // Send an email:
  let client = new ServerClient(getPostMarkKey());

  client.sendEmail({
    From: "neil@sunnycoastmedia.com.au",
    To: user?.email.toString(),
    Subject: "Verify Your Email Address with LifeSync",
    HtmlBody: `<h1><strong> ${code.toString()}</strong></h1>`,
  });

  res.status(200).send({ msg: "success!" });
};

const confirmCode = async (req: Request, res: Response) => {
  // Example: Generate a random number between 1000 and 9999
  const user = await User.findOne({ email: req.body.email });
  console.log("usercode", user?.code);
  if (user?.code === req.body.code * 1) {
    res.status(200).send({ confirm: true });
  } else {
    res.status(200).send({ confirm: false });
  }
};

const formatCode = async (req: Request, res: Response) => {
  console.log("email====>", req.body.email);
  // Example: Generate a random number between 1000 and 9999
  await User.updateOne({ email: req.body.email }, { $unset: { code: 1 } });
  res.status(200).send({ msg: "format success!" });
};

const resetPassword = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(password, salt);
  await User.findOneAndUpdate(
    { email: req.body.email },
    { password: hashPassword, $unset: { code: 1 } }
  );
  res.status(200).send({ msg: "reset pwd success!" });
};

export default {
  signup,
  signin,
  getUser,
  logout,
  load,
  sendCode,
  confirmCode,
  formatCode,
  resetPassword,
};
