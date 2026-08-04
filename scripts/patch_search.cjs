const fs = require('fs');
let html = fs.readFileSync('public/map.html', 'utf8');

const oldLogic = `                const name = card.querySelector('h3').textContent.toLowerCase();
                const badge = card.querySelector('.region-badge').textContent.toLowerCase();
                const field = card.querySelector('.field-info span:last-child').textContent.toLowerCase();`;

const newLogic = `                const nameNode = card.querySelector('.card-name');
                const badgeNode = card.querySelector('.region-badge');
                const fieldNode = card.querySelector('.card-field');
                
                const name = nameNode ? nameNode.textContent.toLowerCase() : '';
                const badge = badgeNode ? badgeNode.textContent.toLowerCase() : '';
                const field = fieldNode ? fieldNode.textContent.toLowerCase() : '';`;

html = html.replace(oldLogic, newLogic);
fs.writeFileSync('public/map.html', html);
