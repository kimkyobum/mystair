const fs = require('fs');
let code = fs.readFileSync('src/index.css', 'utf8');

const oldKeyframes = `@keyframes marquee {
  0% {
    transform: translateX(0%);
  }
  100% {
    transform: translateX(-33.33%);
  }
}
.animate-marquee {
  animation: marquee 20s linear infinite;
}`;

const newKeyframes = `@keyframes marquee {
  0% { transform: translateX(0%); }
  100% { transform: translateX(-100%); }
}
.animate-marquee {
  animation: marquee 20s linear infinite;
}`;

code = code.replace(oldKeyframes, newKeyframes);
fs.writeFileSync('src/index.css', code);
