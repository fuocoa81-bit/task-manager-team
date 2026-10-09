const STORAGE_KEY = 'teamTaskManagerData';
const DEMO_USERS = [
    { id: 'u1', name: 'Marco Rossi', email: 'marco@company.it', role: 'Manager' },
    { id: 'u2', name: 'Giulia Bianchi', email: 'giulia@company.it', role: 'Designer' },
    { id: 'u3', name: 'Luca Verdi', email: 'luca@company.it', role: 'Developer' },
    { id: 'u4', name: 'Sara Neri', email: 'sara@company.it', role: 'Support' }
];

const DEFAULT_TASKS = [
    {
        id: 't1',
        title: 'Aggiornare dashboard report mensile',
        description: 'Preparare le metriche di vendita e condividere il nuovo layout.',
        assigneeId: 'u1',
        assigneeName: 'Marco Rossi',
        priority: 'high',
        status: 'in-progress',
        deadline: getDateOffset(2),
        tag: 'report',
        attachment: 'https://example.com/report',
        source: 'manual',
        createdAt: new Date().toISOString(),
    },
    {
        id: 't2',
        title: 'Revisione template email cliente',
        description: 'Verifica ed aggiornamento del layout e del testo delle email auto.',
        assigneeId: 'u2',
        assigneeName: 'Giulia Bianchi',
        priority: 'medium',
        status: 'open',
        deadline: getDateOffset(5),
        tag: 'marketing',
        attachment: '',
        source: 'mail',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
        id: 't3',
        title: 'Fix bug login mobile',
        description: 'Risolvere problema di accesso su iOS e Android con campi non visibili.',
        assigneeId: 'u3',
        assigneeName: 'Luca Verdi',
        priority: 'urgent',
        status: 'open',
        deadline: getDateOffset(1),
        tag: 'bug',
        attachment: 'internal/bug-112',
        source: 'agent',
        createdAt: new Date().toISOString(),
    },
    {
        id: 't4',
        title: 'Chiusura ticket support cliente',
        description: 'Contattare il cliente, verificare la soluzione e chiudere la segnalazione.',
        assigneeId: 'u4',
        assigneeName: 'Sara Neri',
        priority: 'low',
        status: 'completed',
        deadline: getDateOffset(-1),
        tag: 'support',
        attachment: '',
        source: 'mail',
        createdAt: new Date(Date.now() - 172800000).toISOString(),
    }
];

let appState = {
    loggedIn: false,
    currentUser: 'admin',
    users: [...DEMO_USERS],
    tasks: loadTasks(),
    activeTab: 'dashboard',
    myFilter: 'all'
};

function getDateOffset(days) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
}

function loadTasks() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_TASKS));
        return [...DEFAULT_TASKS];
    }

    try {
        const parsed = JSON.parse(saved);
        if (!Array.isArray(parsed) || parsed.length === 0) {
            return [...DEFAULT_TASKS];
        }
        return parsed;
    } catch {
        return [...DEFAULT_TASKS];
    }
}

function persistTasks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appState.tasks));
}

function login() {
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value.trim();

    if (username === 'admin' && password === 'admin') {
        appState.loggedIn = true;
        appState.currentUser = 'Admin';
        document.getElementById('currentUser').textContent = appState.currentUser;
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('mainContent').style.display = 'grid';
        render();
    } else {
        showToast('Credenziali non valide. Usa admin/admin.');
    }
}

function logout() {
    appState.loggedIn = false;
    document.getElementById('loginUsername').value = '';
    document.getElementById('loginPassword').value = '';
    document.getElementById('loginScreen').style.display = 'grid';
    document.getElementById('mainContent').style.display = 'none';
}

function switchTab(tab) {
    appState.activeTab = tab;
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(section => section.classList.remove('active'));

    const selectedNav = document.querySelector(`.nav-item[onclick="switchTab('${tab}')"]`);
    if (selectedNav) selectedNav.classList.add('active');

    const target = document.getElementById(tab);
    if (target) target.classList.add('active');
}

function render() {
    populateAssigneeOptions();
    renderTeamMembers();
    renderDashboard();
    renderMyTasks();
    renderUpcomingTasks();
    renderOverdueTasks();
}

function populateAssigneeOptions() {
    const select = document.getElementById('taskAssignee');
    if (!select) return;

    select.innerHTML = '<option value="">Seleziona team member</option>';
    appState.users.forEach(member => {
        const option = document.createElement('option');
        option.value = member.id;
        option.textContent = `${member.name} (${member.role})`;
        select.appendChild(option);
    });
}

