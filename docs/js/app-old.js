class BibleApp {
    constructor() {
        this.brainrotLevel = 0;
        this.currentBook = 40; // Matthew
        this.currentChapter = 5;
        this.init();
    }

    init() {
        this.cacheVerses();
        this.populateBooks();
        this.bindEvents();
        this.loadChapter();
        this.updateProgress();
    }

    cacheVerses() {
        // Brainrot translation levels
        this.brainrotLevels = {
            0: text => text, // Pure KJV
            25: text => text.replace(/thee|thou/gi, 'you'),
            50: text => text.replace(/thee|thou|thy/gi, 'u').replace(/hath|doth/gi, 'has'),
            75: text => text.replace(/verily/i, 'frfr').replace(/repent/gi, 'touch grass'),
            100: text => text.replace(/kingdom of heaven/gi, 'heaven drip').replace(/saith/gi, 'spits facts')
        };
    }

    populateBooks() {
        const topBookSelect = document.getElementById('bookSelectTop');
        BIBLE_DATA.books.forEach(book => {
            const option = `<option value="${book.id}">${book.name}</option>`;
            topBookSelect.innerHTML += option;
        });
        this.updateChapters();
    }

    bindEvents() {
        // Top navigation selects (single source, no duplicate buttons)
        const onBookChange = (e) => {
            this.currentBook = parseInt(e.target.value);
            this.updateChapters();
        };
        document.getElementById('bookSelectTop').onchange = onBookChange;

        const onChapterChange = (e) => {
            this.currentChapter = parseInt(e.target.value);
            this.loadChapter();
        };
        document.getElementById('chapterSelectTop').onchange = onChapterChange;

        const verseInput = document.getElementById('verseInputTop');
        verseInput.onkeydown = (e) => {
            if (e.key === 'Enter') this.goToVerse();
        };
    }

    goToChapter() {
        this.currentChapter = parseInt(document.getElementById('chapterSelectTop').value);
        this.loadChapter();
    }

    goToVerse() {
        const verseNum = parseInt(document.getElementById('verseInputTop').value);
        if (verseNum) {
            const verseEl = document.querySelector(`.verse[data-verse="${verseNum}"]`);
            if (verseEl) {
                verseEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }

    async loadChapter() {
        const key = `${this.currentBook}-${this.currentChapter}`;
        let verses = BIBLE_DATA.chapters[key] || [];

        // Apply brainrot level
        verses = verses.map(verse => ({
            ...verse,
            genz: this.applyBrainrot(verse.kjv)
        }));

        this.renderChapter(verses);
        document.getElementById('bookTitle').textContent = BIBLE_DATA.books.find(b => b.id === this.currentBook)?.name;
        document.getElementById('chapterInfo').textContent = `Chapter ${this.currentChapter}`;
    }

    applyBrainrot(kjvText) {
        let result = kjvText;
        Object.entries(this.brainrotLevels).forEach(([level, fn]) => {
            if (this.brainrotLevel >= level) {
                result = fn(result);
            }
        });
        return result;
    }

    renderChapter(verses) {
        const container = document.getElementById('bibleContainer');
        const bookName = BIBLE_DATA.books.find(b => b.id === this.currentBook)?.name || '';

        container.innerHTML = `
            <div class="bible-header">
                <h1>${bookName} ${this.currentChapter}</h1>
            </div>
            <div class="verse-grid">
                <div class="verse-column">
                    <h2>KJV</h2>
                    ${verses.map(v => this.renderVerse(v, 'kjv')).join('')}
                </div>
            </div>
        `;

        // Verse sharing removed
    }

    renderVerse(verse, version) {
        const isChrist = verse.isChrist;
        const christClass = isChrist ? 'christ-words' : '';
        return `
            <div class="verse" data-version="${version}" data-verse="${verse.verse}">
                <span class="verse-number">${verse.verse}</span>
                <div class="verse-text ${christClass}">${verse[version]}</div>
            </div>
        `;
    }

    updateChapters() {
        const book = BIBLE_DATA.books.find(b => b.id === this.currentBook);
        const topSelect = document.getElementById('chapterSelectTop');
        topSelect.innerHTML = Array.from({length: book.chapters}, (_, i) =>
            `<option value="${i+1}">Chapter ${i+1}</option>`
        ).join('');

        this.currentChapter = 1;
        topSelect.value = this.currentChapter;
        document.getElementById('bookSelectTop').value = this.currentBook;
        this.loadChapter();
    }
}

// Start
const app = new BibleApp();