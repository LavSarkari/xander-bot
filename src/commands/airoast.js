const { SlashCommandBuilder } = require('discord.js');
const { aiRoast } = require('../lib/ai.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('airoast')
    .setDescription('Roast a user with an AI-generated insult.')
    .addUserOption(option =>
      option.setName('target')
        .setDescription('The user to roast')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('text')
        .setDescription('Optional text to include in the roast')
        .setRequired(false)
    ),
  async execute(interaction, { logToWebhook }) {
    const targetUser = interaction.options.getUser('target');
    const text = interaction.options.getString('text') ?? targetUser.username;
    let deferred = false;
    try {
      await interaction.deferReply();
      deferred = true;
      const roast = await aiRoast(text);
      await interaction.editReply({ content: `<@${targetUser.id}> ${roast}` });
      await logToWebhook(`airoast used by ${interaction.user.tag} on ${targetUser.tag} in ${interaction.guild ? interaction.guild.name + ' (' + interaction.guild.id + ')' : 'DM'}`);
    } catch (err) {
      try {
        if (deferred) {
          await interaction.editReply({ content: 'Error generating roast.' });
        } else {
          await interaction.reply({ content: 'Error generating roast.' });
        }
      } catch (e) {
        console.error('Failed to send error reply:', e);
      }
      return;
    }
  }
}; 