const { autoplayHandler } = require("../../handlers/autoplay.js");
const { EmbedBuilder } = require("discord.js");

module.exports = async (player, track) => {
  try {
    if (!player || player.destroyed) return;

    const client = player.manager.client;

    // If queue still has songs, don't show end UI
    if (player.queue && player.queue.tracks && player.queue.tracks.length > 0) return;

    const channelId = player.textId || player.textChannel;
if (!channelId) return;

const textChannel = client.channels.cache.get(channelId);
if (!textChannel) return;

    if (textChannel) {
      const autoplayEnabled = player.data.get("autoplay");

      const embed = new EmbedBuilder()
        .setColor("#0b0b0b")
        .setAuthor({
          name: "Playback Finished",
          iconURL: client.user.displayAvatarURL()
        })
        .setDescription(
          autoplayEnabled
            ? `🎶 **${track.title}**\n\n🔁 **Autoplay is enabled**\nSearching for the next track...`
            : `🎶 **${track.title}**\n\n⏹ **Queue is empty**\nAdd more songs using \`/play\``
        )
        .setThumbnail(track.thumbnail || null)
        .setFooter({ text: "Pudding Music • Premium Experience" })
        .setTimestamp();

      await textChannel.send({ embeds: [embed] }).catch(() => {});
    }

    // Autoplay system
    if (player.data.get("autoplay")) {
      await autoplayHandler(player, client, track).catch(() => {});
    }

  } catch (err) {
    console.log("[TrackEnd Error]", err);
  }
};