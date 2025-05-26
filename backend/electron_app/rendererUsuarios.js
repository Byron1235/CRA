// renderer.js
const XLSX = require("xlsx");
const path = require("path");

// ——— Constantes de DOM ———
const filePath = path.join(__dirname, "Biblioteca.xlsx");
const formUsuarios = document.getElementById("form-usuarios");
const LIBROS_SHEET3 = "USUARIOS"; // ← cambia esto si tu hoja se llama distinto

// ——— 1) Carga y limpieza del Excel ———
const wb = XLSX.readFile(filePath);
const ws = [LIBROS_SHEET3];
let usuariosData = XLSX.utils.sheet_to_json(ws).
filter(r => Object.values(r).some(v => v !== null && v !== undefined && v !== "")
);

// ——— 2) Renderizar tabla de usuarios ———
function renderUsuarios() {
  const tb = document.querySelector("#tabla-usuarios tbody");
  tb.innerHTML = "";
  usuariosData.forEach(row => {
    const tr = document.createElement("tr");
    ["RUT", "NOMBRE", "APELLIDO", "CURSO"].forEach(f => {
      const td = document.createElement("td");
      td.textContent = row[f] || "";
      tr.appendChild(td);
    });
    tb.appendChild(tr);
  });
}
// renderUsuarios();

// ——— 3) Manejo del formulario ———
formUsuarios.addEventListener("submit", e => {
  e.preventDefault();
  const nuevo = {
    RUT:       formUsuarios.querySelector("#rut").value,
    NOMBRE:    formUsuarios.querySelector("#nombre").value,
    APELLIDO:  formUsuarios.querySelector("#apellido").value,
    CURSO:     formUsuarios.querySelector("#curso").value,
  };
  usuariosData.push(nuevo);

  // 5.1) Reemplazar sólo la hoja “PRESTAMOS” en el workbook
  const newSheet = XLSX.utils.json_to_sheet(usuariosData, { skipHeader: false });
  wb.Sheets[LIBROS_SHEET3] = newSheet;

  // 5.2) Guardar TODO el archivo sin perder otras hojas
  XLSX.writeFile(wb, filePath);

  // Refrescar UI
  formUsuarios.reset();
  // renderUsuarios();
  alert("Usuario agregado correctamente.");
});
