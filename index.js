require('dotenv/config');
const { Client, GatewayIntentBits, Partials, REST, Routes, SlashCommandBuilder, InteractionType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, ComponentType } = require('discord.js');
const { translate, explain, analyze, replyTo, emojify, aiRoast, imagine } = require('./src/lib/ai.js');
const fetch = require('node-fetch');
const chrono = require('chrono-node');
const { create, all } = require('mathjs');
const OpenAI = require('openai');
const vibeform = require('./src/commands/vibeform.js');
const editvibe = require('./src/commands/editvibe.js');
const ghostmode = require('./src/commands/ghostmode.js');
const findmatch = require('./src/commands/findmatch.js');
const reveal = require('./src/commands/reveal.js');
const matchstats = require('./src/commands/matchstats.js');
const shipfriend = require('./src/commands/shipfriend.js');
const friend = require('./src/commands/friend.js');
const profile = require('./src/commands/profile.js');
const fs = require('fs');
const path = require('path');
const { userNotes, userReminders, userConversations, translateCooldowns } = require('./src/lib/state.js');
const { getRandomCompliment } = require('./src/lib/utils');
const helpCommand = require('./src/commands/help.js');
const https = require("https");

const math = create(all);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel]
});

const commands = new Map();
const commandsArray = [];
const commandsPath = path.join(__dirname, 'src/commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`./src/commands/${file}`);
  if (command.data && command.execute) {
    commands.set(command.data.name, command);
    commandsArray.push(command.data.toJSON ? command.data.toJSON() : command.data.toJSON());
  }
}

const firstInteraction = new Set();

const agent = new https.Agent({
  family: 4 // 👈 Force IPv4
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: 'https://api.navy/v1',
  fetchOptions: {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
    }
  },
  httpAgent: agent,
});

const API_ERROR_LOG = path.join(__dirname, 'data/api-errors.log');

function logApiError(context, error) {
  const logMsg = `[${new Date().toISOString()}] [${context}] ${error && error.stack ? error.stack : error}`;
  console.error(logMsg);
  try {
    fs.appendFileSync(API_ERROR_LOG, logMsg + '\n');
  } catch (e) {
    // If logging fails, print to console only
    console.error('Failed to write to API error log:', e);
  }
}

async function safeOpenAICall(fn, context) {
  try {
    return await fn();
  } catch (err) {
    logApiError(context, err);
    throw err;
  }
}

async function logToWebhook(content) {
  if (process.env.LOG_WEBHOOK_URL) {
    fetch(process.env.LOG_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content })
    }).catch(e => console.error('Webhook log error:', e));
  }
}

client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}`);
  await logToWebhook(`Bot started as ${client.user.tag} (ID: ${client.user.id})`);

  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
  try {
    await rest.put(
      Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
      { body: commandsArray }
    );
    console.log('Slash commands registered globally.');
    await logToWebhook('Slash commands registered globally.');
  } catch (error) {
    console.error('Error registering slash commands:', error);
    await logToWebhook(`Error registering slash commands: ${error}`);
  }
});

client.on('guildCreate', async guild => {
  const owner = await guild.fetchOwner().catch(() => null);
  await logToWebhook(`Bot added to guild: ${guild.name} (ID: ${guild.id}) | Owner: ${owner ? owner.user.tag : 'Unknown'} (${owner ? owner.user.id : 'Unknown'}) | Members: ${guild.memberCount}`);
});

client.on('guildDelete', async guild => {
  await logToWebhook(`Bot removed from guild: ${guild.name} (ID: ${guild.id})`);
});

client.on('messageCreate', async message => {
  if (message.channel.type === 1) { // DM
    await logToWebhook(`DM from ${message.author.tag} (${message.author.id}): ${message.content}`);
    // Onboarding: send a cute welcome if this is the user's first DM
    if (!message.author.bot && !firstInteraction.has(message.author.id)) {
      firstInteraction.add(message.author.id);
      const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
      const welcomeEmbed = new EmbedBuilder()
        .setColor(0xFFC0CB)
        .setTitle("👋 Hi, I'm Xander!")
        .setDescription("Welcome to your new AI-powered friend-finding bot!\n\n✨ **What can I do?**\n• Help you find new friends\n• Keep your notes & reminders\n• Translate, explain, and more!\n\nReady to get started? Just tap the button below or use /vibeform!")
        .setThumbnail(message.author.displayAvatarURL())
        .setFooter({ text: "You're awesome! | Xander", iconURL: 'https://cdn.discordapp.com/emojis/924923943746428928.webp?size=128' });
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('onboard_vibeform')
          .setLabel('Get Started!')
          .setStyle(ButtonStyle.Success)
          .setEmoji('🌈')
      );
      try {
        const sent = await message.author.send({ embeds: [welcomeEmbed], components: [row] });
        const filter = i => i.user.id === message.author.id && i.customId === 'onboard_vibeform';
        const collector = sent.createMessageComponentCollector({ filter, time: 60000 });
        collector.on('collect', async i => {
          await i.update({ content: "Let's set up your vibe profile! Use /vibeform to begin.", embeds: [], components: [] });
        });
      } catch (e) {}
    }
  }
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

client.on('interactionCreate', async interaction => {
  try {
    if (interaction.isButton() || interaction.isStringSelectMenu()) {
      if (interaction.customId.startsWith('help_')) {
        await helpCommand.handleComponent(interaction, { client, commands: Array.from(commands.values()) });
        return;
      }
      if (interaction.customId === 'vibeform_close') {
        await interaction.update({ content: 'VibeForm closed. Have a wonderful day! 🌸', embeds: [], components: [] });
        return;
      }
    }
    if (interaction.type !== InteractionType.ApplicationCommand) return;
    const command = commands.get(interaction.commandName);
    if (!command) return;
    await command.execute(interaction, {
      userNotes,
      userReminders,
      userConversations,
      translateCooldowns,
      client,
      logToWebhook,
      safeOpenAICall,
      openai,
      math,
      chrono
    });
  } catch (error) {
    console.error(error);
    if (interaction.deferred || interaction.replied) {
      await interaction.editReply({ content: 'There was an error while executing this command!', flags: 64 });
    } else {
      await interaction.reply({ content: 'There was an error while executing this command!', flags: 64 });
    }
  }
});

function handleCmdError(interaction, err) {
  console.error('Command error:', err);
  if (interaction && !interaction.replied && !interaction.deferred) {
    interaction.reply({ content: '❌ An error occurred. Please try again later.', flags: 64 }).catch(() => {});
  }
}

client.login(process.env.DISCORD_TOKEN); 