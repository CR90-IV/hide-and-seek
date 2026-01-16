/* ============================================
   STATE MANAGEMENT
   ============================================ */

// Load used questions and history from localStorage
const usedQuestions = JSON.parse(localStorage.getItem('usedQuestions') || '[]');
const questionHistory = JSON.parse(localStorage.getItem('questionHistory') || '[]');

// Load WhatsApp mode setting from localStorage
let whatsappMode = localStorage.getItem('whatsappMode') || 'clipboard';

// Search state
let searchActive = false;
let searchQuery = '';
let searchDebounceTimer = null;

// Undo state
let lastAction = null;

/* ============================================
   UTILITY FUNCTIONS
   ============================================ */

/**
 * Converts HTML links to plain text with visible URLs
 * Format: "link text: URL"
 */
function convertLinksToPlainText(html) {
    if (!html) return html;

    // Create a temporary element to parse HTML
    const temp = document.createElement('div');
    temp.innerHTML = html;

    // Find all anchor tags and replace them with "text: URL" format
    const links = temp.querySelectorAll('a');
    links.forEach(link => {
        const text = link.textContent;
        const url = link.href;
        const replacement = document.createTextNode(`${text}: ${url}`);
        link.parentNode.replaceChild(replacement, link);
    });

    return temp.textContent;
}

/**
 * Shows toast notification
 * @param {string} message - The message to display (default: 'COPIED TO CLIPBOARD')
 * @param {boolean} showUndo - Whether to show the undo button (default: false)
 */
function showToast(message = 'COPIED TO CLIPBOARD', showUndo = false) {
    const toast = document.getElementById('toast');
    const toastText = document.getElementById('toast-text');
    const undoBtn = document.getElementById('undo-btn');

    // Update the message
    toastText.textContent = message;

    // Show/hide undo button
    if (showUndo) {
        undoBtn.classList.remove('hidden');
        toast.classList.add('toast-with-undo');
    } else {
        undoBtn.classList.add('hidden');
        toast.classList.remove('toast-with-undo');
    }

    toast.classList.remove('hidden');
    toast.classList.add('toast');

    // Set timeout based on whether undo is shown
    const duration = showUndo ? 4000 : 2000;
    setTimeout(() => {
        toast.classList.add('hidden');
        toast.classList.remove('toast', 'toast-with-undo');
    }, duration);
}

/**
 * Returns appropriate text color class for category headers
 */
function getCategoryTextColor(categoryKey) {
    const colorMap = {
        'matching': 'text-gray-200',
        'measuring': 'text-green-100',
        'radar': 'text-orange-100',
        'thermometer': 'text-yellow-100',
        'photo': 'text-blue-100',
        'tentacle': 'text-white'
    };
    return colorMap[categoryKey] || 'text-gray-100';
}

/* ============================================
   OVERFLOW MENU FUNCTIONS
   ============================================ */

/**
 * Toggles the overflow menu visibility
 */
function toggleOverflowMenu() {
    const menu = document.getElementById('overflow-menu');
    menu.classList.toggle('hidden');
}

/**
 * Closes the overflow menu
 */
function closeOverflowMenu() {
    const menu = document.getElementById('overflow-menu');
    menu.classList.add('hidden');
}

/* ============================================
   SETTINGS FUNCTIONS
   ============================================ */

/**
 * Opens the settings modal
 */
function openSettings() {
    const modal = document.getElementById('settings-modal');
    modal.classList.remove('hidden');

    // Set the current mode in the radio buttons
    const radioButtons = document.querySelectorAll('input[name="whatsapp-mode"]');
    radioButtons.forEach(radio => {
        radio.checked = radio.value === whatsappMode;
    });
}

/**
 * Closes the settings modal
 */
function closeSettings() {
    const modal = document.getElementById('settings-modal');
    modal.classList.add('hidden');
}

/**
 * Sets the WhatsApp mode and saves to localStorage
 * @param {string} mode - 'clipboard' or 'deeplink'
 */
function setWhatsAppMode(mode) {
    whatsappMode = mode;
    localStorage.setItem('whatsappMode', mode);
}

/* ============================================
   UNDO FUNCTION
   ============================================ */

/**
 * Undoes the last copy action
 */
function undo() {
    if (!lastAction) {
        return;
    }

    const { key, category, title } = lastAction;

    // Remove from usedQuestions
    const index = usedQuestions.indexOf(key);
    if (index > -1) {
        usedQuestions.splice(index, 1);
        localStorage.setItem('usedQuestions', JSON.stringify(usedQuestions));
    }

    // Remove last item from questionHistory
    if (questionHistory.length > 0) {
        questionHistory.pop();
        localStorage.setItem('questionHistory', JSON.stringify(questionHistory));
        renderHistory();
    }

    // Update visual states across all views
    // Detail view
    document.querySelectorAll('.question-card, .thermometer-card').forEach(card => {
        if (card.dataset.category === category && card.dataset.title === title) {
            card.classList.remove('card-used');
        }
    });

    // Overview view
    document.querySelectorAll('.overview-card').forEach(overviewCard => {
        if (overviewCard.dataset.category === category && overviewCard.dataset.title === title) {
            overviewCard.classList.remove('overview-card-used');
            // Remove checkmark
            const checkmark = overviewCard.querySelector('.overview-checkmark');
            if (checkmark) {
                checkmark.remove();
            }
        }
    });

    // Clear lastAction
    lastAction = null;

    // Hide toast
    const toast = document.getElementById('toast');
    toast.classList.add('hidden');
    toast.classList.remove('toast', 'toast-with-undo');
}

