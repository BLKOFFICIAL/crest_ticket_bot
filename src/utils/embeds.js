/**
 * @author BLKOFFICIAL (https://github.com/BLKOFFICIAL)
 * @distributor CrestCloud (https://cloud.crestyy.xyz)
 * @license See LICENSE file for details. Redistribution is strictly prohibited.
 */
const { EmbedBuilder } = require('discord.js');

// Fallback colors if embeds.yml is missing
const FALLBACK_COLORS = {
    primary: '#2B2D31',
    success: '#57F287',
    error: '#ED4245',
    info: '#5865F2',
    warning: '#FEE75C'
};

function getColors(client) {
    return client?.embedsConfig?.colors || FALLBACK_COLORS;
}

function getTitle(client, type, fallback) {
    return client?.embedsConfig?.[type]?.title || fallback;
}

/**
 * Creates a clean, premium-looking success embed.
 */
function createSuccessEmbed(client, titleText, description) {
    return new EmbedBuilder()
        .setColor(getColors(client).success || FALLBACK_COLORS.success)
        .setTitle(titleText || getTitle(client, 'success', '✅ Success'))
        .setDescription(description)
        .setTimestamp();
}

/**
 * Creates a clean, premium-looking error embed.
 */
function createErrorEmbed(client, titleText, description) {
    return new EmbedBuilder()
        .setColor(getColors(client).error || FALLBACK_COLORS.error)
        .setTitle(titleText || getTitle(client, 'error', '❌ Error'))
        .setDescription(description)
        .setTimestamp();
}

/**
 * Creates a premium standard info embed.
 */
function createInfoEmbed(client, titleText, description) {
    return new EmbedBuilder()
        .setColor(getColors(client).info || FALLBACK_COLORS.info)
        .setTitle(titleText || getTitle(client, 'info', 'ℹ️ Information'))
        .setDescription(description)
        .setTimestamp();
}

/**
 * Creates the beautiful Ticket Panel embed.
 */
function createTicketPanelEmbed(client) {
    return new EmbedBuilder()
        .setColor(getColors(client).primary || FALLBACK_COLORS.primary)
        .setTimestamp();
}

/**
 * Creates the initial embed sent inside a newly opened ticket.
 */
function createTicketOpenedEmbed(client, user, reason) {
    const title = getTitle(client, 'ticket_opened', '🎫 Ticket Opened');
    const footer = client?.embedsConfig?.ticket_opened?.footer_text || 'Support Team';
    
    return new EmbedBuilder()
        .setColor(getColors(client).primary || FALLBACK_COLORS.primary)
        .setTitle(title)
        .setDescription(`Hello <@${user.id}>, welcome to your ticket!\n\n**Reason:** ${reason}\n\nPlease wait patiently for our staff to assist you.`)
        .setFooter({ text: footer })
        .setTimestamp();
}

module.exports = {
    createSuccessEmbed,
    createErrorEmbed,
    createInfoEmbed,
    createTicketPanelEmbed,
    createTicketOpenedEmbed
};
