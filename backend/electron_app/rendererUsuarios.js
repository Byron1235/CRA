// renderer.js
const XLSX = require("xlsx");
const path = require("path");

// ——— Constantes de DOM ———
const filePath = path.join(__dirname, "Biblioteca.xlsx");
const formUsuarios = document.getElementById("form-usuarios");

// ——— 1) Carga y limpieza del Excel ———
const wb = XLSX.readFile(filePath);
const wsName = "USUARIOS";
const ws = wb.Sheets[wsName];
let usuariosData = XLSX.utils.sheet_to_json(ws).filter(r =>
  Object.values(r).some(c => c !== null && c !== undefined && c !== "")
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

  // Reescribir Excel
  const newWs = XLSX.utils.json_to_sheet(usuariosData, { skipHeader: false });
  const newWb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(newWb, newWs, wsName);
  XLSX.writeFile(newWb, filePath);

  // Refrescar UI
  formUsuarios.reset();
  // renderUsuarios();
  alert("Usuario agregado correctamente.");
});
