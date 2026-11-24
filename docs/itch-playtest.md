# Publishing The Daily Deck as an itch.io playtest

This guide takes you from nothing to a private itch.io page that testers can play, with every finished game landing as a row in a Google Sheet. It takes about 20–30 minutes the first time.

**What testers get:** the game with **candidate ruleset v1** fixed (2 stakes · Grand Finale ×2 · Boost +2 · abilities apply to the round they're played). There are no experiment toggles or Balance lab. At the end of each game there's a short feedback box.

**What you get:**
- A **Games** tab with one row per finished game. These are the same columns as the prototype's CSV export, plus tester ID, name and device.
- A **Feedback** tab with each tester's answers and comments.
- Optionally, a summary email each morning.

---

## Step 1 — Create the Google Sheet and its receiver (about 10 minutes)

1. Create a new Google Sheet, e.g. **Daily Deck playtest results**.
2. In the Sheet: **Extensions → Apps Script**.
3. Delete whatever is in `Code.gs`, then paste in the whole of [`apps-script/Code.gs`](../apps-script/Code.gs) from this repo.
4. Near the top, change `TOKEN` to some random text of your own, e.g. `dd-7f3k29q`. Keep it handy for step 2.
5. Click **Save** (the disk icon).
6. In the function menu at the top, choose **`setup`** and click **Run**.
   - Google will ask you to authorise the script. Choose your account. If you see "Google hasn't verified this app", click **Advanced → Go to … (unsafe)**. It's your own script, so this is expected.
   - Check that the Sheet now has **Games** and **Feedback** tabs with headers.
7. **Deploy → New deployment.** Click the cog next to "Select type" and choose **Web app**. Then set:
   - **Description:** Daily Deck playtest
   - **Execute as:** Me
   - **Who has access:** **Anyone**. This lets the game post results without testers signing in to Google. It doesn't give anyone access to the Sheet itself.
8. Click **Deploy** and copy the **Web app URL**. It ends in `/exec`.
9. Optional check: open that URL in a browser. It should say *"The Daily Deck playtest endpoint is running."*
10. Optional morning email: choose **`setupDailySummary`** in the function menu and click **Run** once. A summary of the last 24 hours then arrives at about 8am, but only on days with games or feedback. To test it straight away, run **`sendDailySummary`**.

> **If you change `Code.gs` later**, the live endpoint doesn't update until you go to **Deploy → Manage deployments → ✏️ Edit → Version: New version → Deploy**. The URL stays the same.

---

## Step 2 — Build the itch.io version (about 2 minutes)

You can do this yourself, or send me the Web app URL and token and I'll build it.

1. In the repo, on the `itch-playtest` branch, copy `itch.config.example.json` to **`itch.config.json`**.
2. Fill it in:

   ```json
   {
     "endpoint": "https://script.google.com/macros/s/…/exec",
     "token": "dd-7f3k29q"
   }
   ```

   This file is git-ignored, so your URL and token stay out of GitHub.
3. Run `npm run build:itch` (or `bash build.sh itch`).
4. You get **`dist/itch/index.html`** and **`dist/the-daily-deck-itch.zip`**. Either can be uploaded; the game is a single self-contained file.

---

## Step 3 — Create the itch.io page (about 10 minutes)

1. Sign in at itch.io, then go to **Dashboard → Create new project**.
2. Fill in:
   - **Title:** The Daily Deck (playtest)
   - **Kind of project:** **HTML**
   - **Uploads:** upload `the-daily-deck-itch.zip` (or `index.html`), then tick **"This file will be played in the browser"**.
3. **Embed options:**
   - **Embed in page**
   - **Viewport dimensions:** **420 × 800**. It's a portrait, phone-shaped game, and it reflows to whatever width it's given.
   - Tick **Mobile friendly**. On phones itch.io always opens the game full screen.
   - Tick **Fullscreen button**.
   - Tick **Enable scrollbars**. The results screen is longer than one screen.
   - Leave **Automatically start on page load** on, or use click-to-launch if you prefer.
4. **Description:** something short, e.g. *"A daily tactical card game. Placeholder numbers only; this is a playtest of the rules. Results and any feedback are sent to the developer anonymously."*
5. **Visibility & access.** Choose one:
   - **Draft:** private. Use **"Secret URL"** at the top of the page preview to get a long, unguessable link to send to testers. They don't need an itch.io account. Best for a small, trusted group.
   - **Restricted:** set a **password** and share the link plus the password. You can pre-fill the password by adding `?password=YOURPASSWORD` to the page URL.
   - Avoid **Public** for now: it lists the game in itch.io's search.
6. **Save & view page**, play one game yourself, then check that a row appears in the **Games** tab within a few seconds.

---

## Step 4 — Invite testers

Send the secret link (or link plus password) with a short note. For example:

> I'm testing a new daily card game. It takes about two minutes a go. Could you play today's deck, and a practice deck or two, over the next few days? There's a quick feedback box at the end of each game. Your results come to me anonymously; add your name in the box if you're happy to.

Ask them to play the **daily deck** each day they can, plus **practice decks**. That gives the natural mix of daily rules (D28).

---

## Step 5 — Getting the results to Claude for analysis

In the Sheet, choose **File → Download → Comma-separated values** for the **Games** tab (and again for **Feedback**), then attach the CSVs here. The Games columns match the prototype's CSV, so the existing analysis scripts (`sim/stake-regret.js`, `sim/boost-summary.js`, `sim/finale-summary.js`) work on them unchanged.

---

## Updating the game later

1. Make the change on the branch, then run `npm run build:itch` again.
2. On itch.io: **Edit game → Uploads**. Delete the old file, upload the new one, and tick **"This file will be played in the browser"** again.
3. Bump the version in `src/engine.js` so rows from the new build can be told apart.

---

## How it works, and its limits

- **Sending:** when a game ends, it's saved on the tester's device and queued. The queue is sent to your Apps Script as a plain POST. If the tester is offline or closes the tab, it goes next time they open the game.
- **No delivery confirmation:** Google doesn't let the page read the reply, so the game can't be completely sure a row arrived. The receiver drops duplicates, so a game sent twice still gives one row. Each tester's **"Your games → Copy my games (CSV)"** is the fallback.
- **Junk protection:** the token stops casual junk, but it's visible in the game's code, so it's not real security. The script also rejects anything that doesn't look like a game record, and stops tester text from being read as a Sheet formula. For a private playtest that's enough.
- **Privacy:**
  - **What's sent:** the game record, a random tester ID, the device type (touch or mouse), the tester's feedback, and their name only if they choose to type it.
  - **What isn't:** no email address, IP address or location is recorded by the game.
  - **The notice:** this is shown in **How to play** and under the feedback box.
- **Developer view:** open the itch.io page with `#dev` at the end of the game's URL to show the Balance lab, and `#nodev` to hide it again. This is easiest in the uploaded file's direct URL.
- **Daily deck:** this is still based on each device's own date, so testers in other time zones may see a different deck near midnight.
