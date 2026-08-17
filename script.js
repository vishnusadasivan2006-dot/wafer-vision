/* ===== WAFERVISION - MAIN SCRIPT ===== */

// ===== THEME TOGGLE =====
const themeToggle = document.getElementById('themeToggle');
const html = document.documentElement;

function setTheme(theme) {
  html.setAttribute('data-theme', theme);
  themeToggle.textContent = theme === 'dark' ? '🌙' : '☀️';
  localStorage.setItem('wv-theme', theme);
}

themeToggle.addEventListener('click', () => {
  const current = html.getAttribute('data-theme');
  setTheme(current === 'dark' ? 'light' : 'dark');
});

// Load saved theme
const savedTheme = localStorage.getItem('wv-theme') || 'dark';
setTheme(savedTheme);

// ===== NAVBAR SCROLL =====
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
});

// ===== MOBILE NAV =====
const hamburgerBtn = document.getElementById('hamburgerBtn');
const mobileNav = document.getElementById('mobileNav');

hamburgerBtn.addEventListener('click', () => {
  mobileNav.classList.toggle('show');
  const spans = hamburgerBtn.querySelectorAll('span');
  if (mobileNav.classList.contains('show')) {
    spans[0].style.transform = 'rotate(45deg) translate(5px,5px)';
    spans[1].style.opacity = '0';
    spans[2].style.transform = 'rotate(-45deg) translate(5px,-5px)';
  } else {
    spans[0].style.transform = '';
    spans[1].style.opacity = '';
    spans[2].style.transform = '';
  }
});

function closeMobile() {
  mobileNav.classList.remove('show');
  const spans = hamburgerBtn.querySelectorAll('span');
  spans[0].style.transform = '';
  spans[1].style.opacity = '';
  spans[2].style.transform = '';
}

// ===== SCROLL REVEAL =====
const revealElements = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      // Trigger accuracy bar animations
      entry.target.querySelectorAll('.accuracy-fill').forEach(bar => {
        bar.style.width = bar.dataset.width + '%';
      });
    }
  });
}, { threshold: 0.15 });

revealElements.forEach(el => revealObserver.observe(el));

// ===== PARTICLE CANVAS =====
const canvas = document.getElementById('particleCanvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let particles = [];
  let animFrame;

  function resizeCanvas() {
    const hero = document.getElementById('hero');
    canvas.width = hero.offsetWidth;
    canvas.height = hero.offsetHeight;
  }

  function createParticles() {
    particles = [];
    const count = Math.min(60, Math.floor(canvas.width * canvas.height / 15000));
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.5,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.5 + 0.1
      });
    }
  }

  function drawParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p, i) => {
      p.x += p.speedX;
      p.y += p.speedY;
      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(99,102,241,${p.opacity})`;
      ctx.fill();

      // Connect nearby particles
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[j].x - p.x;
        const dy = particles[j].y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(59,130,246,${0.08 * (1 - dist / 120)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    });
    animFrame = requestAnimationFrame(drawParticles);
  }

  resizeCanvas();
  createParticles();
  drawParticles();
  window.addEventListener('resize', () => { resizeCanvas(); createParticles(); });
}

// ===== DEMO - SIMULATED DETECTION =====
const defectTypes = ['Center', 'Donut', 'Edge-Loc', 'Edge-Ring', 'Loc', 'Near-Full', 'Random', 'Scratch', 'None'];
const defectColors = ['#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#10b981', '#06b6d4', '#ec4899', '#f97316', '#6b7280'];

const demoUpload = document.getElementById('demoUpload');
const demoFileInput = document.getElementById('demoFileInput');

demoUpload.addEventListener('click', () => demoFileInput.click());
demoUpload.addEventListener('dragover', e => { e.preventDefault(); demoUpload.style.borderColor = 'var(--accent)'; });
demoUpload.addEventListener('dragleave', () => { demoUpload.style.borderColor = ''; });
demoUpload.addEventListener('drop', e => {
  e.preventDefault();
  demoUpload.style.borderColor = '';
  if (e.dataTransfer.files.length) simulateDetection(e.dataTransfer.files[0]);
});
demoFileInput.addEventListener('change', e => {
  if (e.target.files.length) simulateDetection(e.target.files[0]);
});

function simulateDetection(file) {
  const reader = new FileReader();
  reader.onload = function (e) {
    const img = new Image();
    img.onload = function () {
      // Show uploaded image
      demoUpload.innerHTML = `<img src="${e.target.result}" style="max-width:100%;max-height:280px;border-radius:8px">
        <p class="small" style="margin-top:10px">Click to upload another image</p>`;

      // Simulate detection
      const detectionResult = document.getElementById('detectionResult');
      const confidenceVal = document.getElementById('confidenceVal');
      detectionResult.textContent = 'Analyzing...';
      detectionResult.style.color = 'var(--accent)';
      confidenceVal.textContent = '';

      setTimeout(() => {
        // Generate random detection (simulated)
        const mainIdx = Math.floor(Math.random() * 8); // Exclude None for more interesting demo
        const confidence = (95 + Math.random() * 4.98).toFixed(2);
        const model = document.getElementById('modelSelect').value;

        detectionResult.textContent = `${defectTypes[mainIdx]} Defect Detected`;
        detectionResult.style.color = mainIdx === 8 ? 'var(--success)' : 'var(--warning)';
        confidenceVal.textContent = `Confidence: ${confidence}% | Model: ${model === 'resnet18' ? 'ResNet18 (98.07%)' : 'Ensemble (98.06%)'}`;

        // Generate probability bars
        const probs = generateProbabilities(mainIdx);
        const probBars = document.getElementById('probBars');
        probBars.innerHTML = '';
        probs.forEach((p, i) => {
          const bar = document.createElement('div');
          bar.className = 'prob-bar';
          bar.innerHTML = `
            <span class="prob-label">${defectTypes[i]}</span>
            <div class="prob-track"><div class="prob-value" style="width:0;background:${defectColors[i]}"></div></div>
            <span class="prob-pct" style="color:${defectColors[i]}">${p.toFixed(1)}%</span>`;
          probBars.appendChild(bar);
          setTimeout(() => {
            bar.querySelector('.prob-value').style.width = p + '%';
          }, 100 + i * 50);
        });

        // Generate heatmap
        generateHeatmap(img, mainIdx);
      }, 1500);
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function generateProbabilities(mainIdx) {
  const probs = new Array(9).fill(0);
  const mainProb = 90 + Math.random() * 9;
  probs[mainIdx] = mainProb;
  let remaining = 100 - mainProb;
  for (let i = 0; i < 9; i++) {
    if (i !== mainIdx) {
      const val = i === 8 ? remaining : Math.random() * remaining * 0.5;
      probs[i] = Math.max(0.01, val);
      remaining -= probs[i];
    }
  }
  // Normalize
  const sum = probs.reduce((a, b) => a + b, 0);
  return probs.map(p => (p / sum) * 100);
}

function generateHeatmap(img, defectIdx) {
  const heatmapCard = document.getElementById('heatmapCard');
  heatmapCard.style.display = 'block';

  // Draw original
  const origCanvas = document.getElementById('originalCanvas');
  const origCtx = origCanvas.getContext('2d');
  origCtx.clearRect(0, 0, 120, 120);
  origCtx.drawImage(img, 0, 0, 120, 120);

  // Draw simulated heatmap
  const heatCanvas = document.getElementById('heatmapCanvas');
  const heatCtx = heatCanvas.getContext('2d');
  heatCtx.clearRect(0, 0, 120, 120);
  heatCtx.drawImage(img, 0, 0, 120, 120);

  // Overlay simulated heatmap based on defect type
  const imageData = heatCtx.getImageData(0, 0, 120, 120);
  const data = imageData.data;
  const cx = 60, cy = 60;

  for (let y = 0; y < 120; y++) {
    for (let x = 0; x < 120; x++) {
      const idx = (y * 120 + x) * 4;
      let intensity = 0;
      const dx = x - cx, dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Different patterns for different defects
      switch (defectIdx) {
        case 0: intensity = dist < 25 ? 1 - dist / 25 : 0; break; // Center
        case 1: intensity = (dist > 25 && dist < 45) ? 1 - Math.abs(dist - 35) / 10 : 0; break; // Donut
        case 2: intensity = (dist > 45 && Math.abs(Math.atan2(dy, dx)) < 0.8) ? (dist - 45) / 15 : 0; break; // Edge-Loc
        case 3: intensity = dist > 45 ? 1 - (60 - dist) / 15 : 0; break; // Edge-Ring
        case 4: const lx = 30 + Math.random() * 20, ly = 30 + Math.random() * 20; intensity = Math.sqrt((x - lx) ** 2 + (y - ly) ** 2) < 20 ? 1 : 0; break; // Loc
        case 5: intensity = dist < 55 ? 0.7 : 0; break; // Near-full
        case 6: intensity = Math.random() > 0.85 ? 0.8 : 0; break; // Random
        case 7: intensity = Math.abs(dy - dx * 0.5) < 5 ? 0.9 : 0; break; // Scratch
        default: intensity = 0;
      }

      intensity = Math.max(0, Math.min(1, intensity));
      if (intensity > 0.1) {
        // Red/Yellow for defect
        data[idx] = Math.min(255, data[idx] + intensity * 200);
        data[idx + 1] = Math.min(255, data[idx + 1] + intensity * 60);
        data[idx + 2] = Math.max(0, data[idx + 2] - intensity * 100);
        data[idx + 3] = 255;
      } else {
        // Blue tint for normal
        data[idx] = Math.max(0, data[idx] * 0.6);
        data[idx + 1] = Math.max(0, data[idx + 1] * 0.6);
        data[idx + 2] = Math.min(255, data[idx + 2] + 40);
      }
    }
  }
  heatCtx.putImageData(imageData, 0, 0);
}

// ===== CHATBOT - EagleSpark.ai =====
// Note: API calls are now routed through the local proxy server (server.js) for security

// Pretrained knowledge base for offline responses
const knowledgeBase = [
  { patterns: ['hello', 'hi', 'hey', 'greet'], response: "Hello! 👋 Welcome to WaferVision. I'm EagleSpark.ai, your 24/7 assistant. How can I help you with wafer inspection today?" },
  { patterns: ['what is wafervision', 'about wafervision', 'what does this do', 'what is this'], response: "WaferVision is an AI-driven defect detection system for semiconductor wafer inspection. It uses deep learning models trained on the WM-811K dataset (811,457 wafer maps) to detect 9 types of wafer defects with up to 98.07% accuracy. Features include single image detection, batch processing, live camera inspection, automated email alerts, and comprehensive inspection analytics." },
  { patterns: ['defect', 'types of defect', 'what defects', 'defect class', 'categories'], response: "WaferVision detects 9 defect classes:\n\n🎯 **Center** - Defect concentrated at wafer center\n🍩 **Donut** - Ring-shaped defect pattern\n📍 **Edge-Loc** - Localized defect at wafer edge\n💍 **Edge-Ring** - Ring defect along the edge\n📌 **Loc** - Localized defect at arbitrary position\n🌕 **Near-Full** - Defect covering most of wafer\n🎲 **Random** - Randomly scattered defects\n✏️ **Scratch** - Linear scratch marks\n✅ **None** - No defect (normal wafer)" },
  { patterns: ['model', 'resnet', 'ensemble', 'architecture', 'which model'], response: "WaferVision offers two models:\n\n**1. ResNet18** (Recommended) - A high-accuracy 18-layer CNN achieving **98.07% accuracy**. Great for both speed and precision.\n\n**2. Ensemble Model** - Combines ResNet18+CBAM, EfficientNet-B0, and DenseNet121 with weighted averaging. Achieves **98.06% accuracy**. CBAM adds Channel and Spatial attention for better feature focus.\n\nYou can switch between models anytime in the application settings." },
  { patterns: ['accuracy', 'how accurate', 'performance', 'precision'], response: "Our ResNet18 model achieves **98.07% accuracy** and the Ensemble model achieves **98.06% accuracy** on the WM-811K dataset. ResNet18 provides fast inference (~12ms on GPU) while the Ensemble model uses three combined architectures with ~45ms GPU inference time." },
  { patterns: ['dataset', 'wm-811k', 'training data', 'how many'], response: "We use the **WM-811K dataset**, an industry-standard benchmark containing **811,457 real-world semiconductor wafer maps** across 9 defect classes. Both models are trained on the complete dataset to ensure robust generalization across all defect types." },
  { patterns: ['heatmap', 'localization', 'grad-cam', 'where is defect'], response: "WaferVision generates **Grad-CAM defect localization heatmaps** that visually show where defects are located:\n\n🔴 **Red/Yellow** = Defect location\n🔵 **Blue** = Normal area\n\nThe heatmap is displayed alongside the original wafer image, and you can download the complete inspection report as a PDF." },
  { patterns: ['alert', 'email', 'notification', 'notify'], response: "When a defect is detected during live inspection, WaferVision automatically:\n\n1. 🔔 Sends an email alert to the registered user (if email alerts are enabled in settings)\n2. 💾 Saves the result to inspection history\n3. 📊 Generates class probability analysis\n4. 🗺️ Creates a defect localization heatmap\n\nYou can view all alerts in the Alert History section, including total alerts, sent/failed counts, and export the full history as CSV." },
  { patterns: ['batch', 'multiple images', 'bulk', 'many images'], response: "**Batch Processing** allows you to upload multiple wafer images simultaneously. The system processes all images in parallel, classifying each one and generating individual defect reports. Results are displayed in a comprehensive table with defect types, confidence scores, and options to view detailed analysis for each image." },
  { patterns: ['camera', 'live', 'real-time', 'microscope', 'continuous'], response: "**Live Camera Detection** connects to an external microscope for real-time wafer inspection. The system continuously captures frames, runs inference, and displays live defect detection results. When a defect is found, it automatically triggers the alert system (if enabled) and saves to inspection history." },
  { patterns: ['history', 'previous', 'past inspection', 'records'], response: "The **Inspection History** dashboard provides:\n\n📊 Total Inspections count\n🔴 Defective wafer count\n🟢 Normal wafer count\n📈 Defect rate percentage\n📉 Daily Inspection Trend (graph)\n📋 Full searchable inspection history table\n\nAll data is stored securely in the SQLite database." },
  { patterns: ['security', 'password', 'authentication', 'login', 'safe'], response: "WaferVision uses enterprise-grade security:\n\n🔐 **bcrypt** password hashing\n🛡️ Secure session management\n🔑 Password change functionality in Settings\n💾 SQLite database for secure data storage\n\nAll user data and inspection records are stored securely." },
  { patterns: ['setting', 'dark mode', 'light mode', 'theme', 'preference'], response: "In **My Settings**, you can:\n\n🌙 Switch between Dark Mode and Light Mode\n🔑 Change your password\n📧 Enable/disable email alert notifications\n🧠 Select your preferred detection model\n\nAll preferences are saved to your user profile." },
  { patterns: ['contact', 'support', 'help', 'phone', 'reach'], response: "You can reach our support team:\n\n📞 **Phone:** +91-6374111082\n📧 **Email:** vishnusadasivan2006@gmail.com\n🤖 **AI Assistant:** I'm here 24/7!\n\nFeel free to ask me any question about the platform!" },
  { patterns: ['latency', 'speed', 'fast', 'gpu', 'cpu', 'time'], response: "WaferVision is optimized for speed:\n\n| Operation | CPU | GPU | Speedup |\n|-----------|-----|-----|--------|\n| ResNet18 | 85ms | 12ms | 7.1× |\n| Ensemble | 240ms | 45ms | 5.3× |\n| Grad-CAM | 150ms | 30ms | 5.0× |\n| Full Pipeline | 420ms | 95ms | 4.4× |\n| Batch (100) | 38s | 4.2s | 9.0× |\n\nGPU acceleration provides up to 9× speedup!" },
  { patterns: ['cbam', 'attention', 'channel', 'spatial'], response: "**CBAM (Convolutional Block Attention Module)** is integrated into our Ensemble model's ResNet18 backbone. It applies:\n\n1. **Channel Attention** - Learns which feature channels are most important\n2. **Spatial Attention** - Focuses on the most relevant spatial regions\n\nThis dual attention mechanism significantly improves defect detection accuracy by helping the model focus on defect-relevant features." },
  { patterns: ['pdf', 'report', 'download', 'export'], response: "WaferVision generates downloadable reports:\n\n📄 **Inspection Report (PDF)** - Contains the original wafer image, defect localization heatmap, class probabilities, confidence scores, and inspection metadata.\n\n📊 **Alert History (CSV)** - Exportable spreadsheet of all alerts with timestamps, defect types, and status.\n\nReports are generated using the ReportLab library for professional-quality PDF output." },
  { patterns: ['eaglespark', 'chatbot', 'assistant', 'ai help'], response: "I'm **EagleSpark.ai**, your 24/7 AI assistant for WaferVision! I'm trained on the entire platform's knowledge base and can help you with:\n\n• Understanding defect types and detection process\n• Model selection and performance queries\n• Platform features and navigation\n• Technical questions about wafer inspection\n• Troubleshooting and support\n\nJust ask me anything! 🚀" },
];

function findBestResponse(query) {
  const q = query.toLowerCase().trim();
  let bestMatch = null;
  let bestScore = 0;

  for (const item of knowledgeBase) {
    for (const pattern of item.patterns) {
      if (q.includes(pattern)) {
        const score = pattern.length / q.length;
        if (score > bestScore) {
          bestScore = score;
          bestMatch = item.response;
        }
      }
    }
  }
  return bestMatch;
}

let selectedEagleSparkModel = 'EagleSpark.ai PRO';

function toggleChatbot() {
  const window_ = document.getElementById('chatbotWindow');
  const toggle = document.getElementById('chatbotToggle');
  window_.classList.toggle('show');
  toggle.classList.toggle('open');
}

function startNewChat() {
  chatHistory = [];
  const messages = document.getElementById('chatMessages');
  messages.innerHTML = `
    <!-- Welcome screen -->
    <div class="chat-welcome-container" id="chatWelcomeContainer">
      <div class="chat-welcome-logo">
        <svg viewBox="0 0 36 36" fill="none" width="40" height="40">
          <circle cx="18" cy="18" r="16" stroke="url(#g3)" stroke-width="2.5"></circle>
          <circle cx="18" cy="18" r="8" stroke="url(#g3)" stroke-width="2"></circle>
          <circle cx="18" cy="18" r="3" fill="#6366f1"></circle>
          <defs>
            <linearGradient id="g3" x1="0" y1="0" x2="36" y2="36">
              <stop stop-color="#3b82f6"></stop>
              <stop offset="1" stop-color="#8b5cf6"></stop>
            </linearGradient>
          </defs>
        </svg>
      </div>
      <h2>How can I help you today?</h2>
      <div class="chat-suggestions-grid">
        <div class="chat-suggestion-card" onclick="fillPrompt('Tell me about Center wafer defects')">
          <div class="title">🎯 Wafer Defects</div>
          <div class="desc">Explain Center defects and 8 other classes</div>
        </div>
        <div class="chat-suggestion-card" onclick="fillPrompt('Explain ResNet18 vs Ensemble models')">
          <div class="title">🧠 ML Models</div>
          <div class="desc">Compare ResNet18 and Ensemble architectures</div>
        </div>
        <div class="chat-suggestion-card" onclick="fillPrompt('What is WaferVision accuracy?')">
          <div class="title">📊 Performance</div>
          <div class="desc">Show GPU latency and accuracy benchmarks</div>
        </div>
        <div class="chat-suggestion-card" onclick="fillPrompt('How do automated email alerts work?')">
          <div class="title">📧 Alerting</div>
          <div class="desc">How defect alerts trigger notifications</div>
        </div>
      </div>
    </div>
  `;
  const input = document.getElementById('chatInput');
  input.value = '';
  input.style.height = 'auto';
  document.getElementById('chatSendBtn').disabled = true;
}

function fillPrompt(promptText) {
  const input = document.getElementById('chatInput');
  input.value = promptText;
  adjustTextareaHeight(input);
  document.getElementById('chatSendBtn').disabled = false;
  sendChat();
}

function adjustTextareaHeight(textarea) {
  textarea.style.height = 'auto';
  textarea.style.height = textarea.scrollHeight + 'px';
  document.getElementById('chatSendBtn').disabled = textarea.value.trim() === '';
}

function handleChatInputKeydown(event) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    sendChat();
  }
}

function copyMessageText(btn) {
  const msg = btn.closest('.chat-msg');
  const textToCopy = msg ? msg.dataset.rawContent : '';
  if (!textToCopy) return;

  navigator.clipboard.writeText(textToCopy).then(() => {
    // Show success checkmark
    const originalHTML = btn.innerHTML;
    btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    btn.title = 'Copied!';
    setTimeout(() => {
      btn.innerHTML = originalHTML;
      btn.title = 'Copy message';
    }, 1500);
  }).catch(err => {
    console.error('Failed to copy message:', err);
  });
}

function addChatMessage(text, isUser) {
  const messages = document.getElementById('chatMessages');

  // Hide welcome container if active
  const welcome = document.getElementById('chatWelcomeContainer');
  if (welcome) welcome.remove();

  const msg = document.createElement('div');
  msg.className = `chat-msg ${isUser ? 'user' : 'bot'}`;
  msg.dataset.rawContent = text; // Save raw text for copy button

  if (isUser) {
    msg.innerHTML = `<div class="chat-msg-wrapper">${escapeHTML(text)}</div>`;
  } else {
    const parsed = formatChatMessage(text);

    // Replace placeholder texts in parsed html with empty containers that we can populate
    let htmlContent = parsed.html;
    parsed.placeholders.forEach(p => {
      if (p.isMath) {
        htmlContent = htmlContent.replace(p.id, `<span class="math-container" data-math-content="${escapeHTML(p.content)}" data-math-display="${p.displayMode}"></span>`);
      } else {
        htmlContent = htmlContent.replace(p.id, `<span class="html-container" data-html-idx="${p.id}"></span>`);
      }
    });

    msg.innerHTML = `
      <div class="chat-bot-avatar">🤖</div>
      <div class="chat-msg-wrapper">
        <div class="chat-msg-content">${htmlContent}</div>
        <button class="chat-copy-btn" onclick="copyMessageText(this)" title="Copy message">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
        </button>
      </div>
    `;

    // Now render KaTeX and HTML inside the created elements
    const contentEl = msg.querySelector('.chat-msg-content');

    // Render math blocks
    contentEl.querySelectorAll('.math-container').forEach(spanEl => {
      const mathContent = spanEl.dataset.mathContent;
      const displayMode = spanEl.dataset.mathDisplay === 'true';
      try {
        katex.render(mathContent, spanEl, {
          displayMode: displayMode,
          throwOnError: false
        });
      } catch (err) {
        console.error("KaTeX render error:", err);
        spanEl.textContent = (displayMode ? '$$' : '$') + mathContent + (displayMode ? '$$' : '$');
      }
    });

    // Render tables and code blocks
    contentEl.querySelectorAll('.html-container').forEach(spanEl => {
      const idx = spanEl.dataset.htmlIdx;
      const p = parsed.placeholders.find(item => item.id === idx);
      if (p) {
        spanEl.outerHTML = p.content;
      }
    });
  }

  messages.appendChild(msg);
  messages.scrollTop = messages.scrollHeight;
  return msg;
}

function showTyping() {
  const messages = document.getElementById('chatMessages');

  // Hide welcome container if active
  const welcome = document.getElementById('chatWelcomeContainer');
  if (welcome) welcome.remove();

  const msg = document.createElement('div');
  msg.className = 'chat-msg bot typing';
  msg.id = 'typingIndicator';
  msg.innerHTML = `
    <div class="chat-bot-avatar">🤖</div>
    <div class="chat-msg-wrapper">
      <div class="dots"><span></span><span></span><span></span></div>
    </div>
  `;
  messages.appendChild(msg);
  messages.scrollTop = messages.scrollHeight;
}

function removeTyping() {
  const el = document.getElementById('typingIndicator');
  if (el) el.remove();
}

let chatHistory = [];

async function sendChat() {
  const input = document.getElementById('chatInput');
  const query = input.value.trim();
  if (!query) return;

  addChatMessage(query, true);
  chatHistory.push({ role: 'user', content: query });
  // Keep history size reasonable (last 10 messages)
  if (chatHistory.length > 10) {
    chatHistory.shift();
  }

  input.value = '';
  input.style.height = 'auto';
  document.getElementById('chatSendBtn').disabled = true;
  showTyping();

  // Try API first via secure local proxy server
  let apiSuccess = false;
  try {
    // Self-healing API URL resolver
    let apiUrl = '/api/chat';
    const isLocal = window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname.startsWith('192.168.') ||
      window.location.hostname.startsWith('10.') ||
      window.location.protocol === 'file:';

    if (isLocal && window.location.port !== '3000') {
      const host = window.location.hostname === 'localhost' || window.location.protocol === 'file:'
        ? 'localhost'
        : window.location.hostname;
      apiUrl = `http://${host}:3000/api/chat`;
    }

    // Timeout protection - abort after 15 seconds
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: `You are EagleSpark.ai, the 24/7 AI assistant for WaferVision — an AI-driven defect detection system for semiconductor wafer inspection. You are embedded in the WaferVision website.

Key facts about WaferVision:
- Uses deep learning for semiconductor wafer defect detection
- Two models: ResNet18 (98.07% accuracy) and Ensemble (ResNet18+CBAM + EfficientNet-B0 + DenseNet121, 98.06% accuracy)
- Trained on WM-811K dataset (811,457 wafer maps, 9 defect classes)
- 9 defect types: Center, Donut, Edge-Loc, Edge-Ring, Loc, Near-Full, Random, Scratch, None
- Features: Single image detection, batch processing, live camera detection, inspection history with analytics, email alerts, user management, dark/light mode
- Generates Grad-CAM heatmaps (Red/Yellow = defect, Blue = normal)
- PDF inspection reports and CSV alert history export
- Secure authentication with bcrypt, SQLite database
- Contact: +91-6374111082, vishnusadasivan2006@gmail.com

Formatting Guidelines:
- Answer questions helpfully, accurately, and concisely. Use emojis occasionally for friendliness.
- Mathematical equations: Always format mathematical formulas or calculations in LaTeX. Use double dollar signs ($$ ... $$) on separate lines for display/block equations and single dollar signs ($ ... $) for inline equations. Example: $$E = mc^2$$.
- Step-by-Step structure: If answering with calculations or steps, organize your response clearly using 'Step 1: [Title]', 'Step 2: [Title]', etc. Separate steps with a markdown horizontal rule line '---' on a line by itself. This will render beautiful divided steps in the chatbot.`
          },
          ...chatHistory
        ],
        max_tokens: 1000,
        temperature: 0.7
      })
    });

    clearTimeout(timeout);

    if (response.ok) {
      const data = await response.json();
      if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
        removeTyping();
        const content = data.choices[0].message.content;
        addChatMessage(content, false);
        chatHistory.push({ role: 'assistant', content: content });
        apiSuccess = true;
      }
    } else {
      console.warn('EagleSpark.ai API returned status:', response.status);
    }
  } catch (e) {
    if (e.name === 'AbortError') {
      console.log('API request timed out, falling back to local knowledge base.');
    } else {
      console.log('API unavailable, falling back to local knowledge base. Error:', e.message || e);
    }
  }

  // If API failed for ANY reason, always fall back to local knowledge base
  if (!apiSuccess) {
    setTimeout(() => {
      removeTyping();
      const localResponse = findBestResponse(query);
      if (localResponse) {
        const offlineResponse = `⚠️ **[Offline Mode — Connection to EagleSpark.ai API failed]**\n\n${localResponse}`;
        addChatMessage(offlineResponse, false);
        chatHistory.push({ role: 'assistant', content: localResponse });
      } else {
        const fallbackText = "⚠️ **[Offline Mode — Connection to EagleSpark.ai API failed]**\n\nI appreciate your question! While I don't have a specific answer for that in my local knowledge base, I can help with questions about:\n\n• Wafer defect types and detection\n• Model architectures (ResNet18, Ensemble)\n• Platform features and usage\n• Performance and accuracy stats\n• Contact and support info\n\nPlease try asking about any of these topics! 🚀";
        addChatMessage(fallbackText, false);
        chatHistory.push({ role: 'assistant', content: fallbackText });
      }
    }, 600 + Math.random() * 400);
  }
}

