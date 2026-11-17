# HuskyKit

HuskyKit is a planned community website where Northeastern students can share academic and campus life experiences. Visitors will be able to browse and search posts; registered users will be able to manage their own posts.

## Authors

- Chunzhang Liu — Academic Experiences and shared authentication
- Ziyong Liu — Campus Life Experiences and shared navigation/home page

## Project status

The Campus Life public read API, a 1,000-post synthetic seed script, and React browse/detail pages are implemented. The seed script and read API have been verified against an Atlas database. Write operations, authentication, deployment, and screenshots have not been added yet.

## Planned stack

- Frontend: React with Hooks, React Router, Fetch API, PropTypes
- Backend: Node.js and Express
- Database: MongoDB with the native Node.js driver
- Authentication: Passport local strategy, express-session, bcryptjs

## Structure

- `frontend/`: React client, page and component styles, and Vite configuration
- `backend/`: Express API, database access, authentication, and seed scripts
- `docs/`: Campus Life design draft and mockups; the full team design document is still pending

## Course and build information

The backend requires Node.js, npm, and a MongoDB connection. In the backend directory, run npm install, set MONGODB_URI (and optionally MONGODB_DB and PORT) using backend/.env.example as a reference, then run npm start. The API provides GET /api/health, GET /api/campus-posts, and GET /api/campus-posts/:id. The list endpoint accepts keyword, topic, neighborhood, budgetLevel, and page. It returns 20 posts per page.

For Atlas, create a cluster and a database user, allow your current IP address, and copy the Node.js driver connection string. Save it as MONGODB_URI in a local .env file and optionally set MONGODB_DB=huskykit. Do not commit that file or share the password. If .env is in the project root, run node --env-file=../.env scripts/seedCampus.js from backend to add 1,000 labeled synthetic Campus Life posts, then run node --env-file=../.env src/server.js to serve them. Running the seed command again only fills missing demo posts. The backend reads MONGODB_URI directly; separate MONGODB_USERNAME and MONGODB_PASSWORD variables are not currently used.

In a second terminal, run npm install and npm run dev from frontend. Open http://127.0.0.1:5173. Vite proxies /api to the backend on port 3000, so no CORS package is needed. Run npm run build, npm run lint, and npm run format:check in frontend to validate this stage.

The course link, screenshots, and production deployment instructions will be added as those parts become available.

## AI disclosure

AI assistance was used for the initial repository structure and documentation, Campus Life read API, synthetic seed script, React browse/detail pages, design draft, mockups, and related tests. Further AI assistance will be disclosed here as the project develops.

## License

MIT — see [LICENSE](LICENSE).
