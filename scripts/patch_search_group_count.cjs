const fs = require('fs');
let html = fs.readFileSync('public/map.html', 'utf8');

const oldLogic = `            // Hide empty region groups
            const groups = document.querySelectorAll('.region-group');
            groups.forEach(group => {
                const visibleCards = Array.from(group.querySelectorAll('.school-card')).filter(card => card.style.display !== 'none');
                if (visibleCards.length === 0) {
                    group.style.display = 'none';
                } else {
                    group.style.display = 'block';
                }
            });`;

const newLogic = `            // Hide empty region groups and update count
            const groups = document.querySelectorAll('.region-group');
            const lang = getCurrentLanguage();
            groups.forEach(group => {
                const visibleCards = Array.from(group.querySelectorAll('.school-card')).filter(card => card.style.display !== 'none');
                if (visibleCards.length === 0) {
                    group.style.display = 'none';
                } else {
                    group.style.display = 'block';
                    const countSpan = group.querySelector('.region-header span:nth-child(2)');
                    if (countSpan) {
                        countSpan.textContent = visibleCards.length + (lang === 'en' ? '' : '개');
                    }
                }
            });`;

html = html.replace(oldLogic, newLogic);
fs.writeFileSync('public/map.html', html);
