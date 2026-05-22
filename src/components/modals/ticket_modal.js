/**
 * @author BLKOFFICIAL (https://github.com/BLKOFFICIAL)
 * @distributor CrestCloud (https://cloud.crestyy.xyz)
 * @license See LICENSE file for details. Redistribution is strictly prohibited.
 */
const { createTicket } = require('../../utils/ticket');

module.exports = {
    data: {
        name: 'ticket_modal'
    },
    async execute(interaction, client) {
        await interaction.deferReply({ ephemeral: true });

        const reason = interaction.fields.getTextInputValue('ticket_reason');
        const categoryKey = interaction.customId.replace('ticket_modal_', ''); 

        await createTicket(client, interaction, interaction.user, categoryKey, reason);
    }
};
