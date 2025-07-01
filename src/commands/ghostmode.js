const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { optOutUsers } = require('./findmatch');
const fetch = require('node-fetch');
const LOG_WEBHOOK = 'https://discord.com/api/webhooks/1389293404503937084/laBZEbpeH1TIPX_BTYNuSgDSe2iHFjh1A_ekgywxuGowYSUJfmjiiAN4Kv4wJbdL8bWe';

function logGhostMode(user) {
  fetch(LOG_WEBHOOK, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      embeds: [
        {
          title: 'Ghost Mode Enabled',
          description: `User: ${user.tag} (${user.id})\nTimestamp: ${new Date().toISOString()}`,
          color: 0x23272A,
        },
      ],
    }),
  }).catch(() => {});
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ghostmode')
    .setDescription('Opt out of matchmaking without deleting your profile.')
    .setDMPermission(true),
  async execute(interaction) {
    if (interaction.guild) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle('Ghost Mode')
            .setDescription('This command is DM-only!')
            .setColor(0x23272A)
        ],
        ephemeral: true,
      });
    }
    optOutUsers.add(interaction.user.id);
    logGhostMode(interaction.user);
    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle('Ghost Mode')
          .setDescription('You are now in Ghost Mode and will not be matched with others, but your profile is saved.')
          .setColor(0x23272A)
      ],
      ephemeral: true,
    });
  },
}; 