const mongoose = require("mongoose");

const CustomBotSchema = new mongoose.Schema({
  guildId: { type: String, unique: true },

  avatar: String,
  banner: String,
  bio: String,
  nickname: String
});

module.exports = mongoose.model("CustomBot", CustomBotSchema);