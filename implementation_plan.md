# Import Missing Features from appdev-web to SOAVS

This plan outlines the steps required to import the functionalities that are present in the original `appdev-web` project but are missing in the newly cloned `SOAVS` project.

## Missing Features Identified

1. **Dashboard Statistics**: `appdev-web` had a dashboard showing total candidates, voters, active elections, and a turnout progression chart.
2. **User/Voter Management (Admin Side)**: Admins could view voters, delete them, and bulk import voters via CSV. 
3. **Partylist Management**: Candidates could be grouped into Partylists. There was a dedicated Partylist CRUD interface.
4. **Candidate Details & Position Hierarchy**: Candidates had additional fields: `platform_statement` and `course_and_year`. Positions had a `hierarchy_order` field for sorting.
5. **Election Results Reporting**: Admins had the ability to view the final vote tallies and print the election results.

## User Review Required

> [!NOTE]  
> **Resolved from User Feedback:** 
> 1. We will keep the CSV bulk import functionality.
> 2. We will ensure that voters can log in using their `student_id` (and password) just like in the mobile version and the original `appdev-web`. 
> 3. Newly registered users (via the web registration flow) will appear in the same "Voters" tab as the CSV imported users.
> 4. Admins will be able to view and delete users in this tab.

## Proposed Changes

---

### Backend Components

#### [MODIFY] `elections/models.py`
- **New Model**: `Partylist` with fields `election`, `name`, `description`.
- **Position Model**: Add `hierarchy_order` field.
- **Candidate Model**: Add `partylist` (ForeignKey to Partylist), `platform_statement` (TextField), and `course_and_year` (CharField).

#### [MODIFY] `elections/serializers.py`
- Add `PartylistSerializer`.
- Update `PositionSerializer` to include `hierarchy_order`.
- Update `CandidateSerializer` to include the new fields.
- Ensure the `ElectionSerializer` includes nested relations if necessary.

#### [MODIFY] `elections/views.py`
- Add `PartylistViewSet` for CRUD operations.
- Add `DashboardStatsView` to return turnout progression and statistics.
- Update `ElectionViewSet` with a `@action(detail=True, methods=['GET']) def results(...)` endpoint to calculate and return vote totals for each candidate.

#### [MODIFY] `elections/urls.py`
- Register `PartylistViewSet`.
- Add path for `DashboardStatsView`.

#### [MODIFY] `accounts/models.py`
- Add `student_id` to the `User` model, and potentially `course` and `year_level` if needed to match the original `appdev-web` Voter model.
- Add `is_active_session` (BooleanField, default=False) and `session_started_at` (DateTimeField) to track concurrent logins.
- Update `LoginSerializer` and `LoginView` to allow login using `student_id` and `password` to match the mobile app's requirements.

#### [MODIFY] `accounts/views.py` & `urls.py`
- **Active Session Security**: Update `LoginView` to reject logins if `is_active_session` is true and the session was started recently (e.g., within 5 minutes). Update `BallotSubmissionView` (in `elections/views.py`) to clear the `is_active_session` flag once a vote is cast.
- Add an `AdminUserViewSet` restricted to admins, allowing them to:
  - List registered users.
  - Delete users.
  - Bulk import user credentials (student IDs, emails, etc.) from a CSV file. These imported users will appear in the same list as self-registered users.
- Modify `RegisterView` to also capture the `student_id`.

---

### Frontend Components

#### [NEW] `src/pages/AdminDashboard.jsx`
- Recreate the dashboard page with statistic cards (Active Elections, Total Candidates, Total Voters, Total Votes).
- Implement the Turnout Progression chart.

#### [NEW] `src/pages/AdminUsers.jsx` (or `AdminVoters.jsx`)
- Create a table to list all registered users.
- Add a CSV import button to register users in bulk.
- Add delete functionality for user management.

#### [NEW] `src/pages/AdminPartylists.jsx`
- Create a page to add, edit, and delete partylists for specific elections.

#### [MODIFY] `src/pages/AdminCandidates.jsx`
- Update the candidate creation/editing form to include `Partylist` dropdown, `Platform Statement`, and `Course & Year` fields.

#### [MODIFY] `src/pages/AdminElections.jsx`
- Add a "View Results" button on each election card.
- Add a results modal or a new route (`/admin/elections/:id/results`) to display the vote counts and highlight the winners.
- Include a "Print Results" functionality as existed in `appdev-web`.

#### [MODIFY] `src/components/AdminLayout.jsx`
- Update the sidebar navigation to include links to the new pages: Dashboard, Users, Partylists.

## Verification Plan

### Automated Tests
- No automated tests are currently present, but I will ensure Django migrations run successfully.

### Manual Verification
1. Run backend migrations for the new fields (`Partylist`, candidate details, position hierarchy).
2. Start the frontend and verify the new Navigation tabs appear.
3. Test creating a Partylist, adding a Candidate with the new fields, and submitting a vote.
4. Verify the Dashboard stats update dynamically.
5. Verify that Election Results correctly tally the votes and format properly for printing.
