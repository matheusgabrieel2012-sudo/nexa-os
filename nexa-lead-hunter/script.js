const API_URL = "http://localhost:3000";

const ADMIN_PASSWORD = "Josivan@23";

const USERS = [
    {
        name: "Matheus ADM",
        role: "Administrador",
        admin: true
    },
    {
        name: "Arthur Rodrigues",
        role: "Operacional",
        admin: false
    },
    {
        name: "Pietro de Jesus",
        role: "Operacional",
        admin: false
    }
];

const CRM_STATUSES = [
    "Novo",
    "Contatado",
    "Respondeu",
    "Negociação",
    "Fechado"
];

let currentUser = null;
let leads = [];
let currentTaskFilter = "all";
let currentWhatsAppNumber = "";
let currentNotificationCount = 0;


/* =========================
   STORAGE
========================= */

function getTasks() {
    return JSON.parse(localStorage.getItem("nexa_tasks") || "[]");
}

function saveTasks(tasks) {
    localStorage.setItem("nexa_tasks", JSON.stringify(tasks));
}

function getCRM() {
    return JSON.parse(localStorage.getItem("nexa_crm") || "[]");
}

function saveCRM(data) {
    localStorage.setItem("nexa_crm", JSON.stringify(data));
}

function getGoals() {
    return JSON.parse(
        localStorage.getItem("nexa_goals") ||
        JSON.stringify({
            target: 5000,
            current: 0
        })
    );
}

function saveGoals(data) {
    localStorage.setItem("nexa_goals", JSON.stringify(data));
}

function getActivities() {
    return JSON.parse(localStorage.getItem("nexa_activities") || "[]");
}

function saveActivities(data) {
    localStorage.setItem("nexa_activities", JSON.stringify(data));
}

function getScores() {
    return JSON.parse(
        localStorage.getItem("nexa_scores") ||
        JSON.stringify({
            "Arthur Rodrigues": 0,
            "Pietro de Jesus": 0,
            "Matheus ADM": 0
        })
    );
}

function saveScores(data) {
    localStorage.setItem("nexa_scores", JSON.stringify(data));
}


/* =========================
   LOGIN
========================= */

const loginUser = document.getElementById("loginUser");
const passwordBox = document.getElementById("passwordBox");

loginUser.addEventListener("change", () => {

    passwordBox.style.display =
        loginUser.value === "Matheus ADM"
            ? "block"
            : "none";

});

document.getElementById("loginBtn").addEventListener("click", login);

document.getElementById("loginPassword").addEventListener("keydown", e => {
    if (e.key === "Enter") login();
});

function login() {

    const selectedUser = USERS.find(
        user => user.name === loginUser.value
    );

    if (!selectedUser) return;

    if (selectedUser.admin) {

        const password =
            document.getElementById("loginPassword").value;

        if (password !== ADMIN_PASSWORD) {

            showToast(
                "Acesso negado",
                "Senha administrativa incorreta."
            );

            playSound("error");

            return;
        }
    }

    currentUser = selectedUser;

    localStorage.setItem(
        "nexa_session",
        JSON.stringify(currentUser)
    );

    openApp();

    showToast(
        "Login realizado",
        `Bem-vindo, ${currentUser.name}.`
    );

    playSound("success");
}

function checkSession() {

    const session =
        JSON.parse(localStorage.getItem("nexa_session") || "null");

    if (session) {

        currentUser = session;

        openApp();

    } else {

        document.getElementById("loginScreen")
            .classList.remove("hidden");

        document.getElementById("app")
            .classList.add("hidden");
    }
}

function openApp() {

    document.getElementById("loginScreen")
        .classList.add("hidden");

    document.getElementById("app")
        .classList.remove("hidden");

    setupUserInterface();

    updateDashboard();

    renderTasks();

    renderGoals();

    renderRanking();

    renderTeam();

    renderCRM();

    renderActivities();

    updateDate();
}

document.getElementById("logoutBtn").addEventListener("click", () => {

    localStorage.removeItem("nexa_session");

    location.reload();

});


/* =========================
   USER INTERFACE
========================= */

