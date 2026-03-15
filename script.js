// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM loaded - checking chatbot elements...");
    console.log("Toggle button exists:", !!document.getElementById('chatbotToggle'));
    console.log("Container exists:", !!document.getElementById('chatbotContainer'));
    
    // Initialize the application
    initApp();
});

// Chatbot model config is handled by the Cloudflare Worker API.
// For Cloudflare Worker deployments on a different domain, set:
// window.CHATBOT_API_BASE_URL = 'https://your-worker.workers.dev'
const CHATBOT_API_BASE_URL = ((window.CHATBOT_API_BASE_URL || '') + '').replace(/\/$/, '');

function buildApiUrl(path) {
    if (!CHATBOT_API_BASE_URL) return path;
    return `${CHATBOT_API_BASE_URL}${path}`;
}

function initApp() {
    console.log("Initializing website...");
    
    // Set up event listeners for all buttons
    setupEventListeners();
    
    // Initialize language functionality
    initLanguage();
    
    // Initialize survey functionality
    initSurvey();

    // Initialize chatbot functionality 
    initChatbot();

    // Initialize form handling
    initForm();
    
    console.log("App initialized!");
}

function setupEventListeners() {
    // Navigation buttons
    document.querySelectorAll('.nav-btn').forEach(button => {
        button.addEventListener('click', function() {
            const sectionId = this.getAttribute('data-section');
            showSection(sectionId);
        });
    });
    
    // Language buttons/links
    document.querySelectorAll('.lang-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href) {
                return; // allow normal navigation
            }
            e.preventDefault();
            const lang = this.getAttribute('data-lang');
            changeLanguage(lang);
        });
    });
    
    // Quick link cards
    document.querySelectorAll('.link-card').forEach(card => {
        card.addEventListener('click', function() {
            const sectionId = this.getAttribute('data-section');
            showSection(sectionId);
        });
    });
}

// Form Submission Handling
function initForm() {
    const form = document.getElementById('website-feedback-form');
    const successMessage = document.getElementById('form-success');
    const errorMessage = document.getElementById('form-error');
    
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Show loading state
            const submitBtn = form.querySelector('.submit-btn');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
            submitBtn.disabled = true;
            
            try {
                // Create FormData object
                const formData = new FormData(form);
                
                // Submit the form using fetch API
                const response = await fetch(form.action, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });
                
                if (response.ok) {
                    // Show success message
                    successMessage.style.display = 'block';
                    errorMessage.style.display = 'none';
                    form.reset();
                    
                    // Scroll to success message
                    successMessage.scrollIntoView({ behavior: 'smooth' });
                    
                    // Hide form after success
                    form.style.display = 'none';
                    
                    // Auto-hide success message after 10 seconds (optional)
                    setTimeout(() => {
                        successMessage.style.display = 'none';
                        form.style.display = 'block';
                    }, 10000);
                    
                } else {
                    throw new Error('Form submission failed');
                }
            } catch (error) {
                console.error('Error:', error);
                
                // Show error message
                errorMessage.style.display = 'block';
                successMessage.style.display = 'none';
                
                // Scroll to error message
                errorMessage.scrollIntoView({ behavior: 'smooth' });
                
            } finally {
                // Reset button state
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }
    
    // Add click handlers for form radio/checkbox labels
    document.querySelectorAll('.option-label, .scale-label').forEach(label => {
        label.addEventListener('click', function() {
            const input = this.querySelector('input');
            if (input && input.type === 'radio') {
                // For radio buttons, uncheck others in same group
                const groupName = input.name;
                document.querySelectorAll(`input[name="${groupName}"]`).forEach(radio => {
                    radio.closest('.option-label, .scale-label')?.classList.remove('selected');
                });
            }
            
            // Toggle selected class for visual feedback
            if (input) {
                this.classList.toggle('selected', input.type === 'checkbox' ? input.checked : true);
            }
        });
    });
}

function initLanguage() {
    // Language Management
    window.currentLanguage = document.documentElement.lang || 'en';
    window.translations = {
        en: {
            title: "Health Literacy for Refugee Communities",
            subtitle: "Accessible health information for refugees in Clarkston, Georgia"
        },
        ar: {
            title: "محو الأمية الصحية لمجتمعات اللاجئين",
            subtitle: "معلومات صحية سهلة الوصول للاجئين في كلاركستون، جورجيا"
        },
        ps: {
            title: "د روغتیا سواد د کډوالو ټولنو لپاره",
            subtitle: "د کلارکستون، جورجیا د کډوالو لپاره د روغتیا معلومات"
        },
        my: {
            title: "ဒုက္ခသည်များအတွက် ကျန်းမာရေးအချက်အလက်များ",
            subtitle: "ဂျော်ဂျီယာပြည်နယ်၊ Clarkston ရှိ ဒုက္ခသည်များအတွက် ကျန်းမာရေးအချက်အလက်များ"
        }
    };

    // Apply initial UI translations
    applyTranslations(window.currentLanguage);

    // Apply automatic translation to remaining content
    autoTranslatePage(window.currentLanguage);
}

