# 📧 UniMail Pro

A simple email management system for DBMS mini project.

🌐 **Live Demo:** https://uni-mail-pro.vercel.app/

***

## 📚 Project Info

- **Course:** Database Management Systems (DBMS)
- **Class:** TY-A Computer Engineering
- **College:** K.K. Wagh Institute of Engineering Eductaion & Research, Nashik.

---

## 👥 Team

- Hrishikesh Gavai
- Dhruvesh Patil
- Nakshatra Rao
- Palak Lokwani

***

## ✨ Features

- 📝 Compose and save emails
- 🌐 Multi-language translation (Hindi & Marathi)
- 📎 Upload PDF attachments
- 🔍 Search and filter records
- 📊 Export to Excel
- 🔗 Gmail integration

***

## 🛠️ Tech Stack

- ⚛️ React.js - Frontend
- 🗄️ Supabase - Database
- 🎨 CSS - Styling
- ▲ Vercel - Hosting

***

## 📂 Database Table

```
email_records:
├── id
├── from_user
├── to_user
├── subject
├── content
├── subject_hindi
├── content_hindi
├── subject_marathi
├── content_marathi
├── pdf_filename
├── sent_date
└── created_at
```

***

## 🚀 Setup

```bash
# Clone repo
git clone https://github.com/Hrishikesh-Gavai/Uni-Mail-Pro.git

# Install dependencies
npm install

# Add .env file
REACT_APP_SUPABASE_URL=your_url
REACT_APP_SUPABASE_ANON_KEY=your_key

# Run
npm start
```

***

## 🔄 CRUD Operations

✅ **CREATE** - Save new email records  
✅ **READ** - View all saved emails  
✅ **UPDATE** - Edit and translate content  
✅ **DELETE** - Remove recipients and attachments  

***
