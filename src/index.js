/**
 * @author BLKOFFICIAL (https://github.com/BLKOFFICIAL)
 * @distributor CrestCloud (https://cloud.crestyy.xyz)
 * @license See LICENSE file for details. Redistribution is strictly prohibited.
 */
const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Collection, ActivityType } = require('discord.js');
const yaml = require('yaml');

async function startBot() {
    // Check for config and env
    if (!fs.existsSync('.env') || !fs.existsSync('config.yml') || !fs.existsSync('embeds.yml')) {
        const { runOnboarding } = require('./onboarding');
        await runOnboarding();
    }

    const { checkAndPatch } = require('./update_wizard');
    await checkAndPatch();

    require('dotenv').config();
    const file = fs.readFileSync('config.yml', 'utf8');
    const config = yaml.parse(file);
    const chalk = require('chalk');

    let embedsConfig = {};
    if (fs.existsSync('embeds.yml')) {
        const embedFile = fs.readFileSync('embeds.yml', 'utf8');
        embedsConfig = yaml.parse(embedFile);
    }

    const client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent,
            GatewayIntentBits.GuildMembers
        ]
    });

    client.config = config; // Attach config to client for easy access
    client.embedsConfig = embedsConfig; // Attach embed config
    client.commands = new Collection();
    client.buttons = new Collection();
    client.selectMenus = new Collection();
    client.modals = new Collection();

    const handlerPath = path.join(__dirname, 'handlers');
    const handlerFiles = fs.readdirSync(handlerPath).filter(file => file.endsWith('.js'));

    for (const file of handlerFiles) {
        require(`./handlers/${file}`)(client);
    }

    client.handleEvents();
    client.handleCommands();
    client.handleComponents();

    try {
        await client.login(process.env.DISCORD_TOKEN);
    } catch (error) {
        const chalk = require('chalk');
        if (error.message && error.message.includes('disallowed intents')) {
            console.error('\n' + chalk.bgRed.white.bold(' ❌ FATAL ERROR: MISSING PRIVILEGED INTENTS ') + '\n');
            console.error(chalk.red('Your bot is trying to use Privileged Intents, but they are disabled in the Developer Portal.\n'));
            console.log(chalk.cyan.bold('╭────────────────── HOW TO FIX ──────────────────╮'));
            console.log(chalk.cyan('│ ') + chalk.white('1. Go to ') + chalk.underline.blue('https://discord.com/developers/applications') + ' '.repeat(5) + chalk.cyan('│'));
            console.log(chalk.cyan('│ ') + chalk.white('2. Select your bot and click on the "Bot" tab.   ') + chalk.cyan('│'));
            console.log(chalk.cyan('│ ') + chalk.white('3. Scroll down to "Privileged Gateway Intents".  ') + chalk.cyan('│'));
            console.log(chalk.cyan('│ ') + chalk.white('4. Turn ON "Server Members" & "Message Content". ') + chalk.cyan('│'));
            console.log(chalk.cyan('│ ') + chalk.white('5. Save your changes and start the bot again.    ') + chalk.cyan('│'));
            console.log(chalk.cyan.bold('╰────────────────────────────────────────────────╯\n'));
        } else {
            console.error('\n' + chalk.bgRed.white.bold(' ❌ FATAL ERROR: FAILED TO START ') + '\n');
            console.error(chalk.red(error.stack || error));
        }
        console.log(chalk.yellow.italic('The process will exit in 60 seconds so you can read this error...'));
        setTimeout(() => process.exit(1), 60000);
    }
}

process.on('uncaughtException', (err) => {
    const chalk = require('chalk');
    console.error('\n' + chalk.bgRed.white.bold(' ❌ UNEXPECTED CRASH ') + '\n');
    console.error(chalk.red(err.stack || err));
    console.log('\n' + chalk.yellow.italic('The process will exit in 60 seconds so you can read this error...'));
    setTimeout(() => process.exit(1), 60000);
});

process.on('unhandledRejection', (err) => {
    const chalk = require('chalk');
    console.error('\n' + chalk.bgRed.white.bold(' ❌ UNHANDLED PROMISE REJECTION ') + '\n');
    console.error(chalk.red(err.stack || err));
    console.log('\n' + chalk.yellow.italic('The process will exit in 60 seconds so you can read this error...'));
    setTimeout(() => process.exit(1), 60000);
});

startBot();

