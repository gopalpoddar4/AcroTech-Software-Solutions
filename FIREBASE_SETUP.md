# IT World — Firebase Realtime Database Integration & Admin Approval Guide

This document describes how Firebase is configured on the IT World Career page and how to manually approve internship applicants in the Firebase Console so they appear in real time under **"Our Interns"**.

---

## 1. Quick Approval Workflow (Firebase Console)

You do **not** need an admin dashboard or a second profile record. Everything is controlled directly from your existing `internshipApplications` database path:

### How to Approve an Applicant:
1. Open the [Firebase Console](https://console.firebase.google.com/).
2. Select your project: **`it-world-d8834`**.
3. In the left navigation, click **Build > Realtime Database**.
4. In the **Data** tab, expand **`internshipApplications`**.
5. Locate the applicant record (for example, the record for **`Gopal Poddar`** with ID `-P4BqL8IA-Bc4grmqr97`).
6. Hover over the **`status`** value (`"pending"`) and click the small pencil icon.
7. Change the value from **`pending`** to **`approved`** and press **Enter**.
8. **Result:** In any open browser window of `career.html`, that applicant will instantly appear under the **"Our Interns"** carousel without refreshing the page!

### How to Add a Profile Picture (Optional):
1. In the same applicant record in Firebase Console, hover over the application ID key and click the **`+` (Add child)** button.
2. In the **Name** box, type: **`imageUrl`**
3. In the **Value** box, paste an image link (e.g., `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300` or any HTTPS image).
4. Click **Add**.
5. **Result:** The intern's card in "Our Interns" will immediately display the photo. If no `imageUrl` is provided, the card displays a clean fallback avatar with the intern's initials (e.g. `GP`).

### How to Remove an Applicant from Our Interns:
- **Option A (Revert to pending):** Edit `status` back to **`pending`**. The intern will disappear from "Our Interns" immediately in real time.
- **Option B (Reject):** Edit `status` to **`rejected`**. The intern will disappear immediately.
- **Option C (Delete):** Click the **`x`** button next to the application record to delete it. The intern is immediately removed from the carousel.
- **Empty State:** If there are 0 approved applicants, the section automatically displays:
  *"Our intern community is growing. Check back soon to meet our interns."*

---

## 2. Realtime Database Security Rules for Demo

In your Firebase Console under **Realtime Database > Rules**, make sure your rules allow public read so that visitors' browsers can listen in real time to the approved status:

```json
{
  "rules": {
    "internshipApplications": {
      ".read": true,
      "$applicationId": {
        ".write": "!data.exists() && newData.exists()"
      }
    }
  }
}
```

Click **Publish** after editing rules.

---

## 3. Data Flow & Security Details

- **Submission:** When a candidate fills out the "Join Now" form on `career.html`, a new push record is created under `internshipApplications/{applicationId}` with `status: "pending"`.
- **Public Display:** The Career page listener filters records on the client side:
  - Only records with `status === "approved"` are displayed in "Our Interns".
  - Only public information is rendered: `fullName`, `interestedRole`, and `imageUrl`.
  - Sensitive applicant information (e.g., `email`, `mobileNumber`, `collegeName`, `degree`, `introduction`, etc.) is **never rendered** to the DOM or displayed in the showcase.