function setupUserInterface() {

    document.getElementById("sidebarUserName").textContent =
        currentUser.name;

    document.getElementById("sidebarUserRole").textContent =
        currentUser.role;

    document.getElementById("topUserName").textContent =
        currentUser.name;

    document.getElementById("welcomeName").textContent =
        currentUser.name.split(" ")[0];

    const letter =
        currentUser.name.charAt(0).toUpperCase();

    document.getElementById("userAvatar").textContent = letter;
    document.getElementById("topAvatar").textContent = letter;

    document.querySelectorAll(".admin-only").forEach(item => {
        item.style.display =
            currentUser.admin ? "flex" : "none";
    });

    document.querySelectorAll(".admin-action").forEach(item => {
        item.style.display =
            currentUser.admin ? "block" : "none";
    });

}


/* =========================
   NAVIGATION
========================= */

document.querySelectorAll(".nav-item").forEach(button => {

    button.addEventListener("click", () => {

        navigate(button.dataset.page);

    });

});

document.querySelectorAll("[data-page-action]").forEach(button => {

    button.addEventListener("click", () => {

        navigate(button.dataset.pageAction);

    });

});

function navigate(page) {

    if (page === "admin" && !currentUser.admin) {

        showToast(
            "Acesso restrito",
            "Somente Matheus ADM pode acessar."
        );

        return;
    }

    document.querySelectorAll(".page").forEach(section => {
        section.classList.remove("active-page");
    });

    const target =
        document.getElementById(`page-${page}`);

    if (target) {
        target.classList.add("active-page");
    }

    document.querySelectorAll(".nav-item").forEach(item => {

        item.classList.toggle(
            "active",
            item.dataset.page === page
        );

    });

}


/* =========================
   DATE
========================= */

function updateDate() {

    const now = new Date();

    document.getElementById("currentDate").textContent =
        now.toLocaleDateString("pt-BR", {
            weekday: "long",
            day: "2-digit",
            month: "long"
        });

}


/* =========================
   LEAD HUNTER
========================= */

document.getElementById("buscarBtn")
    .addEventListener("click", buscarLeads);

async function buscarLeads() {

    const nicho =
        document.getElementById("nicho").value.trim();

    const localizacao =
        document.getElementById("localizacao").value.trim();

    const quantidade =
        document.getElementById("quantidade").value;

    if (!nicho || !localizacao) {

        showToast(
            "Preencha os campos",
            "Informe o nicho e a localização."
        );

        return;
    }

    showLoading(
        "Procurando empresas...",
        "Consultando Google Maps"
    );

    try {

        const response =
            await fetch(`${API_URL}/api/leads`, {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    nicho,
                    localizacao,
                    quantidade
                })
            });

        const data = await response.json();

        if (!data.sucesso) {
            throw new Error(data.error);
        }

        leads = data.leads || [];

        renderLeads(data);

        addActivity(
            currentUser.name,
            `Encontrou ${leads.length} leads em ${nicho}`
        );

        addScore(currentUser.name, leads.length);

        showToast(
            "Busca concluída",
            `${leads.length} oportunidades encontradas.`
        );

        playSound("success");

    } catch (error) {

        console.error(error);

        showToast(
            "Erro",
            error.message || "Não foi possível buscar os leads."
        );

        playSound("error");

    } finally {

        hideLoading();

    }

}

function renderLeads(data) {

    document.getElementById("totalLeads").textContent =
        data.totalEncontrado || 0;

    document.getElementById("semSite").textContent =
        data.totalSemSite || 0;

    document.getElementById("altoPotencial").textContent =
        leads.filter(l => l.potencial === "Alto").length;

    const average =
        leads.length
            ? Math.round(
                leads.reduce((sum, lead) => sum + Number(lead.score || 0), 0)
                / leads.length
            )
            : 0;

    document.getElementById("scoreMedio").textContent =
        average;

    const container =
        document.getElementById("leadsContainer");

    if (!leads.length) {

        container.innerHTML = `
            <div class="empty-state">
                <div>◌</div>
                <h3>Nenhum lead encontrado</h3>
                <p>Tente outro nicho ou localização.</p>
            </div>
        `;

        return;
    }

    container.innerHTML =
        leads.map((lead, index) => {

            const crmItem =
                getCRM().find(item => item.id === lead.id);

            const status =
                crmItem?.status || "Novo";

            return `
                <article class="lead-card">

                    <div class="lead-top">

                        <div>
                            <h3>${escapeHTML(lead.nome)}</h3>

                            <small>
                                ${escapeHTML(lead.endereco)}
                            </small>
                        </div>

                        <div class="score">
                            ${lead.score}
                        </div>

                    </div>

                    <div class="lead-details">

                        📞 ${escapeHTML(lead.telefone || "Não informado")}<br>

                        ${
                            lead.semSite
                                ? "⚠️ Site não identificado"
                                : "🌐 Site identificado"
                        }

                    </div>

                    <div class="lead-actions">

                        <button onclick="generateCopy(${index})">
                            ✨ Gerar copy
                        </button>

                        <button onclick="openWhatsApp('${escapeAttr(lead.telefone)}')">
                            💬 WhatsApp
                        </button>

                        <button onclick="openMaps('${escapeAttr(lead.mapsUrl)}')">
                            🗺️ Maps
                        </button>

                        <button onclick="saveLeadToCRM(${index})">
                            + CRM
                        </button>

                    </div>

                    <select
                        class="status-select"
                        onchange="changeLeadStatus(${index}, this.value)"
                    >

                        ${CRM_STATUSES.map(s => `
                            <option
                                ${s === status ? "selected" : ""}
                            >
                                ${s}
                            </option>
                        `).join("")}

                    </select>

                </article>
            `;

        }).join("");

}


