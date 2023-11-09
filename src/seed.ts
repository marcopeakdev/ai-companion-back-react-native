import express, { Request, Response } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import UserQestion from "./models/user-question";
import GoalQestion from "./models/goal-question";
import Domain from "./models/domain";

// const uri = process.env.ATLAS_URI;
const uri = "mongodb+srv://peakgenius226:AlwaysSuccess226!@ai-companion.4vbg1k2.mongodb.net/ai_companion?retryWrites=true&w=majority"

const connectDB = async () => {
  if (uri) {
    await mongoose.connect(uri);
  } else {
    console.log("process.env.ATLAS_URI is empty");
  }
  const connection = mongoose.connection;
  connection.once("open", () => {
    console.log("Connected Database Successfully");
  });
};

connectDB();

const seedingUserQuestions = [
  { content: "What are your short-term and long-term goals?" },
  { content: "What is your current occupation?" },
  { content: "How do you prefer to spend your free time?" },
  { content: "What does a typical day look like for you?" },
  {
  
    content: "What are your favorite forms of exercise or physical activity?",
  },
  {
  
    content: "How would you describe your current eating habits?",
  },
  {
  
    content: "What is your preferred way to de-stress and relax?",
  },
  {
  
    content: "How do you approach time management and organization?",
  },
  {
  
    content:
      "What kind of social support or relationships do you have in your life?",
  },
  {
  
    content: "How do you currently approach your personal finances?",
  },
  { content: "What are your favorite hobbies or interests?" },
  {
  
    content:
      "Do you have any preferred learning methods or topics of interest?",
  },
  { content: "What is one challenge you're currently facing?" },
  { content: "What motivates you to pursue your goals?" },
  {
  
    content:
      "Do you have any preferred travel destinations or cultural experiences?",
  },
  {
  
    content: "How do you prioritize health and wellness in your life?",
  },
  {
  
    content: "Is there a specific skill or habit you're trying to develop?",
  },
  { content: "How important is work-life balance to you?" },
  {
  
    content:
      "Do you have any specific values or principles that guide your decisions?",
  },
  {
  
    content:
      "What is something you wish to improve or change about your current lifestyle?",
  },
];
const seedingGoalQuestions = [
  { content: "Which level of this goal are you in 1-10?" },
  { content: "What is your current occupation?" },
  { content: "How do you prefer to spend your free time?" },
  { content: "What does a typical day look like for you?" },
  {
  
    content: "What are your favorite forms of exercise or physical activity?",
  },
  {
  
    content: "How would you describe your current eating habits?",
  },
  {
  
    content: "What is your preferred way to de-stress and relax?",
  },
  {
  
    content: "How do you approach time management and organization?",
  },
  {
  
    content:
      "What kind of social support or relationships do you have in your life?",
  },
  {
  
    content: "How do you currently approach your personal finances?",
  },
  { content: "What are your favorite hobbies or interests?" },
  {
  
    content:
      "Do you have any preferred learning methods or topics of interest?",
  },
  { content: "What is one challenge you're currently facing?" },
  { content: "What motivates you to pursue your goals?" },
  {
  
    content:
      "Do you have any preferred travel destinations or cultural experiences?",
  },
  {
  
    content: "How do you prioritize health and wellness in your life?",
  },
  {
  
    content: "Is there a specific skill or habit you're trying to develop?",
  },
  { content: "How important is work-life balance to you?" },
  {
  
    content:
      "Do you have any specific values or principles that guide your decisions?",
  },
  {
  
    content:
      "What is something you wish to improve or change about your current lifestyle?",
  },
];

const seedingDomains = [
  { content: "Health" },
  { content: "Income" },
  { content: "Happiness" },
  { content: "Family" },
  { content: "Romantic" },
];

const seedDB = async () => {
  await Domain.deleteMany({});
  await Domain.insertMany(seedingDomains);
  await UserQestion.deleteMany({});
  await UserQestion.insertMany(seedingUserQuestions);
  await GoalQestion.deleteMany({});
  await GoalQestion.insertMany(seedingGoalQuestions);
  console.log("seed successfully!");
};

seedDB().then(() => {
  mongoose.connection.close();
});
