let products = JSON.parse(localStorage.getItem("services")) || [];
const invoiceNumberContainer = document.getElementById("invoiceNumber");
const textAreaNotesContainer = document.getElementById("notes__textarea");
const serviceContainer = document.getElementById("service");
let invoiceNumber = JSON.parse(localStorage.getItem("invoice"));
let textAreaNotes = JSON.parse(localStorage.getItem("notes"));
let importedProducts = [];

// Actualizando invoiceNumber
invoiceNumberContainer.addEventListener("change", (e) => {
  localStorage.setItem("invoice", JSON.stringify(e.target.value));
});

textAreaNotesContainer.addEventListener("change", (e) => {
  localStorage.setItem("notes", JSON.stringify(e.target.value));
});

// Contenedores de servicios
const nonImportedServicesContainer =
  document.querySelector(".manual__services");
const importedServicesContainer = document.querySelector(".imported__services");

// Verificación del checkbox para importar servicios
const importServicesCheckBox = document.querySelector("#choose__service");

importServicesCheckBox.addEventListener("change", (e) => {
  if (e.target.checked) {
    if (importedProducts.length === 0) importServicesFromDrive();
    nonImportedServicesContainer.style.display = "none";
    importedServicesContainer.style.display = "block";

    toggleManualServicesContainer(true);
  } else {
    hideImportedServicesContainer();
  }
});

function toggleManualServicesContainer(disable) {
  nonImportedServicesContainer.querySelector("#price").disabled = disable;
  nonImportedServicesContainer.querySelector("#service").disabled = disable;
}

function hideImportedServicesContainer() {
  nonImportedServicesContainer.style.display = "flex";
  importedServicesContainer.style.display = "none";
  toggleManualServicesContainer(false);
}

document.addEventListener("DOMContentLoaded", function () {
  products.forEach((product, index) => {
    addProductRow(product, index, true);
  });
  invoiceNumberContainer.value = invoiceNumber;
  textAreaNotesContainer.value = textAreaNotes;
});

function addProductRow(product, index, includeDelete = true) {
  const tableBody = getProductTableBody();
  const newRow = createProductRow(product, index, includeDelete);
  tableBody.appendChild(newRow);
}

function getProductTableBody() {
  return document.getElementById("productTableBody");
}

function createProductRow(product, index, includeDelete) {
  const priceString = `${(parseFloat(product.price) * parseFloat(product.quantity)).toFixed(2)} €`;
  const newRow = document.createElement("tr");

  const descriptionCell = document.createElement("td");
  descriptionCell.textContent = product.service;

  const quantityCell = document.createElement("td");
  quantityCell.textContent = product.quantity;

  const priceCell = document.createElement("td");
  priceCell.textContent = priceString;

  newRow.appendChild(descriptionCell);
  newRow.appendChild(quantityCell);
  newRow.appendChild(priceCell);

  if (includeDelete) {
    const deleteCell = document.createElement("td");
    const deleteButton = document.createElement("button");
    deleteButton.className = "btn-delete";
    deleteButton.textContent = "Eliminar";
    deleteButton.addEventListener("click", function () {
      deleteProduct(index);
    });
    deleteCell.appendChild(deleteButton);
    newRow.appendChild(deleteCell);
  }

  return newRow;
}

function deleteProduct(index) {
  products.splice(index, 1);
  localStorage.setItem("services", JSON.stringify(products));
  updateTable();
}

function updateTable() {
  const tableBody = getProductTableBody();
  tableBody.innerHTML = ""; // Limpiar la tabla
  const fragment = document.createDocumentFragment();
  products.forEach((product, index) => {
    const newRow = createProductRow(product, index, true);
    fragment.appendChild(newRow);
  });
  tableBody.appendChild(fragment);
}

function displayImportedServices() {
  const selectElement = document.getElementById("productSelect");
  selectElement.innerHTML = "";

  if (importedProducts.length === 0) {
    console.error("No hay servicios importados disponibles.");
    return;
  }

  importedProducts.forEach((service, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.textContent = service.service;
    selectElement.appendChild(option);
  });

  serviceContainer.value = importedProducts[0].service;

  selectElement.addEventListener("change", (e) => {
    e.preventDefault();
    const selectedOptionText =
      e.target.options[e.target.selectedIndex].textContent;
    serviceContainer.value = selectedOptionText;
  });
}

document.getElementById("productForm").addEventListener("submit", function (event) {
  event.preventDefault();

  // Validar los valores del formulario
  const service = document.getElementById("service").value;
  const quantity = parseInt(document.getElementById("quantity").value);

  if (!service || isNaN(quantity) || quantity <= 0) {
    alert("Por favor, ingrese un servicio y una cantidad válida.");
    return;
  }

  // Computar el precio
  const inputPrice = parseFloat(document.getElementById("price").value);
  const priceFromInput = !isNaN(inputPrice) ? inputPrice.toFixed(2) : null;
  let price =
    priceFromInput ||
    importedProducts.find((s) => s.service === service)?.price;
  price = price ? parseFloat(price).toFixed(2) : "0.00";

  products.push({ service, quantity, price });

  // Guardar productos en localStorage
  localStorage.setItem("services", JSON.stringify(products));

  // Actualizar la tabla
  updateTable();

  // Limpiar el formulario
  resetForm();
  hideImportedServicesContainer();
});

document.getElementById("generateInvoice").addEventListener("click", function () {
  if (products.length === 0) {
    alert("No hay productos para generar una factura.");
    return;
  }

  // Redirigir a la página de facturación
  window.location.href = "https://esneidercode.github.io/invoiceUmtelkomd/invoicing/invoice.html";
 //window.location.href = "./invoicing/invoice.html";
});

async function importServicesFromDrive() {
  try {
    importServicesCheckBox.disabled = true; // Deshabilitar mientras se importa
    const response = await fetch(
      "https://docs.google.com/spreadsheets/d/1FUE6sNuwPfol23wLE_Zh2NrazKbTwKNaRa6C1hl5BCc/pub?output=csv"
    );
    if (!response.ok) {
      throw new Error("La respuesta de la red no fue exitosa");
    }
    const data = await response.text();
    const rows = data.split("\n").filter((row) => row.trim() !== "");
    const headers = rows[0].split(",").map((header) => header.trim());

    const serviceIndex = headers.indexOf("Name");
    const priceIndex = headers.indexOf("Price");

    if (serviceIndex === -1 || priceIndex === -1) {
      throw new Error("Faltan encabezados requeridos");
    }

    const newImportedProducts = rows.slice(1).map((row) => {
      const columns = parseCSVRow(row);
      const service = columns[serviceIndex].replace(/^"|"$/g, "").trim();
      let priceString = columns[priceIndex].replace("€", "").trim();

      priceString = priceString.replace(/,/g, "");
      const price = parseFloat(priceString);

      return {
        service: service,
        price: isNaN(price) ? 0 : price,
      };
    });

    importedProducts.push(...newImportedProducts);
    displayImportedServices();
  } catch (error) {
    console.error("Error al importar servicios:", error);
    alert("Hubo un problema al importar los servicios.");
  } finally {
    importServicesCheckBox.disabled = false; // Habilitar nuevamente
  }
}

function parseCSVRow(row) {
  const re = /,(?=(?:(?:[^"]*"){2})*[^"]*$)/g;
  return row.split(re).map((field) => field.replace(/^"|"$/g, "").trim());
}

function resetForm() {
  document.getElementById("service").value = "";
  document.getElementById("price").value = "";
  document.getElementById("quantity").value = "";
  document.getElementById("choose__service").checked = false;
}