/* ============================================
   SEARCH FUNCTIONS
   ============================================ */

/**
 * Toggles the search bar visibility
 */
function toggleSearch() {
    const searchContainer = document.getElementById('search-container');
    const searchInput = document.getElementById('search-input');
    const currentView = document.querySelector('.main-content:not(.hidden)').id;

    searchActive = !searchActive;

    if (searchActive) {
        searchContainer.classList.remove('hidden');

        // Check if we're in detail view
        if (currentView !== 'normal-view') {
            showSearchMessage('Switch to Detail view to search questions');
        } else {
            hideSearchMessage();
            // Focus the input for immediate typing
            setTimeout(() => searchInput.focus(), 100);
        }
    } else {
        searchContainer.classList.add('hidden');
        clearSearch();
    }
}

/**
 * Handles search input with debouncing
 * @param {string} query - The search query
 */
function handleSearch(query) {
    searchQuery = query;

    // Clear existing timer
    if (searchDebounceTimer) {
        clearTimeout(searchDebounceTimer);
    }

    // Debounce the search
    searchDebounceTimer = setTimeout(() => {
        filterQuestions(query);
    }, 150);
}

/**
 * Filters questions based on search query
 * @param {string} query - The search query
 */
function filterQuestions(query) {
    const normalizedQuery = query.toLowerCase().trim();

    if (!normalizedQuery) {
        // Show all questions
        document.querySelectorAll('.question-card, .thermometer-card').forEach(card => {
            card.style.display = '';
        });
        document.querySelectorAll('#questions-grid > section').forEach(section => {
            section.style.display = '';
        });
        updateSearchCount(0, 0);
        return;
    }

    let totalQuestions = 0;
    let matchingQuestions = 0;

    // Filter cards
    document.querySelectorAll('.question-card, .thermometer-card').forEach(card => {
        totalQuestions++;
        const title = card.dataset.title?.toLowerCase() || '';
        const question = card.dataset.question?.toLowerCase() || '';

        if (title.includes(normalizedQuery) || question.includes(normalizedQuery)) {
            card.style.display = '';
            matchingQuestions++;
        } else {
            card.style.display = 'none';
        }
    });

    // Hide empty sections
    document.querySelectorAll('#questions-grid > section').forEach(section => {
        const visibleCards = section.querySelectorAll('.question-card:not([style*="display: none"]), .thermometer-card:not([style*="display: none"])');
        if (visibleCards.length === 0) {
            section.style.display = 'none';
        } else {
            section.style.display = '';
        }
    });

    updateSearchCount(matchingQuestions, totalQuestions);
}

/**
 * Updates the search results count
 * @param {number} matching - Number of matching questions
 * @param {number} total - Total number of questions
 */
function updateSearchCount(matching, total) {
    const countElement = document.getElementById('search-results-count');

    if (matching === 0 && total === 0) {
        countElement.textContent = '';
    } else if (matching === 0) {
        countElement.textContent = 'No questions found';
    } else {
        countElement.textContent = `Found ${matching} question${matching !== 1 ? 's' : ''}`;
    }
}

/**
 * Clears the search and shows all questions
 */
function clearSearch() {
    const searchInput = document.getElementById('search-input');
    searchInput.value = '';
    searchQuery = '';
    filterQuestions('');
    hideSearchMessage();
}

/**
 * Shows a message in the search bar
 * @param {string} message - The message to show
 */
function showSearchMessage(message) {
    const messageElement = document.getElementById('search-message');
    messageElement.textContent = message;
    messageElement.classList.remove('hidden');
}

/**
 * Hides the search message
 */
function hideSearchMessage() {
    const messageElement = document.getElementById('search-message');
    messageElement.classList.add('hidden');
}

/* ============================================
   RENDERING FUNCTIONS
   ============================================ */

/**
 * Renders all question categories and the general rules section
 */
function renderAllQuestions() {
    const container = document.getElementById('questions-grid');

    // Render each category
    for (const [categoryKey, categoryData] of Object.entries(questionsData)) {
        const section = renderCategory(categoryKey, categoryData);
        container.appendChild(section);
    }

    // Add general rules section
    const rulesSection = createRulesSection();
    container.appendChild(rulesSection);

    // Attach event listeners to all question cards
    document.querySelectorAll('.question-card').forEach(card => {
        const key = card.dataset.category + ':' + card.dataset.title;
        if (usedQuestions.includes(key)) {
            card.classList.add('card-used');
        }
        card.addEventListener('click', () => copyQuestion(card));
    });

    // Mark thermometer cards as used if they're in localStorage
    document.querySelectorAll('.thermometer-card').forEach(card => {
        const key = card.dataset.category + ':' + card.dataset.title;
        if (usedQuestions.includes(key)) {
            card.classList.add('card-used');
        }
    });
}

/**
 * Renders a single category section with header and question cards
 */
