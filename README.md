# SocMark - HTML Structure Documentation

SocMark is a web application project combining social networking and creator marketplace capabilities. This documentation details the semantic **HTML5 structure** across all pages of the application, focusing entirely on structural hierarchy, semantic elements, and content organization without CSS styling.

---

## Project Structure

```text
SocMark/
├── login.html        # Authentication: User sign-in page
├── register.html     # Registration: New account creation page
├── profile.html      # Creator profile and post feed showcase page
├── images/           # Post, avatar, and banner media assets
├── avatar.svg        # Default user avatar vector
└── banner.svg        # Default banner vector
```

---

## Page Breakdown & Semantic HTML Hierarchy

### 1. `login.html` — Sign In Page

The login page uses a two-column layout (`<main class="auth-page">`) separating user interaction from visual branding.

#### Structural Tree
```text
<!DOCTYPE html>
└── <html>
    ├── <head> (Meta tags & Title)
    └── <body>
        └── <main class="auth-page">
            ├── <article class="auth-left">
            │   ├── <div class="auth-form-wrapper">
            │   │   ├── <header class="auth-brand-wrapper">
            │   │   │   ├── <div class="brand-icon-box"> (SVG Logo)
            │   │   │   └── <div class="auth-header">
            │   │   │       ├── <h1> ("Welcome to SocMark")
            │   │   │       └── <p> (Subtitle description)
            │   │   └── <form action="profile.html" method="get">
            │   │       ├── <div class="form-group"> (Email input)
            │   │       │   ├── <label for="email">
            │   │       │   └── <input type="email" id="email" required>
            │   │       ├── <div class="form-group"> (Password input)
            │   │       │   ├── <label for="password">
            │   │       │   └── <div class="input-wrapper">
            │   │       │       ├── <input type="password" id="password" required>
            │   │       │       └── <button type="button"> (Toggle password visibility SVG)
            │   │       ├── <div class="form-row-remember">
            │   │       │   ├── <div class="checkbox-group">
            │   │       │   │   ├── <input type="checkbox" id="remember-me">
            │   │       │   │   └── <label for="remember-me">
            │   │       │   └── <a href="#"> ("Forgot password?")
            │   │       ├── <button type="submit"> ("Continue")
            │   │       └── <p class="form-secondary-link"> ("Sign up" anchor link)
            │   └── <footer class="auth-bottom-terms">
            │       └── <p> (Terms of Service & Privacy Policy anchors)
            └── <aside class="auth-right">
                └── <div class="showcase-panel">
                    ├── <header class="showcase-header">
                    │   ├── <h2> ("Select & Combine & Integrate.")
                    │   └── <p> (Feature description)
                    ├── <div class="network-diagram">
                    │   ├── <svg class="network-svg"> (Background connecting grid)
                    │   ├── <div class="node-center"> (Central brand logo node)
                    │   └── 8 × <div class="node-item"> (Perimeter feature icons)
                    └── <footer class="carousel-indicators">
                        └── 3 × <span class="dot"> (Pagination indicators)
```

---

### 2. `register.html` — Registration Page

The registration page shares the consistent dual-column structure with an expanded registration form supporting varied user input types.

#### Key Form Controls
- **Full Name**: `<input type="text" id="fullname" required>`
- **Username**: `<input type="text" id="username" required>`
- **Email**: `<input type="email" id="email" required>`
- **Account Role**: `<select id="account-type" required>` with `<option>` values:
  - Buyer & Community Member
  - Merchant & Store Owner
  - Creator & Affiliate
- **Bio**: `<textarea id="bio" rows="2">`
- **Avatar Upload**: `<input type="file" id="avatar-file" accept="image/*">`
- **Password**: `<input type="password" id="password" required>`
- **Terms Agreement**: `<input type="checkbox" id="terms-agree" required>`
- **Form Submission**: `<button type="submit">` redirecting to `profile.html`

---

### 3. `profile.html` — Creator Profile Page

