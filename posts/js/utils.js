// Initialize Prism.js
Prism.plugins.autoloader.languages_path = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/';

// Math copy functionality
function copyMathToClipboard(button) {
    const mathBlock = button.parentElement;
    const latexSource = mathBlock.querySelector('.math-latex-source');

    // Get the raw LaTeX text directly from the data-attribute element,
    // since it isn't rendered by MathJax
    let latexText = latexSource.getAttribute('data-latex');

    if (!latexText) {
        latexText = latexSource.textContent.trim();
    }

    // Copy to clipboard
    navigator.clipboard.writeText(latexText).then(function() {
        // Visual feedback - prevent duplication by checking if already in copied state
        if (button.classList.contains('copied')) {
            return; // Already showing feedback, don't duplicate
        }
        
        const originalText = button.textContent;
        button.textContent = 'Copied!';
        button.classList.add('copied');

        // Reset button after 2 seconds
        setTimeout(function() {
            button.textContent = originalText;
            button.classList.remove('copied');
        }, 2000);
    }).catch(function(err) {
        console.error('Failed to copy: ', err);
    });
}

// Add copy buttons to math blocks (fallback if MathJax callback doesn't work)
function addMathCopyButtons() {
    const mathBlocks = document.querySelectorAll('.math-block');
    mathBlocks.forEach(block => {
        if (!block.querySelector('.math-copy-btn')) {
            const button = document.createElement('button');
            button.className = 'math-copy-btn';
            button.textContent = 'Copy LaTeX';
            button.onclick = function() { copyMathToClipboard(this); };
            block.insertBefore(button, block.firstChild);
        }
    });
}

// Ensure math copy buttons are added after page load
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(addMathCopyButtons, 500);
});

// Prevent event bubbling that might cause duplicate copy actions
document.addEventListener('click', function(event) {
    // If clicking on a math copy button, prevent any other copy handlers
    if (event.target.classList.contains('math-copy-btn')) {
        event.stopPropagation();
    }
});