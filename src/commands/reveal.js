const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { vibeProfiles } = require('./vibeform');
const { matchedPairs, matchStats } = require('./findmatch');
const fetch = require('node-fetch');

const LOG_WEBHOOK = 'https://discord.com/api/webhooks/1389293404503937084/laBZEbpeH1TIPX_BTYNuSgDSe2iHFjh1A_ekgywxuGowYSUJfmjiiAN4Kv4wJbdL8bWe';

function logRevealAction(type, user1, user2) {
  fetch(LOG_WEBHOOK, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      embeds: [
        {
          title: type,
          description: `User1: ${user1.tag} (${user1.id})\nUser2: ${user2 ? user2.tag + ' (' + user2.id + ')' : 'N/A'}\nTimestamp: ${new Date().toISOString()}`,
          color: type === 'Reveal Success' ? 0x57F287 : 0x23272A,
        },
      ],
    }),
  }).catch(() => {});
}

// Track reveals and matches: { userId: { matchedUserId, hasRevealed } }
const revealStatus = {};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reveal')
    .setDescription('Reveal yourself to your best match! (DM-only)')
    .setDMPermission(true),
  async execute(interaction) {
    if (interaction.guild) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle('Reveal')
            .setDescription('This command is **DM-only** for privacy! Please DM me to use it.')
            .setColor(0x23272A)
        ],
        ephemeral: true,
      });
    }
    const userId = interaction.user.id;
    // Get the user's last matched pair
    const matchInfo = matchedPairs[userId];
    if (!matchInfo || !matchInfo.matchedUserId) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle('Reveal')
            .setDescription('You need to find a match first using `/findmatch`.')
            .setColor(0x23272A)
        ],
        ephemeral: true,
      });
    }
    const otherId = matchInfo.matchedUserId;
    // Mark this user as revealed
    revealStatus[userId] = { matchedUserId: otherId, hasRevealed: true };
    // Check if the other user has revealed
    if (revealStatus[otherId] && revealStatus[otherId].hasRevealed && revealStatus[otherId].matchedUserId === userId) {
      // Both have revealed! DM both users
      try {
        const user = await interaction.client.users.fetch(userId);
        const other = await interaction.client.users.fetch(otherId);
        const msg = `🎉 You've both opted in to connect! Meet: <@${userId}> & <@${otherId}>.`;
        await user.send({ embeds: [new EmbedBuilder().setDescription(msg).setColor(0x57F287)] });
        await other.send({ embeds: [new EmbedBuilder().setDescription(msg).setColor(0x57F287)] });
        // Increment reveal count for both users
        [userId, otherId].forEach(uid => {
          if (matchStats && matchStats[uid]) matchStats[uid].reveals = (matchStats[uid].reveals || 0) + 1;
        });
        logRevealAction('Reveal Success', user, other);
      } catch (e) {}
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle('Reveal')
            .setDescription('You both revealed! Check your DMs.')
            .setColor(0x57F287)
        ],
        ephemeral: true,
      });
    } else {
      // Only one has revealed
      logRevealAction('Reveal Triggered', interaction.user, { tag: otherId, id: otherId });
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle('Reveal')
            .setDescription('Waiting for the other person to reveal…')
            .setColor(0x23272A)
        ],
        ephemeral: true,
      });
    }
  },
}; 