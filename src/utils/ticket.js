/**
 * @author BLKOFFICIAL (https://github.com/BLKOFFICIAL)
 * @distributor CrestCloud (https://cloud.crestyy.xyz)
 * @license See LICENSE file for details. Redistribution is strictly prohibited.
 */
const { ChannelType, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');
const { createTicketOpenedUI, createSuccessUI, createErrorUI } = require('./ui');

async function createTicket(client, interaction, user, categoryKey, reason) {
    const guild = interaction.guild;
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

        const container = createTicketOpenedUI(client, user, reason);

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
            flags: MessageFlags.IsComponentsV2,
            components: [container, buttons]
        });

        const successUI = createSuccessUI(client, 'Ticket Created', `Your ticket has been created: <#${ticketChannel.id}>`);
        if (interaction.deferred || interaction.replied) {
            await interaction.editReply({ flags: MessageFlags.IsComponentsV2, components: [successUI] });
        } else {
            await interaction.reply({ flags: MessageFlags.IsComponentsV2, components: [successUI], ephemeral: true });
        }

    } catch (error) {
        console.error(error);
        const errorUI = createErrorUI(client, 'Failed to Create Ticket', 'There was an error creating your ticket channel. Please contact an admin.');
        if (interaction.deferred || interaction.replied) {
            await interaction.editReply({ flags: MessageFlags.IsComponentsV2, components: [errorUI] });
        } else {
            await interaction.reply({ flags: MessageFlags.IsComponentsV2, components: [errorUI], ephemeral: true });
        }
    }
}

module.exports = { createTicket };
