/**
 * @author BLKOFFICIAL (https://github.com/BLKOFFICIAL)
 * @distributor CrestCloud (https://cloud.crestyy.xyz)
 * @license See LICENSE file for details. Redistribution is strictly prohibited.
 */
const inquirer = require('inquirer');
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

async function runOnboarding() {
    displayCredits();
    
    console.log(chalk.white('Welcome to the advanced first-time setup wizard!'));
    console.log(chalk.gray('We will now configure your premium ticket system.\n'));

    let isValid = false;
    let answers;

    while (!isValid) {
        answers = await inquirer.prompt([
            {
                type: 'input',
                name: 'botToken',
                message: chalk.yellow('? ') + 'Enter your Discord Bot Token:',
                validate: input => input ? true : 'Token cannot be empty!'
            },
            {
                type: 'input',
                name: 'botName',
                message: chalk.yellow('? ') + 'Enter the name of your Bot (used for branding):',
                default: 'Premium Support Bot'
            },
            {
                type: 'input',
                name: 'clientId',
                message: chalk.yellow('? ') + 'Enter your Bot Client ID:',
                validate: input => input ? true : 'Client ID cannot be empty!'
            },
            {
                type: 'input',
                name: 'guildId',
                message: chalk.yellow('? ') + 'Enter your Server (Guild) ID:',
                validate: input => input ? true : 'Server ID cannot be empty!'
            },
            {
                type: 'input',
                name: 'panelChannel',
                message: chalk.yellow('? ') + 'Enter the Channel ID where the main Ticket Panel should be sent:',
                validate: input => input ? true : 'Channel ID cannot be empty!'
            },
            {
                type: 'input',
                name: 'ticketCategory',
                message: chalk.yellow('? ') + 'Enter the Category ID where new tickets should be created:',
                validate: input => input ? true : 'Category ID cannot be empty!'
            },
            {
                type: 'input',
                name: 'supportRole',
                message: chalk.yellow('? ') + 'Enter the Support Role ID (Staff Role):',
                validate: input => input ? true : 'Role ID cannot be empty!'
            },
            {
                type: 'input',
                name: 'logChannel',
                message: chalk.yellow('? ') + 'Enter the Channel ID for transcripts and logs (optional):'
            },
            {
                type: 'confirm',
                name: 'anyoneCanClose',
                message: chalk.yellow('? ') + 'Allow ANY user to close their own tickets? (If No, only staff can)',
                default: false
            }
        ]);

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
            
            // Check Bot Permissions in the server
            const me = await guild.members.fetch(tempClient.user.id);
            if (!me.permissions.has(PermissionFlagsBits.ManageChannels) || !me.permissions.has(PermissionFlagsBits.SendMessages)) {
                spinner.fail(chalk.red.bold('VALIDATION FAILED: Missing Permissions.'));
                console.log(chalk.red(`Details: The bot lacks 'Manage Channels' and/or 'Send Messages' permissions.`));
                console.log(chalk.yellow('How to fix: Go to your Server Settings -> Roles, find the bot role, and grant it Administrator or Manage Channels/Send Messages permissions.\n'));
                tempClient.destroy();
                continue;
            }

            // Verify Panel Channel
            try {
                const panelChannel = await guild.channels.fetch(answers.panelChannel);
                if (!panelChannel || !panelChannel.isTextBased()) throw new Error();
            } catch (e) {
                spinner.fail(chalk.red.bold('VALIDATION FAILED: Invalid Panel Channel.'));
                console.log(chalk.red(`Details: Could not find a text channel with ID ${answers.panelChannel}.`));
                console.log(chalk.yellow('How to fix: Make sure the ID is correct and the bot has permissions to View Channel.\n'));
                tempClient.destroy();
                continue;
            }

            // Verify Category
            try {
                const category = await guild.channels.fetch(answers.ticketCategory);
                if (!category || category.type !== 4) throw new Error(); // 4 is Category type in v14
            } catch (e) {
                spinner.fail(chalk.red.bold('VALIDATION FAILED: Invalid Category ID.'));
                console.log(chalk.red(`Details: Could not find a category with ID ${answers.ticketCategory}.`));
                console.log(chalk.yellow('How to fix: Make sure the ID belongs to a Category, not a text channel.\n'));
                tempClient.destroy();
                continue;
            }

            // Verify Role
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

    const genSpinner = ora('Generating premium configuration files...').start();

    // Create .env file
    const envContent = `DISCORD_TOKEN=${answers.botToken}\nCLIENT_ID=${answers.clientId}\nGUILD_ID=${answers.guildId}\n`;
    fs.writeFileSync('.env', envContent);

    // Create config.yml
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
                    { label: "General Support", description: "Ask a general question", value: "support_general", emoji: "📩" },
                    { label: "Bug Report", description: "Report a bug", value: "support_bug", emoji: "🐛" },
                    { label: "Billing", description: "Billing and payment issues", value: "support_billing", emoji: "💳" }
                ]
            }
        ]
    };

    fs.writeFileSync('config.yml', yaml.stringify(config));

    // Create embeds.yml
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
