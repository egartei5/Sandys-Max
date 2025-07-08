function showImage(sliderId, index) {
  const slider = document.getElementById(sliderId);
  const images = slider.querySelectorAll("img");

  images.forEach((img, i) => {
    img.classList.remove("active");
    if (i === index) {
      img.classList.add("active");
    }
  });
}

function getCurrentImage(sliderId) {
  const slider = document.getElementById(sliderId);
  const activeImage = slider.querySelector("img.active");
  if (activeImage) {
    return {
      src: activeImage.src,
      color: activeImage.alt || "Unknown Color"
    };
  }
  return { src: "", color: "Unknown Color" };
}
