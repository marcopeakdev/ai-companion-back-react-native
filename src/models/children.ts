import mongoose from "mongoose";
const { Schema } = mongoose;

const childrenSchema = new Schema({
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

module.exports = mongoose.model("Children", childrenSchema);
