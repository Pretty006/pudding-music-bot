// events/interactionCreate.js
const NoPrefix = require("../../models/NoPrefixSchema.js");
const FreeTrial = require("../../models/FreeTrialSchema.js");

const sendWebhook = require("../../utils/sendWebhook");
module.exports = async (client, interaction) => {
  if (!interaction) return;

  // =========================
  // 🎯 BUTTON HANDLER
  // =========================
  if (interaction.isButton?.()) {

    // 🎁 FREE TRIAL BUTTON
    if (interaction.customId === "claim_free_noprefix") {

      const user = interaction.user;

      // Check already claimed
      const already = await FreeTrial.findOne({ userId: user.id });
      if (already) {
        return interaction.reply({
          embeds: [
            {
              color: 0x2b2d31,
              title: "❌ Trial Already Claimed",
              description:
                "You have already used your **Free 7 Days Trial**.\nEach user can only claim it **once**."
            }
          ],
          ephemeral: true
        });
      }

      const expire = Date.now() + 7 * 24 * 60 * 60 * 1000;

      await NoPrefix.create({
        key: `TRIAL-${user.id}`,
        userId: user.id,
        expireAt: expire,
        permanent: false
      });

      await FreeTrial.create({
        userId: user.id,
        claimedAt: Date.now()
      });

      return interaction.reply({
        embeds: [
          {
            color: 0x2b2d31,
            title: "🎉 Trial Activated!",
            description:
              "You successfully claimed **7 Days NoPrefix Premium**.\nEnjoy commands without prefix 😎",
            fields: [{ name: "⏳ Expires In", value: "7 Days" }],
            thumbnail: { url: user.displayAvatarURL() }
          }
        ],
        ephemeral: true
      });
    }

    return; // button ke baad exit
  }

  // =========================
  // 🎯 SLASH COMMAND HANDLER
  // =========================
  if (!interaction.isChatInputCommand?.()) return;

  const command = client.slashCommands.get(interaction.commandName);
  if (!command) return;

  try {
  if (typeof command.execute === "function") {
    await command.execute(interaction, client);
  } else if (typeof command.run === "function") {
    await command.run(client, interaction);
  } else {
    console.error(`Slash command "${interaction.commandName}" has no execute / run`);
  }
} catch (err) {
    console.error(`[SLASH CMD ERROR]:`, err);

    const res = {
      content: "⚠️ Something went wrong.",
      ephemeral: true
    };

    interaction.deferred || interaction.replied
      ? await interaction.followUp(res)
      : await interaction.reply(res);
  }
};