class MultiKeywordSearch {
    constructor() {
        this.pages = window.simpleSearchData || [];
        this.searchIndex = this.buildSearchIndex();
        this.init();
    }

    buildSearchIndex() {
        return this.pages.map(page => ({
            url: page.url.toLowerCase(),
            title: page.title.toLowerCase(),
            content: page.content.toLowerCase(),
            keywords: page.keywords ? page.keywords.toLowerCase().split(',').map(k => k.trim()) : [],
            original: page
        }));
    }

    init() {
        this.setupSearchForm();
        console.log('Multi-keyword search ready with', this.pages.length, 'pages');
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

        if (input) {
            let timeout;
            input.addEventListener('input', (e) => {
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    this.performSearch();
                }, 300);
            });
        }
    }

    performSearch() {
        const query = document.getElementById('search-input').value.toLowerCase().trim();
        
        if (!query) {
            this.clearResults();
            return;
        }

        // Split into individual keywords
        const keywords = query.split(/\s+/).filter(word => word.length > 0);
        const results = this.searchPages(keywords);
        this.showResults(results, keywords);
    }

    searchPages(keywords) {
        if (keywords.length === 0) return [];

        return this.searchIndex.filter(page => {
            // Check if ALL keywords are present in ANY field
            return keywords.every(keyword => {
                return page.title.includes(keyword) ||
                       page.content.includes(keyword) ||
                       page.url.includes(keyword) ||
                       page.keywords.some(k => k.includes(keyword));
            });
        }).map(page => page.original);
    }

    showResults(results, keywords) {
        this.clearResults();

        const resultsDiv = document.createElement('div');
        resultsDiv.id = 'search-results';
        resultsDiv.className = 'search-results';

        if (results.length === 0) {
            resultsDiv.innerHTML = `
                <div class="no-results">
                    <p>No results found for all keywords: <strong>${keywords.join(' + ')}</strong></p>
                    <p class="search-tip">Try searching for individual terms or broader keywords</p>
                </div>
            `;
        } else {
            let html = `<div class="results-header">
                <h3>${results.length} results for: ${keywords.map(k => `<span class="keyword-pill">${k}</span>`).join(' + ')}</h3>
                <small>All keywords must be present</small>
            </div>`;
            
            results.forEach(page => {
                const matches = this.findKeywordMatches(page, keywords);
                html += `
                    <div class="search-result">
                        <h4><a href="${page.url}">${this.highlightMultiple(page.title, keywords)}</a></h4>
                        <p>${this.highlightMultiple(this.getBestSnippet(page.content, keywords), keywords)}</p>
                        ${page.keywords ? `
                        <div class="keywords">
                            <strong>Keywords:</strong> 
                            ${this.highlightMultiple(page.keywords, keywords)}
                        </div>
                        ` : ''}
                        ${matches.length > 0 ? `
                        <div class="match-info">
                            <small>Matches: ${matches.join(', ')}</small>
                        </div>
                        ` : ''}
                    </div>
                `;
            });
            
            resultsDiv.innerHTML = html;
        }

        document.getElementById('search-form').after(resultsDiv);
    }

    findKeywordMatches(page, keywords) {
        const matches = [];
        const pageData = this.searchIndex.find(p => p.original.url === page.url);
        
        keywords.forEach(keyword => {
            if (pageData.title.includes(keyword)) matches.push('title');
            else if (pageData.content.includes(keyword)) matches.push('content');
            else if (pageData.keywords.some(k => k.includes(keyword))) matches.push('keywords');
            else if (pageData.url.includes(keyword)) matches.push('URL');
        });
        
        return [...new Set(matches)]; // Remove duplicates
    }

    getBestSnippet(content, keywords) {
        // Try to find a snippet that contains the first keyword
        const firstKeyword = keywords[0];
        const position = content.toLowerCase().indexOf(firstKeyword);
        
        if (position === -1) return content.substring(0, 150) + '...';
        
        const start = Math.max(0, position - 50);
        const end = Math.min(content.length, position + 100);
        return (start > 0 ? '...' : '') + content.substring(start, end) + (end < content.length ? '...' : '');
    }

    highlightMultiple(text, keywords) {
        if (!text || keywords.length === 0) return this.escapeHtml(text);
        
        let highlighted = this.escapeHtml(text);
        keywords.forEach(keyword => {
            const regex = new RegExp(`(${this.escapeRegex(keyword)})`, 'gi');
            highlighted = highlighted.replace(regex, '<mark>$1</mark>');
        });
        
        return highlighted;
    }

    clearResults() {
        const oldResults = document.getElementById('search-results');
        if (oldResults) oldResults.remove();
    }

    escapeHtml(text) { 
        return text.toString().replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'})[m]); 
    }
    
    escapeRegex(string) { 
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); 
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    new MultiKeywordSearch();
});