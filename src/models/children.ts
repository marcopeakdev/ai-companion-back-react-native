import { Schema, model } from "mongoose";
import { IChildren } from "../types/schema";

const childrenSchema = new Schema<IChildren>({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
  },
  age: {
    type: Number,
    required: true,
  },
  gender: {
    type: Number,
    required: true,
  },
});

module.exports = model<IChildren>("Children", childrenSchema);
