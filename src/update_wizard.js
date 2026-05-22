/**
 * @author BLKOFFICIAL (https://github.com/BLKOFFICIAL)
 * @distributor CrestCloud (https://cloud.crestyy.xyz)
 * @license See LICENSE file for details. Redistribution is strictly prohibited.
 */
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const chalk = require('chalk');
const yaml = require('yaml');

// Define the required keys for the current version.
// Add new keys here when you push updates that require them.
const SCHEMA = {
    env: ['DISCORD_TOKEN', 'CLIENT_ID', 'GUILD_ID'],
    config: [
        'bot_name',
        'permissions.anyone_can_close',
        'permissions.support_roles',
        'permissions.ping_roles_on_open',
        'channels.ticket_category',
        'rpc.enabled',
        'rpc.interval_seconds',
        'rpc.statuses',
        'panels'
    ]
};

function askQuestion(rl, question) {
    return new Promise(resolve => {
        rl.question(chalk.yellow('? ') + question + '\n> ', (answer) => {
            resolve(answer.trim());
        });
    });
}

function getValueFromPath(obj, path) {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}

function setValueAtPath(obj, path, value) {
    const parts = path.split('.');
    const last = parts.pop();
    const target = parts.reduce((acc, part) => {
        if (!acc[part]) acc[part] = {};
        return acc[part];
    }, obj);
    target[last] = value;
}

async function checkAndPatch() {
    let missingEnvKeys = [];
    let missingConfigKeys = [];

    // Check .env
    const envPath = path.join(__dirname, '../.env');
    let currentEnvStr = '';
    if (fs.existsSync(envPath)) {
        currentEnvStr = fs.readFileSync(envPath, 'utf8');
        const envKeys = currentEnvStr.split('\n').filter(l => l.includes('=')).map(l => l.split('=')[0].trim());
        missingEnvKeys = SCHEMA.env.filter(key => !envKeys.includes(key));
    } else {
        missingEnvKeys = [...SCHEMA.env];
    }

    // Check config.yml
    const configPath = path.join(__dirname, '../config.yml');
    let currentConfig = {};
    if (fs.existsSync(configPath)) {
        const fileContent = fs.readFileSync(configPath, 'utf8');
        currentConfig = yaml.parse(fileContent) || {};
        missingConfigKeys = SCHEMA.config.filter(key => getValueFromPath(currentConfig, key) === undefined);
    } else {
        missingConfigKeys = [...SCHEMA.config];
    }

    if (missingEnvKeys.length === 0 && missingConfigKeys.length === 0) {
        return; // Everything is up to date!
    }

    console.clear();
    console.log(chalk.bgBlue.white.bold(' 🔄 SMART UPDATE WIZARD ') + '\n');
    console.log(chalk.cyan('An update has been detected that requires new configurations.'));
    console.log(chalk.gray('Please provide the missing values below to patch your system.\n'));

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    // Patch .env
    if (missingEnvKeys.length > 0) {
        console.log(chalk.white.bold('--- Missing Environment Variables ---'));
        for (const key of missingEnvKeys) {
            let answer = '';
            while (!answer) {
                answer = await askQuestion(rl, `Enter value for ${chalk.bold(key)}:`);
                if (!answer) console.log(chalk.red('Value cannot be empty!'));
            }
            currentEnvStr += `\n${key}=${answer}`;
        }
        fs.writeFileSync(envPath, currentEnvStr.trim() + '\n');
        console.log(chalk.green('✓ Environment variables patched!\n'));
    }

    // Patch config.yml
    if (missingConfigKeys.length > 0) {
        console.log(chalk.white.bold('--- Missing Configuration Keys ---'));
        for (const key of missingConfigKeys) {
            let answer = '';
            while (!answer) {
                // Determine expected type (simplified check)
                const isArray = key.includes('roles') || key.includes('statuses') || key === 'panels';
                const isBoolean = key.includes('enabled') || key.includes('anyone_can_close') || key.includes('ping_');
                
                let prompt = `Enter value for config key ${chalk.bold(key)}`;
                if (isArray) prompt += chalk.gray(' (comma separated)');
                if (isBoolean) prompt += chalk.gray(' (true/false)');

                answer = await askQuestion(rl, prompt + ':');
                if (!answer && key !== 'panels') console.log(chalk.red('Value cannot be empty!'));
                if (key === 'panels' && !answer) answer = '[]'; // Special bypass for complex objects for now
            }

            let parsedValue = answer;
            if (answer.toLowerCase() === 'true') parsedValue = true;
            else if (answer.toLowerCase() === 'false') parsedValue = false;
            else if (answer.includes(',') || key.includes('roles') || key.includes('statuses')) {
                parsedValue = answer.split(',').map(s => s.trim()).filter(s => s);
            }
            if (key === 'panels' && answer === '[]') parsedValue = [];

            setValueAtPath(currentConfig, key, parsedValue);
        }
        fs.writeFileSync(configPath, yaml.stringify(currentConfig));
        console.log(chalk.green('✓ config.yml patched!\n'));
    }

    rl.close();
    console.log(chalk.bgGreen.white.bold(' ✅ PATCH COMPLETE ') + chalk.green(' Booting up the bot...\n'));
    
    // Give user 1 second to read the success message before booting
    await new Promise(r => setTimeout(r, 1000));
}

module.exports = { checkAndPatch };
