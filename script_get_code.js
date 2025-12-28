document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const resultsDiv = document.getElementById('results');
    const langSwitcher = document.getElementById('lang-switcher');
    
    let allCodes = [];
    let currentLang = 'en';

    const translations = {
        en: {
            pageTitle: "Get Code Finder",
            headerH1: "Get Code Finder",
            headerP: "Search for your Code quickly and efficiently.",
            searchInputPlaceholder: "Search for Code",
            mainPageButton: "Main Page",
            footerText: "© 2025 Tiwut. All codes at your fingertips.",
            noResultsFound: "No Get Code found matching \"{searchTerm}\".",
            errorLoading: "Error loading Get Code list. Please check console.",
            noToolsAvailable: "No Get Code available. The code list might be empty or could not be loaded.",
            noToolsToDisplay: "No Get Code to display."
        },
        de: {
            pageTitle: "Code-Finder",
            headerH1: "Code-Finder",
            headerP: "Suchen Sie schnell und effizient nach Ihren Codes.",
            searchInputPlaceholder: "Suche nach Code",
            mainPageButton: "Hauptseite",
            footerText: "© 2025 Tiwut. Alle Codes griffbereit.",
            noResultsFound: "Keine Codes für \"{searchTerm}\" gefunden.",
            errorLoading: "Fehler beim Laden der Codes. Bitte Konsole prüfen.",
            noToolsAvailable: "Keine Codes verfügbar. Die Liste ist möglicherweise leer oder konnte nicht geladen werden.",
            noToolsToDisplay: "Keine Codes zum Anzeigen."
        },
        es: {
            pageTitle: "Obtener código",
            headerH1: "Obtener código",
            headerP: "Encuentra tus códigos de forma rápida y eficiente.",
            searchInputPlaceholder: "Búsqueda de códigos",
            mainPageButton: "Página Principal",
            footerText: "© 2025 Tiwut. Todos los códigos a tu alcance.",
            noResultsFound: "No se ha encontrado ningún código que coincida con \"{searchTerm}\".",
            errorLoading: "Error al cargar los códigos. Revisa la consola para solucionar el problema.",
            noToolsAvailable: "No hay códigos disponibles. La lista debería estar vacía o ignorarse.",
            noToolsToDisplay: "No hay códigos disponibles para mostrar."
        }
    };
    
    const supportedLangs = Object.keys(translations);

    function applyTranslations(lang) {
        if (!supportedLangs.includes(lang)) {
            lang = 'en';
        }
        currentLang = lang;
        document.documentElement.lang = lang;
        const dict = translations[lang];

        document.title = dict.pageTitle;

        document.querySelectorAll('[data-translate-key]').forEach(element => {
            const key = element.getAttribute('data-translate-key');
            if (dict[key]) {
                element.textContent = dict[key];
            }
        });

        document.querySelectorAll('[data-translate-placeholder-key]').forEach(element => {
            const key = element.getAttribute('data-translate-placeholder-key');
            if (dict[key]) {
                element.placeholder = dict[key];
            }
        });
        
        filterAndDisplayCodes(); 
    }

    function getInitialLanguage() {
        const savedLang = localStorage.getItem('preferredLanguage');
        if (savedLang && supportedLangs.includes(savedLang)) {
            return savedLang;
        }

        const browserLang = navigator.language.split('-')[0];
        if (supportedLangs.includes(browserLang)) {
            return browserLang;
        }

        return 'en';
    }
    
    function setupLangSwitcher() {
        const langOptions = {
            en: 'English',
            de: 'Deutsch',
            es: 'Español'
        };

        supportedLangs.forEach(lang => {
            const option = document.createElement('option');
            option.value = lang;
            option.textContent = langOptions[lang];
            langSwitcher.appendChild(option);
        });

        const initialLang = getInitialLanguage();
        langSwitcher.value = initialLang;
        applyTranslations(initialLang);

        langSwitcher.addEventListener('change', (event) => {
            const newLang = event.target.value;
            localStorage.setItem('preferredLanguage', newLang);
            applyTranslations(newLang);
        });
    }

    async function fetchCodes() {
        try {
            const response = await fetch('codes.txt');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const text = await response.text();
            allCodes = text.split('\n')
                           .map(line => line.trim())
                           .filter(line => line.length > 0);
            
            filterAndDisplayCodes();

        } catch (error) {
            console.error('Error fetching or parsing codes.txt:', error);
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

    setupLangSwitcher();
    fetchCodes();
});
