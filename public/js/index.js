const filter = {
  type: 0,
  size: 0,
  location: 0
}

document.getElementById("select-size").addEventListener("change", e => {
  filter.size = e.target.value;
  filterProducts();
})
document.getElementById("select-type").addEventListener("change", e => {
  filter.type = e.target.value;
  filterProducts();
})
document.getElementById("select-location").addEventListener("change", e => {
  filter.location = e.target.value;
  filterProducts();
})

async function filterProducts() {
  const res = await fetch("/products/filter", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(filter)
  });

  const json = await res.json();
  if(json.length == 0) {
    alert("Nenhum resultado!!!");
  } else {
    let products = "";
    for (let i = 0; i < json.length; i++) {
      const product = json[i];
      const {title, location, negociable, price, mode, periodicity} = product;
      const contact = product.ui.contact;
      products += `
        <a href="#" class="product">
          <div class="product-cover">
            <div class="price-negociable">
              <p class="price">
                ${price} Mt ${periodicity == "" ? "/ Venda" :  "/ " + config.periodicities.filter(p => p.id == periodicity)[0].label}
              </p>
              <p class="negociable" style="display: ${negociable ? "block" : "none"}">Negociável</p>
              <p class="contact"><i class="la la-phone"></i><span>${contact}</span></p>
            </div>
          </div>
          <div class="product-title">
            <p class="the-title">${title}</p>
            <p class="location">${config.locations.filter(l => l.id == location)[0].label}</p>
          </div>
        </a>
      `
    }

    document.getElementById("products").innerHTML = products;
  }
}

document.getElementById("btn-clear-filter").addEventListener("click", () => {
  getProducts();
});

getProducts();

async function getProducts() {
  const res = await fetch("/products");
  const json = await res.json();

  let products = "";
  for (let i = 0; i < json.data.length; i++) {
    const product = json.data[i];
    const {title, location, negociable, price, mode, periodicity} = product;
    const contact = product.ui.contact;
    products += `
      <a href="#" class="product">
        <div class="product-cover">
          <div class="price-negociable">
            <p class="price">
              ${price} Mt ${periodicity == "" ? "/ Venda" :  "/ " + config.periodicities.filter(p => p.id == periodicity)[0].label}
            </p>
            <p class="negociable" style="display: ${negociable ? "block" : "none"}">Negociável</p>
            <p class="contact"><i class="la la-phone"></i><span>${contact}</span></p>
          </div>
        </div>
        <div class="product-title">
          <p class="the-title">${title}</p>
          <p class="location">${config.locations.filter(l => l.id == location)[0].label}</p>
        </div>
      </a>
    `
  }

  document.getElementById("products").innerHTML = products;
}

// 
let sizes = ""
config.sizes.forEach(l => {
  sizes += `<option value="${l.id}">${l.label}</option>`;
})
document.getElementById("select-size").innerHTML = sizes;

let types = ""
config.types.forEach(l => {
  types += `<option value="${l.id}">${l.label}</option>`;
})
document.getElementById("select-type").innerHTML = types;

let locations = ""
config.locations.forEach(l => {
  locations += `<option value="${l.id}">${l.label}</option>`;
})
document.getElementById("select-location").innerHTML = locations;