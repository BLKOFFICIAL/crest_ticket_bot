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
    async execute(interaction) {
        const category = interaction.values[0];

        // Create the beautiful Modal for initial ticket details
        const modal = new ModalBuilder()
            .setCustomId(`ticket_modal_${category}`)
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

