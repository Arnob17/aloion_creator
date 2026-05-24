/**
 * AloIon Photo-Card Generator
 * Core Canvas Engine
 */

const canvas = document.getElementById("cardCanvas");
const ctx = canvas.getContext("2d");

// Elements
const templateSelect = document.getElementById("templateSelect");
const mainLabel = document.getElementById("mainLabel");
const authorGroup = document.getElementById("authorGroup");
const newsSnippetGroup = document.getElementById("newsSnippetGroup");
const quizGroup = document.getElementById("quizGroup");

const primaryTextInput = document.getElementById("quote");
const secondaryTextInput = document.getElementById("headline");
const authorInput = document.getElementById("author");
const categoryInput = document.getElementById("category");
const imageUpload = document.getElementById("imageUpload");
const themeColorInput = document.getElementById("themeColor");
const overlayOpacityInput = document.getElementById("overlayOpacity");
const generateBtn = document.getElementById("generateBtn");
const downloadBtn = document.getElementById("downloadBtn");

// Assets
const logoImg = new Image();
let backgroundImage = null;

// Constants
const CANVAS_WIDTH = 1080;
const CANVAS_HEIGHT = 1350;
const PADDING = 80;

// Initialize
function init() {
  // Use the Base64 logo from logo.js to bypass CORS issues entirely
  if (typeof ALOION_LOGO !== "undefined") {
    logoImg.src = ALOION_LOGO;
  } else {
    // Fallback if logo.js isn't loaded
    logoImg.src = "aloionLogo.jpg";
  }

  logoImg.onload = () => {
    document.fonts.ready.then(() => render());
  };

  logoImg.onerror = () => {
    console.error("Failed to load logo image.");
    document.fonts.ready.then(() => render());
  };
}

window.onload = init;

// Listeners
templateSelect.addEventListener("change", (e) => {
  const val = e.target.value;
  if (val === "news") {
    authorGroup.style.display = "flex";
    newsSnippetGroup.style.display = "flex";
    quizGroup.style.display = "none";
    mainLabel.innerText = "Headline / Title";
  } else if (val === "quiz") {
    authorGroup.style.display = "none";
    newsSnippetGroup.style.display = "none";
    quizGroup.style.display = "block";
    mainLabel.innerText = "Quiz Question";
  } else {
    authorGroup.style.display = "flex";
    newsSnippetGroup.style.display = "none";
    quizGroup.style.display = "none";
    mainLabel.innerText = "Main Quote / Text";
  }
  render();
});

generateBtn.addEventListener("click", render);
downloadBtn.addEventListener("click", downloadCanvas);

imageUpload.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      // Data URLs don't need crossOrigin, but setting it to anonymous is safe
      img.crossOrigin = "anonymous";
      img.onload = () => {
        backgroundImage = img;
        render();
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  }
});

themeColorInput.addEventListener("input", (e) => {
  document.documentElement.style.setProperty("--accent", e.target.value);
});

async function render() {
  const template = templateSelect.value;
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  drawBaseBackground();

  if (backgroundImage) {
    drawUserImage();
  }

  drawOverlays(template);

  if (template === "news") {
    drawNewsTypography();
  } else if (template === "quiz") {
    drawQuizTypography();
  } else {
    drawQuoteTypography();
  }

  drawLogo(template);
  drawGrain();
}

function drawBaseBackground() {
  const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  grad.addColorStop(0, "#0A192F");
  grad.addColorStop(1, "#050a15");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}

function drawUserImage() {
  if (
    !backgroundImage ||
    !backgroundImage.complete ||
    backgroundImage.naturalWidth === 0
  )
    return;

  const imgRatio = backgroundImage.width / backgroundImage.height;
  const canvasRatio = CANVAS_WIDTH / CANVAS_HEIGHT;

  let drawWidth, drawHeight, x, y;

  if (imgRatio > canvasRatio) {
    drawHeight = CANVAS_HEIGHT;
    drawWidth =
      backgroundImage.width * (CANVAS_HEIGHT / backgroundImage.height);
    x = (CANVAS_WIDTH - drawWidth) / 2;
    y = 0;
  } else {
    drawWidth = CANVAS_WIDTH;
    drawHeight =
      backgroundImage.height * (CANVAS_WIDTH / backgroundImage.width);
    x = 0;
    y = (CANVAS_HEIGHT - drawHeight) / 2;
  }

  ctx.save();
  ctx.drawImage(backgroundImage, x, y, drawWidth, drawHeight);
  ctx.fillStyle = `rgba(5, 10, 21, ${overlayOpacityInput.value})`;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.restore();
}

