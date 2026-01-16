const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const noPrefix = require("../../models/NoPrefixSchema.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("redeem")
    .setDescription("Redeem premium key")
    .addStringOption(o =>
      o.setName("key").setDescription("Enter key").setRequired(true)
    ),

  run: async (client, interaction) => {

    const key = interaction.options.getString("key");

    await interaction.deferReply({ ephemeral: true });

    const found = await noPrefix.findOne({ key });
    if (!found)
      return interaction.editReply("Invalid ya used key");

    if (found.userId)
      return interaction.editReply("Already used key");

    found.userId = interaction.user.id;
    await found.save();

    interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setColor("#2b2d31")
          .setTitle("🎉 NoPrefix Activated")
          .setDescription(found.permanent ? "Lifetime Premium" : "Temporary Premium")
      ]
    });
  }
};