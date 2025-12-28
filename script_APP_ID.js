document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const resultsDiv = document.getElementById('results');
    
    let allCodes = [];

    async function fetchCodes() {
        try {
            const response = await fetch('APP_ID.txt');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const text = await response.text();
            allCodes = text.split('\n')
                           .map(line => line.trim())
                           .filter(line => line.length > 0);
            
            filterAndDisplayCodes();

        } catch (error) {
            console.error('Error fetching or parsing APP_ID.txt:', error);
            resultsDiv.innerHTML = `<p class="no-results">${translations[currentLang].errorLoading}</p>`;
        }
    }

    function displayResults(codesToDisplay, searchTerm = "") {
        resultsDiv.innerHTML = '';
        const dict = translations[currentLang];

        if (codesToDisplay.length === 0) {
            let message = dict.noToolsToDisplay;
            if (searchTerm) { 
                message = dict.noResultsFound.replace('{searchTerm}', escapeHTML(searchTerm));
            } else if (allCodes.length === 0) {
                message = dict.noToolsAvailable;
            }
            resultsDiv.innerHTML = `<p class="no-results">${message}</p>`;
        } else {
            const ul = document.createElement('ul');
            ul.style.listStyleType = 'none';
            ul.style.paddingLeft = '0';

            codesToDisplay.forEach(codeFile => {
                const li = document.createElement('li');
                const link = document.createElement('a');
                link.href = codeFile;
                link.textContent = formatCodeName(codeFile);
                link.className = 'result-item';
                li.appendChild(link);
                ul.appendChild(li);
            });
            resultsDiv.appendChild(ul);
        }
    }

    function filterAndDisplayCodes() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        if (searchTerm === "") {
            displayResults(allCodes);
            return;
        }
        const filteredCodes = allCodes.filter(codeFile =>
            codeFile.toLowerCase().includes(searchTerm) ||
            formatCodeName(codeFile).toLowerCase().includes(searchTerm)
        );
        displayResults(filteredCodes, searchTerm);
    }
    
    function formatCodeName(filename) {
        let name = filename.replace('.html', '').replace(/[-_]/g, ' ');
        return name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }

    function escapeHTML(str) {
        const div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }

    searchInput.addEventListener('input', filterAndDisplayCodes);

    fetchCodes();
});
