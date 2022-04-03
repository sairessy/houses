
getProducts();

async function getProducts() {
  const res = await fetch("/userproducts");
  const json = await res.json();
  console.log(json)
  
  let products = "";
  for (let i = 0; i < json.data.length; i++) {
    const product = json.data[i];
    const {title, location, negociable, price, mode, periodicity, _id} = product;
    products += `
      <div class="product">
        <div class="product-cover">
          <div class="price-negociable" style="display: ${negociable ? "block" : "none"}">
            <p class="price">
              ${price} Mt ${periodicity == "" ? "/ Venda" :  "/ " + config.periodicities.filter(p => p.id == periodicity)[0].label}
            </p>
            <p class="negociable">Negociável</p>
          </div>
          <div class="product-controls">
            <input type="checkbox" id="check-negociable-${_id}" checked/>
            <label for="check-negociable-${_id}">Disponível</label>
            <a href="/remove/product/${_id}"><i class="la la-remove"></i></a>
            <a href="/edit/product/${_id}"><i class="la la-edit"></i></a>
          </div>
        </div>
        <div class="product-title">
          <p class="the-title">${title}</p>
          <p class="location">${config.locations.filter(l => l.id == location)[0].label}</p>
        </div>
      </div>
    `
  }

  document.getElementById("products").innerHTML = products;
}