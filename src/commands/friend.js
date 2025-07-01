const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, EmbedBuilder, ComponentType, PermissionFlagsBits } = require('discord.js');
const fetch = require('node-fetch');

// In-memory storage for quiz answers and match queue
const friendProfiles = new Map(); // userId -> { answers, timestamp }
const matchQueue = [];

const LOG_WEBHOOK = 'https://discord.com/api/webhooks/1389293404503937084/laBZEbpeH1TIPX_BTYNuSgDSe2iHFjh1A_ekgywxuGowYSUJfmjiiAN4Kv4wJbdL8bWe';

function logToWebhook(content, embed) {
  fetch(LOG_WEBHOOK, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content,
      embeds: embed ? [embed] : undefined,
    }),
  }).catch(() => {});
}

const quizQuestions = [
  {
    id: 'vibe',
    question: 'What vibe are you looking for in a friend?',
    options: [
      { label: 'Chill & Laid-back', value: 'chill' },
      { label: 'Adventurous & Outgoing', value: 'adventurous' },
      { label: 'Supportive & Good Listener', value: 'supportive' },
      { label: 'Funny & Meme-Lord', value: 'funny' },
      { label: 'Creative & Artsy', value: 'creative' },
    ],
  },
  {
    id: 'activity',
    question: 'Pick a favorite way to hang out online:',
    options: [
      { label: 'Gaming', value: 'gaming' },
      { label: 'Voice Chats', value: 'vc' },
      { label: 'Watching Shows/Anime', value: 'shows' },
      { label: 'Deep Talks', value: 'deeptalks' },
      { label: 'Sharing Memes', value: 'memes' },
    ],
  },
  {
    id: 'timezone',
    question: 'What is your timezone region?',
    options: [
      { label: 'Americas', value: 'americas' },
      { label: 'Europe/Africa', value: 'europe' },
      { label: 'Asia/Oceania', value: 'asia' },
      { label: "Doesn't matter", value: 'any' },
    ],
  },
  {
    id: 'intro',
    question: 'How do you usually start a convo?',
    options: [
      { label: 'Hey! :wave:', value: 'hey' },
      { label: 'Random meme/gif', value: 'meme' },
      { label: 'Deep question', value: 'deep' },
      { label: 'I wait for others', value: 'wait' },
    ],
  },
];

function getMatch(userId, profile) {
  // Simple matching: look for someone with at least 2 matching answers, not self
  for (let i = 0; i < matchQueue.length; i++) {
    const other = matchQueue[i];
    if (other.userId === userId) continue;
    let matches = 0;
    for (const q of quizQuestions) {
      if (profile.answers[q.id] === other.answers[q.id]) matches++;
    }
    if (matches >= 2) {
      matchQueue.splice(i, 1); // Remove from queue
      return other;
    }
  }
  return null;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('friend')
    .setDescription('Find a new friend based on your vibe! (DM-only)')
    .setDMPermission(true),
  async execute(interaction) {
    if (interaction.guild) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle('Xander.FRIEND')
            .setDescription('This command is **DM-only** for privacy! Please DM me to use it.')
            .setColor(0x5865F2)
        ],
        ephemeral: true,
      });
    }
    // Start quiz
    let answers = {};
    let step = 0;
    const userId = interaction.user.id;
    const askQuestion = async () => {
      const q = quizQuestions[step];
      const row = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('friend_quiz')
          .setPlaceholder('Select one...')
          .addOptions(q.options)
      );
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle('Xander.FRIEND')
            .setDescription(`**${q.question}**`)
            .setColor(0x5865F2)
            .setFooter({ text: `Step ${step + 1} of ${quizQuestions.length}` })
        ],
        components: [row],
      });
    };
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle('Xander.FRIEND')
          .setDescription("Let's find you a new friend! Answer a few quick questions to get matched. Your answers are **private** and never shared publicly.")
          .setColor(0x5865F2)
      ],
      components: [],
      ephemeral: true,
    });
    await askQuestion();
    const collector = interaction.channel.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      time: 120000,
      max: quizQuestions.length,
    });
    collector.on('collect', async (i) => {
      if (i.user.id !== userId) return i.reply({ content: 'This is not your quiz!', ephemeral: true });
      const q = quizQuestions[step];
      answers[q.id] = i.values[0];
      step++;
      if (step < quizQuestions.length) {
        await i.deferUpdate();
        await askQuestion();
      } else {
        collector.stop();
        // Save profile
        friendProfiles.set(userId, { answers, timestamp: Date.now() });
        // Try to match
        const match = getMatch(userId, { answers });
        if (match) {
          // Notify both users
          const matchEmbed = new EmbedBuilder()
            .setTitle("🎉 You've got a friend match!")
            .setDescription('We found someone with a similar vibe. Want to connect?')
            .addFields(
              { name: 'Their vibe', value: quizQuestions.map(q => `**${q.question}**\n${match.answers[q.id]}`).join('\n\n') }
            )
            .setColor(0x57F287);
          const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('friend_accept').setLabel('Connect!').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('friend_decline').setLabel('Pass').setStyle(ButtonStyle.Secondary)
          );
          // DM both users
          try {
            const user = await interaction.client.users.fetch(userId);
            const other = await interaction.client.users.fetch(match.userId);
            await user.send({ embeds: [matchEmbed], components: [row] });
            await other.send({ embeds: [matchEmbed], components: [row] });
            logToWebhook(`Friend match: <@${userId}> & <@${match.userId}>`, {
              title: 'Friend Match',
              description: `Users: <@${userId}> & <@${match.userId}>\nAnswers: ${JSON.stringify(answers)}`,
              color: 0x57F287,
            });
          } catch (e) {}
          await i.update({
            embeds: [
              new EmbedBuilder()
                .setTitle('Xander.FRIEND')
                .setDescription('We found you a match! Check your DMs to connect.')
                .setColor(0x57F287)
            ],
            components: [],
          });
        } else {
          // Add to queue
          matchQueue.push({ userId, answers });
          logToWebhook(`Friend quiz submitted: <@${userId}>`, {
            title: 'Friend Quiz Submitted',
            description: `User: <@${userId}>\nAnswers: ${JSON.stringify(answers)}`,
            color: 0x5865F2,
          });
          await i.update({
            embeds: [
              new EmbedBuilder()
                .setTitle('Xander.FRIEND')
                .setDescription("You're in the friend queue! We'll DM you as soon as we find a match. Stay chill ✨")
                .setColor(0x5865F2)
            ],
            components: [],
          });
        }
      }
    });
    collector.on('end', async (collected, reason) => {
      if (reason === 'time') {
        await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setTitle('Xander.FRIEND')
              .setDescription("⏰ Time's up! If you still want to find a friend, just run `/friend` again.")
              .setColor(0xED4245)
          ],
          components: [],
        });
      }
    });
  },
}; 