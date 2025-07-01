const { SlashCommandBuilder } = require('discord.js');
const { vibeProfiles, saveVibeProfiles } = require('./vibeform');
const vibeform = require('./vibeform');
const fetch = require('node-fetch');
const LOG_WEBHOOK = 'https://discord.com/api/webhooks/1389293404503937084/laBZEbpeH1TIPX_BTYNuSgDSe2iHFjh1A_ekgywxuGowYSUJfmjiiAN4Kv4wJbdL8bWe';

function logEditVibe(user) {
  fetch(LOG_WEBHOOK, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      embeds: [
        {
          title: 'Edit VibeForm',
          description: `User: ${user.tag} (${user.id})\nTimestamp: ${new Date().toISOString()}`,
          color: 0x5865F2,
        },
      ],
    }),
  }).catch(() => {});
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('editvibe')
    .setDescription('Edit your vibe profile (redo the vibeform questions).')
    .setDMPermission(true),
  async execute(interaction) {
    if (interaction.guild) {
      return interaction.reply({
        content: 'This command is DM-only!',
        ephemeral: true,
      });
    }
    logEditVibe(interaction.user);
    const userId = interaction.user.id;
    vibeProfiles.delete(userId);
    await saveVibeProfiles();
    // Call the vibeform flow again
    await vibeform.execute(interaction);
  },
}; 