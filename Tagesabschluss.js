function analyze() {
  const karten = ["master", "visa", "ec", "maestro", "amex"];
  const karteNamen = {
    master: "MasterCard",
    visa: "Visa",
    ec: "EC-Karte",
    maestro: "Maestro",
    amex: "American Express"
  };

  let tableHTML = `
    <table class="vergleich-tabelle" style="width: 100%; text-align: center; border: 1px solid #000;">
      <thead>
        <tr>
          <th>Karte</th>
          <th>EFT </th>
          <th>EC-Gerät </th>
          <th>Protel</th>
          <th>Differenz</th>
        </tr>
      </thead>
      <tbody>
  `;

  karten.forEach(kart => {
    const eft = parseFloat(document.querySelector(`[name=eft_${kart}]`).value) || 0;
    const ecg = parseFloat(document.querySelector(`[name=ecg_${kart}]`).value) || 0;
    const protel = parseFloat(document.querySelector(`[name=protel_${kart}]`).value) || 0;

    const sum = eft + ecg;
    const diff = (sum - protel).toFixed(2);
    const isDifferent = Math.abs(diff) > 0.009;

    tableHTML += `
      <tr>
        <td>${karteNamen[kart]}</td>
        <td>${eft.toFixed(2)}</td>
        <td>${ecg.toFixed(2)}</td>
        <td>${protel.toFixed(2)}</td>
        <td style="color: ${isDifferent ? 'red' : 'green'};">${isDifferent ? diff : '0.00'}</td>
      </tr>
    `;
  });

  tableHTML += `</tbody></table>`;
  // Criar segunda tabela: Merchant-Umsätze
const merchantInputs = document.querySelectorAll('#merchantInputs input[type="number"]');
const protelMerchant = parseFloat(document.getElementById('merchantProtel').value) || 0;

let merchantTableHTML = `
  <table class="vergleich-tabelle" style="width: 100%; text-align: center; border-collapse: collapse; border: 1px solid #000;">
    <thead style="background-color: #f2f2f2;">
      <tr>
        <th style="border: 1px solid #000; padding: 8px;">Merchant</th>
        <th style="border: 1px solid #000; padding: 8px;">Protel</th>
        <th style="border: 1px solid #000; padding: 8px;">Differenz</th>
      </tr>
    </thead>
    <tbody>
`;

const merchantValues = Array.from(merchantInputs).map(input => parseFloat(input.value) || 0);
const totalMerchant = merchantValues.reduce((sum, val) => sum + val, 0);
const diff = (totalMerchant - protelMerchant).toFixed(2);
const isDifferent = Math.abs(diff) > 0.009;

merchantValues.forEach((val, index) => {
  merchantTableHTML += `
    <tr>
      <td style="border: 1px solid #000; padding: 8px;">${val.toFixed(2)}</td>
      ${index === 0 ? `
        <td style="border: 1px solid #000; padding: 8px;" rowspan="${merchantValues.length}">${protelMerchant.toFixed(2)}</td>
        <td style="border: 1px solid #000; padding: 8px; color: ${isDifferent ? 'red' : 'green'};" rowspan="${merchantValues.length}">${diff}</td>
      ` : ''}
    </tr>
  `;
});

merchantTableHTML += `</tbody></table>`;


// Inserir as duas tabelas lado a lado
document.getElementById("resultTable").innerHTML = `
  <div style="display: flex; justify-content: center; gap: 40px; flex-wrap: wrap; max-width: 1000px; margin: 0 auto;">
    <div style="flex: 1; min-width: 300px;">${tableHTML}</div>
    <div style="flex: 1; min-width: 300px;">${merchantTableHTML}</div>
  </div>
`;



  // Mostra a página de análise
  document.getElementById("analysePage").style.display = 'block';
  document.getElementById("mainPage").style.display = 'none';

  // Salva o Excel automaticamente
  saveExcel();

}



// Voltar para página principal
function goBack() {
  document.getElementById("analysePage").style.display = 'none';
  document.getElementById("mainPage").style.display = 'block';
}

