// REEMPLAZA ESTA URL CON LA URL DE TU GOOGLE APPS SCRIPT
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx2lO5tEABYSYKS4p5Tb2OkzNaJhpTahlKQsx1IjSKLQkLoxMGofJw7Q4KVw8jqHptiaQ/exec";

document.addEventListener("DOMContentLoaded", () => {
  const steps = document.querySelectorAll(".step");
  const progressFill = document.getElementById("progress-fill");
  const stepIndicator = document.getElementById("step-indicator");
  const stepTitle = document.getElementById("step-title");

  const placaInput = document.getElementById("placa");
  const modeloSelect = document.getElementById("modelo");
  const transmisionRadios = document.querySelectorAll('input[name="transmision"]');
  const colorRadios = document.querySelectorAll('input[name="color"]');
  const celularInput = document.getElementById("celular");
  const aceptoCheck = document.getElementById("acepto-politica");

  const form = document.getElementById("etech-form");
  const btnSubmit = document.getElementById("btn-submit");
  const registroSection = document.getElementById("registro-section");
  const successSection = document.getElementById("success-section");
  const finalCarContainer = document.getElementById("final-car-container");
  const confirmPhone = document.getElementById("confirm-phone");

  let currentStep = 0;

  function formatearPlaca(raw) {
    let val = (raw || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (val.length > 3) {
      val = val.slice(0, 3) + "-" + val.slice(3, 6);
    }
    return val || "ABC-123";
  }

  function obtenerColorActual() {
    const checked = document.querySelector('input[name="color"]:checked');
    return {
      nombre: checked ? checked.value : "Verde",
      hex: checked ? checked.getAttribute("data-hex") : "#4b5842"
    };
  }

  function obtenerTransmisionActual() {
    const checked = document.querySelector('input[name="transmision"]:checked');
    return checked ? checked.value : "Automática";
  }

  function aplicarEstadoVehiculo(container, datosOverride = null) {
    const placa = datosOverride ? datosOverride.placa : formatearPlaca(placaInput.value);
    const color = datosOverride ? datosOverride.color : obtenerColorActual();
    const transmision = datosOverride ? datosOverride.transmision : obtenerTransmisionActual();
    const modelo = datosOverride ? datosOverride.modelo : modeloSelect.value;

    const svg = container.querySelector("svg");
    if (svg) {
      svg.querySelectorAll(".car-paint").forEach((el) => {
        el.setAttribute("fill", color.hex);
        el.style.fill = color.hex;
      });
      svg.querySelectorAll(".plate-text-target").forEach((textEl) => {
        textEl.textContent = placa;
      });
    }

    const modEl = container.querySelector(".spec-modelo");
    const transEl = container.querySelector(".spec-transmision");
    const colEl = container.querySelector(".spec-color");

    if (modEl) modEl.textContent = modelo;
    if (transEl) transEl.textContent = transmision;
    if (colEl) colEl.textContent = color.nombre;
  }

  function actualizarVistaPrevia() {
    const previewBox = document.querySelector("#registro-section .preview-box");
    aplicarEstadoVehiculo(previewBox);
  }

  function showStep(index) {
    steps.forEach((step, i) => {
      step.classList.toggle("active", i === index);
    });

    const stepNum = index + 1;
    const totalSteps = steps.length;
    const percent = (stepNum / totalSteps) * 100;

    progressFill.style.width = `${percent}%`;
    stepIndicator.textContent = `Paso ${stepNum} de ${totalSteps}`;
    stepTitle.textContent = steps[index].getAttribute("data-title");

    const input = steps[index].querySelector('input[type="text"], input[type="tel"]');
    if (input) setTimeout(() => input.focus(), 150);
  }

  function validateStep(index) {
    if (index === 0) {
      const err1 = document.getElementById("error-1");
      if (!aceptoCheck.checked) {
        err1.textContent = "Debes aceptar la política de manejo de datos para continuar.";
        return false;
      }
      err1.textContent = "";
    }

    if (index === 1) {
      const err2 = document.getElementById("error-2");
      const rawPlaca = placaInput.value.replace(/[^A-Za-z0-9]/g, "");
      if (rawPlaca.length < 5) {
        err2.textContent = "Ingresa una placa válida (ej: ABC123).";
        return false;
      }
      err2.textContent = "";
    }

    if (index === 4) {
      const err5 = document.getElementById("error-5");
      const cleanPhone = celularInput.value.replace(/\D/g, "");
      if (cleanPhone.length < 10) {
        err5.textContent = "Ingresa un número celular válido de al menos 10 dígitos.";
        return false;
      }
      err5.textContent = "";
    }

    return true;
  }

  document.querySelectorAll(".next-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (validateStep(currentStep)) {
        currentStep++;
        showStep(currentStep);
      }
    });
  });

  document.querySelectorAll(".prev-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (currentStep > 0) {
        currentStep--;
        showStep(currentStep);
      }
    });
  });

  form.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && currentStep < steps.length - 1) {
      e.preventDefault();
      if (validateStep(currentStep)) {
        currentStep++;
        showStep(currentStep);
      }
    }
  });

  placaInput.addEventListener("input", actualizarVistaPrevia);
  modeloSelect.addEventListener("change", actualizarVistaPrevia);
  transmisionRadios.forEach((radio) => radio.addEventListener("change", actualizarVistaPrevia));
  colorRadios.forEach((radio) => radio.addEventListener("change", actualizarVistaPrevia));

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!validateStep(currentStep)) return;

    const datosConfirmados = {
      placa: formatearPlaca(placaInput.value),
      color: obtenerColorActual(),
      transmision: obtenerTransmisionActual(),
      modelo: modeloSelect.value,
      celular: celularInput.value.trim()
    };

    const payload = {
      fecha: new Date().toLocaleString("es-CO"),
      placa: datosConfirmados.placa,
      modelo: datosConfirmados.modelo,
      transmision: datosConfirmados.transmision,
      color: datosConfirmados.color.nombre,
      celular: datosConfirmados.celular,
      aceptoPolitica: aceptoCheck.checked ? "Sí" : "No"
    };

    btnSubmit.disabled = true;
    btnSubmit.textContent = "Guardando...";

    try {
      if (!GOOGLE_SCRIPT_URL.includes("TU_ID_DE_IMPLEMENTACION")) {
        await fetch(GOOGLE_SCRIPT_URL, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      }

      const carStageClone = document.getElementById("car-stage").cloneNode(true);
      const specsClone = document.querySelector("#registro-section .specs-badge").cloneNode(true);

      finalCarContainer.innerHTML = "";
      finalCarContainer.appendChild(carStageClone);
      finalCarContainer.appendChild(specsClone);

      // Aplicar explícitamente los valores confirmados en la pantalla final
      aplicarEstadoVehiculo(finalCarContainer, datosConfirmados);

      confirmPhone.textContent = datosConfirmados.celular;

      registroSection.classList.add("hidden");
      successSection.classList.remove("hidden");
      window.scrollTo({ top: 0, behavior: "smooth" });

    } catch (error) {
      alert("Ocurrió un error al registrar tus datos. Intenta nuevamente.");
      btnSubmit.disabled = false;
      btnSubmit.textContent = "Finalizar Registro ✓";
    }
  });

  actualizarVistaPrevia();
});
