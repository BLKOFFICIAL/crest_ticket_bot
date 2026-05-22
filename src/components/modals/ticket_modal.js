/**
 * @author BLKOFFICIAL (https://github.com/BLKOFFICIAL)
 * @distributor CrestCloud (https://cloud.crestyy.xyz)
 * @license See LICENSE file for details. Redistribution is strictly prohibited.
 */
const { ChannelType, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { createTicketOpenedEmbed, createSuccessEmbed, createErrorEmbed } = require('../../utils/embeds');

module.exports = {
    data: {
        name: 'ticket_modal'
    },
    async execute(interaction, client) {
        await interaction.deferReply({ ephemeral: true });

        const reason = interaction.fields.getTextInputValue('ticket_reason');
        const categoryKey = interaction.customId.replace('ticket_modal_', ''); 

        const guild = interaction.guild;
        const user = interaction.user;

        const config = client.config;
        const categoryId = config.channels.ticket_category; 

        try {
            const ticketChannel = await guild.channels.create({
                name: `ticket-${user.username}`,
                type: ChannelType.GuildText,
                parent: categoryId || null,
                permissionOverwrites: [
                    {
                        id: guild.id,
                        deny: [PermissionFlagsBits.ViewChannel],
                    },
                    {
                        id: user.id,
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
                    },
                    ...config.permissions.support_roles.map(roleId => ({
                        id: roleId,
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
                    }))
                ],
            });

            const embed = createTicketOpenedEmbed(client, user, reason);

            const buttons = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('ticket_claim')
                        .setLabel('Claim Ticket')
                        .setStyle(ButtonStyle.Success)
                        .setEmoji('👋'),
                    new ButtonBuilder()
                        .setCustomId('ticket_close')
                        .setLabel('Close Ticket')
                        .setStyle(ButtonStyle.Danger)
                        .setEmoji('🔒')
                );

            let content = `<@${user.id}>`;
            if (config.permissions.ping_roles_on_open) {
                const rolePings = config.permissions.support_roles.map(r => `<@&${r}>`).join(' ');
                content += ` ${rolePings}`;
            }

            await ticketChannel.send({
                content: content,
                embeds: [embed],
                components: [buttons]
            });

            const successEmbed = createSuccessEmbed(client, 'Ticket Created', `Your ticket has been created: <#${ticketChannel.id}>`);
            await interaction.editReply({ embeds: [successEmbed] });

        } catch (error) {
            console.error(error);
            const errorEmbed = createErrorEmbed(client, 'Failed to Create Ticket', 'There was an error creating your ticket channel. Please contact an admin.');
            await interaction.editReply({ embeds: [errorEmbed] });
        }
    }
};

