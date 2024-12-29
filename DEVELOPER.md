# 3DX ONE - Developer Documentation

## Project Overview
3DX ONE is a desktop application built with Tauri, React, and TypeScript. This document provides detailed information for developers working on the project.

## Tech Stack
- **Framework**: Tauri + React
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **State Management**: React Context
- **Animations**: Framer Motion
- **UI Components**: Custom components + shadcn/ui

## Project Structure
```
3dxone/
├── src/                    # React source files
│   ├── components/         # React components
│   │   ├── ui/            # Reusable UI components
│   │   ├── WelcomePage.tsx    # Welcome screen
│   │   └── SnowBackground.tsx # Snow effect component
│   ├── App.tsx            # Main application component
│   └── index.css          # Global styles
├── src-tauri/             # Tauri backend code
│   ├── src/               # Rust source code
│   └── tauri.conf.json    # Tauri configuration
└── public/                # Static assets
    └── images/            # Image assets
```

## Key Components

### WelcomePage
The welcome screen component (`WelcomePage.tsx`) features:
- Animated snow background effect
- Partner logos section
- Developer updates panel
- Main application entry point
- Responsive design with Tailwind CSS

Color Scheme:
- Primary: #34e5f7 (Cyan)
- Secondary: #fe3752 (Red)
- Background: Gradient from #1a1f2ecc to #2c3e50cc

### SnowBackground
Canvas-based snow animation component with:
- Configurable particle system
- Responsive canvas sizing
- Performance optimized rendering

## Development Setup

1. **Prerequisites**
   - Node.js 16+
   - Rust toolchain
   - Visual Studio Build Tools
   - Git

2. **Installation**
   ```bash
   # Clone repository
   git clone [repository-url]
   cd 3dxone

   # Install dependencies
   npm install

   # Install Rust dependencies
   cd src-tauri
   cargo install
   ```

3. **Development Commands**
   ```bash
   # Start development server
   npm run tauri dev

   # Build for production
   npm run tauri build

   # Run tests
   npm test
   ```

## State Management
- Component state managed with React hooks
- Global state handled through React Context
- Persistent storage using Tauri's filesystem API

## Styling Guidelines
1. Use Tailwind CSS classes for styling
2. Follow BEM naming convention for custom CSS
3. Maintain consistent color scheme using CSS variables
4. Use Framer Motion for animations

## Best Practices
1. **TypeScript**
   - Use strict type checking
   - Create interfaces for all props
   - Avoid any type

2. **Components**
   - Keep components small and focused
   - Use functional components
   - Implement proper error boundaries

3. **Performance**
   - Lazy load components when possible
   - Optimize images and assets
   - Use React.memo for expensive renders

4. **Testing**
   - Write unit tests for utilities
   - Test component rendering
   - Use React Testing Library

## Build Process
1. **Development Build**
   - Hot module replacement enabled
   - Source maps included
   - Development tools available

2. **Production Build**
   - Code minification
   - Tree shaking
   - Asset optimization

## Contributing
1. Create feature branch from develop
2. Follow commit message convention
3. Submit PR with detailed description
4. Ensure all tests pass

## Troubleshooting
Common issues and solutions:
1. Build failures
   - Check Rust toolchain version
   - Verify Node.js version
   - Clear cache and node_modules

2. Runtime errors
   - Check console for errors
   - Verify environment variables
   - Check file permissions

## Resources
- [Tauri Documentation](https://tauri.app/docs)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Framer Motion API](https://www.framer.com/motion)