function renderTeamMembers() {
    const teamList = document.getElementById('teamList');
    if (!teamList) return;

    teamList.innerHTML = '';

    appState.users.forEach(member => {
        const card = document.createElement('div');
        card.className = 'member-card';

        const memberInfo = document.createElement('div');
        memberInfo.innerHTML = `
            <div class="member-name">${member.name}</div>
            <div class="member-email">${member.email}</div>
        `;

        const pills = document.createElement('div');
        pills.className = 'member-pills';
        pills.innerHTML = `
            <span class="pill">${member.role}</span>
            <span class="pill">${countTasksByAssignee(member.id)}</span>
        `;

        card.appendChild(memberInfo);
        card.appendChild(pills);
        teamList.appendChild(card);
    });
}

function countTasksByAssignee(userId) {
    return appState.tasks.filter(task => task.assigneeId === userId).length + ' task';
}

function renderDashboard() {
    const total = appState.tasks.length;
    const open = appState.tasks.filter(task => task.status === 'open').length;
    const inProgress = appState.tasks.filter(task => task.status === 'in-progress').length;
    const completed = appState.tasks.filter(task => task.status === 'completed').length;

    document.getElementById('statTotal').textContent = total;
    document.getElementById('statOpen').textContent = open;
    document.getElementById('statInProgress').textContent = inProgress;
    document.getElementById('statCompleted').textContent = completed;
}

function renderUpcomingTasks() {
    const container = document.getElementById('upcomingTasks');
    if (!container) return;

    const upcoming = appState.tasks
        .filter(task => task.status !== 'completed')
        .filter(task => {
            const diffDays = daysBetween(new Date(), new Date(task.deadline));
            return diffDays >= 0 && diffDays <= 3;
        })
        .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

    if (upcoming.length === 0) {
        container.innerHTML = '<div class="task-item"><div class="task-meta">Nessuna task in scadenza prossima.</div></div>';
        return;
    }

    container.innerHTML = '';
    upcoming.forEach(task => {
        container.appendChild(createTaskCard(task));
    });
}

function renderOverdueTasks() {
    const container = document.getElementById('overdueTasks');
    if (!container) return;

    const overdue = appState.tasks
        .filter(task => task.status !== 'completed')
        .filter(task => new Date(task.deadline) < new Date());

    if (overdue.length === 0) {
        container.innerHTML = '<div class="task-item"><div class="task-meta">Nessuna task in ritardo.</div></div>';
        return;
    }

    container.innerHTML = '';
    overdue.forEach(task => {
        container.appendChild(createTaskCard(task, true));
    });
}

function renderMyTasks() {
    const list = document.getElementById('myTasksList');
    if (!list) return;

    const currentUserName = appState.currentUser;
    const filtered = appState.tasks.filter(task => {
        if (appState.myFilter === 'all') return true;
        return task.status === appState.myFilter;
    });

    list.innerHTML = '';

    if (filtered.length === 0) {
        list.innerHTML = '<div class="task-item"><div class="task-meta">Nessuna task disponibile per questo filtro.</div></div>';
        return;
    }

    filtered.forEach(task => {
        const card = createTaskCard(task);
        list.appendChild(card);
    });
}

function filterMyTasks(filterValue) {
    appState.myFilter = filterValue;
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    const clicked = Array.from(document.querySelectorAll('.filter-btn')).find(btn => btn.textContent.includes(getFilterLabel(filterValue)));
    if (clicked) clicked.classList.add('active');
    renderMyTasks();
}

function getFilterLabel(filter) {
    const labels = {
        all: 'Tutte',
        open: 'Da Fare',
        'in-progress': 'In Corso',
        completed: 'Completate'
    };
    return labels[filter] || 'Tutte';
}

function createTaskCard(task, isOverdue = false) {
    const card = document.createElement('div');
    card.className = 'task-item';

    const header = document.createElement('div');
    header.className = 'task-header';

    const title = document.createElement('div');
    title.className = 'task-title';
    title.textContent = task.title;
    title.onclick = () => openTaskModal(task);

    const badges = document.createElement('div');
    badges.className = 'task-actions';
    badges.innerHTML = `
        <span class="badge priority-${task.priority}">${translatePriority(task.priority)}</span>
        <span class="badge status-${task.status}">${translateStatus(task.status)}</span>
    `;

    header.appendChild(title);
    header.appendChild(badges);

    const meta = document.createElement('div');
    meta.className = 'task-meta';
    meta.innerHTML = `
        <span>👤 ${task.assigneeName}</span>
        <span>📅 ${formatDate(task.deadline)}</span>
        <span>🏷️ ${task.tag || 'senza tag'}</span>
        <span>${isOverdue ? '⚠️ In ritardo' : '⏱️ Attivo'}</span>
    `;

    const actions = document.createElement('div');
    actions.className = 'task-actions';
    actions.innerHTML = `
        <button class="small-btn" onclick="openTaskModal('${task.id}')">Dettagli</button>
        <button class="small-btn primary" onclick="advanceTaskStatus('${task.id}')">Aggiorna stato</button>
    `;

    card.appendChild(header);
    card.appendChild(meta);
    card.appendChild(actions);

    return card;
}

