/**
 * @author BLKOFFICIAL (https://github.com/BLKOFFICIAL)
 * @distributor CrestCloud (https://cloud.crestyy.xyz)
 * @license See LICENSE file for details. Redistribution is strictly prohibited.
 */
const readline = require('readline');
const chalk = require('chalk');
const fs = require('fs');
const yaml = require('yaml');
const figlet = require('figlet');
const ora = require('ora');
const { Client, GatewayIntentBits, PermissionFlagsBits } = require('discord.js');

function displayCredits() {
    console.clear();
    console.log(chalk.cyan(figlet.textSync('CREST TICKETS', { horizontalLayout: 'full' })));
    console.log(chalk.gray('================================================================'));
    console.log(chalk.green.bold(' 🚀 Developed by: ') + chalk.white('BLKOFFICIAL ') + chalk.cyan('(https://github.com/BLKOFFICIAL)'));
    console.log(chalk.green.bold(' 🏬 Distributed by: ') + chalk.white('CrestCloud ') + chalk.cyan('(https://cloud.crestyy.xyz)'));
    console.log(chalk.gray('================================================================\n'));
}

function askQuestion(rl, question, defaultValue = '') {
    return new Promise(resolve => {
        const defaultText = defaultValue !== '' ? chalk.gray(` [default: ${defaultValue}]`) : '';
        rl.question(chalk.yellow('? ') + question + defaultText + '\n> ', (answer) => {
            resolve(answer.trim() || defaultValue);
        });
    });
}

