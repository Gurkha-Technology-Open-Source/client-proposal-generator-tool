# **Client Proposal Generator Tool**

## Overview

The **Client Proposal Generator Tool** is a web application designed to streamline the proposal creation process for prospective clients. This tool allows users to input their project details (such as budget, scope, and goals) and automatically generates a professional, branded proposal using the agency's predefined templates. The generated proposals are downloadable in a sleek PDF format, providing a consistent, branded experience while creating early touchpoints with prospective clients. This tool showcases the agency's professionalism and commitment to delivering tailored services.

---

## Features

- **Custom Proposal Generation**: Clients can input project details such as budget, scope, timelines, and goals.
- **Comprehensive Service List**: Includes Web Development, Digital Marketing (SEO, Social Media, Google Ads, TikTok), Graphic Design, and more.
- **Branded Templates**: All proposals follow the agency’s branded template, including logos, colors, and fonts.
- **Downloadable PDF**: Clients can download the generated proposal as a PDF for easy sharing and review.
- **Meeting Scheduling**: Integrated Calendly link for easy follow-up.
- **User-Friendly Interface**: Simple form for clients to fill in their information quickly.
- **Customizable Sections**: Proposal sections like introduction, goals, timeline, budget, and scope are tailored to each client.

---

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript
- **PDF Generation**: jsPDF for creating downloadable proposals
- **Version Control**: GitHub for code management

---

## Installation

1. **Clone the Repository**

    ```bash
    git clone https://github.com/GurkhaTechnology/client-proposal-generator-tool.git
    cd client-proposal-generator-tool
    ```

2. **Open the Application**

    Open the `index.html` file in your web browser.

---

## Usage

1. Open the `index.html` file in your web browser. Use a local web server (for example `python3 -m http.server`) so the page can load `data.json`.
2. Select the services you require.
3. Choose a package for each selected service.
4. Click "Generate Proposal".
5. Download the generated proposal as a PDF.

A small line under the page title says which rate source is in use.

---

## Package rates from Google Sheets

Bundled rates live in `data.json`. To update them without editing that file, publish a Google Sheet as CSV and point `config.js` at it.

1. Create a sheet with **one row per package** and the header row below. `sample-package-rates.csv` is that sheet generated from the current `data.json`. In Google Sheets, use **File > Import** and upload the CSV (or copy the rows into a blank sheet).
2. **File > Share > Publish to web**. Choose the rates sheet and **Comma-separated values (.csv)**, then publish and copy the link.
3. Open `config.js` and set `window.PROPOSAL_RATES_SHEET_CSV_URL` to that link. Leave it as `""` to keep using `data.json`. Do not invent a URL.
4. Redeploy the site (GitHub Pages serves `config.js` with the rest of the files) and reload. The notice should read **Using package rates from the Google Sheet.**

The tool keeps price text exactly as it appears in the sheet. It does not recalculate or reformat amounts. Quote any cell that contains a comma, a quote, or a line break. Inside a quoted cell, write a quote as `""`.

If the URL is empty, the sheet cannot be fetched, or the CSV fails the checks below, the page loads `data.json` and the notice names that fallback. A successful sheet response is cached in the browser (`localStorage`). That cache is used only when the same URL cannot be reached later.

### Sheet columns

Header names are case-insensitive. Spaces and hyphens are treated as underscores (`Service Name` and `service_name` are the same column).

| Column | Required | Maps to | Rules |
| --- | --- | --- | --- |
| `service_id` | Yes | `services[].id` | Same id on every row for that service, for example `webDev`. |
| `service_name` | Yes | `services[].name` | Must match on every row with that `service_id`. |
| `service_description` | Yes | `services[].description` | May be blank on later rows. If it is filled in more than once, the text must match. |
| `package_id` | Yes | `packages[].id` | Unique within the service, for example `starter`. |
| `package_name` | Yes | `packages[].name` | Label shown next to the price. |
| `price` | Yes | `packages[].price` | Display text, copied as written. Examples already in use: `NRs 35,000`, `NRs 15,000/mo`, `NRs 1,200 - 1,800 / Hour`. |
| `features` | Yes | `packages[].features` | Short line under the package name. The cell may be blank. |
| `full_description` | Yes | `packages[].fullDescription` | Longer text in the proposal. The cell may be blank. |

Row order is the order packages appear in the tool. A service is listed in the order its `service_id` first appears. Extra columns are ignored. A row with more cells than the header (usually an unquoted comma) is rejected.

---

## Project Structure

```bash
client-proposal-generator-tool/
├── index.html                # Main HTML file
├── config.js                 # Google Sheet CSV URL (empty by default)
├── rates.js                  # CSV parsing and validation
├── scripts.js                # JavaScript logic
├── style.css                 # Custom styles
├── data.json                 # Bundled service and package data
├── sample-package-rates.csv  # Sheet template generated from data.json
├── tests/package-rates.test.js
├── README.md                 # Project overview and instructions
├── documentation.md          # Technical documentation
├── plan.md                   # Future implementation plan
├── LICENSE                   # MIT License
└── .gitignore                # Files to be ignored by Git
```

---

## Contributing

We welcome contributions! If you'd like to contribute:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Commit your changes (`git commit -m 'Add feature'`).
4. Push the branch (`git push origin feature-branch`).
5. Open a pull request for review.

For detailed contribution guidelines, please see [CONTRIBUTING.md](CONTRIBUTING.md).

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

---

## Contact

For any inquiries, feel free to reach out:

- **Email**: info@gurkhatech.com
- **Website**: [gurkhatech.com](https://gurkhatech.com)
- **GitHub**: [GurkhaTechnology](https://github.com/GurkhaTechnology)
