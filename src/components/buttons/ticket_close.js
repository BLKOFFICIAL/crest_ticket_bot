/**
 * @author BLKOFFICIAL (https://github.com/BLKOFFICIAL)
 * @distributor CrestCloud (https://cloud.crestyy.xyz)
 * @license See LICENSE file for details. Redistribution is strictly prohibited.
 */
const discordTranscripts = require('discord-html-transcripts');
const { EmbedBuilder } = require('discord.js');

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
                return interaction.reply({ content: 'You do not have permission to close this ticket.', ephemeral: true });
            }
        }

        await interaction.reply({ content: 'Closing ticket and generating transcript...', ephemeral: false });

        const channel = interaction.channel;

        try {
            const attachment = await discordTranscripts.createTranscript(channel, {
                limit: -1,
                returnType: 'attachment',
                filename: `${channel.name}-transcript.html`,
                saveImages: true,
                poweredBy: false
            });

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
            await interaction.followUp({ content: 'Failed to close ticket properly.', ephemeral: true });
        }
    }
};

