const {
  EmbedBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
} = require("discord.js");

module.exports = {
  name: "invite",
  aliases: ["inv"],
  description: "Invite the bot to your server or join the support server",
  category: "Info",
  cooldown: 5,
  run: async (client, message, args, prefix) => {
    const embed = new EmbedBuilder()
      .setColor("#000000") // Spotify green
      .setAuthor({
        name: `${client.user.username} Invite`,
        iconURL: client.user.displayAvatarURL(),
      })
      .setTitle("🎵 Invite Pudding to Your Server!")
      .setDescription(
        "Bring high-quality music and powerful server management to your Discord community! " +
        "Use the buttons below to invite pudding or join our support server for help and updates."
      )
      .setThumbnail(client.user.displayAvatarURL({ size: 256 }))
      .setFooter({
        text: `Requested by ${message.author.username}`,
        iconURL: message.author.displayAvatarURL(),
      })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("Invite pudding")
        .setStyle(ButtonStyle.Link)
        .setURL(
          `https://discord.com/oauth2/authorize?client_id=1443190285701087294`
        ),
      new ButtonBuilder()
        .setLabel("Support Server")
        .setStyle(ButtonStyle.Link)
        .setURL(`${client.config.ssLink}`)
    );

    await message.reply({ embeds: [embed], components: [row] });
  },
};