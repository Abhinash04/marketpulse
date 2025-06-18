// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function () {
  const scrapeButton = document.getElementById('scrapeButton');
  const messageArea = document.getElementById('messageArea');

  if (scrapeButton) {
    scrapeButton.addEventListener('click', () => {
      scrapeButton.disabled = true;
      messageArea.textContent = 'Processing...';

      (async () => { // Use an async IIFE to use await for cleaner promise handling
        try {
          const tabs = await new Promise((resolve, reject) => {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
              if (chrome.runtime.lastError) return reject(new Error(chrome.runtime.lastError.message));
              if (!tabs || tabs.length === 0) return reject(new Error('No active tab found.'));
              resolve(tabs);
            });
          });
          const activeTab = tabs[0];
          if (!activeTab.id) throw new Error('Active tab has no ID.');

          messageArea.textContent = 'Injecting scraper...';
          const injectionResults = await new Promise((resolve, reject) => {
            chrome.scripting.executeScript(
              { target: { tabId: activeTab.id }, files: ['scraper.js'] },
              (results) => {
                if (chrome.runtime.lastError) return reject(new Error('Failed to inject scraper: ' + chrome.runtime.lastError.message + '. Ensure you are on a http/https page.'));
                if (!results || results.length === 0) return reject(new Error('Scraper injection failed.'));
                resolve(results);
              }
            );
          });

          const scrapedData = injectionResults[0].result;
          if (!scrapedData) throw new Error('No data returned from scraper.');
          if (scrapedData.error) throw new Error(`Scraping error: ${scrapedData.error}`);
          if (!scrapedData.text || scrapedData.text.trim() === "") {
            throw new Error('No content scraped. Page might be empty or protected.');
          }

          messageArea.textContent = 'Content scraped. Summarizing...';
          // Ensure summarizeContent is available globally (loaded via popup.html)
          if (typeof summarizeContent !== 'function') {
            throw new Error('Summarizer function not available.');
          }
          const summary = summarizeContent(scrapedData.text); // This is synchronous

          messageArea.textContent = 'Summarized. Generating PDF...';
          // Ensure generatePdf is available globally (loaded via popup.html)
          if (typeof generatePdf !== 'function') {
            throw new Error('PDF generator function not available.');
          }
          generatePdf(summary); // This is synchronous but can throw an error

          messageArea.textContent = 'PDF generated and download initiated!';

        } catch (error) {
          console.error("Error in scrape and summarize process:", error);
          messageArea.textContent = `Error: ${error.message}`;
        } finally {
          scrapeButton.disabled = false;
        }
      })(); // Immediately invoke the async function
    });
  } else {
    if(messageArea) messageArea.textContent = 'Error: Could not find scrape button.';
  }
});