function escapeHTML(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderTable(rows) {
  let html = '<table>';
  let hasHeader = false;

  // Filter out the separator row (e.g. |---|---|)
  const contentRows = rows.filter(row => {
    return !/^\|[\s\-:|]+?\|$/.test(row);
  });

  contentRows.forEach((row, idx) => {
    const cells = row.split('|').slice(1, -1).map(c => c.trim());
    if (idx === 0 && rows[1] && /^\|[\s\-:|]+?\|$/.test(rows[1])) {
      html += '<thead><tr>';
      cells.forEach(cell => {
        html += `<th>${cell}</th>`;
      });
      html += '</tr></thead><tbody>';
      hasHeader = true;
    } else {
      html += '<tr>';
      cells.forEach(cell => {
        html += `<td>${cell}</td>`;
      });
      html += '</tr>';
    }
  });

  if (hasHeader) {
    html += '</tbody>';
  }
  html += '</table>';
  return html;
}

function balanceMathString(math) {
  // Balance curly braces
  let openBraces = (math.match(/\{/g) || []).length;
  let closeBraces = (math.match(/\}/g) || []).length;
  while (openBraces > closeBraces) {
    math += '}';
    closeBraces++;
  }
  // Balance parentheses
  let openParens = (math.match(/\(/g) || []).length;
  let closeParens = (math.match(/\)/g) || []).length;
  while (openParens > closeParens) {
    math += ')';
    closeParens++;
  }
  // Balance brackets
  let openBrackets = (math.match(/\[/g) || []).length;
  let closeBrackets = (math.match(/\]/g) || []).length;
  while (openBrackets > closeBrackets) {
    math += ']';
    closeBrackets++;
  }
  return math;
}

function formatChatMessage(text) {
  // If there's an unclosed block math (odd number of $$), append a closing $$ at the end
  let blockCount = (text.match(/\$\$/g) || []).length;
  if (blockCount % 2 !== 0) {
    text += '$$';
  } else {
    const tempText = text.replace(/\$\$/g, '');
    const inlineCount = (tempText.match(/\$/g) || []).length;
    if (inlineCount % 2 !== 0) {
      text += '$';
    }
  }

  const placeholders = [];
  let placeholderCount = 0;

  function addPlaceholder(content, isMath = true, displayMode = false) {
    let finalContent = content;
    if (isMath) {
      finalContent = balanceMathString(content);
    }
    const id = `___CHAT_PLACEHOLDER_${placeholderCount}___`;
    placeholders.push({ id, content: finalContent, isMath, displayMode });
    placeholderCount++;
    return id;
  }

  let processed = text;

  // 1. Extract code blocks: ```lang ... ```
  processed = processed.replace(/```(\w*)\n([\s\S]+?)```/g, (match, lang, code) => {
    const escaped = escapeHTML(code.trim());
    return addPlaceholder(`<pre><code class="${lang}">${escaped}</code></pre>`, false, false);
  });

  // 2. Extract inline code: `code`
  processed = processed.replace(/`([^`\n]+?)`/g, (match, code) => {
    const escaped = escapeHTML(code);
    return addPlaceholder(`<code>${escaped}</code>`, false, false);
  });

  // 3. Extract block math $$ ... $$
  processed = processed.replace(/\$\$([\s\S]+?)\$\$/g, (match, math) => {
    return addPlaceholder(math.trim(), true, true);
  });

  // 4. Extract inline math $...$
  processed = processed.replace(/\$([^\$\s\n][^\$\n]*?[^\$\s\n])\$/g, (match, math) => {
    return addPlaceholder(math.trim(), true, false);
  });
  processed = processed.replace(/\$([^\$\s\n])\$/g, (match, math) => {
    return addPlaceholder(math.trim(), true, false);
  });

  // 5. Parse markdown tables line-by-line
  const lines = processed.split('\n');
  let inTable = false;
  let tableRows = [];
  let outputLines = [];

  for (let line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      if (!inTable) {
        inTable = true;
        tableRows = [];
      }
      tableRows.push(trimmed);
    } else {
      if (inTable) {
        const tableHtml = renderTable(tableRows);
        outputLines.push(addPlaceholder(tableHtml, false, false));
        inTable = false;
      }
      outputLines.push(line);
    }
  }
  if (inTable) {
    const tableHtml = renderTable(tableRows);
    outputLines.push(addPlaceholder(tableHtml, false, false));
  }
  processed = outputLines.join('\n');

  // 6. Apply standard markdown formatting

  // Headings
  processed = processed.replace(/^### (.*$)/gim, '<h3 class="chat-h3">$1</h3>');
  processed = processed.replace(/^## (.*$)/gim, '<h2 class="chat-h2">$1</h2>');
  processed = processed.replace(/^# (.*$)/gim, '<h1 class="chat-h1">$1</h1>');

  // Bold
  processed = processed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // Italic
  processed = processed.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // Horizontal rules
  processed = processed.replace(/^---$/gm, '<hr class="chat-hr">');

  // Lists
  processed = processed.replace(/^\s*[•\-\*]\s+(.*)/gm, '<li>$1</li>');
  processed = processed.replace(/((?:<li>.*?<\/li>\s*)+)/g, '<ul class="chat-list">$1</ul>');

  processed = processed.replace(/\n\n/g, '<br><br>');
  processed = processed.replace(/\n/g, '<br>');

  return {
    html: processed,
    placeholders: placeholders
  };
}

// ===== BEFORE/AFTER COMPARISON SLIDER =====
(function () {
  const slider = document.getElementById('comparisonSlider');
  if (!slider) return;

  const beforeCanvas = document.getElementById('compBefore');
  const afterCanvas = document.getElementById('compAfter');
  const overlay = document.getElementById('compOverlay');
  const handle = document.getElementById('compHandle');
  const SIZE = 600;

  beforeCanvas.width = afterCanvas.width = SIZE;
  beforeCanvas.height = afterCanvas.height = SIZE;

  let currentDefect = 0;

  // Generate a realistic wafer pattern on canvas
  function drawWafer(ctx, defectIdx) {
    const cx = SIZE / 2, cy = SIZE / 2, radius = SIZE * 0.44;

    // Background
    ctx.fillStyle = '#0a0e1a';
    ctx.fillRect(0, 0, SIZE, SIZE);

    // Wafer circle base
    const waferGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    waferGrad.addColorStop(0, '#1e293b');
    waferGrad.addColorStop(0.7, '#1a2236');
    waferGrad.addColorStop(1, '#111827');
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = waferGrad;
    ctx.fill();

    // Die grid pattern
    const gridSize = 18;
    ctx.strokeStyle = 'rgba(59,130,246,0.08)';
    ctx.lineWidth = 0.5;
    for (let x = cx - radius; x < cx + radius; x += gridSize) {
      for (let y = cy - radius; y < cy + radius; y += gridSize) {
        const dx = x - cx, dy = y - cy;
        if (Math.sqrt(dx * dx + dy * dy) < radius - 5) {
          ctx.strokeRect(x, y, gridSize, gridSize);
          // Random die coloring
          const brightness = 25 + Math.random() * 15;
          ctx.fillStyle = `rgba(${brightness + 10},${brightness + 20},${brightness + 40},0.5)`;
          ctx.fillRect(x + 1, y + 1, gridSize - 2, gridSize - 2);
        }
      }
    }

    // Draw defect pattern on the wafer
    drawDefectPattern(ctx, defectIdx, cx, cy, radius);

    // Wafer edge ring
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(99,102,241,0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Notch
    ctx.beginPath();
    ctx.arc(cx, cy + radius, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#0a0e1a';
    ctx.fill();
  }

  function drawDefectPattern(ctx, defectIdx, cx, cy, radius) {
    const gridSize = 18;
    for (let x = cx - radius; x < cx + radius; x += gridSize) {
      for (let y = cy - radius; y < cy + radius; y += gridSize) {
        const dx = x + gridSize / 2 - cx;
        const dy = y + gridSize / 2 - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > radius - 5) continue;

        let isDefect = false;
        const angle = Math.atan2(dy, dx);

        switch (defectIdx) {
          case 0: isDefect = dist < radius * 0.25; break; // Center
          case 1: isDefect = dist > radius * 0.35 && dist < radius * 0.55; break; // Donut
          case 2: isDefect = dist > radius * 0.7 && Math.abs(angle) < 0.7; break; // Edge-Loc
          case 3: isDefect = dist > radius * 0.75; break; // Edge-Ring
          case 7: isDefect = Math.abs(dy - dx * 0.6 + 20) < gridSize * 1.5; break; // Scratch
        }

        if (isDefect && Math.random() > 0.15) {
          ctx.fillStyle = `rgba(239,68,68,${0.3 + Math.random() * 0.4})`;
          ctx.fillRect(x + 1, y + 1, gridSize - 2, gridSize - 2);
        }
      }
    }
  }

  // Generate Grad-CAM heatmap overlay
  function drawHeatmap(ctx, defectIdx) {
    // Draw the same wafer first
    drawWafer(ctx, defectIdx);

    const cx = SIZE / 2, cy = SIZE / 2, radius = SIZE * 0.44;
    const imageData = ctx.getImageData(0, 0, SIZE, SIZE);
    const data = imageData.data;

    for (let y = 0; y < SIZE; y++) {
      for (let x = 0; x < SIZE; x++) {
        const dx = x - cx, dy = y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > radius) continue;

        const idx = (y * SIZE + x) * 4;
        let intensity = 0;
        const angle = Math.atan2(dy, dx);
        const normDist = dist / radius;

        switch (defectIdx) {
          case 0: // Center
            intensity = normDist < 0.3 ? (1 - normDist / 0.3) * 0.9 : 0;
            break;
          case 1: // Donut
            const ring = Math.abs(normDist - 0.45);
            intensity = ring < 0.12 ? (1 - ring / 0.12) * 0.85 : 0;
            break;
          case 2: // Edge-Loc
            intensity = (normDist > 0.65 && Math.abs(angle) < 0.8) ? (normDist - 0.65) / 0.35 * 0.8 : 0;
            break;
          case 3: // Edge-Ring
            intensity = normDist > 0.7 ? (normDist - 0.7) / 0.3 * 0.85 : 0;
            break;
          case 7: // Scratch
            const scratchDist = Math.abs(dy - dx * 0.6 + 20);
            intensity = scratchDist < 20 ? (1 - scratchDist / 20) * 0.9 : 0;
            break;
        }

        intensity = Math.max(0, Math.min(1, intensity));

        if (intensity > 0.05) {
          // Hot colors: red → yellow → white
          const r = Math.min(255, 180 + intensity * 75);
          const g = Math.min(255, intensity * 200);
          const b = Math.max(0, intensity < 0.5 ? 0 : (intensity - 0.5) * 100);
          data[idx] = Math.min(255, data[idx] * 0.3 + r * 0.7);
          data[idx + 1] = Math.min(255, data[idx + 1] * 0.3 + g * 0.7);
          data[idx + 2] = Math.min(255, data[idx + 2] * 0.3 + b * 0.7);
        } else {
          // Cool area: blue tint
          data[idx] = Math.max(0, data[idx] * 0.5);
          data[idx + 1] = Math.max(0, data[idx + 1] * 0.5);
          data[idx + 2] = Math.min(255, data[idx + 2] * 0.7 + 60);
        }
      }
    }
    ctx.putImageData(imageData, 0, 0);
  }

  function renderComparison(defectIdx) {
    const ctxBefore = beforeCanvas.getContext('2d');
    const ctxAfter = afterCanvas.getContext('2d');
    drawWafer(ctxBefore, defectIdx);
    drawHeatmap(ctxAfter, defectIdx);
  }

  // Initial render
  renderComparison(currentDefect);

  // Slider drag logic
  let isDragging = false;

  function updateSliderPosition(clientX) {
    const rect = slider.getBoundingClientRect();
    let x = clientX - rect.left;
    x = Math.max(0, Math.min(rect.width, x));
    const pct = (x / rect.width) * 100;

    overlay.style.left = pct + '%';
    overlay.style.width = (100 - pct) + '%';
    handle.style.left = pct + '%';

    // Position the after canvas so it aligns properly
    const canvasWidth = beforeCanvas.offsetWidth;
    afterCanvas.style.width = canvasWidth + 'px';
    afterCanvas.style.left = 'auto';
    afterCanvas.style.right = '0';
    afterCanvas.style.marginLeft = '0';
    // Shift the after canvas content to align with the before
    const shiftPx = (pct / 100) * canvasWidth;
    afterCanvas.style.transform = `translateX(-${shiftPx}px)`;
    afterCanvas.style.width = canvasWidth + 'px';
  }

  slider.addEventListener('mousedown', (e) => { isDragging = true; updateSliderPosition(e.clientX); });
  window.addEventListener('mousemove', (e) => { if (isDragging) { e.preventDefault(); updateSliderPosition(e.clientX); } });
  window.addEventListener('mouseup', () => { isDragging = false; });

  slider.addEventListener('touchstart', (e) => { isDragging = true; updateSliderPosition(e.touches[0].clientX); }, { passive: true });
  window.addEventListener('touchmove', (e) => { if (isDragging) updateSliderPosition(e.touches[0].clientX); }, { passive: true });
  window.addEventListener('touchend', () => { isDragging = false; });

  // Initialize at 50%
  requestAnimationFrame(() => {
    const rect = slider.getBoundingClientRect();
    updateSliderPosition(rect.left + rect.width / 2);
  });

  // Defect picker buttons
  document.querySelectorAll('.comp-defect-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.comp-defect-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentDefect = parseInt(btn.dataset.defect);
      renderComparison(currentDefect);
      // Re-center slider
      const rect = slider.getBoundingClientRect();
      updateSliderPosition(rect.left + rect.width / 2);
    });
  });

  // Handle resize
  window.addEventListener('resize', () => {
    const rect = slider.getBoundingClientRect();
    updateSliderPosition(rect.left + rect.width / 2);
  });
})();

// ===== HERO COUNTER ANIMATION =====
function easeOutExpo(t) {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

function animateHeroCounters() {
  const counters = document.querySelectorAll('.hero-counter');
  if (!counters.length) return;

  // Stagger animate-in for each hero-stat
  const heroStats = document.querySelectorAll('.hero-stat');
  heroStats.forEach(stat => stat.classList.add('animate-in'));

  counters.forEach((counter, index) => {
    const target = parseFloat(counter.dataset.target);
    const decimals = parseInt(counter.dataset.decimals) || 0;
    const suffix = counter.dataset.suffix || '';
    const prefix = counter.dataset.prefix || '';
    const duration = 2000 + index * 200; // Stagger duration slightly
    const startTime = performance.now();

    counter.classList.add('counting');

    function updateCounter(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutExpo(progress);
      const currentVal = easedProgress * target;

      if (decimals > 0) {
        counter.textContent = prefix + currentVal.toFixed(decimals) + suffix;
      } else {
        counter.textContent = prefix + Math.floor(currentVal).toLocaleString() + suffix;
      }

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        // Final value
        if (decimals > 0) {
          counter.textContent = prefix + target.toFixed(decimals) + suffix;
        } else {
          counter.textContent = prefix + target.toLocaleString() + suffix;
        }
        counter.classList.remove('counting');
        counter.classList.add('done');
        // Remove done class after animation completes
        setTimeout(() => counter.classList.remove('done'), 600);
      }
    }

    // Slight delay per counter for stagger effect
    setTimeout(() => {
      requestAnimationFrame(updateCounter);
    }, index * 150);
  });
}

// Trigger hero counters when hero section is visible
const heroSection = document.getElementById('hero');
let heroCountersTriggered = false;

if (heroSection) {
  const heroObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !heroCountersTriggered) {
        heroCountersTriggered = true;
        animateHeroCounters();
        heroObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  heroObserver.observe(heroSection);
}

// ===== PERF SECTION COUNTER ANIMATION =====
function animatePerfCounters() {
  document.querySelectorAll('#performance .num').forEach(el => {
    const text = el.textContent;
    if (text.includes('%') || text.includes('K') || text.includes('ms') || text.includes('<') || text.includes('×')) return;
    const target = parseInt(text.replace(/[^0-9]/g, ''));
    if (isNaN(target) || target === 0) return;
    let current = 0;
    const increment = target / 60;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        el.textContent = text;
        clearInterval(timer);
      } else {
        el.textContent = Math.floor(current);
      }
    }, 16);
  });
}

// Run perf counter animation when performance section is visible
const perfObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animatePerfCounters();
      perfObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

const perfSection = document.getElementById('performance');
if (perfSection) perfObserver.observe(perfSection);

// ===== SMOOTH ACTIVE NAV LINKS =====
const sections = document.querySelectorAll('section[id]');
window.addEventListener('scroll', () => {
  const scrollY = window.scrollY + 120;
  sections.forEach(sec => {
    const top = sec.offsetTop;
    const height = sec.offsetHeight;
    const id = sec.getAttribute('id');
    const link = document.querySelector(`.nav-links a[href="#${id}"]`);
    if (link) {
      if (scrollY >= top && scrollY < top + height) {
        document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
        link.classList.add('active');
      }
    }
  });
});

// ===== CONFUSION MATRIX & METRICS VISUALIZATION (Feature 4) =====
(function () {
  const cmCanvas = document.getElementById('confusionMatrix');
  if (!cmCanvas) return;

  const cmCtx = cmCanvas.getContext('2d');
  const classNames = ['Center', 'Donut', 'Edge-Loc', 'Edge-Ring', 'Loc', 'Near-Full', 'Random', 'Scratch', 'None'];
  const classEmoji = ['🎯', '🍩', '📍', '💍', '📌', '🌕', '🎲', '✏️', '✅'];
  const N = classNames.length;

  // Realistic confusion matrix data (counts) — simulated from 98.07% accuracy model
  const cmData = [
    [487, 2, 1, 0, 3, 1, 2, 1, 3],
    [1, 312, 0, 2, 0, 1, 1, 0, 2],
    [2, 0, 945, 5, 3, 0, 2, 4, 1],
    [0, 1, 4, 876, 0, 2, 1, 0, 3],
    [3, 0, 2, 0, 654, 1, 4, 2, 2],
    [1, 1, 0, 2, 1, 423, 2, 0, 3],
    [2, 1, 3, 1, 5, 2, 789, 3, 4],
    [1, 0, 3, 0, 2, 0, 2, 567, 1],
    [2, 1, 1, 2, 1, 2, 3, 1, 4231],
  ];

  // Compute per-class metrics
  const perClassMetrics = classNames.map((name, i) => {
    const tp = cmData[i][i];
    const rowSum = cmData[i].reduce((a, b) => a + b, 0);
    let colSum = 0;
    for (let r = 0; r < N; r++) colSum += cmData[r][i];
    const precision = colSum > 0 ? tp / colSum : 0;
    const recall = rowSum > 0 ? tp / rowSum : 0;
    const f1 = (precision + recall) > 0 ? 2 * precision * recall / (precision + recall) : 0;
    return { name, emoji: classEmoji[i], precision, recall, f1, support: rowSum };
  });

  // Normalize confusion matrix to percentages (per row)
  const cmNorm = cmData.map(row => {
    const sum = row.reduce((a, b) => a + b, 0);
    return row.map(v => sum > 0 ? v / sum : 0);
  });

  // Populate axis labels
  const xLabelsEl = document.getElementById('cmXLabels');
  const yLabelsEl = document.getElementById('cmYLabels');
  if (xLabelsEl && yLabelsEl) {
    classNames.forEach(name => {
      const spanX = document.createElement('span');
      spanX.textContent = name.length > 6 ? name.substring(0, 5) + '.' : name;
      spanX.title = name;
      xLabelsEl.appendChild(spanX);

      const spanY = document.createElement('span');
      spanY.textContent = name.length > 6 ? name.substring(0, 5) + '.' : name;
      spanY.title = name;
      yLabelsEl.appendChild(spanY);
    });
  }

  // Color interpolation for heatmap
  function cmColor(value) {
    // value: 0..1 → dark blue → blue → yellow → red
    if (value < 0.01) return 'rgba(30,41,59,0.6)';
    const r = Math.min(255, Math.floor(value < 0.5 ? value * 2 * 120 : 120 + (value - 0.5) * 2 * 135));
    const g = Math.min(255, Math.floor(value < 0.5 ? value * 2 * 100 : 100 - (value - 0.5) * 2 * 100));
    const b = Math.min(255, Math.floor(value < 0.5 ? 200 - value * 2 * 170 : 30 - (value - 0.5) * 2 * 30));
    return `rgb(${r},${g},${b})`;
  }

  // Draw confusion matrix with animation
  let cmAnimProgress = 0;
  let cmAnimFrame = null;

  function drawConfusionMatrix(progress) {
    const W = cmCanvas.width;
    const H = cmCanvas.height;
    const cellW = W / N;
    const cellH = H / N;

    cmCtx.clearRect(0, 0, W, H);

    // Draw cells
    const totalCells = N * N;
    const cellsToDraw = Math.floor(progress * totalCells);

    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        const cellIndex = i * N + j;
        if (cellIndex > cellsToDraw) continue;

        const x = j * cellW;
        const y = i * cellH;
        const value = cmNorm[i][j];

        // Cell fill
        const cellProgress = cellIndex === cellsToDraw ? (progress * totalCells - cellsToDraw) : 1;
        cmCtx.globalAlpha = cellProgress;

        // Diagonal highlight
        if (i === j) {
          cmCtx.fillStyle = cmColor(value);
        } else {
          cmCtx.fillStyle = cmColor(value);
        }
        cmCtx.fillRect(x + 1, y + 1, cellW - 2, cellH - 2);

        // Cell border
        cmCtx.strokeStyle = 'rgba(42,58,92,0.4)';
        cmCtx.lineWidth = 0.5;
        cmCtx.strokeRect(x + 1, y + 1, cellW - 2, cellH - 2);

        // Diagonal emphasis border
        if (i === j && value > 0.5) {
          cmCtx.strokeStyle = 'rgba(59,130,246,0.5)';
          cmCtx.lineWidth = 1.5;
          cmCtx.strokeRect(x + 1.5, y + 1.5, cellW - 3, cellH - 3);
        }

        // Cell text
        if (cellProgress > 0.5) {
          const pct = (value * 100).toFixed(1);
          cmCtx.fillStyle = value > 0.5 ? '#ffffff' : (value > 0.1 ? '#e2e8f0' : '#64748b');
          cmCtx.font = value > 0.5 ? 'bold 11px Inter, sans-serif' : '10px Inter, sans-serif';
          cmCtx.textAlign = 'center';
          cmCtx.textBaseline = 'middle';
          cmCtx.fillText(value > 0.01 ? pct + '%' : '0', x + cellW / 2, y + cellH / 2);
        }

        cmCtx.globalAlpha = 1;
      }
    }
  }

  function animateConfusionMatrix() {
    cmAnimProgress = 0;
    const duration = 1800;
    const startTime = performance.now();

    function step(now) {
      const elapsed = now - startTime;
      cmAnimProgress = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - cmAnimProgress, 3); // easeOutCubic
      drawConfusionMatrix(eased);
      if (cmAnimProgress < 1) {
        cmAnimFrame = requestAnimationFrame(step);
      }
    }
    if (cmAnimFrame) cancelAnimationFrame(cmAnimFrame);
    cmAnimFrame = requestAnimationFrame(step);
  }

  // Tooltip for confusion matrix
  const tooltip = document.createElement('div');
  tooltip.className = 'cm-tooltip';
  tooltip.innerHTML = '<div class="cm-tt-title"></div><div class="cm-tt-value"></div>';
  document.body.appendChild(tooltip);

  cmCanvas.addEventListener('mousemove', (e) => {
    const rect = cmCanvas.getBoundingClientRect();
    const scaleX = cmCanvas.width / rect.width;
    const scaleY = cmCanvas.height / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;

    const cellW = cmCanvas.width / N;
    const cellH = cmCanvas.height / N;
    const col = Math.floor(mx / cellW);
    const row = Math.floor(my / cellH);

    if (row >= 0 && row < N && col >= 0 && col < N) {
      const actual = classNames[row];
      const predicted = classNames[col];
      const count = cmData[row][col];
      const pct = (cmNorm[row][col] * 100).toFixed(2);

      tooltip.querySelector('.cm-tt-title').textContent = `True: ${actual} → Pred: ${predicted}`;
      tooltip.querySelector('.cm-tt-value').textContent = `Count: ${count} (${pct}%)`;
      tooltip.classList.add('show');
      tooltip.style.left = (e.clientX + 14) + 'px';
      tooltip.style.top = (e.clientY - 10) + 'px';
    } else {
      tooltip.classList.remove('show');
    }
  });

  cmCanvas.addEventListener('mouseleave', () => {
    tooltip.classList.remove('show');
  });

  // Build per-class metrics cards
  const metricsGrid = document.getElementById('classMetricsGrid');
  if (metricsGrid) {
    perClassMetrics.forEach((cls, idx) => {
      const card = document.createElement('div');
      card.className = 'class-metric-card';
      card.innerHTML = `
        <div class="cmc-header">
          <span class="cmc-emoji">${cls.emoji}</span>
          <span class="cmc-name">${cls.name}</span>
          <span class="cmc-support">n=${cls.support}</span>
        </div>
        <div class="cmc-bar-group">
          <div class="cmc-bar-row">
            <span class="cmc-bar-label">P</span>
            <div class="cmc-bar-track"><div class="cmc-bar-fill precision" data-value="${(cls.precision * 100).toFixed(1)}" style="transition-delay:${idx * 0.08}s"></div></div>
            <span class="cmc-bar-val">${(cls.precision * 100).toFixed(1)}%</span>
          </div>
          <div class="cmc-bar-row">
            <span class="cmc-bar-label">R</span>
            <div class="cmc-bar-track"><div class="cmc-bar-fill recall" data-value="${(cls.recall * 100).toFixed(1)}" style="transition-delay:${idx * 0.08 + 0.05}s"></div></div>
            <span class="cmc-bar-val">${(cls.recall * 100).toFixed(1)}%</span>
          </div>
          <div class="cmc-bar-row">
            <span class="cmc-bar-label">F1</span>
            <div class="cmc-bar-track"><div class="cmc-bar-fill f1" data-value="${(cls.f1 * 100).toFixed(1)}" style="transition-delay:${idx * 0.08 + 0.1}s"></div></div>
            <span class="cmc-bar-val">${(cls.f1 * 100).toFixed(1)}%</span>
          </div>
        </div>
      `;
      metricsGrid.appendChild(card);
    });
  }

  // Animate bars when visible
  function animateMetricBars() {
    document.querySelectorAll('.cmc-bar-fill').forEach(bar => {
      bar.style.width = bar.dataset.value + '%';
    });
  }

  // Toggle views
  const btnMatrix = document.getElementById('btnMatrix');
  const btnCharts = document.getElementById('btnCharts');
  const viewMatrix = document.getElementById('viewMatrix');
  const viewCharts = document.getElementById('viewCharts');

  if (btnMatrix && btnCharts) {
    btnMatrix.addEventListener('click', () => {
      btnMatrix.classList.add('active');
      btnCharts.classList.remove('active');
      viewMatrix.classList.add('active');
      viewCharts.classList.remove('active');
      // Re-animate matrix
      animateConfusionMatrix();
    });

    btnCharts.addEventListener('click', () => {
      btnCharts.classList.add('active');
      btnMatrix.classList.remove('active');
      viewCharts.classList.add('active');
      viewMatrix.classList.remove('active');
      // Animate bars
      setTimeout(animateMetricBars, 100);
    });
  }

  // Intersection observer to trigger animation
  const metricsViz = document.getElementById('metricsViz');
  let metricsAnimated = false;

  if (metricsViz) {
    const metricsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !metricsAnimated) {
          metricsAnimated = true;
          animateConfusionMatrix();
          metricsObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    metricsObserver.observe(metricsViz);
  }
})();

// ===== INTERACTIVE DEFECT GALLERY (Feature 8) =====
(function () {
  const gallery = document.getElementById('defectGallery');
  const panel = document.getElementById('defectDetailPanel');
  if (!gallery || !panel) return;

  const defects = [
    { name: 'Center', emoji: '🎯', short: 'Central cluster defect', desc: 'Defects concentrated at the center of the wafer, typically caused by equipment contamination, spin coating issues, or chemical vapor deposition (CVD) process irregularities. The center region shows a high density of failed dies.', chars: ['Central cluster', 'Circular pattern', 'Equipment-related', 'CVD issues'], acc: '97.4%', prec: '96.8%', recall: '97.2%', count: '~500' },
    { name: 'Donut', emoji: '🍩', short: 'Ring-shaped defect pattern', desc: 'A distinctive ring-shaped defect pattern where defective dies form a donut/annular shape. Often caused by edge bead removal issues, non-uniform etching, or temperature gradients during thermal processing.', chars: ['Annular ring', 'Hollow center', 'Thermal gradient', 'Etch non-uniformity'], acc: '97.8%', prec: '97.2%', recall: '97.5%', count: '~320' },
    { name: 'Edge-Loc', emoji: '📍', short: 'Localized edge defect', desc: 'Defects localized to a specific region along the wafer edge. Caused by mechanical handling damage, edge grip marks, or localized contamination during wafer transport between processing stages.', chars: ['Edge-specific', 'Localized region', 'Handling damage', 'Transport marks'], acc: '98.4%', prec: '98.1%', recall: '98.3%', count: '~960' },
    { name: 'Edge-Ring', emoji: '💍', short: 'Full edge ring defect', desc: 'A continuous ring of defects around the entire wafer periphery. Results from edge exclusion zone issues, spin coating edge buildup, or CMP (Chemical Mechanical Planarization) edge over-polishing.', chars: ['Full periphery', 'Continuous ring', 'CMP issues', 'Edge exclusion'], acc: '98.6%', prec: '98.3%', recall: '98.5%', count: '~890' },
    { name: 'Loc', emoji: '📌', short: 'Localized cluster defect', desc: 'A cluster of defects at an arbitrary location on the wafer, not restricted to center or edge. Often caused by particle contamination, localized equipment malfunction, or photomask defects during lithography.', chars: ['Arbitrary position', 'Cluster pattern', 'Particle contamination', 'Mask defects'], acc: '97.9%', prec: '97.5%', recall: '97.7%', count: '~668' },
    { name: 'Near-Full', emoji: '🌕', short: 'Almost full wafer defect', desc: 'Defects covering the majority of the wafer surface with only small normal regions remaining. Indicates severe process failures such as complete recipe errors, major equipment malfunction, or widespread contamination events.', chars: ['Near-total coverage', 'Severe failure', 'Recipe error', 'Major contamination'], acc: '97.7%', prec: '97.3%', recall: '97.5%', count: '~433' },
    { name: 'Random', emoji: '🎲', short: 'Randomly scattered defects', desc: 'Defects scattered randomly across the wafer with no discernible spatial pattern. Typically caused by airborne particle contamination in the cleanroom, random equipment issues, or process variability.', chars: ['No spatial pattern', 'Random scatter', 'Airborne particles', 'Process variability'], acc: '97.6%', prec: '97.1%', recall: '97.3%', count: '~810' },
    { name: 'Scratch', emoji: '✏️', short: 'Linear scratch marks', desc: 'Linear scratch defects across the wafer surface, creating a line or arc pattern. Caused by mechanical contact during handling, CMP pad scratching, robotic arm misalignment, or wafer cassette abrasion.', chars: ['Linear pattern', 'Mechanical contact', 'CMP scratching', 'Handling marks'], acc: '98.5%', prec: '98.2%', recall: '98.4%', count: '~576' },
    { name: 'None', emoji: '✅', short: 'No defect — normal wafer', desc: 'A clean wafer with no detectable defect patterns. All dies pass inspection with uniform quality across the wafer surface. This is the target outcome of a well-controlled semiconductor fabrication process.', chars: ['Uniform quality', 'All dies pass', 'Clean surface', 'Process stable'], acc: '99.5%', prec: '99.3%', recall: '99.6%', count: '~4244' }
  ];

  const CARD_SIZE = 80; // Canvas size for thumbnails
  let activeIdx = -1;

  function isDark() {
    return document.documentElement.getAttribute('data-theme') !== 'light';
  }

  // Draw a mini wafer with defect pattern on a small canvas
  function drawMiniWafer(canvas, defIdx) {
    const ctx = canvas.getContext('2d');
    const S = canvas.width;
    const cx = S / 2, cy = S / 2, r = S * 0.42;

    // Background
    ctx.fillStyle = isDark() ? '#0a0e1a' : '#f0f4f8';
    ctx.fillRect(0, 0, S, S);

    // Wafer base
    const wg = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    wg.addColorStop(0, isDark() ? '#1e293b' : '#e2e8f0');
    wg.addColorStop(1, isDark() ? '#111827' : '#cbd5e1');
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = wg;
    ctx.fill();

    // Die grid + defect pattern
    const gs = Math.max(4, r / 7);
    for (let x = cx - r; x < cx + r; x += gs) {
      for (let y = cy - r; y < cy + r; y += gs) {
        const dx = x + gs / 2 - cx, dy = y + gs / 2 - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist >= r - 2) continue;
        const normD = dist / r;
        const angle = Math.atan2(dy, dx);

        let isDefect = false;
        switch (defIdx) {
          case 0: isDefect = normD < 0.28; break;
          case 1: isDefect = normD > 0.35 && normD < 0.58; break;
          case 2: isDefect = normD > 0.68 && Math.abs(angle) < 0.75; break;
          case 3: isDefect = normD > 0.72; break;
          case 4: isDefect = Math.sqrt((dx - r * 0.25) ** 2 + (dy + r * 0.15) ** 2) < r * 0.22; break;
          case 5: isDefect = normD < 0.82; break;
          case 6: isDefect = Math.random() > 0.8; break;
          case 7: isDefect = Math.abs(dy - dx * 0.55) < gs * 2; break;
          case 8: isDefect = false; break;
        }

        if (isDefect && Math.random() > 0.12) {
          ctx.fillStyle = defIdx === 8 ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.45)';
        } else {
          ctx.fillStyle = isDark() ? 'rgba(30,41,59,0.5)' : 'rgba(180,200,220,0.5)';
        }
        ctx.fillRect(x + 0.5, y + 0.5, gs - 1, gs - 1);
      }
    }

    // Wafer ring
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = isDark() ? 'rgba(99,102,241,0.3)' : 'rgba(99,102,241,0.4)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  // Draw large wafer for detail panel
  function drawDetailWafer(defIdx) {
    const canvas = document.getElementById('ddpCanvas');
    if (!canvas) return;
    canvas.width = 240;
    canvas.height = 240;
    drawMiniWafer(canvas, defIdx);
  }

  // Build cards
  defects.forEach((def, idx) => {
    const card = document.createElement('div');
    card.className = 'defect-gcard';
    card.innerHTML = `
      <div class="dgc-canvas-wrap"><canvas width="${CARD_SIZE}" height="${CARD_SIZE}"></canvas></div>
      <div class="dgc-info">
        <div class="dgc-name"><span class="dgc-emoji">${def.emoji}</span> ${def.name}</div>
        <div class="dgc-sub">${def.short}</div>
      </div>
      <span class="dgc-arrow">›</span>
    `;
    gallery.appendChild(card);

    // Draw wafer thumbnail
    const thumbCanvas = card.querySelector('canvas');
    drawMiniWafer(thumbCanvas, idx);

    // Click handler
    card.addEventListener('click', () => {
      // Toggle active card
      document.querySelectorAll('.defect-gcard').forEach(c => c.classList.remove('active'));

      if (activeIdx === idx) {
        // Close panel
        panel.classList.remove('open');
        activeIdx = -1;
        return;
      }

      card.classList.add('active');
      activeIdx = idx;

      // Populate detail panel
      document.getElementById('ddpBadge').textContent = `${def.emoji} Defect Class ${idx + 1} of 9`;
      document.getElementById('ddpTitle').textContent = `${def.name} Defect`;
      document.getElementById('ddpDesc').textContent = def.desc;

      const charsEl = document.getElementById('ddpChars');
      charsEl.innerHTML = def.chars.map(c => `<span class="ddp-char-tag">${c}</span>`).join('');

      const statsEl = document.getElementById('ddpStats');
      statsEl.innerHTML = `
        <div class="ddp-stat"><div class="ddp-stat-val">${def.acc}</div><div class="ddp-stat-lbl">Accuracy</div></div>
        <div class="ddp-stat"><div class="ddp-stat-val">${def.prec}</div><div class="ddp-stat-lbl">Precision</div></div>
        <div class="ddp-stat"><div class="ddp-stat-val">${def.recall}</div><div class="ddp-stat-lbl">Recall</div></div>
        <div class="ddp-stat"><div class="ddp-stat-val">${def.count}</div><div class="ddp-stat-lbl">Samples</div></div>
      `;

      // Draw detail wafer
      drawDetailWafer(idx);

      // Open panel
      panel.classList.add('open');

      // Scroll panel into view
      setTimeout(() => {
        panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    });
  });

  // Close button
  document.getElementById('ddpClose').addEventListener('click', () => {
    panel.classList.remove('open');
    document.querySelectorAll('.defect-gcard').forEach(c => c.classList.remove('active'));
    activeIdx = -1;
  });

  // Redraw all thumbnails on theme change (the existing theme toggle fires)
  const origSetTheme = window.setTheme;
  if (typeof origSetTheme === 'function') {
    // We can't easily hook setTheme since it's already defined, so use a MutationObserver
  }
  const themeObs = new MutationObserver(() => {
    document.querySelectorAll('.defect-gcard canvas').forEach((c, i) => {
      drawMiniWafer(c, i);
    });
    if (activeIdx >= 0) drawDetailWafer(activeIdx);
  });
  themeObs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
})();

// ===== APP DEMO ANIMATED PREVIEW (Feature 6) =====
(function () {
  const canvas = document.getElementById('appDemoCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const steps = document.querySelectorAll('#admSteps .adm-step');
  const headerEl = document.getElementById('admHeader');
  const sideItems = [
    document.getElementById('adsSideSingle'),
    document.getElementById('adsSideBatch'),
    document.getElementById('adsSideCamera'),
    document.getElementById('adsSideHistory'),
    document.getElementById('adsSideAlerts')
  ];

  const W = canvas.width, H = canvas.height;
  const defectNames = ['Center', 'Donut', 'Edge-Loc', 'Edge-Ring', 'Loc', 'Near-Full', 'Random', 'Scratch', 'None'];
  const defectEmojis = ['🎯', '🍩', '📍', '💍', '📌', '🌕', '🎲', '✏️', '✅'];

  let currentStep = -1;
  let animFrame = null;
  let loopTimeout = null;
  let demoStarted = false;
  let chosenDefect = 0;

  // History & Alerts databases
  let historyData = [
    { time: '16:20:12', id: 'WFR-2026-9042', class: 'None', conf: '99.4%', status: 'PASS' },
    { time: '16:18:45', id: 'WFR-2026-8911', class: 'Scratch', conf: '96.2%', status: 'REJECT' },
    { time: '16:15:32', id: 'WFR-2026-8809', class: 'None', conf: '99.8%', status: 'PASS' },
    { time: '16:12:10', id: 'WFR-2026-8794', class: 'Edge-Ring', conf: '94.8%', status: 'REJECT' },
    { time: '16:09:55', id: 'WFR-2026-8742', class: 'None', conf: '99.1%', status: 'PASS' },
    { time: '16:05:18', id: 'WFR-2026-8604', class: 'Loc', conf: '97.4%', status: 'REJECT' },
    { time: '16:02:40', id: 'WFR-2026-8511', class: 'None', conf: '99.7%', status: 'PASS' }
  ];
  let alertsData = [
    { time: '16:18:45', msg: '⚠️ Scratch Defect Alert on WFR-2026-8911', channel: '📧 Email + HUD', status: 'SENT' },
    { time: '16:12:10', msg: '⚠️ Edge-Ring Alert on WFR-2026-8794', channel: '📧 Email + HUD', status: 'SENT' },
    { time: '16:05:18', msg: '⚠️ Loc Defect Alert on WFR-2026-8604', channel: '📧 Email + HUD', status: 'SENT' }
  ];

  function isDark() {
    return document.documentElement.getAttribute('data-theme') !== 'light';
  }

  function colors() {
    const d = isDark();
    return {
      bg: d ? '#06080f' : '#f8fafc',
      bg2: d ? '#0c1120' : '#f1f5f9',
      surface: d ? '#1a2236' : '#ffffff',
      border: d ? '#2a3a5c' : '#cbd5e1',
      text: d ? '#e2e8f0' : '#0f172a',
      text2: d ? '#94a3b8' : '#475569',
      text3: d ? '#64748b' : '#94a3b8',
      accent: '#3b82f6',
      accent2: '#6366f1',
      success: '#10b981',
      warning: '#f59e0b',
      danger: '#ef4444'
    };
  }

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  function drawWaferSmall(cx, cy, radius, defIdx) {
    const c = colors();
    // Wafer circle
    const wg = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    wg.addColorStop(0, c.surface);
    wg.addColorStop(1, c.bg2);
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = wg;
    ctx.fill();
    ctx.strokeStyle = c.border;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Die grid
    const gs = Math.max(8, radius / 10);
    for (let x = cx - radius; x < cx + radius; x += gs) {
      for (let y = cy - radius; y < cy + radius; y += gs) {
        const dx = x + gs / 2 - cx, dy = y + gs / 2 - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist >= radius - 3) continue;

        let isDefect = false;
        const angle = Math.atan2(dy, dx);
        const normD = dist / radius;
        switch (defIdx) {
          case 0: isDefect = normD < 0.25; break;
          case 1: isDefect = normD > 0.35 && normD < 0.55; break;
          case 2: isDefect = normD > 0.7 && Math.abs(angle) < 0.7; break;
          case 3: isDefect = normD > 0.75; break;
          case 4: isDefect = Math.sqrt((dx - radius * 0.3) ** 2 + (dy + radius * 0.2) ** 2) < radius * 0.2; break;
          case 5: isDefect = normD < 0.8; break;
          case 6: isDefect = Math.random() > 0.82; break;
          case 7: isDefect = Math.abs(dy - dx * 0.6) < gs * 1.8; break;
          default: isDefect = false;
        }

        if (isDefect && Math.random() > 0.15) {
          ctx.fillStyle = 'rgba(239,68,68,0.4)';
        } else {
          ctx.fillStyle = isDark() ? 'rgba(30,41,59,0.5)' : 'rgba(200,210,230,0.5)';
        }
        ctx.fillRect(x + 0.5, y + 0.5, gs - 1, gs - 1);
      }
    }
  }

  function drawHeatmapSmall(cx, cy, radius, defIdx) {
    drawWaferSmall(cx, cy, radius, defIdx);
    // Overlay heatmap colors
    const imgData = ctx.getImageData(cx - radius, cy - radius, radius * 2, radius * 2);
    const d = imgData.data;
    const size = radius * 2;
    for (let py = 0; py < size; py++) {
      for (let px = 0; px < size; px++) {
        const dx = px - radius, dy = py - radius;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > radius) continue;
        const normD = dist / radius;
        const angle = Math.atan2(dy, dx);
        let intensity = 0;
        switch (defIdx) {
          case 0: intensity = normD < 0.3 ? (1 - normD / 0.3) * 0.85 : 0; break;
          case 1: intensity = Math.abs(normD - 0.45) < 0.12 ? (1 - Math.abs(normD - 0.45) / 0.12) * 0.8 : 0; break;
          case 2: intensity = (normD > 0.65 && Math.abs(angle) < 0.8) ? (normD - 0.65) / 0.35 * 0.8 : 0; break;
          case 3: intensity = normD > 0.7 ? (normD - 0.7) / 0.3 * 0.85 : 0; break;
          case 7: const sd = Math.abs(dy - dx * 0.6); intensity = sd < 20 ? (1 - sd / 20) * 0.9 : 0; break;
          default: intensity = 0;
        }
        intensity = Math.max(0, Math.min(1, intensity));
        const i = (py * size + px) * 4;
        if (intensity > 0.05) {
          d[i] = Math.min(255, d[i] * 0.3 + (180 + intensity * 75) * 0.7);
          d[i + 1] = Math.min(255, d[i + 1] * 0.3 + (intensity * 200) * 0.7);
          d[i + 2] = Math.min(255, d[i + 2] * 0.3 + (intensity < 0.5 ? 0 : (intensity - 0.5) * 100) * 0.7);
        } else {
          d[i] = d[i] * 0.5;
          d[i + 1] = d[i + 1] * 0.5;
          d[i + 2] = Math.min(255, d[i + 2] * 0.7 + 50);
        }
      }
    }
    ctx.putImageData(imgData, cx - radius, cy - radius);
  }

  function setStep(stepIdx) {
    currentStep = stepIdx;
    steps.forEach((s, i) => {
      s.classList.remove('active', 'done');
      if (i < stepIdx) s.classList.add('done');
      else if (i === stepIdx) s.classList.add('active');
    });
    const titles = ['Single Image Detection', 'Analyzing Wafer...', 'Classification Results', 'Heatmap Generation', 'Inspection Report'];
    if (headerEl) headerEl.textContent = titles[stepIdx] || 'Single Image Detection';
  }

  // Step 0: Upload animation
  function drawStep0(progress) {
    const c = colors();
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);

    // Dashed upload box
    const bx = W / 2 - 140, by = H / 2 - 100, bw = 280, bh = 200;
    ctx.setLineDash([8, 6]);
    ctx.strokeStyle = progress > 0.5 ? c.accent : c.border;
    ctx.lineWidth = 2;
    roundRect(bx, by, bw, bh, 16);
    ctx.stroke();
    ctx.setLineDash([]);

    // Upload icon
    ctx.font = `${40 + progress * 8}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = c.text;
    ctx.fillText('📤', W / 2, H / 2 - 30);

    ctx.font = 'bold 14px Inter, sans-serif';
    ctx.fillStyle = c.text;
    ctx.fillText('Drop wafer image here', W / 2, H / 2 + 20);
    ctx.font = '11px Inter, sans-serif';
    ctx.fillStyle = c.text3;
    ctx.fillText('or click to browse • PNG, JPG, BMP', W / 2, H / 2 + 42);

    // Simulate file appearing
    if (progress > 0.6) {
      const fp = (progress - 0.6) / 0.4;
      ctx.globalAlpha = fp;
      const fileY = H / 2 + 65;
      roundRect(W / 2 - 80, fileY, 160, 32, 8);
      ctx.fillStyle = c.surface;
      ctx.fill();
      ctx.strokeStyle = c.accent;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.font = '11px Inter, sans-serif';
      ctx.fillStyle = c.accent;
      ctx.textAlign = 'center';
      ctx.fillText('wafer_sample_01.png', W / 2, fileY + 18);
      ctx.globalAlpha = 1;
    }
  }

  // Step 1: Analyzing animation
  function drawStep1(progress) {
    const c = colors();
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);

    // Draw wafer being scanned
    const wcx = W / 2, wcy = H / 2 - 30, wr = 100;
    drawWaferSmall(wcx, wcy, wr, chosenDefect);

    // Scanning line
    const scanY = wcy - wr + progress * wr * 2;
    ctx.strokeStyle = c.accent;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.8;
    ctx.beginPath();
    ctx.moveTo(wcx - wr, scanY);
    ctx.lineTo(wcx + wr, scanY);
    ctx.stroke();
    // Glow
    const sg = ctx.createLinearGradient(wcx - wr, scanY - 15, wcx - wr, scanY + 15);
    sg.addColorStop(0, 'rgba(59,130,246,0)');
    sg.addColorStop(0.5, 'rgba(59,130,246,0.15)');
    sg.addColorStop(1, 'rgba(59,130,246,0)');
    ctx.fillStyle = sg;
    ctx.fillRect(wcx - wr, scanY - 15, wr * 2, 30);
    ctx.globalAlpha = 1;

    // Progress bar below
    const pbx = W / 2 - 120, pby = H / 2 + 100, pbw = 240, pbh = 10;
    roundRect(pbx, pby, pbw, pbh, 5);
    ctx.fillStyle = c.bg2;
    ctx.fill();
    roundRect(pbx, pby, pbw * progress, pbh, 5);
    const pg = ctx.createLinearGradient(pbx, 0, pbx + pbw, 0);
    pg.addColorStop(0, '#3b82f6');
    pg.addColorStop(0.5, '#6366f1');
    pg.addColorStop(1, '#8b5cf6');
    ctx.fillStyle = pg;
    ctx.fill();

    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = c.text2;
    ctx.fillText(`Preprocessing & Model Inference... ${Math.floor(progress * 100)}%`, W / 2, pby + 30);

    ctx.font = '11px Inter, sans-serif';
    ctx.fillStyle = c.text3;
    ctx.fillText('ResNet18 (98.07%) • GPU Accelerated', W / 2, pby + 48);
  }

  // Step 2: Classification results
  function drawStep2(progress) {
    const c = colors();
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);

    // Detected defect header
    ctx.font = 'bold 18px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = c.text;
    ctx.fillText(`${defectEmojis[chosenDefect]} ${defectNames[chosenDefect]} Defect Detected`, W / 2, 45);

    ctx.font = '12px Inter, sans-serif';
    ctx.fillStyle = c.success;
    ctx.fillText('Confidence: 97.83% | Model: ResNet18', W / 2, 68);

    // Probability bars
    const barX = 80, barW = W - 200, barH = 12, startY = 95, gap = 28;
    const probs = [0.3, 0.5, 2.1, 0.8, 0.2, 0.1, 0.4, 0.6, 0.0];
    probs[chosenDefect] = 97.83;
    // Normalize remaining
    const rem = 100 - 97.83;
    const others = probs.filter((_, i) => i !== chosenDefect);
    const othSum = others.reduce((a, b) => a + b, 0);
    probs.forEach((v, i) => { if (i !== chosenDefect) probs[i] = (v / othSum) * rem; });

    const barColors = ['#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#10b981', '#06b6d4', '#ec4899', '#f97316', '#6b7280'];

    for (let i = 0; i < 9; i++) {
      const y = startY + i * gap;
      const animW = Math.min(progress * 1.3, 1) * probs[i];

      ctx.font = '11px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillStyle = c.text2;
      ctx.fillText(defectNames[i], barX - 8, y + barH / 2 + 4);

      // Track
      roundRect(barX, y, barW, barH, 4);
      ctx.fillStyle = c.bg2;
      ctx.fill();

      // Fill
      if (animW > 0.1) {
        const fillW = Math.max(4, (animW / 100) * barW);
        roundRect(barX, y, fillW, barH, 4);
        ctx.fillStyle = barColors[i];
        ctx.fill();
      }

      ctx.textAlign = 'left';
      ctx.fillStyle = barColors[i];
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.fillText(probs[i].toFixed(1) + '%', barX + barW + 8, y + barH / 2 + 4);
    }
  }

  // Step 3: Heatmap generation
  function drawStep3(progress) {
    const c = colors();
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);

    ctx.font = 'bold 14px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = c.text;
    ctx.fillText('Grad-CAM Defect Localization', W / 2, 35);

    const r = Math.min(130, H / 2 - 50);
    // Original
    const ox = W / 2 - r - 30;
    drawWaferSmall(ox, H / 2 + 10, r * Math.min(1, progress * 2), chosenDefect);
    ctx.font = '11px Inter, sans-serif';
    ctx.fillStyle = c.text3;
    ctx.textAlign = 'center';
    ctx.fillText('Original', ox, H / 2 + r + 30);

    // Heatmap (appears after halfway)
    if (progress > 0.4) {
      const hp = (progress - 0.4) / 0.6;
      const hx = W / 2 + r + 30;
      ctx.globalAlpha = hp;
      drawHeatmapSmall(hx, H / 2 + 10, r * Math.min(1, hp * 1.5), chosenDefect);
      ctx.globalAlpha = 1;
      ctx.font = '11px Inter, sans-serif';
      ctx.fillStyle = c.text3;
      ctx.fillText('🔴 Defect  |  🔵 Normal', hx, H / 2 + r + 30);
    }

    // Arrow between
    if (progress > 0.3) {
      ctx.font = '24px serif';
      ctx.fillStyle = c.accent;
      ctx.globalAlpha = Math.min(1, (progress - 0.3) * 3);
      ctx.fillText('→', W / 2, H / 2 + 10);
      ctx.globalAlpha = 1;
    }
  }

  // Step 4: Report summary
  function drawStep4(progress) {
    const c = colors();
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);

    ctx.font = 'bold 16px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = c.text;
    ctx.fillText('📄 Inspection Report Generated', W / 2, 40);

    // Report card
    const rx = W / 2 - 200, ry = 60, rw = 400, rh = 360;
    ctx.globalAlpha = Math.min(1, progress * 2);
    roundRect(rx, ry, rw, rh, 12);
    ctx.fillStyle = c.surface;
    ctx.fill();
    ctx.strokeStyle = c.border;
    ctx.lineWidth = 1;
    ctx.stroke();

    // Report content
    const lines = [
      { label: 'Wafer ID', value: 'WFR-2026-0629-001' },
      { label: 'Defect Type', value: `${defectNames[chosenDefect]} ${defectEmojis[chosenDefect]}` },
      { label: 'Confidence', value: '97.83%' },
      { label: 'Model', value: 'ResNet18 (98.07%)' },
      { label: 'Inference Time', value: '12ms (GPU)' },
      { label: 'Timestamp', value: new Date().toLocaleString() },
      { label: 'Alert Status', value: '✅ Email Sent' },
      { label: 'Report', value: '📥 PDF Ready' }
    ];

    const lx = rx + 24, startY = ry + 30;
    lines.forEach((line, i) => {
      if (progress * 8 < i) return;
      const ly = startY + i * 38;
      ctx.font = '11px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillStyle = c.text3;
      ctx.fillText(line.label, lx, ly);
      ctx.font = 'bold 13px Inter, sans-serif';
      ctx.fillStyle = c.text;
      ctx.fillText(line.value, lx + 130, ly);
      // Divider
      if (i < lines.length - 1) {
        ctx.strokeStyle = c.border;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(lx, ly + 16);
        ctx.lineTo(rx + rw - 24, ly + 16);
        ctx.stroke();
      }
    });

    // Download button
    if (progress > 0.8) {
      const btnP = (progress - 0.8) / 0.2;
      ctx.globalAlpha = btnP;
      const bx = W / 2 - 80, by = ry + rh - 50, bbw = 160, bbh = 36;
      roundRect(bx, by, bbw, bbh, 8);
      const bg = ctx.createLinearGradient(bx, 0, bx + bbw, 0);
      bg.addColorStop(0, '#3b82f6');
      bg.addColorStop(1, '#8b5cf6');
      ctx.fillStyle = bg;
      ctx.fill();
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fff';
      ctx.fillText('📥 Download PDF Report', W / 2, by + 22);
    }

    ctx.globalAlpha = 1;
  }

  const stepDrawers = [drawStep0, drawStep1, drawStep2, drawStep3, drawStep4];
  const stepDurations = [2200, 2500, 2400, 2800, 2600];

  let isDemoPaused = false;
  const playPauseBtn = document.getElementById('appDemoPlayPauseBtn');
  const statusDot = document.getElementById('appDemoStatusDot');
  const statusText = document.getElementById('appDemoStatusText');

  function updatePlayPauseUI() {
    if (!playPauseBtn || !statusDot || !statusText) return;
    if (isDemoPaused) {
      statusText.textContent = 'Paused';
      statusDot.style.background = 'var(--warning)';
      statusDot.style.boxShadow = '0 0 8px var(--warning)';
      statusDot.style.animation = 'none';
      playPauseBtn.title = 'Click to Resume Auto-Play';
    } else {
      statusText.textContent = 'Auto-Playing';
      statusDot.style.background = 'var(--success)';
      statusDot.style.boxShadow = '0 0 8px var(--success)';
      statusDot.style.animation = 'pulse 2s infinite';
      playPauseBtn.title = 'Click to Pause Auto-Play';
    }
  }

  if (playPauseBtn) {
    playPauseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      isDemoPaused = !isDemoPaused;
      updatePlayPauseUI();
      if (isDemoPaused) {
        if (animFrame) cancelAnimationFrame(animFrame);
        if (loopTimeout) clearTimeout(loopTimeout);
        if (currentStep >= 0 && currentStep < 5) {
          stepDrawers[currentStep](1);
        }
      } else {
        if (currentStep >= 0 && currentStep < 5) {
          runStep(currentStep);
        } else {
          startDemoLoop();
        }
      }
    });
  }

  // Click handler for progress steps
  steps.forEach((s, idx) => {
    s.addEventListener('click', (e) => {
      e.stopPropagation();
      isDemoPaused = true;
      updatePlayPauseUI();
      if (animFrame) cancelAnimationFrame(animFrame);
      if (loopTimeout) clearTimeout(loopTimeout);
      setStep(idx);
      stepDrawers[idx](1);
    });
  });

  function runStep(stepIdx) {
    if (isDemoPaused) return;
    if (stepIdx >= 5) {
      // Loop: reset after a short pause
      loopTimeout = setTimeout(() => {
        if (!isDemoPaused) startDemoLoop();
      }, 1500);
      return;
    }

    setStep(stepIdx);
    // Flash sidebar item
    sideItems.forEach(s => { if (s) s.classList.remove('active'); });
    if (sideItems[0]) sideItems[0].classList.add('active');

    const duration = stepDurations[stepIdx];
    const startTime = performance.now();

    function animate(now) {
      if (isDemoPaused) return;
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      // EaseInOut
      const eased = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;

      stepDrawers[stepIdx](eased);

      if (progress < 1) {
        animFrame = requestAnimationFrame(animate);
      } else {
        // Mark step done, move to next
        steps[stepIdx]?.classList.remove('active');
        steps[stepIdx]?.classList.add('done');
        loopTimeout = setTimeout(() => {
          if (!isDemoPaused) runStep(stepIdx + 1);
        }, 400);
      }
    }
    animFrame = requestAnimationFrame(animate);
  }

  function startDemoLoop() {
    chosenDefect = Math.floor(Math.random() * 8); // Pick random defect (not None)
    steps.forEach(s => s.classList.remove('active', 'done'));
    runStep(0);
  }

  function stopDemo() {
    if (animFrame) cancelAnimationFrame(animFrame);
    if (loopTimeout) clearTimeout(loopTimeout);
  }

  // ===== TAB SWITCHING AND INTERACTIVE LAYOUTS =====
  const panels = [
    document.getElementById('panelSingle'),
    document.getElementById('panelBatch'),
    document.getElementById('panelCamera'),
    document.getElementById('panelHistory'),
    document.getElementById('panelAlerts')
  ];
  const stepsContainer = document.getElementById('admSteps');

  let activeTabIdx = 0;

  function switchTab(idx) {
    if (idx === activeTabIdx) return;
    activeTabIdx = idx;

    // Update sidebar UI
    sideItems.forEach((item, i) => {
      if (item) {
        if (i === idx) item.classList.add('active');
        else item.classList.remove('active');
      }
    });

    // Update panels UI
    panels.forEach((panel, i) => {
      if (panel) {
        panel.style.display = i === idx ? 'block' : 'none';
      }
    });

    // Toggle steps container visibility
    if (stepsContainer) {
      stepsContainer.style.display = idx === 0 ? 'flex' : 'none';
    }

    // Set header
    const titles = [
      'Single Image Detection',
      'Batch Processing Lot Scanner',
      'Live Microscope Scan Feed',
      'Inspection History & Yield Analytics',
      'Alert Notifications & Thresholds'
    ];
    if (headerEl) headerEl.textContent = titles[idx] || 'WaferVision Pipeline';

    // Stop or start animated loops
    if (idx === 0) {
      stopCameraStream();
      isDemoPaused = false;
      updatePlayPauseUI();
      startDemoLoop();
    } else {
      stopDemo();
      if (idx !== 2) stopCameraStream();

      // Initialize views
      if (idx === 1) initBatchView();
      else if (idx === 2) initCameraView();
      else if (idx === 3) initHistoryView();
      else if (idx === 4) initAlertsView();
    }
  }

  // Expose globally so external navigation/footers/cards can switch tabs
  window.switchWaferVisionDemoTab = function(idx) {
    switchTab(idx);
  };

  sideItems.forEach((item, idx) => {
    if (item) {
      item.addEventListener('click', () => switchTab(idx));
      item.style.cursor = 'pointer';
    }
  });

  // --- 1. BATCH VIEW LOGIC ---
  let batchScanning = false;
  let batchResults = [];

  function initBatchView() {
    if (!batchScanning) {
      document.getElementById('batchProgressArea').style.display = 'none';
      document.getElementById('batchResultsArea').style.display = 'none';
      document.getElementById('btnStartBatch').disabled = false;
    }
  }

  const btnStartBatch = document.getElementById('btnStartBatch');
  if (btnStartBatch) {
    btnStartBatch.addEventListener('click', () => {
      if (batchScanning) return;
      
      const batchSize = parseInt(document.getElementById('batchSizeSelect').value) || 100;
      batchScanning = true;
      btnStartBatch.disabled = true;
      document.getElementById('batchSizeSelect').disabled = true;

      const progressArea = document.getElementById('batchProgressArea');
      const resultsArea = document.getElementById('batchResultsArea');
      const progressFill = document.getElementById('batchProgressFill');
      const progressText = document.getElementById('batchProgressText');
      const progressStatus = document.getElementById('batchProgressStatus');
      const miniGrid = document.getElementById('batchMiniGrid');

      progressArea.style.display = 'block';
      resultsArea.style.display = 'none';
      progressFill.style.width = '0%';
      progressText.textContent = `0 / ${batchSize} Wafers`;
      progressStatus.textContent = 'Initializing Lot...';
      progressStatus.style.color = 'var(--accent)';

      // Clear grid
      miniGrid.innerHTML = '';
      for (let i = 0; i < batchSize; i++) {
        const dot = document.createElement('div');
        dot.className = 'batch-mini-dot';
        dot.id = `batchDot-${i}`;
        miniGrid.appendChild(dot);
      }

      batchResults = [];
      let currentIndex = 0;
      let normals = 0;
      let defects = 0;

      const scanInterval = Math.max(12, 3800 / batchSize);

      function scanNext() {
        if (!batchScanning) return; // Tab switched or halted

        if (currentIndex >= batchSize) {
          batchScanning = false;
          btnStartBatch.disabled = false;
          document.getElementById('batchSizeSelect').disabled = false;
          progressStatus.textContent = 'Scan Complete';
          progressStatus.style.color = 'var(--success)';

          // Show results
          resultsArea.style.display = 'block';
          document.getElementById('batchTotalCount').textContent = batchSize;
          document.getElementById('batchNormalCount').textContent = normals;
          document.getElementById('batchDefectCount').textContent = defects;
          const yieldRate = ((normals / batchSize) * 100).toFixed(1);
          document.getElementById('batchDefectRate').textContent = `${(100 - yieldRate).toFixed(1)}%`;
          
          if (100 - yieldRate > 10) {
            document.getElementById('batchDefectRate').style.color = 'var(--danger)';
          } else {
            document.getElementById('batchDefectRate').style.color = 'var(--warning)';
          }

          // Populate table
          const tbody = document.getElementById('batchTableBody');
          tbody.innerHTML = '';
          batchResults.forEach(res => {
            const tr = document.createElement('tr');
            const isDef = res.type !== 'None';
            tr.innerHTML = `
              <td><span style="font-family: monospace; font-weight:600;">${res.id}</span></td>
              <td><span style="${isDef ? 'color:var(--danger); font-weight:700;' : 'color:var(--success);'}">${isDef ? res.emoji + ' ' + res.type : '✅ Normal'}</span></td>
              <td><span style="font-weight: 600;">${res.conf.toFixed(2)}%</span></td>
              <td>${res.latency}ms</td>
              <td><span class="section-badge" style="margin: 0; padding: 2px 8px; font-size:0.65rem; background: ${isDef ? 'rgba(239,68,68,0.1); border-color: rgba(239,68,68,0.3); color: var(--danger);' : 'rgba(16,185,129,0.1); border-color: rgba(16,185,129,0.3); color: var(--success);'}">${isDef ? 'REJECT' : 'PASS'}</span></td>
            `;
            tbody.appendChild(tr);
          });

          // Append to global history
          batchResults.forEach(res => {
            historyData.unshift({
              time: new Date().toLocaleTimeString(),
              id: res.id,
              class: res.type,
              conf: `${res.conf.toFixed(1)}%`,
              status: res.type === 'None' ? 'PASS' : 'REJECT'
            });
          });
          if (historyData.length > 50) historyData.splice(50);
          updateHistoryDOM();
          return;
        }

        const dot = document.getElementById(`batchDot-${currentIndex}`);
        if (dot) dot.className = 'batch-mini-dot scanning';
        progressStatus.textContent = `Analyzing Lot... Wafer #${currentIndex + 1}`;
        progressText.textContent = `${currentIndex + 1} / ${batchSize} Wafers`;
        progressFill.style.width = `${((currentIndex + 1) / batchSize) * 100}%`;

        setTimeout(() => {
          const isDefect = Math.random() < 0.085;
          let defectType = 'None';
          let emoji = '✅';
          let conf = 95.0 + Math.random() * 4.9;

          if (isDefect) {
            defects++;
            const defIdx = Math.floor(Math.random() * 8);
            defectType = defectNames[defIdx];
            emoji = defectEmojis[defIdx];
            if (dot) dot.className = 'batch-mini-dot defect';
          } else {
            normals++;
            if (dot) dot.className = 'batch-mini-dot normal';
            conf = 98.2 + Math.random() * 1.7;
          }

          const waferNum = 1000 + Math.floor(Math.random() * 9000);
          const waferId = `WFR-BAT-${waferNum}`;
          const latency = 10 + Math.floor(Math.random() * 15);

          batchResults.push({
            id: waferId,
            type: defectType,
            emoji: emoji,
            conf: conf,
            latency: latency
          });

          currentIndex++;
          scanNext();
        }, scanInterval);
      }

      scanNext();
    });
  }

  // --- 2. CAMERA VIEW LOGIC ---
  let cameraStreamActive = false;
  let cameraAnimFrame = null;
  let cameraWafers = [];
  let cameraTotal = 0;
  let cameraDefects = 0;
  let cameraFrameCount = 0;
  let forceNextDefect = false;

  const camCanvas = document.getElementById('cameraFeedCanvas');
  const camCtx = camCanvas ? camCanvas.getContext('2d') : null;

  function initCameraView() {
    if (!camCtx) return;
    if (!cameraStreamActive) {
      camCtx.fillStyle = '#06080f';
      camCtx.fillRect(0, 0, 500, 320);
      camCtx.fillStyle = 'rgba(255,255,255,0.18)';
      camCtx.font = '13px Inter, sans-serif';
      camCtx.textAlign = 'center';
      camCtx.fillText('Camera Offline • Start Stream to Scan Wafers', 250, 160);
    }
  }

  const btnToggleCamera = document.getElementById('btnToggleCamera');
  const btnTriggerCameraDefect = document.getElementById('btnTriggerCameraDefect');

  if (btnToggleCamera) {
    btnToggleCamera.addEventListener('click', () => {
      if (cameraStreamActive) {
        stopCameraStream();
      } else {
        cameraStreamActive = true;
        btnToggleCamera.textContent = '⏹️ Pause Scan Stream';
        btnToggleCamera.classList.remove('btn-primary');
        btnToggleCamera.classList.add('btn-danger');
        if (btnTriggerCameraDefect) btnTriggerCameraDefect.disabled = false;
        
        const hud = document.getElementById('cameraStatusHud');
        hud.textContent = 'SCANNING RUNNING';
        hud.style.borderColor = 'var(--success)';
        hud.style.color = 'var(--success)';

        cameraWafers = [
          { x: 120, scanned: false, isDefect: false, type: 'None' },
          { x: 340, scanned: false, isDefect: false, type: 'None' }
        ];
        animateCameraFeed();
      }
    });
  }

  if (btnTriggerCameraDefect) {
    btnTriggerCameraDefect.addEventListener('click', () => {
      forceNextDefect = true;
      btnTriggerCameraDefect.disabled = true;
      btnTriggerCameraDefect.textContent = '⏳ Injecting Defect...';
    });
  }

  function stopCameraStream() {
    cameraStreamActive = false;
    if (cameraAnimFrame) cancelAnimationFrame(cameraAnimFrame);
    if (btnToggleCamera) {
      btnToggleCamera.textContent = '📹 Start Scan Stream';
      btnToggleCamera.classList.remove('btn-danger');
      btnToggleCamera.classList.add('btn-primary');
    }
    if (btnTriggerCameraDefect) {
      btnTriggerCameraDefect.disabled = true;
      btnTriggerCameraDefect.textContent = '⚠️ Simulate Defect';
    }
    const hud = document.getElementById('cameraStatusHud');
    if (hud) {
      hud.textContent = 'STREAM PAUSED';
      hud.style.borderColor = 'var(--border)';
      hud.style.color = 'var(--text3)';
    }
  }

  function playAudioWarning() {
    const isAudioEnabled = document.getElementById('settingAudioToggle').classList.contains('active');
    if (!isAudioEnabled) return;
    
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const actx = new AudioCtx();
      const freqs = [650, 650, 650];
      const times = [0.05, 0.18, 0.31];
      freqs.forEach((freq, i) => {
        const osc = actx.createOscillator();
        const gain = actx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, actx.currentTime + times[i]);
        gain.gain.setValueAtTime(0.1, actx.currentTime + times[i]);
        gain.gain.exponentialRampToValueAtTime(0.01, actx.currentTime + times[i] + 0.1);
        osc.connect(gain);
        gain.connect(actx.destination);
        osc.start(actx.currentTime + times[i]);
        osc.stop(actx.currentTime + times[i] + 0.12);
      });
    } catch (e) {
      console.warn('Audio Context error', e);
    }
  }

  function triggerLiveDefect(type) {
    playAudioWarning();
    cameraDefects++;
    document.getElementById('camDefectsFound').textContent = cameraDefects;
    updateCamYield();

    const notifBox = document.getElementById('cameraNotifBox');
    const notifBody = document.getElementById('cameraNotifBody');
    const waferNum = 1000 + Math.floor(Math.random() * 9000);
    const waferId = `WFR-CAM-${waferNum}`;

    if (notifBody) {
      notifBody.innerHTML = `Critical defect <strong>${type}</strong> identified on <strong style="font-family:monospace;">${waferId}</strong>. Alarm broadcasted.`;
    }
    if (notifBox) {
      notifBox.classList.add('show');
      setTimeout(() => notifBox.classList.remove('show'), 4000);
    }

    const logList = document.getElementById('cameraLogList');
    if (logList) {
      if (logList.querySelector('.camera-log-empty')) logList.innerHTML = '';
      const logItem = document.createElement('div');
      logItem.className = 'camera-log-item defect';
      logItem.innerHTML = `
        <span>🔴 ${waferId}</span>
        <span style="font-weight:700;">${type}</span>
        <span>${new Date().toLocaleTimeString()}</span>
      `;
      logList.insertBefore(logItem, logList.firstChild);
      if (logList.children.length > 8) logList.lastChild.remove();
    }

    historyData.unshift({
      time: new Date().toLocaleTimeString(),
      id: waferId,
      class: type,
      conf: `${(92.4 + Math.random() * 7.5).toFixed(1)}%`,
      status: 'REJECT'
    });
    if (historyData.length > 50) historyData.splice(50);
    updateHistoryDOM();

    // Alert broadcast log
    const isEmailEnabled = document.getElementById('settingEmailToggle').classList.contains('active');
    const alertsLogBody = document.getElementById('alertsLogBody');
    if (alertsLogBody) {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${new Date().toLocaleTimeString()}</td>
        <td style="color:var(--danger); font-weight:700;">⚠️ ${type} Alert on ${waferId}</td>
        <td>${isEmailEnabled ? '📧 Email Alert' : '🖥️ HUD Display'}</td>
        <td><span class="section-badge" style="margin:0; padding:2px 8px; font-size:0.65rem; background:rgba(16,185,129,0.1); border-color:rgba(16,185,129,0.3); color:var(--success);">SENT</span></td>
      `;
      alertsLogBody.insertBefore(tr, alertsLogBody.firstChild);
      if (alertsLogBody.children.length > 8) alertsLogBody.lastChild.remove();
    }
  }

  function triggerLiveNormal() {
    const logList = document.getElementById('cameraLogList');
    const waferNum = 1000 + Math.floor(Math.random() * 9000);
    const waferId = `WFR-CAM-${waferNum}`;

    if (logList) {
      if (logList.querySelector('.camera-log-empty')) logList.innerHTML = '';
      const logItem = document.createElement('div');
      logItem.className = 'camera-log-item normal';
      logItem.innerHTML = `
        <span>🟢 ${waferId}</span>
        <span style="color:var(--success);">Normal</span>
        <span>${new Date().toLocaleTimeString()}</span>
      `;
      logList.insertBefore(logItem, logList.firstChild);
      if (logList.children.length > 8) logList.lastChild.remove();
    }

    historyData.unshift({
      time: new Date().toLocaleTimeString(),
      id: waferId,
      class: 'None',
      conf: `${(98.5 + Math.random() * 1.4).toFixed(1)}%`,
      status: 'PASS'
    });
    if (historyData.length > 50) historyData.splice(50);
    updateHistoryDOM();
  }

  function updateCamYield() {
    const rate = cameraTotal > 0 ? (((cameraTotal - cameraDefects) / cameraTotal) * 100).toFixed(1) : '100';
    document.getElementById('camYieldRate').textContent = `${rate}%`;
  }

  function animateCameraFeed() {
    if (!cameraStreamActive || !camCtx) return;

    cameraFrameCount++;

    // Clear feed background
    camCtx.fillStyle = '#06080f';
    camCtx.fillRect(0, 0, 500, 320);

    // Draw conveyor track line
    camCtx.strokeStyle = 'var(--border)';
    camCtx.lineWidth = 2;
    camCtx.setLineDash([12, 8]);
    camCtx.lineDashOffset = -cameraFrameCount * 1.5;
    camCtx.beginPath();
    camCtx.moveTo(0, 160);
    camCtx.lineTo(500, 160);
    camCtx.stroke();
    camCtx.setLineDash([]);

    // Add new wafers
    if (cameraFrameCount % 140 === 0) {
      let isDef = false;
      let defType = 'None';
      if (forceNextDefect) {
        isDef = true;
        const defIdx = Math.floor(Math.random() * 8);
        defType = defectNames[defIdx];
        forceNextDefect = false;
        if (btnTriggerCameraDefect) {
          btnTriggerCameraDefect.disabled = false;
          btnTriggerCameraDefect.textContent = '⚠️ Simulate Defect';
        }
      } else {
        isDef = Math.random() < 0.12; // 12% defect chance
        if (isDef) {
          const defIdx = Math.floor(Math.random() * 8);
          defType = defectNames[defIdx];
        }
      }
      cameraWafers.push({
        x: -50,
        scanned: false,
        isDefect: isDef,
        type: defType
      });
    }

    // Draw conveyor belt wafers
    cameraWafers.forEach((w) => {
      w.x += 1.6; // travel speed

      const cy = 160;
      const r = 44;

      // Draw gray silicon circle
      camCtx.beginPath();
      camCtx.arc(w.x, cy, r, 0, Math.PI * 2);
      camCtx.fillStyle = isDark() ? '#161d2e' : '#e2e8f0';
      camCtx.fill();
      camCtx.strokeStyle = 'var(--border)';
      camCtx.lineWidth = 1.5;
      camCtx.stroke();

      // Flat cut
      camCtx.save();
      camCtx.translate(w.x, cy);
      camCtx.beginPath();
      camCtx.moveTo(r - 5, r - 5);
      camCtx.lineTo(r, r);
      camCtx.strokeStyle = isDark() ? '#06080f' : '#f8fafc';
      camCtx.lineWidth = 3;
      camCtx.stroke();
      camCtx.restore();

      // Die lines grid
      camCtx.save();
      camCtx.beginPath();
      camCtx.arc(w.x, cy, r - 1, 0, Math.PI*2);
      camCtx.clip();
      camCtx.strokeStyle = isDark() ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
      camCtx.lineWidth = 0.8;
      const gs = 6;
      for (let gx = w.x - r; gx < w.x + r; gx += gs) {
        camCtx.beginPath();
        camCtx.moveTo(gx, cy - r);
        camCtx.lineTo(gx, cy + r);
        camCtx.stroke();
      }
      for (let gy = cy - r; gy < cy + r; gy += gs) {
        camCtx.beginPath();
        camCtx.moveTo(w.x - r, gy);
        camCtx.lineTo(w.x + r, gy);
        camCtx.stroke();
      }
      camCtx.restore();

      // Draw defects markings if active scan
      if (w.isDefect && (w.x > 210)) {
        camCtx.save();
        camCtx.beginPath();
        camCtx.arc(w.x, cy, r - 2, 0, Math.PI*2);
        camCtx.clip();
        
        camCtx.fillStyle = 'rgba(239, 68, 68, 0.45)';
        if (w.type === 'Center') {
          camCtx.beginPath();
          camCtx.arc(w.x, cy, 14, 0, Math.PI*2);
          camCtx.fill();
        } else if (w.type === 'Donut') {
          camCtx.beginPath();
          camCtx.arc(w.x, cy, 22, 0, Math.PI*2);
          camCtx.lineWidth = 6;
          camCtx.strokeStyle = 'rgba(239, 68, 68, 0.45)';
          camCtx.stroke();
        } else {
          camCtx.beginPath();
          camCtx.arc(w.x + 8, cy - 8, 8, 0, Math.PI*2);
          camCtx.fill();
        }
        camCtx.restore();
      }

      // Draw pass/reject HUD box
      if (w.scanned) {
        const isDef = w.isDefect;
        camCtx.strokeStyle = isDef ? 'var(--danger)' : 'var(--success)';
        camCtx.lineWidth = 1.8;
        camCtx.strokeRect(w.x - r - 4, cy - r - 4, r * 2 + 8, r * 2 + 8);
        
        camCtx.fillStyle = isDef ? 'var(--danger)' : 'var(--success)';
        camCtx.font = 'bold 9px Inter, sans-serif';
        camCtx.textAlign = 'left';
        camCtx.fillText(isDef ? `REJECT: ${w.type.toUpperCase()}` : 'PASS: OK', w.x - r - 3, cy - r - 8);
      }

      // Scanner check
      if (!w.scanned && w.x >= 250) {
        w.scanned = true;
        cameraTotal++;
        document.getElementById('camTotalProcessed').textContent = cameraTotal;
        updateCamYield();

        const hud = document.getElementById('cameraStatusHud');
        if (hud) {
          hud.textContent = w.isDefect ? `ALARM: ${w.type.toUpperCase()}` : 'SCAN RESULT: PASS';
          hud.style.color = w.isDefect ? 'var(--danger)' : 'var(--success)';
          hud.style.borderColor = w.isDefect ? 'var(--danger)' : 'var(--success)';
          
          setTimeout(() => {
            if (cameraStreamActive && hud.textContent.startsWith('SCAN')) {
              hud.textContent = 'SCANNING RUNNING';
              hud.style.color = 'var(--success)';
              hud.style.borderColor = 'var(--success)';
            }
          }, 1200);
        }

        if (w.isDefect) {
          triggerLiveDefect(w.type);
        } else {
          triggerLiveNormal();
        }
      }
    });

    cameraWafers = cameraWafers.filter(w => w.x < 550);

    // Laser scan line overlay
    camCtx.strokeStyle = 'rgba(59, 130, 246, 0.4)';
    camCtx.lineWidth = 2.5;
    const laserAlpha = 0.25 + Math.sin(cameraFrameCount * 0.18) * 0.15;
    camCtx.fillStyle = `rgba(59, 130, 246, ${laserAlpha})`;
    camCtx.fillRect(247, 0, 6, 320);
    camCtx.beginPath();
    camCtx.moveTo(250, 0);
    camCtx.lineTo(250, 320);
    camCtx.stroke();

    cameraAnimFrame = requestAnimationFrame(animateCameraFeed);
  }

  // --- 3. INSPECTION HISTORY LOGIC ---
  const histCanvas = document.getElementById('historyChartCanvas');
  const histCtx = histCanvas ? histCanvas.getContext('2d') : null;

  function initHistoryView() {
    updateHistoryDOM();
    drawHistoryChart();
  }

  function updateHistoryDOM() {
    const total = historyData.length + 1475;
    const rejects = historyData.filter(d => d.status === 'REJECT').length + 108;
    const passes = total - rejects;
    const rate = ((passes / total) * 100).toFixed(2);

    const elTotal = document.getElementById('histTotalScanned');
    const elRejects = document.getElementById('histTotalDefects');
    const elRate = document.getElementById('histYieldRate');

    if (elTotal) elTotal.textContent = total.toLocaleString();
    if (elRejects) elRejects.textContent = rejects.toLocaleString();
    if (elRate) elRate.textContent = `${rate}%`;

    const tbody = document.getElementById('historyTableBody');
    if (tbody) {
      tbody.innerHTML = '';
      if (historyData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:var(--text3); font-style:italic;">No records found. Run a batch or camera scan.</td></tr>';
      } else {
        historyData.forEach(row => {
          const isReject = row.status === 'REJECT';
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>${row.time}</td>
            <td><span style="font-family: monospace; font-weight:600;">${row.id}</span></td>
            <td><span style="${isReject ? 'color:var(--danger); font-weight:700;' : 'color:var(--success);'}">${isReject ? row.class : '✅ Normal'}</span></td>
            <td><span style="font-weight:600;">${row.conf}</span></td>
            <td><span class="section-badge" style="margin: 0; padding: 2px 8px; font-size:0.65rem; background: ${isReject ? 'rgba(239,68,68,0.1); border-color: rgba(239,68,68,0.3); color: var(--danger);' : 'rgba(16,185,129,0.1); border-color: rgba(16,185,129,0.3); color: var(--success);'}">${row.status}</span></td>
          `;
          tbody.appendChild(tr);
        });
      }
    }

    const distList = document.getElementById('historyDistList');
    if (distList) {
      distList.innerHTML = '';
      const counts = {};
      defectNames.forEach(n => { if (n !== 'None') counts[n] = 0; });
      counts['Scratch'] = 22; counts['Edge-Ring'] = 18; counts['Center'] = 15; counts['Donut'] = 12; counts['Loc'] = 14; counts['Edge-Loc'] = 11; counts['Near-Full'] = 6; counts['Random'] = 10;
      
      historyData.forEach(d => {
        if (d.status === 'REJECT' && counts[d.class] !== undefined) {
          counts[d.class]++;
        }
      });

      const maxCount = Math.max(...Object.values(counts));
      Object.entries(counts).sort((a,b) => b[1] - a[1]).forEach(([name, val]) => {
        const pct = maxCount > 0 ? (val / maxCount) * 100 : 0;
        const div = document.createElement('div');
        div.className = 'dist-item';
        div.innerHTML = `
          <span class="dist-label">${name}</span>
          <div class="dist-track">
            <div class="dist-fill" style="width: ${pct}%;"></div>
          </div>
          <span class="dist-val">${val}</span>
        `;
        distList.appendChild(div);
      });
    }
  }

  function drawHistoryChart() {
    if (!histCtx || !histCanvas) return;

    const w = histCanvas.width;
    const h = histCanvas.height;

    histCtx.clearRect(0, 0, w, h);

    const padding = 35;
    const chartW = w - padding * 2;
    const chartH = h - padding * 2;

    // Horiz lines
    histCtx.strokeStyle = isDark() ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
    histCtx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding + (chartH / 4) * i;
      histCtx.beginPath();
      histCtx.moveTo(padding, y);
      histCtx.lineTo(w - padding, y);
      histCtx.stroke();

      histCtx.fillStyle = 'var(--text3)';
      histCtx.font = '9px Inter, sans-serif';
      histCtx.textAlign = 'right';
      const labelVal = 100 - i * 2.5;
      histCtx.fillText(`${labelVal}%`, padding - 6, y + 3);
    }

    const points = [91.8, 92.5, 90.4, 93.1, 92.8, 91.5, 94.2];
    const coords = points.map((p, i) => {
      const x = padding + (chartW / (points.length - 1)) * i;
      const normY = (p - 90) / 10;
      const y = padding + chartH - chartH * normY;
      return { x, y, val: p };
    });

    // Draw linear fill
    const chartGrad = histCtx.createLinearGradient(0, padding, 0, padding + chartH);
    chartGrad.addColorStop(0, 'rgba(99, 102, 241, 0.22)');
    chartGrad.addColorStop(1, 'rgba(99, 102, 241, 0.0)');
    
    histCtx.fillStyle = chartGrad;
    histCtx.beginPath();
    histCtx.moveTo(coords[0].x, padding + chartH);
    coords.forEach(pt => histCtx.lineTo(pt.x, pt.y));
    histCtx.lineTo(coords[coords.length - 1].x, padding + chartH);
    histCtx.closePath();
    histCtx.fill();

    // Draw line path
    histCtx.strokeStyle = 'var(--accent2)';
    histCtx.lineWidth = 3;
    histCtx.beginPath();
    coords.forEach((pt, i) => {
      if (i === 0) histCtx.moveTo(pt.x, pt.y);
      else histCtx.lineTo(pt.x, pt.y);
    });
    histCtx.stroke();

    // Circles
    coords.forEach((pt, i) => {
      histCtx.beginPath();
      histCtx.arc(pt.x, pt.y, 4.5, 0, Math.PI * 2);
      histCtx.fillStyle = 'var(--accent)';
      histCtx.fill();
      histCtx.strokeStyle = '#fff';
      histCtx.lineWidth = 1.5;
      histCtx.stroke();

      histCtx.fillStyle = 'var(--text2)';
      histCtx.font = 'bold 9px Inter, sans-serif';
      histCtx.textAlign = 'center';
      histCtx.fillText(`${pt.val}%`, pt.x, pt.y - 10);

      histCtx.fillStyle = 'var(--text3)';
      histCtx.font = '9px Inter, sans-serif';
      histCtx.fillText(`Run -${7 - i}`, pt.x, padding + chartH + 15);
    });
  }

  const btnClearHistory = document.getElementById('btnClearHistory');
  if (btnClearHistory) {
    btnClearHistory.addEventListener('click', () => {
      if (confirm('Are you sure you want to clear all history records?')) {
        historyData = [];
        updateHistoryDOM();
        drawHistoryChart();
      }
    });
  }

  // --- 4. SMART ALERTS & SETTINGS LOGIC ---
  function initAlertsView() {
    updateAlertsDOM();
  }

  function updateAlertsDOM() {
    const alertsLogBody = document.getElementById('alertsLogBody');
    if (alertsLogBody) {
      alertsLogBody.innerHTML = '';
      if (alertsData.length === 0) {
        alertsLogBody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:var(--text3); font-style:italic;">No alarms logged.</td></tr>';
      } else {
        alertsData.forEach(row => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>${row.time}</td>
            <td style="color:var(--danger); font-weight:700;">${row.msg}</td>
            <td>${row.channel}</td>
            <td><span class="section-badge" style="margin:0; padding:2px 8px; font-size:0.65rem; background:rgba(16,185,129,0.1); border-color:rgba(16,185,129,0.3); color:var(--success);">${row.status}</span></td>
          `;
          alertsLogBody.appendChild(tr);
        });
      }
    }
  }

  // Toggles Behavior
  const emailToggle = document.getElementById('settingEmailToggle');
  const emailThumb = document.getElementById('settingEmailThumb');
  if (emailToggle) {
    emailToggle.addEventListener('click', () => {
      const active = emailToggle.classList.toggle('active');
      emailToggle.style.background = active ? 'var(--success)' : 'var(--border)';
      emailThumb.style.left = active ? '18px' : '2px';
      
      // Sync sidebar email alert toggle
      const mainToggle = document.querySelector('.app-demo-sidebar .ads-toggle-track');
      const mainThumb = document.querySelector('.app-demo-sidebar .ads-toggle-thumb');
      if (mainToggle && mainThumb) {
        if (active) mainToggle.classList.add('active');
        else mainToggle.classList.remove('active');
        mainToggle.style.background = active ? 'var(--success)' : 'var(--border)';
        mainThumb.style.left = active ? '18px' : '2px';
      }
    });
  }

  // Sync main toggle
  const mainToggle = document.querySelector('.app-demo-sidebar .ads-toggle-track');
  const mainThumb = document.querySelector('.app-demo-sidebar .ads-toggle-thumb');
  if (mainToggle) {
    mainToggle.addEventListener('click', () => {
      const active = mainToggle.classList.toggle('active');
      mainToggle.style.background = active ? 'var(--success)' : 'var(--border)';
      mainThumb.style.left = active ? '18px' : '2px';

      if (emailToggle && emailThumb) {
        if (active) emailToggle.classList.add('active');
        else emailToggle.classList.remove('active');
        emailToggle.style.background = active ? 'var(--success)' : 'var(--border)';
        emailThumb.style.left = active ? '18px' : '2px';
      }
    });
    mainToggle.style.cursor = 'pointer';
  }

  const audioToggle = document.getElementById('settingAudioToggle');
  const audioThumb = document.getElementById('settingAudioThumb');
  if (audioToggle) {
    audioToggle.addEventListener('click', () => {
      const active = audioToggle.classList.toggle('active');
      audioToggle.style.background = active ? 'var(--success)' : 'var(--border)';
      audioThumb.style.left = active ? '18px' : '2px';
    });
  }

  const slider = document.getElementById('thresholdSlider');
  const threshVal = document.getElementById('threshVal');
  if (slider && threshVal) {
    slider.addEventListener('input', (e) => {
      threshVal.textContent = `${e.target.value}%`;
    });
  }

  const btnExportAlerts = document.getElementById('btnExportAlerts');
  if (btnExportAlerts) {
    btnExportAlerts.addEventListener('click', () => {
      if (alertsData.length === 0) {
        alert('No alert logs to export.');
        return;
      }
      let csvContent = 'data:text/csv;charset=utf-8,Time,Alert Event,Channel,Status\n';
      alertsData.forEach(row => {
        csvContent += `"${row.time}","${row.msg.replace('"', '""')}","${row.channel}","${row.status}"\n`;
      });
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', 'wafervision_alerts_log.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }

  // Start when visible
  const demoSection = document.getElementById('app-preview');
  if (demoSection) {
    const demoObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !demoStarted) {
          demoStarted = true;
          // Only start if Single Detection (tab 0) is active
          if (activeTabIdx === 0) {
            startDemoLoop();
          }
        }
      });
    }, { threshold: 0.2 });
    demoObserver.observe(demoSection);
  }

  // Pause when not visible to save resources
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopDemo();
      stopCameraStream();
    } else if (demoStarted) {
      if (activeTabIdx === 0) {
        stopDemo();
        startDemoLoop();
      } else if (activeTabIdx === 2) {
        // Re-enable camera animation feed if it was active
        if (cameraStreamActive) {
          if (cameraAnimFrame) cancelAnimationFrame(cameraAnimFrame);
          animateCameraFeed();
        }
      }
    }
  });
})();

