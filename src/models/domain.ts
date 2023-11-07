import mongoose from "mongoose";
//import mongoose from 'mongoose';
const { Schema } = mongoose;

const domainSchema = new Schema({
  content: {
    type: String,
    required: true,
  }
});

export default mongoose.model("Domain", domainSchema);