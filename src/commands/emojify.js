const { SlashCommandBuilder } = require('discord.js');
const { emojify } = require('../lib/ai.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('emojify')
    .setDescription('Convert text to expressive emoji-filled speech.')
    .addStringOption(option =>
      option.setName('text')
        .setDescription('The text to emojify')
        .setRequired(true)
    ),
  async execute(interaction, { logToWebhook }) {
    const input = interaction.options.getString('text');
    let deferred = false;
    try {
      await interaction.deferReply({ flags: 64 });
      deferred = true;
      const result = await emojify(input);
      await interaction.editReply({ content: result });
      await logToWebhook(`emojify used by ${interaction.user.tag} (${interaction.user.id}) in ${interaction.guild ? interaction.guild.name + ' (' + interaction.guild.id + ')' : 'DM'}`);
    } catch (err) {
      if (deferred) {
        await interaction.editReply({ content: 'Error emojifying text.' });
      } else {
        await interaction.reply({ content: 'Error emojifying text.' });
      }
      return;
    }
  }
}; 