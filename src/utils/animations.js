// Confetti burst
export function triggerConfetti(x, y) {
  const colors = [
    "#7f77dd",
    "#d4537e",
    "#f4c0d1",
    "#cecbf6",
    "#ffffff",
    "#fbeaf0",
  ];
  for (let i = 0; i < 30; i++) {
    const piece = document.createElement("div");
    piece.className = "confetti-piece";
    piece.style.left = `${x + (Math.random() - 0.5) * 120}px`;
    piece.style.top = `${y}px`;
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDelay = `${Math.random() * 0.3}s`;
    piece.style.animationDuration = `${0.8 + Math.random() * 0.6}s`;
    piece.style.transform = `rotate(${Math.random() * 360}deg)`;
    piece.style.width = `${6 + Math.random() * 8}px`;
    piece.style.height = `${6 + Math.random() * 8}px`;
    document.body.appendChild(piece);
    setTimeout(() => piece.remove(), 1500);
  }
}

// Ripple effect
export function addRipple(e, buttonEl) {
  const rect = buttonEl.getBoundingClientRect();
  const ripple = document.createElement("span");
  ripple.className = "ripple-circle";
  const size = Math.max(rect.width, rect.height);
  ripple.style.width = ripple.style.height = `${size}px`;
  ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
  ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
  buttonEl.appendChild(ripple);
  setTimeout(() => ripple.remove(), 700);
}
