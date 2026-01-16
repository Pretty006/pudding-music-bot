const { EmbedBuilder, WebhookClient } = require("discord.js");
const config = require("../../config/config.js");
module.exports = async (client) => {
  const TARGET_GUILD_ID = "1443190181371973795";

  const AUTOROLE_IDS = [
    "1452597902454030480",
    "1443253484005625888",
  ];

  // Webhook client
  const webhookClient = new WebhookClient({
    url: config.wel});

  client.on("guildMemberAdd", async (member) => {
    if (member.guild.id !== TARGET_GUILD_ID) return;

    try {
      // Auto Roles
      for (const roleId of AUTOROLE_IDS) {
        const role = member.guild.roles.cache.get(roleId);
        if (role) {
          await member.roles.add(role).catch(() => {});
        }
      }

      // Welcome Embed
      const welcomeEmbed = new EmbedBuilder()
        .setColor(client.color || 0x5865f2)
        .setAuthor({
          name: `${member.guild.name}`, // Server ka naam
          iconURL: member.guild.iconURL({ dynamic: true }),
        })
        .setDescription(
          `**﹒[loot](https://discord.com/channels/1443190181371973795/1443284431161790577)﹒ ☆ ﹒ [Bot Info](https://discord.com/channels/1443190181371973795/1443629128258424862)﹒⪩[Announc](https://discord.com/channels/1443190181371973795/1452813992866222140) ⪨﹒⟡
-# ⏝︶⊹︶⏝︶ ୨♡୧ ︶⏝︶⊹︶⏝**`
        )
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))
        .setFooter({
          text: `Made By Excel`,
          iconURL:
            "https://media.discordapp.net/attachments/1412590250009825391/1415492656611459165/70e1dd3c-659f-48c1-8697-fd342ce327b5.jpg",
        });

      // Webhook ke through send karna
      await webhookClient.send({
        content: `${member}`, // Member mention
        username: "Pudding", // Webhook name
        avatarURL: "https://cdn.discordapp.com/attachments/1412590250009825391/1415492095547805860/flixo.png?ex=68c4b8be&is=68c3673e&hm=e00cd912cd2b50b4664da5feed726407e42317e4ecbd20445631b14e0b4e41b4&",
        embeds: [welcomeEmbed],
      });
    } catch (error) {
      console.error("An error occurred during guildMemberAdd event:", error);
    }
  });
};