function renderCategory(categoryKey, categoryData) {
    const section = document.createElement('section');

    // Create header
    const header = document.createElement('div');
    header.className = `${categoryKey}-header text-white p-3`;
    header.style.borderRadius = '4px 4px 0 0';
    header.innerHTML = `
        <h2 class="text-xl font-bold tracking-wide uppercase">${categoryData.title}</h2>
        <p class="text-base ${getCategoryTextColor(categoryKey)} mt-2 font-medium">${categoryData.description}</p>
        <div class="flex flex-wrap gap-2 mt-3 text-sm font-semibold">
            ${categoryData.badges.map(badge => `<span class="bg-white/30 backdrop-blur-sm px-2.5 py-1" style="border-radius: 2px;">${badge}</span>`).join('')}
        </div>
    `;
    section.appendChild(header);

    // Create content container
    const content = document.createElement('div');
    content.className = 'bg-white border-2 border-t-0 border-gray-200 p-3 space-y-2';
    content.style.borderRadius = '0 0 4px 4px';

    // Add note if exists (at top)
    if (categoryData.note) {
        const noteBox = document.createElement('div');
        noteBox.className = 'bg-yellow-50 border-l-4 border-yellow-400 p-2.5';
        noteBox.style.borderRadius = '2px';
        noteBox.innerHTML = `<p class="text-gray-800 text-sm font-medium"><span class="material-symbols-outlined text-base align-middle mr-1">info</span>${categoryData.note}</p>`;
        content.appendChild(noteBox);
    }

    // Render question groups
    categoryData.questions.forEach(group => {
        if (group.subcategory) {
            const subcatLabel = document.createElement('p');
            subcatLabel.className = 'text-gray-700 text-sm font-bold uppercase tracking-wider pt-3 first:pt-1 flex items-center';
            subcatLabel.innerHTML = `<span class="w-2 h-2 rounded-full bg-current mr-2"></span>${group.subcategory}`;
            content.appendChild(subcatLabel);
        }

        // Create grid or regular layout
        const itemsContainer = document.createElement('div');
        if (categoryData.gridCols) {
            itemsContainer.className = `grid grid-cols-${categoryData.gridCols} gap-2`;
        } else {
            itemsContainer.className = 'space-y-2';
        }

        group.items.forEach(item => {
            const card = createQuestionCard(categoryKey, categoryData, item);
            itemsContainer.appendChild(card);
        });

        content.appendChild(itemsContainer);
    });

    section.appendChild(content);
    return section;
}

/**
 * Creates a question card element (regular or thermometer type)
 */
function createQuestionCard(categoryKey, categoryData, item) {
    const card = document.createElement('div');

    // Special handling for thermometer cards
    if (categoryKey === 'thermometer') {
        card.className = `thermometer-card border-2 p-3 bg-white`;
        card.style.borderRadius = '6px';
        card.style.boxShadow = 'var(--station-shadow)';

        // Set data attributes for tracking
        card.dataset.category = categoryData.title;
        card.dataset.title = item.title;

        const cardHTML = `
            <div class="flex items-center gap-3">
                <div class="icon-shape">
                    <span class="material-symbols-outlined text-2xl">${item.icon}</span>
                </div>
                <div class="flex-1 min-w-0">
                    <p class="text-gray-900 font-semibold text-base mb-2">${item.title}</p>
                    <div class="flex gap-2">
                        <button class="thermometer-btn start-btn flex-1 bg-white hover:bg-gray-50 border-2 border-gray-300 text-gray-700 py-1.5 px-2 text-xs font-semibold transition-all"
                                style="border-radius: 4px;"
                                data-distance="${item.title}"
                                onclick="copyThermometerStart(this, event)">
                            Start
                        </button>
                        <button class="thermometer-btn end-btn flex-1 bg-white hover:bg-gray-50 border-2 border-gray-300 text-gray-700 py-1.5 px-2 text-xs font-semibold transition-all"
                                style="border-radius: 4px;"
                                data-category="${categoryData.title}"
                                data-title="${item.title}"
                                data-question="${item.question}"
                                data-answer="${item.answer || categoryData.answer}"
                                data-note="${item.note || ''}"
                                data-reward="${categoryData.reward}"
                                onclick="copyThermometerEnd(this, event)">
                            End
                        </button>
                    </div>
                </div>
            </div>
        `;
        card.innerHTML = cardHTML;
        return card;
    }

    // Regular cards for other categories
    card.className = `question-card ${categoryKey}-card border-2 p-3 cursor-pointer transition-all`;
    card.style.borderRadius = '6px';

    // Set data attributes
    card.dataset.category = categoryData.title;
    card.dataset.title = item.title;
    card.dataset.question = item.question;
    card.dataset.answer = item.answer || categoryData.answer;
    card.dataset.note = item.note || '';
    card.dataset.reward = categoryData.reward;

    // Create content with text on left, icon shape on right
    const isGrid = categoryData.gridCols;

    if (isGrid) {
        // Grid layout - centered with icon and text
        let cardHTML = `
            <div class="flex flex-col items-center gap-2">
                <div class="icon-shape">
                    <span class="material-symbols-outlined text-2xl">${item.icon}</span>
                </div>
                <p class="text-gray-900 font-semibold text-base text-center">${item.subtitle ? 'Choose' : item.title}</p>
        `;
        if (item.subtitle) {
            cardHTML += `<p class="text-gray-600 text-sm text-center font-medium">${item.subtitle}</p>`;
        }
        cardHTML += `</div>`;
        card.innerHTML = cardHTML;
    } else {
        // Regular layout - icon on left, text on right
        let cardHTML = `
            <div class="flex items-center gap-3">
                <div class="icon-shape">
                    <span class="material-symbols-outlined text-2xl">${item.icon}</span>
                </div>
                <div class="flex-1">
                    <p class="text-gray-900 font-semibold text-base">${item.title}</p>
        `;
        if (item.note) {
            cardHTML += `<p class="text-gray-600 text-sm mt-1 leading-relaxed">${item.note}</p>`;
        }
        cardHTML += `
                </div>
            </div>
        `;
        card.innerHTML = cardHTML;
    }

    return card;
}

