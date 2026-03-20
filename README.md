# ScholarSync - MERN Stack Project

This repository contains the ScholarSync web application. It has been upgraded to include a full Node.js/Express and MongoDB backend to replace the local storage testing logic.

## Project Structure

*   **/Scholar-Sync/**: The frontend code (HTML, CSS, JS). This acts as the client side of the application.
*   **/backend/**: The Node.js/Express server and MongoDB models.

## Prerequisites

1.  **Node.js**: Make sure you have Node.js installed on your computer.
2.  **MongoDB**: Make sure MongoDB is installed locally and running on port `27017` (or provide a remote URI in `backend/.env`).

## How to Run the Backend (Server)

1. Open your terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```

2. Install the necessary dependencies (if not already installed):
   ```bash
   npm install
   ```

3. Start the Node.js server:
   ```bash
   node server.js
   ```

   The server will run on `http://localhost:5000` by default. You should see a message saying `MongoDB Connected successfully!`.

### Seed the Database (Optional)
Once your server is running, you can open your browser or Postman and hit `http://localhost:5000/api/seed` to populate your database with a few sample assignments, contests, and certifications.

## Connecting the Frontend

The current HTML files in `Scholar-Sync` are using `localStorage`. Now that your backend is up and running, you'll want to modify your frontend JavaScript to use `fetch()` requests instead of `localStorage`.

### Example of changing the logic:
Instead of `const users = JSON.parse(localStorage.getItem('users'));`, you will make an HTTP request to the backend:

```javascript
fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: studentId, password: studentPassword, role: 'student' })
})
.then(res => res.json())
.then(data => {
    if(data.token) {
        // Save the JWT token your backend sent
        localStorage.setItem('token', data.token);
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        window.location.href = 'index.html';
    } else {
        alert(data.message); // Should say 'Invalid credentials'
    }
});
```

Similarly, you'll need to fetch the assignments and contests from the backend on `index.html`:

```javascript
const token = localStorage.getItem('token');
fetch('http://localhost:5000/api/assignments', {
    headers: { 'Authorization': token }
})
.then(res => res.json())
.then(assignments => {
    document.getElementById('assignment-count').innerText = `${assignments.length} Assignments`;
});
```
