# Local verification — November 16, 2026 (America/Los_Angeles)

Scope: Chunzhang Liu's Academic Experiences and shared authentication. Base commit: `11ff2d6`. Tests used Node 24.22.1, a portable local MongoDB 8.0.38 on loopback port 27018, and headless Chrome. The team's Atlas database and a public deployment were not accessed or verified.

| Check | Result |
| --- | --- |
| Frontend ESLint and Prettier | Passed |
| Backend ESLint and Prettier | Passed |
| Vite production build | Passed; dependency-level React Router `use client` bundling warnings remain |
| Backend unit / existing Campus regression | 4 tests passed |
| Real MongoDB integration | All 5 scenarios passed (6 reported tests including the parent test); no skipped tests |
| Academic seed command | First run inserted 1,000; second run inserted 0; total remains 1,000 |
| Existing Campus seed command | Inserted 1,000 into the separate local `campusPosts` collection |
| Browser Academic workflow | Search, combined filters, empty results, pagination, registration, login redirect, create, detail, edit, cancel/confirm deletion, logout/login, and route refresh passed |
| Ownership | API rejects anonymous and non-owner writes, ignores forged author fields; anonymous demo details do not show owner buttons |
| Sessions | Passwords are hashed; duplicate usernames rejected; session survives another app instance; old cookie is invalid after logout |
| Existing Campus browser regression | Public list and detail passed |
| Responsive layout | No horizontal overflow at 390px on home, Academic list, login, and registration |
| Browser runtime | No uncaught page errors during the smoke test |

The integration tests create and remove an isolated randomly named database. The browser test uses the local `huskykit_local` database and removes its created post at the end. Screenshots contain synthetic data and a test account display name, not real student experiences.

## Actual application screenshots

- [Home](screenshots/home.png)
- [Academic filters and list](screenshots/academic-list.png)
- [Academic detail](screenshots/academic-detail.png)
- [Academic create form](screenshots/academic-form.png)
- [Registration](screenshots/register.png)
- [Academic mobile layout](screenshots/academic-mobile.png)

These are actual local application screenshots, separate from the SVG design mockups. They can be used when the final README is assembled, subject to updating them after the teammate's remaining changes.

## Remaining verification

After Campus write operations are added, test its full CRUD and ownership flow. After deployment, run the same browser workflow on the public HTTPS URL, verify production cookies, refresh direct links, verify the seed counts in the deployed database, and check public video/form/thumbnail links. Local success is not evidence of a completed public deployment.
