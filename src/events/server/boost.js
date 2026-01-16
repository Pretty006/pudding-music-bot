const { EmbedBuilder, WebhookClient } = require("discord.js");
const NoPrefixSchema = require("../../models/NoPrefixSchema.js");
const config = require("../../config/config.js");
const HEADQUARTER_ROLE = "1443190181371973795"; // Add Your Main Role ( which u want read for booster person)
const webhook = new WebhookClient({
  url: config.error_log || "",
});

module.exports = async (client) => {
  client.on("guildMemberUpdate", async (oldMember, newMember) => {
    const hadRole = oldMember.roles.cache.has(HEADQUARTER_ROLE);
    const hasRole = newMember.roles.cache.has(HEADQUARTER_ROLE);

    // Role Added
    if (!hadRole && hasRole) {
      let exists = await NoPrefixSchema.findOne({ userId: newMember.id });
      if (!exists) {
        await NoPrefixSchema.create({ userId: newMember.id });
      }

      try {
        await webhook.send({
          content: `${newMember}`,
          embeds: [
            new EmbedBuilder()
              .setColor(client.color ?? 0x000000)
              .setTitle("Thankyou for boosting")
              .setDescription(
                `Hey **${newMember.user.tag}**,<:supporter:1447586603408035957> thank you for boosting our server.\nWe have now given you the noprefix role. If you remove the boost, noprefix will automatically be removed from my database, so please don't remove your boost.`
              )
              .setThumbnail(newMember.user.displayAvatarURL({ dynamic: true }))
              .setTimestamp(),
          ],
        });
      } catch (err) {
        console.error("Webhook send failed (role added):", err);
      }
    }

    // Role Removed
    if (hadRole && !hasRole) {
      await NoPrefixSchema.deleteOne({ userId: newMember.id });

      try {
        await webhook.send({
          content: `${newMember}`,
          embeds: [
            new EmbedBuilder()
              .setColor(client.color ?? 0x5865f2)
              .setTitle("Boost Removed")
              .setDescription(
                `Oh no, **${newMember.user.tag}**,<:supporter:1447586603408035957> your **NoPrefix Mode** has been revoked.\nYou'll need to use the prefix again to command Pudding — but the music never stops!`
              )
              .setThumbnail(newMember.user.displayAvatarURL({ dynamic: true }))
              .setTimestamp(),
          ],
        });
      } catch (err) {
        console.error("Webhook send failed (role removed):", err);
      }
    }
  });
};
