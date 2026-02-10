# Finance Tracker (Local Tool)

I built this because most finance apps either automate too much or force you into a rigid system. I wanted a local, flexible setup that keeps you involved in your finances and easy to adapt if your needs change.

The focus is intentionality: you import your own data, review it, and tag or split transactions yourself instead of relying entirely on automation.

## Architecture

The app uses a **Flask backend** and a **React frontend**.

The app is structured in a modular way, following **clean architecture and SOLID principles**, so things like import logic, rules, and storage can be adjusted or swapped without breaking the rest of the system. It’s designed to be extended rather than locked into one workflow.

All data is stored locally in a SQLite database.

## How it works

- Transactions are imported from CSV files
- A parser processes the raw data and stores it locally
- The frontend lets you review, tag, split, and manage transactions interactively

Tagging uses a pill-based system (instead of dropdowns), supports multiple tags per transaction, and allows clean splits when a transaction spans multiple categories.

Automation exists through simple keyword rules, but everything remains visible and editable.

## Running the app

Right now the importer is optimized for **CIBC CSV exports**.

1. Place your CSV files in the `csv_imports` folder  
2. Run `main.py` once — this parses the CSVs and loads them into the local database  
3. Start the backend server by running `app.py`  
4. Start the frontend with:
   ```bash
   npm start
