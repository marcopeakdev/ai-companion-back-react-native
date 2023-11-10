import mongoose from "mongoose";
const { Schema } = mongoose;

interface IDomain {
  content: String
}

const domainSchema = new Schema<IDomain>(
  {
    content: {
      type: String,
      required: true,
    },
  },
  { toJSON: { virtuals: true } }
);

domainSchema.virtual("goals", {
  ref: "Goal",
  localField: "_id",
  foreignField: "domain_id",
  justOne: false, // set true for one-to-one relationship
});

export default mongoose.model<IDomain>("Domain", domainSchema);