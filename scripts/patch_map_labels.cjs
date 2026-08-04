const fs = require('fs');
let html = fs.readFileSync('public/map.html', 'utf8');

const newMarkerLogic = `
                labelDiv.innerHTML = \`
                    <div class="label-top">
                        <span class="region-badge bg-\${school.region}" data-original-region="\${school.region}">\${school.region}</span>
                        <span class="field-text" data-original-field="\${school.field}">\${school.field}</span>
                    </div>
                    <span class="school-name" data-original-name="\${school.name}">\${school.name}</span>
                \`;
`;
html = html.replace(/labelDiv\.innerHTML = `[\s\S]*?<span class="school-name">\$\{school\.name\}<\/span>\s*`;/, newMarkerLogic);

const updateTextsAdditions = `
            document.querySelector('.sidebar-header h2').textContent = t.title;
            document.querySelector('#title-overlay h1').textContent = t.map_title;
            document.querySelector('#loading div:nth-child(2)').textContent = t.loading;
            document.querySelector('#info').textContent = t.info;
            document.querySelector('#school-search').placeholder = t.search_placeholder;

            // Trigger search to update count text
            const searchInput = document.getElementById('school-search');
            searchInput.dispatchEvent(new Event('input'));
            
            // Re-render school cards if they exist
            if (document.querySelectorAll('.school-card').length > 0) {
                populateSidebar();
            }

            // Update Map labels
            document.querySelectorAll('.school-marker').forEach(marker => {
                const badge = marker.querySelector('.region-badge');
                if (badge) {
                    const origRegion = badge.getAttribute('data-original-region');
                    badge.textContent = lang === 'en' ? (regionMap[origRegion] || origRegion) : origRegion;
                }
            });
`;
html = html.replace(/document\.querySelector\('\.sidebar-header h2'\)\.textContent = t\.title;[\s\S]*?populateSidebar\(\);\n\s*\}/, updateTextsAdditions);

fs.writeFileSync('public/map.html', html);