/* =========================
   CRM
========================= */

function saveLeadToCRM(index) {

    const lead = leads[index];

    if (!lead) return;

    const crm = getCRM();

    const exists =
        crm.some(item => item.id === lead.id);

    if (exists) {

        showToast(
            "Lead já está no CRM",
            lead.nome
        );

        return;
    }

    crm.push({
        ...lead,
        status: "Novo",
        responsavel: currentUser.name,
        createdAt: new Date().toISOString()
    });

    saveCRM(crm);

    addActivity(
        currentUser.name,
        `Adicionou ${lead.nome} ao CRM`
    );

    addScore(currentUser.name, 5);

    renderCRM();

    showToast(
        "Lead salvo",
        `${lead.nome} foi adicionado ao CRM.`
    );

    playSound("success");
}

function changeLeadStatus(index, status) {

    const lead = leads[index];

    if (!lead) return;

    const crm = getCRM();

    let item =
        crm.find(x => x.id === lead.id);

    if (!item) {

        item = {
            ...lead,
            status,
            responsavel: currentUser.name,
            createdAt: new Date().toISOString()
        };

        crm.push(item);

    } else {

        item.status = status;

    }

    saveCRM(crm);

    addActivity(
        currentUser.name,
        `${lead.nome}: status alterado para ${status}`
    );

    renderCRM();

    updateDashboard();

}

function renderCRM() {

    const crm = getCRM();

    const board =
        document.getElementById("crmBoard");

    board.innerHTML =
        CRM_STATUSES.map(status => {

            const items =
                crm.filter(item => item.status === status);

            return `
                <div class="crm-column">

                    <div class="crm-column-header">

                        <strong>${status}</strong>

                        <span>${items.length}</span>

                    </div>

                    ${
                        items.length
                            ? items.map(item => `
                                <div class="crm-item">

                                    <strong>
                                        ${escapeHTML(item.nome)}
                                    </strong>

                                    <small>
                                        ${escapeHTML(item.responsavel || "Sem responsável")}
                                    </small>

                                </div>
                            `).join("")
                            : `
                                <div style="
                                    color:#555;
                                    font-size:10px;
                                    padding:20px 5px;
                                    text-align:center;
                                ">
                                    Nenhuma oportunidade
                                </div>
                            `
                    }

                </div>
            `;

        }).join("");

}


/* =========================
   WHATSAPP
========================= */

function normalizarTelefone(phone) {

    if (!phone) return "";

    let number =
        String(phone).replace(/\D/g, "");

    if (!number) return "";

    if (!number.startsWith("55")) {
        number = "55" + number;
    }

    return number;
}

function openWhatsApp(phone) {

    const number =
        normalizarTelefone(phone);

    if (!number) {

        showToast(
            "Telefone indisponível",
            "Esse lead não possui telefone."
        );

        return;
    }

    window.open(
        `https://wa.me/${number}`,
        "_blank"
    );
}

function openWhatsAppWithMessage() {

    const message =
        document.getElementById("copyText").value;

    if (!currentWhatsAppNumber) return;

    window.open(
        `https://wa.me/${currentWhatsAppNumber}?text=${encodeURIComponent(message)}`,
        "_blank"
    );
}

