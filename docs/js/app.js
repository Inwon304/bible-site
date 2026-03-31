class BibleApp {
    constructor() {
        this.currentBook = 1; // Genesis
        this.currentChapter = 1;
        this.currentVerse = 1;
        this.fontSize = 'medium'; // small, medium, large
        this.theme = 'light'; // light, dark
        this.bookmarks = JSON.parse(localStorage.getItem('bibleBookmarks') || '[]');
        this.highlights = JSON.parse(localStorage.getItem('bibleHighlights') || '[]');
        this.tts = null;
        this.ttsPlaying = false;
        this.init();
    }

    init() {
        this.populateBooks();
        this.bindEvents();
        this.loadChapter();
        this.updateProgress();
        this.loadSettings();
        this.applySettings();
    }

    loadSettings() {
        this.theme = localStorage.getItem('bibleTheme') || 'light';
        this.fontSize = localStorage.getItem('bibleFontSize') || 'medium';
    }

    applySettings() {
        document.documentElement.setAttribute('data-theme', this.theme);
        document.documentElement.setAttribute('data-font-size', this.fontSize);
        this.updateThemeIcon();
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
        // Navigation
        document.getElementById('bookSelectTop').onchange = (e) => {
            this.currentBook = parseInt(e.target.value);
            this.updateChapters();
        };

        document.getElementById('chapterSelectTop').onchange = (e) => {
            this.currentChapter = parseInt(e.target.value);
            this.loadChapter();
        };

        const verseInput = document.getElementById('verseInputTop');
        verseInput.onkeydown = (e) => {
            if (e.key === 'Enter') this.goToVerse();
        };

        // Controls
        document.getElementById('themeToggle').onclick = () => this.toggleTheme();
        document.getElementById('fontDecrease').onclick = () => this.changeFontSize('decrease');
        document.getElementById('fontIncrease').onclick = () => this.changeFontSize('increase');
        document.getElementById('bookmarkToggle').onclick = () => this.toggleBookmarks();
        document.getElementById('ttsToggle').onclick = () => this.toggleTTS();
        document.getElementById('shareToggle').onclick = () => this.shareVerse();

        // Keyboard navigation
        document.addEventListener('keydown', (e) => this.handleKeydown(e));

        // Progress on scroll
        document.querySelector('.bible-main').onscroll = () => this.updateProgress();
    }

    handleKeydown(e) {
        if (e.target.tagName === 'INPUT') return;

        switch(e.key) {
            case 'ArrowUp':
                e.preventDefault();
                this.navigateVerse(-1);
                break;
            case 'ArrowDown':
                e.preventDefault();
                this.navigateVerse(1);
                break;
            case 'ArrowLeft':
                e.preventDefault();
                this.navigateChapter(-1);
                break;
            case 'ArrowRight':
                e.preventDefault();
                this.navigateChapter(1);
                break;
            case ' ':
                e.preventDefault();
                this.toggleTTS();
                break;
            case 'f':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                }
                break;
            case 'b':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    this.toggleBookmarks();
                }
                break;
        }
    }

    navigateVerse(direction) {
        const verses = document.querySelectorAll('.verse');
        const currentIndex = Array.from(verses).findIndex(v => v.classList.contains('selected'));
        const newIndex = Math.max(0, Math.min(verses.length - 1, currentIndex + direction));

        if (verses[newIndex]) {
            this.selectVerse(verses[newIndex]);
            verses[newIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    navigateChapter(direction) {
        const book = BIBLE_DATA.books.find(b => b.id === this.currentBook);
        const newChapter = this.currentChapter + direction;

        if (newChapter >= 1 && newChapter <= book.chapters) {
            this.currentChapter = newChapter;
            document.getElementById('chapterSelectTop').value = this.currentChapter;
            this.loadChapter();
        }
    }

    selectVerse(verseEl) {
        document.querySelectorAll('.verse.selected').forEach(v => v.classList.remove('selected'));
        verseEl.classList.add('selected');
        this.currentVerse = parseInt(verseEl.dataset.verse);
        this.updateProgress();
    }

    toggleHighlight(verseEl) {
        const verseId = `${this.currentBook}-${this.currentChapter}-${verseEl.dataset.verse}`;
        const index = this.highlights.indexOf(verseId);

        if (index > -1) {
            this.highlights.splice(index, 1);
            verseEl.classList.remove('highlighted');
        } else {
            this.highlights.push(verseId);
            verseEl.classList.add('highlighted');
        }

        localStorage.setItem('bibleHighlights', JSON.stringify(this.highlights));
    }

    toggleBookmark(verseEl) {
        const verseId = `${this.currentBook}-${this.currentChapter}-${verseEl.dataset.verse}`;
        const index = this.bookmarks.findIndex(b => b.id === verseId);

        if (index > -1) {
            this.bookmarks.splice(index, 1);
            verseEl.classList.remove('bookmarked');
        } else {
            const verseText = verseEl.querySelector('.verse-text').textContent;
            this.bookmarks.push({
                id: verseId,
                book: this.currentBook,
                chapter: this.currentChapter,
                verse: parseInt(verseEl.dataset.verse),
                text: verseText
            });
            verseEl.classList.add('bookmarked');
        }

        localStorage.setItem('bibleBookmarks', JSON.stringify(this.bookmarks));
    }

    toggleTheme() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        this.applySettings();
        localStorage.setItem('bibleTheme', this.theme);
    }

    updateThemeIcon() {
        const sunIcon = document.getElementById('sunIcon');
        const moonIcon = document.getElementById('moonIcon');

        if (this.theme === 'dark') {
            sunIcon.style.display = 'none';
            moonIcon.style.display = 'block';
        } else {
            sunIcon.style.display = 'block';
            moonIcon.style.display = 'none';
        }
    }

    changeFontSize(direction) {
        const sizes = ['small', 'medium', 'large'];
        const currentIndex = sizes.indexOf(this.fontSize);

        if (direction === 'increase' && currentIndex < sizes.length - 1) {
            this.fontSize = sizes[currentIndex + 1];
        } else if (direction === 'decrease' && currentIndex > 0) {
            this.fontSize = sizes[currentIndex - 1];
        }

        this.applySettings();
        localStorage.setItem('bibleFontSize', this.fontSize);
    }

    toggleBookmarks() {
        const overlay = document.getElementById('bookmarkPanel');
        overlay.classList.toggle('show');
        this.renderBookmarks();
    }

    closeBookmarks() {
        document.getElementById('bookmarkPanel').classList.remove('show');
    }

    renderBookmarks() {
        const list = document.getElementById('bookmarkList');
        const stats = document.getElementById('bookmarkStats');

        if (this.bookmarks.length === 0) {
            stats.textContent = 'No bookmarks saved yet';
            list.innerHTML = `
                <div class="bookmark-empty">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2Z"></path>
                    </svg>
                    <p>No bookmarks yet</p>
                    <p>Shift+click on any verse to bookmark it for quick access.</p>
                </div>
            `;
            return;
        }

        stats.textContent = `${this.bookmarks.length} bookmark${this.bookmarks.length === 1 ? '' : 's'} saved`;

        const bookmarksHtml = this.bookmarks.map(bookmark => `
            <div class="bookmark-item" data-id="${bookmark.id}">
                <div class="verse-ref">${BIBLE_DATA.books.find(b => b.id === bookmark.book)?.name} ${bookmark.chapter}:${bookmark.verse}</div>
                <div class="verse-text">${bookmark.text}</div>
            </div>
        `).join('');

        list.innerHTML = bookmarksHtml;

        // Bind click events
        document.querySelectorAll('.bookmark-item').forEach(item => {
            item.onclick = () => {
                const [book, chapter, verse] = item.dataset.id.split('-').map(Number);
                this.currentBook = book;
                this.currentChapter = chapter;
                document.getElementById('bookSelectTop').value = book;
                this.updateChapters();
                this.loadChapter();
                setTimeout(() => this.goToVerse(verse), 100);
                this.closeBookmarks();
            };
        });
    }

    toggleTTS() {
        if (this.ttsPlaying) {
            this.stopTTS();
        } else {
            this.startTTS();
        }
    }

    startTTS() {
        if (!('speechSynthesis' in window)) {
            alert('Text-to-speech is not supported in your browser.');
            return;
        }

        const selectedVerse = document.querySelector('.verse.selected');
        if (!selectedVerse) {
            alert('Please select a verse first (click on it).');
            return;
        }

        const text = selectedVerse.querySelector('.verse-text').textContent;
        this.tts = new SpeechSynthesisUtterance(text);
        this.tts.rate = 0.8;
        this.tts.pitch = 1;

        this.tts.onend = () => {
            this.ttsPlaying = false;
            document.getElementById('ttsToggle').classList.remove('active');
        };

        window.speechSynthesis.speak(this.tts);
        this.ttsPlaying = true;
        document.getElementById('ttsToggle').classList.add('active');
    }

    stopTTS() {
        if (this.tts) {
            window.speechSynthesis.cancel();
            this.ttsPlaying = false;
            document.getElementById('ttsToggle').classList.remove('active');
        }
    }

    shareVerse() {
        const selectedVerse = document.querySelector('.verse.selected');
        if (!selectedVerse) {
            alert('Please select a verse first (click on it).');
            return;
        }

        const bookName = BIBLE_DATA.books.find(b => b.id === this.currentBook)?.name;
        const verseNum = selectedVerse.dataset.verse;
        const verseText = selectedVerse.querySelector('.verse-text').textContent;
        const shareText = `${bookName} ${this.currentChapter}:${verseNum} (KJV)\n\n"${verseText}"\n\nRead more at: ${window.location.href}`;

        if (navigator.share) {
            navigator.share({
                title: `${bookName} ${this.currentChapter}:${verseNum}`,
                text: shareText,
            });
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(shareText).then(() => {
                alert('Verse copied to clipboard!');
            }).catch(() => {
                // Final fallback: show text to copy
                const textArea = document.createElement('textarea');
                textArea.value = shareText;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                alert('Verse copied to clipboard!');
            });
        }
    }

    goToVerse(verseNum = null) {
        const num = verseNum || parseInt(document.getElementById('verseInputTop').value);
        if (num) {
            const verseEl = document.querySelector(`.verse[data-verse="${num}"]`);
            if (verseEl) {
                verseEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                this.selectVerse(verseEl);
            }
        }
    }

    async loadChapter() {
        const loader = document.getElementById('loadingIndicator');
        loader.classList.add('active');

        const key = `${this.currentBook}-${this.currentChapter}`;
        const verses = BIBLE_DATA.chapters[key] || [];

        this.renderChapter(verses);
        document.getElementById('bookTitle').textContent = BIBLE_DATA.books.find(b => b.id === this.currentBook)?.name;
        document.getElementById('chapterInfo').textContent = `Chapter ${this.currentChapter}`;
        this.applyHighlightsAndBookmarks();
        this.updateProgress();

        loader.classList.remove('active');
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
                    ${verses.map(v => this.renderVerse(v)).join('')}
                </div>
            </div>
        `;
    }

    renderVerse(verse) {
        const isChrist = verse.isChrist;
        const christClass = isChrist ? 'christ-words' : '';
        return `
            <div class="verse" data-verse="${verse.verse}">
                <span class="verse-number">${verse.verse}</span>
                <div class="verse-text ${christClass}">${verse.kjv}</div>
            </div>
        `;
    }

    applyHighlightsAndBookmarks() {
        this.highlights.forEach(highlightId => {
            const [book, chapter, verse] = highlightId.split('-').map(Number);
            if (book === this.currentBook && chapter === this.currentChapter) {
                const verseEl = document.querySelector(`.verse[data-verse="${verse}"]`);
                if (verseEl) verseEl.classList.add('highlighted');
            }
        });

        this.bookmarks.forEach(bookmark => {
            if (bookmark.book === this.currentBook && bookmark.chapter === this.currentChapter) {
                const verseEl = document.querySelector(`.verse[data-verse="${bookmark.verse}"]`);
                if (verseEl) verseEl.classList.add('bookmarked');
            }
        });
    }

    updateChapters() {
        const book = BIBLE_DATA.books.find(b => b.id === this.currentBook);
        const topSelect = document.getElementById('chapterSelectTop');
        topSelect.innerHTML = Array.from({length: book.chapters}, (_, i) =>
            `<option value="${i+1}">Chapter ${i+1}</option>`
        ).join('');

        this.currentChapter = Math.min(this.currentChapter, book.chapters);
        topSelect.value = this.currentChapter;
        document.getElementById('bookSelectTop').value = this.currentBook;
        this.loadChapter();
    }

    updateProgress() {
        const container = document.querySelector('.bible-main');
        const scrollTop = container.scrollTop;
        const scrollHeight = container.scrollHeight - container.clientHeight;
        const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
        document.querySelector('.progress-fill').style.width = `${progress}%`;
    }
}

// Start
const app = new BibleApp();