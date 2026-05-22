/**
 * @author BLKOFFICIAL (https://github.com/BLKOFFICIAL)
 * @distributor CrestCloud (https://cloud.crestyy.xyz)
 * @license See LICENSE file for details. Redistribution is strictly prohibited.
 */
const { SlashCommandBuilder, MessageFlags, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { createSuccessUI, createErrorUI } = require('../../utils/ui');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('closerequest')
        .setDescription('Ask the user if their issue is resolved and they want to close the ticket'),
    async execute(interaction, client) {
        if (!interaction.channel.name.startsWith('ticket-')) {
            const errorUI = createErrorUI(client, 'Invalid Channel', 'This command can only be used inside a ticket channel.');
            return interaction.reply({ flags: MessageFlags.IsComponentsV2, components: [errorUI], ephemeral: true });
        }

        const ui = createSuccessUI(client, 'Issue Resolved?', 'Our support team has requested to close this ticket. Is your issue fully resolved?');

        const buttons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('ticket_close')
                    .setLabel('Yes, Close Ticket')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('🔒')
            );

        await interaction.reply({ flags: MessageFlags.IsComponentsV2, components: [ui, buttons] });
    }
};
