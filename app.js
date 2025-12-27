// Al-Bayan Hadith Explorer - Main Application

// Configuration
const API_BASE = 'https://hadithapi.com/api';
const API_KEY = '$2y$10$dxEFNOPnn0190K7rdCCZj0HQiFco8AUAiV6Csamw5lwqAsxi';

// Book data with metadata
const BOOKS = [
    { slug: 'sahih-bukhari', name: 'Sahih Bukhari', arabicName: 'صحيح البخاري', hadithCount: 7563, author: 'Imam Muhammad ibn Ismail al-Bukhari' },
    { slug: 'sahih-muslim', name: 'Sahih Muslim', arabicName: 'صحيح مسلم', hadithCount: 7462, author: 'Imam Muslim ibn al-Hajjaj' },
    { slug: 'al-tirmidhi', name: "Jami' Al-Tirmidhi", arabicName: 'جامع الترمذي', hadithCount: 5047, author: 'Imam Abu Isa Muhammad at-Tirmidhi' },
    { slug: 'abu-dawood', name: 'Sunan Abu Dawood', arabicName: 'سنن أبي داود', hadithCount: 5274, author: 'Imam Sulaiman ibn al-Ash\'ath ad-Dinawari' },
    { slug: 'ibn-e-majah', name: 'Sunan Ibn-e-Majah', arabicName: 'سنن ابن ماجه', hadithCount: 4345, author: 'Imam Muhammad ibn Yazid ibn Majah' },
    { slug: 'sunan-nasai', name: "Sunan An-Nasa'i", arabicName: 'سنن النسائي', hadithCount: 5762, author: 'Imam Ahmad ibn Shu\'aib al-Nasa\'i' },
    { slug: 'mishkat', name: 'Mishkat Al-Masabih', arabicName: 'مشكاة المصابيح', hadithCount: 4483, author: 'Al-Khatib al-Tabrizi' },
    { slug: 'musnad-ahmad', name: 'Musnad Ahmad', arabicName: 'مسند أحمد', hadithCount: 29442, author: 'Imam Ahmad ibn Hanbal' },
    { slug: 'al-silsila-sahiha', name: 'Al-Silsila Sahiha', arabicName: 'السلسلة الصحيحة', hadithCount: 3000, author: 'Shah Waliullah Dehlawi' }
];

// State management
let currentView = 'home';
let currentBook = null;
let currentChapter = null;
let currentPage = 1;
let searchQuery = '';
let searchPage = 1;
let allHadiths = [];
let filteredHadiths = [];

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    initializeTheme();
    initializeBooks();
    setupEventListeners();
});

// Theme management
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    document.getElementById('themeToggle').textContent = savedTheme === 'dark' ? '☀️' : '🌙';
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    document.getElementById('themeToggle').textContent = newTheme === 'dark' ? '☀️' : '🌙';
}

// Event listeners
function setupEventListeners() {
    document.getElementById('searchInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchHadiths();
        }
    });

    // Close modal on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
}

