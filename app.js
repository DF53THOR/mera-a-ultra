import { API_CONFIG } from './config.js';
const input = document.getElementById('main-input');
const chat = document.getElementById('chat');
const greet = document.getElementById('greet');
const sendBtn = document.getElementById('send-btn');
const scrollTarget = document.getElementById('scroll-target');

const userTypes = ["Gezgin", "Analist", "Donanımcı", "Kaşif", "Sistem Mimarı"];
let currentQuestion = ""; // Fiyat arama için son soruyu tutar

// Başlangıç Ayarları
window.onload = () => {
    const name = userTypes[Math.floor(Math.random() * userTypes.length)];
    updateUserUI(name);
    renderWelcome(name);
    
    // Tema kontrolü
    if(localStorage.getItem('theme') === 'dark') document.body.classList.add('dark-mode');
};

function updateUserUI(name) {
    document.getElementById('user-name-display').innerText = name;
    document.getElementById('user-avatar').innerText = name[0].toUpperCase();
}

window.changeName = () => {
    const n = prompt("Mera AI sana nasıl hitap etsin?");
    if (n && n.trim()) { updateUserUI(n); if (greet.style.display !== "none") renderWelcome(n); }
};

// Gece/Gündüz Modu Geçişi
document.getElementById('theme-toggle').onclick = () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
};

// Arşiv Aç/Kapat
document.getElementById('lib-btn').onclick = () => document.getElementById('lib-panel').classList.add('active');
document.getElementById('close-lib').onclick = () => document.getElementById('lib-panel').classList.remove('active');

const getAnimatedLogo = () => `
    <div class="m-box-anim">
        <svg viewBox="0 0 100 100" class="m-draw-svg">
            <path class="m-path-draw" d="M15,85 L35,15 L50,65 L65,15 L85,85" />
        </svg>
    </div>`;

function renderWelcome(name) {
    greet.innerHTML = `
        <h2 style="font-size:48px; font-weight:700;">Merhaba, <span id="type-target"></span></h2>
        <p style="color:var(--text-sub); font-size:20px; margin-top:10px;">Donanım dünyasında neyi keşfediyoruz?</p>
        <div class="sugg-grid">
            <div class="sugg-card" onclick="quickAsk('Hangi ekran kartını almalıyım? Lütfen tablo ile göster.')">
                <i class="fas fa-search-plus"></i>
                <h4>GPU Tavsiyesi</h4>
                <p style="font-size:13px; color:var(--text-sub); margin-top:5px;">Bütçene uygun kartı bul.</p>
            </div>
            <div class="sugg-card" onclick="quickAsk('Darboğaz testi nasıl yapılır?')">
                <i class="fas fa-gauge-high"></i>
                <h4>Darboğaz Testi</h4>
                <p style="font-size:13px; color:var(--text-sub); margin-top:5px;">İşlemci uyumunu ölç.</p>
            </div>
            <div class="sugg-card" onclick="quickAsk('Sistemimi nasıl hızlandırırım?')">
                <i class="fas fa-rocket"></i>
                <h4>FPS Artırma</h4>
                <p style="font-size:13px; color:var(--text-sub); margin-top:5px;">Performans ayarları.</p>
            </div>
        </div>`;
    
    let i = 0;
    const target = document.getElementById("type-target");
    function type() { if (i < name.length) { target.innerHTML += name.charAt(i); i++; setTimeout(type, 120); } }
    setTimeout(type, 400);
}

window.quickAsk = (text) => { input.value = text; handleSend(); };

// Sesli Komut (Mikrofon)
document.getElementById('mic-btn').onclick = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Tarayıcın sesli girişi desteklemiyor.");
    const rec = new SpeechRecognition();
    rec.lang = 'tr-TR';
    document.getElementById('mic-btn').style.color = "red";
    rec.start();
    rec.onresult = (e) => {
        input.value = e.results[0][0].transcript;
        document.getElementById('mic-btn').style.color = "";
    };
    rec.onerror = () => document.getElementById('mic-btn').style.color = "";
    rec.onend = () => document.getElementById('mic-btn').style.color = "";
};

// Sesli Okuma (Hoparlör)
window.speakText = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'tr-TR';
    speechSynthesis.speak(utterance);
};

// Görüntü Olarak İndirme
window.downloadMsg = (id) => {
    const element = document.getElementById(id);
    html2canvas(element, { backgroundColor: null }).then(canvas => {
        const link = document.createElement('a');
        link.download = 'Mera-AI-Raporu.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    });
};

// Fiyat Arama (Akakçe vb. sitelere yönlendirir)
window.searchPrice = () => {
    const query = encodeURIComponent(currentQuestion + " fiyat");
    window.open(`https://www.akakce.com/arama/?q=${query}`, '_blank');
};

window.handleSend = async () => {
    const val = input.value.trim();
    if(!val || sendBtn.disabled) return;

    currentQuestion = val; // Fiyat araması için sakla
    sendBtn.disabled = true;
    input.value = "";
    greet.style.display = "none";

    chat.innerHTML += `<div class="msg-bubble user-msg"><div class="user-msg-content">${val}</div></div>`;
    
    const loadId = "load-" + Date.now();
    chat.innerHTML += `<div class="msg-bubble ai-msg" id="${loadId}">${getAnimatedLogo()}<div class="ai-msg-content" style="font-style:italic; color:var(--text-sub); margin-left:10px;">Analiz ediliyor...</div></div>`;
    scrollBottom();

    // Prompt'u tabloları zorlayacak şekilde ayarlıyoruz
    const sysPrompt = `Sen Mera AI donanım asistanısın. Kısa, net ve markdown kullanarak yanıt ver. Karşılaştırmalarda kesinlikle tablo kullan. Soru: ${val}`;

    try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: sysPrompt }] }] })
        });
        const data = await res.json();
        let answerText = data.candidates[0].content.parts[0].text;
        
        // Markdown metnini HTML'e çevir (Tablolar, kalın yazılar vs.)
        const formattedHTML = marked.parse(answerText);
        const msgId = "msg-" + Date.now();
        
        document.getElementById(loadId).remove();
        chat.innerHTML += `
            <div class="msg-bubble ai-msg" id="${msgId}">
                ${getAnimatedLogo()}
                <div class="ai-msg-wrapper">
                    <div class="ai-msg-content markdown-body">${formattedHTML}</div>
                    
                    <div class="msg-actions">
                        <button class="action-chip" onclick="speakText('${answerText.replace(/'/g, "\\'")}')"><i class="fas fa-volume-up"></i> Sesli Oku</button>
                        <button class="action-chip" onclick="searchPrice()"><i class="fas fa-tag"></i> Fiyat Ara</button>
                        <button class="action-chip" onclick="downloadMsg('${msgId}')"><i class="fas fa-download"></i> Raporu İndir (PNG)</button>
                    </div>
                </div>
            </div>`;
    } catch (e) {
        document.getElementById(loadId).innerText = "Bağlantı hatası.";
    } finally {
        sendBtn.disabled = false;
        scrollBottom();
    }
};

function scrollBottom() { scrollTarget.scrollTo({ top: scrollTarget.scrollHeight, behavior: 'smooth' }); }
sendBtn.onclick = handleSend;
input.onkeydown = (e) => { if(e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } };