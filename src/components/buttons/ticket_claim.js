/**
 * @author BLKOFFICIAL (https://github.com/BLKOFFICIAL)
 * @distributor CrestCloud (https://cloud.crestyy.xyz)
 * @license See LICENSE file for details. Redistribution is strictly prohibited.
 */
const { MessageFlags } = require('discord.js');
const { createSuccessUI, createErrorUI } = require('../../utils/ui');

module.exports = {
    data: {
        name: 'ticket_claim'
    },
    async execute(interaction, client) {
        const config = client.config;
        const supportRoles = config.permissions.support_roles || [];
        
        const hasRole = supportRoles.some(roleId => interaction.member.roles.cache.has(roleId));

        if (!hasRole && supportRoles.length > 0) {
            const errorUI = createErrorUI(client, 'Permission Denied', 'You do not have permission to claim tickets.');
            return interaction.reply({ flags: MessageFlags.IsComponentsV2, components: [errorUI], ephemeral: true });
        }

        const claimUI = createSuccessUI(client, 'Ticket Claimed', `This ticket has been claimed by <@${interaction.user.id}>. They will assist you shortly.`);

        const message = interaction.message;
        const components = message.components;
        
        const newComponents = components.map(row => {
            return {
                type: 1, 
                components: row.components.map(button => {
                    if (button.customId === 'ticket_claim') {
                        return { ...button.data, disabled: true, label: `Claimed by ${interaction.user.username}` };
                    }
                    return button.data;
                })
            };
        });

        await message.edit({ components: newComponents });
        await interaction.reply({ flags: MessageFlags.IsComponentsV2, components: [claimUI] });
    }
};
