const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { matchStats } = require('./findmatch');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('matchstats')
    .setDescription('Show your match and reveal stats.')
    .setDMPermission(true),
  async execute(interaction) {
    if (interaction.guild) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle('Match Stats')
            .setDescription('This command is DM-only!')
            .setColor(0x23272A)
        ],
        ephemeral: true,
      });
    }
    const userId = interaction.user.id;
    const stats = (matchStats && matchStats[userId]) ? matchStats[userId] : { matches: 0, min: 'N/A', max: 'N/A', reveals: 0 };
    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle('Your Match Stats')
          .setColor(0x23272A)
          .addFields(
            { name: 'Matches Found', value: String(stats.matches), inline: true },
            { name: 'Compatibility Range', value: `${stats.min}% - ${stats.max}%`, inline: true },
            { name: 'Reveal Count', value: String(stats.reveals), inline: true }
          )
      ],
      ephemeral: true,
    });
  },
}; 