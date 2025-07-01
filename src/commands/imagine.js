const { SlashCommandBuilder } = require('discord.js');
const { imagine } = require('../lib/ai.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('imagine')
    .setDescription('Generate an image from a prompt.')
    .addStringOption(option =>
      option.setName('prompt')
        .setDescription('The prompt for the image')
        .setRequired(true)
    ),
  async execute(interaction, { logToWebhook }) {
    const prompt = interaction.options.getString('prompt');
    try {
      await interaction.deferReply();
      const imageUrl = await imagine(prompt);
      await interaction.editReply({ content: `**Prompt:** ${prompt}\n${imageUrl}` });
      await logToWebhook(`imagine used by ${interaction.user.tag} with prompt: "${prompt}" in ${interaction.guild ? interaction.guild.name + ' (' + interaction.guild.id + ')' : 'DM'}`);
    } catch (err) {
      await interaction.editReply({ content: 'Error generating image.' });
    }
  }
}; 