document.getElementById("openWhatsAppBtn")
    .addEventListener(
        "click",
        openWhatsAppWithMessage
    );


/* =========================
   GOOGLE MAPS
========================= */

function openMaps(url) {

    if (!url) {

        showToast(
            "Maps indisponível",
            "Esse lead não possui link do Maps."
        );

        return;
    }

    window.open(url, "_blank");

}


/* =========================
   AI COPY
========================= */

async function generateCopy(index) {

    const lead = leads[index];

    if (!lead) return;

    showLoading(
        "Criando mensagem...",
        "A NEXA AI está personalizando sua abordagem."
    );

    try {

        const nicho =
            document.getElementById("nicho").value;

        const localizacao =
            document.getElementById("localizacao").value;

        const response =
            await fetch(`${API_URL}/api/gerar-mensagem`, {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    nome: lead.nome,
                    nicho,
                    localizacao

                })
            });

        const data = await response.json();

        if (!data.sucesso) {
            throw new Error(data.error);
        }

        document.getElementById("copyCompanyName")
            .textContent =
            `Mensagem para ${lead.nome}`;

        document.getElementById("copyText")
            .value =
            data.mensagem;

        currentWhatsAppNumber =
            normalizarTelefone(lead.telefone);

        openModal("copyModal");

        playSound("success");

    } catch (error) {

        showToast(
            "Erro na IA",
            error.message
        );

        playSound("error");

    } finally {

        hideLoading();

    }

}

document.getElementById("copyMessageBtn")
    .addEventListener("click", async () => {

        const text =
            document.getElementById("copyText").value;

        await navigator.clipboard.writeText(text);

        showToast(
            "Copiado!",
            "Mensagem pronta para enviar."
        );

        playSound("success");

    });


/* =========================
   TASKS
========================= */

document.getElementById("newTaskBtn")
    .addEventListener("click", () => {

        if (!currentUser.admin) return;

        openModal("taskModal");

    });

document.querySelectorAll("[data-task-filter]")
    .forEach(button => {

        button.addEventListener("click", () => {

            currentTaskFilter =
                button.dataset.taskFilter;

            document.querySelectorAll("[data-task-filter]")
                .forEach(btn => btn.classList.remove("active"));

            button.classList.add("active");

            renderTasks();

        });

    });

function createTask(title, assignee, priority, due) {

    const tasks = getTasks();

    const task = {

        id: Date.now(),

        title,

        assignee,

        priority,

        due,

        completed: false,

        createdBy: currentUser.name,

        createdAt: new Date().toISOString()

    };

    tasks.unshift(task);

    saveTasks(tasks);

    addActivity(
        currentUser.name,
        `Criou a tarefa "${title}" para ${assignee}`
    );

    addScore(assignee, 2);

    createNotification(
        "Nova tarefa",
        `${title} foi atribuída a ${assignee}.`
    );

    renderTasks();

    updateDashboard();

    showToast(
        "Tarefa criada",
        `Atribuída para ${assignee}.`
    );

    playSound("notification");
}

document.getElementById("taskForm")
    .addEventListener("submit", e => {

        e.preventDefault();

        createTask(
            document.getElementById("taskTitle").value,
            document.getElementById("taskAssignee").value,
            document.getElementById("taskPriority").value,
            document.getElementById("taskDue").value
        );

        e.target.reset();

    });

document.getElementById("modalTaskForm")
    .addEventListener("submit", e => {

        e.preventDefault();

        createTask(
            document.getElementById("modalTaskTitle").value,
            document.getElementById("modalTaskAssignee").value,
            document.getElementById("modalTaskPriority").value,
            document.getElementById("modalTaskDue").value
        );

        e.target.reset();

        closeModal("taskModal");

    });

