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
    if (!fs.existsSync('.env') || !fs.existsSync('config.yml')) {
        const { runOnboarding } = require('./onboarding');
        await runOnboarding();
    }

    require('dotenv').config();
    const file = fs.readFileSync('config.yml', 'utf8');
    const config = yaml.parse(file);

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

    client.login(process.env.DISCORD_TOKEN);
}

process.on('uncaughtException', (err) => {
    console.error('\n[CRASH] An unexpected error occurred:');
    console.error(err);
    console.log('\nThe process will exit in 60 seconds so you can read this error...');
    setTimeout(() => process.exit(1), 60000);
});

process.on('unhandledRejection', (err) => {
    console.error('\n[CRASH] An unhandled promise rejection occurred:');
    console.error(err);
    console.log('\nThe process will exit in 60 seconds so you can read this error...');
    setTimeout(() => process.exit(1), 60000);
});

startBot();

