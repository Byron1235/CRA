// rendererPrestamo.js
const XLSX = require("xlsx");
const path = require("path");

// ——— 0) Definir nombre de hoja de libros ———
const LIBROS_SHEET = "PRESTAMOS"; // ← cambia esto si tu hoja se llama distinto
const LIBROS_SHEET2 = "CATALOGO"; // ← cambia esto si tu hoja se llama distinto
const LIBROS_SHEET3 = "USUARIOS"; // ← cambia esto si tu hoja se llama distinto

//search-input (libros)
//search-input2 (rut)

// ——— 1) Rutas y nodos del DOM ———
// Cargamos el archivo .xlsx
const filePath = path.join(__dirname, "Biblioteca.xlsx");

const searchInput = document.querySelector("[data-search]");
const searchInput2 = document.querySelector("[data-search2]");
const suggestionsList = document.querySelector("[data-suggestions]");
const suggestionsList2 = document.querySelector("[data-suggestions2]");
const detailContainer = document.querySelector("[data-detail]");
const detailContainer2 = document.querySelector("[data-detail2]");
const detailTitle = detailContainer.querySelector("[data-title]");
const detailId = detailContainer.querySelector("[data-id]");
const detailAutor = detailContainer.querySelector("[data-autor]");
const detailEditorial = detailContainer.querySelector("[data-editorial]");
const detailProcedencia = detailContainer.querySelector("[data-procedencia]");
const detailRut = detailContainer2.querySelector("[data-rut]");
const detailNombre = detailContainer2.querySelector("[data-nombre]");
const detailApellido = detailContainer2.querySelector("[data-apellido]");
const detailCurso = detailContainer2.querySelector("[data-curso]");
const tablaBody = document.querySelector("#tabla tbody");
const formPrestamo = document.getElementById("form-prestamos");

// ——— 2) Cargar Workbook y datos de libros ———
const wb = XLSX.readFile(filePath);
const ws = wb.Sheets[LIBROS_SHEET];
const ws2 = wb.Sheets[LIBROS_SHEET2];
const ws3 = wb.Sheets[LIBROS_SHEET3];

let data = XLSX.utils
  .sheet_to_json(ws)
  .filter((r) =>
    Object.values(r).some((v) => v !== null && v !== undefined && v !== "")
  );

let data2 = XLSX.utils
  .sheet_to_json(ws2)
  .filter((r) =>
    Object.values(r).some((v) => v !== null && v !== undefined && v !== "")
  );
let data3 = XLSX.utils
  .sheet_to_json(ws3)
  .filter((r) =>
    Object.values(r).some((v) => v !== null && v !== undefined && v !== "")
  );

// ——— 3) Función: renderizar tabla completa ———
function renderTable() {
  tablaBody.innerHTML = "";
  data.forEach((row) => {
    const tr = document.createElement("tr");
    ["RUT", "TITULO", "ENTREGA", "DEVOLUCION"].forEach((f) => {
      const td = document.createElement("td");
      td.textContent = row[f] || "";
      tr.appendChild(td);
    });
    tablaBody.appendChild(tr);
  });
}
renderTable();


// Función para mostrar detalles opcional
function showDetail2(usuario) {
  detailRut.textContent = usuario.RUT || "";
  detailNombre.textContent = usuario.NOMBRE || "";
  detailApellido.textContent = usuario.APELLIDO || "";
  detailCurso.textContent = usuario.CURSO || "";
  detailContainer2.hidden = false;
}

// Limpiar sugerencias
function clearSuggestions2() {
  suggestionsList2.innerHTML = "";
  suggestionsList2.hidden = true;
}

// Al seleccionar un usuario
function selectSuggestion2(usuario) {
  searchInput2.value = usuario.RUT;
  clearSuggestions2();
  showDetail2(usuario); // Si quieres mostrar detalles antes de eliminar
}

