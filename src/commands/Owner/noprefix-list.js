const { EmbedBuilder } = require("discord.js");
const noPrefix = require("../../models/NoPrefixSchema.js");
const OWNERS = ["1085459608707014706", "1379911892037800128"];

module.exports = {
  name: "nplist",
  owner: true,

  run: async (client, message) => {
if (!OWNERS.includes(message.author.id)) {
      const embed = new EmbedBuilder()
      .setColor("#2b2d31")
      .setDescription("<:no:1447588569693687903> Only Bot Owner can check NoPrefix List!");

    return message.reply({ embeds: [embed] });
  }
      
    const users = await noPrefix.find({ userId: { $ne: null } });

    if (!users.length)
      return message.reply("Koi premium user nahi hai");

    const list = users
      .map((u, i) => `**${i + 1}.** <@${u.userId}> — ${u.permanent 
 ? "Lifetime" 
 : `Temporary — ${Math.max(0, Math.floor((u.expireAt - Date.now()) / (1000 * 60 * 60 * 24)))} days left`}`)
      .join("\n");

    message.reply({
      embeds: [
        new EmbedBuilder()
          .setColor("#2b2d31")
          .setTitle("🔐 Premium Users")
          .setDescription(list)
      ]
    });
  }
};