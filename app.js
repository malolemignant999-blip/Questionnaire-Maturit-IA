// ===== State Management =====
let questionnaireData = null;
let currentQuestionId = null;
let questionHistory = []; // Pour pouvoir revenir en arrière
let answers = {}; // { questionId: { optionId, score, tags, pillarId } }

// ===== DOM Elements =====
const elements = {
    progressIndicator: document.getElementById('progressIndicator'),
    progressFill: document.getElementById('progressFill'),
    progressText: document.getElementById('progressText'),
    welcomeScreen: document.getElementById('welcomeScreen'),
    questionScreen: document.getElementById('questionScreen'),
    resultsScreen: document.getElementById('resultsScreen'),
    startBtn: document.getElementById('startBtn'),
    prevQuestionBtn: document.getElementById('prevQuestionBtn'),
    nextQuestionBtn: document.getElementById('nextQuestionBtn'),
    finishBtn: document.getElementById('finishBtn'),
    restartBtn: document.getElementById('restartBtn'),
    exportBtn: document.getElementById('exportBtn'),
    questionBadge: document.getElementById('questionBadge'),
    pillarBadge: document.getElementById('pillarBadge'),
    questionText: document.getElementById('questionText'),
    questionHelp: document.getElementById('questionHelp'),
    optionsContainer: document.getElementById('optionsContainer'),
    pillarProgress: document.getElementById('pillarProgress'),
    scoreCircle: document.getElementById('scoreCircle'),
    scoreNumber: document.getElementById('scoreNumber'),
    scoreLevel: document.getElementById('scoreLevel'),
    scoreDescription: document.getElementById('scoreDescription'),
    detailsList: document.getElementById('detailsList'),
    recommendationsList: document.getElementById('recommendationsList')
};

// ===== Initialize Application =====
async function init() {
    try {
        const response = await fetch('data/questionnaire.json');
        questionnaireData = await response.json();
        setupEventListeners();
        renderPillarProgress();
    } catch (error) {
        console.error('Erreur lors du chargement du questionnaire:', error);
    }
}

// ===== Event Listeners =====
function setupEventListeners() {
    elements.startBtn.addEventListener('click', startQuestionnaire);
    elements.prevQuestionBtn.addEventListener('click', goToPreviousQuestion);
    elements.nextQuestionBtn.addEventListener('click', goToNextQuestion);
    elements.finishBtn.addEventListener('click', showResults);
    elements.restartBtn.addEventListener('click', restartQuestionnaire);
    elements.exportBtn.addEventListener('click', exportResults);
}

// ===== Screen Navigation =====
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

function startQuestionnaire() {
    currentQuestionId = questionnaireData.metadata.entry_question_id;
    questionHistory = [currentQuestionId];
    showScreen('questionScreen');
    elements.progressIndicator.classList.add('visible');
    renderQuestion();
}

function restartQuestionnaire() {
    answers = {};
    currentQuestionId = null;
    questionHistory = [];
    elements.progressIndicator.classList.remove('visible');
    showScreen('welcomeScreen');
    updateProgress();
    renderPillarProgress();
}

// ===== Question Navigation =====
function goToPreviousQuestion() {
    if (questionHistory.length > 1) {
        // Retirer la question actuelle de l'historique
        questionHistory.pop();
        // Supprimer la réponse de la question actuelle
        delete answers[currentQuestionId];
        // Revenir à la question précédente
        currentQuestionId = questionHistory[questionHistory.length - 1];
        renderQuestion();
    }
}

function goToNextQuestion() {
    const answer = answers[currentQuestionId];
    if (!answer) return;
    
    const question = questionnaireData.questions[currentQuestionId];
    const selectedOption = question.options.find(opt => opt.id === answer.optionId);
    
    if (selectedOption.next_question_id) {
        currentQuestionId = selectedOption.next_question_id;
        questionHistory.push(currentQuestionId);
        renderQuestion();
    } else {
        // Fin du questionnaire
        showResults();
    }
}

