# Test Platform

## 📌 Overview
The **Test Platform** is a web-based system designed to facilitate online testing and evaluation. It allows instructors to create and manage tests while enabling students to participate in timed assessments with real-time monitoring. The platform includes advanced features such as question banks, test tracking, and time management tools.

## 🚀 Features
- **User Management**: Admins can add, remove, and manage students and instructors.
- **Test Creation**: Ability to create tests with customizable question banks.
- **Time Tracking**: Automated countdown timer for each test.
- **Test Monitoring**: Real-time tracking of student progress using WebSockets.
- **Pause/Resume Test**: Instructors can pause or resume tests for specific students.
- **Extend Time**: Additional time can be granted to students dynamically.
- **Role-Based Access**: Admins, instructors, and students have different permissions.

## 📂 Database Structure (Firestore)
The platform utilizes **Firebase Firestore** as its database. The key collections include:

### **Users Collection (`users`):**
```json
{
  "id": "user123",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "role": "Student",
  "profilePic": "https://example.com/profile.jpg",
  "disciplines": ["Mathematics", "Physics"]
}
```

### **Courses Collection (`courses`):**
```json
{
  "id": "course123",
  "disciplineName": "Web Development",
  "course": "2",
  "students": [
    {"id": "user123", "email": "john.doe@example.com"},
    {"id": "user456", "email": "jane.smith@example.com"}
  ]
}
```

### **Tests Collection (`tests`):**
```json
{
  "id": "test789",
  "user": {
    "id": "user123",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com"
  },
  "discipline": "Mathematics",
  "questionCount": 10,
  "remainingTime": 1200,
  "paused": false,
  "completed": false
}
```

## 🛠️ Installation & Setup
### **1. Clone the repository**
```sh
cd test-platform
```

### **2. Install dependencies**
```sh
npm install
```

### **3. Setup Firebase**
- Create a Firebase project at [Firebase Console](https://console.firebase.google.com/).
- Enable **Firestore Database** and **Authentication**.
- Update the `firebaseConfig` in `settings.js` with your Firebase credentials.

### **4. Start the development server**
```sh
npm start
```

## 🔗 WebSocket Setup (Optional for Real-Time Tracking)
To enable real-time tracking, you need a WebSocket server:
```sh
node websocket-server.js
```

