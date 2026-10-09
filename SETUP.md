# Portfolio setup and deployment

## Run locally
Open `index.html` in Chrome. Submit the contact form, then scroll to **Admin responses** and use the demo PIN `2468`. Local responses are stored in Chrome `localStorage` as JSON.

## Connect Google Sheets
1. Create a Google Sheet.
2. Open **Extensions → Apps Script**.
3. Replace the contents of `Code.gs` with `GoogleAppsScript_Code.gs`.
4. Replace `PASTE_YOUR_GOOGLE_SHEET_ID_HERE` with the ID from the Sheet URL.
5. Save, then choose **Deploy → New deployment → Web app**.
6. Set it to execute as your account and choose access appropriate for your assignment. Public access means the endpoint may be called by other people, so do not use it for private data.
7. Deploy and copy the URL ending in `/exec`.
8. Open `script.js` and set `APPS_SCRIPT_URL` to that URL.
9. Test by submitting a message and checking the Google Sheet.

The project uses a JSONP-style Apps Script endpoint so the browser can receive responses without a CORS preflight. It is a simple teaching implementation. For a real application, use server-side authentication, access controls, rate limiting, and a safer API design.

## Publish with GitHub Pages
1. Sign in to GitHub and create a **public** repository, for example `portfolio-website`.
2. Upload the contents of this folder to the repository root. Ensure `index.html` is in the root.
3. Open repository **Settings → Pages**.
4. Under **Build and deployment**, select **Deploy from a branch**, choose `main` and `/(root)`, then save.
5. Wait for the deployment to finish. Open the URL shown in the Pages settings.
6. Test the navigation, theme toggle, contact form, admin login, and response timestamps on the published site.

GitHub Pages publishes static files, so the Apps Script endpoint is a separate service. Never put passwords or secrets in front-end JavaScript.
