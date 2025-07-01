const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('note')
    .setDescription('Save a private note.')
    .addStringOption(option =>
      option.setName('text')
        .setDescription('The note to save')
        .setRequired(true)
    ),
  async execute(interaction, { userNotes }) {
    const text = interaction.options.getString('text');
    const userId = interaction.user.id;
    if (!userNotes.has(userId)) {
      userNotes.set(userId, []);
    }
    userNotes.get(userId).push(text);
    await interaction.reply({ content: '📬 Sending you a DM...', flags: 64 });
    try {
      await interaction.user.send(`📝 **Note saved:**\n${text}`);
    } catch (dmError) {
      await interaction.followUp({ content: '❌ I couldn\'t send you a DM. Please check your privacy settings.', flags: 64 });
    }
  }
}; 