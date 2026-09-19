# 🚀 Velozity Global Solutions Assignment

A full-stack backend application built using **Node.js**, **Express**, and **Prisma ORM**, designed to manage data efficiently with a structured database approach.

---

## 📌 Features

* 🔐 RESTful API architecture
* 🗄️ Database integration using Prisma ORM
* ⚡ Fast and scalable backend setup
* 📦 Environment-based configuration
* 🔄 Database migrations with Prisma
* 🧪 Clean project structure for maintainability

---

## 🛠️ Tech Stack

* **Backend:** Node.js, Express.js
* **ORM:** Prisma
* **Database:** (MySQL / PostgreSQL — update based on your project)
* **Tools:** Git, GitHub, Postman

---

## 📁 Project Structure

```
.
├── prisma/           # Prisma schema & migrations
├── src/              # Application source code
├── package.json      # Project dependencies
├── .env              # Environment variables
└── README.md         # Project documentation
```

---

## ⚙️ Setup Instructions

### 1️⃣ Clone the repository

```
git clone https://github.com/haarish73/Velozity-Global-Solutions-Assignment.git
cd Velozity-Global-Solutions-Assignment
```

---

### 2️⃣ Install dependencies

```
npm install
```

---

### 3️⃣ Configure environment variables

Create a `.env` file in the root:

```
DATABASE_URL="your_database_url"
PORT=5000
```

---

### 4️⃣ Generate Prisma Client

```
npx prisma generate
```

---

### 5️⃣ Run database migrations

```
npx prisma migrate deploy
```

---

### 6️⃣ Start the server

```
npm run start
```

For development:

```
npm run dev
```

---

## 📡 API Endpoints

| Method | Endpoint | Description     |
| ------ | -------- | --------------- |
| GET    | /api/... | Fetch data      |
| POST   | /api/... | Create resource |
| PUT    | /api/... | Update resource |
| DELETE | /api/... | Delete resource |

*(Update endpoints based on your actual routes)*

---

## 🚀 Deployment

This project is deployed on **Render**.

### Build Command:

```
npm install && npx prisma generate && npx prisma migrate deploy && npm run build
```

### Start Command:

```
npm start
```

## 🌐 Live Demo

### 🚀 Try the App


  👉 https://velozity-dashboard.netlify.app  

---

## ⚠️ Common Issues

### ❌ `package.json not found`

➡️ Make sure Render **Root Directory** is set correctly.

### ❌ Prisma errors

➡️ Ensure:

* Database URL is correct
* Node version is **18 or 20**



---

## 👨‍💻 Author

**Harish Khan**

* GitHub: https://github.com/haarish73
* LinkedIn: https://www.linkedin.com/in/abdul-harish-khan/

---

## ⭐ Support

If you like this project, give it a ⭐ on GitHub!