// Evento input para buscar coincidencias
searchInput2.addEventListener("input", (e) => {
  const q = e.target.value.trim().toLowerCase();
  clearSuggestions2();

  if (!q) return;

  const matches = data3.filter(
    (r) =>
      (r.RUT && r.RUT.toLowerCase().includes(q)) ||
      (r.NOMBRE && r.NOMBRE.toLowerCase().includes(q))
  );

  if (matches.length === 0) {
    const li = document.createElement("li");
    li.textContent = "No hay resultados";
    suggestionsList2.appendChild(li);
    suggestionsList2.hidden = false;
    return;
  }

  matches.slice(0, 5).forEach((usuario) => {
    const li = document.createElement("li");
    li.textContent = `${usuario.RUT} - ${usuario.NOMBRE || ""} ${usuario.APELLIDO || ""}`;
    li.addEventListener("click", () => selectSuggestion2(usuario));
    suggestionsList2.appendChild(li);
  });

  suggestionsList2.hidden = false;
});

// Ocultar sugerencias al hacer clic fuera
document.addEventListener("click", (e) => {
  if (!suggestionsList2.contains(e.target) && e.target !== searchInput2) {
    clearSuggestions2();
  }
});


// ——— 4) Funciones de búsqueda/autocomplete y detalle ———
function clearSuggestions() {
  suggestionsList.innerHTML = "";
  suggestionsList.hidden = true;
}
function showDetail(libro) {
  detailTitle.textContent = libro.TITULO;
  detailId.textContent = libro.ID_LIBRO;
  detailAutor.textContent = libro.AUTOR;
  detailEditorial.textContent = libro.EDITORIAL;
  detailProcedencia.textContent = libro.PROCEDENCIA;
  detailContainer.hidden = false;
}
function selectSuggestion(libro) {
  searchInput.value = libro.TITULO
  clearSuggestions();
  showDetail(libro);
}

searchInput.addEventListener("input", (e) => {
  const q = e.target.value.trim().toLowerCase();
  clearSuggestions();
  if (!q) return;

  const matches = data2.filter(
    (r) =>
      (r.ID_LIBRO && r.ID_LIBRO.toString().toLowerCase().includes(q)) ||
      (r.TITULO && r.TITULO.toLowerCase().includes(q))
  );

  if (matches.length === 0) {
    const li = document.createElement("li");
    li.textContent = "No hay resultados";
    suggestionsList.append(li);
    suggestionsList.hidden = false;
    return;
  }

  matches.slice(0, 3).forEach((libro) => {
    const li = document.createElement("li");
    li.textContent = `${libro.TITULO} (ID: ${libro.ID_LIBRO})`;
    li.addEventListener("click", () => selectSuggestion(libro));
    suggestionsList.append(li);
  });
  suggestionsList.hidden = false;
});

document.addEventListener("click", (e) => {
  if (!suggestionsList.contains(e.target) && e.target !== searchInput) {
    clearSuggestions();
  }
});

// ——— 5) Manejo del formulario: agregar nuevo libro ———
formPrestamo.addEventListener("submit", (e) => {
  e.preventDefault();
  const nuevo = {
    RUT: formPrestamo.querySelector("#rut").value,
    TITULO: formPrestamo.querySelector("#titulo").value,
    ENTREGA: formPrestamo.querySelector("#entrega").value,
    DEVOLUCION: formPrestamo.querySelector("#devolucion").value,
  };

  data.push(nuevo);

  // 5.1) Reemplazar sólo la hoja “PRESTAMOS” en el workbook
  const newSheet = XLSX.utils.json_to_sheet(data, { skipHeader: false });
  wb.Sheets[LIBROS_SHEET] = newSheet;

  // 5.2) Guardar TODO el archivo sin perder otras hojas
  XLSX.writeFile(wb, filePath);

  // 5.3) Refrescar UI
  formPrestamo.reset();
  renderTable();

  showToast("Prestamo agregado correctamente.")
});