/**
 * Creates the general rules section
 */
function createRulesSection() {
    const section = document.createElement('section');

    // Create container
    const container = document.createElement('div');
    container.className = 'bg-white border-2 border-gray-300 p-4 shadow-sm';
    container.style.borderRadius = '4px';

    // Create header
    const header = document.createElement('h2');
    header.className = 'text-lg font-bold text-gray-900 mb-3 uppercase tracking-wide flex items-center';
    header.innerHTML = `
        <span class="material-symbols-outlined mr-2 text-xl">${rulesData.icon}</span>
        ${rulesData.title}
    `;
    container.appendChild(header);

    // Create rules list
    const list = document.createElement('ul');
    list.className = 'space-y-2.5 text-base text-gray-700';

    rulesData.rules.forEach(rule => {
        const listItem = document.createElement('li');
        listItem.className = 'flex items-start gap-3';
        listItem.innerHTML = `
            <span class="material-symbols-outlined text-lg text-gray-400">${rule.icon}</span>
            <span class="leading-relaxed">${rule.text}</span>
        `;
        list.appendChild(listItem);
    });

    container.appendChild(list);
    section.appendChild(container);

    return section;
}

/* ============================================
   COPY & EVENT HANDLERS
   ============================================ */

/**
 * Handles copying question to clipboard and marking as used
 * Also toggles back to unused if already used
 */
function copyQuestion(card) {
    const category = card.dataset.category;
    const title = card.dataset.title;
    const key = category + ':' + title;

    // Check if already used - if so, toggle it back to unused
    if (card.classList.contains('card-used')) {
        card.classList.remove('card-used');

        // Remove from usedQuestions
        const index = usedQuestions.indexOf(key);
        if (index > -1) {
            usedQuestions.splice(index, 1);
            localStorage.setItem('usedQuestions', JSON.stringify(usedQuestions));
        }

        // Also update overview if it exists
        document.querySelectorAll('.overview-card').forEach(overviewCard => {
            if (overviewCard.dataset.category === category && overviewCard.dataset.title === title) {
                overviewCard.classList.remove('overview-card-used');
                // Remove checkmark
                const checkmark = overviewCard.querySelector('.overview-checkmark');
                if (checkmark) {
                    checkmark.remove();
                }
            }
        });

        return; // Don't copy to clipboard
    }

    const question = card.dataset.question;
    const answer = card.dataset.answer;
    const note = card.dataset.note;
    const reward = card.dataset.reward;

    // Build WhatsApp-formatted message with full question
    let message = `*${category}: ${title}*\n`;
    message += `${question}\n`;
    message += `Answer: ${answer}\n`;
    if (note) {
        const plainTextNote = convertLinksToPlainText(note);
        message += `_${plainTextNote}_\n`;
    }
    message += `Reward: ${reward}`;

    // Handle copy based on whatsappMode
    if (whatsappMode === 'deeplink') {
        // Open WhatsApp with pre-filled message
        const encodedMessage = encodeURIComponent(message);
        window.location.href = `https://wa.me/?text=${encodedMessage}`;

        // Mark as used
        card.classList.add('card-used');

        // Save to localStorage
        if (!usedQuestions.includes(key)) {
            usedQuestions.push(key);
            localStorage.setItem('usedQuestions', JSON.stringify(usedQuestions));
        }

        // Also update overview if it exists
        document.querySelectorAll('.overview-card').forEach(overviewCard => {
            if (overviewCard.dataset.category === category && overviewCard.dataset.title === title) {
                overviewCard.classList.add('overview-card-used');
                // Add checkmark if not already present
                const iconWrapper = overviewCard.querySelector('.overview-card-icon-wrapper');
                if (iconWrapper && !overviewCard.querySelector('.overview-checkmark')) {
                    const checkmark = document.createElement('span');
                    checkmark.className = 'overview-checkmark material-symbols-outlined';
                    checkmark.textContent = 'check_circle';
                    iconWrapper.appendChild(checkmark);
                }
            }
        });

        // Add to history
        questionHistory.push({
            category,
            title,
            question,
            timestamp: new Date().toISOString()
        });
        localStorage.setItem('questionHistory', JSON.stringify(questionHistory));
        renderHistory();

        // Show toast (no undo for WhatsApp mode)
        showToast('OPENING WHATSAPP', false);
    } else {
        // Copy to clipboard
        navigator.clipboard.writeText(message).then(() => {
            // Mark as used
            card.classList.add('card-used');

            // Save to localStorage
            if (!usedQuestions.includes(key)) {
                usedQuestions.push(key);
                localStorage.setItem('usedQuestions', JSON.stringify(usedQuestions));
            }

            // Also update overview if it exists
            document.querySelectorAll('.overview-card').forEach(overviewCard => {
                if (overviewCard.dataset.category === category && overviewCard.dataset.title === title) {
                    overviewCard.classList.add('overview-card-used');
                    // Add checkmark if not already present
                    const iconWrapper = overviewCard.querySelector('.overview-card-icon-wrapper');
                    if (iconWrapper && !overviewCard.querySelector('.overview-checkmark')) {
                        const checkmark = document.createElement('span');
                        checkmark.className = 'overview-checkmark material-symbols-outlined';
                        checkmark.textContent = 'check_circle';
                        iconWrapper.appendChild(checkmark);
                    }
                }
            });

            // Add to history
            questionHistory.push({
                category,
                title,
                question,
                timestamp: new Date().toISOString()
            });
            localStorage.setItem('questionHistory', JSON.stringify(questionHistory));
            renderHistory();

            // Set lastAction for undo
            lastAction = {
                key,
                category,
                title,
                timestamp: Date.now()
            };

            // Show toast with undo button
            showToast('COPIED TO CLIPBOARD', true);
        }).catch(err => {
            console.error('Failed to copy:', err);
            alert('Failed to copy to clipboard');
        });
    }
}

