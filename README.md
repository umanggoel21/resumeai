# ResumeAI - Smart Resume Analyzer

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![React](https://img.shields.io/badge/React-19.2.0-blue)
![Vite](https://img.shields.io/badge/Vite-6.2.0-646CFF)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-3178C6)
![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen)



## 🚀 About The Project

**ResumeAI** is a cutting-edge, AI-powered application designed to revolutionize the way job seekers prepare their resumes. By leveraging the power of Google's Gemini AI, ResumeAI provides deep, actionable insights into resume quality, ATS (Applicant Tracking System) compatibility, and job fit.

Whether you are a seasoned professional or a fresh graduate, ResumeAI helps you craft a resume that stands out in today's competitive job market.

### ✨ Key Features

*   **📄 General Analysis**: Perform a comprehensive "Structure Scan" and "Smart Feedback" analysis to identify formatting issues, missing keywords, and content improvements.
*   **🎯 Job Fit Check**: Upload your resume and a target job description to get a precise match score and tailored recommendations.
*   **✍️ Resume Builder**: Create a professional, ATS-optimized resume from scratch using our intuitive builder.
*   **🔍 Job Search**: Find real-time job listings that match your skills and experience directly within the app.
*   **🤖 AI Career Coach**: Chat with our integrated AI assistant for personalized career advice, interview tips, and more.

## 🛠️ Built With

This project is built using a modern, robust technology stack:

*   **[React](https://reactjs.org/)** - The library for web and native user interfaces.
*   **[Vite](https://vitejs.dev/)** - Next Generation Frontend Tooling.
*   **[TypeScript](https://www.typescriptlang.org/)** - Strongly typed programming language that builds on JavaScript.
*   **[Tailwind CSS](https://tailwindcss.com/)** - A utility-first CSS framework for rapid UI development.
*   **[Google Gemini AI](https://deepmind.google/technologies/gemini/)** - The engine behind the intelligent analysis and content generation.
*   **[Lucide React](https://lucide.dev/)** - Beautiful & consistent icons.
*   **[Recharts](https://recharts.org/)** - Redefined chart library built with React and D3.

## 📂 Project Structure

```
resumeai/
├── src/
│   ├── components/      # Reusable UI components
│   ├── services/        # API services (Gemini AI integration)
│   ├── App.tsx          # Main application component
│   └── main.tsx         # Entry point
├── public/              # Static assets
└── ...
```

## 🛣️ Roadmap

- [x] Core Resume Analysis
- [x] Job Matching Engine
- [ ] Multi-language Support
- [ ] LinkedIn Profile Import
- [ ] PDF Export with Custom Templates
- [ ] Dark/Light Mode Toggle

## 🏁 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine.

### Prerequisites

Ensure you have the following installed:

*   **Node.js** (v18 or higher recommended)
*   **npm** (usually comes with Node.js)

### 📥 Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/resumeai.git
    cd resumeai
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables**
    Create a `.env.local` file in the root directory and add your Google Gemini API key:
    ```env
    GEMINI_API_KEY=your_actual_api_key_here
    ```
    > **Note**: You can get an API key from [Google AI Studio](https://aistudio.google.com/).

4.  **Run the Application**
    Start the development server:
    ```bash
    npm run dev
    ```

5.  **Open in Browser**
    Navigate to `http://localhost:3000` to view the app.

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

## 🙏 Acknowledgments

*   [Google Gemini API](https://ai.google.dev/) for the powerful AI capabilities.
*   [Shields.io](https://shields.io/) for the badges.
*   [React Icons](https://react-icons.github.io/react-icons/) for the icons.

## 📞 Contact

Umang Goel - work.umanggoel@gmail.com

Project Link: [https://github.com/umanggoel21/resumeai](https://github.com/umanggoel21/resumeai)
