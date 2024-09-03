//Fields for computing table
const computedSumAllPricesContanier = document.getElementById(
  "computedSumAllPricesContainer"
);
const computedIvaContainer = document.getElementById("computedIvaContainer");
const totalValueContainer = document.getElementById("totalValueContainer");

const invoiceNumberElement = document.getElementById("invoice-number");
const products = JSON.parse(localStorage.getItem("services")) || [];
const invoiceNumber = JSON.parse(localStorage.getItem("invoice")) || "";
const notes = JSON.parse(localStorage.getItem("notes")) || "";
const tableBody = document.getElementById("productTableBody");
let sumAllPrices = 0.0;
let total = 0.0;
const IVA = 0.19;

document.addEventListener("DOMContentLoaded", function () {
  products.forEach((product) => {
    const newRow = document.createElement("tr");

    const serviceCell = document.createElement("td");
    serviceCell.textContent = product.service;

    const quantityCell = document.createElement("td");
    quantityCell.textContent = product.quantity;

    const priceCell = document.createElement("td");
    priceCell.textContent = `${product.price * product.quantity} €`;
    sumAllPrices += parseFloat(product.price);
    newRow.appendChild(serviceCell);
    newRow.appendChild(quantityCell);
    newRow.appendChild(priceCell);

    tableBody.appendChild(newRow);
  });

  computedIva = (sumAllPrices * IVA).toFixed(2);
  total = (parseFloat(computedIva) + sumAllPrices).toFixed(2);

  invoiceNumberElement.textContent = `Rechnung ${
    new Date().getFullYear() + "/" + invoiceNumber
  }`;

  computedSumAllPricesContanier.innerText = `${sumAllPrices.toFixed(2)} €`;
  computedIvaContainer.innerText = `${computedIva} €`;
  totalValueContainer.innerText = `${total} €`;

  //Adding notes if it is not empty
  if (notes !== ""){
    const section = document.createElement("section");
    const footer = document.querySelector(".footer");
    const strong = document.createElement('strong');
    strong.textContent = 'Bemerkungen';
    section.className = "notes";
    const p = document.createElement("p");
    p.innerHTML = notes;
    section.appendChild(strong);
    section.appendChild(p);
    footer.insertBefore(section, footer.firstChild);
  }

});

//Putting data
document.getElementById("fecha").textContent = new Date().toLocaleDateString();
