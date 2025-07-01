require('dotenv/config');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getVibeProfiles } = require('./vibeform');
const fetch = require('node-fetch');

const LOG_WEBHOOK = process.env.MATCH_WEBHOOK_URL;

// Set of userIds who have opted out or ghosted (for now, empty)
const optOutUsers = new Set();

// Shared object for matched pairs
const matchedPairs = {};

const matchStats = {};

function logMatchEvent(type, user, other, percent, shared, timestamp) {
  fetch(LOG_WEBHOOK, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      embeds: [
        {
          title: type,
          description: `User: ${user.tag} (${user.id})\nMatched: ${other ? other.tag + ' (' + other.id + ')' : 'None'}\nCompatibility: ${percent !== undefined ? percent + '%' : 'N/A'}\nShared: ${shared ? shared.join(', ') : 'N/A'}\nTimestamp: ${timestamp}`,
          color: type === 'Match Found' ? 0x57F287 : 0x23272A,
        },
      ],
    }),
  }).catch(() => {});
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('findmatch')
    .setDescription('Find your best vibe match! (DM-only)')
    .setDMPermission(true),
  async execute(interaction) {
    if (interaction.guild) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle('FindMatch')
            .setDescription('This command is **DM-only** for privacy! Please DM me to use it.')
            .setColor(0x23272A)
        ],
        ephemeral: true,
      });
    }
    const userId = interaction.user.id;
    const vibeProfiles = await getVibeProfiles();
    const userProfile = vibeProfiles.get(userId);
    if (!userProfile) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle('FindMatch')
            .setDescription('You need to fill out your vibe profile first! Use `/vibeform`.')
            .setColor(0x23272A)
        ],
        ephemeral: true,
      });
    }
    // Find all matches with 80%+ compatibility
    let matches = [];
    for (const [otherId, otherProfile] of vibeProfiles.entries()) {
      if (otherId === userId) continue;
      if (optOutUsers.has(otherId)) continue;
      let score = 0;
      let shared = [];
      for (const key of Object.keys(userProfile)) {
        if (userProfile[key] === otherProfile[key]) {
          score++;
          shared.push(userProfile[key]);
        }
      }
      const percent = Math.round((score / 8) * 100);
      if (percent >= 80) {
        matches.push({ otherId, percent, shared, score });
      }
    }
    if (matches.length === 0) {
      logMatchEvent('No Match Found', interaction.user, null, undefined, undefined, new Date().toISOString());
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle('FindMatch')
            .setDescription('No strong vibe matches found right now. Try again later!')
            .setColor(0x23272A)
        ],
        ephemeral: true,
      });
    }
    // Sort matches highest to lowest
    matches.sort((a, b) => b.percent - a.percent);
    // Store the top match for /reveal
    matchedPairs[userId] = { matchedUserId: matches[0].otherId };
    matchedPairs[matches[0].otherId] = { matchedUserId: userId };
    // Notify both users (via DM) for each match
    for (const match of matches) {
      const otherUser = await interaction.client.users.fetch(match.otherId).catch(() => null);
      if (otherUser) {
        try {
          await otherUser.send({
            embeds: [
              new EmbedBuilder()
                .setTitle('🔔 You have a new vibe match!')
                .setDescription('Someone just matched with you at ' + match.percent + '% compatibility! Use `/findmatch` or `/reveal` to see your matches.')
                .setColor(0xFFC0CB)
            ]
          });
        } catch {}
      }
    }
    // Notify the user with all matches
    const matchList = matches.map((m, i) => `**${i+1}.** <@${m.otherId}> — **${m.percent}%** shared: ${m.shared.slice(0,3).join(', ')}`).join('\n');
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle('🔍 Xander found vibe matches!')
          .setColor(0x23272A)
          .setDescription('Here are your best matches (80%+):\n\n' + matchList + '\n\nUse `/reveal` to connect!')
      ],
      ephemeral: true
    });
  },
  matchedPairs,
  optOutUsers,
  matchStats,
}; 