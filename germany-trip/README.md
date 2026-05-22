# Germany Trip — Mobile Web App

A static, mobile-first web app for a 2-week Germany trip. Pulls its data from
`trip-data.json` in this folder — edit the JSON, commit, push, and the app
updates the next time it opens (or when you tap ⟳ in the header).

## What's in here

| File             | Purpose                                                  |
| ---------------- | -------------------------------------------------------- |
| `index.html`     | App shell (mobile viewport, tab bar)                     |
| `styles.css`     | Dark, mobile-first styling                               |
| `app.js`         | Fetches `trip-data.json` and renders tabs                |
| `trip-data.json` | **All trip content — edit this to update the app**       |
| `manifest.json`  | PWA manifest (Add to Home Screen → looks like a real app)|

No build step. No framework. Just open `index.html` in a browser.

## Deploy to the new `anativ/trip-planer` repo

Since this was built inside the `geojson` repo (my GitHub access is locked there),
here's how to move it to a new dedicated repo:

```bash
# 1. Create anativ/trip-planer on GitHub (empty, public, no README).

# 2. From this folder:
cd germany-trip
git init
git add .
git commit -m "Initial Germany trip mobile app"
git branch -M main
git remote add origin https://github.com/anativ/trip-planer.git
git push -u origin main
```

## Enable GitHub Pages (free hosting)

1. Go to **anativ/trip-planer → Settings → Pages**
2. Source: `Deploy from a branch` → branch `main` → `/ (root)` → Save
3. Wait ~1 min — your app is live at `https://anativ.github.io/trip-planer/`
4. Open the URL on your phone → Safari/Chrome menu → **Add to Home Screen**

You now have a phone-icon launcher that looks and feels like a native app.

## Update the trip on the go

1. Edit `trip-data.json` (GitHub.com lets you edit in the browser)
2. Commit
3. Open the app on your phone and tap ⟳ — new data appears

The app also auto-refreshes when you return to it from the background.

## JSON structure

```json
{
  "trip":            { title, subtitle, dates, travelers, ... },
  "overview":        [ { city, nights, icon } ],
  "itinerary":       [ { day, date, city, title, summary, activities, tips } ],
  "recommendations": { food, experiences, apps },
  "tips":            [ { title, body } ],
  "essentials":      { packing, documents }
}
```

Every activity can have a `map` field — a Google Maps URL that opens
directly when tapped.

## Features

- 🇩🇪 Mobile-first, dark UI
- 📅 14-day itinerary with collapsible day cards
- 📍 One-tap Google Maps links on every stop
- ⭐ Curated food, experiences, and apps
- 💡 Practical tips section
- 🔄 Pull-to-refresh + auto-refresh on focus
- 📴 Works offline after first load (uses localStorage)
- 📲 Installable as a PWA (Add to Home Screen)
- ✏️ Edit JSON in GitHub → app updates everywhere
