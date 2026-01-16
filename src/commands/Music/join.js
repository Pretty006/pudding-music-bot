const {
  EmbedBuilder,
  PermissionsBitField,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

module.exports = {
  name: "join",
  aliases: ["j"],
  description: "Join the bot to your voice channel",
  category: "Music",
  cooldown: 5,
  inVc: true,
  sameVc: false,
  premium: false,
  dj: true,

  run: async (client, message, args, prefix) => {
    const userChannel = message.member.voice?.channel;
    const bot = message.guild.members.me;
    const botChannel = bot.voice?.channel;

    // ================= VOICE NOT CONNECTED ==================
    if (!userChannel) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#ff1f4a")
            .setAuthor({ name: "🎧 Voice Channel Required", iconURL: client.user.displayAvatarURL() })
            .setDescription(
              "You must **join a voice channel** before using this command.\n\n" +
              "> 🔹 Join a voice channel\n" +
              `> 🔹 Then use \`${prefix}join\`\n\n` +
              "Let's vibe together 🎶"
            )
            .setThumbnail(client.user.displayAvatarURL())
            .setFooter({ text: "Pudding Music • Smooth Experience" })
            .setTimestamp()
        ]
      });
    }

    // ============= PERMISSION CHECK ===============
    const missingPerms = [];
    if (!userChannel.permissionsFor(bot).has(PermissionsBitField.Flags.ViewChannel))
      missingPerms.push("View Channel");
    if (!userChannel.permissionsFor(bot).has(PermissionsBitField.Flags.Connect))
      missingPerms.push("Connect");
    if (!userChannel.permissionsFor(bot).has(PermissionsBitField.Flags.Speak))
      missingPerms.push("Speak");

    if (missingPerms.length) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#ff8c00")
            .setAuthor({ name: "⚠️ Missing Permissions", iconURL: client.user.displayAvatarURL() })
            .setDescription(
              "I don’t have enough permissions to join your voice channel.\n\n" +
              `> ❗ Required: \`${missingPerms.join(", ")}\`\n\n` +
              "Please fix and try again 😊"
            )
            .setFooter({ text: `Requested by ${message.author.username}` })
            .setTimestamp()
        ]
      });
    }

    // ============= BOT ALREADY CONNECTED ===========
    if (botChannel) {
      if (botChannel.id === userChannel.id) {
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("#00ffa2")
              .setAuthor({ name: "🔊 Already Connected", iconURL: client.user.displayAvatarURL() })
              .setDescription(
                `I'm already vibing in **${botChannel.name}** 😎\n\n` +
                `> 🎵 Start Music: \`${prefix}play <song>\`\n`
              )
              .setFooter({ text: "Pudding Music • Perfectly Synced" })
              .setTimestamp()
          ]
        });
      }

      // ===== MOVE BOT BUTTON =====
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("move_bot")
          .setLabel("Move Bot Here")
          .setStyle(ButtonStyle.Primary)
          .setEmoji("🔄")
      );

      const msg = await message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#ffaa00")
            .setAuthor({ name: "⚠ Already In Another Channel", iconURL: client.user.displayAvatarURL() })
            .setDescription(
              `I'm currently in **${botChannel.name}**.\n\n` +
              "If you have `Move Members` permission, press the button below 👇"
            )
            .setFooter({ text: `Requested by ${message.author.username}` })
            .setTimestamp()
        ],
        components: [row]
      });

      const collector = msg.createMessageComponentCollector({
        filter: (i) => i.user.id === message.author.id,
        time: 60000
      });

      collector.on("collect", async (i) => {
        if (i.customId === "move_bot") {
          if (!message.member.permissions.has(PermissionsBitField.Flags.MoveMembers)) {
            return i.update({
              embeds: [
                new EmbedBuilder()
                  .setColor("#ff1f4a")
                  .setAuthor({ name: "⛔ Access Denied" })
                  .setDescription(
                    "You do not have **Move Members** permission!"
                  )
              ],
              components: []
            });
          }

          await bot.voice.setChannel(userChannel);

          return i.update({
            embeds: [
              new EmbedBuilder()
                .setColor("#00ffa2")
                .setAuthor({ name: "✅ Successfully Moved", iconURL: client.user.displayAvatarURL() })
                .setDescription(
                  `I am now connected to **${userChannel.name}** 🎧\n\n` +
                  `> 🎵 Play Music: \`${prefix}play <song>\``
                )
                .setTimestamp()
            ],
            components: []
          });
        }
      });

      collector.on("end", () => {
        msg.edit({ components: [] }).catch(() => {});
      });

      return;
    }

    // ========= FRESH JOIN ===========
    await client.manager.createPlayer({
      guildId: message.guild.id,
      voiceId: userChannel.id,
      textId: message.channel.id,
      deaf: true,
      shardId: message.guild.shardId
    });

    return message.reply({
      embeds: [
        new EmbedBuilder()
          .setColor("#00ffa2")
          .setAuthor({ name: "🎧 Connected Successfully", iconURL: client.user.displayAvatarURL() })
          .setDescription(
            `Joined **${userChannel.name}** smoothly 💨\n\n` +
            `> 🎶 Start music with: \`${prefix}play <song>\`\n` +
            "Let’s create some vibes 😍"
          )
          .setThumbnail(client.user.displayAvatarURL())
          .setFooter({ text: `Requested by ${message.author.username}` })
          .setTimestamp()
      ]
    });
  }
};