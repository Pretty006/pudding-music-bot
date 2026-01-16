const {
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require("discord.js");

const BlacklistUserSchema = require("../../models/BlacklistUserSchema.js");
const BlacklistServerSchema = require("../../models/BlacklistServerSchema.js");
const DjRoleSchema = require("../../models/DjroleSchema.js");
const SetupSchema = require("../../models/SetupSchema.js");
const IgnoreChannelSchema = require("../../models/IgnoreChannelSchema.js");
const IgnoreCommandSchema = require("../../models/IgnoreCommandSchema.js");
const IgnoreBypassSchema = require("../../models/IgnoreBypassSchema.js");
const premiumGuildSchema = require("../../models/PremiumGuildSchema.js");
const maintenanceCheck = require("../custom/maintainance.js");

// SaaS system
const { getGuild } = require("../../utils/guildConfig");

module.exports = async (client) => {
  client.on("messageCreate", async (message) => {
    if (!message.guild || message.author.bot) return;

    const player = client.manager.players.get(message.guild.id);

    const guildData = await getGuild(message.guild.id);
    const prefix = guildData.prefix;
    const noPrefix = guildData.noPrefix;

    // Setup channel lock
    const setupData = await SetupSchema.findOne({ guildId: message.guild.id });
    if (setupData && setupData.channelId === message.channel.id) return;

    // Blacklists
    if (await BlacklistUserSchema.findOne({ userId: message.author.id })) return;
    if (await BlacklistServerSchema.findOne({ serverId: message.guild.id })) return;

    // Prefix / mention
    const mentionRegex = new RegExp(`^<@!?${client.user.id}>`);
    const usedPrefix = message.content.match(mentionRegex)
      ? message.content.match(mentionRegex)[0]
      : prefix;

    if (!noPrefix && !message.content.startsWith(usedPrefix)) return;

    const args = noPrefix
      ? message.content.startsWith(usedPrefix)
        ? message.content.slice(usedPrefix.length).trim().split(/ +/)
        : message.content.trim().split(/ +/)
      : message.content.slice(usedPrefix.length).trim().split(/ +/);

    const cmd = args.shift()?.toLowerCase();

    if (!cmd && message.content === `<@${client.user.id}>`) {
      return message.reply(`My prefix is \`${prefix}\``);
    }

    const command =
      client.mcommands.get(cmd) ||
      client.mcommands.find((c) => c.aliases && c.aliases.includes(cmd));
    if (!command) return;

    // Maintenance
    if (await maintenanceCheck(client, message, command)) return;

    // Ignore system
    const bypass = await IgnoreBypassSchema.findOne({
      guildId: message.guild.id,
      userId: message.author.id,
    });

    if (!bypass) {
      if (
        await IgnoreChannelSchema.findOne({
          guildId: message.guild.id,
          channelId: message.channel.id,
        })
      ) {
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("#000000")
              .setTitle("Channel Restricted")
              .setDescription("Commands are disabled here.")
              .setFooter({ text: guildData.botName }),
          ],
        });
      }

      if (
        await IgnoreCommandSchema.findOne({
          guildId: message.guild.id,
          command: command.name,
        })
      ) {
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("#000000")
              .setTitle("Command Restricted")
              .setDescription("This command is disabled in this server.")
              .setFooter({ text: guildData.botName }),
          ],
        });
      }
    }

    // VC checks
    if (command.inVc && !message.member.voice.channel) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#000000")
            .setDescription("Join a voice channel first.")
            .setFooter({ text: guildData.botName }),
        ],
      });
    }

    if (command.sameVc && player) {
      const botVC = message.guild.members.me.voice.channelId;
      if (
        message.member.voice.channelId &&
        botVC &&
        message.member.voice.channelId !== botVC
      ) {
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("#000000")
              .setDescription("You must be in the same VC as the bot.")
              .setFooter({ text: guildData.botName }),
          ],
        });
      }
    }

    // DJ
    if (command.dj) {
      const dj = await DjRoleSchema.findOne({ guildId: message.guild.id });
      if (dj && !message.member.roles.cache.has(dj.roleId)) {
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("#000000")
              .setDescription("DJ role required.")
              .setFooter({ text: guildData.botName }),
          ],
        });
      }
    }

    // Premium (per server)
    if (command.premium) {
      const prem = await premiumGuildSchema.findOne({ Guild: message.guild.id });
      if (!prem || (!prem.Permanent && Date.now() > prem.Expire)) {
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("#000000")
              .setDescription("This is a Premium command."),
          ],
        });
      }
    }

    // Run
    try {
      await command.run(client, message, args, prefix, player);
    } catch (err) {
      console.error(err);
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#000000")
            .setDescription("An error occurred."),
        ],
      });
    }
  });
};