// Gerar PDF
function downloadPDF() {
  const element = document.getElementById("resultTable");
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const day = String(yesterday.getDate()).padStart(2, '0');
  const month = String(yesterday.getMonth() + 1).padStart(2, '0');
  const year = yesterday.getFullYear();
  const formattedDate = `${day}-${month}-${year}`;

  const headerHTML = `
    <div style="text-align: center; font-size: 18px; font-weight: bold;">
      Tagesabschluss - ${formattedDate}
    </div><br>
  `;

  const opt = {
    margin: 0.5,
    filename: `Tagesabschluss - ${formattedDate}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' }
  };

  const pdfContent = headerHTML + element.outerHTML;
  html2pdf().from(pdfContent).set(opt).save();
}

// Enviar Email
function sendEmail() {
  const karten = ["master", "visa", "ec", "maestro", "amex"];
  const karteNamen = {
    master: "MasterCard",
    visa: "Visa",
    ec: "EC-Karte",
    maestro: "Maestro",
    amex: "American Express"
  };

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const day = String(yesterday.getDate()).padStart(2, '0');
  const month = String(yesterday.getMonth() + 1).padStart(2, '0');
  const year = yesterday.getFullYear();
  const formattedDate = `${day}-${month}-${year}`;

  let emailBody = `Hallo Alexa,\n\nAnbei sind die Differenz vom ${formattedDate}.\n\n`;
  let hasDifferences = false;

  karten.forEach(kart => {
    const eft = parseFloat(document.querySelector(`[name=eft_${kart}]`).value) || 0;
    const ecg = parseFloat(document.querySelector(`[name=ecg_${kart}]`).value) || 0;
    const protel = parseFloat(document.querySelector(`[name=protel_${kart}]`).value) || 0;
    const sum = eft + ecg;
    const diff = (sum - protel).toFixed(2);

    if (Math.abs(diff) > 0.009) {
      emailBody += `${karteNamen[kart]}: ${diff} €\n`;
      hasDifferences = true;
    }
  });

  // Adicionar a "Differenz" do Merchant ao corpo do e-mail
  const merchantInputs = document.querySelectorAll('#merchantInputs input');
  const protelMerchant = parseFloat(document.getElementById('merchantProtel').value) || 0;

  const merchantValues = Array.from(merchantInputs).map(input => parseFloat(input.value) || 0);
  const totalMerchant = merchantValues.reduce((sum, val) => sum + val, 0);
  const merchantDiff = (totalMerchant - protelMerchant).toFixed(2);

  if (Math.abs(merchantDiff) > 0.009) {
    emailBody += `Merchant: ${merchantDiff} €\n`;
    hasDifferences = true;
  }

  if (hasDifferences) {
    emailBody += `\n\n\nLiebe Grüße\n\nHigor`;
    const subject = `Tagesabschluss - Differenz - ${formattedDate}`;
    const mailtoLink = `mailto:alexa.bistricky@harbr.de?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;
    window.location.href = mailtoLink;
  } else {
    alert("Es gibt keine Differenzen zu senden.");
  }
}




// Salvar Excel
function saveExcel() {
  const table = document.querySelector("#resultTable table");
  const ws = XLSX.utils.table_to_sheet(table);

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const day = String(yesterday.getDate()).padStart(2, '0');
  const month = String(yesterday.getMonth() + 1).padStart(2, '0');
  const year = yesterday.getFullYear();
  const dateString = `${day}-${month}-${year}`;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, `Tagesabschluss`);

  const filename = `Tagesabschluss_${dateString}.xlsx`;
  XLSX.writeFile(wb, filename);

  // Salva no histórico (se quiser)
  const historyContainer = document.getElementById("historyList");
  if (historyContainer) {
    const div = document.createElement("div");
    div.innerHTML = `Bericht vom <b>${dateString}</b> gespeichert.`;
    historyContainer.appendChild(div);
  }
}

// Exibir Histórico (pode personalizar)
function showHistory() {
  alert("Função de histórico em desenvolvimento. Em breve disponível.");
}

function addMerchantValue() {
  const container = document.getElementById('merchantInputs');
  const inputWrapper = document.createElement('div');
  inputWrapper.style.display = 'flex';
  inputWrapper.style.alignItems = 'center';
  inputWrapper.style.marginBottom = '5px';
  inputWrapper.style.gap = '10px';

  const input = document.createElement('input');
  input.type = 'number';
  input.step = '0.01';
  input.style.width = '100px';
  input.oninput = updateMerchantSum;

  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = 'Löschen';
  deleteBtn.style.backgroundColor = '#dc3545'; // vermelho suave
  deleteBtn.style.color = '#fff';
  deleteBtn.style.border = 'none';
  deleteBtn.style.padding = '4px 8px';
  deleteBtn.style.borderRadius = '6px';
  deleteBtn.style.cursor = 'pointer';
  deleteBtn.onclick = function () {
    container.removeChild(inputWrapper);
    updateMerchantSum();
  };

  inputWrapper.appendChild(input);
  inputWrapper.appendChild(deleteBtn);
  container.appendChild(inputWrapper);
}


function updateMerchantSum() {
  const inputs = document.querySelectorAll('#merchantInputs input[type="number"]');
  let sum = 0;
  inputs.forEach(input => {
    const val = parseFloat(input.value);
    if (!isNaN(val)) sum += val;
  });

  document.getElementById('merchantSum').textContent = sum.toFixed(2);
  checkMerchantDifference();
}

function checkMerchantDifference() {
  const inputs = document.querySelectorAll("#merchantInputs input");
  let sum = 0;
  inputs.forEach(input => {
    sum += parseFloat(input.value) || 0;
  });

  document.getElementById("merchantSum").textContent = sum.toFixed(2);

  const protel = parseFloat(document.getElementById("merchantProtel").value) || 0;
  const diff = (sum - protel).toFixed(2);
  const diffElement = document.getElementById("merchantDiff");

  diffElement.textContent = diff;
  diffElement.style.color = Math.abs(diff) > 0.01 ? 'red' : 'green';
}






  
