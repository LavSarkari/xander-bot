const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('listnotes')
    .setDescription('List all your saved notes and reminders.'),
  async execute(interaction, { userNotes, userReminders }) {
    const userId = interaction.user.id;
    const notes = userNotes.get(userId) || [];
    const reminders = userReminders.get(userId) || [];
    const embed = new EmbedBuilder()
      .setColor(0x0099FF)
      .setTitle('Your Saved Notes & Reminders');
    if (notes.length === 0 && reminders.length === 0) {
      embed.setDescription('You have no saved notes or reminders.');
    } else {
      if (notes.length > 0) {
        embed.addFields({ name: '📝 Notes', value: notes.map((note, i) => `${i + 1}. ${note}`).join('\n') });
      }
      if (reminders.length > 0) {
        embed.addFields({ name: '⏰ Reminders', value: reminders.map((rem, i) => `${i + 1}. ${rem.text} (<t:${Math.floor(rem.time / 1000)}:R>)`).join('\n') });
      }
    }
    await interaction.reply({ embeds: [embed], flags: 64 });
  }
}; 