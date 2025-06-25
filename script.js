let pasoActual = 1;
let datosCliente = {
  nombre: "",
  cedula: "",
  placa: "",
  marca: "",
  modelo: "",
  calendario: "",
  fecha: "",
  hora: ""
};

function mostrarPaso(nuevoPaso) {
  document.querySelectorAll(".step-content").forEach((sec, i) => {
    sec.classList.toggle("active", i + 1 === nuevoPaso);
  });
  document.querySelectorAll(".step").forEach((s, i) => {
    s.classList.toggle("active", i + 1 <= nuevoPaso);
  });
  pasoActual = nuevoPaso;

  if (pasoActual === 2) renderDisponibilidad();
  if (pasoActual === 3) mostrarVistaPrevia();
  if (pasoActual === 4) confirmarCita();
}

// Botones siguiente
document.querySelectorAll(".next-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    if (pasoActual === 1) {
      datosCliente.nombre = document.getElementById("nombre").value;
      datosCliente.cedula = document.getElementById("cedula").value;
      datosCliente.placa = document.getElementById("placa").value;
      datosCliente.marca = document.getElementById("marca").value;
      datosCliente.modelo = document.getElementById("modelo").value;
      if (!datosCliente.nombre || !datosCliente.placa || !datosCliente.cedula) {
        alert("Por favor completa todos los campos.");
        return;
      }
    }
    mostrarPaso(pasoActual + 1);
  });
});

// Botones atrás
document.querySelectorAll(".back-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    mostrarPaso(pasoActual - 1);
  });
});

// Calendario
document.querySelectorAll(".calendar-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".calendar-btn").forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");
    datosCliente.calendario = btn.dataset.calendario;
  });
});

function renderDisponibilidad() {
  const tbody = document.getElementById("disponibilidad");
  tbody.innerHTML = "";
  const hoy = new Date().toISOString().split("T")[0];
  datosCliente.fecha = hoy;

  fetch(`/disponibilidad?fecha=${hoy}`)
    .then(res => res.json())
    .then(data => {
      const ocupadas = data.ocupadas || [];
      const dias = ["Lun", "Mar", "Mié", "Jue", "Vie"];
      for (let h = 9; h <= 16; h++) {
        const row = document.createElement("tr");
        row.innerHTML = `<td>${h}:00</td>`;
        dias.forEach(() => {
          const cell = document.createElement("td");
          const hora = `${h}:00`;
          if (ocupadas.includes(hora)) {
            cell.textContent = "⛔";
            cell.style.opacity = 0.3;
            cell.style.cursor = "not-allowed";
          } else {
            cell.textContent = "✔";
            cell.addEventListener("click", () => {
              document.querySelectorAll("td").forEach(td => td.classList.remove("selected"));
              cell.classList.add("selected");
              datosCliente.hora = hora;
            });
          }
          row.appendChild(cell);
        });
        tbody.appendChild(row);
      }
    });
}

function mostrarVistaPrevia() {
  const vista = document.getElementById("vista-previa");
  vista.innerHTML = `
    <p><strong>Nombre:</strong> ${datosCliente.nombre}</p>
    <p><strong>Cédula:</strong> ${datosCliente.cedula}</p>
    <p><strong>Placa:</strong> ${datosCliente.placa}</p>
    <p><strong>Marca:</strong> ${datosCliente.marca}</p>
    <p><strong>Modelo:</strong> ${datosCliente.modelo}</p>
    <p><strong>Calendario:</strong> ${datosCliente.calendario}</p>
    <p><strong>Fecha:</strong> ${datosCliente.fecha}</p>
    <p><strong>Hora:</strong> ${datosCliente.hora}</p>
  `;
}

function confirmarCita() {
  fetch("/agendar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datosCliente)
  })
    .then(res => {
      if (res.status === 409) {
        alert("Este horario ya fue tomado. Intenta otro.");
        mostrarPaso(2);
        return null;
      }
      return res.json();
    })
    .then(data => {
      if (data && data.pdf_url) {
        const link = document.getElementById("enlaceCita");
        link.value = location.origin + data.pdf_url;
        const a = document.createElement("a");
        a.href = data.pdf_url;
        a.download = "comprobante_cita.pdf";
        a.click();
      }
    });
}
