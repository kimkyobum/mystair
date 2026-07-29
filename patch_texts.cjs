const fs = require('fs');
let html = fs.readFileSync('public/map.html', 'utf8');

const oldLogic = `            document.querySelector('.sidebar-header h2').textContent = t.title;
            document.querySelector('#title-overlay h1').textContent = t.map_title;
            document.querySelector('#loading div:nth-child(2)').textContent = t.loading;
            document.querySelector('#info').textContent = t.info;
            document.querySelector('#school-search').placeholder = t.search_placeholder;`;

const newLogic = `            if (document.querySelector('.sidebar-header h2')) document.querySelector('.sidebar-header h2').textContent = t.title;
            if (document.querySelector('#title-overlay h1')) document.querySelector('#title-overlay h1').textContent = t.map_title;
            if (document.querySelector('#loading div:nth-child(2)')) document.querySelector('#loading div:nth-child(2)').textContent = t.loading;
            if (document.querySelector('#info')) document.querySelector('#info').textContent = t.info;
            if (document.querySelector('#school-search')) document.querySelector('#school-search').placeholder = t.search_placeholder;`;

html = html.replace(oldLogic, newLogic);
fs.writeFileSync('public/map.html', html);
