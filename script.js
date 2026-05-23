/**
 * AloIon Photo-Card Generator
 * Core Canvas Engine
 */

const canvas = document.getElementById('cardCanvas');
const ctx = canvas.getContext('2d');

// Elements
const quoteInput = document.getElementById('quote');
const authorInput = document.getElementById('author');
const categoryInput = document.getElementById('category');
const imageUpload = document.getElementById('imageUpload');
const themeColorInput = document.getElementById('themeColor');
const overlayOpacityInput = document.getElementById('overlayOpacity');
const generateBtn = document.getElementById('generateBtn');
const downloadBtn = document.getElementById('downloadBtn');

// Assets
const logoImg = new Image();
let backgroundImage = null;

// Constants
const CANVAS_WIDTH = 1080;
const CANVAS_HEIGHT = 1350;
const PADDING = 80;

// Initialize
window.onload = () => {
    logoImg.onload = () => {
        // Ensure fonts are loaded before first render
        document.fonts.ready.then(() => {
            render();
        });
    };
    logoImg.src = 'aloionLogo.jpg';
};

// Listeners
generateBtn.addEventListener('click', render);
downloadBtn.addEventListener('click', downloadCanvas);

imageUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                backgroundImage = img;
                render();
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
});

// Update accent color in CSS
themeColorInput.addEventListener('input', (e) => {
    document.documentElement.style.setProperty('--accent', e.target.value);
});

async function render() {
    // Clear
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // 1. Draw Base Background
    drawBaseBackground();

    // 2. Draw User Image (if any)
    if (backgroundImage) {
        drawUserImage();
    }

    // 3. Draw Overlays (Vignette & Gradient)
    drawOverlays();

    // 4. Draw Typography
    drawTypography();

    // 5. Draw Logo
    drawLogo();

    // 6. Add Film Grain
    drawGrain();
}

function drawBaseBackground() {
    const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    grad.addColorStop(0, '#0A192F');
    grad.addColorStop(1, '#050a15');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}

function drawUserImage() {
    const imgRatio = backgroundImage.width / backgroundImage.height;
    const canvasRatio = CANVAS_WIDTH / CANVAS_HEIGHT;
    
    let drawWidth, drawHeight, x, y;

    if (imgRatio > canvasRatio) {
        drawHeight = CANVAS_HEIGHT;
        drawWidth = backgroundImage.width * (CANVAS_HEIGHT / backgroundImage.height);
        x = (CANVAS_WIDTH - drawWidth) / 2;
        y = 0;
    } else {
        drawWidth = CANVAS_WIDTH;
        drawHeight = backgroundImage.height * (CANVAS_WIDTH / backgroundImage.width);
        x = 0;
        y = (CANVAS_HEIGHT - drawHeight) / 2;
    }

    ctx.save();
    ctx.globalAlpha = 1.0;
    ctx.drawImage(backgroundImage, x, y, drawWidth, drawHeight);
    
    // Darken overlay from input
    ctx.fillStyle = `rgba(5, 10, 21, ${overlayOpacityInput.value})`;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.restore();
}

function drawOverlays() {
    // Vignette
    const vignette = ctx.createRadialGradient(
        CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 0,
        CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_HEIGHT * 0.8
    );
    vignette.addColorStop(0, 'rgba(0,0,0,0)');
    vignette.addColorStop(1, 'rgba(0,0,0,0.6)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Bottom gradient for text readability
    const textGrad = ctx.createLinearGradient(0, CANVAS_HEIGHT * 0.4, 0, CANVAS_HEIGHT);
    textGrad.addColorStop(0, 'rgba(5, 10, 21, 0)');
    textGrad.addColorStop(1, 'rgba(5, 10, 21, 0.9)');
    ctx.fillStyle = textGrad;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}

function drawTypography() {
    const accentColor = themeColorInput.value;
    const quote = quoteInput.value;
    const author = authorInput.value;
    const category = categoryInput.value.toUpperCase();

    // Category Badge (Glassmorphism effect)
    if (category) {
        ctx.save();
        const badgeX = PADDING;
        const badgeY = PADDING;
        
        ctx.font = 'bold 24px Inter';
        const badgeWidth = ctx.measureText(category).width + 40;
        const badgeHeight = 44;

        // Badge Box
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        roundRect(ctx, badgeX, badgeY, badgeWidth, badgeHeight, 4);
        ctx.fill();
        ctx.stroke();

        // Badge Text
        ctx.fillStyle = accentColor;
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.fillText(category, badgeX + badgeWidth/2, badgeY + badgeHeight/2 + 2);
        ctx.restore();
    }

    // Quote Text
    ctx.save();
    let fontSize = 72;
    if (quote.length > 50) fontSize = 64;
    if (quote.length > 100) fontSize = 54;
    if (quote.length > 150) fontSize = 48;

    ctx.font = `700 ${fontSize}px "Tiro Bangla"`;
    ctx.fillStyle = '#F8F9FA';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    
    // Subtle glow for readability
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 4;
    
    const maxWidth = CANVAS_WIDTH - (PADDING * 2);
    const lineHeight = fontSize * 1.5;
    const yPos = category ? PADDING + 120 : PADDING;
    
    const lines = wrapText(ctx, quote, PADDING, yPos, maxWidth, lineHeight);
    const totalTextHeight = lines.length * lineHeight;
    ctx.restore();

    // Author Text
    if (author) {
        ctx.save();
        ctx.font = '400 32px "Tiro Bangla"';
        ctx.fillStyle = 'rgba(248, 249, 250, 0.7)';
        ctx.textAlign = 'left';
        
        // Horizontal line
        const lineY = yPos + totalTextHeight + 40;
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(PADDING, lineY + 20);
        ctx.lineTo(PADDING + 60, lineY + 20);
        ctx.stroke();

        ctx.fillText(author, PADDING + 85, lineY + 32);
        ctx.restore();
    }
}

function drawLogo() {
    const logoSize = 120;
    const x = CANVAS_WIDTH - PADDING - logoSize;
    const y = CANVAS_HEIGHT - PADDING - logoSize;

    ctx.save();
    // Circle mask for logo
    ctx.beginPath();
    ctx.arc(x + logoSize/2, y + logoSize/2, logoSize/2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(logoImg, x, y, logoSize, logoSize);
    ctx.restore();
    
    // Brand name next to logo
    ctx.save();
    ctx.font = 'bold 28px Inter';
    ctx.fillStyle = '#F8F9FA';
    ctx.textAlign = 'right';
    ctx.fillText('AloIon', CANVAS_WIDTH - PADDING, CANVAS_HEIGHT - PADDING + 30);
    ctx.restore();
}

function drawGrain() {
    const imageData = ctx.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    const data = imageData.data;
    const noiseLevel = 15;

    for (let i = 0; i < data.length; i += 4) {
        const noise = (Math.random() - 0.5) * noiseLevel;
        data[i] += noise;
        data[i+1] += noise;
        data[i+2] += noise;
    }
    ctx.putImageData(imageData, 0, 0);
}

// Helpers
function wrapText(context, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    const lines = [];

    for (let n = 0; n < words.length; n++) {
        let testLine = line + words[n] + ' ';
        let metrics = context.measureText(testLine);
        let testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
            context.fillText(line, x, y);
            lines.push(line);
            line = words[n] + ' ';
            y += lineHeight;
        } else {
            line = testLine;
        }
    }
    context.fillText(line, x, y);
    lines.push(line);
    return lines;
}

function roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}

function downloadCanvas() {
    const link = document.createElement('a');
    link.download = `aloion-card-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
}
