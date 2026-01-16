// src/events/interactionCreate.js
module.exports = (client) => {
  client.on("interactionCreate", async (interaction) => {
    try {

      // ========== Slash Commands ==========
      if (interaction.isChatInputCommand()) {
        const command = client.slashCommands.get(interaction.commandName);
        if (!command) return;

        if (typeof command.execute === "function") {
          await command.execute(interaction, client);
        } else if (typeof command.run === "function") {
          await command.run(client, interaction);
        } else {
          console.error(`Slash command "${interaction.commandName}" has no execute / run`);
        }
        return;
      }

      // ========== Modal ==========
      if (interaction.isModalSubmit()) {
        const reportCmd = client.slashCommands.get("report");
        if (reportCmd?.modalHandler) {
          await reportCmd.modalHandler(interaction);
        }
      }

    } catch (err) {
      console.error("interaction error:", err);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: "❌ Something went wrong while executing that interaction.",
          ephemeral: true,
        }).catch(() => {});
      }
    }
  });
};