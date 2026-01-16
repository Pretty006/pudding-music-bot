const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const fs = require("fs");
const path = require("path");

module.exports = {
  name: "help",
  aliases: ["h"],
  description: "Displays all available commands",
  category: "Info",
  cooldown: 5,

  run: async (client, message, args, prefix) => {
    // 🔐 Safety: agar client ready nahi, to Discord API call mat karo
    if (!client.isReady()) return;

    const categories = {};
    const commandsPath = path.join(__dirname, "..");

    fs.readdirSync(commandsPath).forEach((dir) => {
      const dirPath = path.join(commandsPath, dir);
      if (!fs.existsSync(dirPath) || !fs.lstatSync(dirPath).isDirectory()) return;

      const files = fs.readdirSync(dirPath).filter((f) => f.endsWith(".js"));

      categories[dir] = files.map((file) => {
        try {
          const cmd = require(path.join(dirPath, file));
          return `\`${cmd.name || file.replace(".js", "")}\``;
        } catch {
          return null;
        }
      }).filter(Boolean);
    });

    const mainEmbed = new EmbedBuilder()
      .setColor("#2b2d31")
      .setAuthor({
        name: "Pudding Music Help",
        iconURL: client.user.displayAvatarURL()
      })
      .setDescription("Select a category below to view available commands.")
      .addFields(
        {
          name: "<:music:1447588489150337024> Music Playback",
          value: categories["Music"]?.join(", ") || "No Commands",
          inline: false
        },
        {
          name: "<:queue:1447588946279141546> Queue & Filters",
          value: categories["Filters"]?.length ? categories["Filters"].join(", ") : "No Commands",
          inline: false
        },
        {
          name: "<:OxP:1447585974358900827> Favourites",
          value: categories["Favourite"]?.join(", ") || "No Commands",
          inline: false
        },
        {
          name: "<:playlist:1447588770818822207> Playlist",
          value: categories["Playlist"]?.join(", ") || "No Commands",
          inline: false
        },
        {
          name: "<:config:1447587614361256138> Settings",
          value: categories["Config"]?.join(", ") || "No Commands",
          inline: false
        },
        {
          name: "<:info:1447588123654623395> Information",
          value: categories["Info"]?.join(", ") || "No Commands",
          inline: false
        }
      )
      .setImage("https://cdn.discordapp.com/attachments/1443960171788242995/1458026311422574687/IMG_20260106_144505.jpg")
      .setFooter({
        text: `Requested by ${message.author.tag}`,
        iconURL: message.author.displayAvatarURL()
      });

    const supportButton = new ButtonBuilder()
      .setLabel("Support Server")
      .setURL("https://discord.gg/YZBqdhHHf9")
      .setStyle(ButtonStyle.Link);

    const premiumButton = new ButtonBuilder()
      .setLabel("Premium")
      .setURL("https://discord.gg/YZBqdhHHf9")
      .setStyle(ButtonStyle.Link);

    const inviteButton = new ButtonBuilder()
      .setLabel("Invite Me")
      .setURL(
        `https://discord.com/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot%20applications.commands`
      )
      .setStyle(ButtonStyle.Link);

    const buttonRow = new ActionRowBuilder().addComponents(
      inviteButton,
      supportButton,
      premiumButton
    );

    // 🛡️ Safe send (no crash if REST fails)
    try {
      await message.reply({
        embeds: [mainEmbed],
        components: [buttonRow],
      });
    } catch (e) {
      console.log("Help reply failed:", e.message);
    }
  },
};