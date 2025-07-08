// ✅ Get Active Image and Color
function getCurrentImage(sliderId) {
  const slider = document.getElementById(sliderId);
  const activeImg = slider.querySelector("img.active");
  return {
    image: activeImg.src,
    color: activeImg.alt || "Unknown"
  };
}

// ✅ Add to Cart Function (with color)
function addToCart(productName, price, imageData = {}) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  const existingItem = cart.find(item => item.name === productName && item.color === imageData.color);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      name: productName,
      price: price,
      quantity: 1,
      image: imageData.image,
      color: imageData.color
    });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  alert(`${productName} (${imageData.color}) added to cart!`);
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
        <img src="${item.image}" alt="${item.color}" />
        <div class="item-info">
          <strong>${item.name}</strong><br />
          Color: ${item.color}<br />
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

// ✅ Quantity and Removal Functions
function updateQuantity(index, quantity) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart[index].quantity = parseInt(quantity);
  localStorage.setItem("cart", JSON.stringify(cart));
  location.reload();
}

function removeItem(index) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  location.reload();
}

function clearCart() {
  localStorage.removeItem("cart");
  location.reload();
}
