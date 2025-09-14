// Simple script to create placeholder SVG icons for PWA
const iconSizes = [32, 72, 96, 128, 144, 152, 192, 384, 512];

iconSizes.forEach(size => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <rect width="${size}" height="${size}" fill="#F49A1C" rx="${size/8}"/>
    <g transform="translate(${size/2}, ${size/2})">
      <rect x="-${size/6}" y="-${size/3}" width="${size/24}" height="${size/2}" fill="#E08A0C" rx="${size/48}"/>
      <rect x="-${size/12}" y="-${size/2.5}" width="${size/24}" height="${size/1.8}" fill="#E08A0C" rx="${size/48}"/>
      <rect x="0" y="-${size/2.2}" width="${size/24}" height="${size/1.6}" fill="#E08A0C" rx="${size/48}"/>
      <rect x="${size/12}" y="-${size/2.5}" width="${size/24}" height="${size/1.8}" fill="#E08A0C" rx="${size/48}"/>
      <rect x="${size/6}" y="-${size/3}" width="${size/24}" height="${size/2}" fill="#E08A0C" rx="${size/48}"/>
      <rect x="-${size/4}" y="-${size/8}" width="${size/2}" height="${size/24}" fill="#e0e0e0" rx="${size/48}"/>
    </g>
    <circle cx="${size/2}" cy="${size/4}" r="${size/12}" fill="#fff" opacity="0.8"/>
    <circle cx="${size/2.5}" cy="${size/5}" r="${size/20}" fill="#ffcdd2"/>
    <circle cx="${size/1.7}" cy="${size/5}" r="${size/20}" fill="#ffcdd2"/>
    <path d="M${size/2.2} ${size/3.5}Q${size/2} ${size/3}${size/1.8} ${size/3.5}" stroke="#333" stroke-width="${size/40}" fill="none" stroke-linecap="round"/>
  </svg>`;
  
  console.log(`Icon ${size}x${size} created`);
  return svg;
});

console.log('All PWA icons created successfully!');