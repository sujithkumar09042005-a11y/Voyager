const fs = require('fs');
const path = require('path');

const iconPath = path.join(__dirname, '..', 'public', 'icon.png');
const svgPath = path.join(__dirname, '..', 'public', 'favicon.svg');

const iconBuf = fs.readFileSync(iconPath);
const base64 = iconBuf.toString('base64');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  <defs>
    <clipPath id="circleClip">
      <circle cx="64" cy="64" r="62" />
    </clipPath>
    <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#285ccc" />
      <stop offset="50%" stop-color="#3b82f6" />
      <stop offset="100%" stop-color="#fff2bd" />
    </linearGradient>
  </defs>
  <circle cx="64" cy="64" r="63" fill="#285ccc" />
  <g clip-path="url(#circleClip)">
    <image href="data:image/png;base64,${base64}" x="0" y="0" width="128" height="128" preserveAspectRatio="xMidYMid slice" />
  </g>
  <circle cx="64" cy="64" r="62" fill="none" stroke="url(#ringGrad)" stroke-width="2.5" />
</svg>`;

fs.writeFileSync(svgPath, svg, 'utf8');
console.log('Successfully generated self-contained circular favicon.svg with embedded base64 image!');
