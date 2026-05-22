/**
 * @author BLKOFFICIAL (https://github.com/BLKOFFICIAL)
 * @distributor CrestCloud (https://cloud.crestyy.xyz)
 * @license See LICENSE file for details. Redistribution is strictly prohibited.
 */
const { ActivityType, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const { createTicketPanelEmbed } = require('../utils/embeds');

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        console.log(`✅ Logged in as ${client.user.tag}`);

        // Handle RPC Rotation
        const rpcConfig = client.config.rpc;
        if (rpcConfig && rpcConfig.enabled && rpcConfig.statuses.length > 0) {
            let i = 0;
            setInterval(() => {
                client.user.setActivity(rpcConfig.statuses[i], { type: ActivityType.Watching });
                i = (i + 1) % rpcConfig.statuses.length;
            }, (rpcConfig.interval_seconds || 30) * 1000);
            
            // Set initial
            client.user.setActivity(rpcConfig.statuses[0], { type: ActivityType.Watching });
        }

        // Auto-Deploy Panels
        const panels = client.config.panels;
        if (panels && panels.length > 0) {
            for (const panel of panels) {
                try {
                    const channel = await client.channels.fetch(panel.channel_id);
                    if (!channel) continue;

                    // Fetch last 10 messages to see if the panel is already there
                    const messages = await channel.messages.fetch({ limit: 10 });
                    const existingPanel = messages.find(m => m.author.id === client.user.id && m.components.length > 0);

                    if (!existingPanel) {
                        const embed = createTicketPanelEmbed(client)
                            .setTitle(panel.title)
                            .setDescription(panel.description);
                        
                        const options = panel.categories.map(cat => ({
                            label: cat.label,
                            description: cat.description,
                            value: cat.value,
                            emoji: cat.emoji
                        }));

                        const selectMenu = new ActionRowBuilder()
                            .addComponents(
                                new StringSelectMenuBuilder()
                                    .setCustomId('ticket_category_select')
                                    .setPlaceholder('Select a support category...')
                                    .addOptions(options)
                            );

                        await channel.send({ embeds: [embed], components: [selectMenu] });
                        console.log(`Deployed panel to channel ${panel.channel_id}`);
                    }
                } catch (error) {
                    console.error(`Failed to deploy panel to ${panel.channel_id}:`, error.message);
                }
            }
        }
    },
};

