# 📧 UniMail Pro

> **A Modern Email Management System with Database Integration**

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-Visithttps://uni-mail-pro.vercel..io/badge/React-18.2.0-61DAFB?style=for-the![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=su 📚 Academic Project

**Course:** Database Management Systems (DBMS)  
**Class:** TY-A Computer Engineering  
**Institution:** K.K. Wagh Institute of Engineering Education and Research

***

## 👥 Team Members

| Name | GitHub Profile |
|------|----------------|
| 🧑‍💻 **Hrishikesh Gavai** | [@Hrishikesh-Gavai](https://github.com/Hrishikesh-Gavai) |
| 👨‍💻 **Dhruvesh Patil** | [@Dhruvesh05](https://github.com/Dhruvesh05) |
| 👩‍💻 **Nakshatra Rao** | - |
| 👩‍💻 **Palak Lokwani** | - |

***

## 🎯 Project Overview

UniMail Pro is a full-stack email management application that demonstrates practical implementation of **Database Management System concepts**. Built with React and Supabase, it showcases CRUD operations, data relationships, and real-time database interactions in a real-world scenario.

### 🌟 What Makes It Special?

- **Real Database Integration**: Uses Supabase (PostgreSQL) for production-grade data management
- **Multi-Language Support**: Automatic translation to Hindi and Marathi using Translation API
- **File Management**: Upload and manage PDF attachments with cloud storage
- **Professional UI**: Clean, responsive design that works on all devices
- **Export Functionality**: Download email records as Excel files with clickable links

***

## ✨ Key Features

### 📝 Email Management
- ✅ Compose emails with a professional interface
- ✅ Add multiple recipients with smart validation
- ✅ Attach PDF files (up to 40MB each)
- ✅ Set custom send dates

### 🗄️ Database Operations
- ✅ **CREATE**: Save new email records to database
- ✅ **READ**: View and search all email records
- ✅ **UPDATE**: Edit and translate email content
- ✅ **DELETE**: Remove recipients and attachments

### 🌐 Multi-Language Translation
- 🇮🇳 Automatic Hindi translation
- 🇮🇳 Automatic Marathi translation
- 🔄 Real-time API integration

### 📊 Advanced Features
- 🔍 Search across all fields
- 📅 Filter by date
- 📥 Export to Excel with clickable PDF links
- 🔗 Direct Gmail integration
- 📱 Fully mobile responsive

***

## 🛠️ Technology Stack

### Frontend
```
⚛️ React.js          - UI Framework
🎨 CSS3              - Styling
🎯 Lucide React      - Icons
🔔 React Hot Toast   - Notifications
📊 XLSX Library      - Excel Export
```

### Backend & Database
```
🗄️ Supabase          - PostgreSQL Database
☁️ Supabase Storage  - File Storage
🔐 Row Level Security - Data Protection
```

### Deployment
```
▲ Vercel             - Frontend Hosting
☁️ Supabase Cloud    - Database Hosting
```

***

## 📂 Database Schema

```sql
Table: email_records
├── id (BIGSERIAL PRIMARY KEY)
├── from_user (TEXT)
├── to_user (TEXT NOT NULL)
├── subject (TEXT NOT NULL)
├── content (TEXT)
├── subject_hindi (TEXT)
├── content_hindi (TEXT)
├── subject_marathi (TEXT)
├── content_marathi (TEXT)
├── pdf_filename (TEXT)
├── sent_date (DATE NOT NULL)
└── created_at (TIMESTAMP)
```

***

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Hrishikesh-Gavai/Uni-Mail-Pro.git
cd Uni-Mail-Pro
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup environment variables**

Create `.env` file:
```env
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_key
```

4. **Run the app**
```bash
npm start
```

Visit `http://localhost:3000` 🎉

***

## 📸 Screenshots

### Compose Email
Beautiful email composer with multi-language translation and file upload

### Email Records
Sortable, searchable database with export functionality

### Mobile Responsive
Works perfectly on all devices 📱💻

***

## 🎓 Learning Outcomes

This project demonstrates:

✅ **Database Design** - Creating normalized tables and relationships  
✅ **CRUD Operations** - Implementing Create, Read, Update, Delete operations  
✅ **API Integration** - Working with RESTful APIs  
✅ **File Storage** - Managing file uploads and cloud storage  
✅ **Data Export** - Generating Excel reports from database  
✅ **Frontend Development** - Building responsive React applications  
✅ **State Management** - Managing complex application state  
✅ **Real-time Operations** - Implementing live database interactions  

***

## 📦 Dependencies

```json
{
  "@supabase/supabase-js": "^2.38.0",
  "lucide-react": "^0.263.1",
  "react": "^18.2.0",
  "react-hot-toast": "^2.4.1",
  "xlsx": "^0.18.5"
}
```

***

## 🤝 Contributing

This is an academic project, but we welcome suggestions and feedback!

***

## 📄 License

This project is created for educational purposes as part of the DBMS curriculum.

***

## 🙏 Acknowledgments

- **K.K. Wagh Institute of Engineering Education and Research**
- **Department of Computer Engineering**
- **DBMS Course Faculty**

***

## 📞 Contact

For queries or suggestions, feel free to reach out:

- 📧 Email: hrishikeshgavai@gmail.com
- 🐙 GitHub: [@Hrishikesh-Gavai](https://github.com/Hrishikesh-Gavai)

***

<div align="center">

### ⭐ If you found this project helpful, please give it a star!

**Made with ❤️ by TY-A Computer Engineering Students**

[🌐 Visit Live Site](https://uni-mail-pro.vercel.app/) -  [📝 Report Bug](https://github.com/Hrishikesh-Gavai/Uni-Mail-Pro/issues) -  [💡 Request Feature](https://github.com/Hrishikesh-Gavai/Uni-Mail-Pro/issues)

</div>

***

**© 2025 UniMail Pro - DBMS Mini Project**
