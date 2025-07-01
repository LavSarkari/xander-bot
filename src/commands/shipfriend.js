const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { vibeProfiles } = require('./vibeform');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('shipfriend')
    .setDescription('Compare your vibeform with a friend!')
    .addUserOption(opt => opt.setName('user').setDescription('The user to compare with').setRequired(true))
    .setDMPermission(true),
  async execute(interaction) {
    if (interaction.guild) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle('ShipFriend')
            .setDescription('This command is DM-only!')
            .setColor(0x23272A)
        ],
        ephemeral: true,
      });
    }
    const userId = interaction.user.id;
    const other = interaction.options.getUser('user');
    if (!other) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle('ShipFriend')
            .setDescription('You must mention a user!')
            .setColor(0xED4245)
        ],
        ephemeral: true,
      });
    }
    const profile1 = vibeProfiles.get(userId);
    const profile2 = vibeProfiles.get(other.id);
    if (!profile1 || !profile2) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle('ShipFriend')
            .setDescription('Both users must have a vibe profile!')
            .setColor(0xED4245)
        ],
        ephemeral: true,
      });
    }
    let score = 0;
    let shared = [];
    for (const key of Object.keys(profile1)) {
      if (profile1[key] === profile2[key]) {
        score++;
        shared.push(profile1[key]);
      }
    }
    const percent = Math.round((score / 8) * 100);
    const sharedTags = shared.slice(0, 4).join(', ');
    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle('💞 ShipFriend Results')
          .setColor(0x23272A)
          .addFields(
            { name: 'Compatibility', value: percent + '%', inline: true },
            { name: 'Shared Vibes', value: sharedTags || '—', inline: true }
          )
          .setDescription(`You and <@${other.id}> have a vibe compatibility of **${percent}%**!`)
      ],
      ephemeral: true,
    });
  },
}; 