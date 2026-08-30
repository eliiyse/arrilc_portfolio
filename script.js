const $ = (s, p = document) => p.querySelector(s);
const $$ = (s, p = document) => Array.from(p.querySelectorAll(s));

window.addEventListener("load", () => {
  const loaderChars = $$(".loader-char");
  const loaderSub = $("#loaderSub");
  const loaderLineTop = $("#loaderLineTop");
  const loaderLineBottom = $("#loaderLineBottom");
  const corners = $$(".loader-corner");
  const loaderOverlay = $("#loaderOverlay");
  const loaderProgress = $("#loaderProgress");
  const mainContent = $("#mainContent");

  setTimeout(() => {
    loaderLineTop.classList.add("expand");
    loaderLineBottom.classList.add("expand");
    corners.forEach((c) => c.classList.add("show"));
  }, 100);

  loaderChars.forEach((char, i) => {
    setTimeout(
      () => {
        char.classList.add("show");
        setTimeout(() => char.classList.add("fill"), 400);
      },
      200 + i * 80,
    );
  });

  setTimeout(() => loaderSub.classList.add("show"), 1000);

  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.random() * 15;
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);
      setTimeout(() => {
        loaderOverlay.classList.add("exit");
        mainContent.classList.add("visible");
        setTimeout(() => loaderOverlay.classList.add("gone"), 1000);
      }, 400);
    }
    loaderProgress.style.width = progress + "%";
  }, 120);
});

const clock = $("#clock");
function updateClock() {
  const now = new Date();
  clock.textContent = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
}
updateClock();
setInterval(updateClock, 1000);

const nav = $("#mainNav");
const scrollProgress = $("#scrollProgress");
const backToTop = $("#backToTop");

window.addEventListener("scroll", () => {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  scrollProgress.style.width = (scrollTop / docHeight) * 100 + "%";
  nav.classList.toggle("scrolled", scrollTop > 60);
  backToTop.classList.toggle("visible", scrollTop > 400);
});

backToTop.addEventListener("click", () =>
  window.scrollTo({ top: 0, behavior: "smooth" }),
);

$("#invertBtn").addEventListener("click", () =>
  document.body.classList.toggle("inverted"),
);

const cursor = $("#cursor");
const cursorTrail = $("#cursorTrail");
let mouseX = 0,
  mouseY = 0,
  trailX = 0,
  trailY = 0;

window.addEventListener("mousemove", (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursor.style.transform = `translate(${mouseX}px,${mouseY}px) translate(-50%,-50%)`;
  cursorTrail.classList.add("active");
});

(function animateTrail() {
  trailX += (mouseX - trailX) * 0.15;
  trailY += (mouseY - trailY) * 0.15;
  cursorTrail.style.transform = `translate(${trailX}px,${trailY}px) translate(-50%,-50%)`;
  requestAnimationFrame(animateTrail);
})();

document.addEventListener("mouseleave", () =>
  cursorTrail.classList.remove("active"),
);
$$("[data-hover]").forEach((el) => {
  el.addEventListener("mouseenter", () => cursor.classList.add("hover"));
  el.addEventListener("mouseleave", () => cursor.classList.remove("hover"));
});
document.addEventListener("mousedown", () => cursor.classList.add("click"));
document.addEventListener("mouseup", () => cursor.classList.remove("click"));

const soundToggle = $("#soundToggle");
let isMuted = false,
  audioContext;
function initAudio() {
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
}
function playSound(type) {
  if (isMuted || !audioContext) return;
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  osc.connect(gain);
  gain.connect(audioContext.destination);
  if (type === "hover") {
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.01, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      audioContext.currentTime + 0.05,
    );
  } else {
    osc.frequency.value = 440;
    gain.gain.setValueAtTime(0.02, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      audioContext.currentTime + 0.1,
    );
  }
  osc.start(audioContext.currentTime);
  osc.stop(audioContext.currentTime + 0.1);
}
soundToggle.addEventListener("click", () => {
  if (!audioContext) initAudio();
  isMuted = !isMuted;
  soundToggle.classList.toggle("muted");
  soundToggle.classList.add("ripple");
  setTimeout(() => soundToggle.classList.remove("ripple"), 500);
});
$$("[data-sound]").forEach((el) => {
  el.addEventListener("mouseenter", () => playSound(el.dataset.sound));
  el.addEventListener("click", () => playSound("click"));
});

