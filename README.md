# ColdMail 📧

ColdMail is a full-stack cold email automation platform designed to help users create, manage, schedule, and track email campaigns with automated follow-ups.

The application provides a modern frontend with a FastAPI backend and PostgreSQL database, along with integrations for Gmail, Google OAuth, AI-assisted email functionality, and background email scheduling.

---

## 🚀 Features

- 🔐 User authentication and authorization
- 🔑 JWT-based authentication
- 📧 Gmail integration
- 🔗 Google OAuth integration
- 📊 Campaign management
- ✉️ Cold email sending
- ⏰ Scheduled email campaigns
- 🔄 Automated follow-up emails
- 📩 Reply detection and tracking
- 📈 Campaign analytics
- 📎 Email attachments
- 👥 Subscriber management
- 🔔 Notifications
- 🤖 AI-assisted email functionality
- ⚙️ Background task scheduling
- 🗄️ PostgreSQL database
- 🔄 Database migrations with Alembic
- 🌐 RESTful APIs using FastAPI

---

## 🏗️ Project Architecture

```text
ColdMail/
│
├── ColdMail_Backend/
│   ├── app/
│   │   ├── auth/
│   │   ├── campaign/
│   │   ├── home/
│   │   ├── inbox/
│   │   ├── reply_detection/
│   │   ├── utils/
│   │   ├── database.py
│   │   ├── models.py
│   │   └── main.py
│   │
│   ├── alembic/
│   ├── requirements.txt
│   └── alembic.ini
│
└── coldmail_frontend/
    ├── app/
    ├── components/
    ├── libapi/
    ├── public/
    ├── utils/
    ├── package.json
    └── next.config.mjs
