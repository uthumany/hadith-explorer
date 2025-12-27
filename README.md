# Al-Bayan Hadith Explorer

A comprehensive web application to explore, read, and search authentic hadith collections from various classical Islamic sources.

## 🌐 Live Application

**Access the application at:** https://njue1pjy6c2m.space.minimax.io

## 📚 Supported Hadith Collections

The application includes access to 9 major hadith collections:

| Collection | Arabic Name | Compiler | Total Hadiths |
|------------|-------------|----------|---------------|
| Sahih Bukhari | صحيح البخاري | Imam Muhammad ibn Ismail al-Bukhari | 7,563 |
| Sahih Muslim | صحيح مسلم | Imam Muslim ibn al-Hajjaj | 7,462 |
| Jami' Al-Tirmidhi | جامع الترمذي | Imam Abu Isa Muhammad at-Tirmidhi | 5,047 |
| Sunan Abu Dawood | سنن أبي داود | Imam Sulaiman ibn al-Ash'ath ad-Dinawari | 5,274 |
| Sunan Ibn-e-Majah | سنن ابن ماجه | Imam Muhammad ibn Yazid ibn Majah | 4,345 |
| Sunan An-Nasa'i | سنن النسائي | Imam Ahmad ibn Shu'aib al-Nasa'i | 5,762 |
| Mishkat Al-Masabih | مشكاة المصابيح | Al-Khatib al-Tabrizi | 4,483 |
| Musnad Ahmad | مسند أحمد | Imam Ahmad ibn Hanbal | 29,442 |
| Al-Silsila Sahiha | السلسلة الصحيحة | Shah Waliullah Dehlawi | ~3,000 |

## ✨ Features

### Core Functionality
- **Browse Hadith Books**: View all 9 major hadith collections with their statistics
- **Chapter Navigation**: Navigate through chapters within each book
- **Read Hadiths**: Access authentic hadiths with Arabic text and English translations
- **Grade Indicators**: See authenticity grades (Sahih, Hasan, Da'if, etc.)
- **Narrator Information**: View who narrated each hadith

### Search & Discovery
- **Global Search**: Search across all hadith collections
- **Grade Filtering**: Filter hadiths by authenticity grade
- **Chapter Filtering**: Quickly find specific chapters

### User Experience
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Dark Mode**: Toggle between light and dark themes
- **Arabic Typography**: Beautiful rendering of Arabic text with proper font support
- **Copy & Share**: Copy hadith text or share via native sharing APIs
- **Breadcrumb Navigation**: Easy navigation through the hierarchy

### Performance
- **Optimized Loading**: Skeleton screens and smooth transitions
- **Caching**: Efficient data loading and caching
- **Progressive Enhancement**: Works with or without JavaScript

## 🛠️ Technical Architecture

### Frontend
- **HTML5**: Semantic markup for accessibility
- **CSS3**: Custom variables, flexbox, grid, responsive design
- **Vanilla JavaScript**: No framework dependencies for optimal performance

### API Integration
- **HadithAPI**: Primary data source for authentic hadith content
- **Proxy Server**: Optional server-side proxy for API key protection
- **Fallback Data**: Demo data when API is unavailable

### Design System
- **Color Palette**: Deep Islamic green (#104F55) with gold accents (#D4AF37)
- **Typography**: Amiri/Scheherazade for Arabic, Inter for English
- **Components**: Card-based layout with consistent spacing and shadows

## 📁 Project Structure

```
hadith-explorer/
├── index.html          # Main HTML structure
├── styles.css          # Complete styling with dark mode
├── app.js              # Application logic and API integration
├── server.js           # Optional Express proxy server
├── package.json        # Node.js dependencies
├── test.js             # Playwright test suite
├── README.md           # Documentation
└── dist/               # Production build (auto-generated)
```

## 🚀 Getting Started

### Running Locally

1. **Clone or download the project files**

2. **Open directly in browser**:
   ```bash
   # Simply open index.html in your browser
   # Or use a simple HTTP server:
   npx serve .
   ```

3. **With Node.js proxy server** (for API key protection):
   ```bash
   npm install
   npm start
   # Visit http://localhost:3000
   ```

### Running Tests

```bash
npm install
node test.js
```

## 🎨 API Integration

### Endpoints Used

The application integrates with HadithAPI (https://hadithapi.com):

```javascript
// Get all books
GET https://hadithapi.com/api/books?apiKey={API_KEY}

// Get chapters for a book
GET https://hadithapi.com/api/{bookSlug}/chapters?apiKey={API_KEY}

// Get hadiths
GET https://hadithapi.com/api/hadiths/?apiKey={API_KEY}&book={bookSlug}&chapter={chapterId}
```

### Supported Book Slugs
- `sahih-bukhari`
- `sahih-muslim`
- `al-tirmidhi`
- `abu-dawood`
- `ibn-e-majah`
- `sunan-nasai`
- `mishkat`
- `musnad-ahmad`
- `al-silsila-sahiha`

## 📱 Responsive Design

The application is fully responsive across all device sizes:

- **Desktop (1200px+)**: Full sidebar, multi-column layouts
- **Tablet (768-1199px)**: Adapted grid layouts
- **Mobile (< 768px)**: Single column, optimized touch targets

## ♿ Accessibility

- Semantic HTML structure
- Proper heading hierarchy
- Keyboard navigation support
- Sufficient color contrast ratios
- Focus indicators for interactive elements

## 🔒 Security Considerations

For production deployment:

1. **API Key Protection**: Use the included Express proxy server to hide your API key
2. **Environment Variables**: Store API keys in environment variables
3. **CORS Configuration**: Configure CORS for your specific domain
4. **Rate Limiting**: Implement rate limiting on the proxy server

Example production setup:
```javascript
// server.js
const express = require('express');
const axios = require('axios');
const app = express();

// API key from environment variable
const API_KEY = process.env.HADITH_API_KEY;

app.get('/api/hadiths', async (req, res) => {
    const response = await axios.get('https://hadithapi.com/api/hadiths/', {
        params: { apiKey: API_KEY, ...req.query }
    });
    res.json(response.data);
});

app.listen(3000);
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- **HadithAPI**: For providing comprehensive hadith data
- **Islamic scholars**: For preserving and authenticating these narrations
- **Open source community**: For the tools and libraries used

## 📞 Support

For issues or questions, please open an issue in the project repository.

---

**Al-Bayan Hadith Explorer** - Making the Prophetic traditions accessible to everyone
