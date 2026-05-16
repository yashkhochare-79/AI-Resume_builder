# ResumeAI — Premium Resume Builder

A fully client-side, premium resume builder that generates professional, ATS-optimized resumes instantly in your browser. No APIs, no backend, no sign-up required.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)

---

## ✨ Features

- **4 Premium Templates** — Executive Dark, Editorial Black, Minimal Teal, Bold Creative
- **Smart Content Generation** — Rule-based engine creates realistic work experience, bullet points with quantified metrics, professional summaries, and more
- **ATS-Optimized** — Templates designed to pass Applicant Tracking Systems
- **Instant PDF Export** — Download your resume as PDF using the browser's built-in print engine
- **100% Client-Side** — Everything runs in the browser; no data is sent anywhere
- **Responsive Design** — Works on desktop, tablet, and mobile
- **Dark Mode UI** — Modern, premium interface with glassmorphism and micro-animations

---

## 🚀 Getting Started

### Option 1 — Open Directly
Simply open `index.html` in any modern browser:
```
Double-click index.html
```

### Option 2 — Local Server
```bash
# Python
python -m http.server 8080

# Node.js
npx serve .
```
Then visit `http://localhost:8080`

---

## 📁 Project Structure

```
AI-Resume_builder/
├── index.html      # Main HTML page
├── style.css       # All styling (dark theme, animations, responsive)
├── main.js         # Resume generator engine + template builders + PDF export
└── README.md       # This file
```

---

## 🛠️ How It Works

1. **Choose a Template** — Pick from 4 professionally designed resume layouts
2. **Fill Your Details** — Enter name, job title, email, skills, experience level, etc.
3. **Generate** — The smart engine creates a full resume with:
   - Professional summary tailored to your job title
   - 2–3 work experience entries with quantified achievement bullets
   - Education section
   - Skills (technical, tools, soft skills)
   - Certifications & languages
4. **Download PDF** — Export via the browser's print dialog (Ctrl+P / Cmd+P)

---

## 🎨 Templates

| Template | Style | Best For |
|----------|-------|----------|
| **Executive Dark** | Corporate violet sidebar | Management, enterprise roles |
| **Editorial Black** | Magazine-style skill bars | Creative professionals |
| **Minimal Teal** | Clean dot-based skills | Tech, engineering roles |
| **Bold Creative** | Gradient header, vibrant | Design, marketing roles |

---

## 🔒 Privacy

- **Zero data collection** — Nothing is stored or transmitted
- **No APIs** — All processing happens locally in your browser
- **No cookies or tracking** — Complete privacy

---

## 🧰 Tech Stack

| Layer | Technology |
|-------|-----------|
| Structure | HTML5 (semantic) |
| Styling | Vanilla CSS (custom properties, grid, animations) |
| Logic | Vanilla JavaScript (ES6+) |
| Fonts | Google Fonts (Outfit, Cormorant Garamond, Syne) |
| PDF | Browser native `window.print()` |

---

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🤝 Contributing

Contributions are welcome! Feel free to:
1. Fork the repo
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

> Built with ❤️ — No APIs, no frameworks, just clean code.