// ===== PREMIUM INTERACTIVE FEATURES =====
(function () {
  // 1. SCROLL PROGRESS BAR (Feature 9)
  const progressBar = document.getElementById('scrollProgressBar');
  if (progressBar) {
    window.addEventListener('scroll', () => {
      const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const progress = (scrollTop / scrollHeight) * 100;
      progressBar.style.width = progress + '%';
    }, { passive: true });
  }

  // 2. CURSOR GLOW EFFECT (Feature 11)
  const cursorGlow = document.getElementById('cursorGlow');
  if (cursorGlow) {
    let mouseX = 0, mouseY = 0;
    let glowX = 0, glowY = 0;
    let isMouseActive = false;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!isMouseActive) {
        isMouseActive = true;
        cursorGlow.style.opacity = '1';
      }
    });

    window.addEventListener('mouseout', () => {
      isMouseActive = false;
      cursorGlow.style.opacity = '0';
    });

    function animateGlow() {
      // Smooth follow effect using lerping
      glowX += (mouseX - glowX) * 0.12;
      glowY += (mouseY - glowY) * 0.12;

      // Update transform to center the 400x400 element on the cursor
      cursorGlow.style.transform = `translate(${glowX - 200}px, ${glowY - 200}px)`;
      requestAnimationFrame(animateGlow);
    }
    animateGlow();
  }

  // 3. 3D TILT EFFECT FOR CARDS
  // Add a premium 3D tilt effect to various cards when hovered
  const tiltElements = document.querySelectorAll('.feature-card, .model-card, .tech-card, .arch-detail-card, .perf-card');

  tiltElements.forEach(el => {
    // Initial styles needed for 3D effect
    el.style.transformStyle = 'preserve-3d';

    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      // Calculate mouse position relative to the center of the element
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Calculate rotation angles (max 6 degrees)
      const tiltX = ((y - centerY) / centerY) * -6;
      const tiltY = ((x - centerX) / centerX) * 6;

      el.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.02, 1.02, 1.02)`;
      el.style.transition = 'none'; // Remove transition for smooth tracking
    });

    el.addEventListener('mouseleave', () => {
      // Reset transform with a smooth transition
      el.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      el.style.transition = 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    });
  });

  // 4. MAGNETIC BUTTONS
  // Add a subtle magnetic pull effect to primary interactive elements
  const magneticElements = document.querySelectorAll('.btn-primary, .nav-links a');

  magneticElements.forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      // Pull element towards mouse (max 15px)
      el.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
      el.style.transition = 'none';
    });

    el.addEventListener('mouseleave', () => {
      el.style.transform = 'translate(0px, 0px)';
      el.style.transition = 'transform 0.4s ease';
    });
  });

})();

// ===== HIGH-FIDELITY ZOOMABLE LIGHTBOX =====
(function () {
  const lightbox = document.createElement('div');
  lightbox.id = 'lightboxModal';
  lightbox.className = 'lightbox';
  lightbox.innerHTML = `
    <span class="lightbox-close" id="lightboxClose">&times;</span>
    <div class="lightbox-content-wrapper">
      <img class="lightbox-content" id="lightboxImg" src="" alt="Enlarged View">
      <div class="lightbox-caption" id="lightboxCaption"></div>
      <div style="font-size: 0.72rem; color: var(--text3); margin-top: 10px; font-weight: 500; letter-spacing: 0.02em;">
        💡 Click on the image above to zoom. Move your mouse to pan around details.
      </div>
    </div>
  `;
  document.body.appendChild(lightbox);

  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxClose = document.getElementById('lightboxClose');

  // Select target images to make them zoomable
  const targetImages = document.querySelectorAll('.hero-visual img, .dataset-img');
  targetImages.forEach(img => {
    const parent = img.parentNode;
    if (parent && !parent.classList.contains('zoom-wrapper')) {
      const wrapper = document.createElement('div');
      wrapper.className = 'zoom-wrapper';
      // If it is dataset image, override max-width to allow full size
      if (img.classList.contains('dataset-img')) {
        wrapper.style.maxWidth = '100%';
      }
      parent.replaceChild(wrapper, img);
      wrapper.appendChild(img);

      wrapper.addEventListener('click', () => {
        openLightbox(img.src, img.alt);
      });
    }
  });

  function openLightbox(src, alt) {
    lightboxImg.src = src;
    lightboxCaption.textContent = alt;
    lightbox.style.display = 'flex';
    setTimeout(() => {
      lightbox.classList.add('open');
    }, 10);
    document.body.style.overflow = 'hidden'; // Disable page scrolling
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    setTimeout(() => {
      lightbox.style.display = 'none';
      isZoomed = false;
      lightboxImg.style.transform = '';
      lightboxImg.style.cursor = 'zoom-in';
    }, 300);
    document.body.style.overflow = ''; // Re-enable page scrolling
  }

  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox || e.target === lightbox.querySelector('.lightbox-content-wrapper')) {
      closeLightbox();
    }
  });

  // ESC to close
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('open')) {
      closeLightbox();
    }
  });

  // Lightbox Zoom & Panning
  let isZoomed = false;
  lightboxImg.addEventListener('click', (e) => {
    e.stopPropagation();
    isZoomed = !isZoomed;
    if (isZoomed) {
      lightboxImg.style.cursor = 'zoom-out';
      panImage(e);
    } else {
      lightboxImg.style.cursor = 'zoom-in';
      lightboxImg.style.transform = '';
    }
  });

  lightboxImg.addEventListener('mousemove', (e) => {
    if (isZoomed) {
      panImage(e);
    }
  });

  function panImage(e) {
    const rect = lightboxImg.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Percentage position of the mouse relative to image boundary
    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;

    // Set transform-origin dynamically to match cursor coordinates
    lightboxImg.style.transformOrigin = `${xPercent}% ${yPercent}%`;
    lightboxImg.style.transform = 'scale(2.2)'; // 2.2x zoom
  }
})();

// ===== BACK TO TOP BUTTON =====
(function () {
  const backToTop = document.getElementById('backToTop');
  if (!backToTop) return;

  // Show/hide based on scroll position
  let lastScrollY = 0;
  let ticking = false;

  function updateBackToTop() {
    const scrollY = window.scrollY;
    const heroHeight = document.getElementById('hero')?.offsetHeight || 600;

    if (scrollY > heroHeight * 0.8) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }

    lastScrollY = scrollY;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateBackToTop);
      ticking = true;
    }
  }, { passive: true });

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

// ===== KEYBOARD SHORTCUTS =====
(function () {
  document.addEventListener('keydown', (e) => {
    // Escape closes chatbot
    if (e.key === 'Escape') {
      const chatWindow = document.getElementById('chatbotWindow');
      if (chatWindow && chatWindow.classList.contains('show')) {
        toggleChatbot();
      }
    }

    // "/" focuses chatbot input (like GitHub/Slack)
    if (e.key === '/' && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const activeEl = document.activeElement;
      const isInput = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.tagName === 'SELECT');
      if (!isInput) {
        e.preventDefault();
        const chatWindow = document.getElementById('chatbotWindow');
        if (!chatWindow || !chatWindow.classList.contains('show')) {
          toggleChatbot();
        }
        setTimeout(() => {
          const chatInput = document.getElementById('chatInput');
          if (chatInput) chatInput.focus();
        }, 100);
      }
    }
  });
})();

// ===== HERO BADGE TYPING ANIMATION =====
(function () {
  const badge = document.querySelector('.hero-badge');
  if (!badge) return;

  const text = badge.textContent.trim();
  // Get the dot element and text content
  const dot = badge.querySelector('.dot');
  const textContent = text.replace(/^.*?(?=\s)/, '').trim(); // Get text after first space

  // Only animate once
  let animated = false;

  const heroObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !animated) {
        animated = true;
        // Clear text, keep the dot
        badge.innerHTML = '';
        if (dot) badge.appendChild(dot.cloneNode(true));
        badge.insertAdjacentHTML('beforeend', ' ');

        // Type out the text character by character
        let i = 0;
        const typeSpan = document.createElement('span');
        badge.appendChild(typeSpan);

        const typeInterval = setInterval(() => {
          if (i < textContent.length) {
            typeSpan.textContent += textContent[i];
            i++;
          } else {
            clearInterval(typeInterval);
          }
        }, 35);

        heroObs.disconnect();
      }
    });
  }, { threshold: 0.5 });

  heroObs.observe(badge);
})();

// ===== SECTION COUNTER (counts visible sections for analytics) =====
(function () {
  let sectionsViewed = new Set();
  const allSections = document.querySelectorAll('section[id]');

  const sectionTracker = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        sectionsViewed.add(entry.target.id);
      }
    });
  }, { threshold: 0.3 });

  allSections.forEach(s => sectionTracker.observe(s));
})();

// ===== REMOVE PAGE LOADING CLASS =====
document.addEventListener('DOMContentLoaded', () => {
  // Remove loading class after fonts/resources have had time to load
  setTimeout(() => {
    document.body.classList.remove('page-loading');
  }, 100);
});

console.log('🔬 WaferVision loaded successfully — Enhanced Edition');
