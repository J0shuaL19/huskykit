# Academic Experiences and shared authentication

Owner: Chunzhang Liu. Team: Chunzhang Liu and Ziyong Liu.

## Project description

HuskyKit helps Northeastern students find academic and campus life experiences that would otherwise be lost in group chats. The two independent sections use separate MongoDB collections, API endpoints, and React pages. Reading and searching are public; creating, editing, and deleting require a registered account, with edits and deletion limited to the author.

This document covers the Academic section and shared authentication. See [Campus Life design](campus-design.md) for Ziyong Liu's section and mockups. The Campus Life write flow is a planned teammate deliverable, not implemented by this change.

## Personas

| Persona | Situation | Goal | Frustration |
| --- | --- | --- | --- |
| Maya | A new Northeastern graduate student | Find relevant study advice by program and course | Useful messages are scattered across chats; context is missing |
| Daniel | A returning student with project experience | Share practical lessons and keep them updated | Advice is repeated, and old versions are hard to correct |
| Alex | A student living off campus | Find housing, commuting, and food advice for a neighborhood and budget | General recommendations do not fit a specific location or budget |

## Academic user stories and acceptance criteria

1. **As Maya, I want to search and filter academic posts by keyword, topic, program, and course code, so I can find useful study advice.** The public list combines all four filters, stores filters in the URL, shows a result count, and paginates 20 records at a time. Clear resets filters. Loading, error, and empty states are explicit. Course codes are normalized to uppercase; keyword matching is literal and case-insensitive.
2. **As Maya, I want to open an academic post and read its details, tips, author, and last-updated date, so I can decide if the advice is helpful.** Each card links to a complete detail page; the back link preserves list filters. Synthetic posts have a visible demo label.
3. **As Daniel, I want to create, edit, and delete my own academic posts, so I can share my experiences and keep them updated.** Sharing while signed out redirects to login and then returns to the form. The server derives the author from the session. Only the owner sees Edit/Delete; the server independently rejects all unauthorized changes. Delete requires a confirmation step.

## Shared authentication

Students register with a unique username, display name, and password. Passport's local strategy verifies a bcryptjs password hash. Passport serializes the user ID into an express-session login session. A small MongoDB-backed store uses the existing native driver, so no extra session-store dependency is needed. Cookies are HttpOnly and SameSite=Lax, and Secure in the HTTPS production deployment. Logout destroys the session. Mutations use JSON and an X-HuskyKit header; no CORS middleware is installed.

## Screen flow and mockups

Home → Academic list → Post detail. From the list, Share → Login/Register if needed → New post → Detail. From an owned detail page, Edit → Form → Detail, or Delete → Confirm → List.

- [Academic list mockup](mockups/academic-list.svg)
- [Academic detail mockup](mockups/academic-detail.svg)
- [Academic new/edit mockup](mockups/academic-form.svg)
- [Shared authentication mockup](mockups/auth.svg)

Mockups are illustrative layout drafts, not evidence of real student experiences. The implementation uses native links, buttons, labels, inputs, selects, and textareas. All React components have PropTypes declarations; components without props use an empty declaration. Component-specific CSS is imported by its corresponding component. The layout stacks filters and form fields on narrow screens.

## Data and API

`academicPosts` stores title, topic, program, optional courseCode, body, tips, authorId, author, createdAt, updatedAt, and isSynthetic. Seed records additionally have a unique seedKey and have no owner account. Academic topics are Study tips, Course planning, Group projects, and Academic resources. Programs are Computer Science, Information Systems, Data Science, and Other; this small list keeps the demo scoped and consistent.

| Endpoint | Access | Purpose |
| --- | --- | --- |
| GET /api/academic-posts | Public | Filtered and paginated list |
| GET /api/academic-posts/:id | Public | Complete experience |
| POST /api/academic-posts | Signed in | Create an experience |
| PUT /api/academic-posts/:id | Owner | Update allowed content fields |
| DELETE /api/academic-posts/:id | Owner | Delete an experience |
| POST /api/auth/register | Public | Register and log in |
| POST /api/auth/login | Public | Log in using Passport local |
| GET /api/auth/me | Public | Current user or null |
| POST /api/auth/logout | Session | Destroy login session |

`users` and `sessions` support shared authentication; they do not replace the two required CRUD content collections. `academicPosts` and `campusPosts` remain independent. A unique username index prevents duplicate accounts; session records have an expiry index. The academic seed creates 1,000 labeled synthetic records without deleting existing posts and can be rerun safely. The teammate's existing campus seed creates another 1,000.

## Scope

No social login, email verification, comments, ratings, uploads, maps, recommendation service, or UI framework. Runtime additions are limited to the proposal's passport, passport-local, express-session, and bcryptjs. React Router and PropTypes were already present; ESLint, Prettier, and Vite remain development tooling. No axios, Mongoose, CORS package, or external content service is added.