function renderTasks() {

    let tasks = getTasks();

    if (!currentUser.admin) {

        tasks =
            tasks.filter(
                task => task.assignee === currentUser.name
            );

    }

    if (currentTaskFilter === "pending") {

        tasks =
            tasks.filter(task => !task.completed);

    }

    if (currentTaskFilter === "completed") {

        tasks =
            tasks.filter(task => task.completed);

    }

    const container =
        document.getElementById("tasksList");

    if (!tasks.length) {

        container.innerHTML = `
            <div class="empty-state">
                <div>✓</div>
                <h3>Nenhuma tarefa</h3>
                <p>Não existem tarefas nessa categoria.</p>
            </div>
        `;

        return;
    }

    container.innerHTML =
        tasks.map(task => `

            <div class="task-card ${task.completed ? "completed" : ""}">

                <button
                    class="task-check"
                    onclick="toggleTask(${task.id})"
                >
                    ${task.completed ? "✓" : ""}
                </button>

                <div class="task-content">

                    <strong>
                        ${escapeHTML(task.title)}
                    </strong>

                    <span>
                        ${escapeHTML(task.assignee)}
                        ${
                            task.due
                                ? ` • prazo ${formatDate(task.due)}`
                                : ""
                        }
                    </span>

                </div>

                <span class="priority ${task.priority.toLowerCase()}">
                    ${task.priority}
                </span>

                ${
                    currentUser.admin
                        ? `
                            <button
                                class="delete-task"
                                onclick="deleteTask(${task.id})"
                            >
                                ×
                            </button>
                        `
                        : ""
                }

            </div>

        `).join("");

}

function toggleTask(id) {

    const tasks = getTasks();

    const task =
        tasks.find(t => t.id === id);

    if (!task) return;

    if (
        !currentUser.admin &&
        task.assignee !== currentUser.name
    ) return;

    task.completed =
        !task.completed;

    saveTasks(tasks);

    if (task.completed) {

        addScore(task.assignee, 10);

        addActivity(
            task.assignee,
            `Concluiu a tarefa "${task.title}"`
        );

        createNotification(
            "Tarefa concluída",
            `${task.assignee} concluiu uma tarefa.`
        );

        playSound("success");

    }

    renderTasks();

    updateDashboard();

    renderRanking();

}

function deleteTask(id) {

    if (!currentUser.admin) return;

    const tasks =
        getTasks().filter(
            task => task.id !== id
        );

    saveTasks(tasks);

    renderTasks();

    showToast(
        "Tarefa excluída",
        "A tarefa foi removida."
    );

}


/* =========================
   GOALS
========================= */

function renderGoals() {

    const goal = getGoals();

    const percentage =
        goal.target > 0
            ? Math.min(
                Math.round((goal.current / goal.target) * 100),
                100
            )
            : 0;

    document.getElementById("teamGoalPercent")
        .textContent = `${percentage}%`;

    document.getElementById("teamGoalProgress")
        .style.width = `${percentage}%`;

    document.getElementById("teamGoalCurrent")
        .textContent = money(goal.current);

    document.getElementById("teamGoalTarget")
        .textContent = money(goal.target);

    document.getElementById("goalsContainer").innerHTML = `

        <div class="goal-card">

            <span class="eyebrow">NEXA</span>

            <h3>Meta mensal da empresa</h3>

            <p>Faturamento</p>

            <div class="big">
                ${money(goal.current)}
            </div>

            <div class="progress">
                <div
                    class="progress-bar"
                    style="width:${percentage}%"
                ></div>
            </div>

            <div class="goal-values">

                <span>${percentage}%</span>

                <span>
                    ${money(goal.target)}
                </span>

            </div>

        </div>

        ${USERS.map(user => {

            const scores =
                getScores();

            const value =
                scores[user.name] || 0;

            const target = 100;

            const p =
                Math.min(
                    Math.round((value / target) * 100),
                    100
                );

            return `

                <div class="goal-card">

                    <span class="eyebrow">
                        INDIVIDUAL
                    </span>

                    <h3>${user.name}</h3>

                    <p>Pontos de produtividade</p>

                    <div class="big">
                        ${value}
                    </div>

                    <div class="progress">
                        <div
                            class="progress-bar"
                            style="width:${p}%"
                        ></div>
                    </div>

                    <div class="goal-values">
                        <span>${p}%</span>
                        <span>${target} pts</span>
                    </div>

                </div>
            `;

        }).join("")}

    `;

}

document.getElementById("goalForm")
    .addEventListener("submit", e => {

        e.preventDefault();

        if (!currentUser.admin) return;

        saveGoals({

            target:
                Number(
                    document.getElementById("goalTarget").value
                ),

            current:
                Number(
                    document.getElementById("goalCurrent").value
                )

        });

        renderGoals();

        updateDashboard();

        showToast(
            "Meta atualizada",
            "A meta da NEXA foi salva."
        );

    });

