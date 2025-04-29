///////// Starship Titanic Markdown Converter Script \\\\\\\\\
    // JavaScript to parse and replace Markdown-like syntax based on observed source patterns
    document.addEventListener('DOMContentLoaded', function() {
        const postBodies = document.querySelectorAll('.postbody'); // Select all post bodies

        postBodies.forEach(postBody => {
            if (postBody) {
                let html = postBody.innerHTML;

                // --- Pre-processing ---
                // 1. Replace **bold** with <strong>bold</strong> globally first
                html = html.replace(/\*\*(.*?)\*\*/gs, '<strong>$1</strong>');

                // --- Line-by-Line Processing for Lists ---
                const lines = html.split(/<br\s*\/?>/i);
                const processedLines = [];
                let inList = false;

                lines.forEach(line => {
                    const originalLine = line;

                    // Regex to match leading spaces or &nbsp; entities for indentation
                    const nestedMatch = originalLine.match(/^((?:&nbsp;|\s){4,})(.*)/); // 4+ spaces or &nbsp;
                    const topLevelMatch = !nestedMatch ? originalLine.match(/^((?:&nbsp;|\s){2,})(.*)/) : null; // 2+ spaces or &nbsp; (only if not nested)

                    if (nestedMatch) {
                        // *** ADDED CHECK FOR HTML TAGS ***
                        const potentialContentNested = nestedMatch[2].trimStart();
                        if (potentialContentNested.startsWith('<img') || potentialContentNested.startsWith('<font') || potentialContentNested.startsWith('<a href')) {
                            processedLines.push(originalLine); // Treat as regular HTML line
                            inList = false; // It's not a list item, reset flag
                        } else {
                            // *** Original Asterisk Removal Logic ***
                            let content = nestedMatch[2].replace(/^\*\s*(?:&nbsp;|\s)?/, '').trim();
                            if (content) {
                               processedLines.push(`<span class="md-list-item md-list-item-nested">${content}</span>`);
                               inList = true;
                            } else if (inList) {
                                processedLines.push(''); // Treat as paragraph break within list
                                inList = false;
                            } else {
                                processedLines.push(originalLine); // Preserve spacing if not in list context
                            }
                        }
                    } else if (topLevelMatch) {
                        // *** ADDED CHECK FOR HTML TAGS ***
                        const potentialContentTop = topLevelMatch[2].trimStart();
                        if (potentialContentTop.startsWith('<img') || potentialContentTop.startsWith('<font') || potentialContentTop.startsWith('<a href')) {
                            processedLines.push(originalLine); // Treat as regular HTML line
                            inList = false; // It's not a list item, reset flag
                        } else {
                            // *** Original Asterisk Removal Logic ***
                            let content = topLevelMatch[2].replace(/^\*\s*(?:&nbsp;|\s)?/, '').trim();
                             if (content) {
                                processedLines.push(`<span class="md-list-item">${content}</span>`);
                                inList = true;
                             } else if (inList) {
                                processedLines.push(''); // Treat as paragraph break within list
                                inList = false;
                             } else {
                                processedLines.push(originalLine); // Preserve spacing if not in list context
                             }
                        }
                    } else {
                        // Not a list item
                        const trimmedLine = originalLine.trim();
                        if (trimmedLine === '' && inList) {
                            processedLines.push(''); // Treat as paragraph break after list
                            inList = false;
                        } else if (trimmedLine !== '') {
                            processedLines.push(originalLine); // Keep regular line
                            inList = false;
                        } else {
                             // Preserve potentially intentional multiple <br> tags if line was truly empty
                            if (!inList) {
                                processedLines.push(originalLine);
                            }
                        }
                    }
                });

                // Join lines back, using a consistent <br /> tag
                html = processedLines.join('<br />');

                // --- Post-processing ---
                // 2. Replace *italic* with <em>italic</em> globally
                html = html.replace(/(?<!\*)\*(?!\*|\s)(.*?)(?<!\s|\*)\*(?!\*)/gs, '<em>$1</em>');

                // Optional Cleanups
                html = html.replace(/<span class="md-list-item">\s*<\/span>/g, '');
                html = html.replace(/<span class="md-list-item md-list-item-nested">\s*<\/span>/g, '');

                // Update the element's content
                postBody.innerHTML = html;
            }
        });
    });