/**
 * Copies thermometer start message to clipboard
 */
function copyThermometerStart(button, event) {
    event.stopPropagation();

    // Check if card is already used
    const card = button.closest('.thermometer-card');
    if (card && card.classList.contains('card-used')) {
        return;
    }

    const distance = button.dataset.distance;
    const message = `Starting a ${distance} thermometer`;

    navigator.clipboard.writeText(message).then(() => {
        showToast();
    }).catch(err => {
        console.error('Failed to copy:', err);
        alert('Failed to copy to clipboard');
    });
}

/**
 * Copies thermometer end question and marks card as used
 */
function copyThermometerEnd(button, event) {
    event.stopPropagation();

    // Check if card is already used
    const card = button.closest('.thermometer-card');
    if (card && card.classList.contains('card-used')) {
        return;
    }

    const category = button.dataset.category;
    const title = button.dataset.title;
    const question = button.dataset.question;
    const answer = button.dataset.answer;
    const note = button.dataset.note;
    const reward = button.dataset.reward;

    // Build WhatsApp-formatted message with full question
    let message = `*${category}: ${title}*\n`;
    message += `${question}\n`;
    message += `Answer: ${answer}\n`;
    if (note) {
        const plainTextNote = convertLinksToPlainText(note);
        message += `_${plainTextNote}_\n`;
    }
    message += `Reward: ${reward}`;

    // Handle copy based on whatsappMode
    if (whatsappMode === 'deeplink') {
        // Open WhatsApp with pre-filled message
        const encodedMessage = encodeURIComponent(message);
        window.location.href = `https://wa.me/?text=${encodedMessage}`;

        // Mark card as used
        if (card) {
            card.classList.add('card-used');

            // Save to localStorage
            const key = category + ':' + title;
            if (!usedQuestions.includes(key)) {
                usedQuestions.push(key);
                localStorage.setItem('usedQuestions', JSON.stringify(usedQuestions));
            }

            // Also update overview if it exists
            document.querySelectorAll('.overview-card').forEach(overviewCard => {
                if (overviewCard.dataset.category === category && overviewCard.dataset.title === title) {
                    overviewCard.classList.add('overview-card-used');
                    // Add checkmark if not already present
                    const iconWrapper = overviewCard.querySelector('.overview-card-icon-wrapper');
                    if (iconWrapper && !overviewCard.querySelector('.overview-checkmark')) {
                        const checkmark = document.createElement('span');
                        checkmark.className = 'overview-checkmark material-symbols-outlined';
                        checkmark.textContent = 'check_circle';
                        iconWrapper.appendChild(checkmark);
                    }
                }
            });

            // Add to history
            questionHistory.push({
                category,
                title,
                question,
                timestamp: new Date().toISOString()
            });
            localStorage.setItem('questionHistory', JSON.stringify(questionHistory));
            renderHistory();
        }

        showToast('OPENING WHATSAPP', false);
    } else {
        // Copy to clipboard
        navigator.clipboard.writeText(message).then(() => {
            // Mark card as used
            if (card) {
                card.classList.add('card-used');

                // Save to localStorage
                const key = category + ':' + title;
                if (!usedQuestions.includes(key)) {
                    usedQuestions.push(key);
                    localStorage.setItem('usedQuestions', JSON.stringify(usedQuestions));
                }

                // Also update overview if it exists
                document.querySelectorAll('.overview-card').forEach(overviewCard => {
                    if (overviewCard.dataset.category === category && overviewCard.dataset.title === title) {
                        overviewCard.classList.add('overview-card-used');
                        // Add checkmark if not already present
                        const iconWrapper = overviewCard.querySelector('.overview-card-icon-wrapper');
                        if (iconWrapper && !overviewCard.querySelector('.overview-checkmark')) {
                            const checkmark = document.createElement('span');
                            checkmark.className = 'overview-checkmark material-symbols-outlined';
                            checkmark.textContent = 'check_circle';
                            iconWrapper.appendChild(checkmark);
                        }
                    }
                });

                // Add to history
                questionHistory.push({
                    category,
                    title,
                    question,
                    timestamp: new Date().toISOString()
                });
                localStorage.setItem('questionHistory', JSON.stringify(questionHistory));
                renderHistory();

                // Set lastAction for undo
                lastAction = {
                    key,
                    category,
                    title,
                    timestamp: Date.now()
                };
            }

            showToast('COPIED TO CLIPBOARD', true);
        }).catch(err => {
            console.error('Failed to copy:', err);
            alert('Failed to copy to clipboard');
        });
    }
}