document.getElementById("editGoalBtn")
    .addEventListener("click", () => {

        const goal = getGoals();

        document.getElementById("modalGoalTarget").value =
            goal.target;

        document.getElementById("modalGoalCurrent").value =
            goal.current;

        openModal("goalModal");

    });

document.getElementById("modalGoalForm")
    .addEventListener("submit", e => {

        e.preventDefault();

        saveGoals({

            target:
                Number(
                    document.getElementById("modalGoalTarget").value
                ),

            current:
                Number(
                    document.getElementById("modalGoalCurrent").value
                )

        });

        closeModal("goalModal");

        renderGoals();

        updateDashboard();

        showToast(
            "Meta atualizada",
            "Alterações salvas."
        );

    });


/* =========================
   RANKING
========================= */

function renderRanking() {

    const scores =
        getScores();

    const ranking =
        Object.entries(scores)
            .sort((a,b) => b[1] - a[1]);

    const medals = ["🥇", "🥈", "🥉"];

    document.getElementById("rankingContainer")
        .innerHTML =
        ranking.map((item,index) => `

            <div class="ranking-item">

                <div class="ranking-position">
                    ${medals[index] || `#${index + 1}`}
                </div>

                <div class="ranking-info">

                    <strong>
                        ${item[0]}
                    </strong>

                    <span>
                        Produtividade NEXA
                    </span>

                </div>

                <div class="ranking-points">
                    ${item[1]} pts
                </div>

            </div>

        `).join("");

}

function addScore(name, points) {

    const scores =
        getScores();

    scores[name] =
        (scores[name] || 0) + points;

    saveScores(scores);

    renderRanking();

    renderGoals();

}


/* =========================
   TEAM
========================= */

function renderTeam() {

    const tasks =
        getTasks();

    const scores =
        getScores();

    document.getElementById("teamContainer")
        .innerHTML =
        USERS.map(user => {

            const userTasks =
                tasks.filter(
                    task => task.assignee === user.name
                );

            const completed =
                userTasks.filter(
                    task => task.completed
                ).length;

            return `

                <div class="team-card">

                    <div class="team-card-top">

                        <div class="avatar">
                            ${user.name.charAt(0)}
                        </div>

                        <div>

                            <h3>
                                ${user.name}
                            </h3>

                            <p>
                                ${user.role}
                            </p>

                        </div>

                    </div>

                    <div class="team-stat-grid">

                        <div>
                            <span>Pontos</span>
                            <strong>
                                ${scores[user.name] || 0}
                            </strong>
                        </div>

                        <div>
                            <span>Tarefas</span>
                            <strong>
                                ${userTasks.length}
                            </strong>
                        </div>

                        <div>
                            <span>Concluídas</span>
                            <strong>
                                ${completed}
                            </strong>
                        </div>

                    </div>

                </div>

            `;

        }).join("");

}


/* =========================
   DASHBOARD
========================= */

function updateDashboard() {

    const crm =
        getCRM();

    const tasks =
        getTasks();

    document.getElementById("metricLeads")
        .textContent =
        leads.length +
        crm.length;

    document.getElementById("metricContacted")
        .textContent =
        crm.filter(
            item =>
                item.status !== "Novo"
        ).length;

    document.getElementById("metricNegotiation")
        .textContent =
        crm.filter(
            item =>
                item.status === "Negociação"
        ).length;

    document.getElementById("metricWon")
        .textContent =
        crm.filter(
            item =>
                item.status === "Fechado"
        ).length;

    renderGoals();

    renderTeamMini();

}

function renderTeamMini() {

    const scores =
        getScores();

    document.getElementById("teamMiniList")
        .innerHTML =
        USERS.map(user => `

            <div class="team-mini">

                <div class="avatar small">
                    ${user.name.charAt(0)}
                </div>

                <div class="team-mini-info">

                    <strong>
                        ${user.name}
                    </strong>

                    <span>
                        ${user.role}
                    </span>

                </div>

                <div class="team-mini-score">
                    ${scores[user.name] || 0}
                </div>

            </div>

        `).join("");

}


/* =========================
   ACTIVITIES
========================= */

function addActivity(user, text) {

    const activities =
        getActivities();

    activities.unshift({

        user,

        text,

        date:
            new Date().toISOString()

    });

    saveActivities(
        activities.slice(0,30)
    );

    renderActivities();

}

function renderActivities() {

    const activities =
        getActivities();

    const container =
        document.getElementById("activityList");

    if (!activities.length) {

        container.innerHTML = `
            <div class="empty-state">
                <div>◌</div>
                <h3>Nenhuma atividade ainda</h3>
            </div>
        `;

        return;
    }

    container.innerHTML =
        activities.slice(0,8).map(activity => `

            <div class="activity-item">

                <div>
                    <strong>
                        ${escapeHTML(activity.text)}
                    </strong>

                    <span>
                        por ${escapeHTML(activity.user)}
                    </span>
                </div>

                <span>
                    ${timeAgo(activity.date)}
                </span>

            </div>

        `).join("");

}


/* =========================
   NOTIFICATIONS
========================= */

function createNotification(title, message) {

    const notifications =
        JSON.parse(
            localStorage.getItem("nexa_notifications") || "[]"
        );

    notifications.unshift({

        id: Date.now(),

        title,

        message,

        read: false,

        date: new Date().toISOString()

    });

    localStorage.setItem(
        "nexa_notifications",
        JSON.stringify(
            notifications.slice(0,30)
        )
    );

    updateNotificationCount();

    browserNotify(title, message);

}

function updateNotificationCount() {

    const notifications =
        JSON.parse(
            localStorage.getItem("nexa_notifications") || "[]"
        );

    const unread =
        notifications.filter(
            notification => !notification.read
        ).length;

    currentNotificationCount =
        unread;

    document.getElementById("notificationCount")
        .textContent =
        unread;

}

document.getElementById("notificationBtn")
    .addEventListener("click", () => {

        const notifications =
            JSON.parse(
                localStorage.getItem("nexa_notifications") || "[]"
            );

        if (!notifications.length) {

            showToast(
                "Notificações",
                "Nenhuma notificação nova."
            );

            return;
        }

        const latest =
            notifications[0];

        showToast(
            latest.title,
            latest.message
        );

        notifications.forEach(
            notification =>
                notification.read = true
        );

        localStorage.setItem(
            "nexa_notifications",
            JSON.stringify(notifications)
        );

        updateNotificationCount();

    });


/* =========================
   BROWSER NOTIFICATIONS
========================= */

document.getElementById("notificationPermissionBtn")
    .addEventListener("click", async () => {

        if (!("Notification" in window)) {

            showToast(
                "Indisponível",
                "Seu navegador não suporta notificações."
            );

            return;
        }

        const permission =
            await Notification.requestPermission();

        if (permission === "granted") {

            showToast(
                "Notificações ativadas",
                "O NEXA poderá enviar alertas."
            );

            playSound("success");

        }

    });

function browserNotify(title, body) {

    if (
        "Notification" in window &&
        Notification.permission === "granted"
    ) {

        new Notification(
            `NEXA OS • ${title}`,
            {
                body
            }
        );

    }

}


/* =========================
   SOUND
========================= */

let audioContext = null;

function playSound(type = "notification") {

    try {

        if (!audioContext) {

            audioContext =
                new (
                    window.AudioContext ||
                    window.webkitAudioContext
                )();

        }

        const oscillator =
            audioContext.createOscillator();

        const gain =
            audioContext.createGain();

        oscillator.connect(gain);
        gain.connect(audioContext.destination);

        const now =
            audioContext.currentTime;

        oscillator.frequency.value =
            type === "error"
                ? 180
                : type === "success"
                    ? 700
                    : 500;

        gain.gain.setValueAtTime(
            0.001,
            now
        );

        gain.gain.exponentialRampToValueAtTime(
            0.08,
            now + .02
        );

        gain.gain.exponentialRampToValueAtTime(
            0.001,
            now + .18
        );

        oscillator.start(now);
        oscillator.stop(now + .2);

    } catch {}

}

document.getElementById("soundBtn")
    .addEventListener("click", () => {

        playSound("success");

        showToast(
            "Som",
            "Som de notificações ativado."
        );

    });


/* =========================
   AI ASSISTANT
========================= */

document.getElementById("aiSendBtn")
    .addEventListener("click", sendAI);

document.getElementById("aiInput")
    .addEventListener("keydown", e => {

        if (e.key === "Enter") {
            sendAI();
        }

    });

async function sendAI() {

    const input =
        document.getElementById("aiInput");

    const question =
        input.value.trim();

    if (!question) return;

    const messages =
        document.getElementById("aiMessages");

    messages.innerHTML += `
        <div class="ai-message user">
            ${escapeHTML(question)}
        </div>
    `;

    input.value = "";

    try {

        const response =
            await fetch(`${API_URL}/api/ai`, {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    pergunta: question,

                    contexto: {

                        leads: leads.length,

                        crm: getCRM(),

                        tasks: getTasks(),

                        goals: getGoals(),

                        user: currentUser.name

                    }

                })

            });

        const data =
            await response.json();

        if (!data.sucesso) {
            throw new Error(data.error);
        }

        messages.innerHTML += `
            <div class="ai-message">
                ${escapeHTML(data.resposta)}
            </div>
        `;

    } catch (error) {

        messages.innerHTML += `
            <div class="ai-message">
                Não consegui processar agora. Verifique se o backend está online.
            </div>
        `;

    }

    messages.scrollTop =
        messages.scrollHeight;

}


/* =========================
   ADMIN TOOLS
========================= */

document.getElementById("clearTasksBtn")
    .addEventListener("click", () => {

        if (!currentUser.admin) return;

        if (
            confirm("Tem certeza que deseja apagar todas as tarefas?")
        ) {

            localStorage.removeItem("nexa_tasks");

            renderTasks();
            updateDashboard();

            showToast(
                "Tarefas removidas",
                "Todas as tarefas foram apagadas."
            );

        }

    });

document.getElementById("clearCRMBtn")
    .addEventListener("click", () => {

        if (!currentUser.admin) return;

        if (
            confirm("Tem certeza que deseja apagar todo o CRM?")
        ) {

            localStorage.removeItem("nexa_crm");

            renderCRM();
            updateDashboard();

            showToast(
                "CRM limpo",
                "Todas as oportunidades foram removidas."
            );

        }

    });

document.getElementById("resetDataBtn")
    .addEventListener("click", () => {

        if (!currentUser.admin) return;

        if (
            confirm("Isso apagará tarefas, CRM, metas, atividades e ranking. Continuar?")
        ) {

            [
                "nexa_tasks",
                "nexa_crm",
                "nexa_goals",
                "nexa_activities",
                "nexa_scores",
                "nexa_notifications"
            ].forEach(key =>
                localStorage.removeItem(key)
            );

            location.reload();

        }

    });


/* =========================
   MODALS
========================= */

function openModal(id) {

    document
        .getElementById(id)
        .classList.add("open");

}

function closeModal(id) {

    document
        .getElementById(id)
        .classList.remove("open");

}

document.querySelectorAll("[data-close-modal]")
    .forEach(button => {

        button.addEventListener("click", () => {

            closeModal(
                button.dataset.closeModal
            );

        });

    });

document.querySelectorAll(".modal")
    .forEach(modal => {

        modal.addEventListener("click", e => {

            if (e.target === modal) {

                modal.classList.remove("open");

            }

        });

    });


/* =========================
   LOADING
========================= */

function showLoading(title, text) {

    document.getElementById("loadingTitle")
        .textContent = title;

    document.getElementById("loadingText")
        .textContent = text;

    document.getElementById("loading")
        .classList.remove("hidden");

}

function hideLoading() {

    document.getElementById("loading")
        .classList.add("hidden");

}


/* =========================
   TOAST
========================= */

function showToast(title, message) {

    const container =
        document.getElementById("toastContainer");

    const toast =
        document.createElement("div");

    toast.className = "toast";

    toast.innerHTML = `
        <strong>${escapeHTML(title)}</strong>
        <span>${escapeHTML(message)}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {

        toast.remove();

    }, 3500);

}


/* =========================
   HELPERS
========================= */

function money(value) {

    return Number(value || 0)
        .toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        );

}

function formatDate(date) {

    if (!date) return "";

    return new Date(date + "T12:00:00")
        .toLocaleDateString("pt-BR");

}

function timeAgo(date) {

    const diff =
        Date.now() -
        new Date(date).getTime();

    const minutes =
        Math.floor(diff / 60000);

    if (minutes < 1) return "agora";

    if (minutes < 60)
        return `${minutes} min`;

    const hours =
        Math.floor(minutes / 60);

    if (hours < 24)
        return `${hours}h`;

    const days =
        Math.floor(hours / 24);

    return `${days}d`;

}

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}

function escapeAttr(value) {

    return String(value ?? "")
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'");

}


/* =========================
   START
========================= */

updateNotificationCount();

checkSession();