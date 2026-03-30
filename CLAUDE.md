# Architecture Design: [至缮社 Crafted Fine Lab] Studio Website

This document outlines the architectural and UI/UX design for the [至缮社 Crafted Fine Lab] architecture design studio website.

## 1. Overall Concept & Aesthetic

*   **Core Concept:** The website's design will be clean, minimalist, and emulate the experience of reading a book.
*   **Typography:** A serif font will be used throughout the site to enhance the book-like feel. The specific font is to be determined.
*   **Color Palette:**
    *   Background: Light beige or white.
    *   Text: Black or gray.
*   **Interactive Elements:**
    *   **Link Interaction:** On hover, an animated underline will appear, drawing itself from left to right beneath the link text.

## 2. Page-by-Page Breakdown

### 2.1. Homepage

*   **Layout:** A full-screen, single-page layout.
*   **Content:**
    *   Logo
    *   Brand Name
    *   Manifesto/Tagline
*   **Localization:** The manifesto will be displayed in both English and Chinese simultaneously.
*   **Navigation:** Users can either scroll down or click an explicit button to navigate to the main menu.

### 2.2. Menu Page

*   **Layout:** A full-screen page designed to look like a book's table of contents.
*   **Structure:**
    *   **I. Works:**
        *   The sub-list of projects is always visible on desktop, indented under this heading.
        *   It contains a sub-list of individual projects.
        *   Each project is represented by a small square thumbnail image and its title.
    *   **II. About:**
        *   A primary navigation link.
    *   **III. Contact:**
        *   A primary navigation link.
*   **Dynamic Project List (Works Section):**
    *   The number of projects visible at one time will dynamically adjust based on the browser window's height.
    *   As the user scrolls through the project list, a "snap-to-item" behavior will ensure that each project entry is fully visible and aligned, preventing partial views.
*   **Mobile Layout:**
    *   The initial view will only show the three main tabs: "Works", "About", "Contact".
    *   Tapping on "Works" will navigate the user to a separate, dedicated page listing all the projects.

### 2.3. Project Detail Page

*   **Desktop Layout (Two-Column):**
    *   **Left Column (50% width):**
        *   Project Title.
        *   A paragraph of project description.
        *   Below the description, a series of plan drawings will be displayed in a "waterfall style," where the number of columns adjusts dynamically based on screen width. Clicking on a plan image will open it in a full-screen modal view.
    *   **Right Column (50% width):**
        *   A carousel of project images.
        *   Images will fill either the full height or full width of the column.
        *   Navigation: Users can swipe or click on the current image to advance to the next one. There will be no grid of thumbnails for the image gallery.
*   **Mobile Layout:** A layered, single-column layout:
        *   The top half of the screen will be occupied by the project image carousel.
        *   The project title and description will appear below the images.
        *   On scroll, the text content will slide up and cover the image section.
        *   The waterfall-style plan drawings will follow below the text content.

### 2.4. About Page

*   **Content:** A simple page containing a description of the studio. Content will be defined later.

### 2.5. Contact Page

*   **Content:** A simple page containing contact information (e.g., email, address). Content will be defined later.

## 3. Common UI Elements

*   **Header:**
    *   Appears on all pages except the homepage.
    *   **Center:** The studio's logo.
    *   **Left/Right:** A menu button (text-based, e.g., "Menu") that opens the full-page menu overlay.
    *   **Top Right:** Language toggle button.
*   **Language Toggle:**
    *   Appears on all pages except the homepage.
    *   Allows users to switch between English and Chinese content.
    *   The switch should be instantaneous, happening client-side without a full page reload.
    *   The user's language preference should be persisted across sessions (e.g., using `localStorage`).
    *   The current language could be reflected in the URL using a query parameter (e.g., `?lang=en` or `?lang=zh`) for shareability, without requiring separate URLs for each language version of a page.

## 4. Technical Implementation

*   **Language & Framework:** The project will be built using **TypeScript** and the **Next.js** (React) framework. This stack is chosen for its performance (Static Site Generation), seamless integration with Vercel's features (especially Image Optimization), and robust component-based architecture.
*   **Data Management:** Project data (titles, descriptions, images, etc.) will be managed using static files (e.g., JSON, Markdown) for optimal performance and simplicity.
*   **Animations:** All animations, including the link hover effects and the scroll-snapping on the project list, will be implemented using modern, performant CSS (e.g., `scroll-snap-type`).
*   **Content for About/Contact:** The "About" and "Contact" pages will initially be empty and completed later.
*   **Image Optimization:**
    *   **Storage:** High-resolution source images will be stored using **Git Large File Storage (Git LFS)** to keep the main repository fast and lightweight. Vercel fully supports this.
    *   **Primary Method:** Leverage Vercel's built-in Image Optimization service.
    *   **Format:** Automatically serve next-gen formats like WebP/AVIF with fallbacks.
    *   **Sizing:** Store only high-resolution source images; use Vercel to resize them on-demand for different screen sizes (`srcset`).
    *   **Loading (General):** Implement lazy loading (`loading="lazy"`) for all off-screen images and use low-quality image placeholders (LQIP) to improve perceived load time.
    *   **Loading (Project Carousel):**
        1.  The first image will be loaded **eagerly** for immediate visibility.
        2.  Subsequent images will be **lazy-loaded**.
        3.  A script will **pre-fetch** the next image in the sequence during idle time to ensure instant transitions when the user navigates the carousel.
