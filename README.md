# 3DXOne

A modern desktop application for accessing 3DXChat news, events, and community tools.

## Features

- 📰 Latest News Feed
- 📅 Events Calendar
- 🛠️ Community Tools
- 🌐 Status Monitoring
- ⚡ Global Shortcut (Alt+Space)
- 🔄 Automatic Updates

## Installation

1. Download the latest installer from the [Releases](https://github.com/YOUR_USERNAME/3dxone10/releases) page
2. Run the installer
3. Launch 3DXOne from your Start Menu

## Development

### Prerequisites

- Node.js 18+
- Rust (latest stable)
- Visual Studio Build Tools 2019+

### Setup

```bash
# Install dependencies
npm install

# Start development server
npm run tauri dev

# Build for production
npm run tauri build
```

### Global Shortcut

Press `Alt+Space` to toggle the window visibility.

## Security

- All connections are made over HTTPS
- Content Security Policy (CSP) is enforced
- No sensitive data is stored locally
- Regular security updates

## Updates

The app checks for updates automatically and will notify you when a new version is available.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [Tauri](https://tauri.app/)
- UI powered by [React](https://reactjs.org/)
- Icons by [Lucide](https://lucide.dev/)
