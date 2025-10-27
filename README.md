# 📧 UniMail Pro bruh

> A professional email management system with database integration

🌐 **Live Demo:** [https://uni-mail-pro.vercel.app/](https://uni-mail-pro.vercel.app/)

***

## 📋 About

UniMail Pro is a web-based email management application built as a mini project for Database Management Systems (DBMS) course. It demonstrates practical implementation of database operations with a modern user interface.

**Academic Details:**
- **Course:** Database Management Systems (DBMS)
- **Class:** TY-A Computer Engineering
- **Institution:** K.K. Wagh Institute of Engineering Education and Research

***

## 👥 Team Members

| Name | Role |
|------|------|
| Hrishikesh Gavai | Developer |
| Dhruvesh Patil | Developer |
| Nakshatra Rao | Developer |
| Palak Lokwani | Developer |

---

## ✨ Key Features

- 📝 **Email Composer** - Create and save professional emails
- 🌍 **Multi-Language** - Automatic translation to Hindi and Marathi
- 📎 **File Attachments** - Upload and manage PDF files (up to 40MB)
- 🗄️ **Database Storage** - All records stored in PostgreSQL via Supabase
- 🔍 **Search & Filter** - Find emails by date, sender, recipient, or content
- 📊 **Excel Export** - Download records with clickable PDF links
- 🔗 **Gmail Integration** - Open composed emails directly in Gmail
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile

***

## 🛠️ Technology Stack

**Frontend:**
- React.js - UI framework
- CSS3 - Styling
- Lucide React - Icons
- React Hot Toast - Notifications

**Backend:**
- Supabase - PostgreSQL database
- Supabase Storage - File storage

**APIs:**
- MyMemory Translation API - Language translation
- Gmail Compose - Email integration

**Hosting:**
- Vercel - Frontend deployment
- Supabase Cloud - Database hosting

***

## 📂 Database Schema

```sql
CREATE TABLE email_records (
  id              BIGSERIAL PRIMARY KEY,
  from_user       TEXT,
  to_user         TEXT NOT NULL,
  subject         TEXT NOT NULL,
  content         TEXT,
  subject_hindi   TEXT,
  content_hindi   TEXT,
  subject_marathi TEXT,
  content_marathi TEXT,
  pdf_filename    TEXT,
  sent_date       DATE NOT NULL,
  created_at      TIMESTAMP DEFAULT NOW()
);
```

**Storage Bucket:** `pdfs` (40MB max per file)

***

## 🔄 CRUD Operations

| Operation | Implementation |
|-----------|----------------|
| **CREATE** | Insert new email records and upload PDF files |
| **READ** | Fetch, search, and filter email records |
| **UPDATE** | Translate content to regional languages |
| **DELETE** | Remove recipients and PDF attachments |

***

## 🚀 Local Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Supabase account

### Installation Steps

1. **Clone the repository**
```bash
git clone https://github.com/Hrishikesh-Gavai/Uni-Mail-Pro.git
cd Uni-Mail-Pro
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**

Create a `.env` file in the root directory:
```env
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Start development server**
```bash
npm start
```

Visit `http://localhost:3000` to view the application.

5. **Build for production**
```bash
npm run build
```

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

## 📸 Features Overview

### 1. Email Composition
- Smart recipient management with validation
- Quick select from predefined contacts
- Drag & drop PDF upload
- Auto-save functionality

### 2. Database Management
- Real-time data synchronization
- Advanced search capabilities
- Sortable columns
- Date-based filtering

### 3. Multi-Language Support
- One-click translation to Hindi
- One-click translation to Marathi
- Preserves original content

### 4. Data Export
- Excel file generation
- Clickable PDF download links
- Formatted columns

***

## 🎯 Learning Outcomes

This project demonstrates understanding of:

- Database design and normalization
- CRUD operation implementation
- REST API integration
- State management in React
- File upload and storage
- Real-time data operations
- Responsive web design
- Cloud deployment

***

## 📞 Contact

**Hrishikesh Gavai**  
📧 Email: hrishikeshgavai@gmail.com  
🐙 GitHub: [@Hrishikesh-Gavai](https://github.com/Hrishikesh-Gavai)

***

## 📄 License

This project is created for educational purposes as part of the DBMS curriculum at K.K. Wagh Institute of Engineering Education and Research.

---

## 🙏 Acknowledgments

- Department of Computer Engineering
- DBMS Course Faculty
- K.K. Wagh Institute of Engineering Education and Research

***

<div align="center">

**Made with ❤️ by TY-A Computer Engineering Students**

© 2025 UniMail Pro | DBMS Mini Project

</div>
