/**
 * @author BLKOFFICIAL (https://github.com/BLKOFFICIAL)
 * @distributor CrestCloud (https://cloud.crestyy.xyz)
 * @license See LICENSE file for details. Redistribution is strictly prohibited.
 */
const { 
    ContainerBuilder, 
    TextDisplayBuilder, 
    SeparatorBuilder, 
    SeparatorSpacingSize, 
    SectionBuilder,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js');

const FALLBACK_COLORS = {
    primary: 0x2B2D31,
    success: 0x57F287,
    error: 0xED4245,
    info: 0x5865F2,
    warning: 0xFEE75C
};

// Convert hex string to integer for ContainerBuilder
function getAccentColor(client, type) {
    const colorHex = client?.embedsConfig?.colors?.[type] || FALLBACK_COLORS[type];
    if (typeof colorHex === 'string') {
        return parseInt(colorHex.replace('#', ''), 16);
    }
    return colorHex;
}

function getTitle(client, type, fallback) {
    return client?.embedsConfig?.[type]?.title || fallback;
}

/**
 * Creates a Components V2 Success Message.
 */
function createSuccessUI(client, titleText, description) {
    const title = titleText || getTitle(client, 'success', '✅ Success');
    return new ContainerBuilder()
        .setAccentColor(getAccentColor(client, 'success'))
        .addSectionComponents(
            new SectionBuilder().addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`**${title}**\n${description}`)
            )
        );
}

/**
 * Creates a Components V2 Error Message.
 */
function createErrorUI(client, titleText, description) {
    const title = titleText || getTitle(client, 'error', '❌ Error');
    return new ContainerBuilder()
        .setAccentColor(getAccentColor(client, 'error'))
        .addSectionComponents(
            new SectionBuilder().addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`**${title}**\n${description}`)
            )
        );
}

/**
 * Creates a Components V2 Info Message.
 */
function createInfoUI(client, titleText, description) {
    const title = titleText || getTitle(client, 'info', 'ℹ️ Information');
    return new ContainerBuilder()
        .setAccentColor(getAccentColor(client, 'info'))
        .addSectionComponents(
            new SectionBuilder().addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`**${title}**\n${description}`)
            )
        );
}

/**
 * Creates the Components V2 Ticket Panel.
 */
function createTicketPanelUI(client, titleText, description) {
    return new ContainerBuilder()
        .setAccentColor(getAccentColor(client, 'primary'))
        .addSectionComponents(
            new SectionBuilder().addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`**${titleText}**\n${description}`)
            )
        )
        .addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small))
        .addTextDisplayComponents(new TextDisplayBuilder().setContent('_Powered by CrestCloud_'));
}

/**
 * Creates the initial Components V2 message sent inside a newly opened ticket.
 */
function createTicketOpenedUI(client, user, reason) {
    const title = getTitle(client, 'ticket_opened', '🎫 Ticket Opened');
    const footer = client?.embedsConfig?.ticket_opened?.footer_text || 'Support Team';
    
    return new ContainerBuilder()
        .setAccentColor(getAccentColor(client, 'primary'))
        .addSectionComponents(
            new SectionBuilder().addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`**${title}**\nHello <@${user.id}>, welcome to your ticket!\n\n**Reason:** ${reason}\n\nPlease wait patiently for our staff to assist you.`)
            )
        )
        .addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small))
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(`_${footer}_`));
}

module.exports = {
    createSuccessUI,
    createErrorUI,
    createInfoUI,
    createTicketPanelUI,
    createTicketOpenedUI
};
