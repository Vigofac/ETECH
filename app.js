// REEMPLAZA ESTA URL CON LA URL DE TU GOOGLE APPS SCRIPT
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/TU_ID_DE_IMPLEMENTACION/exec";

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

  const previewPlaca = document.getElementById("preview-placa");
  const previewModelo = document.getElementById("preview-modelo");
  const previewTransmision = document.getElementById("preview-transmision");
  const previewColorName = document.getElementById("preview-color-name");
  const carBody = document.getElementById("car-body");

  const form = document.getElementById("etech-form");
  const btnSubmit = document.getElementById("btn-submit");
  const registroSection = document.getElementById("registro-section");
  const successSection = document.getElementById("success-section");
  const finalCarContainer = document.getElementById("final-car-container");
  const confirmPhone = document.getElementById("confirm-phone");

  let currentStep = 0;

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

    // Enfocar automáticamente el campo de texto si el paso tiene uno
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

  // Botones Siguiente y Atrás
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

  // Permitir avanzar con la tecla Enter en inputs de texto
  form.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && currentStep < steps.length - 1) {
      e.preventDefault();
      if (validateStep(currentStep)) {
        currentStep++;
        showStep(currentStep);
      }
    }
  });

  // Vista previa en tiempo real: Placa
  placaInput.addEventListener("input", () => {
    let val = placaInput.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (val.length > 3) {
      val = val.slice(0, 3) + "-" + val.slice(3, 6);
    }
    previewPlaca.textContent = val || "ABC-123";
  });

  // Vista previa en tiempo real: Modelo
  modeloSelect.addEventListener("change", () => {
    previewModelo.textContent = modeloSelect.value;
  });

  // Vista previa en tiempo real: Transmisión
  transmisionRadios.forEach((radio) => {
    radio.addEventListener("change", (e) => {
      previewTransmision.textContent = e.target.value;
    });
  });

  // Vista previa en tiempo real: Color (Verde, Gris o Beige)
  colorRadios.forEach((radio) => {
    radio.addEventListener("change", (e) => {
      carBody.setAttribute("fill", e.target.getAttribute("data-hex"));
      previewColorName.textContent = e.target.value;
    });
  });

  // Envío final hacia Google Drive
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!validateStep(currentStep)) return;

    const selectedColor = document.querySelector('input[name="color"]:checked').value;
    const selectedTransmision = document.querySelector('input[name="transmision"]:checked').value;

    const payload = {
      fecha: new Date().toLocaleString("es-CO"),
      placa: previewPlaca.textContent,
      modelo: modeloSelect.value,
      transmision: selectedTransmision,
      color: selectedColor,
      celular: celularInput.value.trim(),
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

      // Clonar el gráfico personalizado (auto + color + placa) a la pantalla final
      const carStageClone = document.getElementById("car-stage").cloneNode(true);
      const specsClone = document.querySelector(".specs-badge").cloneNode(true);
      finalCarContainer.innerHTML = "";
      finalCarContainer.appendChild(carStageClone);
      finalCarContainer.appendChild(specsClone);

      confirmPhone.textContent = payload.celular;

      registroSection.classList.add("hidden");
      successSection.classList.remove("hidden");
      window.scrollTo({ top: 0, behavior: "smooth" });

    } catch (error) {
      alert("Ocurrió un error al registrar tus datos. Intenta nuevamente.");
      btnSubmit.disabled = false;
      btnSubmit.textContent = "Finalizar Registro ✓";
    }
  });
});