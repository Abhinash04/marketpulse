(() => {
  function isVisible(elem) {
    if (!(elem instanceof Element)) return false;
    const style = getComputedStyle(elem);
    if (style.display === 'none') return false;
    if (style.visibility !== 'visible') return false;
    if (style.opacity < 0.1) return false;
    if (elem.offsetWidth + elem.offsetHeight + elem.getBoundingClientRect().height +
        elem.getBoundingClientRect().width === 0) {
        return false;
    }
    const elemCenter = {
        x: elem.getBoundingClientRect().left + elem.offsetWidth / 2,
        y: elem.getBoundingClientRect().top + elem.offsetHeight / 2
    };
    if (elemCenter.x < 0) return false;
    if (elemCenter.x > (document.documentElement.clientWidth || window.innerWidth)) return false;
    if (elemCenter.y < 0) return false;
    if (elemCenter.y > (document.documentElement.clientHeight || window.innerHeight)) return false;
    let pointContainer = document.elementFromPoint(elemCenter.x, elemCenter.y);
    do {
        if (pointContainer === elem) return true;
    } while (pointContainer = pointContainer.parentNode);
    return false;
  }

  let extractedText = "";

  const mainContentSelectors = ['article', 'main', '[role="main"]', '.main-content', '#main-content', '.post-body', '.entry-content'];
  let mainElement = null;
  for (const selector of mainContentSelectors) {
    mainElement = document.querySelector(selector);
    if (mainElement && isVisible(mainElement)) break;
  }

  const targetElement = mainElement || document.body;

  const selectors = ['h1', 'h2', 'h3', 'p', 'article', 'section', 'div.content', 'div.post', 'li'];

  targetElement.querySelectorAll(selectors.join(', ')).forEach(el => {
    if (isVisible(el) && el.textContent) {
      if (el.tagName.toLowerCase() === 'script' || el.tagName.toLowerCase() === 'style') {
        return;
      }
      let childNodes = el.childNodes;
      let textContentLength = 0;
      let elementChildrenCount = 0;
      for(let i = 0; i < childNodes.length; i++) {
        if(childNodes[i].nodeType === Node.TEXT_NODE) {
          textContentLength += childNodes[i].textContent.trim().length;
        }
        if(childNodes[i].nodeType === Node.ELEMENT_NODE) {
          if (!['BR', 'HR', 'IMG', 'VIDEO', 'AUDIO'].includes(childNodes[i].tagName.toUpperCase())) {
            elementChildrenCount++;
          }
        }
      }

      if (textContentLength > 20 || elementChildrenCount < 3 || el.querySelectorAll(selectors.join(', ')).length === 0) {
         extractedText += el.textContent.trim() + "\n\n";
      }
    }
  });

  if (extractedText.trim() === "") {
    const allText = [];
    function getTextNodes(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            if (node.textContent.trim().length > 0 && isVisible(node.parentNode)) {
                allText.push(node.textContent.trim());
            }
        } else {
            for (const childNode of node.childNodes) {
                if (node.tagName && (node.tagName.toLowerCase() === 'script' || node.tagName.toLowerCase() === 'style')) {
                    continue;
                }
                getTextNodes(childNode);
            }
        }
    }
    getTextNodes(targetElement);
    extractedText = allText.join("\n\n");
  }

  if (extractedText.length > 0) {
    return { text: extractedText };
  } else {
    return { error: "No meaningful content could be extracted." };
  }
})();