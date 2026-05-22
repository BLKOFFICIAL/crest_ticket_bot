/**
 * @author BLKOFFICIAL (https://github.com/BLKOFFICIAL)
 * @distributor CrestCloud (https://cloud.crestyy.xyz)
 * @license See LICENSE file for details. Redistribution is strictly prohibited.
 */
const fs = require('fs');
const path = require('path');

module.exports = (client) => {
    client.handleComponents = async () => {
        const componentsPath = path.join(__dirname, '../components');
        if (!fs.existsSync(componentsPath)) return;
        
        const componentFolders = fs.readdirSync(componentsPath);
        for (const folder of componentFolders) {
            const componentFiles = fs.readdirSync(path.join(componentsPath, folder)).filter(file => file.endsWith('.js'));
            
            const { buttons, selectMenus, modals } = client;

            switch (folder) {
                case 'buttons':
                    for (const file of componentFiles) {
                        const button = require(`../components/${folder}/${file}`);
                        buttons.set(button.data.name, button);
                    }
                    break;
                case 'selectMenus':
                    for (const file of componentFiles) {
                        const menu = require(`../components/${folder}/${file}`);
                        selectMenus.set(menu.data.name, menu);
                    }
                    break;
                case 'modals':
                    for (const file of componentFiles) {
                        const modal = require(`../components/${folder}/${file}`);
                        modals.set(modal.data.name, modal);
                    }
                    break;
                default:
                    break;
            }
        }
    };
};

