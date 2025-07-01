const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const { getVibeProfiles } = require('./vibeform');
const { matchStats } = require('./findmatch');

const vibeQuestions = [
  { id: 'q1', label: 'Age Range', emoji: '🎂' },
  { id: 'q2', label: 'Core Vibe', emoji: '🌊' },
  { id: 'q3', label: 'Music Mood', emoji: '🎵' },
  { id: 'q4', label: 'Energy Level', emoji: '⚡' },
  { id: 'q5', label: 'Discord Usage', emoji: '💬' },
  { id: 'q6', label: 'Social Battery', emoji: '🔋' },
  { id: 'q7', label: 'Looking For', emoji: '🔎' },
  { id: 'q8', label: 'Chaos Quotient', emoji: '😇' },
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('profile')
    .setDescription('View your vibe profile and match stats.')
    .setDMPermission(true),
  async execute(interaction) {
    if (interaction.guild) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle('Profile')
            .setDescription('This command is DM-only!')
            .setColor(0x23272A)
        ],
        ephemeral: true,
      });
    }
    const userId = interaction.user.id;
    const vibeProfiles = await getVibeProfiles();
    const profile = vibeProfiles.get(userId);
    if (!profile) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle('Profile')
            .setDescription('You have not filled out your vibe profile yet! Use `/vibeform` to get started.')
            .setColor(0xED4245)
        ],
        ephemeral: true,
      });
    }
    // Build answers section
    const answers = vibeQuestions.map(q => `**${q.emoji} ${q.label}:** ${profile[q.id] || '—'}`).join('\n');
    // Stats
    const stats = (matchStats && matchStats[userId]) ? matchStats[userId] : { matches: 0, min: 'N/A', max: 'N/A', reveals: 0 };
    const statsLine = `Matches: **${stats.matches}** | Compatibility: **${stats.min}% – ${stats.max}%** | Reveals: **${stats.reveals}**`;
    // Embed
    const embed = new EmbedBuilder()
      .setTitle('🌈 Your Vibe Profile')
      .setColor(0x57F287)
      .setThumbnail(interaction.user.displayAvatarURL())
      .setDescription(`**📝 Answers**\n${answers}\n\n━━━━━━━━━━━━━━\n\n📊 **Stats**\n${statsLine}\n\n*Use the buttons below to edit or view more.*`)
      .setFooter({ text: 'Use /editvibe to update your profile.' });
    // Action buttons
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('profile_edit').setLabel('Edit Profile').setStyle(ButtonStyle.Primary).setEmoji('✏️'),
      new ButtonBuilder().setCustomId('profile_stats').setLabel('View Stats').setStyle(ButtonStyle.Secondary).setEmoji('📊'),
      new ButtonBuilder().setCustomId('profile_close').setLabel('Close').setStyle(ButtonStyle.Danger).setEmoji('❌')
    );
    await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
    const message = await interaction.fetchReply();
    const collector = message.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 60000,
      filter: i => i.user.id === userId
    });
    collector.on('collect', async i => {
      if (i.customId === 'profile_edit') {
        await i.update({ content: 'Launching profile editor...', embeds: [], components: [] });
        await interaction.client.commands.get('editvibe').execute(interaction);
      } else if (i.customId === 'profile_stats') {
        await i.reply({ content: `Matches: ${stats.matches}\nCompatibility: ${stats.min}% – ${stats.max}%\nReveals: ${stats.reveals}`, ephemeral: true });
      } else if (i.customId === 'profile_close') {
        await i.update({ content: 'Profile closed.', embeds: [], components: [] });
        collector.stop();
      }
    });
    collector.on('end', async () => {
      try {
        await interaction.editReply({ components: [] });
      } catch {}
    });
  },
}; 