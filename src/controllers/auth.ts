import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";

import { IUser, IUserQuestion, IGoalQuestion } from "../models/schema-types";
import User from "../models/user";
import UserQuestion from "../models/user-question";
import UserAnswer from "../models/user-answer";
import GoalQuestion from "../models/goal-question";
import GoalAnswer from "../models/goal-answer";
import Goal from "../models/goal-answer";
import { getJwtSecret } from "../util";
import { chatBot } from "../chat";
const signup = async (req: Request, res: Response) => {
  console.log("signup", req.body);
  const {
    name,
    email,
    password,
    age,
    height,
    weight,
    gender,
    marial_status,
    children,
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
    user_question_id: userQuestions[0]._id,
    goal_question_id: goalQuestions[0]._id,
  };

  // Crypt the password
  const salt = await bcrypt.genSalt(10);
  userInfo.password = await bcrypt.hash(password, salt);
  // Create the user
  const newUser = await User.create(userInfo);
  //errors = {};
  return res.status(200).send(newUser);
};

const signin = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  console.log(email, password, "jwtsecret->", process.env.JWT_SECRET);

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
  } = user;
  // In jwt.sign set the data that you want to get
  // const jwtsecret = process.env.JWT_SECRET;
  const jwtsecret = getJwtSecret();
  if (!jwtsecret) {
    console.log("jwtsecret is empty");
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
    console.log("decodedId", decodedId);
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
  When I want your help, I will say my email at first. You must identify me by email. My informatin is something like. 
  Email: ${userId}, Name: ${name}, Age: ${age}, Height: ${height}, Weight: ${weight}, 
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

  // const goalAnswer = await Goal.find({ user_id: userId })
  //   .populate<{ goal_question_id: IUserQuestion }>("goal_question_id")
  //   .exec();
  // goalAnswer.forEach((item, index) => {
  //   startUserMessage +=
  //     "\n" + item.goal_question_id.content + "\n" + item.content;
  // });

  await chatBot(startUserMessage);
  res.status(200).send({ message: "Loading success!" });
};

export default { signup, signin, getUser, load };
