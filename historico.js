// Voltar
document.getElementById("backButton").addEventListener("click", () => {
  window.location.href = "Trinkgeld.html";
});

// Ler histórico do localStorage
let history = JSON.parse(localStorage.getItem("tipHistory")) || [];
const historyTableBody = document.querySelector("#historyTable tbody");

// Renderizar tabela
function renderTable(data) {
  historyTableBody.innerHTML = "";

  if (data.length === 0) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 5;
    cell.textContent = "Keine Einträge gefunden.";
    row.appendChild(cell);
    historyTableBody.appendChild(row);
    return;
  }

  data.forEach((entry, index) => {
    entry.employees.forEach(emp => {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${entry.date}</td>
        <td>${entry.shift}</td>
        <td>${emp.name} (${emp.code})</td>
        <td>${entry.perEmployee.toFixed(2)}</td>
        <td><button class="delete-btn" data-index="${index}">Löschen</button></td>
      `;

      historyTableBody.appendChild(row);
    });
  });

  // Botões deletar
  document.querySelectorAll(".delete-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const i = btn.getAttribute("data-index");
      history.splice(i, 1);
      localStorage.setItem("tipHistory", JSON.stringify(history));
      renderTable(history);
    });
  });
}

// Filtrar
document.getElementById("filterForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const startDate = document.getElementById("startDate").value;
  const endDate = document.getElementById("endDate").value;
  const shiftFilter = document.getElementById("shiftFilter").value;
  const codeInput = document.getElementById("codeInput").value.trim().toUpperCase();

  let filtered = [...history];

  if (startDate) {
    filtered = filtered.filter(entry => entry.date >= startDate);
  }
  if (endDate) {
    filtered = filtered.filter(entry => entry.date <= endDate);
  }
  if (shiftFilter) {
    filtered = filtered.filter(entry => entry.shift === shiftFilter);
  }
  if (codeInput) {
    filtered = filtered.filter(entry => entry.code === codeInput);
  }

  renderTable(filtered);
});

// Deletar tudo
document.getElementById("deleteAllBtn").addEventListener("click", () => {
  if (confirm("Willst du wirklich alles löschen?")) {
    history = [];
    localStorage.removeItem("tipHistory");
    renderTable(history);
  }
});

// Inicial
renderTable(history);
