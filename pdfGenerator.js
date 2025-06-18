// pdfGenerator.js

// This function is called by popup.js
// It uses the jsPDF library to generate a PDF from the summary object.
// Assumes jsPDF is loaded (e.g., via <script> tag in popup.html)

function generatePdf(summary) {
  // Ensure jsPDF is loaded
  if (typeof jspdf === 'undefined') {
    console.error('jsPDF library is not loaded.');
    alert('Error: PDF generation library not found.');
    return;
  }
  const { jsPDF } = jspdf; // Destructure from the global jspdf object

  console.log("Generating PDF with summary:", summary);

  try {
    const doc = new jsPDF();
    const margin = 15;
    let yPos = margin;
    const pageWidth = doc.internal.pageSize.getWidth();
    const usableWidth = pageWidth - 2 * margin;

    // Title
    doc.setFontSize(18);
    doc.text("Competitor Analysis Report", pageWidth / 2, yPos, { align: 'center' });
    yPos += 15;

    // Key Insights
    doc.setFontSize(14);
    doc.text("Key Insights:", margin, yPos);
    yPos += 7;
    doc.setFontSize(10);
    let lines = doc.splitTextToSize(summary.keyInsights || "No specific insights generated.", usableWidth);
    doc.text(lines, margin, yPos);
    yPos += (lines.length * 5) + 10; // Adjust spacing based on number of lines

    // Market Situation
    doc.setFontSize(14);
    doc.text("Market Situation:", margin, yPos);
    yPos += 7;
    doc.setFontSize(10);
    lines = doc.splitTextToSize(summary.marketSituation || "General market conditions observed.", usableWidth);
    doc.text(lines, margin, yPos);
    yPos += (lines.length * 5) + 10;

    // Strategic Suggestions
    doc.setFontSize(14);
    doc.text("Strategic Suggestions:", margin, yPos);
    yPos += 7;
    doc.setFontSize(10);
    lines = doc.splitTextToSize(summary.strategicSuggestions || "Standard strategic considerations apply.", usableWidth);
    doc.text(lines, margin, yPos);
    yPos += (lines.length * 5) + 10;

    // Add a footer with date
    doc.setFontSize(8);
    const today = new Date().toLocaleDateString();
    doc.text(`Report generated on: ${today}`, margin, doc.internal.pageSize.getHeight() - 10);

    doc.save("competitor_insights_report.pdf");

  } catch (error) {
    console.error("Error generating PDF:", error);
    alert("An error occurred while generating the PDF. Check the console.");
    throw new Error("Failed to generate PDF. Check console for details.");
  }
}
