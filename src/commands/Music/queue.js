const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
  name: "queue",
  aliases: ["q"],
  description: "Show music queue",
  category: "Music",

  run: async (client, message) => {
    const player = client.manager.players.get(message.guild.id);
    if (!player || (!player.queue.current && !player.queue.length)) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#2b2d31")
            .setDescription("❌ **Queue is empty**\nUse `play` to add songs.")
        ]
      });
    }

    const current = player.queue.current;
    const tracks = player.queue.map(
      (t, i) => `\`${i + 1}\` • **${t.title}**`
    );

    const pageSize = 10;
    let page = 0;
    const totalPages = Math.ceil(tracks.length / pageSize) || 1;

    const embed = () => {
      const start = page * pageSize;
      const end = start + pageSize;

      return new EmbedBuilder()
        .setColor("#000000") // premium black
        .setAuthor({
          name: "Music Queue",
          iconURL: client.user.displayAvatarURL(),
        })
        const embed = new EmbedBuilder()
    .setColor("#000000")
    .setDescription(
      `<:yes:1447593797306417174> Added **${track.title}**`
        )
        .setFooter({
          text: `Page ${page + 1}/${totalPages}`
        });
    };

    const row = () =>
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("prev")
          .setEmoji("⬅️")
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(page === 0),
        new ButtonBuilder()
          .setCustomId("next")
          .setEmoji("➡️")
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(page + 1 >= totalPages)
      );

    const msg = await message.reply({
      embeds: [embed()],
      components: totalPages > 1 ? [row()] : [],
    });

    if (totalPages <= 1) return;

    const collector = msg.createMessageComponentCollector({
      filter: (i) => i.user.id === message.author.id,
    });

    collector.on("collect", async (i) => {
      if (i.customId === "prev") page--;
      if (i.customId === "next") page++;

      await i.update({
        embeds: [embed()],
        components: [row()],
      });
    });
  },
};