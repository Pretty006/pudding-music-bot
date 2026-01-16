// commands/skip.js
const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "skip",
  aliases: ["s", "next"],
  description: "Skip the currently playing track",
  category: "Music",
  cooldown: 3,
  inVc: true,
  sameVc: true,

  run: async (client, message, args, prefix, player) => {
    try {
      if (!player) {
        return message.channel.send({
          embeds: [
            new EmbedBuilder()
              .setAuthor({
                name: "No Player Found For This Guild",
                iconURL: message.author.displayAvatarURL({ dynamic: true }),
              })
              .setColor(client.color),
          ],
        });
      }

      const currentTrack = player.queue.current;
      if (!currentTrack) {
        return message.channel.send({
          embeds: [
            new EmbedBuilder()
              .setDescription("⚠️ There is no track currently playing.")
              .setColor(client.color),
          ],
        });
      }

      // Skip to next track
      await player.skip(); // this triggers your playerEnd event, which handles autoplay too

      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `<:forward:1447587996877455444> Skipped **${currentTrack.title}**`
            )
            .setColor("#000000"),
        ],
      });
    } catch (err) {
      console.error("[Skip CMD Error]", err);
      return message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setDescription("⚠️ Something went wrong while skipping the track.")
            .setColor("#000000"),
        ],
      });
    }
  },
};
