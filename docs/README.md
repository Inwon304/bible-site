# Bible App

A clean, offline Bible reading app with the complete King James Version (KJV) of the Bible.

## Features

### Navigation
- **Book & Chapter Selection**: Dropdown menus to navigate between books and chapters
- **Verse Jump**: Enter a verse number to jump directly to it
- **Keyboard Navigation**:
  - Arrow keys: Navigate between verses
  - Left/Right arrows: Navigate between chapters
  - Spacebar: Toggle text-to-speech

### Reading Features
- **Dark Mode**: Toggle between light and dark themes (persisted)
- **Font Size Control**: Increase/decrease text size (A+ / A- buttons)
- **Reading Progress**: Visual progress bar at the bottom
- **Verse Highlighting**: Ctrl+click to highlight verses (persisted)
- **Bookmarks**: Shift+click to bookmark verses (persisted)
- **Text-to-Speech**: Listen to selected verses

### Search & Discovery
- **Search**: Ctrl+F to search within the current chapter
- **Bookmarks Panel**: Ctrl+B to view all saved bookmarks

### Sharing
- **Verse Sharing**: Share selected verses via native share API or clipboard

## Controls

- **Theme Toggle**: Sun/Moon icon - Switch between light/dark mode
- **Font Controls**: A- / A+ buttons - Adjust text size
- **Search**: Magnifying glass icon - Open search overlay
- **Bookmarks**: Bookmark icon - Open bookmarks panel
- **TTS**: Speaker icon - Start/stop text-to-speech for selected verse
- **Share**: Upload icon - Share selected verse

## Keyboard Shortcuts

- `↑/↓`: Navigate verses
- `←/→`: Navigate chapters
- `Space`: Toggle TTS
- `Ctrl+F`: Open search
- `Ctrl+B`: Open bookmarks

## Usage

1. Select a book and chapter from the dropdowns
2. Click on any verse to select it
3. Use the controls for various features
4. Bookmarks and highlights are automatically saved

## Technical Details

- **Offline**: Works completely offline once loaded
- **PWA**: Installable as a progressive web app
- **Responsive**: Works on all device sizes
- **Data**: Complete KJV Bible with 66 books, 1,189 chapters, 31,102 verses

## Browser Support

- Modern browsers with ES6 support
- Text-to-speech requires browser support (Chrome, Firefox, Safari, Edge)
- Native sharing requires modern mobile browsers or desktop with sharing support