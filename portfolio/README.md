# Portfolio

A modern, high-performance developer portfolio built with semantic HTML5, modern CSS3, and JavaScript (ES6+). Designed with a clean dark-mode aesthetic, glassmorphic UI components, dynamic GSAP animations, a 3D cylindrical project showcase spine, an interactive starfield particle system, and full responsiveness across mobile, tablet, and desktop viewports.

## 🌐 Live Demo & Repository

- **Live Demo**: [https://portfolio-rust-six-77.vercel.app](https://portfolio-rust-six-77.vercel.app)
- **Source Code**: [https://github.com/Shameem1105/portfolio](https://github.com/Shameem1105/portfolio)

---

## ✨ Features

- **3D Cylindrical Project Spine**: Interactive scroll-driven 3D cylinder rotating through featured projects with live milestone indicators and detailed modal views.
- **GSAP & ScrollTrigger Animations**: Silky smooth entrance transitions, scroll reveals, and micro-interactions.
- **Interactive Starfield Canvas**: Multi-layer parallax particle system with twinkle phase calculations, glowing auras, and shooting stars.
- **Magnetic Buttons & Dynamic Glow Cursor**: Smooth linear interpolation (lerp) cursor follower and magnetic hover reactions.
- **Glassmorphic UI & Dark Theme**: Modern dark aesthetic with CSS backdrop filters, custom gradients, and CSS variable design tokens.
- **Responsive Layout**: Designed for optimal viewing across mobile, tablet, laptop, and ultra-wide screens.
- **Zero-Dependency Core**: Fast load times with vanilla web standards and CDN-delivered icon/animation libraries.

---

## 🛠️ Tech Stack

### Project Technologies
- **Markup**: HTML5 (Semantic Structure, Accessibility, Meta Tags)
- **Styling**: Vanilla CSS3 (Custom Design System, CSS Grid, Flexbox, 3D Transforms, Glassmorphism)
- **Logic & Animation**: JavaScript ES6+, [GSAP 3.12](https://greensock.com/gsap/) & ScrollTrigger
- **Icons**: [Lucide Icons](https://lucide.dev/)
- **Typography**: Google Fonts (*Outfit*, *Inter*, *Fira Code*)
- **Hosting & Deployment**: [Vercel](https://vercel.com/)

### Placement Profile & Engineering Focus
- **Languages**: Java, Python, JavaScript, C, C++
- **Core Concepts**: Data Structures & Algorithms, Object-Oriented Programming (OOP), Software Engineering
- **Backend & APIs**: Java Backend, Node.js, PHP, RESTful APIs
- **Databases**: MySQL, SQL Queries, Schema Design
- **AI & Integrations**: GROQ API, MCP Protocol, LLM Integrations
- **Tools**: Git, GitHub, VS Code, XAMPP, Figma

---

## 📁 Project Structure

```text
portfolio/
├── img/
│   └── photo_2026-07-02_15-19-10.jpg      # Profile photograph
├── videos/
│   ├── A_dark_minimalist_backgroun...mp4  # Hero ambient background video
│   └── mohammed shameem new resume.pdf    # Downloadable resume PDF
├── .gitignore                             # Git ignore rules
├── index.html                             # Main application markup & structure
├── script.js                              # Interactive engine, GSAP animations & modal logic
├── style.css                              # Design system, glassmorphic styles & responsive media queries
└── README.md                              # Project documentation
```

---

## 🚀 Running Locally

No build step or node package installations are required to run this static project locally.

### Option 1: Using `npx serve`
```bash
# Start a local static file server
npx serve .
```

### Option 2: Using Python
```bash
# Python 3
python -m http.server 3000
```

### Option 3: Using VS Code Live Server
1. Open the project folder in VS Code.
2. Right-click `index.html` and select **Open with Live Server**.

Open `http://localhost:3000` (or the port displayed in your terminal) in any modern web browser.

---

## 📦 Build

Since this is a vanilla static web application, no compilation or bundler step is needed. The production output is the source directory (`./`), ready for immediate deployment to any static hosting provider or CDN edge network.

---

## 🚀 Deployment

This project is deployed directly on **Vercel** as a static website.

### Deploying via Vercel CLI:
```bash
# Deploy to preview
npx vercel

# Deploy to production
npx vercel --prod
```

### Deploying via Git Integration:
1. Push this repository to GitHub: `https://github.com/Shameem1105/portfolio`
2. Import the repository into the [Vercel Dashboard](https://vercel.com/new).
3. Set the Framework Preset to **Other** (Static Site).
4. Click **Deploy**.

---

## 👤 Author

**Mohammed Shameem S**
- **Role**: Software Engineer | Product Builder | Full-Stack Developer
- **GitHub**: [@Shameem1105](https://github.com/Shameem1105)
- **Email**: [mohammedshameem1105@gmail.com](mailto:mohammedshameem1105@gmail.com)
- **Education**: B.E. Electronics & Communication Engineering

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
