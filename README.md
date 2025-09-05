# PDD Theory Testing Web Application

## Project Overview
This project is a web application designed for testing and learning road traffic rules (PDD). The main goal is to automate the process of calculating user testing statistics. With this service, you can take tests consisting of 200 questions on road traffic theory and track your progress by viewing your test statistics. You can also review all road traffic theory and important information about the road traffic theory exam at the GIBDD.

## Features
- **Testing Modes:**
  - **Topics Mode:** Includes several dozen topics with collected questions. Progress is tracked for each topic.
  - **Exam Mode:** Consists of 20 random questions from all 200 questions.
  - **Hard Questions Mode:** Consists of 20 of the most difficult questions.

- **View Theory:** Access to all road traffic theory.
- **Exam Information:** Important information about the road traffic theory exam at the GIBDD.

## Technologies Used
- **Frontend:** JavaScript, React
- **Backend:** TypeScript, React
- **Database:** PostgreSQL (using TypeORM)

## Getting Started

### Prerequisites
- Node.js and npm installed on your machine
- PostgreSQL database

### Installation
1. Clone the frontend and backend repositories into the same directory:
   ```
   git clone https://github.com/hiashyr/backend
   git clone https://github.com/your-frontend-repo/frontend
   ```
2. Navigate to each project directory and install dependencies:
   ```
   cd backend
   npm install
   cd ../frontend
   npm install
   ```

### Database Setup
1. Import the database backup located in the `database` directory of the backend project. The backup was created using pgAdmin version 17.5.
2. Update the database connection details in the `data-source.ts` file and `.env` files as needed.

### Running the Application
1. Start the backend server:
   ```
   cd backend
   npm run dev
   ```
   By default, the backend server runs on port 5001.

2. Start the frontend development server:
   ```
   cd frontend
   npm start
   ```
   By default, the frontend server runs on port 3000.

## Project Structure
- `backend/`: Contains the backend code written in TypeScript.
- `frontend/`: Contains the frontend code written in JavaScript and React.
- `database/`: Contains the database backup file.

## Contributing
This is an educational project created as part of my third-year college coursework. Contributions are welcome! Please feel free to submit issues or pull requests.

## License
This project is licensed under the MIT License.

## Links
- Backend Repository: [https://github.com/hiashyr/backend](https://github.com/hiashyr/backend)
