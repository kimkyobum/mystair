const fs = require('fs');
let html = fs.readFileSync('public/map.html', 'utf8');

const newFontCSS = `    <!-- 1. Pretendard 폰트 추가 -->
    <link rel="stylesheet" as="style" crossorigin href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v3.2.1/dist/web/static/pretendard.css" />
    <style>
        @font-face {
            font-family: 'GmarketSans';
            src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2001@1.1/GmarketSansBold.woff') format('woff');
            font-weight: bold;
            font-style: normal;
        }
        @font-face {
            font-family: 'GmarketSansLight';
            src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2001@1.1/GmarketSansLight.woff') format('woff');
            font-weight: 300;
            font-style: normal;
        }
`;

html = html.replace(/<!-- 1\. Pretendard 폰트 추가.*?\n\s*<style>/s, newFontCSS);

const titleCSS = `        #title-overlay h1 {
            margin: 0;
            font-family: 'GmarketSans', sans-serif;
            font-size: 46px;
            font-weight: bold;
            letter-spacing: -0.02em;
            background: linear-gradient(135deg, #ffffff 0%, #cbd5e1 50%, #94a3b8 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            text-shadow: 0 4px 30px rgba(255, 255, 255, 0.2);
        }`;
html = html.replace(/#title-overlay h1 \{[\s\S]*?\}/, titleCSS);

const sidebarTitleCSS = `        .sidebar-header h2 {
            margin: 0 0 12px 0;
            font-family: 'GmarketSans', sans-serif;
            font-size: 30px;
            font-weight: bold;
            letter-spacing: -0.03em;
            background: linear-gradient(to right, #f8fafc, #94a3b8);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }`;
html = html.replace(/\.sidebar-header h2 \{[\s\S]*?\}/, sidebarTitleCSS);

fs.writeFileSync('public/map.html', html);
