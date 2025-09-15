// Simple search functionality
class SimpleSearch {
    constructor() {
        this.pages = window.simpleSearchData || [];
        this.init();
    }

    init() {
        this.setupSearchForm();
        console.log('Simple search ready with', this.pages.length, 'pages');
    }

    setupSearchForm() {
        const form = document.getElementById('search-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.performSearch();
            });
        }
    }

    performSearch() {
        const query = document.getElementById('search-input').value.toLowerCase().trim();
        
        if (!query) {
            alert('Please enter something to search');
            return;
        }

        const results = this.searchPages(query);
        this.showResults(results, query);
    }

    searchPages(query) {
        return this.pages.filter(page => {
            return page.title.toLowerCase().includes(query) || 
                   page.content.toLowerCase().includes(query) ||
                   page.url.toLowerCase().includes(query);
        });
    }

    showResults(results, query) {
        // Remove any existing results
        const oldResults = document.getElementById('search-results');
        if (oldResults) {
            oldResults.remove();
        }

        // Create results container
        const resultsDiv = document.createElement('div');
        resultsDiv.id = 'search-results';
        resultsDiv.className = 'search-results';

        if (results.length === 0) {
            resultsDiv.innerHTML = `<p>No results found for "<strong>${this.escapeHtml(query)}</strong>"</p>`;
        } else {
            let html = `<p>Found ${results.length} results:</p>`;
            
            results.forEach(page => {
                html += `
                    <div class="search-result">
                        <h4><a href="${page.url}">${this.highlight(page.title, query)}</a></h4>
                        <p>${this.highlight(page.content, query)}</p>
                    </div>
                `;
            });
            
            resultsDiv.innerHTML = html;
        }

        // Add results below search form
        const searchForm = document.getElementById('search-form');
        if (searchForm) {
            searchForm.parentNode.insertBefore(resultsDiv, searchForm.nextSibling);
        }
    }

    highlight(text, query) {
        if (!text || !query) return this.escapeHtml(text);
        
        const regex = new RegExp(`(${query})`, 'gi');
        return this.escapeHtml(text).replace(regex, '<mark>$1</mark>');
    }

    escapeHtml(text) {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
}

// Start the search when page loads
document.addEventListener('DOMContentLoaded', () => {
    new SimpleSearch();
});