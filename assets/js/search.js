class EfficientSearch {
    constructor() {
        this.pages = window.simpleSearchData || [];
        this.searchIndex = this.buildSearchIndex();
        this.init();
    }

    buildSearchIndex() {
        // Pre-process pages for faster searching
        return this.pages.map(page => ({
            url: page.url.toLowerCase(),
            title: page.title.toLowerCase(),
            content: page.content.toLowerCase(),
            keywords: page.keywords ? page.keywords.toLowerCase().split(',') : [],
            original: page
        }));
    }

    init() {
        this.setupSearchForm();
        console.log('Search ready with', this.pages.length, 'pages');
    }

    setupSearchForm() {
        const form = document.getElementById('search-form');
        const input = document.getElementById('search-input');
        
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.performSearch();
            });
        }

        // Real-time search as you type (optional)
        if (input) {
            let timeout;
            input.addEventListener('input', (e) => {
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    this.performSearch();
                }, 300); // Search after 300ms of typing stopped
            });
        }
    }

    performSearch() {
        const query = document.getElementById('search-input').value.toLowerCase().trim();
        
        if (!query) {
            this.clearResults();
            return;
        }

        const results = this.searchPages(query);
        this.showResults(results, query);
    }

    searchPages(query) {
        return this.searchIndex.filter(page => {
            // Check title, content, URL, and keywords
            return page.title.includes(query) ||
                   page.content.includes(query) ||
                   page.url.includes(query) ||
                   page.keywords.some(keyword => keyword.includes(query));
        }).map(page => page.original);
    }

    showResults(results, query) {
        this.clearResults();

        const resultsDiv = document.createElement('div');
        resultsDiv.id = 'search-results';
        resultsDiv.className = 'search-results';

        if (results.length === 0) {
            resultsDiv.innerHTML = `<p>No results found for "<strong>${this.escapeHtml(query)}</strong>"</p>`;
        } else {
            let html = `<div class="results-header">
                <h3>${results.length} results found</h3>
                <small>Searching ${this.pages.length} total pages</small>
            </div>`;
            
            results.forEach(page => {
                const snippet = this.getBestSnippet(page.content, query);
                html += `
                    <div class="search-result">
                        <h4><a href="${page.url}">${this.highlight(page.title, query)}</a></h4>
                        <p>${this.highlight(snippet, query)}</p>
                        ${page.keywords ? `<div class="keywords">Keywords: ${this.highlight(page.keywords, query)}</div>` : ''}
                    </div>
                `;
            });
            
            resultsDiv.innerHTML = html;
        }

        document.getElementById('search-form').after(resultsDiv);
    }

    getBestSnippet(content, query) {
        const position = content.toLowerCase().indexOf(query.toLowerCase());
        if (position === -1) return content.substring(0, 150) + '...';
        
        const start = Math.max(0, position - 50);
        const end = Math.min(content.length, position + 100);
        return (start > 0 ? '...' : '') + content.substring(start, end) + (end < content.length ? '...' : '');
    }

    clearResults() {
        const oldResults = document.getElementById('search-results');
        if (oldResults) oldResults.remove();
    }

    highlight(text, query) {
        if (!text || !query) return this.escapeHtml(text);
        const regex = new RegExp(`(${this.escapeRegex(query)})`, 'gi');
        return this.escapeHtml(text).replace(regex, '<mark>$1</mark>');
    }

    escapeHtml(text) { return text.toString().replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'})[m]); }
    escapeRegex(string) { return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    new EfficientSearch();
});