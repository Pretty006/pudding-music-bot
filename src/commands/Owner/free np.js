const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

module.exports = {
  name: "sendnoprefix",
  aliases: ["npbutton"],
  owner: true,

  run: async (client, message) => {

    const channel = message.guild.channels.cache.get("1443284431161790577");
    if (!channel) return message.reply("❌ Channel not found.");

    const embed = new EmbedBuilder()
      .setTitle("🎁 Free 7 Days Premium Trial")
      .setDescription(
        "Click the button below to claim **7 Days No Prefix Premium Access**.\n\n" +
        "⚠️ This trial can be claimed **only once per user**."
      )
      .setColor("#2b2d31")
      .setFooter({
        text: "Premium Trial Program",
        iconURL: message.client.user.displayAvatarURL()
      });

    const btn = new ButtonBuilder()
      .setCustomId("claim_free_noprefix")
      .setLabel("🎉 Claim 7 Day Trial")
      .setStyle(ButtonStyle.Success);

    const row = new ActionRowBuilder().addComponents(btn);

    await channel.send({ embeds: [embed], components: [row] });
    message.reply("✅ Trial button sent successfully.");
  },
};