function drawOverlays(template) {
  const vignette = ctx.createRadialGradient(
    CANVAS_WIDTH / 2,
    CANVAS_HEIGHT / 2,
    0,
    CANVAS_WIDTH / 2,
    CANVAS_HEIGHT / 2,
    CANVAS_HEIGHT * 0.8,
  );
  vignette.addColorStop(0, "rgba(0,0,0,0)");
  vignette.addColorStop(1, "rgba(0,0,0,0.6)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  const gradStart = template === "news" ? 0.5 : 0.4;
  const textGrad = ctx.createLinearGradient(
    0,
    CANVAS_HEIGHT * gradStart,
    0,
    CANVAS_HEIGHT,
  );
  textGrad.addColorStop(0, "rgba(5, 10, 21, 0)");
  textGrad.addColorStop(template === "news" ? 0.7 : 1, "rgba(5, 10, 21, 0.95)");
  ctx.fillStyle = textGrad;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}

function drawQuoteTypography() {
  const accentColor = themeColorInput.value;
  const text = primaryTextInput.value;
  const author = authorInput.value;
  const category = categoryInput.value.toUpperCase();

  if (category) {
    ctx.save();
    const badgeX = PADDING;
    const badgeY = PADDING;
    ctx.font = "bold 36px Inter";
    const badgeWidth = ctx.measureText(category).width + 40;
    const badgeHeight = 44;
    ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
    ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
    ctx.lineWidth = 1;
    roundRect(ctx, badgeX, badgeY, badgeWidth, badgeHeight, 4);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = accentColor;
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillText(
      category,
      badgeX + badgeWidth / 2,
      badgeY + badgeHeight / 2 + 2,
    );
    ctx.restore();
  }

  ctx.save();
  let fontSize = 72;
  if (text.length > 50) fontSize = 64;
  if (text.length > 100) fontSize = 54;
  if (text.length > 150) fontSize = 48;

  ctx.font = `700 ${fontSize}px "Tiro Bangla"`;
  ctx.fillStyle = "#F8F9FA";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.shadowColor = "rgba(0,0,0,0.5)";
  ctx.shadowBlur = 20;
  ctx.shadowOffsetY = 4;

  const maxWidth = CANVAS_WIDTH - PADDING * 2;
  const lineHeight = fontSize * 1.5;
  const yPos = category ? PADDING + 120 : PADDING;

  const lines = wrapText(ctx, text, PADDING, yPos, maxWidth, lineHeight);
  const totalTextHeight = lines.length * lineHeight;
  ctx.restore();

  if (author) {
    ctx.save();
    ctx.font = '400 32px "Tiro Bangla"';
    ctx.fillStyle = "rgba(248, 249, 250, 0.7)";
    ctx.textAlign = "left";
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

function drawNewsTypography() {
  const accentColor = themeColorInput.value;
  const headline = primaryTextInput.value;
  const snippet = secondaryTextInput.value;
  const category = categoryInput.value.toUpperCase();

  ctx.font = '700 84px "Tiro Bangla"';
  const maxWidth = CANVAS_WIDTH - PADDING * 2;
  const words = headline.split(" ");
  let line = "";
  const lines = [];
  for (let n = 0; n < words.length; n++) {
    let testLine = line + words[n] + " ";
    if (ctx.measureText(testLine).width > maxWidth && n > 0) {
      lines.push(line.trim());
      line = words[n] + " ";
    } else {
      line = testLine;
    }
  }
  lines.push(line.trim());

  const headlineLineHeight = 105;
  const totalHeadlineHeight = lines.length * headlineLineHeight;
  const headlineBottomY = CANVAS_HEIGHT - 200;
  const headlineTopY = headlineBottomY - totalHeadlineHeight + 20;

  const barHeight = 8;
  const barY = headlineTopY - 50;
  const categoryY = barY - 35;

  if (category) {
    ctx.save();
    ctx.font = "bold 36px Inter";
    ctx.fillStyle = accentColor;
    ctx.textBaseline = "bottom";
    ctx.fillText(category, PADDING, categoryY);
    ctx.restore();
  }

  ctx.fillStyle = accentColor;
  ctx.fillRect(PADDING, barY, 90, barHeight);

  ctx.save();
  ctx.font = '700 84px "Tiro Bangla"';
  ctx.fillStyle = "#F8F9FA";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.shadowColor = "rgba(0,0,0,0.4)";
  ctx.shadowBlur = 15;
  ctx.shadowOffsetY = 4;

  lines.forEach((l, i) => {
    ctx.fillText(l, PADDING, headlineTopY + i * headlineLineHeight);
  });
  ctx.restore();

  if (snippet) {
    ctx.save();
    ctx.font = '400 34px "Tiro Bangla"';
    ctx.fillStyle = "rgba(248, 249, 250, 0.8)";
    ctx.textBaseline = "top";
    ctx.fillText(
      snippet.substring(0, 150) + (snippet.length > 150 ? "..." : ""),
      PADDING,
      headlineBottomY + 20,
    );
    ctx.restore();
  }

  const author = authorInput.value;
  if (author) {
    ctx.save();
    ctx.font = '400 38px "Tiro Bangla"';
    ctx.fillStyle = "rgba(248, 249, 250, 0.9)";
    ctx.textAlign = "left";
    ctx.fillText(author, 80, headlineBottomY + 80);
    ctx.restore();
  }
}

function drawQuizTypography() {
  const accentColor = themeColorInput.value;
  const question = primaryTextInput.value;
  const optA = document.getElementById("optionA").value;
  const optB = document.getElementById("optionB").value;
  const optC = document.getElementById("optionC").value;
  const optD = document.getElementById("optionD").value;
  const category = categoryInput.value.toUpperCase();

  if (category) {
    ctx.save();
    const badgeX = PADDING;
    const badgeY = PADDING;
    ctx.font = "bold 36px Inter";
    const badgeWidth = ctx.measureText(category).width + 40;
    const badgeHeight = 44;
    ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
    ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
    ctx.lineWidth = 1;
    roundRect(ctx, badgeX, badgeY, badgeWidth, badgeHeight, 4);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = accentColor;
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillText(
      category,
      badgeX + badgeWidth / 2,
      badgeY + badgeHeight / 2 + 2,
    );
    ctx.restore();
  }

  ctx.save();
  let fontSize = 64;
  if (question.length > 50) fontSize = 54;
  if (question.length > 100) fontSize = 48;

  ctx.font = `700 ${fontSize}px "Tiro Bangla"`;
  ctx.fillStyle = "#F8F9FA";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.shadowColor = "rgba(0,0,0,0.5)";
  ctx.shadowBlur = 20;
  ctx.shadowOffsetY = 4;

  const maxWidth = CANVAS_WIDTH - PADDING * 2;
  const lineHeight = fontSize * 1.4;
  const yPos = category ? PADDING + 120 : PADDING;

  const lines = wrapText(ctx, question, PADDING, yPos, maxWidth, lineHeight);
  const totalQuestionHeight = lines.length * lineHeight;
  ctx.restore();

  // Options
  const options = [optA, optB, optC, optD];
  const labels = ["ক.", "খ.", "গ.", "ঘ."];
  const optionsStartY = yPos + totalQuestionHeight + 80;
  const optionHeight = 100;
  const optionSpacing = 30;

  ctx.save();
  ctx.font = `600 42px "Tiro Bangla"`;
  ctx.textBaseline = "middle";

  options.forEach((opt, i) => {
    const y = optionsStartY + i * (optionHeight + optionSpacing);

    // Option Box
    ctx.fillStyle = "rgba(255, 255, 255, 0.07)";
    ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
    ctx.lineWidth = 2;
    roundRect(ctx, PADDING, y, CANVAS_WIDTH - PADDING * 2, optionHeight, 12);
    ctx.fill();
    ctx.stroke();

    // Label
    ctx.fillStyle = accentColor;
    ctx.textAlign = "left";
    ctx.fillText(labels[i], PADDING + 40, y + optionHeight / 2 + 4);

    // Text
    ctx.fillStyle = "#F8F9FA";
    ctx.fillText(opt, PADDING + 120, y + optionHeight / 2 + 4);
  });
  ctx.restore();
}

function drawLogo(template) {
  if (!logoImg.complete || logoImg.naturalWidth === 0) return;

  const logoSize = template === "news" ? 160 : 120;
  const x = template === "news" ? PADDING : CANVAS_WIDTH - PADDING - logoSize;
  const y = template === "news" ? PADDING : CANVAS_HEIGHT - PADDING - logoSize;

  ctx.save();
  ctx.beginPath();
  ctx.arc(x + logoSize / 2, y + logoSize / 2, logoSize / 2, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(logoImg, x, y, logoSize, logoSize);
  ctx.restore();
}

function drawGrain() {
  const imageData = ctx.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  const data = imageData.data;
  const noiseLevel = 15;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * noiseLevel;
    data[i] += noise;
    data[i + 1] += noise;
    data[i + 2] += noise;
  }
  ctx.putImageData(imageData, 0, 0);
}

function wrapText(context, text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "";
  const lines = [];
  for (let n = 0; n < words.length; n++) {
    let testLine = line + words[n] + " ";
    if (context.measureText(testLine).width > maxWidth && n > 0) {
      context.fillText(line, x, y);
      lines.push(line);
      line = words[n] + " ";
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
  try {
    const link = document.createElement("a");
    link.download = `aloion-card-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  } catch (err) {
    console.error("Export failed:", err);
    alert(
      "আপনার ব্রাউজার সিকিউরিটি এই ডাউনলোডটি ব্লক করছে। এটি সাধারণত ঘটে যখন আপনি একটি এক্সটারনাল ইমেজ আপলোড করেন। অনুগ্রহ করে একটি লোকাল ইমেজ ব্যবহার করুন অথবা অ্যাপটি 'Live Server' দিয়ে চালান।",
    );
  }
}