/**
 * Copies question from overview mode and marks as used
 */
function copyQuestionFromOverview(card) {
    const category = card.dataset.category;
    const title = card.dataset.title;
    const key = category + ':' + title;

    // Check if already used - if so, toggle it back to unused
    if (card.classList.contains('overview-card-used')) {
        card.classList.remove('overview-card-used');

        // Remove checkmark
        const checkmark = card.querySelector('.overview-checkmark');
        if (checkmark) {
            checkmark.remove();
        }

        // Remove from usedQuestions
        const index = usedQuestions.indexOf(key);
        if (index > -1) {
            usedQuestions.splice(index, 1);
            localStorage.setItem('usedQuestions', JSON.stringify(usedQuestions));
        }

        // Also update the detail view
        document.querySelectorAll('.question-card, .thermometer-card').forEach(detailCard => {
            if (detailCard.dataset.category === category && detailCard.dataset.title === title) {
                detailCard.classList.remove('card-used');
            }
        });

        return; // Don't copy to clipboard
    }

    const question = card.dataset.question;
    const answer = card.dataset.answer;
    const note = card.dataset.note;
    const reward = card.dataset.reward;

    // Build WhatsApp-formatted message with full question
    let message = `*${category}: ${title}*\n`;
    message += `${question}\n`;
    message += `Answer: ${answer}\n`;
    if (note) {
        const plainTextNote = convertLinksToPlainText(note);
        message += `_${plainTextNote}_\n`;
    }
    message += `Reward: ${reward}`;

    // Handle copy based on whatsappMode
    if (whatsappMode === 'deeplink') {
        // Open WhatsApp with pre-filled message
        const encodedMessage = encodeURIComponent(message);
        window.location.href = `https://wa.me/?text=${encodedMessage}`;

        // Mark as used
        card.classList.add('overview-card-used');

        // Add checkmark
        const iconWrapper = card.querySelector('.overview-card-icon-wrapper');
        if (iconWrapper && !card.querySelector('.overview-checkmark')) {
            const checkmark = document.createElement('span');
            checkmark.className = 'overview-checkmark material-symbols-outlined';
            checkmark.textContent = 'check_circle';
            iconWrapper.appendChild(checkmark);
        }

        // Save to localStorage
        if (!usedQuestions.includes(key)) {
            usedQuestions.push(key);
            localStorage.setItem('usedQuestions', JSON.stringify(usedQuestions));
        }

        // Add to history
        questionHistory.push({
            category,
            title,
            question,
            timestamp: new Date().toISOString()
        });
        localStorage.setItem('questionHistory', JSON.stringify(questionHistory));
        renderHistory();

        // Also update the detail view
        document.querySelectorAll('.question-card, .thermometer-card').forEach(detailCard => {
            if (detailCard.dataset.category === category && detailCard.dataset.title === title) {
                detailCard.classList.add('card-used');
            }
        });

        // Show toast (no undo for WhatsApp mode)
        showToast('OPENING WHATSAPP', false);
    } else {
        // Copy to clipboard
        navigator.clipboard.writeText(message).then(() => {
            // Mark as used
            card.classList.add('overview-card-used');

            // Add checkmark
            const iconWrapper = card.querySelector('.overview-card-icon-wrapper');
            if (iconWrapper && !card.querySelector('.overview-checkmark')) {
                const checkmark = document.createElement('span');
                checkmark.className = 'overview-checkmark material-symbols-outlined';
                checkmark.textContent = 'check_circle';
                iconWrapper.appendChild(checkmark);
            }

            // Save to localStorage
            if (!usedQuestions.includes(key)) {
                usedQuestions.push(key);
                localStorage.setItem('usedQuestions', JSON.stringify(usedQuestions));
            }

            // Add to history
            questionHistory.push({
                category,
                title,
                question,
                timestamp: new Date().toISOString()
            });
            localStorage.setItem('questionHistory', JSON.stringify(questionHistory));
            renderHistory();

            // Also update the detail view
            document.querySelectorAll('.question-card, .thermometer-card').forEach(detailCard => {
                if (detailCard.dataset.category === category && detailCard.dataset.title === title) {
                    detailCard.classList.add('card-used');
                }
            });

            // Set lastAction for undo
            lastAction = {
                key,
                category,
                title,
                timestamp: Date.now()
            };

            // Show toast with undo button
            showToast('COPIED TO CLIPBOARD', true);
        }).catch(err => {
            console.error('Failed to copy:', err);
            alert('Failed to copy to clipboard');
        });
    }
}

/* ============================================
   QUICK JUMP NAVIGATION
   ============================================ */

/**
 * Renders the quick jump navigation dots
 */
function renderQuickJump() {
    const quickJump = document.getElementById('quick-jump');
    quickJump.innerHTML = '';

    const categories = ['matching', 'measuring', 'radar', 'thermometer', 'photo', 'tentacle'];

    categories.forEach((categoryKey, index) => {
        const dot = document.createElement('button');
        dot.className = 'quick-jump-dot';
        dot.dataset.category = categoryKey;
        dot.title = questionsData[categoryKey].title;
        dot.setAttribute('aria-label', `Jump to ${questionsData[categoryKey].title}`);
        dot.addEventListener('click', () => scrollToCategory(index));
        quickJump.appendChild(dot);
    });
}

