import { Schema, model } from "mongoose";
import { IDomain } from "./schema-types";

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

export default model<IDomain>("Domain", domainSchema);