// Array de funcionários iniciais
const employees = [
  { name: "Karina", code: "KBH" },
  { name: "Zana", code: "ZHH" },
  { name: "Nick", code: "NPS" },
  { name: "Simone", code: "SBC" },
  { name: "Elisabeth", code: "EBH" },
  { name: "Julian", code: "JNH" },
  { name: "Deborah", code: "DBA" },
  { name: "Higor", code: "HCS" },
  { name: "Daniel", code: "DMS" },
  { name: "Christian", code: "CWH" }
];

// Carregar usuário logado
const loggedUser = localStorage.getItem("loggedUser");
const userCode = localStorage.getItem("userCode");

if (!loggedUser) {
  window.location.href = "PaginaInicial.html";
}

// Exibir saudação
document.getElementById("greeting").textContent = `Hallo, ${loggedUser}!`;

// Popular select de funcionários
const employeeSelect = document.getElementById("employeeSelect");
employees.forEach(emp => {
  const option = document.createElement("option");
  option.value = emp.code;
  option.textContent = `${emp.name} (${emp.code})`;
  employeeSelect.appendChild(option);
});

const employeeList = document.getElementById("employeeList");
let selectedEmployees = [];

// Adicionar funcionário à lista
document.getElementById("addEmployeeBtn").addEventListener("click", function() {
  const code = employeeSelect.value;
  if (!code) return;

  const emp = employees.find(e => e.code === code);
  if (!emp) return;

  if (selectedEmployees.some(e => e.code === code)) return;

  selectedEmployees.push(emp);
  renderEmployeeList();
});

// Renderizar lista de funcionários selecionados
function renderEmployeeList() {
  employeeList.innerHTML = "";
  selectedEmployees.forEach(emp => {
    const li = document.createElement("li");
    li.textContent = `${emp.name} (${emp.code})`;

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "Entfernen";
    removeBtn.style.marginLeft = "10px";
    removeBtn.onclick = () => {
      selectedEmployees = selectedEmployees.filter(e => e.code !== emp.code);
      renderEmployeeList();
    };

    li.appendChild(removeBtn);
    employeeList.appendChild(li);
  });
}

// Registrar trinkgeld
function registerTip() {
  const shift = document.getElementById("shift").value;
  const date = document.getElementById("tipDate").value;
  const amount = parseFloat(document.getElementById("tipAmount").value);

  if (!date || isNaN(amount) || amount <= 0) {
    alert("Bitte Datum und gültigen Betrag eingeben!");
    return;
  }

  if (selectedEmployees.length === 0) {
    alert("Bitte mindestens einen Mitarbeiter auswählen!");
    return;
  }

  // Valor dividido
  const perEmployee = amount / selectedEmployees.length;

  // Dados salvos
  const entry = {
    date,
    shift,
    amount,
    perEmployee,
    employees: selectedEmployees,
    user: loggedUser,
    code: userCode
  };

  // Salvar no localStorage
  const history = JSON.parse(localStorage.getItem("tipHistory")) || [];
  history.push(entry);
  localStorage.setItem("tipHistory", JSON.stringify(history));

  // Limpar campos
  document.getElementById("tipAmount").value = "";
  document.getElementById("tipDate").value = "";
  selectedEmployees = [];
  renderEmployeeList();

  // Atualizar histórico
  renderHistory();
}

// Mostrar histórico (resumo)
function renderHistory() {
  const historyDiv = document.getElementById("history");
  const history = JSON.parse(localStorage.getItem("tipHistory")) || [];

  historyDiv.innerHTML = "";

  // Filtrar apenas do usuário logado
  const myHistory = history.filter(h => h.code === userCode);

  if (myHistory.length === 0) {
    historyDiv.textContent = "Keine Einträge gefunden.";
    return;
  }

  myHistory.slice(-5).reverse().forEach(entry => {
    const div = document.createElement("div");
    div.style.borderBottom = "1px solid #ccc";
    div.style.padding = "5px 0";

    const employeesText = entry.employees.map(e => e.name).join(", ");
    div.textContent = `${entry.date} | ${entry.shift} | ${entry.amount.toFixed(2)}€ | ${employeesText}`;

    historyDiv.appendChild(div);
  });
}

renderHistory();

// Botão para ir ao histórico completo
document.getElementById("toHistoryBtn").addEventListener("click", () => {
  window.location.href = "historico.html";
});
