/**
 * @author BLKOFFICIAL (https://github.com/BLKOFFICIAL)
 * @distributor CrestCloud (https://cloud.crestyy.xyz)
 * @license See LICENSE file for details. Redistribution is strictly prohibited.
 */
const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { createErrorUI } = require('../../utils/ui');
const ticketCloseButton = require('../../components/buttons/ticket_close');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('close')
        .setDescription('Force close the current ticket'),
    async execute(interaction, client) {
        if (!interaction.channel.name.startsWith('ticket-')) {
            const errorUI = createErrorUI(client, 'Invalid Channel', 'This command can only be used inside a ticket channel.');
            return interaction.reply({ flags: MessageFlags.IsComponentsV2, components: [errorUI], ephemeral: true });
        }

        // Delegate to the close button logic
        await ticketCloseButton.execute(interaction, client);
    }
};
