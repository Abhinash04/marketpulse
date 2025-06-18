async function summarizeContent(scrapedText) {
  console.log("=== SUMMARIZER DEBUG START ===");
  console.log("Input text length:", scrapedText.length);
  console.log("Input text preview:", scrapedText.substring(0, 300));

  if (typeof GEMINI_API_KEY === "undefined" || !GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY is not defined or empty");
    alert("Gemini API key is not configured.");
    return {
      keyInsights: "No API key configured.",
      marketSituation: "No API key configured.",
      strategicSuggestions: "No API key configured.",
    };
  }

  console.log("API Key present:", GEMINI_API_KEY.substring(0, 20) + "...");

  const maxLength = 8000;
  const textToAnalyze =
    scrapedText.length > maxLength
      ? scrapedText.substring(0, maxLength) +
        "\n\n[Content truncated due to length]"
      : scrapedText;

  console.log("Text to analyze length:", textToAnalyze.length);

  const prompt = `You are a business analyst with deep expertise in market research, strategic analysis, and competitive intelligence.
  Analyze the following website content and provide a thorough, structured competitive analysis.
  Please use the exact format below, and be detailed in your explanations. Write in clear, concise paragraphs with specific examples or observations where relevant.

  **KEY INSIGHTS:**
  [Identify 5 key insights about this competitor/website. These could include details about their product offerings, unique positioning, marketing strategies, customer focus, recent news/announcements, or innovation. Explain why each insight matters from a business perspective.]
  
  **MARKET SITUATION:**
  [Analyze what this content reveals about the broader market environment, including current trends, customer behaviors, regulatory shifts, emerging opportunities or risks, and how this competitor is responding. Offer context to help understand where this company fits within the competitive landscape.]
  
  **STRATEGIC SUGGESTIONS:**
  [Provide 5 actionable and strategic recommendations for how we (the reader’s company) can respond or position ourselves in light of these insights. These should be practical and forward-looking, focusing on differentiation, customer value, or risk mitigation.]
  
  Website content to analyze:
  ${textToAnalyze}`;

  console.log("Prompt length:", prompt.length);

  try {
    console.log("Making API call to Gemini...");

    const requestBody = {
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
    };

    console.log("Request body:", JSON.stringify(requestBody, null, 2));

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    );

    console.log("Response status:", response.status);
    console.log("Response headers:", [...response.headers.entries()]);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error Response:", errorText);
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorText}`
      );
    }

    const data = await response.json();
    console.log("Full API response:", JSON.stringify(data, null, 2));

    if (data.error) {
      console.error("API returned error:", data.error);
      throw new Error(`API Error: ${data.error.message || "Unknown error"}`);
    }

    const summaryText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!summaryText) {
      console.error("No text found in API response");
      console.error("Candidates array:", data.candidates);
      throw new Error("No text content in API response");
    }

    console.log("Raw summary text received:");
    console.log("--- START SUMMARY ---");
    console.log(summaryText);
    console.log("--- END SUMMARY ---");

    const parsed = parseSummaryResponse(summaryText);

    console.log("Parsed summary:", parsed);
    console.log("=== SUMMARIZER DEBUG END ===");

    return parsed;
  } catch (error) {
    console.error("Error in summarizeContent:", error);
    console.error("Error stack:", error.stack);

    return {
      keyInsights: `Error: ${error.message}`,
      marketSituation: `Error occurred while fetching analysis: ${error.message}`,
      strategicSuggestions: `Unable to generate suggestions due to error: ${error.message}`,
    };
  }
}

function parseSummaryResponse(summaryText) {
  console.log("=== PARSING SUMMARY ===");

  const result = {
    keyInsights: "",
    marketSituation: "",
    strategicSuggestions: "",
  };

  const cleanText = summaryText.trim();
  const boldHeaderPatterns = {
    keyInsights:
      /\*\*KEY INSIGHTS?:?\*\*(.*?)(?=\*\*(?:MARKET SITUATION|STRATEGIC SUGGESTIONS)|$)/is,
    marketSituation:
      /\*\*MARKET SITUATION:?\*\*(.*?)(?=\*\*STRATEGIC SUGGESTIONS|$)/is,
    strategicSuggestions: /\*\*STRATEGIC SUGGESTIONS?:?\*\*(.*?)$/is,
  };

  const regularHeaderPatterns = {
    keyInsights:
      /KEY INSIGHTS?:?\s*(.*?)(?=MARKET SITUATION|STRATEGIC SUGGESTIONS|$)/is,
    marketSituation: /MARKET SITUATION:?\s*(.*?)(?=STRATEGIC SUGGESTIONS|$)/is,
    strategicSuggestions: /STRATEGIC SUGGESTIONS?:?\s*(.*?)$/is,
  };

  const numberedPatterns = {
    keyInsights: /1\.?\s*KEY INSIGHTS?:?\s*(.*?)(?=2\.|MARKET SITUATION|$)/is,
    marketSituation:
      /2\.?\s*MARKET SITUATION:?\s*(.*?)(?=3\.|STRATEGIC SUGGESTIONS|$)/is,
    strategicSuggestions: /3\.?\s*STRATEGIC SUGGESTIONS?:?\s*(.*?)$/is,
  };

  const strategies = [
    boldHeaderPatterns,
    regularHeaderPatterns,
    numberedPatterns,
  ];

  for (let i = 0; i < strategies.length; i++) {
    const patterns = strategies[i];
    console.log(`Trying parsing strategy ${i + 1}...`);

    for (const [key, pattern] of Object.entries(patterns)) {
      if (!result[key]) {
        const match = cleanText.match(pattern);
        if (match && match[1] && match[1].trim()) {
          result[key] = match[1].trim();
          console.log(
            `Found ${key} with strategy ${i + 1}:`,
            result[key].substring(0, 100)
          );
        }
      }
    }

    if (
      result.keyInsights &&
      result.marketSituation &&
      result.strategicSuggestions
    ) {
      console.log("All sections parsed successfully");
      break;
    }
  }

  if (
    !result.keyInsights ||
    !result.marketSituation ||
    !result.strategicSuggestions
  ) {
    console.log("Regex parsing failed, trying manual splitting...");

    const lines = cleanText.split("\n").filter((line) => line.trim());
    let currentSection = "";
    let insights = [];
    let market = [];
    let suggestions = [];

    for (const line of lines) {
      const lowerLine = line.toLowerCase().trim();

      if (
        lowerLine.includes("key insights") ||
        lowerLine.includes("insights:")
      ) {
        currentSection = "insights";
        const afterColon = line.split(":")[1];
        if (afterColon && afterColon.trim()) insights.push(afterColon.trim());
      } else if (
        lowerLine.includes("market situation") ||
        lowerLine.includes("market:")
      ) {
        currentSection = "market";
        const afterColon = line.split(":")[1];
        if (afterColon && afterColon.trim()) market.push(afterColon.trim());
      } else if (
        lowerLine.includes("strategic") &&
        lowerLine.includes("suggest")
      ) {
        currentSection = "suggestions";
        const afterColon = line.split(":")[1];
        if (afterColon && afterColon.trim())
          suggestions.push(afterColon.trim());
      } else if (line.trim() && !line.match(/^\*+$/) && currentSection) {
        if (currentSection === "insights") insights.push(line.trim());
        else if (currentSection === "market") market.push(line.trim());
        else if (currentSection === "suggestions")
          suggestions.push(line.trim());
      }
    }

    if (!result.keyInsights && insights.length > 0) {
      result.keyInsights = insights.join(" ");
    }
    if (!result.marketSituation && market.length > 0) {
      result.marketSituation = market.join(" ");
    }
    if (!result.strategicSuggestions && suggestions.length > 0) {
      result.strategicSuggestions = suggestions.join(" ");
    }
  }

  if (!result.keyInsights) {
    result.keyInsights =
      "Unable to extract specific insights. Full response: " +
      cleanText.substring(0, 200) +
      "...";
  }
  if (!result.marketSituation) {
    result.marketSituation =
      "Unable to extract market situation. Please check console for full response.";
  }
  if (!result.strategicSuggestions) {
    result.strategicSuggestions =
      "Unable to extract strategic suggestions. Please check console for full response.";
  }

  console.log("Final parsed result:");
  console.log("- Key Insights length:", result.keyInsights.length);
  console.log("- Market Situation length:", result.marketSituation.length);
  console.log(
    "- Strategic Suggestions length:",
    result.strategicSuggestions.length
  );

  return result;
}
