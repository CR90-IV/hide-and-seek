/* ============================================
   STATE MANAGEMENT
   ============================================ */

// Load used questions and history from localStorage
const usedQuestions = JSON.parse(localStorage.getItem('usedQuestions') || '[]');
const questionHistory = JSON.parse(localStorage.getItem('questionHistory') || '[]');

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
 * Shows toast notification for 2 seconds
 */
function showToast() {
    const toast = document.getElementById('toast');
    toast.classList.remove('hidden');
    toast.classList.add('toast');

    setTimeout(() => {
        toast.classList.add('hidden');
        toast.classList.remove('toast');
    }, 2000);
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
        'tentacle': 'text-purple-100'
    };
    return colorMap[categoryKey] || 'text-gray-100';
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
        document.querySelectorAll('.overview-icon').forEach(icon => {
            if (icon.dataset.category === category && icon.dataset.title === title) {
                icon.classList.remove('overview-icon-used');
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
        document.querySelectorAll('.overview-icon').forEach(icon => {
            if (icon.dataset.category === category && icon.dataset.title === title) {
                icon.classList.add('overview-icon-used');
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

        // Show toast
        showToast();
    }).catch(err => {
        console.error('Failed to copy:', err);
        alert('Failed to copy to clipboard');
    });
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
            document.querySelectorAll('.overview-icon').forEach(icon => {
                if (icon.dataset.category === category && icon.dataset.title === title) {
                    icon.classList.add('overview-icon-used');
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

        showToast();
    }).catch(err => {
        console.error('Failed to copy:', err);
        alert('Failed to copy to clipboard');
    });
}

/**
 * Copies question from overview mode and marks as used
 */
function copyQuestionFromOverview(iconWrapper) {
    const category = iconWrapper.dataset.category;
    const title = iconWrapper.dataset.title;
    const key = category + ':' + title;

    // Check if already used - if so, toggle it back to unused
    if (iconWrapper.classList.contains('overview-icon-used')) {
        iconWrapper.classList.remove('overview-icon-used');

        // Remove from usedQuestions
        const index = usedQuestions.indexOf(key);
        if (index > -1) {
            usedQuestions.splice(index, 1);
            localStorage.setItem('usedQuestions', JSON.stringify(usedQuestions));
        }

        // Also update the normal view
        document.querySelectorAll('.question-card, .thermometer-card').forEach(card => {
            if (card.dataset.category === category && card.dataset.title === title) {
                card.classList.remove('card-used');
            }
        });

        return; // Don't copy to clipboard
    }

    const question = iconWrapper.dataset.question;
    const answer = iconWrapper.dataset.answer;
    const note = iconWrapper.dataset.note;
    const reward = iconWrapper.dataset.reward;

    // Build WhatsApp-formatted message with full question
    let message = `*${category}: ${title}*\n`;
    message += `${question}\n`;
    message += `Answer: ${answer}\n`;
    if (note) {
        const plainTextNote = convertLinksToPlainText(note);
        message += `_${plainTextNote}_\n`;
    }
    message += `Reward: ${reward}`;

    // Copy to clipboard
    navigator.clipboard.writeText(message).then(() => {
        // Mark as used
        iconWrapper.classList.add('overview-icon-used');

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

        // Also update the normal view
        document.querySelectorAll('.question-card, .thermometer-card').forEach(card => {
            if (card.dataset.category === category && card.dataset.title === title) {
                card.classList.add('card-used');
            }
        });

        // Show toast
        showToast();
    }).catch(err => {
        console.error('Failed to copy:', err);
        alert('Failed to copy to clipboard');
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

    // Hide all views
    normalView.classList.add('hidden');
    overviewView.classList.add('hidden');
    historyView.classList.add('hidden');

    // Show selected view
    if (view === 'detail') {
        normalView.classList.remove('hidden');
    } else if (view === 'overview') {
        overviewView.classList.remove('hidden');
    } else if (view === 'history') {
        historyView.classList.remove('hidden');
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
        historyItem.className = 'border-b border-gray-200 last:border-0 py-3';

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
                <div class="flex-1">
                    <p class="font-semibold text-gray-900">${item.category}: ${item.title}</p>
                    <p class="text-sm text-gray-600 mt-1">${item.question}</p>
                </div>
                <div class="text-right text-sm text-gray-500 flex-shrink-0">
                    <div>${timeStr}</div>
                    <div class="text-xs">${dateStr}</div>
                </div>
            </div>
        `;

        container.appendChild(historyItem);
    });
}

/**
 * Renders the overview grid with all question icons
 */
function renderOverview() {
    const container = document.querySelector('#overview-view .overview-container');

    for (const [categoryKey, categoryData] of Object.entries(questionsData)) {
        const section = document.createElement('section');

        // Create header
        const header = document.createElement('div');
        header.className = `${categoryKey}-header text-white`;
        header.innerHTML = `<h2 class="text-lg font-bold tracking-wide uppercase">${categoryData.title}</h2>`;
        section.appendChild(header);

        // Create grid container
        const grid = document.createElement('div');
        grid.className = 'bg-white border-2 border-t-0 border-gray-200 p-3 grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2';

        // Add all question icons
        categoryData.questions.forEach(group => {
            group.items.forEach(item => {
                const iconWrapper = document.createElement('div');
                iconWrapper.className = `overview-icon cursor-pointer transition-all flex items-center justify-center`;
                iconWrapper.style.aspectRatio = '1';
                iconWrapper.title = item.title;

                // Set data attributes
                iconWrapper.dataset.category = categoryData.title;
                iconWrapper.dataset.title = item.title;
                iconWrapper.dataset.question = item.question;
                iconWrapper.dataset.answer = item.answer || categoryData.answer;
                iconWrapper.dataset.note = item.note || '';
                iconWrapper.dataset.reward = categoryData.reward;

                // Check if used
                const key = categoryData.title + ':' + item.title;
                if (usedQuestions.includes(key)) {
                    iconWrapper.classList.add('overview-icon-used');
                }

                iconWrapper.innerHTML = `
                    <div class="icon-shape ${categoryKey}-card">
                        <span class="material-symbols-outlined text-2xl">${item.icon}</span>
                    </div>
                `;
                iconWrapper.addEventListener('click', () => copyQuestionFromOverview(iconWrapper));

                grid.appendChild(iconWrapper);
            });
        });

        section.appendChild(grid);
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
        document.querySelectorAll('.overview-icon').forEach(icon => {
            icon.classList.remove('overview-icon-used');
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
});
