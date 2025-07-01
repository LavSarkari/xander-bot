# Xander Bot

A professional, feature-rich Discord bot powered by AI (NavyAI GPT-4o) for translation, explanations, image generation, text analysis, notes, reminders, matching, and more. Xander is designed for both servers and DMs, with a beautiful interactive help system and robust user experience.

---

## ✨ Features
- **AI Utilities:** Translation, explanations, text analysis, emojify, AI roasts, image generation, and more—all powered by NavyAI (OpenAI-compatible, GPT-4o).
- **Notes & Reminders:** Save private notes and set reminders with natural language time parsing.
- **Calculator:** Safe math evaluation using MathJS.
- **Fun & Engagement:** Ship command (compatibility, OTP, AI-generated reasons), styled replies, and more.
- **Conversation Memory:** Context-aware AI chat with per-user history.
- **Advanced Help System:** Interactive, categorized help menu with command details and usage examples.
- **Professional UX:** Clean embeds, emoji accents, ephemeral replies, and a welcoming onboarding experience.
- **Logging:** All command usage, errors, and DMs are logged via Discord webhook (optional).
- **Admin System:** Powerful admin commands for DMs, user management, broadcasts, blacklisting, and more.
- **Vibe & Matching:** Fill out a vibe profile, find compatible users, and connect with matches.

---

## 📝 What are "Vibe" and "Match"?

- **Vibe:** Your vibe is your social/personality profile, set up using `/vibeform`. It includes your age range, core vibe, music mood, energy level, Discord usage, social battery, what you're looking for, and chaos quotient.
- **Match:** Matching is the process of finding users with a similar vibe profile. When you use `/findmatch`, the bot compares your answers to others, calculates a compatibility percentage, and lists all users with 80%+ compatibility (highest to lowest). Both users are notified if a strong match is found. Use `/reveal` to connect with your top match.

---

## 🛠️ Commands

### AI & Utility
- `/translate` — Translate text to English
- `/explain` — Explain text in simple terms
- `/analyze` — Analyze text for sentiment, topics, and tone
- `/emojify` — Convert text to expressive emoji-filled speech
- `/airoast` — AI-generated roast for a user
- `/imagine` — Generate an image from a prompt
- `/replyto` — Styled AI reply to a message (formal, roast, poetic, sarcastic, casual)
- `/ask` — Ask Xander anything (context-aware, per-user chat history)
- `/continue` — Continue your last conversation with the AI
- `/resetai` — Reset your conversation history with the AI
- `/calc` — Evaluate a mathematical expression

### Notes & Reminders
- `/note` — Save a private note
- `/remind` — Set a private reminder (natural language time parsing)
- `/listnotes` — List all your notes and reminders
- `/clearnotes` — Delete all your notes and reminders

### Vibe, Matching & Social
- `/vibeform` — Fill out your vibe profile (DM-only)
- `/editvibe` — Edit your vibe profile
- `/profile` — View your vibe profile and match stats
- `/findmatch` — Find all users with 80%+ vibe compatibility (DM-only)
- `/reveal` — Reveal and connect with your top match
- `/matchstats` — View your matching statistics
- `/friend` — Send or accept friend requests
- `/ship` — See compatibility between two users (with chaos mode)
- `/shipfriend` — Ship yourself with a friend
- `/ghostmode` — Hide your profile from matching
- `/reveal` — Reveal your match after finding one
- `/matchstats` — View your match history and stats
- `/friend` — Manage friend requests and connections
- `/findmatch` — Find your best vibe matches
- `/editvibe` — Edit your vibe profile
- `/profile` — View your profile and stats

### General & Info
- `/help` — Interactive help menu (with dropdown navigation)
- `/start` — Welcome and onboarding message
- `/whoami` — Show your Discord user info

### Admin (admin-only)
- `/admin addadmin <user>` — Add a new admin (mention, username, or ID)
- `/admin removeadmin <user>` — Remove an admin
- `/admin listadmins` — List all admins
- `/admin dm <user> <message>` — DM a user as the bot
- `/admin broadcast <message>` — DM all users with a message
- `/admin userinfo <user>` — Show info for any user (profile, admin, blacklist)
- `/admin removeprofile <user>` — Remove a user's vibe profile
- `/admin forcematch <user1> <user2>` — Force match two users and notify them
- `/admin stats` — Show bot stats (profiles, admins, blacklisted)
- `/admin reloadcommands` — Reload all slash commands
- `/admin blacklist add/remove/list <user>` — Manage the blacklist
- `/admin say <channelid> <message>` — Send a message as the bot in any channel

---

## 🚀 Getting Started

1. **Clone or download this repository.**
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Create a `.env` file** in the project root:
   ```env
   DISCORD_TOKEN=your-discord-bot-token
   DISCORD_CLIENT_ID=your-discord-client-id
   OPENAI_API_KEY=your-navyai-api-key
   LOG_WEBHOOK_URL=your-discord-logging-webhook-url (optional)
   MATCH_WEBHOOK_URL=your-match-logging-webhook-url (for vibeform/findmatch logs)
   ```
   > **Note:** All sensitive URLs, webhooks, and tokens should be stored in `.env` and never hardcoded in the codebase.
4. **Start the bot:**
   ```bash
   npm start
   ```

---

## 🌐 Free Hosting Options
- [Railway](https://railway.app/) (recommended)
- [Replit](https://replit.com/)
- [Glitch](https://glitch.com/)
- [Render](https://render.com/)

---

## ⚙️ Environment Variables
- `DISCORD_TOKEN` — Your Discord bot token
- `DISCORD_CLIENT_ID` — Your bot's client ID
- `OPENAI_API_KEY` — NavyAI API key (for all AI features)
- `LOG_WEBHOOK_URL` — (Optional) Discord webhook URL for logging
- `MATCH_WEBHOOK_URL` — (Optional) Discord webhook URL for match/vibeform logs

---

## 📝 Usage & Tips
- **All commands work in both servers and DMs.**
- **Ephemeral replies** keep responses private and clean.
- **Use `/help`** for an interactive, categorized command menu with details and usage examples.
- **AI features** require a valid NavyAI (OpenAI-compatible) API key.
- **Notes and reminders** are stored in-memory (reset on restart).
- **Logging** is optional but recommended for monitoring usage and errors.
- **Admin commands** are powerful—use with care!

---

## 📄 License
MIT 