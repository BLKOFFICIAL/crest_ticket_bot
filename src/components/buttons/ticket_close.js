/**
 * @author BLKOFFICIAL (https://github.com/BLKOFFICIAL)
 * @distributor CrestCloud (https://cloud.crestyy.xyz)
 * @license See LICENSE file for details. Redistribution is strictly prohibited.
 */
const { MessageFlags } = require('discord.js');
const { createErrorUI, createInfoUI } = require('../../utils/ui');
const { createCustomTranscript } = require('../../utils/transcript');

module.exports = {
    data: {
        name: 'ticket_close'
    },
    async execute(interaction, client) {
        const config = client.config;
        
        if (!config.permissions.anyone_can_close) {
            const supportRoles = config.permissions.support_roles || [];
            const hasRole = supportRoles.some(roleId => interaction.member.roles.cache.has(roleId));
            if (!hasRole) {
                const errorUI = createErrorUI(client, 'Permission Denied', 'You do not have permission to close this ticket.');
                return interaction.reply({ flags: MessageFlags.IsComponentsV2, components: [errorUI], ephemeral: true });
            }
        }

        const infoUI = createInfoUI(client, 'Closing Ticket', 'Generating premium transcript and archiving ticket...');
        await interaction.reply({ flags: MessageFlags.IsComponentsV2, components: [infoUI], ephemeral: false });

        const channel = interaction.channel;

        try {
            const attachment = await createCustomTranscript(channel);

            if (config.channels.log_channel) {
                try {
                    const logChannel = await client.channels.fetch(config.channels.log_channel);
                    if (logChannel) {
                        await logChannel.send({ 
                            content: `Ticket closed by <@${interaction.user.id}> - Channel: ${channel.name}`,
                            files: [attachment] 
                        });
                    }
                } catch (e) {
                    console.error('Failed to send transcript to log channel', e);
                }
            }

            if (config.channels.archive_category) {
                await channel.setParent(config.channels.archive_category);
                await channel.lockPermissions();
                await channel.send({ content: 'Ticket archived.' });
            } else {
                setTimeout(async () => {
                    await channel.delete().catch(console.error);
                }, 5000);
            }
        } catch (error) {
            console.error('Error closing ticket:', error);
            const errorUI = createErrorUI(client, 'Error', 'Failed to close ticket properly.');
            await interaction.followUp({ flags: MessageFlags.IsComponentsV2, components: [errorUI], ephemeral: true });
        }
    }
};
