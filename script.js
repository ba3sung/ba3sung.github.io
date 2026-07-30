/**
 * High School 2nd Grade Study Management Web App (script.js)
 * Features:
 * - Theme Switcher (Light / Dark Mode with LocalStorage)
 * - Custom Interactive D-Day Manager Modal
 * - Subject Hub (Korean, Math, English, Inquiry) with Incorrect Notes & Stopwatch Timers
 * - To-Do List Manager
 * - Vocabulary Master & Random Quiz Engine with Speech Synthesis
 */

document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // 1. Initial Default Datasets
    // ==========================================
    const DEFAULT_TODOS = [
        { id: 'todo-1', title: '수학1 삼각함수 개념 정리 및 시쎈 20문제 풀기', category: '수학', priority: '상', completed: false, createdAt: Date.now() - 10000 },
        { id: 'todo-2', title: '수능특강 영어 독해 3강 지문 분석 및 변형문제 풀이', category: '영어', priority: '상', completed: false, createdAt: Date.now() - 8000 },
        { id: 'todo-3', title: '국어 현대시 윤동주 <서시> 작품 해석노트 작성', category: '국어', priority: '중', completed: true, createdAt: Date.now() - 6000 },
        { id: 'todo-4', title: '물리학1 뉴턴 운동 법칙 단원 오답노트 정리', category: '탐구', priority: '중', completed: false, createdAt: Date.now() - 4000 }
    ];

    const DEFAULT_WORDS = [
        { id: 'w-1', english: 'reluctant', korean: '꺼리는, 마지못해 하는', example: 'He was reluctant to commit to the study plan.', mastered: false },
        { id: 'w-2', english: 'perseverance', korean: '인내, 끈기', example: 'Success in high school requires hard work and perseverance.', mastered: false },
        { id: 'w-3', english: 'hypothesis', korean: '가설, 추측', example: 'The science experiment proved our initial hypothesis.', mastered: true },
        { id: 'w-4', english: 'ambiguous', korean: '애매모호한, 두 가지로 해석되는', example: 'The teacher explained the ambiguous passage clearly.', mastered: false },
        { id: 'w-5', english: 'subsequent', korean: '그 다음의, 차후의', example: 'Subsequent test results showed great improvement.', mastered: false },
        { id: 'w-6', english: 'inevitable', korean: '불가피한, 필연적인', example: 'Mistakes are an inevitable part of learning.', mastered: false },
        { id: 'w-7', english: 'comprehension', korean: '이해력, 포괄성', example: 'Reading comprehension is essential for the CSAT exam.', mastered: true },
        { id: 'w-8', english: 'fundamental', korean: '근본적인, 핵심적인', example: 'Mastering the fundamentals is key to math.', mastered: false },
        { id: 'w-9', english: 'evaluate', korean: '평가하다, 감정하다', example: 'We should evaluate our weekly study habits.', mastered: false },
        { id: 'w-10', english: 'simultaneous', korean: '동시의, 일제히 일어나는', example: 'Simultaneous translation was provided during the lecture.', mastered: false }
    ];

    const DEFAULT_DDAYS = [
        { id: 'dday-1', title: '2027 수능', date: '2026-11-19', active: true },
        { id: 'dday-2', title: '2학기 기말고사', date: '2026-12-08', active: false },
        { id: 'dday-3', title: '9월 전국모의고사', date: '2026-09-02', active: false }
    ];

    const DEFAULT_NOTES = [
        {
            id: 'note-1',
            subject: '수학',
            title: '2026 6월 모평 21번 삼각함수',
            topic: '삼각함수 대칭성과 주기',
            myAns: '3번',
            correctAns: '5번',
            solution: '주기 T=2pi/w 공식 이용 후 x=a에서의 대칭성을 놓침. 그래프를 그려서 교점 개수를 확인할 것!',
            createdAt: Date.now() - 50000
        },
        {
            id: 'note-2',
            subject: '국어',
            title: '윤동주 <서시> 3번 지문 이해',
            topic: '현대시 어조 및 화자의 태도',
            myAns: '2번',
            correctAns: '4번',
            solution: '<잎새에 이는 바람에도 괴로워했다>는 부끄러움의 정서를 극대화하는 표현임. 체념이 아닌 내적 갈등임에 유의.',
            createdAt: Date.now() - 30000
        },
        {
            id: 'note-3',
            subject: '영어',
            title: '수능특강 4강 2번 빈칸추론',
            topic: '문맥상 역접 접속사',
            myAns: 'However',
            correctAns: 'Furthermore',
            solution: '앞문장과 뒷문장이 대립되는 것이 아니라 구체적 사례 추가 강조 구조임. 문맥 전체 어조 파악 필요.',
            createdAt: Date.now() - 10000
        }
    ];

    const QUOTES = [
        '"성공은 매일 반복한 작은 노력들의 합이다." - 로버트 콜리어',
        '"오늘 흘린 땀은 내일의 당당한 미소가 된다."',
        '"어제보다 딱 1%만 더 성장하는 하루를 만들자!"',
        '"포기하지 않는 자에게 슬럼프는 기회가 된다."',
        '"꿈을 크게 가지되, 실천은 오늘 할 수 있는 작은 것부터!"'
    ];

    // ==========================================
    // 2. Storage & Application State
    // ==========================================
    let currentTheme = localStorage.getItem('study_app_theme_v1') || 'light';
    let todos = JSON.parse(localStorage.getItem('study_app_todos_v1')) || DEFAULT_TODOS;
    let words = JSON.parse(localStorage.getItem('study_app_words_v1')) || DEFAULT_WORDS;
    let ddays = JSON.parse(localStorage.getItem('study_app_ddays_v1')) || DEFAULT_DDAYS;
    let notes = JSON.parse(localStorage.getItem('study_app_notes_v1')) || DEFAULT_NOTES;
    let subjectTimers = JSON.parse(localStorage.getItem('study_app_timers_v1')) || {
        '국어': { seconds: 0, logs: [] },
        '수학': { seconds: 0, logs: [] },
        '영어': { seconds: 0, logs: [] },
        '탐구': { seconds: 0, logs: [] }
    };
    let stats = JSON.parse(localStorage.getItem('study_app_stats_v1')) || {
        quizAttempts: 0,
        maxStreak: 0,
        currentStreak: 0
    };

    // Active View States
    let activeTab = 'dashboard';
    let activeSubject = '국어';
    let todoFilterStatus = 'all';
    let todoFilterCategory = 'all';
    let wordSearchQuery = '';
    let wordFilterStatus = 'all';
    let noteSearchQuery = '';

    // Stopwatch State
    let timerInterval = null;
    let timerRunning = false;
    let currentStopwatchSeconds = 0;

    // Quiz State
    let quizState = {
        active: false,
        questions: [],
        currentIndex: 0,
        score: 0,
        currentStreak: 0,
        maxStreak: 0,
        mode: 'choice',
        missedWords: []
    };

    // Save Functions
    function saveTodos() {
        localStorage.setItem('study_app_todos_v1', JSON.stringify(todos));
        renderTodos();
        updateDashboardStats();
    }

    function saveWords() {
        localStorage.setItem('study_app_words_v1', JSON.stringify(words));
        renderWords();
        updateDashboardStats();
    }

    function saveDDays() {
        localStorage.setItem('study_app_ddays_v1', JSON.stringify(ddays));
        renderHeaderDDay();
        renderDDayModalItems();
    }

    function saveNotes() {
        localStorage.setItem('study_app_notes_v1', JSON.stringify(notes));
        renderSubjectNotes();
        updateDashboardStats();
    }

    function saveSubjectTimers() {
        localStorage.setItem('study_app_timers_v1', JSON.stringify(subjectTimers));
        updateDashboardStats();
    }

    function saveStats() {
        localStorage.setItem('study_app_stats_v1', JSON.stringify(stats));
        updateDashboardStats();
    }

    // ==========================================
    // 3. Theme Toggle (Light / Dark Mode)
    // ==========================================
    function applyTheme(theme) {
        currentTheme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('study_app_theme_v1', theme);

        const btn = document.getElementById('theme-toggle-btn');
        if (btn) {
            btn.innerHTML = theme === 'dark' ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
        }
    }

    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            const nextTheme = currentTheme === 'light' ? 'dark' : 'light';
            applyTheme(nextTheme);
            showToast(`${nextTheme === 'dark' ? '다크' : '라이트'} 모드로 전환되었습니다. 🌙`);
        });
    }
    applyTheme(currentTheme);

    // ==========================================
    // 4. Navigation & Tab Switching
    // ==========================================
    const navTabs = document.querySelectorAll('.nav-tab');
    const tabViews = document.querySelectorAll('.tab-view');

    navTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.dataset.tab;
            switchTab(targetTab);
        });
    });

    function switchTab(tabName) {
        activeTab = tabName;
        navTabs.forEach(t => t.classList.toggle('active', t.dataset.tab === tabName));
        tabViews.forEach(v => v.classList.toggle('active', v.id === `${tabName}-view`));
    }

    document.getElementById('btn-goto-todo')?.addEventListener('click', () => switchTab('todo'));

    // Vocab Subtabs
    const subtabList = document.getElementById('subtab-list');
    const subtabQuiz = document.getElementById('subtab-quiz');
    const vocaListSection = document.getElementById('voca-list-section');
    const vocaQuizSection = document.getElementById('voca-quiz-section');

    subtabList?.addEventListener('click', () => {
        subtabList.classList.add('active');
        subtabQuiz.classList.remove('active');
        vocaListSection.classList.add('active');
        vocaQuizSection.classList.remove('active');
    });

    subtabQuiz?.addEventListener('click', () => {
        subtabQuiz.classList.add('active');
        subtabList.classList.remove('active');
        vocaQuizSection.classList.add('active');
        vocaListSection.classList.remove('active');
    });

    document.getElementById('btn-dash-start-quiz')?.addEventListener('click', () => {
        switchTab('voca');
        subtabQuiz?.click();
    });

    // ==========================================
    // 5. Toast Notification & Speech Helper
    // ==========================================
    function showToast(message, icon = 'fa-circle-check') {
        const container = document.getElementById('toast-container');
        if (!container) return;
        
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `<i class="fa-solid ${icon} text-blue"></i> <span>${message}</span>`;
        container.appendChild(toast);

        setTimeout(() => { toast.remove(); }, 3000);
    }

    function speakText(text) {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US';
            utterance.rate = 0.9;
            window.speechSynthesis.speak(utterance);
        } else {
            showToast('브라우저가 발음 기능을 지원하지 않습니다.', 'fa-triangle-exclamation');
        }
    }

    // ==========================================
    // 6. Custom Interactive D-Day Manager Modal
    // ==========================================
    const ddayModal = document.getElementById('dday-modal');
    const btnOpenDDayModal = document.getElementById('btn-open-dday-modal');
    const btnCloseDDayModal = document.getElementById('btn-close-dday-modal');
    const ddayForm = document.getElementById('dday-form');

    btnOpenDDayModal?.addEventListener('click', () => {
        renderDDayModalItems();
        ddayModal.classList.remove('hidden');
    });

    btnCloseDDayModal?.addEventListener('click', () => {
        ddayModal.classList.add('hidden');
    });

    ddayModal?.addEventListener('click', (e) => {
        if (e.target === ddayModal) ddayModal.classList.add('hidden');
    });

    if (ddayForm) {
        ddayForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const titleInput = document.getElementById('dday-title-input');
            const dateInput = document.getElementById('dday-date-input');

            const title = titleInput.value.trim();
            const date = dateInput.value;

            if (!title || !date) return;

            const newDDay = {
                id: 'dday-' + Date.now(),
                title: title,
                date: date,
                active: ddays.length === 0
            };

            ddays.push(newDDay);
            saveDDays();
            titleInput.value = '';
            dateInput.value = '';
            showToast('새 D-Day 목표가 추가되었습니다! 📅');
        });
    }

    function calculateDDay(dateStr) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const target = new Date(dateStr);
        target.setHours(0, 0, 0, 0);

        const diffTime = target - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'D-Day!';
        if (diffDays > 0) return `D-${diffDays}`;
        return `D+${Math.abs(diffDays)}`;
    }

    function renderHeaderDDay() {
        const activeDDay = ddays.find(d => d.active) || ddays[0];
        if (!activeDDay) return;

        const tagElem = document.getElementById('header-dday-tag');
        const countElem = document.getElementById('header-dday-count');

        if (tagElem && countElem) {
            tagElem.innerHTML = `<i class="fa-solid fa-fire"></i> ${escapeHtml(activeDDay.title)}`;
            countElem.textContent = calculateDDay(activeDDay.date);
        }
    }

    function renderDDayModalItems() {
        const container = document.getElementById('dday-items-list');
        if (!container) return;

        if (ddays.length === 0) {
            container.innerHTML = `<div class="empty-state" style="padding: 15px;"><p>등록된 D-Day가 없습니다.</p></div>`;
            return;
        }

        container.innerHTML = ddays.map(d => `
            <div class="dday-item-row" data-id="${d.id}">
                <div class="dday-item-left">
                    <input type="radio" name="active-dday" class="radio-set-active" ${d.active ? 'checked' : ''}>
                    <span class="dday-item-title">${escapeHtml(d.title)} (${d.date})</span>
                </div>
                <div class="form-row">
                    <span class="dday-item-days">${calculateDDay(d.date)}</span>
                    <button class="btn-delete-todo btn-delete-dday" title="삭제"><i class="fa-solid fa-trash-can"></i></button>
                </div>
            </div>
        `).join('');

        container.querySelectorAll('.dday-item-row').forEach(row => {
            const id = row.dataset.id;
            
            row.querySelector('.radio-set-active')?.addEventListener('change', () => {
                ddays.forEach(d => d.active = (d.id === id));
                saveDDays();
                showToast('메인 D-Day가 변경되었습니다!');
            });

            row.querySelector('.btn-delete-dday')?.addEventListener('click', (e) => {
                e.stopPropagation();
                if (ddays.length <= 1) {
                    showToast('최소 1개 이상의 D-Day가 필요합니다.', 'fa-triangle-exclamation');
                    return;
                }
                ddays = ddays.filter(d => d.id !== id);
                if (!ddays.some(d => d.active) && ddays.length > 0) {
                    ddays[0].active = true;
                }
                saveDDays();
            });
        });
    }

    // ==========================================
    // 7. Dashboard Module
    // ==========================================
    function initDashboard() {
        const quoteElem = document.getElementById('quote-display');
        if (quoteElem) {
            const randomQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
            quoteElem.textContent = randomQuote;
        }
        renderHeaderDDay();
        updateDashboardStats();
    }

    function updateDashboardStats() {
        // Todo rate
        const totalTodos = todos.length;
        const completedTodos = todos.filter(t => t.completed).length;
        const rate = totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0;

        document.getElementById('dash-todo-rate').textContent = `${rate}%`;
        document.getElementById('dash-todo-count').textContent = `(${completedTodos}/${totalTodos} 완료)`;
        document.getElementById('dash-todo-bar').style.width = `${rate}%`;

        // Nav Badges
        const pendingCount = totalTodos - completedTodos;
        document.getElementById('nav-todo-badge').textContent = pendingCount;
        document.getElementById('nav-voca-badge').textContent = words.length;

        // Total Study Time calculation from subject timers
        let totalSeconds = 0;
        Object.values(subjectTimers).forEach(item => {
            totalSeconds += item.seconds || 0;
        });
        const totalHrs = Math.floor(totalSeconds / 3600);
        const totalMins = Math.floor((totalSeconds % 3600) / 60);
        
        document.getElementById('dash-total-time').innerHTML = `${totalHrs}<small>시간</small> ${totalMins}<small>분</small>`;

        // Words & Notes Stats
        document.getElementById('dash-voca-notes-count').textContent = `${words.length} / ${notes.length}`;
        const masteredCount = words.filter(w => w.mastered).length;
        document.getElementById('dash-mastered-count').textContent = `단어 암기 완료: ${masteredCount}개`;

        // Quiz Stats
        document.getElementById('dash-quiz-streak').textContent = `${stats.maxStreak || 0} 🔥`;
        document.getElementById('dash-quiz-total').textContent = `총 퀴즈 시도: ${stats.quizAttempts || 0}회`;

        renderMiniDashboardTodos();
        renderSubjectHubInfo();
    }

    function renderMiniDashboardTodos() {
        const container = document.getElementById('dash-todo-list');
        if (!container) return;

        if (todos.length === 0) {
            container.innerHTML = `<div class="empty-state" style="padding: 20px;"><p>오늘 등록된 학습 일정이 없습니다.</p></div>`;
            return;
        }

        const recent = todos.slice(0, 4);
        container.innerHTML = recent.map(todo => `
            <div class="mini-todo-item ${todo.completed ? 'completed' : ''}">
                <div class="mini-todo-left">
                    <span class="tag tag-cat">${todo.category}</span>
                    <span class="mini-todo-title">${escapeHtml(todo.title)}</span>
                </div>
                <span class="tag tag-priority-${todo.priority}">중요도 [${todo.priority}]</span>
            </div>
        `).join('');
    }

    // ==========================================
    // 8. To-Do Manager Module
    // ==========================================
    const todoForm = document.getElementById('todo-form');
    const todoInput = document.getElementById('todo-input');
    const todoCategory = document.getElementById('todo-category');
    const todoPriority = document.getElementById('todo-priority');
    const todoList = document.getElementById('todo-list');
    const todoEmptyState = document.getElementById('todo-empty-state');

    if (todoForm) {
        todoForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const title = todoInput.value.trim();
            if (!title) return;

            const newTodo = {
                id: 'todo-' + Date.now(),
                title: title,
                category: todoCategory.value,
                priority: todoPriority.value,
                completed: false,
                createdAt: Date.now()
            };

            todos.unshift(newTodo);
            saveTodos();
            todoInput.value = '';
            showToast('새 학습 일정이 추가되었습니다! 🎯');
        });
    }

    const filterPills = document.querySelectorAll('.summary-pill');
    filterPills.forEach(pill => {
        pill.addEventListener('click', () => {
            filterPills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            todoFilterStatus = pill.dataset.filter;
            renderTodos();
        });
    });

    const catTabs = document.querySelectorAll('.cat-tab');
    catTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            catTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            todoFilterCategory = tab.dataset.cat;
            renderTodos();
        });
    });

    function renderTodos() {
        if (!todoList) return;

        let filtered = todos.filter(todo => {
            if (todoFilterStatus === 'pending' && todo.completed) return false;
            if (todoFilterStatus === 'completed' && !todo.completed) return false;
            if (todoFilterCategory !== 'all' && todo.category !== todoFilterCategory) return false;
            return true;
        });

        const allCnt = todos.length;
        const pendingCnt = todos.filter(t => !t.completed).length;
        const completedCnt = todos.filter(t => t.completed).length;

        document.getElementById('filter-all-cnt').textContent = `전체 ${allCnt}`;
        document.getElementById('filter-pending-cnt').textContent = `진행중 ${pendingCnt}`;
        document.getElementById('filter-completed-cnt').textContent = `완료 ${completedCnt}`;

        if (filtered.length === 0) {
            todoList.innerHTML = '';
            todoEmptyState.classList.remove('hidden');
            return;
        }

        todoEmptyState.classList.add('hidden');
        todoList.innerHTML = filtered.map(todo => `
            <li class="todo-item ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
                <div class="todo-left">
                    <div class="custom-checkbox btn-toggle-todo">
                        <i class="fa-solid fa-check"></i>
                    </div>
                    <div class="todo-content">
                        <span class="todo-title">${escapeHtml(todo.title)}</span>
                        <div class="todo-tags">
                            <span class="tag tag-cat">${todo.category}</span>
                            <span class="tag tag-priority-${todo.priority}">중요도 [${todo.priority}]</span>
                        </div>
                    </div>
                </div>
                <button class="btn-delete-todo" title="삭제">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </li>
        `).join('');

        todoList.querySelectorAll('.todo-item').forEach(item => {
            const id = item.dataset.id;
            
            item.querySelector('.btn-toggle-todo').addEventListener('click', () => {
                const target = todos.find(t => t.id === id);
                if (target) {
                    target.completed = !target.completed;
                    saveTodos();
                    if (target.completed) showToast('학습 완료! 대단해요 👏');
                }
            });

            item.querySelector('.btn-delete-todo').addEventListener('click', (e) => {
                e.stopPropagation();
                todos = todos.filter(t => t.id !== id);
                saveTodos();
                showToast('일정이 삭제되었습니다.');
            });
        });
    }

    // ==========================================
    // 9. Subject-Specific Hub (국/수/영/탐) Module
    // ==========================================
    const subjectTabs = document.querySelectorAll('.subject-tab');
    const SUBJECT_METADATA = {
        '국어': { icon: '📕', desc: '수능 문학/비문학 및 내신 문제 오답 정리와 집중 몰입 스톱워치' },
        '수학': { icon: '📐', desc: '개념 및 오답 원인 분석, 모의고사 오답노트 체계적 관리' },
        '영어': { icon: '🔤', desc: '수능특강 구문 해석, 빈칸/어법 오답 정리 및 독해 타이머' },
        '탐구': { icon: '🔬', desc: '사회/과학 탐구 개념 개념도 및 함정 선택지 오답 정리' }
    };

    subjectTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            subjectTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            activeSubject = tab.dataset.subject;
            
            // Reset active stopwatch for previous subject if running
            if (timerRunning) {
                pauseStopwatch();
            }
            currentStopwatchSeconds = 0;
            updateStopwatchDisplay();

            renderSubjectHubInfo();
        });
    });

    function renderSubjectHubInfo() {
        const meta = SUBJECT_METADATA[activeSubject] || SUBJECT_METADATA['국어'];
        document.getElementById('subject-badge-icon').textContent = meta.icon;
        document.getElementById('subject-title-name').textContent = `${activeSubject} 학습관`;
        document.getElementById('subject-desc-str').textContent = meta.desc;

        // Cumulative Subject Study Time
        const totalSec = (subjectTimers[activeSubject] && subjectTimers[activeSubject].seconds) || 0;
        const hrs = Math.floor(totalSec / 3600);
        const mins = Math.floor((totalSec % 3600) / 60);
        document.getElementById('subject-stat-time').textContent = `${hrs}시간 ${mins}분`;

        // Notes Count for Subject
        const subNotes = notes.filter(n => n.subject === activeSubject);
        document.getElementById('subject-stat-notes').textContent = `${subNotes.length}개`;

        renderSubjectNotes();
        renderTimerLogs();
    }

    // Stopwatch Timers Logic
    const timerDisplay = document.getElementById('timer-display');
    const btnTimerStart = document.getElementById('btn-timer-start');
    const btnTimerPause = document.getElementById('btn-timer-pause');
    const btnTimerReset = document.getElementById('btn-timer-reset');
    const btnTimerSave = document.getElementById('btn-timer-save');
    const timerStatusBadge = document.getElementById('timer-status-badge');

    function updateStopwatchDisplay() {
        if (!timerDisplay) return;
        const h = Math.floor(currentStopwatchSeconds / 3600);
        const m = Math.floor((currentStopwatchSeconds % 3600) / 60);
        const s = currentStopwatchSeconds % 60;
        timerDisplay.textContent = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }

    function startStopwatch() {
        if (timerRunning) return;
        timerRunning = true;
        btnTimerStart.classList.add('hidden');
        btnTimerPause.classList.remove('hidden');
        timerStatusBadge.textContent = '공부 진행 중 🔥';
        timerStatusBadge.style.background = 'var(--color-warning)';

        timerInterval = setInterval(() => {
            currentStopwatchSeconds++;
            updateStopwatchDisplay();
        }, 1000);
    }

    function pauseStopwatch() {
        timerRunning = false;
        clearInterval(timerInterval);
        btnTimerStart.classList.remove('hidden');
        btnTimerPause.classList.add('hidden');
        timerStatusBadge.textContent = '일시정지';
        timerStatusBadge.style.background = 'var(--text-muted)';
    }

    btnTimerStart?.addEventListener('click', startStopwatch);
    btnTimerPause?.addEventListener('click', pauseStopwatch);

    btnTimerReset?.addEventListener('click', () => {
        pauseStopwatch();
        currentStopwatchSeconds = 0;
        updateStopwatchDisplay();
        timerStatusBadge.textContent = '대기 중';
    });

    btnTimerSave?.addEventListener('click', () => {
        if (currentStopwatchSeconds < 5) {
            showToast('최소 5초 이상 학습 후 기록할 수 있습니다.', 'fa-triangle-exclamation');
            return;
        }

        if (!subjectTimers[activeSubject]) {
            subjectTimers[activeSubject] = { seconds: 0, logs: [] };
        }

        subjectTimers[activeSubject].seconds += currentStopwatchSeconds;
        
        const now = new Date();
        const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
        const addedMins = Math.max(1, Math.round(currentStopwatchSeconds / 60));

        subjectTimers[activeSubject].logs.unshift({
            time: timeStr,
            duration: `${addedMins}분 학습`
        });

        saveSubjectTimers();
        showToast(`${activeSubject} 학습시간 ${addedMins}분이 성공적으로 기록되었습니다! ⏱️`);

        pauseStopwatch();
        currentStopwatchSeconds = 0;
        updateStopwatchDisplay();
        renderSubjectHubInfo();
    });

    function renderTimerLogs() {
        const container = document.getElementById('subject-timer-log');
        if (!container) return;

        const logs = (subjectTimers[activeSubject] && subjectTimers[activeSubject].logs) || [];
        if (logs.length === 0) {
            container.innerHTML = `<li class="timer-log-item"><span>기록된 학습 시간이 없습니다.</span></li>`;
            return;
        }

        container.innerHTML = logs.slice(0, 5).map(log => `
            <li class="timer-log-item">
                <span><i class="fa-regular fa-clock"></i> ${log.time}</span>
                <strong>${log.duration}</strong>
            </li>
        `).join('');
    }

    // Incorrect Notes Logic
    const btnOpenNoteForm = document.getElementById('btn-open-note-form');
    const btnCloseNoteForm = document.getElementById('btn-close-note-form');
    const noteFormWrapper = document.getElementById('note-form-wrapper');
    const incorrectNoteForm = document.getElementById('incorrect-note-form');
    const noteSearchInput = document.getElementById('note-search-input');

    btnOpenNoteForm?.addEventListener('click', () => {
        noteFormWrapper.classList.remove('hidden');
    });

    btnCloseNoteForm?.addEventListener('click', () => {
        noteFormWrapper.classList.add('hidden');
    });

    if (incorrectNoteForm) {
        incorrectNoteForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const title = document.getElementById('note-title').value.trim();
            const topic = document.getElementById('note-topic').value.trim();
            const myAns = document.getElementById('note-my-ans').value.trim();
            const correctAns = document.getElementById('note-correct-ans').value.trim();
            const solution = document.getElementById('note-solution').value.trim();

            if (!title || !correctAns || !solution) return;

            const newNote = {
                id: 'note-' + Date.now(),
                subject: activeSubject,
                title: title,
                topic: topic,
                myAns: myAns || '-',
                correctAns: correctAns,
                solution: solution,
                createdAt: Date.now()
            };

            notes.unshift(newNote);
            saveNotes();

            incorrectNoteForm.reset();
            noteFormWrapper.classList.add('hidden');
            showToast(`${activeSubject} 오답노트가 저장되었습니다! 📝`);
        });
    }

    if (noteSearchInput) {
        noteSearchInput.addEventListener('input', (e) => {
            noteSearchQuery = e.target.value.toLowerCase().trim();
            renderSubjectNotes();
        });
    }

    function renderSubjectNotes() {
        const container = document.getElementById('subject-notes-list');
        const emptyState = document.getElementById('notes-empty-state');
        if (!container) return;

        let filtered = notes.filter(n => n.subject === activeSubject);

        if (noteSearchQuery) {
            filtered = filtered.filter(n => 
                n.title.toLowerCase().includes(noteSearchQuery) || 
                n.topic.toLowerCase().includes(noteSearchQuery) ||
                n.solution.toLowerCase().includes(noteSearchQuery)
            );
        }

        if (filtered.length === 0) {
            container.innerHTML = '';
            emptyState.classList.remove('hidden');
            return;
        }

        emptyState.classList.add('hidden');
        container.innerHTML = filtered.map(n => `
            <div class="note-card" data-id="${n.id}">
                <div class="note-header">
                    <div>
                        <div class="note-title">${escapeHtml(n.title)}</div>
                        <span class="tag tag-cat">${escapeHtml(n.topic)}</span>
                    </div>
                    <button class="btn-delete-todo btn-delete-note" title="삭제"><i class="fa-solid fa-trash-can"></i></button>
                </div>
                <div class="note-answers-row">
                    <span class="note-ans-badge note-ans-wrong">나의 오답: ${escapeHtml(n.myAns)}</span>
                    <span class="note-ans-badge note-ans-correct">정답: ${escapeHtml(n.correctAns)}</span>
                </div>
                <div class="note-solution-box">${escapeHtml(n.solution)}</div>
            </div>
        `).join('');

        container.querySelectorAll('.note-card').forEach(card => {
            const id = card.dataset.id;
            card.querySelector('.btn-delete-note')?.addEventListener('click', () => {
                notes = notes.filter(n => n.id !== id);
                saveNotes();
                showToast('오답노트가 삭제되었습니다.');
            });
        });
    }

    // ==========================================
    // 10. Vocabulary Manager Module
    // ==========================================
    const wordForm = document.getElementById('word-form');
    const wordEnglish = document.getElementById('word-english');
    const wordKorean = document.getElementById('word-korean');
    const wordExample = document.getElementById('word-example');
    const wordGrid = document.getElementById('word-grid');
    const wordEmptyState = document.getElementById('word-empty-state');
    const wordSearchInput = document.getElementById('word-search-input');

    if (wordForm) {
        wordForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const eng = wordEnglish.value.trim();
            const kor = wordKorean.value.trim();
            const ex = wordExample.value.trim();

            if (!eng || !kor) return;

            const newWord = {
                id: 'w-' + Date.now(),
                english: eng,
                korean: kor,
                example: ex,
                mastered: false
            };

            words.unshift(newWord);
            saveWords();

            wordEnglish.value = '';
            wordKorean.value = '';
            wordExample.value = '';
            showToast('새 단어가 추가되었습니다! 📘');
        });
    }

    if (wordSearchInput) {
        wordSearchInput.addEventListener('input', (e) => {
            wordSearchQuery = e.target.value.toLowerCase().trim();
            renderWords();
        });
    }

    const wfilterBtns = document.querySelectorAll('.filter-buttons .btn');
    wfilterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            wfilterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            wordFilterStatus = btn.dataset.wfilter;
            renderWords();
        });
    });

    function renderWords() {
        if (!wordGrid) return;

        let filtered = words.filter(w => {
            if (wordFilterStatus === 'unmastered' && w.mastered) return false;
            if (wordFilterStatus === 'mastered' && !w.mastered) return false;
            if (wordSearchQuery) {
                const matchEng = w.english.toLowerCase().includes(wordSearchQuery);
                const matchKor = w.korean.toLowerCase().includes(wordSearchQuery);
                if (!matchEng && !matchKor) return false;
            }
            return true;
        });

        if (filtered.length === 0) {
            wordGrid.innerHTML = '';
            wordEmptyState.classList.remove('hidden');
            return;
        }

        wordEmptyState.classList.add('hidden');
        wordGrid.innerHTML = filtered.map(w => `
            <div class="word-card ${w.mastered ? 'mastered' : ''}" data-id="${w.id}">
                <div class="word-card-top">
                    <div>
                        <div class="word-term">${escapeHtml(w.english)}</div>
                        <div class="word-meaning">${escapeHtml(w.korean)}</div>
                    </div>
                    <button class="btn-tts-sm btn-speak" title="발음 듣기">
                        <i class="fa-solid fa-volume-high"></i>
                    </button>
                </div>
                ${w.example ? `<div class="word-example">"${escapeHtml(w.example)}"</div>` : ''}
                <div class="word-card-bottom">
                    <label class="mastered-toggle">
                        <input type="checkbox" class="chk-mastered" ${w.mastered ? 'checked' : ''}>
                        <span>${w.mastered ? '암기 완료' : '미암기'}</span>
                    </label>
                    <button class="btn-delete-todo btn-delete-word" title="삭제">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            </div>
        `).join('');

        wordGrid.querySelectorAll('.word-card').forEach(card => {
            const id = card.dataset.id;
            const item = words.find(w => w.id === id);

            card.querySelector('.btn-speak')?.addEventListener('click', () => {
                if (item) speakText(item.english);
            });

            card.querySelector('.chk-mastered')?.addEventListener('change', (e) => {
                if (item) {
                    item.mastered = e.target.checked;
                    saveWords();
                }
            });

            card.querySelector('.btn-delete-word')?.addEventListener('click', () => {
                words = words.filter(w => w.id !== id);
                saveWords();
                showToast('단어가 삭제되었습니다.');
            });
        });
    }

    // ==========================================
    // 11. Random Quiz Engine
    // ==========================================
    const quizSetupCard = document.getElementById('quiz-setup-card');
    const quizPlayContainer = document.getElementById('quiz-play-container');
    const quizResultCard = document.getElementById('quiz-result-card');
    const btnStartQuiz = document.getElementById('btn-start-active-quiz');

    if (btnStartQuiz) {
        btnStartQuiz.addEventListener('click', startQuiz);
    }

    function startQuiz() {
        if (words.length < 2) {
            showToast('퀴즈를 진행하려면 최소 2개 이상의 단어가 필요합니다!', 'fa-triangle-exclamation');
            return;
        }

        const mode = document.querySelector('input[name="quiz-mode"]:checked')?.value || 'choice';
        const countVal = document.querySelector('input[name="quiz-count"]:checked')?.value || '10';

        let targetCount = words.length;
        if (countVal !== 'all') {
            targetCount = Math.min(parseInt(countVal, 10), words.length);
        }

        const shuffled = shuffleArray([...words]).slice(0, targetCount);

        quizState = {
            active: true,
            questions: shuffled,
            currentIndex: 0,
            score: 0,
            currentStreak: 0,
            maxStreak: 0,
            mode: mode,
            missedWords: []
        };

        quizSetupCard.classList.add('hidden');
        quizResultCard.classList.add('hidden');
        quizPlayContainer.classList.remove('hidden');

        renderQuestion();
    }

    function renderQuestion() {
        const { questions, currentIndex, mode } = quizState;
        const currentWord = questions[currentIndex];

        document.getElementById('quiz-current-num').textContent = currentIndex + 1;
        document.getElementById('quiz-total-num').textContent = questions.length;
        document.getElementById('quiz-streak-cnt').textContent = quizState.currentStreak;
        
        const pct = ((currentIndex + 1) / questions.length) * 100;
        document.getElementById('quiz-bar-fill').style.width = `${pct}%`;

        document.getElementById('quiz-word-target').textContent = currentWord.english;
        document.getElementById('quiz-hint-text').classList.add('hidden');
        document.getElementById('btn-show-hint').classList.remove('hidden');

        const speakBtn = document.getElementById('btn-speak-word');
        speakBtn.onclick = () => speakText(currentWord.english);

        const hintBtn = document.getElementById('btn-show-hint');
        hintBtn.onclick = () => {
            const firstLetter = currentWord.korean.charAt(0);
            const len = currentWord.korean.length;
            document.getElementById('hint-content').textContent = `첫 글자 '${firstLetter}' (총 ${len}글자)`;
            document.getElementById('quiz-hint-text').classList.remove('hidden');
            hintBtn.classList.add('hidden');
        };

        const feedbackElem = document.getElementById('quiz-feedback');
        feedbackElem.classList.add('hidden');

        const choiceArea = document.getElementById('quiz-choice-area');
        const typeArea = document.getElementById('quiz-type-area');

        if (mode === 'choice') {
            choiceArea.classList.remove('hidden');
            typeArea.classList.add('hidden');

            const distractors = words.filter(w => w.id !== currentWord.id);
            const shuffledDistractors = shuffleArray(distractors).slice(0, 3);
            const choices = shuffleArray([currentWord, ...shuffledDistractors]);

            const choiceBtns = choiceArea.querySelectorAll('.choice-btn');
            choiceBtns.forEach((btn, idx) => {
                if (choices[idx]) {
                    btn.classList.remove('hidden', 'correct', 'wrong');
                    btn.disabled = false;
                    btn.textContent = `${idx + 1}. ${choices[idx].korean}`;
                    btn.onclick = () => handleAnswer(choices[idx].id === currentWord.id, currentWord);
                } else {
                    btn.classList.add('hidden');
                }
            });
        } else {
            choiceArea.classList.add('hidden');
            typeArea.classList.remove('hidden');

            const typeInput = document.getElementById('quiz-type-input');
            const typeForm = document.getElementById('quiz-type-form');
            typeInput.value = '';
            typeInput.focus();

            typeForm.onsubmit = (e) => {
                e.preventDefault();
                const userAns = typeInput.value.trim();
                const isCorrect = checkTypeAnswer(userAns, currentWord.korean);
                handleAnswer(isCorrect, currentWord);
            };
        }
    }

    function checkTypeAnswer(userAns, realMeaning) {
        if (!userAns) return false;
        const normalizedUser = userAns.toLowerCase().replace(/\s+/g, '');
        const normalizedReal = realMeaning.toLowerCase().replace(/\s+/g, '');

        if (normalizedUser === normalizedReal) return true;
        const meanings = realMeaning.split(/[,/]/).map(s => s.trim().toLowerCase().replace(/\s+/g, ''));
        return meanings.some(m => m === normalizedUser || normalizedUser.includes(m));
    }

    function handleAnswer(isCorrect, currentWord) {
        const feedbackElem = document.getElementById('quiz-feedback');
        const feedbackTitle = document.getElementById('feedback-title');
        const feedbackDesc = document.getElementById('feedback-desc');
        const feedbackIcon = document.getElementById('feedback-icon');

        if (isCorrect) {
            quizState.score++;
            quizState.currentStreak++;
            if (quizState.currentStreak > quizState.maxStreak) {
                quizState.maxStreak = quizState.currentStreak;
            }
            feedbackTitle.textContent = '정답입니다! 🎉';
            feedbackDesc.textContent = `${currentWord.english} = ${currentWord.korean}`;
            feedbackIcon.innerHTML = `<i class="fa-solid fa-circle-check"></i>`;
            feedbackElem.className = 'quiz-feedback success';
        } else {
            quizState.currentStreak = 0;
            quizState.missedWords.push(currentWord);
            feedbackTitle.textContent = '아쉽네요 오답입니다 ❌';
            feedbackDesc.textContent = `정답: ${currentWord.english} = "${currentWord.korean}"`;
            feedbackIcon.innerHTML = `<i class="fa-solid fa-circle-xmark"></i>`;
            feedbackElem.className = 'quiz-feedback error';
        }

        feedbackElem.classList.remove('hidden');

        const btnNext = document.getElementById('btn-next-question');
        btnNext.onclick = () => {
            quizState.currentIndex++;
            if (quizState.currentIndex < quizState.questions.length) {
                renderQuestion();
            } else {
                finishQuiz();
            }
        };
    }

    function finishQuiz() {
        quizPlayContainer.classList.add('hidden');
        quizResultCard.classList.remove('hidden');

        stats.quizAttempts = (stats.quizAttempts || 0) + 1;
        if (quizState.maxStreak > (stats.maxStreak || 0)) {
            stats.maxStreak = quizState.maxStreak;
        }
        saveStats();

        const total = quizState.questions.length;
        const correct = quizState.score;
        const percent = Math.round((correct / total) * 100);

        document.getElementById('result-score-percent').textContent = `${percent}%`;
        document.getElementById('result-correct-count').textContent = `${correct} / ${total}`;
        document.getElementById('result-max-streak').textContent = `${quizState.maxStreak}회 🔥`;

        const missedList = document.getElementById('result-missed-list');
        const reviewSec = document.getElementById('result-review-section');

        if (quizState.missedWords.length > 0) {
            reviewSec.classList.remove('hidden');
            missedList.innerHTML = quizState.missedWords.map(w => `
                <li class="missed-item">
                    <span class="missed-term">${escapeHtml(w.english)}</span>
                    <span class="missed-meaning">${escapeHtml(w.korean)}</span>
                </li>
            `).join('');
        } else {
            reviewSec.classList.add('hidden');
        }
    }

    document.getElementById('btn-quiz-retry')?.addEventListener('click', () => {
        quizResultCard.classList.add('hidden');
        quizSetupCard.classList.remove('hidden');
    });

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/[&<>"']/g, function(m) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;'
            }[m];
        });
    }

    // ==========================================
    // 12. Initial Load Initialization
    // ==========================================
    initDashboard();
    renderTodos();
    renderWords();
});
