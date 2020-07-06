const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let demoSchema = new Schema({
  ts: Number,
  val: Number,
});

const demoModel = mongoose.model("demo", demoSchema);

module.exports = { demoModel };
