function generatePdf(summary) {
  console.log("=== PDF GENERATOR DEBUG START ===");
  console.log("Received summary object:", summary);
  console.log("Summary type:", typeof summary);
  console.log("Summary keys:", Object.keys(summary || {}));
  
  if (typeof jspdf === "undefined") {
    console.error("jsPDF library is not loaded.");
    alert("Error: PDF generation library not found.");
    return;
  }
  const { jsPDF } = jspdf;

  try {
    const doc = new jsPDF();
    const margin = 15;
    let yPos = margin;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const usableWidth = pageWidth - 2 * margin;
    const lineHeight = 5;

    // Helper function to add a new page if needed
    function checkPageBreak(additionalHeight) {
      if (yPos + additionalHeight > pageHeight - 20) {
        doc.addPage();
        yPos = margin;
        return true;
      }
      return false;
    }

    // Helper function to add text with automatic page breaks
    function addTextWithPageBreaks(text, fontSize, isBold = false) {
      doc.setFontSize(fontSize);
      if (isBold) {
        doc.setFont(undefined, 'bold');
      } else {
        doc.setFont(undefined, 'normal');
      }
      
      const lines = doc.splitTextToSize(text, usableWidth);
      
      for (let i = 0; i < lines.length; i++) {
        checkPageBreak(lineHeight);
        doc.text(lines[i], margin, yPos);
        yPos += lineHeight;
      }
      
      return lines.length;
    }

    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text("Analysis Report", pageWidth / 2, yPos, {
      align: "center",
    });
    yPos += 15;

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    const today = new Date().toLocaleDateString();
    doc.text(`Generated on: ${today}`, pageWidth / 2, yPos, {
      align: "center",
    });
    yPos += 15;

    checkPageBreak(20);
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text("Key Insights:", margin, yPos);
    yPos += 10;
    
    const insightsText = summary.keyInsights || "No specific insights generated.";
    console.log("PDF: Key Insights value:", insightsText);
    console.log("PDF: Key Insights length:", insightsText.length);
    console.log("PDF: Key Insights preview:", insightsText.substring(0, 100) + "...");
    addTextWithPageBreaks(insightsText, 10);
    yPos += 10;

    checkPageBreak(20);
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text("Market Situation:", margin, yPos);
    yPos += 10;
    
    const marketText = summary.marketSituation || "General market conditions observed.";
    console.log("Adding Market Situation:", marketText.substring(0, 100) + "...");
    addTextWithPageBreaks(marketText, 10);
    yPos += 10;

    checkPageBreak(20);
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text("Strategic Suggestions:", margin, yPos);
    yPos += 10;
    
    const suggestionsText = summary.strategicSuggestions || "Standard strategic considerations apply.";
    console.log("Adding Strategic Suggestions:", suggestionsText.substring(0, 100) + "...");
    addTextWithPageBreaks(suggestionsText, 10);

    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont(undefined, 'normal');
      doc.text(
        `Page ${i} of ${totalPages}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: "center" }
      );
    }

    const filename = `insights_report_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
    console.log(`PDF saved as: ${filename}`);
    
  } catch (error) {
    console.error("Error generating PDF:", error);
    alert(`An error occurred while generating the PDF: ${error.message}`);
  }
}