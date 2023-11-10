import mongoose from "mongoose";
const { Schema } = mongoose;

interface IChildren {
  name: String,
  age: Number,
  gender: Number,

}

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

module.exports = mongoose.model<IChildren>("Children", childrenSchema);
