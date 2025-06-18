document.addEventListener('DOMContentLoaded', function () {
  const scrapeButton = document.getElementById('scrapeButton');
  const messageArea = document.getElementById('messageArea');

  if (scrapeButton) {
    scrapeButton.addEventListener('click', () => {
      scrapeButton.disabled = true;
      messageArea.textContent = 'Processing...';

      (async () => {
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
          console.log('Scraped data received:', scrapedData);
          
          if (!scrapedData) throw new Error('No data returned from scraper.');
          if (scrapedData.error) throw new Error(`Scraping error: ${scrapedData.error}`);
          if (!scrapedData.text || scrapedData.text.trim() === "") {
            throw new Error('No content scraped. Page might be empty or protected.');
          }

          console.log('Scraped text length:', scrapedData.text.length);
          console.log('First 200 chars of scraped text:', scrapedData.text.substring(0, 200));

          messageArea.textContent = 'Content scraped. Summarizing...';
          
          // Check if summarizeContent function exists
          if (typeof summarizeContent !== 'function') {
            throw new Error('Summarizer function not available.');
          }

          console.log('Calling summarizeContent...');
          const summary = await summarizeContent(scrapedData.text);
          console.log('Summary received:', summary);

          // Validate that we got a proper summary
          if (!summary || typeof summary !== 'object') {
            throw new Error('Invalid summary object received from summarizeContent');
          }

          console.log('Summary validation:');
          console.log('- keyInsights:', summary.keyInsights ? summary.keyInsights.substring(0, 100) : 'EMPTY');
          console.log('- marketSituation:', summary.marketSituation ? summary.marketSituation.substring(0, 100) : 'EMPTY');
          console.log('- strategicSuggestions:', summary.strategicSuggestions ? summary.strategicSuggestions.substring(0, 100) : 'EMPTY');

          messageArea.textContent = 'Summarized. Generating PDF...';
          
          // Check if generatePdf function exists
          if (typeof generatePdf !== 'function') {
            throw new Error('PDF generator function not available.');
          }

          console.log('Calling generatePdf with summary:', summary);
          generatePdf(summary); 

          messageArea.textContent = 'PDF generated and download initiated!';

        } catch (error) {
          console.error("Error in scrape and summarize process:", error);
          console.error("Error stack:", error.stack);
          messageArea.textContent = `Error: ${error.message}`;
        } finally {
          scrapeButton.disabled = false;
        }
      })(); 
    });
  } else {
    if(messageArea) messageArea.textContent = 'Error: Could not find scrape button.';
  }
});