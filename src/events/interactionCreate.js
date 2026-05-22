/**
 * @author BLKOFFICIAL (https://github.com/BLKOFFICIAL)
 * @distributor CrestCloud (https://cloud.crestyy.xyz)
 * @license See LICENSE file for details. Redistribution is strictly prohibited.
 */
const { InteractionType } = require('discord.js');
const { createErrorEmbed } = require('../utils/embeds');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        try {
            if (interaction.isChatInputCommand()) {
                const command = client.commands.get(interaction.commandName);
                if (!command) return;
                await command.execute(interaction, client);
            } else if (interaction.isButton()) {
                const button = client.buttons.get(interaction.customId);
                if (!button) return;
                await button.execute(interaction, client);
            } else if (interaction.isStringSelectMenu()) {
                const menu = client.selectMenus.get(interaction.customId);
                if (!menu) return;
                await menu.execute(interaction, client);
            } else if (interaction.type === InteractionType.ModalSubmit) {
                const modalId = interaction.customId.startsWith('ticket_modal') ? 'ticket_modal' : interaction.customId;
                const modal = client.modals.get(modalId);
                if (!modal) return;
                await modal.execute(interaction, client);
            }
        } catch (error) {
            console.error(error);
            const errorEmbed = createErrorEmbed(client, 'An Error Occurred', 'There was an error while executing this interaction.');
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }
    },
};

