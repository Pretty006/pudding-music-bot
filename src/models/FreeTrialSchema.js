const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true // ek hi baar claim kar sake
  },
  claimedAt: {
    type: Number,
    default: Date.now()
  }
});

module.exports = mongoose.model("FreeTrial", schema);