const navLinks = $$(".nav-link");
const sectionMap = [
  { id: "about", link: document.querySelector('.nav-link[href="#about"]') },
  { id: "archive", link: document.querySelector('.nav-link[href="#archive"]') },
  {
    id: "contactSection",
    link: document.querySelector('.nav-link[href="#contactSection"]'),
  },
];
const scrollSpy = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        navLinks.forEach((l) => l.classList.remove("active"));
        const match = sectionMap.find((s) => s.id === entry.target.id);
        if (match && match.link) match.link.classList.add("active");
      }
    });
  },
  { threshold: 0.15, rootMargin: "-80px 0px -45% 0px" },
);
sectionMap.forEach((s) => {
  const el = document.getElementById(s.id);
  if (el) scrollSpy.observe(el);
});
navLinks.forEach((link) => {
  link.addEventListener("click", (e) => {
    navLinks.forEach((l) => l.classList.remove("active"));
    link.classList.add("active");
  });
});

const galleryItems = $$(".gallery-item");
const lightboxOverlay = $("#lightboxOverlay");
const lightboxImg = $("#lightboxImg");
const lightboxCounter = $("#lightboxCounter");
const lightboxClose = $("#lightboxClose");
const lightboxPrev = $("#lightboxPrev");
const lightboxNext = $("#lightboxNext");
const modalClose = $("#modalClose");
let currentImageIndex = 0;
let lightboxMode = "gallery";

galleryItems.forEach((item, i) => {
  item.addEventListener("click", () => {
    lightboxMode = "gallery";
    currentImageIndex = i;
    updateLightbox();
    showLightboxArrows(true);
    lightboxOverlay.classList.add("active");
  });
});

function updateLightbox() {
  const img = galleryItems[currentImageIndex].querySelector("img");
  lightboxImg.src = img.src;
  lightboxCounter.textContent = `${String(currentImageIndex + 1).padStart(2, "0")} / ${String(galleryItems.length).padStart(2, "0")}`;
}

function showLightboxArrows(show) {
  const method = show ? "remove" : "add";
  lightboxPrev.classList[method]("hidden-nav");
  lightboxNext.classList[method]("hidden-nav");
}

function openStandaloneLightbox(src) {
  lightboxMode = "standalone";
  lightboxImg.src = src;
  lightboxCounter.textContent = "01 / 01";
  showLightboxArrows(false);
  if (modalClose) modalClose.style.visibility = "hidden";
  lightboxOverlay.classList.add("active");
}

function closeLightbox() {
  lightboxOverlay.classList.remove("active");
  if (modalClose) modalClose.style.visibility = "";
}

lightboxClose.addEventListener("click", (e) => {
  e.stopPropagation();
  closeLightbox();
});
lightboxOverlay.addEventListener("click", (e) => {
  if (e.target === lightboxOverlay) closeLightbox();
});
document.addEventListener("keydown", (e) => {
  if (!lightboxOverlay.classList.contains("active")) return;
  if (e.key === "Escape") closeLightbox();
  if (lightboxMode === "gallery") {
    if (e.key === "ArrowLeft") lightboxPrev.click();
    if (e.key === "ArrowRight") lightboxNext.click();
  }
});
lightboxPrev.addEventListener("click", () => {
  currentImageIndex =
    (currentImageIndex - 1 + galleryItems.length) % galleryItems.length;
  updateLightbox();
});
lightboxNext.addEventListener("click", () => {
  currentImageIndex = (currentImageIndex + 1) % galleryItems.length;
  updateLightbox();
});

