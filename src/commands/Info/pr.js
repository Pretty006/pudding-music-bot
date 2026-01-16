const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");
const NoPrefixSchema = require("../../models/NoPrefixSchema.js");
const moment = require("moment");

// Support server ID (for role based badges)
const BADGE_GUILD_ID = "1443190181371973795";

// Force Owner IDs
const OWNER_IDS = [
  "1085459608707014706",
  "1379911892037800128"
];

// Role based badges
const badgeMap = {
  "1418333819752157294": { emoji: "🛡️", label: "Head Executive" },
  "1418333819009892363": { emoji: "⭐", label: "Senior Executive" },
  "1418333818305384591": { emoji: "🎖️", label: "Executive" },
  "1418331807492866129": { emoji: "📌", label: "Head Manager" },
  "1418328917298778204": { emoji: "📎", label: "Senior Manager" },
  "1408361045352906793": { emoji: "📂", label: "Manager" },
  "1408360165786386552": { emoji: "🔧", label: "Admin" },
  "1408360622315278426": { emoji: "🔨", label: "Moderator" },
  "1408360623439478855": { emoji: "🧩", label: "Staff" },
  "1408361435809058846": { emoji: "🌟", label: "Big Server Owner" },
  "1383073624902209607": { emoji: "🤝", label: "Partner" },
  "1388178874667503877": { emoji: "🐞", label: "Bug Hunter" },
  "1408361031201198090": { emoji: "💖", label: "Supporter" },
  "1408361311167057990": { emoji: "🎧", label: "Music Listener" }
};

module.exports = {
  name: "profile",
  aliases: ["pr", "badges"],
  description: "Show user profile with badges and no-prefix status",
  category: "Info",
  cooldown: 5,

  run: async (client, message) => {
    const user = message.mentions.users.first() || message.author;

    // Get support server member for role badges
    const badgeGuild = client.guilds.cache.get(BADGE_GUILD_ID);
    let member = null;
    if (badgeGuild) {
      try {
        member = await badgeGuild.members.fetch(user.id);
      } catch {}
    }

    // Build badges
    let badges = [];

    // Force owner badge
    if (OWNER_IDS.includes(user.id)) {
      badges.push("👑 **Owner**");
    }

    // Role based badges
    if (member) {
      for (const roleId in badgeMap) {
        if (member.roles.cache.has(roleId)) {
          badges.push(`${badgeMap[roleId].emoji} **${badgeMap[roleId].label}**`);
        }
      }
    }

    if (!badges.length) badges.push("No badges yet");

    // No Prefix status
    let noPrefix = "Not active";
    try {
      const data = await NoPrefixSchema.findOne({ userId: user.id });
      if (data) {
        if (data.isPermanent) {
          noPrefix = "Permanent";
        } else if (data.expirationDate) {
          const days = moment(data.expirationDate).diff(moment(), "days");
          noPrefix = `Active (${days} days left)`;
        }
      }
    } catch {}

    // Embed
    const embed = new EmbedBuilder()
      .setColor("#000000")
      .setAuthor({
        name: `${user.username}'s Profile`,
        iconURL: user.displayAvatarURL({ dynamic: true })
      })
      .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 512 }))
      .setDescription(
        `**User:** ${user.tag}\n` +
        `**ID:** \`${user.id}\`\n` +
        `**Account Created:** ${moment(user.createdAt).format("DD MMMM YYYY")}`
      )
      .addFields(
        {
          name: "Badges",
          value: badges.join("\n"),
          inline: true
        },
        {
          name: "No-Prefix",
          value: noPrefix,
          inline: true
        }
      )
      .setFooter({
        text: `Requested by ${message.author.username}`,
        iconURL: message.author.displayAvatarURL({ dynamic: true })
      })
      .setTimestamp();

    // Buttons (safe for link buttons)
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("Support Server")
        .setStyle(ButtonStyle.Link)
        .setURL("https://discord.gg/XR6Ws2Tbee"),
      new ButtonBuilder()
        .setLabel("Vote Bot")
        .setStyle(ButtonStyle.Link)
        .setURL("https://top.gg/bot/1443190285701087294?s=05235abffca6a")
    );

    return message.reply({ embeds: [embed], components: [row] });
  }
};