function openTaskModal(taskId) {
    const task = appState.tasks.find(item => item.id === taskId || item.id === taskId);
    if (!task) return;

    const modal = document.getElementById('taskModal');
    const modalBody = document.getElementById('modalBody');
    const modalTitle = document.getElementById('modalTitle');

    modalTitle.textContent = task.title;
    modalBody.innerHTML = `
        <div class="modal-body">
            <div class="detail-row"><strong>Descrizione</strong><span>${task.description || 'Nessuna descrizione'}</span></div>
            <div class="detail-row"><strong>Assegnatario</strong><span>${task.assigneeName}</span></div>
            <div class="detail-row"><strong>Priorità</strong><span class="badge priority-${task.priority}">${translatePriority(task.priority)}</span></div>
            <div class="detail-row"><strong>Stato</strong><span class="badge status-${task.status}">${translateStatus(task.status)}</span></div>
            <div class="detail-row"><strong>Scadenza</strong><span>${formatDate(task.deadline)}</span></div>
            <div class="detail-row"><strong>Tag</strong><span>${task.tag || 'Nessun tag'}</span></div>
            <div class="detail-row"><strong>Origine</strong><span>${task.source || 'manuale'}</span></div>
            <div class="detail-row"><strong>Allegato</strong><span>${task.attachment || 'Nessun allegato'}</span></div>
        </div>
    `;

    modal.classList.add('open');
}

function closeTaskModal() {
    document.getElementById('taskModal').classList.remove('open');
}

function createTask(event) {
    event.preventDefault();

    const title = document.getElementById('taskTitle').value.trim();
    const description = document.getElementById('taskDescription').value.trim();
    const assigneeId = document.getElementById('taskAssignee').value;
    const priority = document.getElementById('taskPriority').value;
    const deadline = document.getElementById('taskDeadline').value;
    const tag = document.getElementById('taskTag').value.trim();
    const attachment = document.getElementById('taskAttachment').value.trim();

    if (!title || !assigneeId || !deadline) {
        showToast('Compila tutti i campi obbligatori.');
        return;
    }

    const assignee = appState.users.find(user => user.id === assigneeId);
    const task = {
        id: `t-${Date.now()}`,
        title,
        description,
        assigneeId,
        assigneeName: assignee ? assignee.name : 'Non assegnato',
        priority,
        status: 'open',
        deadline,
        tag: tag || 'general',
        attachment,
        source: 'manual',
        createdAt: new Date().toISOString()
    };

    appState.tasks.unshift(task);
    persistTasks();
    render();
    event.target.reset();
    showToast('Task creata correttamente.');
    switchTab('dashboard');
}

function advanceTaskStatus(taskId) {
    const task = appState.tasks.find(item => item.id === taskId);
    if (!task) return;

    if (task.status === 'open') task.status = 'in-progress';
    else if (task.status === 'in-progress') task.status = 'completed';
    else task.status = 'open';

    persistTasks();
    render();
    showToast(`Stato aggiornato: ${translateStatus(task.status)}`);
}

function addTeamMember() {
    const name = document.getElementById('newMemberName').value.trim();
    const email = document.getElementById('newMemberEmail').value.trim();

    if (!name || !email) {
        showToast('Inserisci nome e email del membro.');
        return;
    }

    const member = {
        id: `u-${Date.now()}`,
        name,
        email,
        role: 'Team Member'
    };

    appState.users.push(member);
    populateAssigneeOptions();
    renderTeamMembers();
    document.getElementById('newMemberName').value = '';
    document.getElementById('newMemberEmail').value = '';
    showToast('Membro aggiunto al team.');
}

