# TabDexAI Chrome Extension

A powerful bookmark and layout management Chrome extension with Phantom wallet integration, built with React 18 and modern web technologies.

## 🚀 Features

- 🔗 **Smart Bookmark Management** - Organize and access your bookmarks efficiently
- 👻 **Phantom Wallet Integration** - Seamless crypto wallet connectivity
- 🎨 **Modern UI/UX** - Beautiful purple gradient design with Poppins typography
- ⚛️ **React 18** - Built with latest React features and hooks
- 🛠️ **Webpack 5** - Optimized bundling and hot reloading
- 📱 **Chrome Extension Manifest V3** - Latest extension standards
- 🎯 **Layout Organization** - Manage different bookmark layouts
- 🔧 **Component-Based Architecture** - Clean, maintainable code structure

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager
- Google Chrome browser

### Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/pasindupiumal03/TabDexAI-Chrome-Extension
   cd TabDexAI-Chrome-Extension
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

## 🛠️ Development

### Development Mode
Run the development server with hot reloading:
```bash
npm run dev
# or
yarn dev
```

### Production Build
Build the extension for production:
```bash
npm run build
# or
yarn build
```

## 🔧 Loading Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right corner
3. Click "Load unpacked" and select the `dist` folder (after running build)
4. The TabDexAI extension should now appear in your extensions list

## 📁 Project Structure

```
├── public/
│   ├── manifest.json          # Chrome extension manifest
│   └── assets/
│       └── icons/             # TabDexAI logos in various sizes
├── src/
│   ├── popup.jsx             # Main extension entry point
│   ├── components/
│   │   ├── WelcomePage.jsx   # Welcome/login page
│   │   └── BookmarksPage.jsx # Bookmarks management
│   ├── content.jsx           # Content script
│   ├── background.jsx        # Background script
│   ├── popup.html            # Popup HTML template
│   ├── controllers/          # Storage and utility controllers
│   └── assets/               # Images, fonts, and static assets
├── webpack.config.js         # Base webpack configuration
├── webpack.dev.js           # Development webpack config
├── webpack.prod.js          # Production webpack config
└── package.json
```

## 🎨 Design Features

### Color Palette
- **Primary Gradient**: Purple (#6E4EFF) to Blue gradient
- **Background**: Deep purple-blue gradient (`from-purple-900 via-blue-900 to-purple-800`)
- **Accent**: TabDexAI purple (#6E4EFF)

### Typography
- **Font Family**: Poppins
- **Welcome Text**: 48px, Extra Bold (800)
- **UI Elements**: Various weights for hierarchy

### Components
- **WelcomePage**: Phantom wallet connection interface
- **BookmarksPage**: Bookmark and layout management
- **Responsive Design**: Optimized for 400x600 popup dimensions

## 🔌 Phantom Wallet Integration

The extension includes seamless integration with Phantom wallet:
- Modern wallet connection UI
- Secure authentication flow
- Wallet state management
- Transaction capabilities (expandable)

## 🚀 Features Roadmap

- [ ] Advanced bookmark categorization
- [ ] Cloud sync capabilities
- [ ] Multiple wallet support
- [ ] Import/export functionality
- [ ] Custom themes
- [ ] Keyboard shortcuts
- [ ] Search and filtering
- [ ] Bookmark analytics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**TabDexAI**
- GitHub: [@pasindupiumal03](https://github.com/pasindupiumal03)
- Repository: [TabDexAI-Chrome-Extension](https://github.com/pasindupiumal03/TabDexAI-Chrome-Extension)

## 🙏 Acknowledgments

- React team for the amazing framework
- Chrome Extensions team for the platform
- Phantom team for wallet integration capabilities
- Tailwind CSS for utility-first styling

## 📞 Support

For issues, questions, or feature requests, please open an issue on the [GitHub repository](https://github.com/pasindupiumal03/TabDexAI-Chrome-Extension/issues).

---

**TabDexAI** - Streamline your browsing experience with intelligent bookmark management and wallet integration.
