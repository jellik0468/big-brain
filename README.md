BigBrain React Frontend
BigBrain is a single-page React.js application built for managing and playing quiz-style games, integrating with a provided backend. The frontend supports full admin and player functionalities without requiring page refreshes.
Features
Admin Features
Authentication: Register, login, logout with form validation and error handling.
Game Management: Create, edit, and delete games; manage questions (single-choice, multiple-choice, judgement), attach media, and set point/time values.
Game Sessions: Start/stop game sessions, copy session links, advance questions, and view live results with charts.
Results Tracking: View top players, question accuracy, response times, and overall performance.
Optional Features (pair work): Upload game files, manage past sessions, advanced points system.
Player Features
Join a game via session link or ID
Enter username and play game in real-time
View question media, select answers, and track performance
Post-game results with scores and timing
Extra
Lobby screen for waiting players
Fully responsive, real-time updates
Linting and extensive unit/UI testing
Tech Stack
React.js (SPA)
State management for live updates
REST API integration with backend
Vitest and Cypress for testing
