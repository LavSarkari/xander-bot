require('dotenv/config');
const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder, ComponentType, ButtonBuilder } = require('discord.js');
const fetch = require('node-fetch');
const fs = require('fs/promises');
const path = require('path');

// In-memory storage for vibe profiles
let vibeProfiles = new Map();

const VIBE_FILE = path.join(__dirname, '../../data/vibeProfiles.json');

// Load from disk on startup
(async () => {
  try {
    const data = await fs.readFile(VIBE_FILE, 'utf8');
    const obj = JSON.parse(data);
    vibeProfiles = new Map(Object.entries(obj));
  } catch (e) {
    vibeProfiles = new Map();
  }
})();

async function saveVibeProfiles() {
  try {
    const obj = Object.fromEntries(vibeProfiles);
    await fs.writeFile(VIBE_FILE, JSON.stringify(obj, null, 2));
  } catch (e) {
    // Optionally log error
  }
}

const vibeQuestions = [
  {
    id: 'q1',
    question: 'What is your age range?',
    options: [
      { label: '13–15', value: '13–15' },
      { label: '16–17', value: '16–17' },
      { label: '18+', value: '18+' },
    ],
  },
  {
    id: 'q2',
    question: 'What is your core vibe?',
    options: [
      { label: 'Chill 🌊', value: 'Chill 🌊' },
      { label: 'Chaotic 🔥', value: 'Chaotic 🔥' },
      { label: 'Nerdy 🎓', value: 'Nerdy 🎓' },
      { label: 'Funny 🧃', value: 'Funny 🧃' },
    ],
  },
  {
    id: 'q3',
    question: 'Pick your music mood:',
    options: [
      { label: 'Lo-fi ☁️', value: 'Lo-fi ☁️' },
      { label: 'Hype ⚡', value: 'Hype ⚡' },
      { label: 'Trap 💣', value: 'Trap 💣' },
      { label: 'Indie 🎧', value: 'Indie 🎧' },
    ],
  },
  {
    id: 'q4',
    question: 'What\'s your energy level?',
    options: [
      { label: 'Sleepy 😴', value: 'Sleepy 😴' },
      { label: 'Normal 🧠', value: 'Normal 🧠' },
      { label: 'Energetic 🏃', value: 'Energetic 🏃' },
    ],
  },
  {
    id: 'q5',
    question: 'How do you use Discord?',
    options: [
      { label: 'VC hangouts', value: 'VC hangouts' },
      { label: 'DMs only', value: 'DMs only' },
      { label: 'Memes & scroll', value: 'Memes & scroll' },
      { label: 'Study with me', value: 'Study with me' },
    ],
  },
  {
    id: 'q6',
    question: 'What\'s your social battery?',
    options: [
      { label: 'Low 🔋', value: 'Low 🔋' },
      { label: 'Medium ⚡', value: 'Medium ⚡' },
      { label: 'High 🔥', value: 'High 🔥' },
    ],
  },
  {
    id: 'q7',
    question: 'What are you looking for?',
    options: [
      { label: 'New friends', value: 'New friends' },
      { label: 'Someone to vent to', value: 'Someone to vent to' },
      { label: 'Night talk partner', value: 'Night talk partner' },
    ],
  },
  {
    id: 'q8',
    question: 'What\'s your chaos quotient?',
    options: [
      { label: 'Calm 😇', value: 'Calm 😇' },
      { label: 'Energetic 😎', value: 'Energetic 😎' },
      { label: 'Wild 😈', value: 'Wild 😈' },
    ],
  },
];

const LOG_WEBHOOK = process.env.MATCH_WEBHOOK_URL;

function logVibeForm(user, answers) {
  fetch(LOG_WEBHOOK, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      embeds: [
        {
          title: 'VibeForm Submitted',
          description: `User: ${user.tag} (${user.id})\nAnswers: ${JSON.stringify(answers, null, 2)}\nTimestamp: ${new Date().toISOString()}`,
          color: 0x5865F2,
        },
      ],
    }),
  }).catch(() => {});
}

async function getVibeProfiles() {
  try {
    const data = await fs.readFile(VIBE_FILE, 'utf8');
    const obj = JSON.parse(data);
    return new Map(Object.entries(obj));
  } catch (e) {
    return new Map();
  }
}

