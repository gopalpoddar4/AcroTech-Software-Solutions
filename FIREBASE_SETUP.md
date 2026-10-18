# IT World — Firebase Realtime Database Integration & Architecture Guide

This document describes how Firebase is integrated into the IT World Career page, how to configure your Firebase project, and how the intern authentication workflow is architected.

---

## 1. Firebase Project Setup

### Step 1: Create a Firebase Project
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project** and name it (e.g., `it-world-website`).
3. Google Analytics is optional; complete project creation.

### Step 2: Register the Web App
1. On your Project Overview page, click the **Web icon (`</>`)** to register a web app.
2. Enter an app nickname (e.g. `IT World Web`).
3. You do **not** need to check Firebase Hosting if using GitHub Pages.
4. Click **Register app**.
5. Copy the configuration object keys.

### Step 3: Add Keys to `js/firebase-config.js`
Open `js/firebase-config.js` and replace the placeholder values:

```javascript
export const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-project-id.firebaseapp.com",
  databaseURL: "https://your-project-id-default-rtdb.firebaseio.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789...",
  appId: "1:123456789:web:abcdef..."
};
```

### Step 4: Create Realtime Database
1. In the Firebase Console left menu, navigate to **Build > Realtime Database**.
2. Click **Create Database**.
3. Choose a location closest to your users (e.g., `asia-southeast1` for Singapore, or `us-central1`).
4. Select **Start in locked mode**.

### Step 5: Deploy Security Rules
1. In your Realtime Database console, click the **Rules** tab.
2. Copy the contents of [`database.rules.json`](../database.rules.json) into the editor.
3. Click **Publish**.

---

## 2. Database Schema

### `internshipApplications/{applicationId}`
Stores applicant data when visitors submit the "Join as Intern" form.
- **Access:** Write-only by visitors (creates new record with status `pending`); Read-only by authorized administrators.
- **Fields:**
  - `applicationId` (string, generated via Firebase `push().key`)
  - `fullName` (string)
  - `email` (string)
  - `mobileNumber` (string)
  - `interestedRole` (string)
  - `collegeName` (string)
  - `degree` (string)
  - `studyYear` (string)
  - `skills` (string)
  - `introduction` (string)
  - `profileUrl` (string, optional)
  - `status` (string, default: `"pending"`)
  - `submittedAt` (server timestamp)

### `publicProfiles/{internUid}`
Public-facing directory powering the **"Our Interns"** showcase.
- **Access:** Public read (for profiles marked `profileVisible: true` and `status: "active"`). Write-restricted to admins.
- **Fields:**
  - `fullName` (string)
  - `role` (string)
  - `imageUrl` (string URL or path)
  - `status` (string: `"active"`)
  - `profileVisible` (boolean: `true`)

> **Security Note:** Private intern data (emails, intern IDs, internal notes) are maintained under `interns/{internUid}` and are never exposed to public visitors.

---

## 3. Intern ID & Account Creation Architecture

As required by the security specification, **application submission and intern account creation are strictly separated**:

1. **Submission Phase:** Candidate submits form &rarr; Record saved in `internshipApplications` with status `pending`.
2. **Review Phase:** IT World team evaluates the candidate in an administrative dashboard.
3. **Acceptance & Provisioning (Trusted Backend / Cloud Function):**
   - When marked "Accepted", an authorized backend process (e.g. Firebase Cloud Function with Firebase Admin SDK) executes:
     1. Generates a unique, standardized Intern ID (e.g., `ITW-2026-IN042`).
     2. Creates a Firebase Authentication user account using the intern's verified email and an initial secure temporary password.
     3. Stores the full private intern record in `interns/{uid}` mapping `internId` to Authentication `uid`.
     4. Creates the sanitized public record in `publicProfiles/{uid}` with `profileVisible: true`.
     5. Dispatches an onboarding email with their assigned Intern ID and temporary login link.

> **CRITICAL SECURITY NOTE:**
> Passwords, credential generation, and intern ID creation **must never occur in client-side JavaScript**. Doing so would expose administrative privileges. The client-side website prepares the data model, ready for the backend workflow.

---

## 4. Application Deadline Enforcement

- **Frontend Enforcement:** The Career page calculates the deadline (`25 October 2026, 23:59:59 Asia/Kolkata`) using standard JavaScript `Date` and `Intl.DateTimeFormat`. When expired, the button disables, "Applications Closed" displays, and form submission is blocked.
- **Backend / Trusted Enforcement:**
  Because GitHub Pages serves static client-side assets, client-side code alone cannot guarantee tamper-proof deadline enforcement (a visitor could modify local device time or send direct HTTP calls).
  For production security, deadline enforcement should be enforced on the server side via:
  1. A Firebase Realtime Database Rule validating `.write`: `now <= 1792953599000` (the Unix epoch millisecond timestamp corresponding to 25 Oct 2026 23:59:59 IST), or
  2. A Firebase Cloud Function callable endpoint (`submitInternshipApplication`) that checks server time before writing to the database.

---

## 5. Testing Without Live Firebase Credentials

The Career page includes graceful fallback handling:
- If Firebase credentials in `firebase-config.js` have not been replaced yet, the page loads smoothly without crashing.
- The **Current Openings** section displays the sample openings with the required "Sample Opening" badges.
- The **Join as Intern** section computes the deadline countdown.
- The **Our Interns** section displays the friendly empty state:
  *"Our intern community is growing. Check back soon to meet our interns."*
- When the form is submitted without credentials, a helpful validation notice reminds the developer to configure `firebase-config.js` while preserving all user input.
- Once valid Firebase credentials are added, the live Realtime Database listeners and submission activate automatically.
