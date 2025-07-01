const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clearnotes')
    .setDescription('Delete all your saved notes and reminders.'),
  async execute(interaction, { userNotes, userReminders }) {
    const confirmEmbed = new EmbedBuilder()
      .setColor(0xFF0000)
      .setTitle('⚠️ Confirmation Needed')
      .setDescription('Are you sure you want to delete all of your notes and reminders? This action cannot be undone.');
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('confirm_clear')
          .setLabel('Yes, delete everything')
          .setStyle(4),
        new ButtonBuilder()
          .setCustomId('cancel_clear')
          .setLabel('Cancel')
          .setStyle(2)
      );
    await interaction.reply({ embeds: [confirmEmbed], components: [row], flags: 64 });
    const filter = i => i.user.id === interaction.user.id;
    try {
      const confirmation = await interaction.channel.awaitMessageComponent({ filter, time: 15000 });
      if (confirmation.customId === 'confirm_clear') {
        userNotes.delete(interaction.user.id);
        userReminders.delete(interaction.user.id);
        await confirmation.update({ content: '✅ All your notes and reminders have been deleted.', embeds: [], components: [] });
      } else {
        await confirmation.update({ content: 'Action cancelled.', embeds: [], components: [] });
      }
    } catch (e) {
      await interaction.editReply({ content: 'Confirmation not received within 15 seconds, cancelling.', embeds: [], components: [] });
    }
  }
}; 