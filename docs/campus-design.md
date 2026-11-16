# Campus Life Experiences — Design Draft

This document covers Ziyong Liu's Campus Life section of HuskyKit. The Academic Experiences section and shared authentication are separate team work.

## Purpose

Students can browse housing, commuting, food, and local activity experiences without an account. A signed-in student can share a Campus Life post and later edit or delete their own post. Posts are stored in the separate MongoDB collection named campusPosts.

## Persona

Alex lives off campus and wants practical advice about housing, commuting, and affordable food. Alex often has a specific neighborhood and budget in mind and needs to compare posts quickly before reading a full experience.

## User stories

1. As Alex, I want to search and filter Campus Life posts by keyword, topic, neighborhood, and budget level, so I can find advice that fits my needs.
2. As Alex, I want to open a post and read its location, budget level, tips, author, and last-updated date, so I can decide whether the information is useful.
3. As Alex, I want to create, edit, and delete my own Campus Life posts, so I can share experiences and update old information.

## Screen flow

1. The home page links to Campus Life.
2. The Campus Life list has a search field, topic/neighborhood/budget filters, results count, and post cards. Selecting a card opens its detail page.
3. The detail page shows the complete post and a visible synthetic-data label when applicable. Signed-in owners can access Edit and Delete.
4. The new/edit form asks for title, topic, neighborhood, budget level, location, body, and tips. It shows validation and save errors near the form.

Authentication and ownership decisions remain with the shared backend authentication implementation. The Campus Life UI will display actions only when the authenticated user is allowed to use them; the backend must enforce the same rule.

## Mockups

- [Campus Life list](mockups/campus-list.svg)
- [Campus Life detail](mockups/campus-detail.svg)
- [Campus Life form](mockups/campus-form.svg)

These are layout drafts. Sample copy is illustrative, not a claim that the displayed advice is real.
