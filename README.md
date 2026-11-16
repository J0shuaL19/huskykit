# HuskyKit

HuskyKit is a planned community website where Northeastern students can share academic and campus life experiences. Visitors will be able to browse and search posts; registered users will be able to manage their own posts.

## Authors

- Chunzhang Liu — Academic Experiences and shared authentication
- Ziyong Liu — Campus Life Experiences and shared navigation/home page

## Project status

The Campus Life public read API is the first implementation milestone. The frontend, write operations, authentication, seed data, deployment, and screenshots have not been added yet.

## Planned stack

- Frontend: React with Hooks, React Router, Fetch API, PropTypes
- Backend: Node.js and Express
- Database: MongoDB with the native Node.js driver
- Authentication: Passport local strategy, express-session, bcryptjs

## Structure

- `frontend/`: React client and component styles
- `backend/`: Express API, database access, authentication, and seed scripts
- `docs/`: design document and mockups

## Course and build information

The backend requires Node.js, npm, and a MongoDB connection. In the backend directory, run npm install, set MONGODB_URI (and optionally MONGODB_DB and PORT) using backend/.env.example as a reference, then run npm start. The API provides GET /api/health, GET /api/campus-posts, and GET /api/campus-posts/:id. The list endpoint accepts keyword, topic, neighborhood, budgetLevel, and page. It returns 20 posts per page.

The course link, screenshots, and frontend build instructions will be added as those parts become available.

## AI disclosure

AI assistance was used to plan the initial repository structure, write the initial documentation, and implement the first Campus Life public read API and its test. Further AI assistance will be disclosed here as the project develops.

## License

MIT — see [LICENSE](LICENSE).
