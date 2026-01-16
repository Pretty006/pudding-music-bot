const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "stop",
  description: `Stops the player and clears the queue.`,
  category: "Music",
  cooldown: 5,
  inVc: true,
  sameVc: true,
  dj: true,

  run: async (client, message, args, prefix, player) => {
    if (!player) {
      return message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setDescription("<:mod:1447583028145557545> No active player found in this server.")
            .setColor("#2f3136")
        ]
      });
    }

    // 🧹 Cleanup
    player.setLoop("none");
    player.data.set("autoplay", false);
    player.queue.clear();

    // 🧼 Delete Now Playing message
    const nowPlayingMessage = player.data.get("nplaying");
    if (nowPlayingMessage) {
      const channel = client.channels.cache.get(nowPlayingMessage.channelId);
      if (channel) {
        const msg = await channel.messages.fetch(nowPlayingMessage.id).catch(() => null);
        if (msg && msg.deletable) {
          await msg.delete().catch(() => {});
        }
      }
      player.data.delete("nplaying");
    }

    // 🔁 Skip or Destroy
    if (player.queue.size === 0) {
      player.destroy();
    } else {
      player.stop();
    }

    // ✅ Send embed with footer
    return message.channel.send({
      embeds: [
        new EmbedBuilder()
          .setColor(client.color)
          .setDescription(`<:yes:1447593797306417174> Music playback has been **stopped** and the queue has been **cleared**.`)
          .setFooter({
            text: `Thank you for using Pudding! Feel free to queue more tracks anytime.`,
            iconURL: client.user.displayAvatarURL()
          })
      ]
    });
  }
};