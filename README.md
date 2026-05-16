# ResumeAI — AI-Powered Resume Builder

A full-stack AI-powered resume builder built with **Python (FastAPI)** backend and a modern **HTML/CSS/JavaScript** frontend. Generates professional, ATS-optimized resumes with smart content generation and exports them as polished PDFs.

![Python](https://img.shields.io/badge/Python-3776AB?style=flat&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)

---

## ✨ Features

- **4 Premium Templates** — Executive Dark, Editorial Black, Minimal Teal, Bold Creative
- **AI-Powered Content Generation** — Python-based engine creates realistic work experience, bullet points with quantified metrics, professional summaries, and more
- **FastAPI Backend** — High-performance Python backend handles resume generation and PDF rendering
- **ATS-Optimized** — Templates designed to pass Applicant Tracking Systems
- **PDF Export** — Server-side PDF generation using Python
- **Responsive Design** — Works on desktop, tablet, and mobile
- **Dark Mode UI** — Modern, premium interface with glassmorphism and micro-animations

---

## 🚀 Getting Started

### Prerequisites

- Python 3.9+
- pip

### Installation

```bash
# Clone the repository
git clone https://github.com/yashkhochare-79/AI-Resume_builder.git
cd AI-Resume_builder

# Install Python dependencies
pip install fastapi uvicorn jinja2

# Run the FastAPI server
uvicorn app:app --reload --port 8080
```

Then visit `http://localhost:8080`

---

## 📁 Project Structure

```
AI-Resume_builder/
├── app.py          # FastAPI backend (routes, resume generation, PDF export)
├── index.html      # Frontend HTML page
├── style.css       # Styling (dark theme, animations, responsive)
├── main.js         # Frontend logic (form handling, template rendering)
└── README.md       # This file
```

---

## 🛠️ How It Works

1. **Choose a Template** — Pick from 4 professionally designed resume layouts
2. **Fill Your Details** — Enter name, job title, email, skills, experience level, etc.
3. **Generate** — The FastAPI backend processes your input and creates a full resume with:
   - Professional summary tailored to your job title and industry
   - 2–3 work experience entries with quantified achievement bullets
   - Education section
   - Skills (technical, tools, soft skills)
   - Certifications & languages
4. **Download PDF** — The Python backend renders the resume as a downloadable PDF

---

## 🎨 Templates

| Template | Style | Best For |
|----------|-------|----------|
| **Executive Dark** | Corporate violet sidebar | Management, enterprise roles |
| **Editorial Black** | Magazine-style skill bars | Creative professionals |
| **Minimal Teal** | Clean dot-based skills | Tech, engineering roles |
| **Bold Creative** | Gradient header, vibrant | Design, marketing roles |

---

## 🧰 Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python 3.9+, FastAPI, Uvicorn |
| Frontend | HTML5, CSS3, Vanilla JavaScript (ES6+) |
| Templating | Jinja2 |
| PDF Engine | Python PDF rendering |
| Fonts | Google Fonts (Outfit, Cormorant Garamond, Syne) |

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Serves the frontend application |
| `POST` | `/api/generate` | Generates resume content from user input |
| `POST` | `/api/preview` | Returns HTML preview of the resume |
| `POST` | `/api/download-pdf` | Generates and downloads the resume as PDF |

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

> Built with ❤️ using Python FastAPI & modern web technologies.
