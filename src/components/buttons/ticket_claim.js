/**
 * @author BLKOFFICIAL (https://github.com/BLKOFFICIAL)
 * @distributor CrestCloud (https://cloud.crestyy.xyz)
 * @license See LICENSE file for details. Redistribution is strictly prohibited.
 */
const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { COLORS } = require('../../utils/embeds');

module.exports = {
    data: {
        name: 'ticket_claim'
    },
    async execute(interaction, client) {
        const config = client.config;
        const supportRoles = config.permissions.support_roles || [];
        
        const hasRole = supportRoles.some(roleId => interaction.member.roles.cache.has(roleId));

        if (!hasRole && supportRoles.length > 0) {
            return interaction.reply({ content: 'You do not have permission to claim tickets.', ephemeral: true });
        }

        const claimEmbed = new EmbedBuilder()
            .setColor(COLORS.WARNING)
            .setDescription(`This ticket has been claimed by <@${interaction.user.id}>. They will assist you shortly.`);

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
        await interaction.reply({ embeds: [claimEmbed] });
    }
};

