# React Starter

A modern, full-stack React application built with TypeScript and a comprehensive UI component library. This project provides a solid foundation for building sophisticated web applications with a focus on accessibility, performance, and developer experience.

## 🚀 Tech Stack

### Frontend
- **React 18.3.1** - Modern React with hooks and concurrent features
- **TypeScript 5.8.3** - Type-safe JavaScript for better development experience
- **Vite 5.4.19** - Lightning-fast build tool and development server
- **React Router DOM 6.30.1** - Declarative routing for React applications

### UI & Styling
- **Tailwind CSS 3.4.17** - Utility-first CSS framework
- **shadcn/ui** - Beautiful, accessible component library
- **Radix UI** - Unstyled, accessible UI primitives
- **Lucide React** - Beautiful & consistent icon toolkit
- **next-themes** - Theme switching with system preference support

### State Management & Data
- **TanStack React Query 5.83.0** - Powerful data synchronization for React
- **React Hook Form 7.61.1** - Performant, flexible forms with easy validation
- **Zod 3.25.76** - TypeScript-first schema validation

### Development Tools
- **ESLint** - Code linting with TypeScript support
- **PostCSS** - CSS processing with Autoprefixer

## ✨ Features

- 🎨 **Comprehensive UI Library** - 40+ pre-built, accessible components
- 🌙 **Dark/Light Mode** - Built-in theme switching with system preference detection
- 📱 **Responsive Design** - Mobile-first approach with Tailwind CSS
- 🎯 **Type Safety** - Full TypeScript support throughout the application
- ⚡ **Performance Optimized** - Vite for fast builds and hot module replacement
- 🧪 **Form Handling** - Advanced form management with validation
- 🔔 **Toast Notifications** - User feedback with Sonner and shadcn/ui toasts
- 📊 **Data Visualization** - Recharts integration for charts and graphs
- 🎛️ **State Management** - React Query for server state synchronization

## 🏗️ Project Structure

```
src/
├── components/
│   └── ui/              # shadcn/ui component library
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       └── ... (40+ components)
├── hooks/               # Custom React hooks
│   ├── use-mobile.tsx
│   └── use-toast.ts
├── lib/                 # Utility functions
│   └── utils.ts
├── pages/               # Route components
│   ├── Index.tsx        # Home page
│   └── NotFound.tsx     # 404 page
├── App.tsx              # Main application component
├── main.tsx             # Application entry point
└── index.css            # Global styles and design system
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, or bun

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Psybah/react-vite-starter-template
   cd react-vite-starter-template
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   bun install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   bun dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:8080` to view the application.

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build for development
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🎨 UI Components

This project includes a comprehensive set of accessible UI components built with shadcn/ui and Radix UI:

### Layout & Navigation
- Sidebar, Navigation Menu, Breadcrumb, Tabs, Accordion

### Forms & Input
- Input, Textarea, Select, Checkbox, Radio Group, Switch, Slider, Date Picker

### Data Display
- Table, Card, Badge, Avatar, Progress, Charts (Recharts)

### Feedback & Overlays
- Alert, Toast, Dialog, Sheet, Drawer, Popover, Tooltip, Hover Card

### Interactive Elements
- Button, Toggle, Command Palette, Calendar, Carousel, Pagination

## 🎯 Development Guidelines

### Component Development
- Use TypeScript for all components
- Follow the established component patterns
- Leverage the design system defined in `src/index.css`
- Use Tailwind CSS for styling

### State Management
- Use React Query for server state
- Use React Hook Form for form state
- Use React's built-in state for local component state

### Styling
- Follow the HSL color system defined in CSS variables
- Use Tailwind utility classes
- Maintain consistency with the design system

## 🔧 Configuration

### Tailwind CSS
The project uses a custom Tailwind configuration with:
- CSS variables for theming
- Custom color palette
- Responsive breakpoints
- Animation utilities

### TypeScript
- Strict type checking enabled
- Path aliases configured (`@/*` maps to `src/*`)
- Optimized for development experience


## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

If you have any questions or need help getting started, please open an issue or reach out to me abiodunoluwamurewa@gmail.com

---

Built with by me out of boredom.
