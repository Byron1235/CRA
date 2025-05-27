const XLSX = require("xlsx");
const path = require("path");

// ——— Constantes de DOM ———
const filePath = path.join(__dirname, "Biblioteca.xlsx");
const LIBROS_SHEET3 = "USUARIOS";

const formUsuarios = document.getElementById("form-usuarios");
const formEliminar = document.getElementById("formEliminar");
const formEditar = document.getElementById("formEditar");

const searchInputEliminar = document.querySelector("[data-search2]");
const suggestionsListEliminar = document.querySelector("[data-suggestions2]");
const detailEliminar = document.querySelector("[data-detail2]");

const searchEditar = document.querySelector("[data-search-editar]");
const suggestionsListEditar = document.querySelector("[data-suggestions2-editar]");
const detailEditar = document.querySelector("[data-detail2-editar]");

// ——— 1) Cargar y limpiar Excel ———
const wb = XLSX.readFile(filePath);
const ws = wb.Sheets[LIBROS_SHEET3];

let usuariosData = XLSX.utils
  .sheet_to_json(ws)
  .filter((r) => Object.values(r).some((v) => v !== null && v !== undefined && v !== ""));

// ——— 2) Agregar Usuario ———
formUsuarios.addEventListener("submit", (e) => {
  e.preventDefault();
  const nuevo = {
    RUT: formUsuarios.querySelector("#rut").value,
    NOMBRE: formUsuarios.querySelector("#nombre").value,
    APELLIDO: formUsuarios.querySelector("#apellido").value,
    CURSO: formUsuarios.querySelector("#curso").value,
  };

  usuariosData.push(nuevo);
  const newSheet = XLSX.utils.json_to_sheet(usuariosData, { skipHeader: false });
  wb.Sheets[LIBROS_SHEET3] = newSheet;
  XLSX.writeFile(wb, filePath);

  formUsuarios.reset();
  alert("Usuario agregado correctamente.");
});

// ——— 3) Autocompletado para eliminar ———
searchInputEliminar.addEventListener("input", (e) => {
  const value = e.target.value.toLowerCase().trim();
  suggestionsListEliminar.innerHTML = "";

  if (value === "") {
    suggestionsListEliminar.hidden = true;
    detailEliminar.hidden = true;
    return;
  }

 const matches = usuariosData
  .filter((u) => u.RUT && u.RUT.toLowerCase().includes(value))
  .slice(0, 4); // ← Mostrar solo 4

  matches.forEach((usuario) => {
    const li = document.createElement("li");
    li.textContent = usuario.RUT;
    li.addEventListener("click", () => {
      mostrarUsuarioEliminar(usuario);
      suggestionsListEliminar.hidden = true;
    });
    suggestionsListEliminar.appendChild(li);
  });

  suggestionsListEliminar.hidden = matches.length === 0;
});

function mostrarUsuarioEliminar(usuario) {
  detailEliminar.querySelector("[data-rut]").textContent = usuario.RUT;
  detailEliminar.querySelector("[data-nombre]").textContent = usuario.NOMBRE || "";
  detailEliminar.querySelector("[data-apellido]").textContent = usuario.APELLIDO || "";
  detailEliminar.querySelector("[data-curso]").textContent = usuario.CURSO || "";

  document.getElementById("rutEliminar").value = usuario.RUT;
  detailEliminar.hidden = false;
}

// ——— 4) Eliminar Usuario ———
formEliminar.addEventListener("submit", (e) => {
  e.preventDefault();
  const rutEliminar = document.getElementById("rutEliminar").value.trim();
  const index = usuariosData.findIndex((u) => u.RUT === rutEliminar);

  if (index === -1) {
    alert("Usuario no encontrado.");
    return;
  }

  if (!confirm(`¿Seguro que deseas eliminar al usuario con RUT: ${rutEliminar}?`)) return;

  usuariosData.splice(index, 1);
  const newSheet = XLSX.utils.json_to_sheet(usuariosData, { skipHeader: false });
  wb.Sheets[LIBROS_SHEET3] = newSheet;
  XLSX.writeFile(wb, filePath);

  formEliminar.reset();
  detailEliminar.hidden = true;
  alert("Usuario eliminado correctamente.");
});

// ——— 5) Autocompletado para editar ———
searchEditar.addEventListener("input", (e) => {
  const value = e.target.value.toLowerCase().trim();
  suggestionsListEditar.innerHTML = "";

  if (value === "") {
    suggestionsListEditar.hidden = true;
    detailEditar.hidden = true;
    return;
  }

  const matches = usuariosData
  .filter((u) => u.RUT && u.RUT.toLowerCase().includes(value))
  .slice(0, 4);
  matches.forEach((usuario) => {
    const li = document.createElement("li");
    li.textContent = usuario.RUT;
    li.addEventListener("click", () => {
      mostrarUsuarioEditar(usuario);
      suggestionsListEditar.hidden = true;
    });
    suggestionsListEditar.appendChild(li);
  });

  suggestionsListEditar.hidden = matches.length === 0;
});

function mostrarUsuarioEditar(usuario) {
  detailEditar.querySelector("[data-rut]").textContent = usuario.RUT;
  detailEditar.querySelector("[data-nombre]").textContent = usuario.NOMBRE || "";
  detailEditar.querySelector("[data-apellido]").textContent = usuario.APELLIDO || "";
  detailEditar.querySelector("[data-curso]").textContent = usuario.CURSO || "";

  document.getElementById("rutEditar").value = usuario.RUT;
  document.getElementById("nombreEditar").value = usuario.NOMBRE || "";
  document.getElementById("apellidoEditar").value = usuario.APELLIDO || "";
  document.getElementById("cursoEditar").value = usuario.CURSO || "";

  detailEditar.hidden = false;
}

// ——— 6) Confirmar Edición ———
formEditar.addEventListener("submit", (e) => {
  e.preventDefault();
  const rut = document.getElementById("rutEditar").value.trim();
  const index = usuariosData.findIndex((u) => u.RUT === rut);

  if (index === -1) {
    alert("Usuario no encontrado.");
    return;
  }

  usuariosData[index] = {
    ...usuariosData[index],
    NOMBRE: document.getElementById("nombreEditar").value,
    APELLIDO: document.getElementById("apellidoEditar").value,
    CURSO: document.getElementById("cursoEditar").value,
  };

  const newSheet = XLSX.utils.json_to_sheet(usuariosData, { skipHeader: false });
  wb.Sheets[LIBROS_SHEET3] = newSheet;
  XLSX.writeFile(wb, filePath);

  formEditar.reset();
  detailEditar.hidden = true;
  alert("Usuario editado correctamente.");
});