function analyzeEmail() {
    const content = document.getElementById('mailContent').value.trim();
    const results = document.getElementById('importResults');
    const extractedTasks = document.getElementById('extractedTasks');

    if (!content) {
        showToast('Incolla prima il contenuto della mail.');
        return;
    }

    const lines = content.split(/\n|\r\n/).map(line => line.trim()).filter(Boolean);
    const summary = document.createElement('div');
    summary.className = 'task-item';
    summary.innerHTML = `
        <div class="task-header">
            <div class="task-title">Analisi mail completata</div>
            <span class="status-attention">Da verificare</span>
        </div>
        <div class="task-meta">
            <span>📨 ${lines.length} righe analizzate</span>
            <span>🧠 Pattern: thread + action + status</span>
        </div>
    `;
    results.innerHTML = '';
    results.appendChild(summary);

    const extractedData = extractEmailTasks(content);
    extractedTasks.innerHTML = '';

    if (extractedData.length === 0) {
        extractedTasks.innerHTML = '<div class="task-item"><div class="task-meta">Nessuna task rilevata. Riformula la mail con azioni e riferimenti chiari.</div></div>';
        return;
    }

    extractedData.forEach(item => {
        const box = document.createElement('div');
        box.className = 'extracted-task-item';
        box.innerHTML = `
            <div class="task-header">
                <div class="task-title">${item.title}</div>
                <span class="badge status-${item.status}">${item.status === 'closed' ? 'Chiuso' : 'Aperto'}</span>
            </div>
            <div class="task-meta">
                <span>📅 ${item.deadline || 'Nessuna scadenza'}</span>
                <span>👤 ${item.assignee || 'Non assegnato'}</span>
            </div>
            <button class="btn btn-primary" onclick="confirmImportedTask('${escapeHtml(item.title)}','${escapeHtml(item.description || '')}','${item.deadline || getDateOffset(3)}')">Aggiungi alla task list</button>
        `;
        extractedTasks.appendChild(box);
    });

    showToast('Task rilevate dalla mail.');
}

function extractEmailTasks(mailText) {
    const cleaned = mailText
        .replace(/\s+/g, ' ')
        .trim();

    const tasks = [];
    const hasClosed = /chius|resolved|closed|conclus|complet|done/i.test(cleaned);
    const hasOpen = /aperto|open|in corso|pending|da fare|attendere|need|follow up/i.test(cleaned);

    const actionMatches = [...cleaned.matchAll(/(?:task|azione|attività|follow up|to do|da fare)[:\-]?\s*([^.;\n]+)/gi)];
    const titles = actionMatches.length ? actionMatches.map(match => match[1].trim()) : ['Task da verificare'];

    titles.slice(0, 3).forEach((title, index) => {
        tasks.push({
            title: title.length > 80 ? title.slice(0, 80) + '…' : title,
            description: `Task rilevata dall'analisi email. ${hasClosed && !hasOpen ? 'Segnalazione chiusa' : 'Segnalazione aperta'}`,
            deadline: getDateOffset(index + 2),
            assignee: 'Team Member',
            status: hasClosed && !hasOpen ? 'closed' : 'open'
        });
    });

    return tasks;
}

function confirmImportedTask(title, description, deadline) {
    const task = {
        id: `mail-${Date.now()}`,
        title: decodeHtml(title),
        description: decodeHtml(description),
        assigneeId: appState.users[0]?.id || 'u1',
        assigneeName: appState.users[0]?.name || 'Marco Rossi',
        priority: 'medium',
        status: 'open',
        deadline,
        tag: 'mail-import',
        attachment: '',
        source: 'mail',
        createdAt: new Date().toISOString()
    };

    appState.tasks.unshift(task);
    persistTasks();
    render();
    showToast('Task importata correttamente.');
    switchTab('dashboard');
}

function showToast(message) {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => {
        toast.remove();
    }, 2600);
}

function translateStatus(status) {
    const map = {
        open: 'Aperta',
        'in-progress': 'In Corso',
        completed: 'Completata',
        closed: 'Chiusa'
    };
    return map[status] || 'Aperta';
}

function translatePriority(priority) {
    const map = {
        low: 'Bassa',
        medium: 'Media',
        high: 'Alta',
        urgent: 'Urgente'
    };
    return map[priority] || 'Media';
}

function formatDate(dateString) {
    if (!dateString) return '---';
    return new Date(dateString + 'T00:00:00').toLocaleDateString('it-IT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function daysBetween(start, end) {
    const msPerDay = 1000 * 60 * 60 * 24;
    return Math.round((end - start) / msPerDay);
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function decodeHtml(value) {
    const map = {
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&#039;': "'"
    };

    return String(value).replace(/&(?:amp|lt|gt|quot|#039);/g, match => map[match] || match);
}

window.onload = function () {
    render();
    switchTab('dashboard');
};
