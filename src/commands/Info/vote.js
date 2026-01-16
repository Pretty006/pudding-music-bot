const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
  name: "vote",
  description: "Vote for pudding to support its growth",
  category: "Info",
  cooldown: 5,
  run: async (client, message, args, prefix) => {
    const embed = new EmbedBuilder()
      .setColor("#000000") // Spotify green
      .setAuthor({
        name: `${client.user.username} Voting`,
        iconURL: client.user.displayAvatarURL(),
      })
      .setTitle("🌟 Support pudding with Your Vote!")
      .setDescription(
        "Vote for pudding on Discord Bot List to help us grow and bring you new features! " +
        "Your support fuels our mission to enhance your Discord experience with top-tier music and management tools."
      )
      .setThumbnail(client.user.displayAvatarURL({ size: 256 }))
      .setFooter({
        text: `Requested by ${message.author.username}`,
        iconURL: message.author.displayAvatarURL(),
      })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("Vote on DBL")
        .setStyle(ButtonStyle.Link)
        .setEmoji("🗳️")
        .setURL(`${client.config.dbl}/upvote`)
    );

    await message.reply({ embeds: [embed], components: [row] });
  },
};