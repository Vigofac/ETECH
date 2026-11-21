// REEMPLAZA ESTA URL CON LA URL DE TU APLICACIÓN WEB DE GOOGLE APPS SCRIPT (termina en /exec)
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/TU_ID_DE_IMPLEMENTACION/exec";

document.addEventListener("DOMContentLoaded", () => {
  const steps = document.querySelectorAll(".step");
  const progressFill = document.getElementById("progress-fill");
  const stepIndicator = document.getElementById("step-indicator");
  const stepTitle = document.getElementById("step-title");

  const togglePolicyBtn = document.getElementById("toggle-policy-btn");
  const policyCollapsible = document.getElementById("policy-collapsible");
  const aceptoPolitica = document.getElementById("acepto-politica");
  const aceptoWhatsapp = document.getElementById("acepto-whatsapp");
  const btnComenzar = document.getElementById("btn-comenzar");

  const placaInput = document.getElementById("placa");
  const modeloSelect = document.getElementById("modelo");
  const transmisionRadios = document.querySelectorAll('input[name="transmision"]');
  const colorRadios = document.querySelectorAll('input[name="color"]');
  const celularInput = document.getElementById("celular");

  const form = document.getElementById("etech-form");
  const btnSubmit = document.getElementById("btn-submit");
  const registroSection = document.getElementById("registro-section");
  const successSection = document.getElementById("success-section");
  const finalCarContainer = document.getElementById("final-car-container");
  const confirmPhone = document.getElementById("confirm-phone");

  let currentStep = 0;
  let isSubmitting = false;

  // 1. Control de despliegue y guardado de la política
  if (togglePolicyBtn && policyCollapsible) {
    policyCollapsible.style.display = "none";
    togglePolicyBtn.setAttribute("aria-expanded", "false");
    togglePolicyBtn.textContent = "Leer política ▼";

    togglePolicyBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const estaGuardada = policyCollapsible.style.display === "none";
      policyCollapsible.style.display = estaGuardada ? "block" : "none";
      togglePolicyBtn.setAttribute("aria-expanded", String(estaGuardada));
      togglePolicyBtn.textContent = estaGuardada ? "Ocultar política ▲" : "Leer política ▼";
    });
  }

  // 2. Habilitar avance solo si ambas políticas están aceptadas
  function actualizarEstadoPoliticas() {
    const ambasAceptadas = Boolean(aceptoPolitica && aceptoWhatsapp && aceptoPolitica.checked && aceptoWhatsapp.checked);
    if (btnComenzar) {
      btnComenzar.disabled = !ambasAceptadas;
    }
    if (ambasAceptadas) {
      const err1 = document.getElementById("error-1");
      if (err1) err1.textContent = "";
    }
  }

  if (aceptoPolitica) aceptoPolitica.addEventListener("change", actualizarEstadoPoliticas);
  if (aceptoWhatsapp) aceptoWhatsapp.addEventListener("change", actualizarEstadoPoliticas);

  // 3. Formateo y estado del vehículo
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
    if (!container) return;

    const placa = datosOverride ? datosOverride.placa : formatearPlaca(placaInput ? placaInput.value : "");
    const color = datosOverride ? datosOverride.color : obtenerColorActual();
    const transmision = datosOverride ? datosOverride.transmision : obtenerTransmisionActual();
    const modelo = datosOverride ? datosOverride.modelo : (modeloSelect ? modeloSelect.value : "Duster E-Tech");

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

  // 4. Navegación y validaciones por paso
  function showStep(index) {
    steps.forEach((step, i) => {
      step.classList.toggle("active", i === index);
    });

    const stepNum = index + 1;
    const totalSteps = steps.length;
    const percent = (stepNum / totalSteps) * 100;

    if (progressFill) progressFill.style.width = `${percent}%`;
    if (stepIndicator) stepIndicator.textContent = `Paso ${stepNum} de ${totalSteps}`;
    if (stepTitle) stepTitle.textContent = steps[index].getAttribute("data-title") || "";

    const input = steps[index].querySelector('input[type="text"], input[type="tel"]');
    if (input) setTimeout(() => input.focus(), 150);
  }

  function validateStep(index) {
    if (index === 0) {
      const err1 = document.getElementById("error-1");
      if (!aceptoPolitica.checked || !aceptoWhatsapp.checked) {
        if (err1) err1.textContent = "Debes aceptar ambas políticas para continuar con el registro.";
        return false;
      }
      if (err1) err1.textContent = "";
    }

    if (index === 1) {
      const err2 = document.getElementById("error-2");
      const rawPlaca = (placaInput.value || "").replace(/[^A-Za-z0-9]/g, "");
      if (rawPlaca.length < 5) {
        if (err2) err2.textContent = "Ingresa una placa válida (ej: ABC123).";
        return false;
      }
      if (err2) err2.textContent = "";
    }

    if (index === 4) {
      const err5 = document.getElementById("error-5");
      const cleanPhone = (celularInput.value || "").replace(/\D/g, "");
      if (cleanPhone.length < 10) {
        if (err5) err5.textContent = "Ingresa un número celular válido de al menos 10 dígitos.";
        return false;
      }
      if (err5) err5.textContent = "";
    }

    return true;
  }

  document.querySelectorAll(".next-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (validateStep(currentStep) && currentStep < steps.length - 1) {
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

  if (form) {
    form.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && currentStep < steps.length - 1) {
        e.preventDefault();
        if (validateStep(currentStep)) {
          currentStep++;
          showStep(currentStep);
        }
      }
    });
  }

  if (placaInput) {
    placaInput.addEventListener("input", () => {
      placaInput.value = placaInput.value.toUpperCase();
      actualizarVistaPrevia();
    });
  }
  if (modeloSelect) modeloSelect.addEventListener("change", actualizarVistaPrevia);
  transmisionRadios.forEach((radio) => radio.addEventListener("change", actualizarVistaPrevia));
  colorRadios.forEach((radio) => radio.addEventListener("change", actualizarVistaPrevia));

  // 5. Envío a Google Apps Script / Google Sheets
  async function enviarAGoogleSheet(payload) {
    if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL.includes("TU_ID_DE_IMPLEMENTACION")) {
      console.warn("GOOGLE_SCRIPT_URL aún no está configurada con tu URL /exec.");
      return { skipped: true };
    }

    await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify(payload)
    });

    return { ok: true };
  }

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (isSubmitting) return;
      if (!validateStep(currentStep)) return;

      isSubmitting = true;
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
        aceptoPoliticaDatos: aceptoPolitica.checked ? "Sí" : "No",
        aceptoGrupoWhatsapp: aceptoWhatsapp.checked ? "Sí" : "No"
      };

      if (btnSubmit) {
        btnSubmit.disabled = true;
        btnSubmit.textContent = "Guardando...";
      }

      try {
        await enviarAGoogleSheet(payload);

        const carStageClone = document.getElementById("car-stage").cloneNode(true);
        const specsClone = document.querySelector("#registro-section .specs-badge").cloneNode(true);

        finalCarContainer.innerHTML = "";
        finalCarContainer.appendChild(carStageClone);
        finalCarContainer.appendChild(specsClone);

        aplicarEstadoVehiculo(finalCarContainer, datosConfirmados);

        if (confirmPhone) {
          confirmPhone.textContent = datosConfirmados.celular;
        }

        registroSection.classList.add("hidden");
        successSection.classList.remove("hidden");
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch (error) {
        console.error("Error al enviar registro:", error);
        alert("Ocurrió un error al registrar tus datos. Intenta nuevamente.");
        isSubmitting = false;
        if (btnSubmit) {
          btnSubmit.disabled = false;
          btnSubmit.textContent = "Finalizar Registro ✓";
        }
      }
    });
  }

  actualizarVistaPrevia();
  actualizarEstadoPoliticas();
});
