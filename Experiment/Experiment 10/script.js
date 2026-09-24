const resultsBody = document.querySelector("#results-body");
const statusMessage = document.querySelector("#status");
const loaderButtons = document.querySelectorAll(".button");

function renderTable(records) {
  resultsBody.innerHTML = records.map((record) => `
    <tr>
      <td><strong>${record.name}</strong></td>
      <td>${record.prn}</td>
      <td>${record.branch}</td>
      <td>${record.semester}</td>
      <td>${record.cgpa}</td>
    </tr>
  `).join("");
}

function showStatus(message, isError = false) {
  statusMessage.textContent = message;
  statusMessage.classList.toggle("error", isError);
}

function setLoading(isLoading) {
  loaderButtons.forEach((button) => {
    button.disabled = isLoading;
  });
}

function displayRecords(records, loaderName) {
  renderTable(records);
  showStatus(`${records.length} records loaded with ${loaderName}.`);
}

async function loadWithFetch() {
  setLoading(true);
  showStatus("Loading records with fetch()...");

  try {
    const response = await fetch("data.json");
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }
    const records = await response.json();
    displayRecords(records, "fetch()");
  } catch (error) {
    showStatus(`Could not load records: ${error.message}`, true);
  } finally {
    setLoading(false);
  }
}

function loadWithJQuery() {
  setLoading(true);
  showStatus("Loading records with $.getJSON()...");

  $.getJSON("data.json")
    .done((records) => {
      displayRecords(records, "$.getJSON()");
    })
    .fail((_, __, error) => {
      showStatus(`Could not load records: ${error || "request failed"}`, true);
    })
    .always(() => {
      setLoading(false);
    });
}

document.querySelector("#fetch-button").addEventListener("click", loadWithFetch);
document.querySelector("#jquery-button").addEventListener("click", loadWithJQuery);