/**
 * Scrolls to a specific category section
 * @param {number} index - The index of the category section
 */
function scrollToCategory(index) {
    const sections = document.querySelectorAll('#questions-grid > section');
    if (sections[index]) {
        sections[index].scrollIntoView({ behavior: 'smooth', block: 'start' });

        // Highlight the active dot
        document.querySelectorAll('.quick-jump-dot').forEach((dot, i) => {
            if (i === index) {
                dot.classList.add('active');
                setTimeout(() => dot.classList.remove('active'), 600);
            }
        });
    }
}

/**
 * Updates quick jump dot highlights based on scroll position
 */
function updateQuickJumpHighlight() {
    const sections = document.querySelectorAll('#questions-grid > section');
    const scrollPosition = window.scrollY + 100;

    let activeIndex = 0;
    sections.forEach((section, index) => {
        if (section.offsetTop <= scrollPosition) {
            activeIndex = index;
        }
    });

    document.querySelectorAll('.quick-jump-dot').forEach((dot, index) => {
        if (index === activeIndex) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
}

/* ============================================
   VIEW MANAGEMENT
   ============================================ */

/**
 * Switches between detail, overview, and history views
 */
function switchView(view) {
    const normalView = document.getElementById('normal-view');
    const overviewView = document.getElementById('overview-view');
    const historyView = document.getElementById('history-view');
    const quickJump = document.getElementById('quick-jump');

    // Hide all views
    normalView.classList.add('hidden');
    overviewView.classList.add('hidden');
    historyView.classList.add('hidden');

    // Show selected view
    if (view === 'detail') {
        normalView.classList.remove('hidden');
        quickJump.classList.remove('hidden');
    } else if (view === 'overview') {
        overviewView.classList.remove('hidden');
        quickJump.classList.add('hidden');
    } else if (view === 'history') {
        historyView.classList.remove('hidden');
        quickJump.classList.add('hidden');
    }

    // Update bottom nav active state
    document.querySelectorAll('.bottom-nav-item').forEach(item => {
        if (item.dataset.view === view) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

/**
 * Copies a question from history
 * @param {Object} item - The history item containing question data
 */
function copyFromHistory(item) {
    // Find the full question data
    let answer = '';
    let note = '';
    let reward = '';

    for (const [categoryKey, categoryData] of Object.entries(questionsData)) {
        if (categoryData.title === item.category) {
            answer = categoryData.answer;
            reward = categoryData.reward;

            categoryData.questions.forEach(group => {
                group.items.forEach(q => {
                    if (q.title === item.title) {
                        answer = q.answer || categoryData.answer;
                        note = q.note || '';
                    }
                });
            });
            break;
        }
    }

    // Build WhatsApp-formatted message
    let message = `*${item.category}: ${item.title}*\n`;
    message += `${item.question}\n`;
    message += `Answer: ${answer}\n`;
    if (note) {
        const plainTextNote = convertLinksToPlainText(note);
        message += `_${plainTextNote}_\n`;
    }
    message += `Reward: ${reward}`;

    // Handle copy based on whatsappMode
    if (whatsappMode === 'deeplink') {
        const encodedMessage = encodeURIComponent(message);
        window.location.href = `https://wa.me/?text=${encodedMessage}`;
        showToast('OPENING WHATSAPP', false);
    } else {
        navigator.clipboard.writeText(message).then(() => {
            showToast('COPIED TO CLIPBOARD', false);
        }).catch(err => {
            console.error('Failed to copy:', err);
            alert('Failed to copy to clipboard');
        });
    }
}

/**
 * Renders the question history with timestamps
 */
function renderHistory() {
    const container = document.getElementById('history-list');
    container.innerHTML = '';

    if (questionHistory.length === 0) {
        return; // CSS ::before will show the empty message
    }

    // Show most recent first
    const reversedHistory = [...questionHistory].reverse();

    reversedHistory.forEach((item, index) => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';

        const date = new Date(item.timestamp);
        const timeStr = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
        const dateStr = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

        // Find the icon and category key for this question
        let iconName = 'help';
        let categoryKey = '';
        for (const [key, data] of Object.entries(questionsData)) {
            if (data.title === item.category) {
                categoryKey = key;
                data.questions.forEach(group => {
                    group.items.forEach(q => {
                        if (q.title === item.title) {
                            iconName = q.icon;
                        }
                    });
                });
                break;
            }
        }

        historyItem.innerHTML = `
            <div class="flex items-start gap-3">
                <div class="icon-shape ${categoryKey}-card flex-shrink-0">
                    <span class="material-symbols-outlined text-2xl">${iconName}</span>
                </div>
                <div class="flex-1 min-w-0">
                    <p class="font-semibold text-gray-900">${item.category}: ${item.title}</p>
                    <p class="text-sm text-gray-600 mt-1">${item.question}</p>
                    <div class="flex items-center gap-2 mt-2">
                        <button class="history-copy-btn">
                            <span class="material-symbols-outlined">content_copy</span>
                            <span>Copy</span>
                        </button>
                        <div class="text-xs text-gray-500">
                            ${timeStr} • ${dateStr}
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add click handler to copy button
        const copyBtn = historyItem.querySelector('.history-copy-btn');
        copyBtn.addEventListener('click', () => copyFromHistory(item));

        container.appendChild(historyItem);
    });
}

/**
 * Renders the overview grid with all question cards (icon + title)
 */
function renderOverview() {
    const container = document.querySelector('#overview-view .overview-container');

    for (const [categoryKey, categoryData] of Object.entries(questionsData)) {
        const section = document.createElement('section');

        // Create category header
        const header = document.createElement('div');
        header.className = `${categoryKey}-header text-white p-3`;
        header.style.borderRadius = '4px 4px 0 0';
        header.innerHTML = `<h2 class="text-lg font-bold tracking-wide uppercase">${categoryData.title}</h2>`;
        section.appendChild(header);

        // Create content container
        const content = document.createElement('div');
        content.className = 'bg-white border-2 border-t-0 border-gray-200 p-3';
        content.style.borderRadius = '0 0 4px 4px';

        // Add all question groups with subcategories
        categoryData.questions.forEach(group => {
            // Add subcategory header if exists
            if (group.subcategory) {
                const subcategoryHeader = document.createElement('div');
                subcategoryHeader.className = 'overview-subcategory';
                subcategoryHeader.innerHTML = `
                    <span class="w-2 h-2 rounded-full bg-current mr-2"></span>
                    ${group.subcategory}
                `;
                content.appendChild(subcategoryHeader);
            }

            // Create grid for this subcategory
            const grid = document.createElement('div');
            grid.className = 'overview-grid';

            group.items.forEach(item => {
                const card = document.createElement('div');
                card.className = `overview-card ${categoryKey}-card cursor-pointer transition-all`;

                // Set data attributes
                card.dataset.category = categoryData.title;
                card.dataset.title = item.title;
                card.dataset.question = item.question;
                card.dataset.answer = item.answer || categoryData.answer;
                card.dataset.note = item.note || '';
                card.dataset.reward = categoryData.reward;

                // Check if used
                const key = categoryData.title + ':' + item.title;
                const isUsed = usedQuestions.includes(key);
                if (isUsed) {
                    card.classList.add('overview-card-used');
                }

                card.innerHTML = `
                    <div class="overview-card-icon-wrapper">
                        <div class="icon-shape ${categoryKey}-card">
                            <span class="material-symbols-outlined">${item.icon}</span>
                        </div>
                        ${isUsed ? '<span class="overview-checkmark material-symbols-outlined">check_circle</span>' : ''}
                    </div>
                    <div class="overview-card-title">${item.title}</div>
                `;

                card.addEventListener('click', () => copyQuestionFromOverview(card));

                grid.appendChild(card);
            });

            content.appendChild(grid);
        });

        section.appendChild(content);
        container.appendChild(section);
    }
}

/**
 * Resets all used questions and clears history
 */
function resetAll() {
    if (confirm('Reset all questions and clear history?')) {
        // Clear used questions
        localStorage.removeItem('usedQuestions');
        usedQuestions.length = 0;
        document.querySelectorAll('.question-card').forEach(card => {
            card.classList.remove('card-used');
        });
        document.querySelectorAll('.thermometer-card').forEach(card => {
            card.classList.remove('card-used');
        });
        document.querySelectorAll('.overview-card').forEach(overviewCard => {
            overviewCard.classList.remove('overview-card-used');
            // Remove checkmark if present
            const checkmark = overviewCard.querySelector('.overview-checkmark');
            if (checkmark) {
                checkmark.remove();
            }
        });

        // Clear history
        localStorage.removeItem('questionHistory');
        questionHistory.length = 0;
        renderHistory();
    }
}

/* ============================================
   INITIALIZATION
   ============================================ */

// Render all questions on page load
document.addEventListener('DOMContentLoaded', () => {
    renderAllQuestions();
    renderOverview();
    renderHistory();
    renderQuickJump();

    // Add search event listeners
    const searchInput = document.getElementById('search-input');
    const clearSearchBtn = document.getElementById('clear-search');

    searchInput.addEventListener('input', (e) => {
        handleSearch(e.target.value);
    });

    clearSearchBtn.addEventListener('click', () => {
        clearSearch();
    });

    // Add scroll listener for quick jump highlight
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            const normalView = document.getElementById('normal-view');
            if (!normalView.classList.contains('hidden')) {
                updateQuickJumpHighlight();
            }
        }, 100);
    });

    // Close modals with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const settingsModal = document.getElementById('settings-modal');
            const overflowMenu = document.getElementById('overflow-menu');

            if (!settingsModal.classList.contains('hidden')) {
                closeSettings();
            }
            if (!overflowMenu.classList.contains('hidden')) {
                closeOverflowMenu();
            }
        }
    });

    // Close overflow menu when clicking outside
    document.addEventListener('click', (e) => {
        const overflowMenu = document.getElementById('overflow-menu');
        const overflowButton = document.querySelector('.overflow-button');

        if (!overflowMenu.classList.contains('hidden') &&
            !overflowMenu.contains(e.target) &&
            !overflowButton.contains(e.target)) {
            closeOverflowMenu();
        }
    });

    // Register service worker for PWA
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js', { scope: './' })
            .then((registration) => {
                console.log('Service Worker registered successfully:', registration.scope);
            })
            .catch((error) => {
                console.error('Service Worker registration failed:', error);
            });
    }
});