function initSurvey() {
    window.surveyData = {
        timeInAmerica: '',
        sicknessFrequency: '',
        illnesses: [],
        infoChallenges: '',
        doctorChallenges: []
    };
}

// Section Navigation
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active class from all nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(sectionId).classList.add('active');
    
    // Set active nav button
    const activeButton = document.querySelector(`.nav-btn[data-section="${sectionId}"]`);
    if (activeButton) {
        activeButton.classList.add('active');
    }
}

// Language Functions
function changeLanguage(lang) {
    window.currentLanguage = lang;
    document.documentElement.lang = lang;
    
    // Update active button
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const langButton = document.querySelector(`.lang-btn[data-lang="${lang}"]`);
    if (langButton) {
        langButton.classList.add('active');
    }
    
    // Update text content
    if (window.translations[lang]) {
        document.getElementById('title').textContent = window.translations[lang].title;
        document.getElementById('subtitle').textContent = window.translations[lang].subtitle;
    }
    
    // Set direction for RTL languages
    if (lang === 'ar' || lang === 'ps') {
        document.body.setAttribute('dir', 'rtl');
    } else {
        document.body.removeAttribute('dir');
    }
    
    // Update chatbot greeting to selected language
    updateChatbotGreeting(lang);

    // Update UI text
    applyTranslations(lang);

    // Update remaining content
    autoTranslatePage(lang);
}

function getLanguageName(code) {
    const names = {
        en: 'English',
        ar: 'Arabic',
        ps: 'Pashto',
        my: 'Burmese'
    };
    return names[code] || 'English';
}

// =====================================
// CHATBOT FUNCTIONS
// =====================================

function initChatbot() {
    console.log("Initializing Health Chatbot...");
    
    // Get elements
    const toggleBtn = document.getElementById('chatbotToggle');
    const container = document.getElementById('chatbotContainer');
    const closeBtn = document.getElementById('closeChatbot');
    const sendBtn = document.getElementById('sendChatbotMessage');
    const userInput = document.getElementById('chatbotInput');
    const messagesDiv = document.getElementById('chatbotMessages');
    
    if (!toggleBtn || !container || !sendBtn || !userInput || !messagesDiv) {
        console.error("Chatbot elements not found!");
        return;
    }
    
    console.log("Chatbot elements found");
    
    // Track if we've already initialized
    if (window.chatbotInitialized) {
        console.log("Chatbot already initialized, skipping...");
        return;
    }
    window.chatbotInitialized = true;
    
    // Toggle chatbot visibility
    toggleBtn.addEventListener('click', () => {
        container.classList.toggle('active');
        if (container.classList.contains('active')) {
            userInput.focus();
        }
    });
    
    // Close chatbot
    closeBtn.addEventListener('click', () => {
        container.classList.remove('active');
    });
    
    // Send message function
    const handleSendMessage = async () => {
        const message = userInput.value.trim();
        console.log('Send button clicked, message:', message);
        
        if (!message) {
            alert('Please type a message first!');
            return;
        }
        
        // Add user message
        if (!chatHistory[window.currentLanguage]) chatHistory[window.currentLanguage] = [];
        chatHistory[window.currentLanguage].push({ sender: 'user', text: message });
        addMessage(message, 'user');
        userInput.value = '';
        
        // Show typing indicator
        showTyping();
        
        try {
            const responseText = sanitizeResponse(await queryChatbot(message));
            hideTyping();
            chatHistory[window.currentLanguage].push({ sender: 'bot', text: responseText });
            addMessage(responseText, 'bot');
            
        } catch (error) {
            console.error('Chatbot error:', error);
            hideTyping();
            const fallback = getLocalHealthResponse(message, window.currentLanguage || 'en');
            const fallbackText = `Sorry, I'm having trouble reaching the AI right now. Here's some info that may help: ${fallback}`;
            chatHistory[window.currentLanguage].push({ sender: 'bot', text: fallbackText });
            addMessage(fallbackText, 'bot');
        }
    };
    
    // Add event listeners
    sendBtn.addEventListener('click', handleSendMessage);
    
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Prevent form submission
            handleSendMessage();
        }
    });
    
    console.log("Chatbot initialized successfully!");

    // Initialize chat history per language and render
    initChatHistory(window.currentLanguage || 'en');
}

