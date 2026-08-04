const fs = require('fs');

function wrapWithT(filename) {
    let content = fs.readFileSync(filename, 'utf8');
    
    // Replace text inside JSX
    // > text </ -> >{t('text')}</
    content = content.replace(/(>)([^<]*[\u3131-\u318E\uAC00-\uD7A3]+[^<]*)(<\/)/g, (match, p1, p2, p3) => {
        let text = p2.trim();
        if(text.includes('{') || text.includes('}') || text.length > 80) return match; // skip complex
        if(text.includes("'")) return `${p1}{t("${text}")}${p3}`;
        return `${p1}{t('${text}')}${p3}`;
    });
    
    // Replace props like placeholder="한글"
    // We target common props: placeholder, label, title, alt
    const propsToReplace = ['placeholder', 'label', 'title', 'alt'];
    propsToReplace.forEach(prop => {
        const regex = new RegExp(`${prop}=(['"])([^'"]*[\\u3131-\\u318E\\uAC00-\\uD7A3]+[^'"]*)\\1`, 'g');
        content = content.replace(regex, (match, quote, text) => {
            if(text.includes('{')) return match;
            if(text.includes("'")) return `${prop}={t("${text}")}`;
            return `${prop}={t('${text}')}`;
        });
    });

    // Replace some raw strings in javascript code that are assigned to variables
    // e.g. name: '한글' -> name: t('한글')
    // We have to be very careful.
    
    fs.writeFileSync(filename, content);
}

['src/pages/CompanySearch.tsx', 'src/pages/MyPage.tsx', 'src/pages/Certificates.tsx'].forEach(wrapWithT);
console.log("Wrapped with t()!");
