/**
 * @author BLKOFFICIAL (https://github.com/BLKOFFICIAL)
 * @distributor CrestCloud (https://cloud.crestyy.xyz)
 * @license See LICENSE file for details. Redistribution is strictly prohibited.
 */
const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    data: {
        name: 'ticket_category_select'
    },
    async execute(interaction, client) {
        const categoryValue = interaction.values[0];
        
        let requireReason = true;
        // Find the category config to check if it requires a reason
        for (const panel of client.config.panels) {
            const cat = panel.categories.find(c => c.value === categoryValue);
            if (cat && cat.require_reason !== undefined) {
                requireReason = cat.require_reason;
                break;
            }
        }

        if (!requireReason) {
            await interaction.deferReply({ ephemeral: true });
            const { createTicket } = require('../../utils/ticket');
            return createTicket(client, interaction, interaction.user, categoryValue, 'No reason required.');
        }

        // Create the beautiful Modal for initial ticket details
        const modal = new ModalBuilder()
            .setCustomId(`ticket_modal_${categoryValue}`)
            .setTitle('🎫 Provide Ticket Details');

        const reasonInput = new TextInputBuilder()
            .setCustomId('ticket_reason')
            .setLabel("Why are you opening this ticket?")
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('Please provide as much detail as possible...')
            .setRequired(true);

        const firstActionRow = new ActionRowBuilder().addComponents(reasonInput);

        modal.addComponents(firstActionRow);

        // Show the modal to the user
        await interaction.showModal(modal);
    }
};