function applyTranslations(lang) {
    const ui = {
        en: {
            languageLabel: 'Language:',
            nav: {
                home: 'Home',
                illnesses: 'Common Illnesses',
                mental: 'Mental Health',
                nutrition: 'Nutrition',
                vaccines: 'Vaccines',
                resources: 'Free Clinics',
                survey: 'Health Survey',
                emergency: 'Emergency Help'
            },
            homeTitle: 'Welcome to Your Health Resource',
            homeDesc: 'This website provides health information specifically for refugee communities in Clarkston, Georgia. We focus on common illnesses, mental health support, nutrition guidance, and resources for accessing healthcare.',
            quickAccess: 'Quick Access:',
            quickLinks: {
                illnesses: 'Common Illnesses',
                resources: 'Free Clinics',
                mental: 'Mental Health',
                emergency: 'Emergency'
            },
            sectionTitles: {
                illnesses: 'Common Illnesses in Refugee Communities',
                mental: 'Mental Health Support',
                nutrition: 'Nutrition & Physical Health',
                vaccines: 'Important Vaccines',
                resources: 'Free & Low-Cost Clinics',
                survey: 'Health Survey',
                emergency: 'Emergency Help'
            },
            sectionSubtitles: {
                illnesses: 'Click on any illness to learn about symptoms, treatment, and prevention.'
            },
            chatbotHeader: 'Health Assistant',
            chatbotToggle: 'Health Assistant',
            chatbotPlaceholder: 'Type your health question here...'
        },
        ar: {
            languageLabel: 'اللغة:',
            nav: {
                home: 'الرئيسية',
                illnesses: 'أمراض شائعة',
                mental: 'الصحة النفسية',
                nutrition: 'التغذية',
                vaccines: 'اللقاحات',
                resources: 'عيادات مجانية',
                survey: 'استبيان صحي',
                emergency: 'مساعدة طارئة'
            },
            homeTitle: 'مرحبًا بك في موردك الصحي',
            homeDesc: 'يوفر هذا الموقع معلومات صحية مخصصة لمجتمعات اللاجئين في كلاركستون، جورجيا. نركز على الأمراض الشائعة ودعم الصحة النفسية وإرشادات التغذية والموارد للوصول إلى الرعاية الصحية.',
            quickAccess: 'وصول سريع:',
            quickLinks: {
                illnesses: 'أمراض شائعة',
                resources: 'عيادات مجانية',
                mental: 'الصحة النفسية',
                emergency: 'الطوارئ'
            },
            sectionTitles: {
                illnesses: 'الأمراض الشائعة في مجتمعات اللاجئين',
                mental: 'دعم الصحة النفسية',
                nutrition: 'التغذية والصحة البدنية',
                vaccines: 'اللقاحات المهمة',
                resources: 'عيادات مجانية ومنخفضة التكلفة',
                survey: 'استبيان صحي',
                emergency: 'مساعدة طارئة'
            },
            sectionSubtitles: {
                illnesses: 'انقر على أي مرض لمعرفة الأعراض والعلاج والوقاية.'
            },
            chatbotHeader: 'مساعد الصحة',
            chatbotToggle: 'مساعد الصحة',
            chatbotPlaceholder: 'اكتب سؤالك الصحي هنا...'
        },
        ps: {
            languageLabel: 'ژبه:',
            nav: {
                home: 'کور',
                illnesses: 'عامې ناروغۍ',
                mental: 'ذهني روغتیا',
                nutrition: 'تغذیه',
                vaccines: 'واکسینونه',
                resources: 'وړیا کلینیکونه',
                survey: 'روغتیايي سروې',
                emergency: 'بیړنۍ مرسته'
            },
            homeTitle: 'ستاسو د روغتیا سرچینې ته ښه راغلاست',
            homeDesc: 'دا ویبپاڼه په کلارکستون، جورجیا کې د کډوالو ټولنو لپاره روغتیايي معلومات وړاندې کوي. موږ پر عامو ناروغیو، د ذهني روغتیا ملاتړ، د تغذیې لارښوونې، او د روغتیايي خدمتونو د لاسرسي سرچینو تمرکز کوو.',
            quickAccess: 'چټک لاسرسی:',
            quickLinks: {
                illnesses: 'عامې ناروغۍ',
                resources: 'وړیا کلینیکونه',
                mental: 'ذهني روغتیا',
                emergency: 'بیړنۍ'
            },
            sectionTitles: {
                illnesses: 'په کډوالو ټولنو کې عامې ناروغۍ',
                mental: 'د ذهني روغتیا ملاتړ',
                nutrition: 'تغذیه او بدني روغتیا',
                vaccines: 'مهم واکسینونه',
                resources: 'وړیا او ټیټ لګښت کلینیکونه',
                survey: 'روغتیايي سروې',
                emergency: 'بیړنۍ مرسته'
            },
            sectionSubtitles: {
                illnesses: 'د هرې ناروغۍ په اړه د نښو، درملنې او مخنیوي لپاره کلیک وکړئ.'
            },
            chatbotHeader: 'روغتیا مرستیال',
            chatbotToggle: 'روغتیا مرستیال',
            chatbotPlaceholder: 'خپل روغتیايي پوښتنه دلته ولیکئ...'
        },
        my: {
            languageLabel: 'ဘာသာစကား:',
            nav: {
                home: 'မူလ',
                illnesses: 'အဖြစ်များသောရောဂါများ',
                mental: 'စိတ်ကျန်းမာရေး',
                nutrition: 'အာဟာရ',
                vaccines: 'ကာကွယ်ဆေးများ',
                resources: 'အခမဲ့ဆေးခန်းများ',
                survey: 'ကျန်းမာရေးစစ်တမ်း',
                emergency: 'အရေးပေါ်အကူအညီ'
            },
            homeTitle: 'သင့်ကျန်းမာရေး အရင်းအမြစ်သို့ ကြိုဆိုပါသည်',
            homeDesc: 'ဤဝဘ်ဆိုဒ်သည် Georgia ပြည်နယ် Clarkston ရှိ ဒုက္ခသည်အသိုင်းအဝိုင်းများအတွက် ကျန်းမာရေးအချက်အလက်များကို ပေးပါသည်။ အဖြစ်များသောရောဂါများ၊ စိတ်ကျန်းမာရေးအကူအညီ၊ အာဟာရလမ်းညွှန်နှင့် ကျန်းမာရေးဝန်ဆောင်မှုများကို ရယူရန် အရင်းအမြစ်များကို အလေးထားထားပါသည်။',
            quickAccess: 'လျင်မြန်စွာ ရယူရန်:',
            quickLinks: {
                illnesses: 'အဖြစ်များသောရောဂါများ',
                resources: 'အခမဲ့ဆေးခန်းများ',
                mental: 'စိတ်ကျန်းမာရေး',
                emergency: 'အရေးပေါ်'
            },
            sectionTitles: {
                illnesses: 'ဒုက္ခသည်အသိုင်းအဝိုင်းများတွင် အဖြစ်များသောရောဂါများ',
                mental: 'စိတ်ကျန်းမာရေးအကူအညီ',
                nutrition: 'အာဟာရနှင့် ကိုယ်ခန္ဓာကျန်းမာရေး',
                vaccines: 'အရေးကြီးကာကွယ်ဆေးများ',
                resources: 'အခမဲ့နှင့် စျေးသက်သာသော ဆေးခန်းများ',
                survey: 'ကျန်းမာရေးစစ်တမ်း',
                emergency: 'အရေးပေါ်အကူအညီ'
            },
            sectionSubtitles: {
                illnesses: 'ရောဂါတစ်ခုကို နှိပ်၍ လက္ခဏာများ၊ ကုသမှုနှင့် ကာကွယ်မှုအကြောင်းကို ကြည့်ပါ။'
            },
            chatbotHeader: 'ကျန်းမာရေး အကူအညီပေးသူ',
            chatbotToggle: 'ကျန်းမာရေး အကူအညီပေးသူ',
            chatbotPlaceholder: 'သင့်ကျန်းမာရေး မေးခွန်းကို ဤနေရာတွင် ရိုက်ပါ...'
        }
    };
    
    const t = ui[lang] || ui.en;
    const langLabel = document.querySelector('.language-selector span');
    if (langLabel) langLabel.textContent = t.languageLabel;

    Object.entries(t.nav).forEach(([key, value]) => {
        const btn = document.querySelector(`.nav-btn[data-section="${key}"]`);
        if (btn) btn.textContent = value;
    });
    
    const homeTitle = document.querySelector('#home h2');
    if (homeTitle) homeTitle.textContent = t.homeTitle;
    const homeDesc = document.querySelector('#home p');
    if (homeDesc) homeDesc.textContent = t.homeDesc;
    const quickAccess = document.querySelector('#home .quick-links h3');
    if (quickAccess) quickAccess.textContent = t.quickAccess;
    
    Object.entries(t.quickLinks).forEach(([key, value]) => {
        const link = document.querySelector(`.link-card[data-section="${key}"] span`);
        if (link) link.textContent = value;
    });
    
    Object.entries(t.sectionTitles).forEach(([key, value]) => {
        const title = document.querySelector(`#${key} h2`);
        if (title) title.textContent = value;
    });
    Object.entries(t.sectionSubtitles).forEach(([key, value]) => {
        const subtitle = document.querySelector(`#${key} > p`);
        if (subtitle) subtitle.textContent = value;
    });
    
    const chatHeader = document.querySelector('.chatbot-header h3');
    if (chatHeader) {
        chatHeader.innerHTML = `<i class="fas fa-robot"></i> ${t.chatbotHeader}`;
    }
    const chatToggle = document.querySelector('#chatbotToggle span');
    if (chatToggle) chatToggle.textContent = t.chatbotToggle;
    const chatInput = document.getElementById('chatbotInput');
    if (chatInput) chatInput.placeholder = t.chatbotPlaceholder;
}