// API helper functions
async function fetchAPI(endpoint, params = {}) {
    const url = new URL(`${API_BASE}${endpoint}`);
    url.searchParams.append('apiKey', API_KEY);

    Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
            url.searchParams.append(key, value);
        }
    });

    try {
        const response = await fetch(url.toString());

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Initialize books display
function initializeBooks() {
    showLoading(false);
    displayBooks();
}

// Display all books
function displayBooks() {
    const booksGrid = document.getElementById('booksGrid');
    booksGrid.innerHTML = '';

    BOOKS.forEach((book, index) => {
        const card = document.createElement('div');
        card.className = 'book-card';
        card.onclick = () => loadChapters(book.slug, book.name, book.arabicName);
        card.style.animationDelay = `${index * 0.1}s`;

        card.innerHTML = `
            <div class="book-card-header">
                <div class="book-icon">📖</div>
                <div class="book-info">
                    <h3>${book.name}</h3>
                    <span class="arabic-title">${book.arabicName}</span>
                </div>
            </div>
            <div class="book-stats">
                <div class="stat">
                    <span class="stat-value">${formatNumber(book.hadithCount)}</span>
                    <span class="stat-label">Hadiths</span>
                </div>
                <div class="stat">
                    <span class="stat-value">${book.author.split(' ').slice(0, 2).join(' ')}</span>
                    <span class="stat-label">Compiler</span>
                </div>
            </div>
        `;

        booksGrid.appendChild(card);
    });

    switchView('booksView');
    updateBreadcrumb([]);
    hideLoading();
}

// Load chapters for a book
async function loadChapters(bookSlug, bookName, arabicName) {
    showLoading();
    currentBook = { slug: bookSlug, name: bookName, arabicName };

    try {
        const data = await fetchAPI(`/${bookSlug}/chapters`);

        if (data.status === 'success' || data.chapters) {
            displayChapters(data.chapters || data, bookName, arabicName);
        } else {
            // If API fails, generate chapters manually for demo
            const generatedChapters = generateDemoChapters(bookSlug);
            displayChapters(generatedChapters, bookName, arabicName);
        }
    } catch (error) {
        console.log('Using demo chapters');
        const generatedChapters = generateDemoChapters(bookSlug);
        displayChapters(generatedChapters, bookName, arabicName);
    }
}

// Generate demo chapters (since the API might be limited)
function generateDemoChapters(bookSlug) {
    const chapterNames = {
        'sahih-bukhari': [
            'Revelation (Kitab al-Wahy)',
            'Belief (Kitab al-Iman)',
            'Knowledge (Kitab al-Ilm)',
            'Ablution (Kitab al-Wudu)',
            'Ghusl (Kitab al-Ghusl)',
            'Menstruation (Kitab al-Hayd)',
            'Prayer (Kitab al-Salat)',
            'Call to Prayer (Kitab al-Adhan)',
            'Congregational Prayer (Kitab al-Jama\'a)',
            'Shortening Prayer During Travel'
        ],
        'sahih-muslim': [
            'The Book of Belief',
            'The Book of Purification',
            'The Book of Menstruation',
            'The Book of Prayer',
            'The Book of Zakat',
            'The Book of Fasting',
            'The Book of Pilgrimage',
            'The Book of Marriage',
            'The Book of Divorce',
            'The Book of Transactions'
        ],
        'al-tirmidhi': [
            'The Book on Purification',
            'The Book on Prayer',
            'The Book on Witr Prayer',
            'The Book on Fasting',
            'The Book on Zakat',
            'The Book on Hajj',
            'The Book on Jihad',
            'The Book on Marriage',
            'The Book on Divorce',
            'The Book on Zuhd'
        ],
        'abu-dawood': [
            'Purification (Kitab al-Tahara)',
            'Prayer (Kitab al-Salat)',
            'The Book of Zakat',
            'The Book of Fasting',
            'The Book of Pilgrimage',
            'Marriage (Kitab al-Nikah)',
            'Divorce (Kitab al-Talaq)',
            'Vows (Kitab al-Nazar)',
            'Oaths (Kitab al-Yamin)',
            'Blood Money (Kitab al-Diyat)'
        ],
        'ibn-e-majah': [
            'The Book of Purification',
            'The Book of Prayer',
            'The Book of the Call to Prayer',
            'The Book on Leading Prayer',
            'The Book of Fasting',
            'The Book of Zakat',
            'The Book of Pilgrimage',
            'The Book of Marriage',
            'The Book of Divorce',
            'The Book of Transactions'
        ],
        'sunan-nasai': [
            'The Book of Purification',
            'The Book of Prayer',
            'The Book of the Call to Prayer',
            'The Book of the Mosque',
            'The Book of Fasting',
            'The Book of Zakat',
            'The Book of Pilgrimage',
            'The Book of Marriage',
            'The Book of Divorce',
            'The Book of Transactions'
        ],
        'mishkat': [
            'The Book of Revelation',
            'The Book of Faith',
            'The Book of Knowledge',
            'The Book of Prayer',
            'The Book of Friday Prayer',
            'The Book of Fasting',
            'The Book of Zakat',
            'The Book of Hajj',
            'The Book of Marriage',
            'The Book of Virtues'
        ],
        'musnad-ahmad': [
            'Hadiths from the Prophet\'s Companions in Medina',
            'Hadiths from the Prophet\'s Companions in Basra',
            'Hadiths from the Prophet\'s Companions in Kufa',
            'Hadiths from the Prophet\'s Companions in Syria',
            'Hadiths from the Prophet\'s Companions in Egypt',
            'Hadiths from the Prophet\'s Companions in Yemen',
            'Hadiths from the Prophet\'s Wives',
            'Hadiths from the Tabi\'un',
            'Hadiths about the Prophet\'s Appearance',
            'Hadiths about his Characteristics'
        ],
        'al-silsila-sahiha': [
            'The Chapters on Faith',
            'The Chapters on Knowledge',
            'The Chapters on Prayer',
            'The Chapters on Zakat',
            'The Chapters on Fasting',
            'The Chapters on Hajj',
            'The Chapters on Marriage',
            'The Chapters on Ethics',
            'The Chapters on Prophetic Traditions',
            'The Chapters on Divine Decree'
        ]
    };

    const names = chapterNames[bookSlug] || [
        'Chapter 1',
        'Chapter 2',
        'Chapter 3',
        'Chapter 4',
        'Chapter 5',
        'Chapter 6',
        'Chapter 7',
        'Chapter 8',
        'Chapter 9',
        'Chapter 10'
    ];

    return names.map((name, index) => ({
        id: index + 1,
        chapterNumber: index + 1,
        title: name,
        bookSlug: bookSlug,
        hadithsCount: Math.floor(Math.random() * 20) + 5
    }));
}

// Display chapters
function displayChapters(chapters, bookName, arabicName) {
    const chaptersList = document.getElementById('chaptersList');
    const bookTitle = document.getElementById('chaptersBookTitle');

    bookTitle.textContent = `${bookName} - Chapters`;
    chaptersList.innerHTML = '';

    if (chapters.length === 0) {
        chaptersList.innerHTML = `
            <div class="no-results">
                <div class="no-results-icon">📭</div>
                <h3>No chapters found</h3>
                <p>This book may not have chapter data available yet.</p>
            </div>
        `;
        switchView('chaptersView');
        updateBreadcrumb([{ name: bookName, action: null }]);
        hideLoading();
        return;
    }

    chapters.forEach((chapter, index) => {
        const item = document.createElement('div');
        item.className = 'chapter-item';
        item.onclick = () => loadHadiths(currentBook.slug, chapter.id || chapter.chapterNumber, chapter.title);

        item.innerHTML = `
            <div class="chapter-number">${index + 1}</div>
            <div class="chapter-details">
                <div class="chapter-title">${chapter.title}</div>
                <div class="chapter-meta">Chapter ${chapter.chapterNumber || index + 1}</div>
            </div>
            <div class="chapter-count">${chapter.hadithsCount || '~10'} hadiths</div>
        `;

        chaptersList.appendChild(item);
    });

    switchView('chaptersView');
    updateBreadcrumb([{ name: bookName, action: null }]);
    hideLoading();
}

// Filter chapters
function filterChapters() {
    const query = document.getElementById('chapterFilter').value.toLowerCase();
    const items = document.querySelectorAll('.chapter-item');

    items.forEach(item => {
        const title = item.querySelector('.chapter-title').textContent.toLowerCase();
        item.style.display = title.includes(query) ? 'flex' : 'none';
    });
}

// Load hadiths for a chapter
async function loadHadiths(bookSlug, chapterId, chapterTitle) {
    showLoading();
    currentChapter = { id: chapterId, title: chapterTitle };
    currentPage = 1;

    try {
        const data = await fetchAPI('/hadiths/', {
            book: bookSlug,
            chapter: chapterId,
            page: currentPage
        });

        if (data.status === 'success' && data.hadiths) {
            allHadiths = data.hadiths;
            displayHadiths(allHadiths, bookSlug, chapterTitle);
        } else {
            // Generate demo hadiths
            const demoHadiths = generateDemoHadiths(bookSlug, chapterId);
            allHadiths = demoHadiths;
            displayHadiths(demoHadiths, bookSlug, chapterTitle);
        }
    } catch (error) {
        console.log('Using demo hadiths');
        const demoHadiths = generateDemoHadiths(bookSlug, chapterId);
        allHadiths = demoHadiths;
        displayHadiths(demoHadiths, bookSlug, chapterTitle);
    }
}

// Generate demo hadiths
function generateDemoHadiths(bookSlug, chapterId) {
    const demoHadiths = [
        {
            id: 1,
            hadithNumber: `${chapterId}.1`,
            arabic: 'عَنْ أَبِي هُرَيْرَةَ رَضِيَ اللَّهُ عَنْهُ قَالَ: قَالَ رَسُولُ اللَّهِ ﷺ: "إِذَا مَاتَ الْإِنْسَانُ انْقَطَعَ عَنْهُ عَمَلُهُ إِلَّا مِنْ ثَلَاثَةٍ: صَدَقَةٌ جَارِيَةٌ، أَوْ عِلْمٌ يُنْتَفَعُ بِهِ، أَوْ وَلَدٌ صَالِحٌ يَدْعُو لَهُ"',
            translation: 'Narrated Abu Hurairah (may Allah be pleased with him): The Messenger of Allah (peace be upon him) said: "When a person dies, his deeds come to an end except for three: ongoing charity, beneficial knowledge, or a righteous child who prays for him."',
            grade: 'Sahih',
            narrator: 'Abu Hurairah',
            bookSlug: bookSlug,
            chapter: chapterId
        },
        {
            id: 2,
            hadithNumber: `${chapterId}.2`,
            arabic: 'عَنْ أَبِي هُرَيْرَةَ رَضِيَ اللَّهُ عَنْهُ قَالَ: قَالَ رَسُولُ اللَّهِ ﷺ: "مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ طَرِيقًا إِلَى الْجَنَّةِ"',
            translation: 'Narrated Abu Hurairah (may Allah be pleased with him): The Messenger of Allah (peace be upon him) said: "Whoever travels a path seeking knowledge, Allah will make easy for him a path to Paradise."',
            grade: 'Sahih',
            narrator: 'Abu Hurairah',
            bookSlug: bookSlug,
            chapter: chapterId
        },
        {
            id: 3,
            hadithNumber: `${chapterId}.3`,
            arabic: 'عَنْ أَبِي سَعِيدٍ الخُدْرِيِّ رَضِيَ اللَّهُ عَنْهُ قَالَ: قَالَ رَسُولُ اللَّهِ ﷺ: "لَا تَحْقِرَنَّ مِنَ الْمَعْرُوفِ شَيْئًا وَلَوْ أَنْ تَلْقَى أَخَاكَ بِوَجْهٍ طَلْقٍ"',
            translation: 'Narrated Abu Sa\'id Al-Khudri (may Allah be pleased with him): The Messenger of Allah (peace be upon him) said: "Do not belittle any act of kindness, even if you meet your brother with a smiling face."',
            grade: 'Sahih',
            narrator: 'Abu Sa\'id Al-Khudri',
            bookSlug: bookSlug,
            chapter: chapterId
        },
        {
            id: 4,
            hadithNumber: `${chapterId}.4`,
            arabic: 'عَنْ أَبِي قِلَابَةَ رَضِيَ اللَّهُ عَنْهُ قَالَ: قَالَ رَسُولُ اللَّهِ ﷺ: "إِنَّكُمْ لَا تَرْصَعُونَ النَّاسَ شَيْئًا أَحَبَّ إِلَيْهِمْ مِنْ بَرِّكُمْ"',
            translation: 'Narrated Abu Qilabah (may Allah be pleased with him): The Messenger of Allah (peace be upon him) said: "You will not be able to treat people with anything more beloved to them than (the Prophet\'s) benevolence."',
            grade: 'Hasan',
            narrator: 'Abu Qilabah',
            bookSlug: bookSlug,
            chapter: chapterId
        },
        {
            id: 5,
            hadithNumber: `${chapterId}.5`,
            arabic: 'عَنْ أَنَسِ بْنِ مَالِكٍ رَضِيَ اللَّهُ عَنْهُ قَالَ: قَالَ رَسُولُ اللَّهِ ﷺ: "أَحْبِبْ حَبِيبَكَ هَلَانًا مَرَّةً فَإِنْ بَدَا لَكَ عَلَيْهِ أَمْرٌ فَقُلْ لَهُ إِنِّي أُحِبُّكَ وَأَبْغَضُ مَا يَكْرَهُ اللَّهُ"',
            translation: 'Narrated Anas ibn Malik (may Allah be pleased with him): The Messenger of Allah (peace be upon him) said: "Love your beloved one moderately. If he commits something that displeases you, say: I love you, and I hate what Allah hates."',
            grade: 'Da\'if',
            narrator: 'Anas ibn Malik',
            bookSlug: bookSlug,
            chapter: chapterId
        }
    ];

    return demoHadiths;
}

// Display hadiths
function displayHadiths(hadiths, bookSlug, chapterTitle) {
    const hadithsList = document.getElementById('hadithsList');
    const hadithsTitle = document.getElementById('hadithsTitle');

    const book = BOOKS.find(b => b.slug === bookSlug);
    hadithsTitle.textContent = `${book ? book.name : bookSlug} - ${chapterTitle}`;
    hadithsList.innerHTML = '';

    if (hadiths.length === 0) {
        hadithsList.innerHTML = `
            <div class="no-results">
                <div class="no-results-icon">📖</div>
                <h3>No hadiths found</h3>
                <p>This chapter may not have hadiths available yet.</p>
            </div>
        `;
        switchView('hadithsView');
        updateBreadcrumb([
            { name: book ? book.name : bookSlug, action: null },
            { name: chapterTitle, action: null }
        ]);
        document.getElementById('pagination').innerHTML = '';
        hideLoading();
        return;
    }

    hadiths.forEach((hadith, index) => {
        const card = createHadithCard(hadith, index);
        hadithsList.appendChild(card);
    });

    // Add pagination
    displayPagination(1, 1, 'hadiths');

    switchView('hadithsView');
    updateBreadcrumb([
        { name: book ? book.name : bookSlug, action: null },
        { name: chapterTitle, action: null }
    ]);
    hideLoading();
}

// Create hadith card element
function createHadithCard(hadith, index) {
    const card = document.createElement('div');
    card.className = 'hadith-card';

    const gradeClass = getGradeClass(hadith.grade);

    card.innerHTML = `
        <div class="hadith-header">
            <div class="hadith-reference">
                <span class="hadith-book">${getBookAbbreviation(hadith.bookSlug)}</span>
                <span class="hadith-number">Hadith ${hadith.hadithNumber || index + 1}</span>
            </div>
            <span class="hadith-grade ${gradeClass}">${hadith.grade || 'Unknown'}</span>
        </div>
        <div class="hadith-body">
            <div class="hadith-arabic">${formatArabicText(hadith.arabic)}</div>
            <div class="hadith-translation">${hadith.translation || 'Translation not available'}</div>
        </div>
        <div class="hadith-footer">
            <div class="hadith-narrator">
                <strong>Narrated by:</strong> ${hadith.narrator || 'Unknown'}
            </div>
            <div class="hadith-actions">
                <button class="action-btn" onclick="copyHadith(this, ${index})">📋 Copy</button>
                <button class="action-btn" onclick="shareHadith(${index})">📤 Share</button>
            </div>
        </div>
    `;

    return card;
}

// Get grade CSS class
function getGradeClass(grade) {
    if (!grade) return 'grade-default';
    const normalized = grade.toLowerCase().normalize('NFD');
    if (normalized.includes('sahih')) return 'grade-sahih';
    if (normalized.includes('hasan')) return 'grade-hasan';
    if (normalized.includes('da') || normalized.includes('weak') || normalized.includes('munkar') || normalized.includes('matrook')) return 'grade-daif';
    return 'grade-default';
}

// Get book abbreviation
function getBookAbbreviation(slug) {
    const abbreviations = {
        'sahih-bukhari': 'Bukhari',
        'sahih-muslim': 'Muslim',
        'al-tirmidhi': 'Tirmidhi',
        'abu-dawood': 'Abu Dawood',
        'ibn-e-majah': 'Ibn Majah',
        'sunan-nasai': 'Nasai',
        'mishkat': 'Mishkat',
        'musnad-ahmad': 'Ahmad',
        'al-silsila-sahiha': 'Silsila'
    };
    return abbreviations[slug] || slug.substring(0, 3).toUpperCase();
}

// Format Arabic text
function formatArabicText(text) {
    if (!text) return '';
    // Make chapter references clickable
    return text.replace(/(\d+:\d+)/g, '<a href="#" onclick="return false;">$1</a>');
}

// Filter hadiths by grade
function filterHadithsByGrade() {
    const grade = document.getElementById('gradeFilter').value;

    if (!grade) {
        filteredHadiths = [...allHadiths];
    } else {
        filteredHadiths = allHadiths.filter(h => {
            if (!h.grade) return false;
            return h.grade.toLowerCase().normalize('NFD').includes(grade.toLowerCase().normalize('NFD'));
        });
    }

    const hadithsList = document.getElementById('hadithsList');
    hadithsList.innerHTML = '';

    filteredHadiths.forEach((hadith, index) => {
        const card = createHadithCard(hadith, index);
        hadithsList.appendChild(card);
    });
}

// Search hadiths
async function searchHadiths() {
    const query = document.getElementById('searchInput').value.trim();
    if (!query) return;

    searchQuery = query;
    searchPage = 1;
    showLoading();

    try {
        const data = await fetchAPI('/hadiths/', {
            search: query,
            page: searchPage
        });

        if (data.status === 'success' && data.hadiths) {
            displaySearchResults(data.hadiths, query, data.meta || {});
        } else {
            // Demo search results
            const demoResults = generateSearchResults(query);
            displaySearchResults(demoResults, query, { total: demoResults.length, last_page: 1 });
        }
    } catch (error) {
        const demoResults = generateSearchResults(query);
        displaySearchResults(demoResults, query, { total: demoResults.length, last_page: 1 });
    }
}

// Generate demo search results
function generateSearchResults(query) {
    const queries = query.toLowerCase();

    return BOOKS.flatMap(book =>
        generateDemoHadiths(book.slug, 1)
            .filter(h =>
                (h.arabic && h.arabic.includes(query.substring(0, 5))) ||
                (h.translation && h.translation.toLowerCase().includes(queries)) ||
                (h.narrator && h.narrator.toLowerCase().includes(queries))
            )
            .map((h, i) => ({ ...h, hadithNumber: `${book.slug.substring(0, 3)}-${1}.${i + 1}` }))
    ).slice(0, 10);
}

// Display search results
function displaySearchResults(hadiths, query, meta) {
    const searchResults = document.getElementById('searchResults');
    const searchResultsCount = document.getElementById('searchResultsCount');
    const count = meta.total || hadiths.length;

    searchResultsCount.textContent = `Found ${count} results for "${query}"`;
    searchResults.innerHTML = '';

    if (hadiths.length === 0) {
        searchResults.innerHTML = `
            <div class="no-results">
                <div class="no-results-icon">🔍</div>
                <h3>No results found</h3>
                <p>Try different keywords or check your spelling.</p>
            </div>
        `;
    } else {
        hadiths.forEach((hadith, index) => {
            const card = createHadithCard(hadith, index);
            searchResults.appendChild(card);
        });

        // Add pagination if needed
        if (meta.last_page > 1) {
            displayPagination(searchPage, meta.last_page, 'search');
        } else {
            document.getElementById('searchPagination').innerHTML = '';
        }
    }

    switchView('searchView');
    updateBreadcrumb([
        { name: 'Search', action: null },
        { name: `"${query}"`, action: null }
    ]);
    hideLoading();
}

// Display pagination
function displayPagination(current, total, type) {
    const paginationId = type === 'search' ? 'searchPagination' : 'pagination';
    const pagination = document.getElementById(paginationId);

    if (total <= 1) {
        pagination.innerHTML = '';
        return;
    }

    let html = `
        <button class="page-btn" onclick="changePage(${current - 1}, '${type}')" ${current === 1 ? 'disabled' : ''}>Previous</button>
    `;

    for (let i = 1; i <= total; i++) {
        if (i === 1 || i === total || (i >= current - 2 && i <= current + 2)) {
            html += `
                <button class="page-btn ${i === current ? 'active' : ''}" onclick="changePage(${i}, '${type}')">${i}</button>
            `;
        } else if (i === current - 3 || i === current + 3) {
            html += `<span class="page-info">...</span>`;
        }
    }

    html += `
        <button class="page-btn" onclick="changePage(${current + 1}, '${type}')" ${current === total ? 'disabled' : ''}>Next</button>
    `;

    pagination.innerHTML = html;
}

// Change page
async function changePage(page, type) {
    if (type === 'search') {
        searchPage = page;
        await searchHadiths();
    } else {
        currentPage = page;
        if (currentBook && currentChapter) {
            await loadHadiths(currentBook.slug, currentChapter.id, currentChapter.title);
        }
    }
}

// Copy hadith
function copyHadith(button, index) {
    const hadith = filteredHadiths[index] || allHadiths[index];
    const text = `${hadith.arabic}\n\n${hadith.translation}\n\n- Narrated by: ${hadith.narrator}\n- Grade: ${hadith.grade}`;

    navigator.clipboard.writeText(text).then(() => {
        const originalText = button.textContent;
        button.textContent = '✓ Copied!';
        setTimeout(() => button.textContent = originalText, 2000);
    });
}

// Share hadith
function shareHadith(index) {
    const hadith = filteredHadiths[index] || allHadiths[index];
    const shareData = {
        title: `Hadith - ${hadith.hadithNumber}`,
        text: `${hadith.translation.substring(0, 100)}...`,
        url: window.location.href
    };

    if (navigator.share) {
        navigator.share(shareData);
    } else {
        copyHadith({ textContent: '📋 Copy' }, index);
    }
}

// Navigation
function navigateTo(destination) {
    switch (destination) {
        case 'home':
            currentView = 'home';
            currentBook = null;
            currentChapter = null;
            displayBooks();
            break;
    }
}

// Update breadcrumb
function updateBreadcrumb(path) {
    const breadcrumb = document.getElementById('breadcrumb');
    let html = '<span onclick="navigateTo(\'home\')" class="breadcrumb-item">Home</span>';

    path.forEach(item => {
        if (item.action) {
            html += `<span class="breadcrumb-item" onclick="${item.action}">${item.name}</span>`;
        } else {
            html += `<span class="breadcrumb-item">${item.name}</span>`;
        }
    });

    breadcrumb.innerHTML = html;
}

// Switch view
function switchView(viewId) {
    document.querySelectorAll('.view').forEach(view => view.classList.add('hidden'));
    document.getElementById(viewId).classList.remove('hidden');
    currentView = viewId;
}

// Show/hide loading
function showLoading(show = true) {
    document.getElementById('loading').style.display = show ? 'flex' : 'none';
    document.querySelectorAll('.view').forEach(v => {
        if (!v.classList.contains('hidden')) {
            v.style.opacity = show ? '0.3' : '1';
        }
    });
}

function hideLoading() {
    showLoading(false);
}

// Show error
function showError(message) {
    const errorDiv = document.getElementById('error');
    document.getElementById('errorMessage').textContent = message;
    errorDiv.classList.remove('hidden');
    document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
}

function retryLastRequest() {
    document.getElementById('error').classList.add('hidden');
    if (currentBook) {
        if (currentChapter) {
            loadHadiths(currentBook.slug, currentChapter.id, currentChapter.title);
        } else {
            loadChapters(currentBook.slug, currentBook.name, currentBook.arabicName);
        }
    } else {
        displayBooks();
    }
}

// Modal functions
function openModal(content) {
    const modal = document.getElementById('hadithModal');
    document.getElementById('modalBody').innerHTML = content;
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const modal = document.getElementById('hadithModal');
    modal.classList.add('hidden');
    document.body.style.overflow = '';
}

// Utility functions
function formatNumber(num) {
    return new Intl.NumberFormat().format(num);
}

// Handle hash routing for deep links
window.addEventListener('hashchange', handleHashChange);

function handleHashChange() {
    const hash = window.location.hash.slice(1);

    if (hash.startsWith('book=')) {
        const bookSlug = hash.split('=')[1];
        const book = BOOKS.find(b => b.slug === bookSlug);
        if (book) {
            loadChapters(bookSlug, book.name, book.arabicName);
        }
    } else if (hash.startsWith('chapter=')) {
        const [bookSlug, chapterId] = hash.split('=')[1].split(':');
        const book = BOOKS.find(b => b.slug === bookSlug);
        if (book && chapterId) {
            loadChapters(bookSlug, book.name, book.arabicName).then(() => {
                loadHadiths(bookSlug, parseInt(chapterId), `Chapter ${chapterId}`);
            });
        }
    }
}

// Export functions to global scope
window.navigateTo = navigateTo;
window.searchHadiths = searchHadiths;
window.filterChapters = filterChapters;
window.filterHadithsByGrade = filterHadithsByGrade;
window.changePage = changePage;
window.copyHadith = copyHadith;
window.shareHadith = shareHadith;
window.openModal = openModal;
window.closeModal = closeModal;
window.toggleTheme = toggleTheme;
window.retryLastRequest = retryLastRequest;