function renderQuestion() {
    const question = questionnaireData.questions[currentQuestionId];
    const pillar = questionnaireData.pillars.find(p => p.id === question.pillar_id);
    const answer = answers[currentQuestionId];
    
    // Calculer le numéro de question et le total estimé
    const questionNumber = questionHistory.length;
    const estimatedTotal = countTotalQuestions();
    
    // Update header
    elements.questionBadge.textContent = `Question ${questionNumber}/${estimatedTotal}`;
    elements.pillarBadge.innerHTML = `<span class="pillar-icon">${pillar.icon}</span> ${pillar.name}`;
    elements.pillarBadge.style.setProperty('--pillar-color', getPillarColor(pillar.id));
    
    // Update question content
    elements.questionText.textContent = question.text;
    elements.questionHelp.textContent = question.help || '';
    
    // Render options
    elements.optionsContainer.innerHTML = question.options.map((option, index) => `
        <div class="option ${answer && answer.optionId === option.id ? 'selected' : ''}" 
             data-option-id="${option.id}"
             data-score="${option.score}"
             style="animation-delay: ${index * 0.05}s">
            <div class="option-radio">
                <div class="option-radio-inner"></div>
            </div>
            <div class="option-content">
                <span class="option-label">${option.label}</span>
            </div>
        </div>
    `).join('');
    
    // Add click listeners to options
    document.querySelectorAll('.option').forEach(option => {
        option.addEventListener('click', handleOptionClick);
    });
    
    // Update navigation buttons
    elements.prevQuestionBtn.disabled = questionHistory.length <= 1;
    updateNavigationButtons();
    
    // Update progress
    updateProgress();
    updatePillarProgress();
}

function handleOptionClick(event) {
    const option = event.currentTarget;
    const optionId = option.dataset.optionId;
    const score = parseInt(option.dataset.score);
    
    const question = questionnaireData.questions[currentQuestionId];
    const selectedOption = question.options.find(opt => opt.id === optionId);
    
    // Update answer
    answers[currentQuestionId] = {
        optionId,
        score,
        tags: selectedOption.tags || [],
        pillarId: question.pillar_id
    };
    
    // Update UI
    document.querySelectorAll('.option').forEach(opt => {
        opt.classList.remove('selected');
    });
    option.classList.add('selected');
    
    // Update navigation and progress
    updateNavigationButtons();
    updateProgress();
    updatePillarProgress();
    
    // Auto-advance après un court délai
    setTimeout(() => {
        if (selectedOption.next_question_id) {
            goToNextQuestion();
        } else {
            updateNavigationButtons();
        }
    }, 400);
}

function updateNavigationButtons() {
    const answer = answers[currentQuestionId];
    const hasAnswer = !!answer;
    
    if (hasAnswer) {
        const question = questionnaireData.questions[currentQuestionId];
        const selectedOption = question.options.find(opt => opt.id === answer.optionId);
        
        if (selectedOption.next_question_id) {
            elements.nextQuestionBtn.style.display = 'flex';
            elements.finishBtn.style.display = 'none';
        } else {
            elements.nextQuestionBtn.style.display = 'none';
            elements.finishBtn.style.display = 'flex';
        }
    } else {
        elements.nextQuestionBtn.style.display = 'none';
        elements.finishBtn.style.display = 'none';
    }
}

function countTotalQuestions() {
    // Estimation du nombre total de questions basée sur le chemin le plus long
    return Object.keys(questionnaireData.questions).length;
}

// ===== Progress Management =====
function updateProgress() {
    const totalQuestions = countTotalQuestions();
    const answeredQuestions = Object.keys(answers).length;
    const percentage = Math.round((answeredQuestions / totalQuestions) * 100);
    
    elements.progressFill.style.width = `${percentage}%`;
    elements.progressText.textContent = `${percentage}%`;
}

function renderPillarProgress() {
    if (!questionnaireData) return;
    
    elements.pillarProgress.innerHTML = questionnaireData.pillars.map(pillar => `
        <div class="pillar-item" data-pillar-id="${pillar.id}">
            <div class="pillar-icon-small">${pillar.icon}</div>
            <div class="pillar-bar">
                <div class="pillar-fill" style="width: 0%; background: ${getPillarColor(pillar.id)}"></div>
            </div>
        </div>
    `).join('');
}