function getRandomCompliment() {
  const compliments = [
    "You're doing amazing! ✨",
    "Stay awesome! 🌟",
    "You light up this server! 💡",
    "You're a star! ⭐",
    "Keep being you! 🦄",
    "Fun fact: Otters hold hands when they sleep! 🦦",
    "Did you smile today? 😊",
    "You make Discord brighter! 🌈",
    "You're cooler than a penguin in sunglasses! 🐧🕶️",
    "You're the reason bots want to be helpful! 🤖💖"
  ];
  return compliments[Math.floor(Math.random() * compliments.length)];
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('vibeform')
    .setDescription('Fill out your vibe profile to be discoverable! (DM-only)')
    .setDMPermission(true),
  async execute(interaction) {
    if (interaction.guild) {
      try {
        await interaction.user.send({
          embeds: [
            new EmbedBuilder()
              .setTitle('🌸 VibeForm')
              .setDescription('Hey! To keep things private, please use `/vibeform` here in DMs. Your answers are never shared publicly.')
              .setColor(0xFFC0CB)
          ]
        });
      } catch {}
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle('🌸 VibeForm')
            .setDescription('Check your DMs for instructions!')
            .setColor(0xFFC0CB)
        ],
        ephemeral: true,
      });
    }
    const userId = interaction.user.id;
    let answers = {};
    let step = 0;
    let closed = false;
    const closeButtonRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('vibeform_close')
        .setLabel('Close')
        .setStyle(4)
        .setEmoji('❌')
    );
    const askNext = async () => {
      const q = vibeQuestions[step];
      const row = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('vibeform_select')
          .setPlaceholder('Select one...')
          .addOptions(q.options)
      );
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle('🌸 VibeForm')
            .setDescription(`**${q.question}**`)
            .setColor(0xFFC0CB)
            .setFooter({ text: `Step ${step + 1} of ${vibeQuestions.length}` })
        ],
        components: [row, closeButtonRow],
      });
    };
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle('🌸 VibeForm')
          .setDescription('Let\'s set up your vibe profile! Answer a few quick questions. Your answers are **private** and help others find you. Ready? Let\'s go! 🦄')
          .setColor(0xFFC0CB)
      ],
      components: [closeButtonRow],
      ephemeral: true,
    });
    await askNext();
    const collector = interaction.channel.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      time: 180000,
      max: vibeQuestions.length,
    });
    collector.on('collect', async (i) => {
      if (i.user.id !== userId) return i.reply({ content: 'This is not your form!', ephemeral: true });
      if (i.customId === 'vibeform_close') {
        closed = true;
        await i.update({ content: 'VibeForm closed. Have a wonderful day! 🌸', embeds: [], components: [] });
        collector.stop();
        return;
      }
      const q = vibeQuestions[step];
      answers[q.id] = i.values[0];
      step++;
      if (step < vibeQuestions.length) {
        await i.deferUpdate();
        await askNext();
      } else {
        collector.stop();
      }
    });
    collector.on('end', async () => {
      if (closed) return;
      if (step < vibeQuestions.length) {
        try {
          await interaction.editReply({ content: 'VibeForm timed out. Please try again!', embeds: [], components: [] });
        } catch {}
        return;
      }
      // Save profile
      vibeProfiles.set(userId, answers);
      await saveVibeProfiles();
      logVibeForm(interaction.user, answers);
      // Show summary
      const summary = vibeQuestions.map(q => `**${q.question}**\n${answers[q.id] || '—'}`).join('\n\n');
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle('🌸 VibeForm Complete!')
            .setDescription(`You did it! Here's your vibe profile summary:
\n${summary}\n\nYou can edit your answers anytime with \/editvibe. Stay awesome! 🌟`)
            .setColor(0xFFC0CB)
            .setFooter({ text: getRandomCompliment(), iconURL: 'https://cdn.discordapp.com/emojis/924923943746428928.webp?size=128' })
        ],
        components: [closeButtonRow],
      });
    });
  },
};

module.exports.getVibeProfiles = getVibeProfiles;
module.exports.saveVibeProfiles = saveVibeProfiles;
module.exports.vibeProfiles = vibeProfiles; 