const translationCache = {};

function getTranslatableElements() {
    const root = document.querySelector('.container');
    const footer = document.querySelector('footer');
    const nodes = [];
    const selectors = ['h2', 'h3', 'h4', 'p', 'li', 'span', 'label', 'button'];
    const collectFrom = [root, footer].filter(Boolean);
    
    for (const container of collectFrom) {
        selectors.forEach(sel => {
            container.querySelectorAll(sel).forEach(el => nodes.push(el));
        });
    }
    
    return nodes.filter(el => {
        if (!el || !el.textContent) return false;
        const text = el.textContent.trim();
        if (!text) return false;
        if (el.closest('.language-selector')) return false;
        if (el.closest('.nav-container')) return false;
        if (el.closest('.chatbot-container')) return false;
        if (el.closest('.chatbot-toggle')) return false;
        if (el.id === 'title' || el.id === 'subtitle') return false;
        if (el.classList.contains('lang-btn')) return false;
        if (el.classList.contains('nav-btn')) return false;
        if (/^[0-9\s\-()+.,]+$/.test(text)) return false;
        return true;
    });
}

async function autoTranslatePage(lang) {
    if (lang === 'en') {
        restoreOriginalText();
        return;
    }
    
    const elements = getTranslatableElements();
    const strings = elements.map(el => {
        if (!el.dataset.originalText) {
            el.dataset.originalText = el.textContent.trim();
        }
        return el.dataset.originalText;
    });
    
    if (!strings.length) return;
    
    const cacheKey = `${lang}:${strings.join('|')}`;
    if (translationCache[cacheKey]) {
        applyTranslationsToElements(elements, translationCache[cacheKey]);
        return;
    }
    
    const batches = [];
    const batchSize = 10;
    for (let i = 0; i < strings.length; i += batchSize) {
        batches.push(strings.slice(i, i + batchSize));
    }
    
    const translated = [];
    for (const batch of batches) {
        const result = await translateStrings(batch, lang);
        translated.push(...result);
    }
    
    translationCache[cacheKey] = translated;
    applyTranslationsToElements(elements, translated);
}