function updatePillarProgress() {
    questionnaireData.pillars.forEach(pillar => {
        const pillarAnswers = Object.values(answers).filter(a => a.pillarId === pillar.id);
        const pillarQuestions = Object.entries(questionnaireData.questions)
            .filter(([_, q]) => q.pillar_id === pillar.id);
        
        if (pillarAnswers.length > 0) {
            const maxPossible = pillarQuestions.length * 4;
            const scored = pillarAnswers.reduce((sum, a) => sum + a.score, 0);
            // Calcul basé sur toutes les questions possibles du pilier
            const percentage = Math.round((scored / maxPossible) * 100);
            
            const pillarItem = document.querySelector(`[data-pillar-id="${pillar.id}"] .pillar-fill`);
            if (pillarItem) {
                pillarItem.style.width = `${percentage}%`;
            }
        }
    });
}

function getPillarColor(pillarId) {
    const colors = {
        'STRAT': '#8b5cf6',
        'GOV': '#06b6d4',
        'DATA': '#22c55e',
        'TECH': '#f59e0b',
        'ORG': '#ec4899',
        'APPS': '#3b82f6'
    };
    return colors[pillarId] || '#8b5cf6';
}

// ===== Results =====
function showResults() {
    showScreen('resultsScreen');
    elements.progressIndicator.classList.remove('visible');
    
    const results = calculateResults();
    renderScoreCard(results);
    renderCharts(results);
    renderDetails(results);
    renderRecommendations(results);
}

function calculateResults() {
    // Calculer les scores par pilier
    const pillarResults = questionnaireData.pillars.map(pillar => {
        const pillarAnswers = Object.values(answers).filter(a => a.pillarId === pillar.id);
        const questionsAnswered = pillarAnswers.length;
        
        if (questionsAnswered === 0) {
            return {
                id: pillar.id,
                name: pillar.name,
                icon: pillar.icon,
                score: 0,
                maxScore: 0,
                percentage: 0,
                level: 'low',
                questionsAnswered: 0
            };
        }
        
        const totalScore = pillarAnswers.reduce((sum, a) => sum + a.score, 0);
        const maxScore = questionsAnswered * 4;
        const percentage = Math.round((totalScore / maxScore) * 100);
        
        // Déterminer le niveau du pilier
        const pillarLevel = questionnaireData.levels.pillar.find(
            l => percentage >= l.min_score && percentage <= l.max_score
        );
        
        return {
            id: pillar.id,
            name: pillar.name,
            icon: pillar.icon,
            score: totalScore,
            maxScore,
            percentage,
            level: pillarLevel?.id || 'low',
            levelLabel: pillarLevel?.label || 'Faible',
            questionsAnswered
        };
    });
    
    // Calculer le score global
    const totalScore = pillarResults.reduce((sum, p) => sum + p.score, 0);
    const totalMaxScore = pillarResults.reduce((sum, p) => sum + p.maxScore, 0);
    const overallPercentage = totalMaxScore > 0 ? Math.round((totalScore / totalMaxScore) * 100) : 0;
    
    // Déterminer le niveau global
    const globalLevel = questionnaireData.levels.global.find(
        l => overallPercentage >= l.min_score && overallPercentage <= l.max_score
    );
    
    // Collecter tous les tags
    const allTags = Object.values(answers).flatMap(a => a.tags || []);
    
    return {
        pillars: pillarResults,
        totalScore,
        totalMaxScore,
        overallPercentage,
        globalLevel,
        tags: allTags
    };
}

function renderScoreCard(results) {
    // Animate score number
    animateValue(elements.scoreNumber, 0, results.overallPercentage, 1500);
    
    // Animate circle
    const circumference = 2 * Math.PI * 90;
    const offset = circumference - (results.overallPercentage / 100) * circumference;
    
    setTimeout(() => {
        elements.scoreCircle.style.strokeDashoffset = offset;
    }, 100);
    
    // Update level
    const levelColors = {
        'beginner': '#ef4444',
        'intermediate': '#f59e0b',
        'advanced': '#22c55e'
    };
    
    elements.scoreLevel.textContent = results.globalLevel?.label || 'Débutant';
    elements.scoreLevel.style.background = levelColors[results.globalLevel?.id] || '#ef4444';
    
    // Description basée sur le niveau
    const descriptions = {
        'beginner': "Votre organisation débute son parcours IA. Les fondations sont à construire pour développer une maturité durable.",
        'intermediate': "Votre organisation a posé les bases de l'IA. Il est temps d'accélérer et d'industrialiser vos pratiques.",
        'advanced': "Votre organisation a atteint une maturité IA élevée. Continuez à innover et à optimiser vos processus."
    };
    
    elements.scoreDescription.textContent = descriptions[results.globalLevel?.id] || descriptions['beginner'];
}

