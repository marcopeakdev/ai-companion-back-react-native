import OpenAI from "openai";
import { Request, Response } from "express";
import UserQuestion from "../models/user-question";
import UserAnswer from "../models/user-answer";
import Goal from "../models/goal";
import GoalQuestion from "../models/goal-question";
import GoalAnswer from "../models/goal-answer";
import User from "../models/user";
import { IUserQuestion, IGoalQuestion, IGoal } from "../models/schema-types";
import { getOpenAiKey, getTipCount, selectOpenAiChatModel } from "../util";

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
    const existGoalAnswer = await GoalAnswer.find({
      user_id: userId,
      goal_question_id: goalQuestionId,
    });
    if (existGoalAnswer.length !== 0) {
      await GoalAnswer.findOneAndUpdate(
        { user_id: userId, goal_question_id: goalQuestionId },
        { content: goalAnswer }
      );
    } else {
      const savingGoalAnswerRow = {
        goal_id: goalId,
        goal_question_id: goalQuestionId,
        content: goalAnswer,
      };
      await GoalAnswer.create(savingGoalAnswerRow);
    }
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

const openai = new OpenAI({
  apiKey: getOpenAiKey(), // defaults to process.env["OPENAI_API_KEY"]
});

const updateTips = async (req: Request, res: Response) => {
  const { userId, goalId } = req.body;
  const goal = await Goal.findOne({ _id: goalId });
  if (!goal) return res.status(400).send({ message: "Goal doesn't exist" });
  let tipPrompt =
    "These are my information consists of questions and answers. \n";

  const userAnswers = await UserAnswer.find({ user_id: userId })
    .populate<{ user_question_id: IUserQuestion }>("user_question_id")
    .exec();
  userAnswers.forEach((item) => {
    tipPrompt += item.user_question_id?.content + " " + item.content + "\n ";
  });

  const goalAnswers = await GoalAnswer.find({ goal_id: goalId })
    .populate<{ goal_question_id: IGoalQuestion }>("goal_question_id")
    .exec();
  goalAnswers.forEach((item) => {
    tipPrompt += item.goal_question_id?.content + " " + item.content + "\n ";
  });

  tipPrompt += `Also, this is my goal. Give me ${getTipCount()} tips to achieve the goal based on my information. ${
    goal.content
  }`;
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
