const fs = require('fs');

const bible = JSON.parse(fs.readFileSync('bible-data-full.json', 'utf8'));

const books = bible.books.map((book, index) => ({
    id: index + 1,
    name: book.name,
    chapters: book.chapters.length
}));

const chapters = {};

bible.books.forEach((book, bookIndex) => {
    const bookId = bookIndex + 1;
    book.chapters.forEach((chapter) => {
        const key = `${bookId}-${chapter.chapter}`;
        chapters[key] = chapter.verses.map(verse => ({
            verse: verse.verse,
            kjv: verse.text,
            genz: verse.text, // For now, same as kjv
            isChrist: false // For now, false
        }));
    });
});

const output = {
    books: books,
    chapters: chapters
};

fs.writeFileSync('bible-data-transformed.js', `window.BIBLE_DATA = ${JSON.stringify(output, null, 2)};`);