function applyTranslationsToElements(elements, translations) {
    elements.forEach((el, idx) => {
        const text = translations[idx];
        if (typeof text === 'string') {
            el.textContent = text;
        }
    });
}

function restoreOriginalText() {
    const elements = getTranslatableElements();
    elements.forEach(el => {
        if (el.dataset.originalText) {
            el.textContent = el.dataset.originalText;
        }
    });
}

async function translateStrings(strings, lang) {
    const response = await fetch(buildApiUrl('/api/translate'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ strings, lang })
    });
    
    const data = await response.json();
    if (!response.ok || !data?.translations) {
        console.error('Translate error:', data);
        return strings;
    }
    return data.translations;
}

async function queryChatbot(message) {
    const response = await fetch(buildApiUrl('/api/chat'), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt: message, lang: window.currentLanguage || 'en' })
    });
    
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data?.error || 'API error');
    }
    if (!data?.text) {
        throw new Error('No response text');
    }
    return data.text;
}

// Message helper functions
function addMessage(text, sender) {
    const messagesDiv = document.getElementById('chatbotMessages');
    if (!messagesDiv) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const messageContent = document.createElement('p');
    messageContent.textContent = text;
    messageDiv.appendChild(messageContent);
    
    messagesDiv.appendChild(messageDiv);
    
    // Scroll to bottom
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function updateChatbotGreeting(lang) {
    const greetings = {
        en: "Hello! I'm your health information assistant. I can help answer questions about common illnesses, mental health, nutrition, vaccines, and local resources in Clarkston. How can I help you today?",
        ar: "مرحبًا! أنا مساعد المعلومات الصحية. يمكنني المساعدة في الإجابة عن أسئلة حول الأمراض الشائعة والصحة النفسية والتغذية واللقاحات والموارد المحلية في كلاركستون. كيف يمكنني مساعدتك اليوم؟",
        ps: "سلام! زه ستاسو د روغتیا معلوماتو مرستندوی یم. زه کولی شم د عامو ناروغیو، رواني روغتیا، تغذیې، واکسینونو، او په کلارکستون کې د ځایي منابعو په اړه پوښتنې ځواب کړم. نن څنګه مرسته وکړم؟",
        my: "မင်္ဂလာပါ! ကျွန်ုပ်သည် ကျန်းမာရေးအချက်အလက်အကူအညီပေးသူဖြစ်ပါသည်။ အဖြစ်များသောရောဂါများ၊ စိတ်ကျန်းမာရေး၊ အာဟာရ၊ ကာကွယ်ဆေးများ နှင့် Clarkston ရှိ ဒေသဆိုင်ရာ အထောက်အပံ့များအကြောင်း မေးခွန်းများကို ဖြေကြားနိုင်ပါသည်။ ယနေ့ ဘယ်လိုကူညီပေးရမလဲ။"
    };
    const text = greetings[lang] || greetings.en;
    setGreetingForLanguage(lang, text);
    renderChatHistory(lang);
}

const chatHistory = {};

function initChatHistory(lang) {
    if (!chatHistory[lang]) {
        chatHistory[lang] = [];
    }
    // Ensure a greeting exists
    updateChatbotGreeting(lang);
}

function setGreetingForLanguage(lang, greetingText) {
    if (!chatHistory[lang]) chatHistory[lang] = [];
    const history = chatHistory[lang];
    if (history.length === 0 || history[0].sender !== 'bot') {
        history.unshift({ sender: 'bot', text: greetingText });
    } else {
        history[0].text = greetingText;
    }
}

function renderChatHistory(lang) {
    const messagesDiv = document.getElementById('chatbotMessages');
    if (!messagesDiv) return;
    messagesDiv.innerHTML = '';
    const history = chatHistory[lang] || [];
    history.forEach(msg => {
        addMessage(msg.text, msg.sender);
    });
}

function showTyping() {
    const messagesDiv = document.getElementById('chatbotMessages');
    if (!messagesDiv) return;
    
    const typingDiv = document.createElement('div');
    typingDiv.id = 'typing-indicator';
    typingDiv.className = 'typing-indicator';
    typingDiv.innerHTML = `
        <span></span>
        <span></span>
        <span></span>
    `;
    messagesDiv.appendChild(typingDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function hideTyping() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) indicator.remove();
}

// Local response system - NO API CALLS
function getLocalHealthResponse(userMessage, language) {
    const lowerMessage = userMessage.toLowerCase();
    
    // Define comprehensive health responses
    const responses = {
        'flu': {
            'en': "Influenza (flu) symptoms include: fever, cough, sore throat, runny nose, muscle aches, headaches, fatigue. Rest, drink fluids, use fever reducers. Get the flu vaccine yearly for prevention.",
            'ar': "أعراض الإنفلونزا تشمل: الحمى، السعال، التهاب الحلق، سيلان الأنف، آلام العضلات، الصداع، التعب. الراحة، شرب السوائل، استخدام خافضات الحرارة. احصل على لقاح الإنفلونزا سنويًا للوقاية.",
            'ps': "د انفلونزا نښې شامل دي: تبه، ږيره، د غاښونو سوزش، د پوزې بهیدل، د عضلاتو دردی، سر دردی، ستړیا. آرام، اوبه څښل، د تبی راکمولو کارول. د انفلونزا واکسین کالني د مخنیوي لپاره ترلاسه کړئ.",
            'my': "တုပ်ကွေးလက္ခဏာများမှာ- ဖျားခြင်း၊ ချောင်းဆိုးခြင်း၊ လည်ချောင်းနာခြင်း၊ နှာရည်ယိုခြင်း၊ ကြွက်သားနာခြင်း၊ ခေါင်းကိုက်ခြင်း၊ ပင်ပန်းနွမ်းနယ်ခြင်း။ အနားယူပါ၊ အရည်များများသောက်ပါ၊ အဖျားကျဆေးများသုံးပါ။ ကာကွယ်ရန်အတွက် နှစ်စဉ်တုပ်ကွေးကာကွယ်ဆေးထိုးပါ။"
        },
        'fever': {
            'en': "Fever is body temperature above 100.4°F (38°C). Rest, drink fluids, use acetaminophen or ibuprofen. See a doctor if: fever lasts >3 days, temperature >104°F (40°C), or with severe symptoms.",
            'ar': "الحمى هي درجة حرارة الجسم فوق 100.4°ف (38°م). الراحة، شرب السوائل، استخدام الأسيتامينوفين أو الإيبوبروفين. راجع الطبيب إذا: استمرت الحمى أكثر من 3 أيام، درجة الحرارة فوق 104°ف (40°م)، أو مع أعراض شديدة.",
            'ps': "تبه د بدن تودوخه د 100.4°F (38°C) څخه پورته ده. آرام، اوبه څښل، ایسیټامینوفین یا ایبوپروفین کارول. که چیرې: تبه 3 ورځې ډیر پاتې شي، تودوخه 104°F (40°C) څخه پورته شي، یا سختې نښې سره ولیدل شو، ډاکټر وګورئ.",
            'my': "အဖျားသည် ခန္ဓာကိုယ်အပူချိန် 100.4°F (38°C) အထက်ဖြစ်သည်။ အနားယူပါ၊ အရည်များများသောက်ပါ၊ acetaminophen သို့မဟုတ် ibuprofen သုံးပါ။ ဆရာဝန်ပြပါ- အဖျား ၃ ရက်ထက် ကြာပါက၊ အပူချိန် 104°F (40°C) အထက်ဖြစ်ပါက၊ သို့မဟုတ် ပြင်းထန်သောလက္ခဏာများရှိပါက။"
        },
        'clinic': {
            'en': "Clarkston Community Health Center: 3700 Market Street, Clarkston. Phone: (404) 501-7900. Services: primary care, pediatrics, women's health. Sliding scale fees based on income.",
            'ar': "مركز كلاركستون المجتمعي الصحي: 3700 شارع ماركت، كلاركستون. الهاتف: (404) 501-7900. الخدمات: الرعاية الأولية، طب الأطفال، صحة المرأة. الرسوم حسب الدخل.",
            'ps': "د کلارکستون ټولنیز روغتیا مرکز: 3700 مارکیټ سړک، کلارکستون. تلیفون: (404) 501-7900. خدمتونه: لومړنی پاملرنه، ماشومانو درمل، د ښځو روغتیا. د عاید پر بنسټ فیس.",
            'my': "Clarkston Community Health Center: 3700 Market Street, Clarkston။ ဖုန်း: (404) 501-7900။ ဝန်ဆောင်မှုများ- အခြေခံကျန်းမာရေး၊ ကလေးကျန်းမာရေး၊ အမျိုးသမီးကျန်းမာရေး။ ဝင်ငွေအလိုက် ကြေးနှုန်းများ။"
        },
        'mental': {
            'en': "Mental health support: 1. Crisis Hotline: Dial 988 (24/7 free support). 2. Refugee Mental Health Program in Clarkston: Free counseling available. 3. Community support groups weekly.",
            'ar': "دعم الصحة العقلية: 1. خط المساعدة في الأزمات: اطلب 988 (دعم مجاني على مدار الساعة). 2. برنامج الصحة العقلية للاجئين في كلاركستون: استشارات مجانية متاحة. 3. مجموعات الدعم المجتمعي أسبوعيًا.",
            'ps': "د ذهني روغتیا ملاتړ: 1. د بحران تلیفون: 988 ډایل کړئ (24/7 وړیا ملاتړ). 2. په کلارکستون کې د کډوالو د ذهني روغتیا برنامه: وړیا مشورې شتون لري. 3. ټولنیز ملاتړ ډلې اونیز.",
            'my': "စိတ်ကျန်းမာရေးအထောက်အပံ့- ၁။ အရေးပေါ်လိုင်း- ၉၈၈ ခေါ်ပါ (၂၄/၇ အခမဲ့အထောက်အပံ့)။ ၂။ Clarkston ရှိ ဒုက္ခသည်စိတ်ကျန်းမာရေးအစီအစဉ်- အခမဲ့အကြံပေးခြင်းရရှိနိုင်ပါသည်။ ၃။ အသိုင်းအဝိုင်းအထောက်အပံ့အဖွဲ့များ အပတ်စဉ်။"
        },
        'vaccine': {
            'en': "Free vaccines at DeKalb County Board of Health: (404) 294-3700, 440 Winn Way, Decatur. Available: COVID-19, flu, MMR, hepatitis B, and childhood vaccines. No insurance needed.",
            'ar': "لقاحات مجانية في مجلس صحة مقاطعة دي كالب: (404) 294-3700، 440 وين واي، ديكاتور. متوفر: كوفيد-19، الإنفلونزا، MMR، التهاب الكبد B، ولقاحات الأطفال. لا حاجة للتأمين.",
            'ps': "د DeKalb کاونټي د روغتیا بورډ کې وړیا واکسین: (404) 294-3700، 440 Winn Way، Decatur. شتون لري: COVID-19، انفلونزا، MMR، هپاتایټس B، او ماشومانو واکسین. بیمې ته اړتیا نشته.",
            'my': "DeKalb County Board of Health တွင် အခမဲ့ကာကွယ်ဆေးများ- (404) 294-3700၊ 440 Winn Way၊ Decatur။ ရရှိနိုင်သည်- COVID-19၊ တုပ်ကွေး၊ MMR၊ အသည်းရောင် B၊ နှင့် ကလေးများအတွက် ကာကွယ်ဆေးများ။ အာမခံမလိုအပ်ပါ။"
        },
        'default': {
            'en': "I can help with: flu symptoms, fever, clinic locations, mental health support, vaccines, nutrition, TB, malaria, hepatitis. Try asking about a specific health topic!",
            'ar': "يمكنني المساعدة في: أعراض الإنفلونزا، الحمى، مواقع العيادات، دعم الصحة العقلية، اللقاحات، التغذية، السل، الملاريا، التهاب الكبد. حاول أن تسأل عن موضوع صحي محدد!",
            'ps': "زه مرسته کولی شم په: د انفلونزا نښې، تبه، د کلینیک موقعیتونه، د ذهني روغتیا ملاتړ، واکسینونه، تغذیه، سل، ملاریا، هپاتایټس. هڅه وکړئ چې د روغتیا په اړه یو مشخص موضوع وپوښتئ!",
            'my': "ကျွန်ုပ်ကူညီနိုင်သည်- တုပ်ကွေးလက္ခဏာများ၊ အဖျား၊ ဆေးခန်းနေရာများ၊ စိတ်ကျန်းမာရေးအထောက်အပံ့၊ ကာကွယ်ဆေးများ၊ အာဟာရ၊ တီဘီ၊ ငှက်ဖျား၊ အသည်းရောင်။ တိကျသောကျန်းမာရေးခေါင်းစဉ်တစ်ခုအကြောင်းမေးမြန်းကြည့်ပါ။"
        }
    };
    
    // Check keywords
    if (lowerMessage.includes('flu') || lowerMessage.includes('influenza')) {
        return responses.flu[language] || responses.flu.en;
    }
    if (lowerMessage.includes('fever') || lowerMessage.includes('temperature')) {
        return responses.fever[language] || responses.fever.en;
    }
    if (lowerMessage.includes('clinic') || lowerMessage.includes('doctor') || 
        lowerMessage.includes('hospital') || lowerMessage.includes('medical')) {
        return responses.clinic[language] || responses.clinic.en;
    }
    if (lowerMessage.includes('mental') || lowerMessage.includes('depress') || 
        lowerMessage.includes('anxiety') || lowerMessage.includes('stress')) {
        return responses.mental[language] || responses.mental.en;
    }
    if (lowerMessage.includes('vaccine') || lowerMessage.includes('immuniz') || 
        lowerMessage.includes('shot') || lowerMessage.includes('covid')) {
        return responses.vaccine[language] || responses.vaccine.en;
    }
    if (lowerMessage.includes('tb') || lowerMessage.includes('tuberculosis')) {
        return "Tuberculosis (TB) symptoms: cough lasting 3+ weeks, chest pain, coughing up blood, weight loss, fever, night sweats. Treatment: 6-9 months of antibiotics. Free testing available at health department.";
    }
    if (lowerMessage.includes('malaria')) {
        return "Malaria symptoms: high fever, chills, headache, nausea, muscle pain. Spread by mosquitoes. Prevention: mosquito nets, insect repellent. Seek immediate treatment if suspected.";
    }
    if (lowerMessage.includes('hepatitis') || lowerMessage.includes('liver')) {
        return "Hepatitis B symptoms: abdominal pain, dark urine, fever, joint pain, loss of appetite, nausea, yellow skin. Prevention: hepatitis B vaccine (3 doses).";
    }
    if (lowerMessage.includes('nutrition') || lowerMessage.includes('food') || 
        lowerMessage.includes('eat') || lowerMessage.includes('diet')) {
        return "Nutrition tips: Eat beans/lentils (protein), eggs, seasonal vegetables, whole grains. Food assistance: SNAP benefits, WIC program, Clarkston Food Pantry (open Tues/Thurs).";
    }
    if (lowerMessage.includes('emergency') || lowerMessage.includes('911') || 
        lowerMessage.includes('urgent')) {
        return "Emergency: Call 911 for life-threatening situations. Nearest hospital: Emory Decatur Hospital, 2701 N Decatur Road. Emergency Department: (404) 501-1000.";
    }
    
    // Default response
    return responses.default[language] || responses.default.en;
}

function sanitizeResponse(text) {
    if (!text) return '';
    let cleaned = String(text);
    cleaned = cleaned.replace(/\*\*(.*?)\*\*/g, '$1');
    cleaned = cleaned.replace(/__([^_]+)__/g, '$1');
    cleaned = cleaned.replace(/`([^`]+)`/g, '$1');
    cleaned = cleaned.replace(/\*+/g, '');
    cleaned = cleaned.replace(/#+\s*/g, '');
    cleaned = cleaned.replace(/\s{2,}/g, ' ');
    return cleaned.trim();
}
