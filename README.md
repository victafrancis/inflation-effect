# Inflation Effect

🔗 **Live Project:** [francisvicta.com/inflation-effect](https://francisvicta.com/inflation-effect)

## About the Project
Inflation Effect is a data-driven web app that shows how everyday items in Canada have changed in price over time, and compares those costs against Bitcoin’s price history. The goal is to make inflation tangible and highlight how Bitcoin can act as a hedge against rising costs.

I sourced public datasets (Numbeo, Statistics Canada, press releases, and other open data) and carefully cleaned them for consistency. Using these, I designed a **PostgreSQL schema**, built a **backend API** to serve historical price and Bitcoin data, and created a **frontend** that presents the data in a swipe-based slide experience.

## How It Works
1. **Data Collection & Cleaning**  
   - Everyday goods and services (food, rent, transport, tech, etc.) were compiled from public sources.  
   - Missing years were filled with linear interpolation and modest projections.  
   - Bitcoin monthly prices were included for context.

2. **Database Design**  
   - PostgreSQL database with normalized tables for items, historical prices, and BTC price history. 
   - Items can store metadata such as category, unit, and optional image URLs.

3. **Backend**  
   - REST API built to query items and serve pre-processed datasets.  
   - Powers the frontend with inflation comparisons in CAD vs BTC.

4. **Frontend**  
   - React/Tailwind single-page application with swipeable slides.  
   - Some slides compares the past, present, and projected cost of an item in both fiat and Bitcoin terms.  
   - Deployed to [francisvicta.com/inflation-effect](https://francisvicta.com/inflation-effect).

## Tech Stack
- **Database:** PostgreSQL (Neon hosting)  
- **Backend:** Node.js + Cloudflare Workers  
- **Frontend:** React + Vite + Tailwind CSS  
- **Data Sources:** Numbeo, Statistics Canada, Apple, Honda, Global News, etc.  

---