The profile page uses semantic HTML5 container elements (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`) to construct a creator portfolio and post feed.

#### Structural Tree
```text
<!DOCTYPE html>
└── <html>
    ├── <head> (Meta tags & Title)
    └── <body class="profile-page-body">
        ├── <header class="app-navbar">
        │   └── <nav>
        │       ├── <a href="profile.html" class="app-nav-brand"> (Brand SVG + Text)
        │       └── <ul class="app-nav-links">
        │           ├── <li><a href="login.html"> ("Sign In")
        │           ├── <li><a href="register.html"> ("Sign Up")
        │           └── <li><a href="profile.html" class="active"> ("Profile")
        └── <main class="creator-profile-container">
            │
            ├── <section class="creator-header-section">
            │   ├── <div class="cover-wrapper">
            │   │   ├── <img src="images/cover.jpg" alt="..."> (Panoramic Cover Banner)
            │   │   └── <div class="creator-avatar-container">
            │   │       └── <img src="images/avatar.jpg" alt="..."> (Overlapping Creator Avatar)
            │   │
            │   └── <div class="creator-details-row">
            │       ├── <div class="creator-identity">
            │       │   ├── <div class="creator-name-row">
            │       │   │   ├── <span class="flame-icon"> (Flame SVG)
            │       │   │   └── <h1> ("Johnathan Clein")
            │       │   └── <div class="creator-meta-info">
            │       │       ├── <span> ("Commercial photographer")
            │       │       └── <span class="creator-location">
            │       │           ├── <svg> (Location Pin)
            │       │           └── <span> ("California, USA")
            │       │
            │       └── <aside class="creator-stats-card">
            │           ├── <div class="stat-box"> (Subscribers: SVG + "3487" + label)
            │           ├── <div class="stat-divider">
            │           ├── <div class="stat-box"> (Posts: SVG + "28" + label)
            │           ├── <div class="stat-divider">
            │           └── <div class="stat-box"> (Likes: SVG + "1593" + label)
            │
            ├── <nav class="feed-control-bar">
            │   ├── <div class="tab-pill-group" role="tablist">
            │   │   ├── <button type="button" role="tab" aria-selected="true"> ("Posts")
            │   │   ├── <button type="button" role="tab" aria-selected="false"> ("Goals")
            │   │   ├── <div class="tab-vertical-divider">
            │   │   ├── <button type="button" role="tab" class="with-badge">
            │   │   │   ├── <span> ("Community")
            │   │   │   └── <span class="tab-counter-badge"> ("3")
            │   │   ├── <div class="tab-vertical-divider">
            │   │   └── <button type="button" role="tab"> ("Courses")
            │   │
            │   └── <div class="sort-dropdown-container">
            │       ├── <label for="sort-select"> ("Sort by:")
            │       └── <div class="sort-select-wrapper">
            │           ├── <select id="sort-select">
            │           │   ├── <option value="popular">Most popular</option>
            │           │   ├── <option value="recent">Most recent</option>
            │           │   └── <option value="liked">Most liked</option>
            │           └── <span class="sort-dropdown-chevron"> (Chevron Down SVG)
            │
            └── <section class="feed-grid-section">
                ├── <article class="feed-card" id="post-card-1"> (Locked Post)
                │   ├── <div class="card-media-wrapper">
                │   │   ├── <img src="images/post-1.jpg" alt="...">
                │   │   └── <div class="card-overlay-locked">
                │   │       └── <button type="button"> (Lock SVG + "Locked")
                │   └── <div class="card-content">
                │       ├── <div class="card-header-row">
                │       │   ├── <h2> ("My new project")
                │       │   └── <time datetime="12:09"> ("12:09 PM")
                │       ├── <p class="card-excerpt"> (...)
                │       └── <div class="card-footer-metrics">
                │           ├── <button type="button" class="like-btn"> (Heart SVG + "23" + "likes")
                │           └── <button type="button" class="save-btn"> (Bookmark SVG + "12" + "saved")
                │
                ├── <article class="feed-card" id="post-card-2"> (Premium Post)
                │   ├── <div class="card-media-wrapper">
                │   │   ├── <img src="images/post-2.jpg" alt="...">
                │   │   └── <span class="badge-premium"> ("Premium")
                │   └── <div class="card-content">
                │       ├── <div class="card-header-row">
                │       │   ├── <h2> ("My first photoshoot")
                │       │   └── <time datetime="2026-10-05"> ("1 day ago")
                │       ├── <p class="card-excerpt"> (...)
                │       └── <div class="card-footer-metrics"> (12 likes, 4 saved)
                │
                ├── <article class="feed-card" id="post-card-3"> (Premium Editorial Post)
                │   ├── <div class="card-media-wrapper">
                │   │   ├── <img src="images/post-3.jpg" alt="...">
                │   │   └── <span class="badge-premium"> ("Premium")
                │   └── <div class="card-content">
                │       ├── <div class="card-header-row">
                │       │   ├── <h2> ("Editorial for Urban Vibe")
                │       │   └── <time datetime="2026-10-03"> ("3 days ago")
                │       ├── <p class="card-excerpt"> (...)
                │       └── <div class="card-footer-metrics"> (48 likes, 19 saved)
                │
                └── <article class="feed-card" id="post-card-4"> (Standard Post)
                    ├── <div class="card-media-wrapper">
                    │   └── <img src="images/post-4.jpg" alt="...">
                    └── <div class="card-content">
                        ├── <div class="card-header-row">
                        │   ├── <h2> ("Rooftop Sunset Session")
                        │   └── <time datetime="2026-10-01"> ("5 days ago")
                        ├── <p class="card-excerpt"> (...)
                        └── <div class="card-footer-metrics"> (64 likes, 31 saved)
```

---

## HTML5 Semantic Elements Employed

| Semantic Tag | Usage in Project |
| :--- | :--- |
| `<header>` | Global top navigation bar and introductory branding wrappers |
| `<nav>` | Navigation links in the navbar and filter tab controls |
| `<main>` | Primary document content across login, registration, and profile views |
| `<section>` | Grouped content areas: creator header info and creator post feed |
| `<article>` | Self-contained authentication forms and independent post cards |
| `<aside>` | Ancillary content: branding showcase panel and creator numerical statistics |
| `<footer>` | Legal links, pagination dots, and card meta footers |
| `<time>` | Machine-readable timestamps for post creation dates |
| `<form>` | User credential input and account registration |
| `<select>` / `<option>` | Role selection and post sorting criteria |
| `<button>` | Interactive triggers: locked overlays, tab navigation, like & save buttons |

## Screenshot
### Profile
<img width="1470" height="839" alt="image" src="https://github.com/user-attachments/assets/d5d36853-af3c-47e6-8bed-d9a52e7165b0" />
![Uploading image.png…]()


### Login 
<img width="1470" height="839" alt="image" src="https://github.com/user-attachments/assets/44e5d0e8-769d-4267-83ef-a48bd330d01f" />
<img width="1470" height="956" alt="image" src="https://github.com/user-attachments/assets/359c3813-2708-4778-aa74-0dff95ca9d01" />

### Register
<img width="1470" height="842" alt="image" src="https://github.com/user-attachments/assets/d34848b0-5d48-458b-8cba-de84f45282ba" />
![Uploading image.png…]()


