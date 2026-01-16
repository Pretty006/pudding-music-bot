const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "nppanel",
aliases: ["npp"],
  run: async (client, message) => {
    message.reply({
      embeds: [
        new EmbedBuilder()
          .setColor("#2b2d31")
          .setTitle("🔐 NoPrefix Premium Panel")
          .setDescription(
            "✨ Features:\n" +
            "• No command prefix needed\n" +
            "• Faster execution\n" +
            "• VIP System\n\n" +
            "**Redeem:** `noprefix-redeem <key>`"
          )
      ]
    });
  }
};