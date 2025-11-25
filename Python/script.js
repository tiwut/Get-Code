// Data structure to hold all module information for searching
const allModules = [];

// Function to safely sanitize module names for file paths
function sanitizeModuleName(name) {
    return name.trim().replace(/\s/g, '_');
}

// Function to fetch the code content for a specific module
async function fetchCode(moduleName) {
    const filename = `${sanitizeModuleName(moduleName)}.txt`;
    try {
        const response = await fetch(filename);
        if (!response.ok) {
            return `// Error: Could not load code for ${moduleName}. Check if file ${filename} exists.`;
        }
        return await response.text();
    } catch (error) {
        console.error('Error fetching code:', error);
        return `// Error fetching file: ${filename}`;
    }
}

// Function to create the HTML element for a snippet item
function createSnippetElement(module) {
    const item = document.createElement('div');
    item.className = 'snippet-item';
    item.setAttribute('data-name', module.name.toLowerCase());
    item.setAttribute('data-code', module.code.toLowerCase());

    const header = document.createElement('div');
    header.className = 'snippet-header';
    header.innerHTML = `
        <span class="snippet-title">${module.name.replace(/_/g, ' ')}</span>
        <span class="toggle-icon">▼</span>
    `;

    const content = document.createElement('div');
    content.className = 'snippet-content';

    const codeWrapper = document.createElement('div');
    codeWrapper.className = 'code-wrapper';

    // The button for copying the code
    const copyButton = document.createElement('button');
    copyButton.className = 'copy-button';
    copyButton.textContent = 'Copy Code';
    copyButton.addEventListener('click', (e) => copyCode(e, module.code));

    // The pre/code block for syntax highlighting
    const pre = document.createElement('pre');
    const code = document.createElement('code');
    // We assume the code is HTML/Markup, adjust language class if needed
    code.className = 'language-markup';
    code.textContent = module.code; 
    
    pre.appendChild(code);
    codeWrapper.appendChild(copyButton);
    codeWrapper.appendChild(pre);
    content.appendChild(codeWrapper);

    item.appendChild(header);
    item.appendChild(content);

    // Toggle functionality
    header.addEventListener('click', () => {
        item.classList.toggle('active');
        const contentDiv = item.querySelector('.snippet-content');
        // Simple manual calculation for smooth transition
        if (item.classList.contains('active')) {
            contentDiv.style.maxHeight = contentDiv.scrollHeight + 80 + 'px'; // +80 for buffer
        } else {
            contentDiv.style.maxHeight = '0';
        }

        // Apply syntax highlighting after content is revealed
        Prism.highlightElement(code, false); 
    });

    return item;
}

// Function to copy the code to clipboard
function copyCode(event, code) {
    navigator.clipboard.writeText(code).then(() => {
        const button = event.target;
        const originalText = button.textContent;
        button.textContent = 'Copied!';
        setTimeout(() => {
            button.textContent = originalText;
        }, 1500);
    }).catch(err => {
        console.error('Could not copy text: ', err);
        alert('Failed to copy code!');
    });
}

// Function to load all module names and code
async function loadModules() {
    const listElement = document.getElementById('snippetList');
    const loadingMessage = document.getElementById('loadingMessage');
    
    try {
        // 1. Fetch the list of module names
        const namesResponse = await fetch('code_modul.txt');
        if (!namesResponse.ok) {
            loadingMessage.textContent = 'Error: Could not load code_modul.txt.';
            return;
        }
        const namesText = await namesResponse.text();
        const moduleNames = namesText.split('\n')
            .map(name => name.trim())
            .filter(name => name.length > 0);

        // 2. Clear initial content
        listElement.innerHTML = '';
        
        // 3. Fetch code content for each module
        for (const name of moduleNames) {
            const code = await fetchCode(name);
            const module = { name, code };
            allModules.push(module);

            // 4. Create and append the snippet element
            const element = createSnippetElement(module);
            listElement.appendChild(element);
        }

        if (allModules.length === 0) {
            listElement.innerHTML = '<p id="noResults">No code modules found in code_modul.txt.</p>';
        }

    } catch (error) {
        console.error('Error loading modules:', error);
        listElement.innerHTML = '<p id="noResults">A critical error occurred while loading the data.</p>';
    }
}

// Function to handle the live search
function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase().trim();
    const listElement = document.getElementById('snippetList');
    let resultsFound = false;

    // Remove existing 'No results' message if present
    const existingNoResults = document.getElementById('noResults');
    if (existingNoResults) existingNoResults.remove();
    
    // Iterate over all modules and their corresponding DOM elements
    document.querySelectorAll('.snippet-item').forEach(item => {
        const moduleName = item.getAttribute('data-name');
        const moduleCode = item.getAttribute('data-code');
        
        // Search in both name and code content
        if (moduleName.includes(searchTerm) || moduleCode.includes(searchTerm)) {
            item.style.display = 'block';
            resultsFound = true;
        } else {
            item.style.display = 'none';
        }
    });

    if (!resultsFound && allModules.length > 0) {
        // Display 'No results' message if no matches are found
        const noResults = document.createElement('p');
        noResults.id = 'noResults';
        noResults.textContent = `No results found for "${searchTerm}".`;
        listElement.appendChild(noResults);
    }
}

// Initialize the platform
document.addEventListener('DOMContentLoaded', () => {
    loadModules();
    
    // Attach the search handler to the input field
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', handleSearch);
});