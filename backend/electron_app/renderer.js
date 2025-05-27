
// renderer.js
const XLSX = require("xlsx");
const path = require("path");

// ——— 0) Definir nombre de hoja de libros ———
const LIBROS_SHEET = "CATALOGO"; // ← cambia esto si tu hoja se llama distinto

// ——— 1) Rutas y nodos del DOM ———
const filePath         = path.join(__dirname, "Biblioteca.xlsx");
const searchInput      = document.querySelector("[data-search]");
const suggestionsList  = document.querySelector("[data-suggestions]");
const detailContainer  = document.querySelector("[data-detail]");
const detailTitle      = detailContainer.querySelector("[data-title]");
const detailId         = detailContainer.querySelector("[data-id]");
const detailAutor      = detailContainer.querySelector("[data-autor]");
const detailEditorial  = detailContainer.querySelector("[data-editorial]");
const detailProcedencia= detailContainer.querySelector("[data-procedencia]");
const tablaBody        = document.querySelector("#tabla tbody");
const formLibro        = document.getElementById("form-libro");

// ——— 2) Cargar Workbook y datos de libros ———
const wb    = XLSX.readFile(filePath);
const ws    = wb.Sheets[LIBROS_SHEET];
let data     = XLSX.utils.sheet_to_json(ws)
  .filter(r => Object.values(r).some(v => v!==null && v!==undefined && v!=="")
);

// ——— 3) Función: renderizar tabla completa ———
function renderTable() {
  tablaBody.innerHTML = "";
  data.forEach(row => {
    const tr = document.createElement("tr");
    ["ID_LIBRO","TITULO","AUTOR","EDITORIAL","PROCEDENCIA"].forEach(f => {
      const td = document.createElement("td");
      td.textContent = row[f] || "";
      tr.appendChild(td);
    });
    tablaBody.appendChild(tr);
  });
}
renderTable();

// ——— 4) Funciones de búsqueda/autocomplete y detalle ———
function clearSuggestions() {
  suggestionsList.innerHTML = "";
  suggestionsList.hidden = true;
}
function showDetail(libro) {
  detailTitle.textContent        = libro.TITULO;
  detailId.textContent           = libro.ID_LIBRO;
  detailAutor.textContent        = libro.AUTOR;
  detailEditorial.textContent    = libro.EDITORIAL;
  detailProcedencia.textContent  = libro.PROCEDENCIA;
  detailContainer.hidden = false;
}
function selectSuggestion(libro) {
  clearSuggestions();
  showDetail(libro);
}

searchInput.addEventListener("input", e => {
  const q = e.target.value.trim().toLowerCase();
  clearSuggestions();
  if (!q) return;

  const matches = data.filter(r =>
    (r.ID_LIBRO && r.ID_LIBRO.toString().toLowerCase().includes(q)) ||
    (r.TITULO   && r.TITULO.toLowerCase().includes(q))
  );

  if (matches.length === 0) {
    const li = document.createElement("li");
    li.textContent = "No hay resultados";
    suggestionsList.append(li);
    suggestionsList.hidden = false;
    return;
  }

  matches.slice(0,10).forEach(libro => {
    const li = document.createElement("li");
    li.textContent = `${libro.TITULO} (ID: ${libro.ID_LIBRO})`;
    li.addEventListener("click", () => selectSuggestion(libro));
    suggestionsList.append(li);
  });
  suggestionsList.hidden = false;
});

document.addEventListener("click", e => {
  if (!suggestionsList.contains(e.target) && e.target !== searchInput) {
    clearSuggestions();
  }
});

// ——— 5) Manejo del formulario: agregar nuevo libro ———
formLibro.addEventListener("submit", e => {
  e.preventDefault();
  const nuevo = {
    ID_LIBRO:    formLibro.querySelector("#id_libro").value,
    TITULO:      formLibro.querySelector("#titulo").value,
    AUTOR:       formLibro.querySelector("#autor").value,
    EDITORIAL:   formLibro.querySelector("#editorial").value,
    PROCEDENCIA: formLibro.querySelector("#procedencia").value,
  };

  data.push(nuevo);

  // 5.1) Reemplazar sólo la hoja “CATALOGO” en el workbook
  const newSheet = XLSX.utils.json_to_sheet(data, { skipHeader: false });
  wb.Sheets[LIBROS_SHEET] = newSheet;

  // 5.2) Guardar TODO el archivo sin perder otras hojas
  XLSX.writeFile(wb, filePath);

  // 5.3) Refrescar UI
  formLibro.reset();
  renderTable();
  alert("Libro agregado correctamente.");
  

});
