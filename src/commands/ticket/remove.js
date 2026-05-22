/**
 * @author BLKOFFICIAL (https://github.com/BLKOFFICIAL)
 * @distributor CrestCloud (https://cloud.crestyy.xyz)
 * @license See LICENSE file for details. Redistribution is strictly prohibited.
 */
const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const { createSuccessUI, createErrorUI } = require('../../utils/ui');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remove')
        .setDescription('Remove a user from the current ticket')
        .addUserOption(option => 
            option.setName('user')
            .setDescription('The user to remove')
            .setRequired(true)
        ),
    async execute(interaction, client) {
        if (!interaction.channel.name.startsWith('ticket-')) {
            const errorUI = createErrorUI(client, 'Invalid Channel', 'This command can only be used inside a ticket channel.');
            return interaction.reply({ flags: MessageFlags.IsComponentsV2, components: [errorUI], ephemeral: true });
        }

        const userToRemove = interaction.options.getUser('user');

        try {
            await interaction.channel.permissionOverwrites.delete(userToRemove.id);

            const successUI = createSuccessUI(client, 'User Removed', `Successfully removed <@${userToRemove.id}> from the ticket.`);
            await interaction.reply({ flags: MessageFlags.IsComponentsV2, components: [successUI] });
        } catch (error) {
            console.error(error);
            const errorUI = createErrorUI(client, 'Error', 'Failed to remove user from the ticket.');
            await interaction.reply({ flags: MessageFlags.IsComponentsV2, components: [errorUI], ephemeral: true });
        }
    }
};
