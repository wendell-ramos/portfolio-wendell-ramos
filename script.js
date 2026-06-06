const windows = [...document.querySelectorAll(".window")];
const startMenu = document.querySelector("#start-menu");
const startButton = document.querySelector("#start-button");
const taskButtons = document.querySelector("#task-buttons");
const clock = document.querySelector("#clock");
const imageLightbox = document.querySelector("#image-lightbox");
const lightboxImage = imageLightbox.querySelector("img");
const lightboxCaption = imageLightbox.querySelector("figcaption");
const lightboxClose = imageLightbox.querySelector(".lightbox-close");
let topZIndex = 20;

const windowNames = {
  welcome: "Bem-vindo",
  about: "Sobre mim",
  projects: "Meus projetos",
  events: "Eventos",
  skills: "Habilidades",
  contact: "Contato",
  resume: "Currículo",
  readme: "LEIA-ME.txt"
};

function getWindow(name) {
  return document.querySelector(`[data-window="${name}"]`);
}

function bringToFront(windowElement) {
  topZIndex += 1;
  windowElement.style.zIndex = topZIndex;

  document.querySelectorAll(".task-button").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.task === windowElement.dataset.window);
  });
}

function ensureTaskButton(name) {
  let button = taskButtons.querySelector(`[data-task="${name}"]`);
  if (button) return button;

  button = document.createElement("button");
  button.type = "button";
  button.className = "task-button";
  button.dataset.task = name;
  button.textContent = windowNames[name];
  button.addEventListener("click", () => {
    const windowElement = getWindow(name);
    const isActive = button.classList.contains("is-active");

    if (isActive && !windowElement.classList.contains("is-minimized")) {
      minimizeWindow(windowElement);
    } else {
      windowElement.classList.add("is-open");
      windowElement.classList.remove("is-minimized");
      bringToFront(windowElement);
    }
  });
  taskButtons.appendChild(button);
  return button;
}

function openWindow(name) {
  const windowElement = getWindow(name);
  if (!windowElement) return;

  windowElement.classList.add("is-open");
  windowElement.classList.remove("is-minimized");
  ensureTaskButton(name);
  bringToFront(windowElement);
  closeStartMenu();
}

function closeWindow(windowElement) {
  const name = windowElement.dataset.window;
  windowElement.classList.remove("is-open", "is-minimized", "is-maximized");
  taskButtons.querySelector(`[data-task="${name}"]`)?.remove();
}

function minimizeWindow(windowElement) {
  windowElement.classList.add("is-minimized");
  taskButtons.querySelector(`[data-task="${windowElement.dataset.window}"]`)?.classList.remove("is-active");
}

function maximizeWindow(windowElement) {
  windowElement.classList.toggle("is-maximized");
  bringToFront(windowElement);
}

function closeStartMenu() {
  startMenu.classList.remove("is-open");
  startButton.classList.remove("is-active");
  startButton.setAttribute("aria-expanded", "false");
}

function toggleStartMenu() {
  const isOpen = startMenu.classList.toggle("is-open");
  startButton.classList.toggle("is-active", isOpen);
  startButton.setAttribute("aria-expanded", String(isOpen));
}

function makeDraggable(windowElement) {
  const titlebar = windowElement.querySelector(".window-titlebar");
  let offsetX = 0;
  let offsetY = 0;
  let dragging = false;

  titlebar.addEventListener("pointerdown", (event) => {
    if (event.target.closest("button") || windowElement.classList.contains("is-maximized")) return;

    dragging = true;
    offsetX = event.clientX - windowElement.offsetLeft;
    offsetY = event.clientY - windowElement.offsetTop;
    titlebar.setPointerCapture(event.pointerId);
    bringToFront(windowElement);
  });

  titlebar.addEventListener("pointermove", (event) => {
    if (!dragging) return;

    const taskbarHeight = 48;
    const maxX = Math.max(0, window.innerWidth - windowElement.offsetWidth);
    const maxY = Math.max(0, window.innerHeight - taskbarHeight - titlebar.offsetHeight);
    const nextX = Math.min(Math.max(0, event.clientX - offsetX), maxX);
    const nextY = Math.min(Math.max(0, event.clientY - offsetY), maxY);

    windowElement.style.left = `${nextX}px`;
    windowElement.style.top = `${nextY}px`;
  });

  titlebar.addEventListener("pointerup", (event) => {
    dragging = false;
    if (titlebar.hasPointerCapture(event.pointerId)) {
      titlebar.releasePointerCapture(event.pointerId);
    }
  });

  titlebar.addEventListener("dblclick", () => maximizeWindow(windowElement));
}

document.querySelectorAll("[data-open]").forEach((trigger) => {
  trigger.addEventListener("click", () => openWindow(trigger.dataset.open));
});

windows.forEach((windowElement) => {
  makeDraggable(windowElement);

  windowElement.addEventListener("pointerdown", () => bringToFront(windowElement));
  windowElement.querySelector('[data-action="close"]').addEventListener("click", () => closeWindow(windowElement));
  windowElement.querySelector('[data-action="minimize"]').addEventListener("click", () => minimizeWindow(windowElement));
  windowElement.querySelector('[data-action="maximize"]').addEventListener("click", () => maximizeWindow(windowElement));
});

startButton.addEventListener("click", (event) => {
  event.stopPropagation();
  toggleStartMenu();
});

document.addEventListener("pointerdown", (event) => {
  if (!startMenu.contains(event.target) && !startButton.contains(event.target)) {
    closeStartMenu();
  }
});

function openLightbox(photo) {
  const image = photo.querySelector("img");
  lightboxImage.src = image.src;
  lightboxImage.alt = image.alt;
  lightboxCaption.textContent = image.alt;
  imageLightbox.classList.add("is-open");
  imageLightbox.setAttribute("aria-hidden", "false");
  lightboxClose.focus();
}

function closeLightbox() {
  imageLightbox.classList.remove("is-open");
  imageLightbox.setAttribute("aria-hidden", "true");
  lightboxImage.src = "";
}

document.querySelectorAll(".timeline-photo").forEach((photo) => {
  photo.addEventListener("click", () => openLightbox(photo));
  photo.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openLightbox(photo);
    }
  });
});

lightboxClose.addEventListener("click", closeLightbox);
imageLightbox.addEventListener("click", (event) => {
  if (event.target === imageLightbox) closeLightbox();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && imageLightbox.classList.contains("is-open")) {
    closeLightbox();
  }
});

function updateClock() {
  clock.textContent = new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date());
}

function updateAge() {
  const birthDate = new Date(2005, 9, 28);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const birthdayHasPassed =
    today.getMonth() > birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());

  if (!birthdayHasPassed) age -= 1;
  document.querySelector("#current-age").textContent = age;
}

ensureTaskButton("welcome");
bringToFront(getWindow("welcome"));
updateClock();
updateAge();
setInterval(updateClock, 1000);

window.addEventListener("load", () => {
  window.setTimeout(() => {
    document.querySelector("#boot-screen").classList.add("is-hidden");
  }, 1450);
});
