const mongoose = require("mongoose");

const GuildConfig = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },

  botName: { type: String, default: "Pudding Music" },
  botLogo: { type: String, default: null },
  botBanner: { type: String, default: null },

  prefix: { type: String, default: "=" },
  noPrefix: { type: Boolean, default: false },

  premiumUntil: { type: Number, default: 0 },

}, { timestamps: true });

module.exports = mongoose.model("GuildConfig", GuildConfig);