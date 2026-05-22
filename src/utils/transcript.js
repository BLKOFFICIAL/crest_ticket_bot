/**
 * @author BLKOFFICIAL (https://github.com/BLKOFFICIAL)
 * @distributor CrestCloud (https://cloud.crestyy.xyz)
 * @license See LICENSE file for details. Redistribution is strictly prohibited.
 */
const { AttachmentBuilder } = require('discord.js');

async function createCustomTranscript(channel) {
    let messages = [];
    let lastId = undefined;

    while (true) {
        const options = { limit: 100 };
        if (lastId) options.before = lastId;

        const fetched = await channel.messages.fetch(options);
        if (fetched.size === 0) break;

        messages.push(...Array.from(fetched.values()));
        lastId = fetched.last().id;

        if (messages.length >= 1000) break; // Limit to 1000 messages for performance
    }

    messages = messages.reverse();

    let html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Transcript: ${channel.name}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
            body { background-color: #1e1e24; color: #e0e0e0; font-family: 'Inter', sans-serif; }
            .msg-bg { background-color: #2b2d31; }
            .bot-tag { background-color: #5865F2; color: white; padding: 2px 6px; border-radius: 4px; font-size: 0.7rem; font-weight: bold; margin-left: 6px; }
            .avatar { width: 40px; height: 40px; border-radius: 50%; }
        </style>
    </head>
    <body class="p-8">
        <div class="max-w-4xl mx-auto">
            <div class="bg-[#2B2D31] rounded-lg p-6 mb-8 shadow-lg border border-[#1e1e24]">
                <h1 class="text-3xl font-bold text-white mb-2">Transcript: #${channel.name}</h1>
                <p class="text-gray-400">Archived on ${new Date().toLocaleString()}</p>
                <p class="text-gray-500 text-sm mt-2">Powered by CrestCloud Premium</p>
            </div>
            
            <div class="space-y-4">
    `;

    for (const msg of messages) {
        if (msg.author.bot && msg.components.length > 0 && !msg.content && msg.embeds.length === 0) continue; // Skip pure UI components if possible

        const avatarUrl = msg.author.displayAvatarURL({ extension: 'png', size: 64 }) || 'https://cdn.discordapp.com/embed/avatars/0.png';
        const timestamp = msg.createdAt.toLocaleString();
        
        let contentHtml = msg.content ? `<p class="mt-1 text-[#DBDEE1] whitespace-pre-wrap">${msg.content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>` : '';
        
        if (msg.attachments.size > 0) {
            msg.attachments.forEach(att => {
                if (att.contentType && att.contentType.startsWith('image/')) {
                    contentHtml += `<img src="${att.url}" class="max-w-md rounded-md mt-2 border border-[#1e1e24] shadow-sm">`;
                } else {
                    contentHtml += `<a href="${att.url}" target="_blank" class="text-blue-400 hover:underline mt-2 inline-block">[Attachment: ${att.name}]</a>`;
                }
            });
        }

        if (msg.embeds.length > 0) {
            msg.embeds.forEach(embed => {
                contentHtml += `<div class="mt-2 bg-[#1e1e24] border-l-4 border-gray-500 rounded p-3">`;
                if (embed.title) contentHtml += `<strong class="block text-white mb-1">${embed.title}</strong>`;
                if (embed.description) contentHtml += `<span class="text-sm text-gray-300">${embed.description.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</span>`;
                contentHtml += `</div>`;
            });
        }

        html += `
                <div class="flex items-start p-2 hover:bg-[#313338] rounded transition-colors duration-150">
                    <img src="${avatarUrl}" alt="Avatar" class="avatar shadow-sm mr-4 mt-1">
                    <div class="flex-1">
                        <div class="flex items-baseline">
                            <span class="font-bold text-[#F2F3F5] text-lg">${msg.author.username}</span>
                            ${msg.author.bot ? '<span class="bot-tag">APP</span>' : ''}
                            <span class="text-xs text-gray-400 ml-3">${timestamp}</span>
                        </div>
                        ${contentHtml}
                    </div>
                </div>
        `;
    }

    html += `
            </div>
        </div>
    </body>
    </html>
    `;

    return new AttachmentBuilder(Buffer.from(html, 'utf-8'), { name: `transcript-${channel.name}.html` });
}

module.exports = { createCustomTranscript };
