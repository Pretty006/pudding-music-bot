const { EmbedBuilder } = require("discord.js");
const noPrefix = require("../../models/NoPrefixSchema.js");

const sendWebhook = require("../../utils/sendWebhook");
module.exports = {
  name: "npredeem",
aliases: ["npr"],
  run: async (client, message, args) => {

    const key = args[0];
    if (!key) return message.reply("Key likho!");

    const found = await noPrefix.findOne({ key });

    if (!found)
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#2b2d31")
            .setTitle("❌ Invalid Key")
            .setDescription("Key galat ya already used.")
        ]
      });

    if (found.userId)
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#2b2d31")
            .setTitle("⚠️ Already Redeemed")
            .setDescription("Ye key kisi aur ne use kar li.")
        ]
      });

    found.userId = message.author.id;
    await found.save();

    message.reply({
      embeds: [
        new EmbedBuilder()
          .setColor("#2b2d31")
          .setTitle("🎉 NoPrefix Activated")
          .setDescription(found.permanent ? "Lifetime Premium Active" : "Temporary Premium Active")
      ]
    });
  }
};