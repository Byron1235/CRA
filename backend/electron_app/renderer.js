const XLSX = require("xlsx");
const path = require("path");

// ——— 0) Nombre de hoja ———
const LIBROS_SHEET = "CATALOGO";

// ——— 1) Nodos del DOM ———
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
const btnEliminar      = document.getElementById("btn-eliminar");
const btnEditar        = document.getElementById("btn-editar");
const btnSubmit        = document.getElementById("btn-submit");
const inputIdLibro     = document.getElementById("id_libro");

const confirmModal = document.getElementById("confirmModal");
const confirmYes = document.getElementById("confirmYes");
const confirmNo = document.getElementById("confirmNo");

btnEliminar.addEventListener("click", () => {
  const id = formLibro.querySelector("#id_libro").value.trim();

  if (!id) {
    showToast("Ingresa un ID válido");
    return;
  }

  // Guardamos el ID temporalmente para usarlo en el botón “Sí”
  confirmModal.dataset.id = id;

  // Mostrar modal
  confirmModal.style.display = "flex";
});
confirmYes.addEventListener("click", () => {
  const id = confirmModal.dataset.id;
  const index = data.findIndex(libro => libro.ID_LIBRO === id);

  if (index === -1) {
    showToast("Libro no encontrado.");
    confirmModal.style.display = "none";
    return;
  }

  data.splice(index, 1);

  const newSheet = XLSX.utils.json_to_sheet(data, { skipHeader: false });
  wb.Sheets[LIBROS_SHEET] = newSheet;
  XLSX.writeFile(wb, filePath);

  formLibro.reset();
  renderTable();
  btnSubmit.textContent = "Agregar";

  showToast("Libro eliminado correctamente.");
  confirmModal.style.display = "none";
});




confirmNo.addEventListener("click", (e) => {
  e.preventDefault(); // previene cualquier comportamiento por defecto
  confirmModal.style.display = "none";
});



// ——— 2) Función Toast ———
function showToast(message, duration = 3000) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), duration);
}

// ——— 3) Leer datos ———
const wb    = XLSX.readFile(filePath);
const ws    = wb.Sheets[LIBROS_SHEET];
let data    = XLSX.utils.sheet_to_json(ws).filter(r =>
  Object.values(r).some(v => v !== null && v !== undefined && v !== "")
);

// ——— 4) Renderizar tabla ———
function renderTable() {
  tablaBody.innerHTML = "";
  data.forEach(row => {
    const tr = document.createElement("tr");
    ["ID_LIBRO", "TITULO", "AUTOR", "EDITORIAL", "PROCEDENCIA"].forEach(f => {
      const td = document.createElement("td");
      td.textContent = row[f] || "";
      tr.appendChild(td);
    });
    tablaBody.appendChild(tr);
  });
}
renderTable();

// ——— 5) Búsqueda y detalle ———
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

// ——— 6) Detectar si ID ya existe y cambiar texto del botón ———
inputIdLibro.addEventListener("input", () => {
  const id = inputIdLibro.value.trim();
  const existe = data.some(r => r.ID_LIBRO === id);
  btnSubmit.textContent = existe ? "Guardar" : "Agregar";
});

// ——— 7) Envío formulario ———
formLibro.addEventListener("submit", e => {
  e.preventDefault();

  const nuevo = {
    ID_LIBRO:    formLibro.querySelector("#id_libro").value,
    TITULO:      formLibro.querySelector("#titulo").value,
    AUTOR:       formLibro.querySelector("#autor").value,
    EDITORIAL:   formLibro.querySelector("#editorial").value,
    PROCEDENCIA: formLibro.querySelector("#procedencia").value,
  };

  const index = data.findIndex(r => r.ID_LIBRO === nuevo.ID_LIBRO);
  if (index !== -1) {
    data[index] = nuevo;
    showToast("Libro editado correctamente.");
  } else {
    data.push(nuevo);
    showToast("Libro agregado correctamente.");
  }

  const newSheet = XLSX.utils.json_to_sheet(data, { skipHeader: false });
  wb.Sheets[LIBROS_SHEET] = newSheet;
  XLSX.writeFile(wb, filePath);

  formLibro.reset();
  renderTable();
  btnSubmit.textContent = "Agregar";
});

// ——— 8) Botón Eliminar por ID ———

inputIdLibro.addEventListener("input", () => {
  const id = inputIdLibro.value.trim();
  const libro = data.find(r => r.ID_LIBRO === id);

  if (libro) {
    // Si el libro existe, rellena inputs con sus datos
    formLibro.querySelector("#titulo").value      = libro.TITULO || "";
    formLibro.querySelector("#autor").value       = libro.AUTOR || "";
    formLibro.querySelector("#editorial").value   = libro.EDITORIAL || "";
    formLibro.querySelector("#procedencia").value = libro.PROCEDENCIA || "";
    btnSubmit.textContent = "Guardar";
  } else {
    // Si no existe, limpia inputs menos el ID
    formLibro.querySelector("#titulo").value      = "";
    formLibro.querySelector("#autor").value       = "";
    formLibro.querySelector("#editorial").value   = "";
    formLibro.querySelector("#procedencia").value = "";
    btnSubmit.textContent = "Agregar";
  }
});
// // ——— 9) Botón Editar por ID ———
// btnEditar?.addEventListener("click", () => {
//   const id = formLibro.querySelector("#id_libro").value.trim();
//   if (!id) return showToast("Ingresa un ID válido");

//   const libro = data.find(r => r.ID_LIBRO === id);
//   if (!libro) return showToast("Libro no encontrado");

//   formLibro.querySelector("#titulo").value      = libro.TITULO || "";
//   formLibro.querySelector("#autor").value       = libro.AUTOR || "";
//   formLibro.querySelector("#editorial").value   = libro.EDITORIAL || "";
//   formLibro.querySelector("#procedencia").value = libro.PROCEDENCIA || "";

//   btnSubmit.textContent = "Guardar";
// });
