const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("developer")
    .setDescription("Shows developer profile details"),

  /**
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   * @param {import('../../structure/client')} client
   */
  async execute(interaction, client) {

    const devId = "1085459608707014706"; // <-- apni ID

    // User fetch
    const user = await client.users.fetch(devId).catch(() => null);
    const member = await interaction.guild?.members.fetch(devId).catch(() => null);

    if (!user)
      return interaction.reply({
        content: "Developer not found!",
        ephemeral: true,
      });

    // Status
    let status = "⚫ Offline";
    if (member?.presence) {
      const s = member.presence.status;
      if (s === "online") status = "🟢 Online";
      else if (s === "idle") status = "🟡 Idle";
      else if (s === "dnd") status = "🔴 Do Not Disturb";
    }

    // Mutual servers count
    const mutualServers = client.guilds.cache.filter(g =>
      g.members.cache.has(devId)
    ).size;

    // Bio / About Me (v14 supports .bio sometime may return null)
    const bio = user.bio || "No About Me set";

    // Embed
    const embed = new EmbedBuilder()
      .setTitle("👤 Developer Information")
      .setThumbnail(user.displayAvatarURL({ size: 1024 }))
      .addFields(
        { name: "Name", value: `${user.tag}`, inline: true },
        { name: "ID", value: `${user.id}`, inline: true },
        { name: "Status", value: status, inline: true },
        {
          name: "Account Created",
          value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`,
          inline: true
        },
        { name: "Mutual Servers", value: `${mutualServers}`, inline: true },
        { name: "About Me", value: `${bio}` }
      )
      .setColor("Blue")
      .setFooter({ text: "Developer Profile" })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};