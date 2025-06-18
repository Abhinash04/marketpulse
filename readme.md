# Competitor Insights Scraper Extension

This browser extension helps you scrape content from competitor websites, get a mock AI-generated summary of insights, and export it as a PDF report.

## Features

*   Scrape text content from the currently active web page.
*   Generate a mock summary including:
    *   Key insights from competitor activities (simulated)
    *   Market situation summary (simulated)
    *   Strategic suggestions based on trends (simulated)
*   Export the summarized report as a PDF document.

## How to Install

1.  **Download the Extension Files:**
    *   You can clone this repository or download the files as a ZIP and extract them to a local folder. Ensure you have all the files: `manifest.json`, `popup.html`, `popup.js`, `scraper.js`, `summarizer.js`, `pdfGenerator.js`, the `lib/` folder with `jspdf.min.js`, and the `images/` folder.

2.  **Load in Chrome (or other Chromium-based browsers):**
    *   Open your browser and navigate to `chrome://extensions`.
    *   Enable "Developer mode" (usually a toggle in the top right corner).
    *   Click on "Load unpacked".
    *   Select the directory where you saved/extracted the extension files.
    *   The extension icon should now appear in your browser's toolbar.

## How to Use

1.  **Navigate to a Competitor's Website:** Open the webpage you want to analyze in a browser tab.
2.  **Click the Extension Icon:** Find the "Competitor Insights Scraper" icon in your browser's toolbar and click it. A small popup window will appear.
3.  **Click "Scrape & Summarize":** In the popup, click the "Scrape & Summarize" button.
4.  **Processing:** The extension will:
    *   Attempt to extract text content from the current page.
    *   Use its mock AI engine to generate a summary.
    *   Generate a PDF report.
5.  **Download PDF:** Your browser will automatically download the generated `competitor_insights_report.pdf` file.
6.  **View Messages:** The popup will display status messages (e.g., "Processing...", "PDF generated...", or any errors).

## Limitations and Important Notes

*   **CORS Workaround:** This extension scrapes content from the **currently active tab**. It does not directly fetch and scrape a list of URLs in the background due to browser Cross-Origin Resource Sharing (CORS) restrictions. You must first navigate to the page you wish to scrape.
*   **Scraper Fragility:** The content scraper (`scraper.js`) uses general selectors (e.g., `<article>`, `<p>`, `<h1>`) to find text. Its effectiveness can vary significantly depending on the structure of the website. It may not work perfectly on all sites, especially those with complex or JavaScript-heavy layouts. Customization of `scraper.js` might be needed for specific target sites.
*   **Mock AI Summarization:** The "AI" summarization is **simulated** (`summarizer.js`). It uses basic keyword spotting to generate plausible-sounding insights but does **not** involve any real artificial intelligence or advanced natural language processing. The quality and relevance of the summary are for demonstration purposes only.
*   **No Backend:** This tool is entirely client-side (HTML, CSS, JavaScript) and does not involve any backend server. All processing happens within your browser.
*   **Permissions:** The extension requires `activeTab` and `scripting` permissions to read and execute scripts on the current webpage.
*   **Error Handling:** Basic error handling is in place. If issues occur, messages will be displayed in the extension popup. Check the browser's developer console (for the extension) for more detailed error information if needed.

## Technical Details

*   **Manifest Version:** 3
*   **Core Technologies:** HTML, CSS, JavaScript (no frameworks)
*   **PDF Generation:** Uses the `jsPDF` library.
*   **Target Websites (Examples from original brief for context - user must navigate to them):**
    *   `https://www.examplecompetitor1.com`
    *   `https://www.examplecompetitor2.com`
    *   EKI Energy: `https://enkingint.org/`
    *   Earthfit: `https://earthfit.in/`
    *   Envirofit: `https://envirofit.org/`
    *   Greenway Gramin (Note: original link `https://forums.garmin.com/` seems like a forum, scraping might be difficult/undesired. Use a more appropriate public-facing news/update page if targeting Garmin):
    *   Ecosense: `https://www.ecosenselighting.com/`

This extension serves as a proof-of-concept for a browser-based scraping and summarization tool under strict technical constraints.