const folderData = {
  quiz: {
    name: "Quiz",
    files: 1,
    projects: [
      {
        name: "QUIZ 1",
        desc: "Online assessment / perfect score of 20/20 on IT fundamentals.",
        img: "https://drive.google.com/thumbnail?id=1s3DTeDG95bFvjOkBrdXYLhXecp-dEcwD&sz=w1920",
        tag: "Online Quiz",
        lightbox: true,
      },
    ],
  },
  exams: { name: "Exams", files: 0, projects: [] },
  laboratory: {
    name: "Laboratory",
    files: 1,
    projects: [
      {
        name: "VM SETUP: UBUNTU INSTALLATION",
        desc: "Oracle VM VirtualBox setup — Ubuntu 26.04 Desktop, 4GB RAM, 4 CPU cores, 100GB dynamic disk.",
        img: "https://drive.google.com/thumbnail?id=1Evq-TPJ3IwnErv39EKgTemqeO0MIRYUq&sz=w1000",
        tag: "Virtualization",
        pdf: true,
        link: "https://drive.google.com/file/d/1mtuyw7eCEgUSbftoBHFXAFwSZSVsD5mQ/preview",
      },
    ],
  },
  projects: {
    name: "Projects",
    files: 6,
    projects: [
      {
        name: "BLOOMING INTERACTIVE FLOWER",
        desc: "TouchDesigner / generative flower that blooms through hand interaction.",
        img: "https://drive.google.com/thumbnail?id=18jhfNMeuhyleGUlN_bqmGNjDkcHMwjZ_&sz=w1000",
        tag: "TouchDesigner",
        live: false,
      },
      {
        name: "WISPY PARTICLES",
        desc: "TouchDesigner / flowing particle system playing in real time.",
        img: "https://drive.google.com/thumbnail?id=1jyeOr9mEq_lw6DMx7TcLPpmh1fn9G99h&sz=w1000",
        tag: "TouchDesigner",
        live: false,
      },
      {
        name: "FINGER TRACKING",
        desc: "Computer vision / hand landmark detection and skeletal visualization.",
        img: "https://drive.google.com/thumbnail?id=1jU7oDp2Q497vkYnbfcEZG9NizZuJDR2p&sz=w1000",
        tag: "Computer Vision",
        live: false,
      },
      {
        name: "CALCUNIELI",
        desc: "Web app / a fun and simple calculation project.",
        img: "https://drive.google.com/thumbnail?id=1FqYhQkZsBwxTAZ1DJD43wogK8mucVmrJ&sz=w1000",
        tag: "Web App",
        live: true,
        link: "https://calcunieli.vercel.app/",
      },
      {
        name: "POMODORO",
        desc: "Web app / focus timer with session tracking, streak counter, and break management.",
        img: "https://drive.google.com/thumbnail?id=1AF634MPS43E_RIQ_67bzOJtfeOxr_1_F&sz=w1000",
        tag: "Web App",
        live: true,
        link: "https://arrilrj.github.io/pomodoro/",
      },
      {
        name: "TTPD STORYTELLING",
        desc: "Web project / interactive storytelling experience with dynamic visuals and narrative flow.",
        img: "https://drive.google.com/thumbnail?id=1CN1qSjIygaJ4k6Y_JteGwjJQPvkhR0ZC&sz=w1000",
        tag: "Web App",
        live: true,
        link: "https://arrilrj.github.io/TTPD-storytelling/",
      },
    ],
  },
};

const modalOverlay = $("#modalOverlay");
const modalBody = $("#modalBody");