function animateValue(element, start, end, duration) {
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(start + (end - start) * easeOut);
        
        element.textContent = current;
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
}

function renderCharts(results) {
    // Add SVG gradient for score circle
    const svg = elements.scoreCircle.closest('svg');
    if (!svg.querySelector('defs')) {
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        defs.innerHTML = `
            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#8b5cf6"/>
                <stop offset="100%" style="stop-color:#06b6d4"/>
            </linearGradient>
        `;
        svg.insertBefore(defs, svg.firstChild);
    }
    
    // Filtrer les piliers avec des réponses
    const activePillars = results.pillars.filter(p => p.questionsAnswered > 0);
    
    // Radar Chart
    const radarCtx = document.getElementById('radarChart').getContext('2d');
    
    // Détruire le chart existant si présent
    if (window.radarChartInstance) {
        window.radarChartInstance.destroy();
    }
    
    window.radarChartInstance = new Chart(radarCtx, {
        type: 'radar',
        data: {
            labels: activePillars.map(p => p.name),
            datasets: [{
                label: 'Score',
                data: activePillars.map(p => p.percentage),
                backgroundColor: 'rgba(139, 92, 246, 0.2)',
                borderColor: 'rgba(139, 92, 246, 1)',
                borderWidth: 2,
                pointBackgroundColor: activePillars.map(p => getPillarColor(p.id)),
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(139, 92, 246, 1)',
                pointRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        stepSize: 25,
                        color: '#71717a',
                        backdropColor: 'transparent',
                        font: { size: 10 }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.08)'
                    },
                    angleLines: {
                        color: 'rgba(255, 255, 255, 0.08)'
                    },
                    pointLabels: {
                        color: '#a1a1aa',
                        font: {
                            family: 'Outfit',
                            size: 11
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
    
    // Bar Chart
    const barCtx = document.getElementById('barChart').getContext('2d');
    
    // Détruire le chart existant si présent
    if (window.barChartInstance) {
        window.barChartInstance.destroy();
    }
    
    window.barChartInstance = new Chart(barCtx, {
        type: 'bar',
        data: {
            labels: activePillars.map(p => p.icon),
            datasets: [{
                label: 'Score %',
                data: activePillars.map(p => p.percentage),
                backgroundColor: activePillars.map(p => getPillarColor(p.id)),
                borderRadius: 8,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        color: '#71717a',
                        callback: value => `${value}%`
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.08)'
                    }
                },
                x: {
                    ticks: {
                        color: '#a1a1aa',
                        font: {
                            size: 20
                        }
                    },
                    grid: {
                        display: false
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        title: (items) => {
                            return activePillars[items[0].dataIndex].name;
                        },
                        label: (item) => {
                            const pillar = activePillars[item.dataIndex];
                            return [`Score: ${item.raw}%`, `Niveau: ${pillar.levelLabel}`];
                        }
                    }
                }
            }
        }
    });
}

function renderDetails(results) {
    elements.detailsList.innerHTML = results.pillars.map(pillar => {
        const levelClass = pillar.level;
        const levelColors = { 'low': '#ef4444', 'mid': '#f59e0b', 'high': '#22c55e' };
        
        return `
            <div class="detail-item">
                <span class="detail-icon">${pillar.icon}</span>
                <div class="detail-info">
                    <div class="detail-header">
                        <span class="detail-name">${pillar.name}</span>
                        <span class="detail-level" style="background: ${levelColors[pillar.level]}20; color: ${levelColors[pillar.level]}">${pillar.levelLabel}</span>
                    </div>
                    <div class="detail-bar">
                        <div class="detail-fill" style="width: ${pillar.percentage}%; background: ${getPillarColor(pillar.id)}"></div>
                    </div>
                    <div class="detail-meta">
                        <span>${pillar.questionsAnswered} question(s) répondue(s)</span>
                    </div>
                </div>
                <span class="detail-score" style="color: ${getPillarColor(pillar.id)}">${pillar.percentage}%</span>
            </div>
        `;
    }).join('');
}

function renderRecommendations(results) {
    const recommendations = [];
    
    // Recommandations par niveau de pilier
    results.pillars.forEach(pillar => {
        if (pillar.questionsAnswered > 0) {
            const pillarRecs = questionnaireData.recommendations.by_pillar_level[pillar.id];
            if (pillarRecs && pillarRecs[pillar.level]) {
                pillarRecs[pillar.level].forEach(rec => {
                    recommendations.push({
                        pillar: pillar.name,
                        pillarIcon: pillar.icon,
                        pillarColor: getPillarColor(pillar.id),
                        text: rec,
                        priority: pillar.level === 'low' ? 1 : (pillar.level === 'mid' ? 2 : 3)
                    });
                });
            }
        }
    });
    
    // Recommandations par tags
    results.tags.forEach(tag => {
        const tagRecs = questionnaireData.recommendations.by_tag[tag];
        if (tagRecs) {
            tagRecs.forEach(rec => {
                // Trouver le pilier associé au tag
                const pillarId = tag.split('_')[0].toUpperCase();
                const pillar = questionnaireData.pillars.find(p => p.id === pillarId || p.id.startsWith(pillarId));
                
                recommendations.push({
                    pillar: pillar?.name || 'Général',
                    pillarIcon: pillar?.icon || '💡',
                    pillarColor: pillar ? getPillarColor(pillar.id) : '#8b5cf6',
                    text: rec,
                    priority: 0 // Tags = haute priorité
                });
            });
        }
    });
    
    // Trier par priorité et dédupliquer
    const uniqueRecs = [...new Map(recommendations.map(r => [r.text, r])).values()];
    uniqueRecs.sort((a, b) => a.priority - b.priority);
    
    // Limiter à 8 recommandations max
    const topRecs = uniqueRecs.slice(0, 8);
    
    elements.recommendationsList.innerHTML = topRecs.map((rec, index) => `
        <div class="recommendation-item" style="animation-delay: ${index * 0.1}s">
            <div class="rec-icon" style="background: ${rec.pillarColor}20; color: ${rec.pillarColor}">
                ${rec.pillarIcon}
            </div>
            <div class="rec-content">
                <span class="rec-pillar" style="color: ${rec.pillarColor}">${rec.pillar}</span>
                <p class="rec-text">${rec.text}</p>
            </div>
        </div>
    `).join('');
}

// ===== Export =====
function exportResults() {
    const results = calculateResults();
    
    let exportText = `═══════════════════════════════════════════════════════════════\n`;
    exportText += `           DIAGNOSTIC DE MATURITÉ IA - RÉSULTATS\n`;
    exportText += `═══════════════════════════════════════════════════════════════\n\n`;
    exportText += `📊 SCORE GLOBAL: ${results.overallPercentage}%\n`;
    exportText += `📈 NIVEAU: ${results.globalLevel?.label || 'Débutant'}\n\n`;
    
    exportText += `───────────────────────────────────────────────────────────────\n`;
    exportText += `                    SCORES PAR PILIER\n`;
    exportText += `───────────────────────────────────────────────────────────────\n\n`;
    
    results.pillars.forEach(pillar => {
        const bar = '█'.repeat(Math.floor(pillar.percentage / 10)) + '░'.repeat(10 - Math.floor(pillar.percentage / 10));
        exportText += `${pillar.icon} ${pillar.name.padEnd(30)} ${bar} ${pillar.percentage}% (${pillar.levelLabel})\n`;
    });
    
    exportText += `\n───────────────────────────────────────────────────────────────\n`;
    exportText += `                    RECOMMANDATIONS\n`;
    exportText += `───────────────────────────────────────────────────────────────\n\n`;
    
    // Générer les recommandations
    results.pillars.forEach(pillar => {
        if (pillar.questionsAnswered > 0) {
            const pillarRecs = questionnaireData.recommendations.by_pillar_level[pillar.id];
            if (pillarRecs && pillarRecs[pillar.level]) {
                exportText += `${pillar.icon} ${pillar.name}:\n`;
                pillarRecs[pillar.level].forEach(rec => {
                    exportText += `   • ${rec}\n`;
                });
                exportText += `\n`;
            }
        }
    });
    
    exportText += `═══════════════════════════════════════════════════════════════\n`;
    exportText += `Généré le: ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}\n`;
    exportText += `Questions répondues: ${Object.keys(answers).length}\n`;
    
    // Download as text file
    const blob = new Blob([exportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `diagnostic-maturite-ia-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', init);