async function runOnboarding() {
    displayCredits();
    
    console.log(chalk.white('Welcome to the advanced first-time setup wizard!'));
    console.log(chalk.gray('We will now configure your premium ticket system.\n'));

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    let isValid = false;
    let answers = {};

    while (!isValid) {
        let botToken = '';
        while (!botToken) {
            botToken = await askQuestion(rl, 'Enter your Discord Bot Token:');
            if (!botToken) console.log(chalk.red('Token cannot be empty!'));
        }

        const botName = await askQuestion(rl, 'Enter the name of your Bot (used for branding):', 'Premium Support Bot');

        let clientId = '';
        while (!clientId) {
            clientId = await askQuestion(rl, 'Enter your Bot Client ID:');
            if (!clientId) console.log(chalk.red('Client ID cannot be empty!'));
        }

        let guildId = '';
        while (!guildId) {
            guildId = await askQuestion(rl, 'Enter your Server (Guild) ID:');
            if (!guildId) console.log(chalk.red('Server ID cannot be empty!'));
        }

        let panelChannel = '';
        while (!panelChannel) {
            panelChannel = await askQuestion(rl, 'Enter the Channel ID where the main Ticket Panel should be sent:');
            if (!panelChannel) console.log(chalk.red('Channel ID cannot be empty!'));
        }

        let ticketCategory = '';
        while (!ticketCategory) {
            ticketCategory = await askQuestion(rl, 'Enter the Category ID where new tickets should be created:');
            if (!ticketCategory) console.log(chalk.red('Category ID cannot be empty!'));
        }

        let supportRole = '';
        while (!supportRole) {
            supportRole = await askQuestion(rl, 'Enter the Support Role ID (Staff Role):');
            if (!supportRole) console.log(chalk.red('Role ID cannot be empty!'));
        }

        const logChannel = await askQuestion(rl, 'Enter the Channel ID for transcripts and logs (optional):');
        
        let anyoneCanCloseStr = '';
        while (anyoneCanCloseStr.toLowerCase() !== 'y' && anyoneCanCloseStr.toLowerCase() !== 'n') {
            anyoneCanCloseStr = await askQuestion(rl, 'Allow ANY user to close their own tickets? (y/n)', 'n');
        }
        const anyoneCanClose = anyoneCanCloseStr.toLowerCase() === 'y';

        answers = { botToken, botName, clientId, guildId, panelChannel, ticketCategory, supportRole, logChannel, anyoneCanClose };

        console.log('\n');
        const spinner = ora('Validating credentials and verifying Discord permissions...').start();

        const tempClient = new Client({
            intents: [GatewayIntentBits.Guilds]
        });

        try {
            await tempClient.login(answers.botToken);
        } catch (error) {
            spinner.fail(chalk.red.bold('VALIDATION FAILED: Invalid Bot Token.'));
            console.log(chalk.red(`Details: The token provided is incorrect or has been reset.`));
            console.log(chalk.yellow('How to fix: Go to the Discord Developer Portal, regenerate your token, and try again.\n'));
            continue;
        }

        try {
            const guild = await tempClient.guilds.fetch(answers.guildId);
            
            const me = await guild.members.fetch(tempClient.user.id);
            if (!me.permissions.has(PermissionFlagsBits.ManageChannels) || !me.permissions.has(PermissionFlagsBits.SendMessages)) {
                spinner.fail(chalk.red.bold('VALIDATION FAILED: Missing Permissions.'));
                console.log(chalk.red(`Details: The bot lacks 'Manage Channels' and/or 'Send Messages' permissions.`));
                console.log(chalk.yellow('How to fix: Grant it Administrator or Manage Channels/Send Messages permissions.\n'));
                tempClient.destroy();
                continue;
            }

            try {
                const pChannel = await guild.channels.fetch(answers.panelChannel);
                if (!pChannel || !pChannel.isTextBased()) throw new Error();
            } catch (e) {
                spinner.fail(chalk.red.bold('VALIDATION FAILED: Invalid Panel Channel.'));
                console.log(chalk.red(`Details: Could not find a text channel with ID ${answers.panelChannel}.`));
                console.log(chalk.yellow('How to fix: Make sure the ID is correct and the bot has permissions to View Channel.\n'));
                tempClient.destroy();
                continue;
            }

            try {
                const category = await guild.channels.fetch(answers.ticketCategory);
                if (!category || category.type !== 4) throw new Error(); 
            } catch (e) {
                spinner.fail(chalk.red.bold('VALIDATION FAILED: Invalid Category ID.'));
                console.log(chalk.red(`Details: Could not find a category with ID ${answers.ticketCategory}.`));
                console.log(chalk.yellow('How to fix: Make sure the ID belongs to a Category, not a text channel.\n'));
                tempClient.destroy();
                continue;
            }

            try {
                const role = await guild.roles.fetch(answers.supportRole);
                if (!role) throw new Error();
            } catch (e) {
                spinner.fail(chalk.red.bold('VALIDATION FAILED: Invalid Support Role ID.'));
                console.log(chalk.red(`Details: Could not find a role with ID ${answers.supportRole}.`));
                console.log(chalk.yellow('How to fix: Double-check the Role ID.\n'));
                tempClient.destroy();
                continue;
            }

            spinner.succeed(chalk.green.bold('All validations passed successfully!'));
            isValid = true;
            tempClient.destroy();

        } catch (error) {
            spinner.fail(chalk.red.bold('VALIDATION FAILED: Could not access the Server.'));
            console.log(chalk.red(`Details: The bot is not in the server with ID ${answers.guildId}, or the ID is completely wrong.`));
            console.log(chalk.yellow('How to fix: Double check the Server ID and make sure you invited the bot to your server using the OAuth2 URL.\n'));
            tempClient.destroy();
            continue;
        }
    }

    rl.close();

    const genSpinner = ora('Generating premium configuration files...').start();

    const envContent = `DISCORD_TOKEN=${answers.botToken}\nCLIENT_ID=${answers.clientId}\nGUILD_ID=${answers.guildId}\n`;
    fs.writeFileSync('.env', envContent);

    const config = {
        bot_name: answers.botName,
        permissions: {
            anyone_can_close: answers.anyoneCanClose,
            support_roles: [answers.supportRole],
            ping_roles_on_open: true
        },
        channels: {
            ticket_category: answers.ticketCategory,
            log_channel: answers.logChannel || null,
            archive_category: null
        },
        rpc: {
            enabled: true,
            interval_seconds: 30,
            statuses: [
                `Watching over ${answers.botName} tickets`,
                "Helping users",
                "Premium Support by CrestCloud"
            ]
        },
        panels: [
            {
                channel_id: answers.panelChannel,
                title: "🎫 Premium Support Center",
                description: `Welcome to the ${answers.botName} Support Center. Please select a category below to open a ticket.`,
                categories: [
                    { label: "General Support", description: "Ask a general question", value: "support_general", emoji: "📩", require_reason: true },
                    { label: "Bug Report", description: "Report a bug", value: "support_bug", emoji: "🐛", require_reason: true },
                    { label: "Billing", description: "Billing and payment issues", value: "support_billing", emoji: "💳", require_reason: false }
                ]
            }
        ]
    };

    fs.writeFileSync('config.yml', yaml.stringify(config));

    const embedsConfig = {
        colors: {
            primary: '#2B2D31',
            success: '#57F287',
            error: '#ED4245',
            info: '#5865F2',
            warning: '#FEE75C'
        },
        success: {
            title: "✅ Success"
        },
        error: {
            title: "❌ Error"
        },
        info: {
            title: "ℹ️ Information"
        },
        ticket_opened: {
            title: "🎫 Ticket Opened",
            footer_text: "Support Team"
        }
    };

    fs.writeFileSync('embeds.yml', yaml.stringify(embedsConfig));

    setTimeout(() => {
        genSpinner.succeed(chalk.green.bold('Configuration successfully generated!'));
        console.log(chalk.cyan('Booting up the system...\n'));
    }, 1500);
}

module.exports = { runOnboarding };
