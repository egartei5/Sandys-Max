// ✅ Add to Cart Function with Color Support
function addToCart(productName, price, imageInfo = { image: "", color: "Unknown" }) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  // Check if same product with same color already exists
  const existingItem = cart.find(item => item.name === productName && item.color === imageInfo.color);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      name: productName,
      price: price,
      quantity: 1,
      image: imageInfo.image,
      color: imageInfo.color
    });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  alert(`${productName} (${imageInfo.color}) added to cart!`);
}

// ✅ Display Cart Items on cart.html
document.addEventListener("DOMContentLoaded", function () {
  const cartContainer = document.getElementById("cart-items");
  const cartTotal = document.getElementById("cart-total");

  if (cartContainer && cartTotal) {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    if (cart.length === 0) {
      cartContainer.innerHTML = "<p>Your cart is empty.</p>";
      cartTotal.textContent = "0.00";
      return;
    }

    let total = 0;
    cartContainer.innerHTML = "";

    cart.forEach((item, index) => {
      total += item.price * item.quantity;
      const div = document.createElement("div");
      div.className = "cart-item";
      div.innerHTML = `
        <img src="${item.image}" alt="${item.name}" />
        <div class="item-info">
          <strong>${item.name}</strong><br />
          <em>Color: ${item.color}</em><br />
          $${item.price} x 
          <input type="number" value="${item.quantity}" min="1" class="quantity-input" onchange="updateQuantity(${index}, this.value)">
          <button onclick="removeItem(${index})">Remove</button>
        </div>
      `;
      cartContainer.appendChild(div);
    });

    cartTotal.textContent = total.toFixed(2);
  }
});

// ✅ Update Quantity
function updateQuantity(index, quantity) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart[index].quantity = parseInt(quantity);
  localStorage.setItem("cart", JSON.stringify(cart));
  location.reload();
}

// ✅ Remove Item
function removeItem(index) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  location.reload();
}

// ✅ Clear Cart
function clearCart() {
  localStorage.removeItem("cart");
  location.reload();
}
