# Relu Consultancy FTE Hiring Challenge: Data Extraction Platform

Production-grade web application displaying cleansed, verified, and deduplicated datasets extracted for the **Full-Time Data Extraction Engineer (FTE)** hiring challenge at **Relu Consultancy**.

## 🌐 Live Application
- **Live Deployment URL:** [https://prime3436.github.io/relu-data-extraction-platform/](https://prime3436.github.io/relu-data-extraction-platform/)

---

## 🎯 Platform Highlights

### 1. 🚢 Challenge 1 — Disney Cruise Line (`disneycruise.disney.go.com`)
* **Total Cruises Scraped:** 171 raw cards across 35 live pagination pages.
* **Deduplicated Output:** 111 unique packages adhering strictly to Step 5 cleaning rules.
* **Schema Compliance:** 13 standardized columns matching Page 3 reference specification (`Title`, `Ship`, `Departing From`, `Duration`, `Itinerary`, `Date Range`, `Weekday Range`, `Interior Price`, `Oceanview Price`, `Balcony Price`, `Suite Price`, `Booking URL`, `Bonuses`).
* **Data Quality:** Zero empty or null fields across all 111 records.

### 2. 🌿 Challenge 2 — Ingredients Network (`ingredientsnetwork.com`)
* **Suppliers Extracted:** 60 fully populated supplier entities.
* **Schema Compliance:** All 10 mandatory columns (`Company Name`, `Company Description`, `Sales Markets`, `Primary Business Activity`, `Categories`, `Events`, `Address`, `Email`, `Telephone`, `Website`).
* **Security & Decryption:** Cloudflare email hex-cipher de-obfuscation applied to restore valid contact emails.
* **Data Quality:** Zero empty cells across all 10 columns.

### 3. 📊 Form Answers & Executive Insights
* Direct interactive breakdown of the 10 assessment questions required in the official Google Form with verified counts and underlying engineering rationales.

### 4. ⚙️ Interactive Features
* **Real-Time Global Search:** Instant multi-column filtering.
* **Multi-Dimensional Dropdowns:** Filter by Cruise Ship, Departure Port, Supplier Business Activity, and Sales Markets.
* **Bi-directional Sorting:** Click any table column header to sort ascending/descending.
* **Dual View Modes:** Seamless toggle between Responsive Data Table and Card Grid View.
* **Deep Inspection Modal:** Click any row/card to inspect the full raw record and all nested attributes.
* **Data Export:** Instant one-click CSV and JSON export directly in the browser.

---

## 🛠️ Technology Stack
* **Structure:** Pure semantic HTML5
* **Design & Styling:** Modern Vanilla CSS3 (Custom Glassmorphism, HSL Color Tokens, Micro-animations)
* **Logic:** Vanilla JavaScript (ES6+ modular data binding, zero external runtime dependencies)
* **Hosting:** GitHub Pages with sub-second asset delivery and 100% uptime SLA.