$$(".folder-item").forEach((item) => {
  const folderKey = item.dataset.folder;
  const data = folderData[folderKey];

  item.addEventListener("mouseenter", () => {
    const fileWord = data.files === 1 ? "file" : "files";
    $("#previewName").textContent = data.name;
    $("#previewFiles").textContent = `${data.files} ${fileWord} compiled`;
    $("#previewPanel").classList.add("active");
  });
  item.addEventListener("mouseleave", () =>
    $("#previewPanel").classList.remove("active"),
  );

  item.addEventListener("click", () => {
    let html = `<div class="modal-header"><div><div class="modal-folder-name">${data.name}</div><div class="modal-meta">Folder 0${Object.keys(folderData).indexOf(folderKey) + 1} — BSIT 3B</div></div></div>`;

    if (data.projects.length > 0) {
      const singleClass =
        data.projects.length === 1 ? " modal-projects-single" : "";
      html += `<div class="modal-projects${singleClass}">`;
      data.projects.forEach((p) => {
        const isClickable = p.live || p.pdf || p.lightbox;
        const liveBadge = p.live
          ? '<div class="modal-project-live"><span class="live-dot"></span>Live</div>'
          : "";
        const pdfBadge = p.pdf
          ? '<div class="modal-project-pdf-badge"><i data-lucide="file-text"></i> PDF</div>'
          : "";
        const arrow = isClickable
          ? '<div class="modal-project-arrow"><i data-lucide="arrow-up-right"></i></div>'
          : "";
        let link, target;
        if (p.live || p.pdf) {
          link = p.link;
          target = 'target="_blank" rel="noopener noreferrer"';
        } else if (p.lightbox) {
          link = "#";
          target = `data-lightbox-src="${p.img}"`;
        } else {
          link = "#";
          target = 'onclick="return false;" style="cursor: default;"';
        }
        let visualHtml;
        if (p.pdf && !p.img) {
          visualHtml = `<div class="modal-project-pdf-placeholder"><div class="modal-project-pdf-icon"><i data-lucide="file-text"></i></div><div class="modal-project-pdf-label">PDF Document</div></div>`;
        } else {
          visualHtml = `<img src="${p.img}" class="modal-project-img" alt="${p.name}">`;
        }
        html += `<a href="${link}" class="modal-project" ${target} data-hover data-sound="click">${visualHtml}<div class="modal-project-overlay"><div class="modal-project-tag">${p.tag}</div><div class="modal-project-name">${p.name}</div><div class="modal-project-desc">${p.desc}</div></div>${arrow}${liveBadge}${pdfBadge}</a>`;
      });
      html += `</div><div class="modal-soon"><div class="modal-soon-dot"></div><div class="modal-soon-text">More projects coming soon...</div></div>`;
    } else {
      html += `<div class="modal-empty"><div class="modal-status-box"><div class="modal-status-dot"></div><div class="modal-status-text">No files uploaded yet. Content will be added as the semester progresses.</div></div><div class="modal-slots"><div class="modal-slot">+</div><div class="modal-slot">+</div><div class="modal-slot">+</div></div><div class="modal-hint">This folder is currently empty. Check back later for updates regarding ${data.name}.</div></div>`;
    }

    modalBody.innerHTML = html;
    modalOverlay.classList.add("active");
    lucide.createIcons();

    modalBody.querySelectorAll("[data-lightbox-src]").forEach((el) => {
      el.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        openStandaloneLightbox(el.dataset.lightboxSrc);
      });
    });
  });
});

modalClose.addEventListener("click", () =>
  modalOverlay.classList.remove("active"),
);
modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) modalOverlay.classList.remove("active");
});

const scrambleChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
$$("[data-scramble]").forEach((el) => {
  const originalText = el.textContent;
  let interval = null;
  el.addEventListener("mouseenter", () => {
    let iteration = 0;
    clearInterval(interval);
    interval = setInterval(() => {
      el.textContent = originalText
        .split("")
        .map((letter, idx) => {
          if (idx < iteration) return originalText[idx];
          if (letter === " ") return " ";
          return scrambleChars[
            Math.floor(Math.random() * scrambleChars.length)
          ];
        })
        .join("");
      if (iteration >= originalText.length) clearInterval(interval);
      iteration += 1 / 3;
    }, 40);
  });
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("visible");
    });
  },
  { threshold: 0.1 },
);
$$(".reveal").forEach((el) => revealObserver.observe(el));

const toast = $("#toast");
$$(".contact-copy-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    navigator.clipboard.writeText(btn.dataset.copy).then(() => {
      btn.classList.add("copied");
      toast.textContent = `Copied: ${btn.dataset.copy}`;
      toast.classList.add("show");
      setTimeout(() => {
        btn.classList.remove("copied");
        toast.classList.remove("show");
      }, 2000);
    });
  });
});

const heroDecorCircle = $(".hero-decor-circle");
const heroDecorRect = $(".hero-decor-rect");
$("#about").addEventListener("mousemove", (e) => {
  const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
  const x = (e.clientX - left) / width - 0.5;
  const y = (e.clientY - top) / height - 0.5;
  heroDecorCircle.style.transform = `translate(${x * 30}px,${y * 30}px)`;
  heroDecorRect.style.transform = `translate(${x * -20}px,${y * -20}px)`;
});

lucide.createIcons();
