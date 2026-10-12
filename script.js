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
  if (!audioContext)
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  if (audioContext.state === "suspended") audioContext.resume();
}
["pointerdown", "touchstart", "keydown", "click"].forEach((evt) =>
  window.addEventListener(evt, initAudio, { capture: true, passive: true }),
);
function playSound(type) {
  if (isMuted) return;
  initAudio();
  if (!audioContext) return;
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
  {
    id: "showcase",
    link: document.querySelector('.nav-link[href="#showcase"]'),
  },
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
const lightboxSite = $("#lightboxSite");
const lightboxCounter = $("#lightboxCounter");
const lightboxClose = $("#lightboxClose");
const lightboxPrev = $("#lightboxPrev");
const lightboxNext = $("#lightboxNext");
const modalClose = $("#modalClose");

let lightboxMode = "gallery";
let currentImageIndex = 0;
let modalGalleryImages = [];
let modalGalleryIndex = 0;

galleryItems.forEach((item, i) => {
  item.addEventListener("click", () => {
    lightboxMode = "gallery";
    currentImageIndex = i;
    updateLightbox();
    showLightboxArrows(true);
    if (modalClose) modalClose.style.visibility = "";
    lightboxOverlay.classList.add("active");
  });
});

function updateLightbox() {
  if (lightboxMode === "gallery") {
    const img = galleryItems[currentImageIndex].querySelector("img");
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt || "";
    lightboxSite.hidden = true;
    lightboxCounter.textContent = `${String(currentImageIndex + 1).padStart(2, "0")} / ${String(galleryItems.length).padStart(2, "0")}`;
  } else {
    const current = modalGalleryImages[modalGalleryIndex];
    lightboxImg.src = current.img;
    lightboxImg.alt = current.name || "";
    lightboxSite.hidden = !current.site;
    if (current.site) lightboxSite.href = current.site;
    lightboxCounter.textContent = `${String(modalGalleryIndex + 1).padStart(2, "0")} / ${String(modalGalleryImages.length).padStart(2, "0")}`;
  }
}

function showLightboxArrows(show) {
  const method = show ? "remove" : "add";
  lightboxPrev.classList[method]("hidden-nav");
  lightboxNext.classList[method]("hidden-nav");
}

function openModalGalleryLightbox(images, startIndex) {
  lightboxMode = images.length > 1 ? "modal-gallery" : "standalone";
  modalGalleryImages = images;
  modalGalleryIndex = startIndex;
  updateLightbox();
  showLightboxArrows(images.length > 1);
  if (modalClose) modalClose.style.visibility = "";
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
  if (lightboxMode === "gallery" || lightboxMode === "modal-gallery") {
    if (e.key === "ArrowLeft") lightboxPrev.click();
    if (e.key === "ArrowRight") lightboxNext.click();
  }
});
lightboxPrev.addEventListener("click", () => {
  if (lightboxMode === "gallery") {
    currentImageIndex =
      (currentImageIndex - 1 + galleryItems.length) % galleryItems.length;
  } else if (lightboxMode === "modal-gallery") {
    modalGalleryIndex =
      (modalGalleryIndex - 1 + modalGalleryImages.length) %
      modalGalleryImages.length;
  }
  updateLightbox();
});
lightboxNext.addEventListener("click", () => {
  if (lightboxMode === "gallery") {
    currentImageIndex = (currentImageIndex + 1) % galleryItems.length;
  } else if (lightboxMode === "modal-gallery") {
    modalGalleryIndex = (modalGalleryIndex + 1) % modalGalleryImages.length;
  }
  updateLightbox();
});

const folderData = {
  quiz: {
    name: "Quiz",
    soon: "More quizzes coming soon...",
    files: 6,
    projects: [
      {
        name: "QUIZ 1",
        desc: "Online assessment / perfect score of 20/20 on IT fundamentals.",
        img: "https://drive.google.com/thumbnail?id=1s3DTeDG95bFvjOkBrdXYLhXecp-dEcwD&sz=w1920",
        tag: "Online Quiz",
        lightbox: true,
      },
      {
        name: "QUIZ 2",
        desc: "Second quiz covering core IT concepts and practical application.",
        img: "https://drive.google.com/thumbnail?id=1cEEMzuc-Sro_eKPnyomDpqt_e0ObjkAU&sz=w1000",
        tag: "Online Quiz",
        pdf: true,
        lightbox: true,
        link: "https://drive.google.com/file/d/1cEEMzuc-Sro_eKPnyomDpqt_e0ObjkAU/preview",
      },
      {
        name: "QUIZ 3",
        desc: "Third quiz — advanced topics, problem-solving, and analytical questions.",
        img: "https://drive.google.com/thumbnail?id=1HY374w0XZdd6mXpzjWMMT0b3zBigYMq8&sz=w1000",
        tag: "Online Quiz",
        pdf: true,
        lightbox: true,
        link: "https://drive.google.com/file/d/1HY374w0XZdd6mXpzjWMMT0b3zBigYMq8/preview",
      },
      {
        name: "QUIZ 4",
        desc: "Online assessment / 22/25 (88%) on cloud computing and networking, with zero violations.",
        img: "https://drive.google.com/thumbnail?id=11tyTQCYiFoo7jiuZQtcEv38hmrC_1Lci&sz=w1920",
        tag: "Online Quiz",
        lightbox: true,
      },
      {
        name: "LONG QUIZ",
        desc: "Comprehensive long quiz covering multiple chapters and integrated topics.",
        img: "https://drive.google.com/thumbnail?id=1E-Ak3_LCzQSsQ_y2_Dq4nz3SR3k7Pcyp&sz=w1000",
        tag: "Long Quiz",
        pdf: true,
        lightbox: true,
        link: "https://drive.google.com/file/d/1E-Ak3_LCzQSsQ_y2_Dq4nz3SR3k7Pcyp/preview",
      },
      {
        name: "QUIZ 5",
        desc: "Perfect score (30/30) on Virtual Network Features and Networking.",
        img: "https://drive.google.com/thumbnail?id=1hMU9H3TzbL2v2kPFTM5wDU-e-Paa9Mgv&sz=w1920",
        tag: "Online Quiz",
        lightbox: true,
      },
    ],
  },
  exams: {
    name: "Exams",
    soon: "More exams coming soon...",
    files: 1,
    projects: [
      {
        name: "PRELIM EXAM",
        desc: "Preliminary examination — comprehensive coverage of all topics from the first half of the semester.",
        img: "https://drive.google.com/thumbnail?id=1k-q7sA8yj0htwLZp8SLV7VAw-R1XnXlH&sz=w1000",
        tag: "Prelim",
        pdf: true,
        link: "https://drive.google.com/file/d/1k-q7sA8yj0htwLZp8SLV7VAw-R1XnXlH/preview",
      },
    ],
  },
  laboratory: {
    name: "Laboratory",
    soon: "More laboratories coming soon...",
    files: 3,
    projects: [
      {
        name: "VM SETUP: UBUNTU INSTALLATION",
        desc: "Oracle VM VirtualBox setup — Ubuntu 26.04 Desktop, 4GB RAM, 4 CPU cores, 100GB dynamic disk.",
        img: "https://drive.google.com/thumbnail?id=1Evq-TPJ3IwnErv39EKgTemqeO0MIRYUq&sz=w1000",
        tag: "Virtualization",
        pdf: true,
        link: "https://drive.google.com/file/d/1mtuyw7eCEgUSbftoBHFXAFwSZSVsD5mQ/preview",
      },
      {
        name: "LAB ACTIVITY 2",
        desc: "Hands-on laboratory exercise — practical output documenting a step-by-step process with screenshots and documentation.",
        img: "https://drive.google.com/thumbnail?id=1AP3dxDd631Yg-ZxRgs7QBpJP1IRnv1wv&sz=w1000",
        tag: "Laboratory",
        pdf: true,
        link: "https://drive.google.com/file/d/1HemXkwY64wFxBd8ptjLzFx-j8taI2Zem/preview",
      },
      {
        name: "LAB ACTIVITY 3",
        desc: "Physical Netwrok Configuration.",
        img: "https://drive.google.com/thumbnail?id=1yiwAXTWwxiKmKgRH6oTCM2CsHASoqV_o&sz=w1920",
        tag: "Laboratory",
        lightbox: true,
      },
    ],
  },
  projects: {
    name: "Projects",
    soon: "More projects coming soon...",
    files: 7,
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
      {
        name: "COMSOC PCUD",
        desc: "Web project / a community website for COMSOC PCUD with events, announcements, transparency reports and officer profiles.",
        img: "https://drive.google.com/thumbnail?id=1WLihNYSpx7HaXYn5NKE1PMTSn6vv1BUQ&sz=w1920",
        tag: "Web App",
        live: true,
        link: "https://comsoc-pcud.infinityfreeapp.com/",
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
      let lightboxCounter = -1;
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
        if (p.lightbox) {
          lightboxCounter++;
          link = "#";
          target = `data-lightbox-index="${lightboxCounter}"`;
        } else if (p.live || p.pdf) {
          link = p.link;
          target = `target="_blank" rel="noopener noreferrer" data-preview="${p.name}"`;
        } else {
          link = "#";
          target = 'onclick="return false;" style="cursor: default;"';
        }
        let visualHtml;
        if (p.pdf && !p.img) {
          visualHtml = `<div class="modal-project-pdf-placeholder"><div class="modal-project-pdf-icon"><i data-lucide="file-text"></i></div><div class="modal-project-pdf-label">PDF Document</div></div>`;
        } else {
          visualHtml = `<img src="${p.img}" class="modal-project-img" alt="${p.name}" loading="lazy" onerror="this.closest('.modal-project').classList.add('img-fail')">`;
        }
        html += `<a href="${link}" class="modal-project" ${target} data-hover data-sound="click">${visualHtml}<div class="modal-project-overlay"><div class="modal-project-tag">${p.tag}</div><div class="modal-project-name">${p.name}</div><div class="modal-project-desc">${p.desc}</div></div>${arrow}${liveBadge}${pdfBadge}</a>`;
      });
      html += `</div><div class="modal-soon"><div class="modal-soon-dot"></div><div class="modal-soon-text">${data.soon}</div></div>`;
    } else {
      html += `<div class="modal-empty"><div class="modal-status-box"><div class="modal-status-dot"></div><div class="modal-status-text">No files uploaded yet. Content will be added as the semester progresses.</div></div><div class="modal-slots"><div class="modal-slot">+</div><div class="modal-slot">+</div><div class="modal-slot">+</div></div><div class="modal-hint">This folder is currently empty. Check back later for updates regarding ${data.name}.</div></div>`;
    }

    modalBody.innerHTML = html;
    modalOverlay.classList.add("active");
    lucide.createIcons();

    const lightboxProjects = data.projects
      .filter((p) => p.lightbox)
      .map((p) => ({ img: p.img, name: p.name, site: p.site }));
    modalBody.querySelectorAll("[data-lightbox-index]").forEach((el) => {
      el.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const idx = parseInt(el.dataset.lightboxIndex, 10);
        openModalGalleryLightbox(lightboxProjects, idx);
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

const themeMeta = document.querySelector('meta[name="theme-color"]');
function applyTheme(dark) {
  document.body.classList.toggle("inverted", dark);
  if (themeMeta) themeMeta.content = dark ? "#221a2b" : "#f8f4f6";
}
let savedTheme = null;
try {
  savedTheme = localStorage.getItem("theme");
} catch (e) {}
applyTheme(
  savedTheme
    ? savedTheme === "dark"
    : matchMedia("(prefers-color-scheme: dark)").matches,
);
$("#invertBtn").addEventListener("click", () => {
  const dark = !document.body.classList.contains("inverted");
  applyTheme(dark);
  try {
    localStorage.setItem("theme", dark ? "dark" : "light");
  } catch (e) {}
});

const menuBtn = $("#menuBtn"),
  mobileMenu = $("#mobileMenu");
function setMenu(open) {
  mobileMenu.classList.toggle("open", open);
  menuBtn.setAttribute("aria-expanded", open);
  menuBtn.innerHTML = `<i data-lucide="${open ? "x" : "menu"}"></i>`;
  lucide.createIcons();
}
menuBtn.addEventListener("click", () =>
  setMenu(!mobileMenu.classList.contains("open")),
);
$$("a", mobileMenu).forEach((a) =>
  a.addEventListener("click", () => setMenu(false)),
);

$$(".folder-item").forEach((it) => {
  it.tabIndex = 0;
  it.setAttribute("role", "button");
  it.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      it.click();
    }
  });
});

const pvOverlay = $("#previewOverlay"),
  pvFrame = $("#pvFrame"),
  pvStage = $("#pvStage"),
  pvLoading = $("#pvLoading");
let pvUrl = "";
function openPreview(name) {
  const p = Object.values(folderData)
    .flatMap((f) => f.projects)
    .find((x) => x.name === name);
  if (!p) return;
  pvUrl = p.link;
  $("#pvTitle").textContent = p.name;
  $("#pvOpen").href = p.link;
  pvStage.classList.remove("mobile");
  pvLoading.hidden = false;
  pvFrame.src = p.link;
  pvOverlay.classList.add("active");
}
function closePreview() {
  pvOverlay.classList.remove("active");
  pvFrame.src = "about:blank";
}
pvFrame.addEventListener("load", () => (pvLoading.hidden = true));
$("#pvClose").addEventListener("click", closePreview);
$("#pvReload").addEventListener("click", () => {
  pvLoading.hidden = false;
  pvFrame.src = pvUrl;
});
$("#pvDesktop").addEventListener("click", () =>
  pvStage.classList.remove("mobile"),
);
$("#pvMobile").addEventListener("click", () => pvStage.classList.add("mobile"));
modalBody.addEventListener("click", (e) => {
  const a = e.target.closest("[data-preview]");
  if (!a || e.ctrlKey || e.metaKey || e.shiftKey) return;
  e.preventDefault();
  openPreview(a.dataset.preview);
});

document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape" || lightboxOverlay.classList.contains("active"))
    return;
  if (palette.classList.contains("active")) closePalette();
  else if (chat.classList.contains("open")) setChat(false);
  else if (pvOverlay.classList.contains("active")) closePreview();
  else if (modalOverlay.classList.contains("active"))
    modalOverlay.classList.remove("active");
  else setMenu(false);
});
const palette = $("#palette");
const layers = [modalOverlay, pvOverlay, lightboxOverlay, palette];
const lockScroll = () => {
  document.body.style.overflow = layers.some((o) =>
    o.classList.contains("active"),
  )
    ? "hidden"
    : "";
};
layers.forEach((o) =>
  new MutationObserver(lockScroll).observe(o, {
    attributes: true,
    attributeFilter: ["class"],
  }),
);

const allProjects = Object.values(folderData).flatMap((f) => f.projects);
const chipsEl = $("#chips"),
  gridEl = $("#showcaseGrid");
const featured = folderData.projects.projects.filter(
  (p) => p.name !== "CALCUNIELI",
);
let activeChip = "All";

function renderShowcase() {
  const list =
    activeChip === "All"
      ? featured
      : featured.filter((p) => p.tag === activeChip);
  $("#showcaseCount").textContent =
    `${String(list.length).padStart(2, "0")} projects`;
  gridEl.innerHTML = list
    .map(
      (
        p,
      ) => `<button class="sc-card" data-name="${p.name}" data-hover data-sound="hover">
        <span class="sc-img"><img src="${p.img}" alt="${p.name}" loading="lazy" onerror="this.closest('.sc-card').classList.add('img-fail')" />${p.live ? '<span class="sc-live"><span class="live-dot"></span>Live</span>' : ""}</span>
        <span class="sc-body"><span class="sc-tag">${p.tag}</span><span class="sc-name">${p.name}</span><span class="sc-desc">${p.desc}</span>
        <span class="sc-cta">${p.live ? "Open preview" : "View image"}<i data-lucide="arrow-up-right"></i></span></span></button>`,
    )
    .join("");
  lucide.createIcons();
}
const tags = ["All", ...new Set(featured.map((p) => p.tag))];
chipsEl.innerHTML = tags
  .map(
    (t) =>
      `<button class="chip${t === "All" ? " active" : ""}" data-tag="${t}" data-hover>${t}</button>`,
  )
  .join("");
chipsEl.addEventListener("click", (e) => {
  const chip = e.target.closest(".chip");
  if (!chip) return;
  activeChip = chip.dataset.tag;
  $$(".chip", chipsEl).forEach((c) => c.classList.toggle("active", c === chip));
  renderShowcase();
});
gridEl.addEventListener("click", (e) => {
  const card = e.target.closest(".sc-card");
  if (!card) return;
  const p = featured.find((x) => x.name === card.dataset.name);
  if (p.live && !p.lightbox) openPreview(p.name);
  else
    openModalGalleryLightbox([{ img: p.img, name: p.name, site: p.site }], 0);
});
renderShowcase();

$("#contactForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const f = new FormData(e.target);
  const subject = encodeURIComponent(`Portfolio message from ${f.get("name")}`);
  const body = encodeURIComponent(
    `${f.get("message")}\n\nFrom: ${f.get("name")} (${f.get("email")})`,
  );
  location.href = `mailto:arocarlos@pcu.edu.ph?subject=${subject}&body=${body}`;
  toast.textContent = "Opening your email app…";
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2200);
  e.target.reset();
});

let touchX = 0;
lightboxOverlay.addEventListener(
  "touchstart",
  (e) => (touchX = e.changedTouches[0].clientX),
  { passive: true },
);
lightboxOverlay.addEventListener("touchend", (e) => {
  const dx = e.changedTouches[0].clientX - touchX;
  if (Math.abs(dx) > 50) (dx > 0 ? lightboxPrev : lightboxNext).click();
});

document.addEventListener("keydown", (e) => {
  if (
    e.key.toLowerCase() === "t" &&
    !e.target.closest("input, textarea") &&
    !e.ctrlKey &&
    !e.metaKey
  )
    $("#invertBtn").click();
});

const palInput = $("#palInput"),
  palList = $("#palList");
const palItems = Object.entries(folderData).flatMap(([k, f]) =>
  f.projects.map((p) => ({ k, f, p })),
);
let palMatches = [],
  palIndex = 0;
function renderPalette() {
  const q = palInput.value.trim().toLowerCase();
  palMatches = palItems.filter(
    ({ f, p }) =>
      !q || `${p.name} ${p.tag} ${p.desc} ${f.name}`.toLowerCase().includes(q),
  );
  palIndex = 0;
  palList.innerHTML = palMatches.length
    ? palMatches
        .map(
          ({ f, p }, i) =>
            `<li role="option" data-i="${i}" class="${i ? "" : "sel"}"><span class="pal-name">${p.name}</span><span class="pal-meta">${f.name} · ${p.tag}</span></li>`,
        )
        .join("")
    : '<li class="pal-empty">No matches. Try “quiz”, “lab” or “web”.</li>';
}
function markPal(i) {
  const els = $$("li[data-i]", palList);
  if (!els.length) return;
  palIndex = (i + els.length) % els.length;
  els.forEach((el, n) => el.classList.toggle("sel", n === palIndex));
  els[palIndex].scrollIntoView({ block: "nearest" });
}
function openPalette() {
  palette.classList.add("active");
  palInput.value = "";
  renderPalette();
  setTimeout(() => palInput.focus(), 50);
}
function closePalette() {
  palette.classList.remove("active");
}
function choosePal(m) {
  if (!m) return;
  closePalette();
  const { k, p } = m;
  if (p.lightbox) {
    const list = folderData[k].projects.filter((x) => x.lightbox);
    openModalGalleryLightbox(
      list.map((x) => ({ img: x.img, name: x.name, site: x.site })),
      list.indexOf(p),
    );
  } else if (p.link) openPreview(p.name);
  else $(`.folder-item[data-folder="${k}"]`).click();
}
palInput.addEventListener("input", renderPalette);
palInput.addEventListener("keydown", (e) => {
  if (e.key === "ArrowDown") {
    e.preventDefault();
    markPal(palIndex + 1);
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    markPal(palIndex - 1);
  } else if (e.key === "Enter") choosePal(palMatches[palIndex]);
});
palList.addEventListener("click", (e) => {
  const li = e.target.closest("li[data-i]");
  if (li) choosePal(palMatches[+li.dataset.i]);
});
palette.addEventListener("click", (e) => {
  if (e.target === palette) closePalette();
});
document.addEventListener("keydown", (e) => {
  const typing = /INPUT|TEXTAREA/.test(document.activeElement.tagName);
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
    e.preventDefault();
    openPalette();
  } else if (e.key === "/" && !typing) {
    e.preventDefault();
    openPalette();
  }
});

const chat = $("#chat"),
  chatBtn = $("#chatBtn"),
  chatLog = $("#chatLog"),
  chatInput = $("#chatInput"),
  chatChips = $("#chatChips"),
  eliBubble = $("#eliBubble");

const ELI = `<svg class="eli-svg" viewBox="0 0 64 64" aria-hidden="true">
<line x1="32" y1="10" x2="32" y2="17" stroke="var(--text)" stroke-width="3" stroke-linecap="round"/>
<circle class="eli-bulb" cx="32" cy="7.5" r="3.8" fill="#ff9fbd" stroke="var(--text)" stroke-width="2.4"/>
<rect x="4.5" y="26" width="7" height="11" rx="3.5" fill="#c88ea8" stroke="var(--text)" stroke-width="2.4"/>
<rect x="52.5" y="26" width="7" height="11" rx="3.5" fill="#c88ea8" stroke="var(--text)" stroke-width="2.4"/>
<rect x="18" y="46" width="28" height="14" rx="7" fill="#fff" stroke="var(--text)" stroke-width="3"/>
<circle cx="32" cy="53" r="2.8" fill="#f4739b"/>
<ellipse cx="13.5" cy="53.5" rx="4.5" ry="3.3" fill="#fff" stroke="var(--text)" stroke-width="2.4"/>
<ellipse class="eli-arm eli-arm-r" cx="50.5" cy="53.5" rx="4.5" ry="3.3" fill="#fff" stroke="var(--text)" stroke-width="2.4"/>
<rect x="9.5" y="16" width="45" height="31" rx="13" fill="#fff" stroke="var(--text)" stroke-width="3"/>
<rect x="14.5" y="21" width="35" height="21" rx="9" fill="#2a1f35"/>
<g class="eli-eyes"><ellipse class="eli-eye" cx="25" cy="31" rx="3.3" ry="4.2" fill="#ffd1e1"/><ellipse class="eli-eye" cx="39" cy="31" rx="3.3" ry="4.2" fill="#ffd1e1"/><circle cx="26" cy="29.6" r="1.2" fill="#fff"/><circle cx="40" cy="29.6" r="1.2" fill="#fff"/></g>
<path d="M28.5 36.5q3.5 3.4 7 0" fill="none" stroke="#ffd1e1" stroke-width="1.8" stroke-linecap="round"/>
<circle cx="19.5" cy="36.5" r="2.2" fill="#ff9fbd" opacity=".75"/>
<circle cx="44.5" cy="36.5" r="2.2" fill="#ff9fbd" opacity=".75"/>
</svg>`;
$$("[data-eli]").forEach((el) => (el.innerHTML = ELI));
function eliReact(mood, ms = 800) {
  const targets = [chatBtn, $(".chat-avatar")];
  targets.forEach((t) => t.classList.add(mood));
  setTimeout(() => targets.forEach((t) => t.classList.remove(mood)), ms);
}

const PROFILE = {
  name: "Arril Ricajane O. Carlos",
  short: "Arril",
  course: "Bachelor of Science in Information Technology",
  section: "BSIT 3B",
  year: "3rd Year, 1st Semester",
  school: "Philippine Christian University – Dasmariñas (PCU-D)",
  emails: { pcu: "arocarlos@pcu.edu.ph", personal: "arrilrj.carlos@gmail.com" },
  motto: "Ad emendationem",
  mottoMeaning: "to always improve",
  skills: {
    Databases: "MySQL for storing and querying data",
    "Web development":
      "front-end web apps such as Calcunieli, Pomodoro, TTPD Storytelling and the COMSOC PCUD site",
    "Interactive media":
      "TouchDesigner pieces like Blooming Interactive Flower and Wispy Particles",
    "Computer vision":
      "hand landmark detection and skeletal visualization (Finger Tracking)",
    "Virtualization & Linux": "Ubuntu running on Oracle VM VirtualBox",
    "Networking & cloud":
      "a physical network configuration lab and a quiz on cloud computing and networking",
    "Version control":
      "Git and GitHub, with projects hosted on GitHub Pages and Vercel",
    "Problem solving":
      "debugging, logic building and turning ideas into working projects",
    Leadership: "a passion for leading teams and taking initiative",
    "Time management":
      "balancing a job with full-time BSIT studies as a working student",
    "Continuous learning":
      'picking up new tools and technologies, guided by the motto "Ad emendationem"',
  },
  hobbies: ["developing new things", "learning new technologies"],
  goals: [
    'to always improve ("Ad emendationem")',
    "to grow as a developer and as a leader",
  ],
  funFacts: [
    "Arril is a working student, balancing a job with BSIT studies.",
    'Arril\'s favorite motto is "Ad emendationem", Latin for "to always improve".',
    "Arril has a passion for leading and enjoys building new things.",
  ],
  achievements: [
    "Balancing a job and full-time BSIT studies as a working student",
  ],
  languages: ["HTML", "CSS", "JavaScript", "Python", "Java", "MySQL"],
};

const ctx = {
  last: null,
  name: null,
  misses: 0,
  tour: 0,
  tourActive: false,
  trivia: null,
};
try {
  ctx.name = localStorage.getItem("eliUser");
} catch (e) {}

const allItems = palItems;
const BASE_CHIPS = [
  "About Arril",
  "Skills",
  "Projects",
  "Take a tour",
  "Quiz me",
  "Contact",
];
const SECTIONS = {
  about: ["#about", "the intro"],
  home: ["#about", "the intro"],
  top: ["#about", "the top"],
  gallery: [".gallery", "the gallery"],
  photo: [".gallery", "the gallery"],
  project: ["#showcase", "the featured projects"],
  featured: ["#showcase", "the featured projects"],
  archive: ["#archive", "the portfolio folders"],
  folder: ["#archive", "the portfolio folders"],
  contact: ["#contactSection", "the contact section"],
  footer: ["footer", "the footer"],
};
const jokes = [
  "Why do programmers prefer dark mode? Because light attracts bugs.",
  "There are 10 kinds of people: those who understand binary and those who don't.",
  "A SQL query walks into a bar, sees two tables and asks: can I join you?",
  "My code worked first try. I'm still suspicious.",
  "Why was the computer cold? It left its Windows open.",
  "I would tell you a UDP joke, but you might not get it.",
];
const facts = [
  "Quiz 1 was a perfect 20/20 on IT fundamentals.",
  "Quiz 4 scored 22/25 (88%) on cloud computing and networking, with zero violations.",
  "The lab setup runs Ubuntu on VirtualBox with 4GB RAM, 4 CPU cores and a 100GB dynamic disk.",
  "The TouchDesigner pieces react to hand tracking in real time.",
  "Four of the web projects are live online, hosted on Vercel, GitHub Pages and InfinityFree.",
  "This portfolio has a hidden search: press Ctrl+K or the / key.",
];
let jokeI = 0,
  factI = 0;

const ALIAS = {
  "BLOOMING INTERACTIVE FLOWER": ["flower", "blooming"],
  "WISPY PARTICLES": ["wispy", "particles"],
  "FINGER TRACKING": ["finger", "hand tracking", "landmark"],
  CALCUNIELI: ["calcunieli", "calculator", "calcu"],
  POMODORO: ["pomodoro", "focus timer", "timer"],
  "TTPD STORYTELLING": ["ttpd", "storytelling"],
  "COMSOC PCUD": ["comsoc", "computer society"],
  "VM SETUP: UBUNTU INSTALLATION": ["ubuntu", "virtualbox", "vm setup", "vm"],
  "LAB ACTIVITY 2": ["lab activity 2", "lab 2"],
  "LAB ACTIVITY 3": ["lab activity 3", "lab 3", "physical network"],
  "PRELIM EXAM": ["prelim"],
  "LONG QUIZ": ["long quiz"],
  "QUIZ 1": ["quiz 1", "quiz one"],
  "QUIZ 2": ["quiz 2", "quiz two"],
  "QUIZ 3": ["quiz 3", "quiz three"],
  "QUIZ 4": ["quiz 4", "quiz four"],
  "QUIZ 5": ["quiz 5", "quiz five"],
};

const norm = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
function kwHit(q, w) {
  const e = w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const prefix = w.length >= 5 || w.includes(" ");
  return new RegExp(
    prefix ? `(^|\\s)${e}` : `(^|\\s)${e}(?:s|es)?(?:\\s|$)`,
  ).test(q);
}
const findItem = (q) =>
  allItems.find(({ p }) =>
    [norm(p.name), ...(ALIAS[p.name] || [])].some((a) => kwHit(q, a)),
  );
const R = (text, actions = [], chips = [], last = null) => ({
  text,
  actions,
  chips,
  last,
});
const actItem = (it) => ({
  label: `Open ${it.p.name}`,
  fn: () => choosePal(it),
});
const actFolder = (k) => ({
  label: `Open ${folderData[k].name}`,
  fn: () => $(`.folder-item[data-folder="${k}"]`).click(),
});
const goTo = (sel) => {
  const el = document.querySelector(sel);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
};
const totalFiles = () =>
  Object.values(folderData).reduce((n, f) => n + f.files, 0);
const liveItems = () => allItems.filter(({ p }) => p.live);
const shuffle = (a) => {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
};
const copyText = (t) =>
  navigator.clipboard.writeText(t).then(() => {
    toast.textContent = `Copied: ${t}`;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2000);
  });
const contactActions = () => [
  {
    label: "Email PCU mail",
    fn: () => (location.href = `mailto:${PROFILE.emails.pcu}`),
  },
  {
    label: "Email Gmail",
    fn: () => (location.href = `mailto:${PROFILE.emails.personal}`),
  },
  { label: "Copy personal email", fn: () => copyText(PROFILE.emails.personal) },
];
const goContact = { label: "Go to contact", fn: () => goTo("#contactSection") };
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const nm = () => (ctx.name ? ", " + ctx.name : "");
const closers = [
  "Anything else you'd like to know?",
  "Want to dig into something else? 😊",
  "I'm happy to share more if you're curious!",
  "Ask me anything, I love questions. ✨",
  "Feel free to keep exploring!",
];
const joinList = (a) =>
  a.length < 2
    ? a.join("")
    : a.slice(0, -1).join(", ") + " and " + a[a.length - 1];

function projectReply(it) {
  const { f, p } = it;
  let host = "";
  try {
    if (p.live && p.link) host = ` It's live at ${new URL(p.link).host}.`;
    else if (p.site) host = ` The site is at ${new URL(p.site).host}.`;
  } catch (e) {}
  const type = p.pdf
    ? "a PDF document"
    : p.lightbox
      ? "an image you can open full screen"
      : p.live
        ? "a live project"
        : "a showcase piece";
  const acts = [actItem(it)];
  if (p.live && p.link)
    acts.push({
      label: "Visit site",
      fn: () => window.open(p.link, "_blank", "noopener"),
    });
  acts.push(
    actFolder(Object.keys(folderData).find((k) => folderData[k] === f)),
  );
  return R(
    `${pick(["Ooh, great pick!", "Nice choice! 😊", "Happy to tell you about this one!", "Good eye!"])} ${p.name} (${p.tag}) lives in the ${f.name} folder. ${p.desc}${host} It opens as ${type}.`,
    acts,
    ["More like this", "Projects", "Surprise me"],
    { item: it },
  );
}

function more() {
  const it = ctx.last && ctx.last.item;
  if (!it)
    return R(
      "Name a topic and I'll go deeper: a project, the quizzes, the labs or Arril's skills.",
      [],
      ["Projects", "Skills", "Labs"],
    );
  const rel = allItems
    .filter((x) => x !== it && (x.f === it.f || x.p.tag === it.p.tag))
    .slice(0, 3);
  if (!rel.length)
    return R(
      `${it.p.name} stands on its own. Want something else?`,
      [],
      BASE_CHIPS,
    );
  return R(
    `If you like ${it.p.name}, you might also enjoy ${rel.map((x) => x.p.name).join(", ")}.`,
    rel.map(actItem),
    rel.map((x) => x.p.name),
    { item: it },
  );
}

const TOUR = [
  {
    sel: "#about",
    title: "The intro",
    text: "Arril's name, course and section, with the profile photo.",
  },
  {
    sel: ".gallery",
    title: "The gallery",
    text: "Six photos, from night streets to a bamboo walk. Tap one to open it full screen.",
  },
  {
    sel: "#showcase",
    title: "Featured projects",
    text: "Filter by tag, then open live previews or full images.",
  },
  {
    sel: "#archive",
    title: "Portfolio folders",
    text: "Quizzes, exams, labs and projects. Hover for a preview and click to open a folder.",
  },
  {
    sel: "#contactSection",
    title: "Contact",
    text: "Both emails with copy buttons, plus a message form. That's the end of the tour.",
  },
];
function tourStep(i) {
  const s = TOUR[i];
  ctx.tour = i;
  ctx.tourActive = i < TOUR.length - 1;
  if (innerWidth > 640) goTo(s.sel);
  const show = {
    label: "Show me",
    fn: () => {
      if (innerWidth <= 640) setChat(false);
      goTo(s.sel);
    },
  };
  const last = i === TOUR.length - 1;
  const acts = last
    ? [
        show,
        { label: "Quiz me", fn: () => ask("Quiz me") },
        { label: "Restart tour", fn: () => speak(tourStep(0)) },
      ]
    : [show, { label: "Next stop", fn: () => speak(tourStep(i + 1)) }];
  return R(
    `Stop ${i + 1} of ${TOUR.length}: ${s.title}. ${s.text}`,
    acts,
    last ? BASE_CHIPS : ["Next", "Stop tour"],
  );
}

const BANK = [
  {
    q: "What did Arril score on Quiz 1?",
    o: ["20/20", "18/20", "15/20"],
    a: 0,
  },
  {
    q: "What percentage did Arril get on Quiz 4?",
    o: ["75%", "88%", "95%"],
    a: 1,
  },
  {
    q: "Which section is Arril in?",
    o: ["BSIT 2A", "BSIT 3B", "BSIT 4C"],
    a: 1,
  },
  {
    q: "Which tool powers the Blooming Flower and Wispy Particles?",
    o: ["Blender", "Unity", "TouchDesigner"],
    a: 2,
  },
  { q: "How much RAM does the Ubuntu VM get?", o: ["2GB", "4GB", "8GB"], a: 1 },
  {
    q: "Which project is a focus timer with a streak counter?",
    o: ["Pomodoro", "Calcunieli", "TTPD Storytelling"],
    a: 0,
  },
  { q: "How many photos are in the gallery?", o: ["4", "6", "9"], a: 1 },
  {
    q: "Which app runs the Ubuntu virtual machine?",
    o: ["VMware", "Oracle VM VirtualBox", "Hyper-V"],
    a: 1,
  },
  {
    q: "Which school does Arril attend?",
    o: [
      "Philippine Christian University – Dasmariñas",
      "De La Salle",
      "UP Diliman",
    ],
    a: 0,
  },
  {
    q: "What is Arril's favorite motto?",
    o: ["Ad astra", "Ad emendationem", "Carpe diem"],
    a: 1,
  },
  {
    q: "Which of these does Arril know?",
    o: ["Python and Java", "Swift and Kotlin", "Go and Rust"],
    a: 0,
  },
  {
    q: "Which lab covered physical network configuration?",
    o: ["Lab Activity 2", "Lab Activity 3", "VM Setup"],
    a: 1,
  },
];
function triviaQuestion() {
  const t = ctx.trivia,
    item = t.qs[t.i];
  const opts = shuffle(item.o.map((text, n) => ({ text, ok: n === item.a })));
  const acts = opts.map((o) => ({
    label: o.text,
    fn: (e) => {
      const row = e.currentTarget.parentElement;
      row.querySelectorAll("button").forEach((b, n) => {
        b.disabled = true;
        if (opts[n].ok) b.classList.add("ok");
      });
      if (!o.ok) e.currentTarget.classList.add("no");
      if (o.ok) t.score++;
      eliReact(o.ok ? "hop" : "think", 700);
      t.msg = o.ok
        ? pick(["Correct! 🎉", "Yes, nice one! ✨", "You got it! 👏"])
        : pick([
            "Not quite, but good try! 💪",
            "Close! Now you know for next time. 😊",
            "Oops! No worries, keep going!",
          ]);
      t.i++;
      setTimeout(
        () => speak(t.i < t.qs.length ? triviaQuestion() : triviaEnd(), false),
        650,
      );
    },
  }));
  const lead = t.msg ? t.msg + " " : "";
  t.msg = "";
  return R(`${lead}Question ${t.i + 1} of ${t.qs.length}: ${item.q}`, acts, []);
}
function triviaEnd() {
  const { score, qs, msg } = ctx.trivia;
  ctx.trivia = null;
  const verdict =
    score === qs.length
      ? "Perfect score! You know this portfolio better than most."
      : score >= qs.length - 2
        ? "Nice work, you clearly paid attention."
        : "Good try! The tour is a great way to pick up the details.";
  return R(
    `${msg} You got ${score} out of ${qs.length}. ${verdict}`,
    [{ label: "Play again", fn: () => ask("Quiz me") }],
    ["Take a tour", "Projects", "Contact"],
  );
}

const INTENTS = [
  {
    kw: [
      "hi",
      "hello",
      "hey",
      "yo",
      "sup",
      "kumusta",
      "good morning",
      "good afternoon",
      "good evening",
      "hiya",
      "hola",
    ],
    run: () =>
      R(
        pick([
          `Hi${nm()}! 👋 So nice to see you here!`,
          `Hello${nm()}! 😊 Welcome to Arril's portfolio.`,
          `Hey${nm()}! Great to have you here!`,
        ]) +
          " I can tell you about Arril, the projects, skills and labs, take you on a tour, or quiz you. What sounds fun?",
        [],
        ["About Arril", "Take a tour", "Quiz me"],
      ),
  },
  {
    kw: [
      "how are you",
      "how r u",
      "how are u",
      "hows it going",
      "how is it going",
      "you okay",
      "kamusta ka",
    ],
    run: () =>
      R(
        pick([
          "I'm doing great, thanks for asking! 😊 It's always a good day when someone stops by the portfolio.",
          "Feeling cheerful and fully charged! ⚡ How about you?",
        ]) + " What would you like to explore?",
        [],
        ["About Arril", "Surprise me", "Tell me a joke"],
      ),
  },
  {
    kw: ["what s up", "whats up", "wassup", "sup"],
    run: () =>
      R(
        `Just hanging out in the portfolio, waiting for a friend to chat with${nm()}! What brings you here?`,
        [],
        ["About Arril", "Projects", "Surprise me"],
      ),
  },
  {
    kw: ["bored", "boring", "nothing to do"],
    run: () =>
      R(
        "Let's fix that! 🎉 I can quiz you, tell a joke, take you on a tour or pick a random project for you.",
        [],
        ["Quiz me", "Tell me a joke", "Take a tour", "Surprise me"],
      ),
  },
  {
    kw: [
      "tired",
      "stressed",
      "stress",
      "sad",
      "overwhelmed",
      "anxious",
      "burnout",
      "exhausted",
      "pagod",
    ],
    run: () =>
      R(
        `That sounds tough${nm()}, and it's okay to feel that way. 💛 Arril's motto is "${PROFILE.motto}" (${PROFILE.mottoMeaning}), and that includes being kind to yourself. Take a breath, drink some water, and take it one small step at a time. If it feels heavy, talking to someone you trust really helps.`,
        [],
        ["Tell me a joke", "Fun fact", "Motto"],
      ),
  },
  {
    kw: ["good night", "goodnight", "gn", "sleep", "matulog"],
    run: () =>
      R(
        `Good night${nm()}! 🌙 Rest well, and come back anytime.`,
        [],
        ["Take a tour", "Contact"],
      ),
  },
  {
    kw: ["lol", "haha", "hahaha", "hehe", "lmao", "funny"],
    run: () =>
      R(
        pick([
          "Glad that made you smile! 😄",
          "Hehe, I try my best! 😄",
          "Ha! Comedy is my side hobby. 🤖",
        ]),
        [],
        ["Another joke", "Fun fact", "Quiz me"],
      ),
  },
  {
    kw: ["sorry", "my bad", "oops", "pasensya"],
    run: () =>
      R(
        "No worries at all! 😊 There's no such thing as a wrong question here.",
        [],
        BASE_CHIPS,
      ),
  },
  {
    kw: [
      "who made you",
      "who created you",
      "who built you",
      "your creator",
      "who programmed you",
      "made you",
    ],
    run: () =>
      R(
        "Arril built me to be the friendly guide of this portfolio! 🤖💛 I'm made with plain JavaScript, and I get a little smarter whenever Arril teaches me something new.",
        [],
        ["About Arril", "Skills", "Motto"],
      ),
  },
  {
    kw: [
      "love you",
      "i like you",
      "you are cute",
      "you re cute",
      "so cute",
      "best bot",
      "you re the best",
      "you are the best",
    ],
    run: () =>
      R(
        "Aww, you're making my antenna glow! 🥰 Thank you, that's so kind.",
        [],
        ["Surprise me", "Take a tour"],
      ),
  },
  {
    kw: ["congrats", "congratulations", "good luck", "goodluck"],
    run: () =>
      R("Thank you! 🎉 Wishing you the very best too!", [], BASE_CHIPS),
  },
  {
    kw: [
      "who are you",
      "your name",
      "eli",
      "what are you",
      "are you a bot",
      "are you real",
      "robot",
    ],
    run: () =>
      R(
        "I'm Eli, a little robot who lives in Arril's portfolio. I only know what's on this page, but that covers the profile, skills, projects, quizzes, labs and contacts. I can also give tours, run trivia and jump around the site.",
        [],
        ["What can you do?", "Take a tour", "Quiz me"],
      ),
  },
  {
    kw: [
      "help",
      "what can you do",
      "commands",
      "features",
      "capabilities",
      "options",
    ],
    run: () =>
      R(
        'Here\'s what I can do:\n• Answer questions about Arril: profile, skills, interests, highlights\n• Explain any project, quiz, exam or lab by name\n• Give a guided tour or jump to any section\n• Run a 5-question trivia about the portfolio\n• Switch theme, toggle sound, search the site\n• Share contact details, a joke or a fun fact\n• Remember your name: say "my name is ..."',
        [],
        ["Take a tour", "Quiz me", "Skills", "Surprise me"],
      ),
  },
  {
    kw: [
      "skill",
      "skills",
      "tech",
      "stack",
      "tools",
      "language",
      "languages",
      "technology",
      "technologies",
      "programming",
      "good at",
      "expertise",
      "software",
      "capable",
      "python",
      "java",
      "javascript",
      "html",
      "css",
      "mysql",
      "database",
      "databases",
      "sql",
    ],
    run: () =>
      R(
        `Programming languages and databases: ${PROFILE.languages.join(", ")}.\n${Object.entries(
          PROFILE.skills,
        )
          .map(([k, v]) => `• ${k}: ${v}`)
          .join("\n")}`,
        [actFolder("projects")],
        ["Web projects", "TouchDesigner", "Labs", "Highlights"],
      ),
  },
  {
    kw: [
      "interest",
      "interests",
      "hobby",
      "hobbies",
      "passion",
      "free time",
      "enjoy",
      "favorite",
      "favourite",
      "like to do",
      "likes",
    ],
    run: () =>
      R(
        `Arril enjoys ${joinList(PROFILE.hobbies)}, and has a passion for leading. The gallery also has snapshots like Night street, Bamboo walk and Picnic Time.`,
        [{ label: "Go to gallery", fn: () => goTo(".gallery") }],
        ["Motto", "Skills", "Projects"],
      ),
  },
  {
    kw: [
      "goal",
      "goals",
      "future",
      "career",
      "dream",
      "dreams",
      "plan",
      "plans",
      "aspire",
      "ambition",
      "improve",
      "improvement",
    ],
    run: () =>
      R(
        `Arril's aims: ${joinList(PROFILE.goals)}.`,
        [goContact],
        ["Motto", "Skills", "Contact"],
      ),
  },
  {
    kw: [
      "motto",
      "quote",
      "ad emendationem",
      "latin",
      "saying",
      "mantra",
      "emendationem",
    ],
    run: () =>
      R(
        `Arril's favorite motto is "${PROFILE.motto}", Latin for "${PROFILE.mottoMeaning}". It reflects the habit behind every project here: build, learn, then make it better.`,
        [],
        ["Goals", "Skills", "Projects"],
      ),
  },
  {
    kw: [
      "working student",
      "leadership",
      "leader",
      "leading",
      "lead",
      "strengths",
      "strength",
      "personality",
      "traits",
      "trait",
      "soft skills",
      "job",
    ],
    run: () =>
      R(
        "Arril is a working student who balances a job with full-time BSIT studies. A passion for leading and a love of developing new things and learning new skills drive the work in this portfolio.",
        [],
        ["Motto", "Skills", "Highlights"],
      ),
  },
  {
    kw: [
      "achievement",
      "achievements",
      "highlight",
      "highlights",
      "proud",
      "best",
      "accomplishment",
      "accomplishments",
      "score",
      "scores",
      "perfect",
      "grade",
      "grades",
      "result",
      "results",
    ],
    run: () =>
      R(
        `Highlights:\n• A perfect 20/20 on Quiz 1 (IT fundamentals)\n• 22/25 (88%) on Quiz 4 with zero violations\n• ${liveItems().length} live web projects, including COMSOC PCUD\n• TouchDesigner pieces driven by real-time hand tracking${PROFILE.achievements.length ? "\n• " + PROFILE.achievements.join("\n• ") : ""}`,
        [actFolder("quiz")],
        ["Quizzes", "Web projects", "Skills"],
      ),
  },
  {
    kw: ["fun fact", "facts", "did you know", "random fact"],
    run: () => {
      const all = [...PROFILE.funFacts, ...facts];
      return R(
        all[factI++ % all.length],
        [],
        ["Another fact", "Tell me a joke", "Quiz me"],
      );
    },
  },
  {
    kw: ["fact"],
    run: () => {
      const all = [...PROFILE.funFacts, ...facts];
      return R(
        all[factI++ % all.length],
        [],
        ["Another fact", "Tell me a joke", "Quiz me"],
      );
    },
  },
  {
    kw: ["joke", "funny", "laugh", "pun"],
    run: () =>
      R(
        jokes[jokeI++ % jokes.length],
        [],
        ["Another joke", "Fun fact", "Quiz me"],
      ),
  },
  {
    kw: ["quiz me", "trivia", "game", "play", "test me", "challenge", "ask me"],
    run: () => {
      ctx.trivia = { qs: shuffle(BANK).slice(0, 5), i: 0, score: 0 };
      return triviaQuestion();
    },
  },
  {
    kw: [
      "tour",
      "guide me",
      "walk me",
      "walkthrough",
      "show me around",
      "start tour",
    ],
    run: () => tourStep(0),
  },
  {
    kw: [
      "go to",
      "take me",
      "scroll",
      "jump",
      "navigate",
      "bring me",
      "show me the",
    ],
    run: (q) => {
      const key = Object.keys(SECTIONS).find((k) => kwHit(q, k));
      if (!key)
        return R(
          "Where to? I can jump to the intro, gallery, projects, folders or contact.",
          [],
          ["Go to projects", "Go to gallery", "Go to contact"],
        );
      const [sel, label] = SECTIONS[key];
      if (innerWidth <= 640) setChat(false);
      goTo(sel);
      return R(
        `Taking you to ${label}.`,
        [],
        ["Go to projects", "Go to gallery", "Go to contact"],
      );
    },
  },
  {
    kw: [
      "recommend",
      "suggest",
      "where should i start",
      "best project",
      "top project",
      "must see",
      "worth seeing",
    ],
    run: () => {
      const picks = [
        "BLOOMING INTERACTIVE FLOWER",
        "POMODORO",
        "COMSOC PCUD",
      ].map((n) => allItems.find((x) => x.p.name === n));
      return R(
        "Short on time? Start with Blooming Interactive Flower (TouchDesigner plus hand interaction), Pomodoro (a live app you can try right now) and COMSOC PCUD (a full community website).",
        picks.map(actItem),
        ["Take a tour", "Surprise me"],
      );
    },
  },
  {
    kw: ["surprise", "random", "anything", "pick for me"],
    run: () => {
      const m = allItems[Math.floor(Math.random() * allItems.length)];
      return R(
        `Here's a random pick: ${m.p.name} (${m.f.name}).`,
        [actItem(m)],
        ["Surprise me", "Projects"],
        { item: m },
      );
    },
  },
  {
    kw: [
      "web app",
      "web apps",
      "website",
      "websites",
      "live",
      "demo",
      "demos",
      "deployed",
      "online",
      "link",
      "links",
    ],
    run: () => {
      const items = allItems.filter(({ p }) => p.live);
      const lines = items.map(({ p }) => {
        let h = "";
        try {
          h = new URL(p.link || p.site).host;
        } catch (e) {}
        return `• ${p.name}: ${h}`;
      });
      return R(
        `Web projects you can open online:\n${lines.join("\n")}`,
        items.slice(0, 4).map(actItem),
        ["Skills", "Projects", "Contact"],
      );
    },
  },
  {
    kw: [
      "project",
      "projects",
      "build",
      "built",
      "made",
      "work",
      "works",
      "apps",
      "app",
      "web",
      "touchdesigner",
      "interactive",
      "computer vision",
    ],
    run: (q) => {
      const tag = /touchdesigner|interactive|vision/.test(q)
        ? ["TouchDesigner", "Computer Vision"]
        : /\bweb/.test(q)
          ? ["Web App"]
          : null;
      const items = folderData.projects.projects.filter(
        (p) => !tag || tag.includes(p.tag),
      );
      return R(
        `${tag ? "Matching" : "The Projects folder has"} ${items.length} ${tag ? "projects" : "files"}: ${items.map((p) => p.name).join(", ")}.`,
        [actFolder("projects")],
        ["Web projects", "TouchDesigner", "Recommend one"],
      );
    },
  },
  {
    kw: ["quizzes", "quiz"],
    run: () =>
      R(
        `The Quiz folder has ${folderData.quiz.files} files, including a perfect 20/20 on Quiz 1 and 22/25 (88%) on Quiz 4, plus a long quiz.`,
        [actFolder("quiz")],
        ["Highlights", "Exams", "Labs"],
      ),
  },
  {
    kw: ["exam", "exams", "midterm", "finals"],
    run: () =>
      R(
        "The Exams folder holds the Prelim Exam as a PDF.",
        [actFolder("exams")],
        ["Quizzes", "Labs"],
      ),
  },
  {
    kw: [
      "lab",
      "labs",
      "laboratory",
      "virtual",
      "network",
      "networking",
      "linux",
    ],
    run: () =>
      R(
        `The Laboratory folder has ${folderData.laboratory.files} files: the Ubuntu VM setup in VirtualBox, Lab Activity 2, and Lab Activity 3 on physical network configuration.`,
        [actFolder("laboratory")],
        ["Ubuntu setup", "Skills", "Quizzes"],
      ),
  },
  {
    kw: [
      "gallery",
      "photo",
      "photos",
      "picture",
      "pictures",
      "pic",
      "pics",
      "image",
      "images",
    ],
    run: () =>
      R(
        `The gallery has ${galleryItems.length} photos: ${galleryItems.map((g) => g.querySelector("img").alt).join(", ")}. Tap one to open it full screen, then swipe or use the arrows.`,
        [{ label: "Go to gallery", fn: () => goTo(".gallery") }],
        ["Interests", "Projects"],
      ),
  },
  {
    kw: [
      "course",
      "school",
      "pcu",
      "bsit",
      "section",
      "year",
      "semester",
      "university",
      "study",
      "studying",
      "college",
      "education",
      "student",
    ],
    run: () =>
      R(
        `${PROFILE.short} is in ${PROFILE.section} (${PROFILE.year}), taking ${PROFILE.course} at ${PROFILE.school}.`,
        [],
        ["Skills", "Projects", "Contact"],
      ),
  },
  {
    kw: [
      "contact",
      "email",
      "emails",
      "mail",
      "reach",
      "hire",
      "hiring",
      "collab",
      "collaborate",
      "message",
      "get in touch",
      "gmail",
      "inbox",
    ],
    run: () =>
      R(
        `${PROFILE.short} would love to hear from you! 💌 You can reach them at ${PROFILE.emails.pcu} (PCU mail) or ${PROFILE.emails.personal} (personal). There's also a message form at the bottom of the page.`,
        [...contactActions(), goContact],
        ["Projects", "Skills"],
      ),
  },
  {
    kw: ["dark", "light", "theme", "invert", "mode"],
    run: () =>
      R(
        "Use the Invert button in the top bar (or press T) to switch themes. Your choice is remembered.",
        [{ label: "Switch theme", fn: () => $("#invertBtn").click() }],
        ["Shortcuts", "Sound"],
      ),
  },
  {
    kw: ["sound", "mute", "unmute", "audio", "volume", "sfx"],
    run: () => {
      $("#soundToggle").click();
      return R(
        `Sound is now ${isMuted ? "off" : "on"}. Say it again to flip it back.`,
        [],
        ["Theme", "Shortcuts"],
      );
    },
  },
  {
    kw: ["search", "find", "look for", "lookup"],
    run: (q, raw) => {
      const m = raw.match(/(?:search|find|look for|lookup)\s+(?:for\s+)?(.+)/i);
      const term = m ? m[1].trim() : "";
      const open = () => {
        openPalette();
        if (term) {
          palInput.value = term;
          renderPalette();
        }
      };
      return R(
        term
          ? `Searching the portfolio for "${term}".`
          : "Press Ctrl+K (or /) to search every file in the portfolio.",
        [{ label: "Open search", fn: open }],
        ["Shortcuts", "Projects"],
      );
    },
  },
  {
    kw: [
      "shortcut",
      "shortcuts",
      "keyboard",
      "keys",
      "hotkey",
      "hotkeys",
      "how to use",
    ],
    run: () =>
      R(
        "Shortcuts:\n• Ctrl+K or /: search everything\n• T: switch theme\n• Esc: close any panel\n• Arrow keys or swipe: move through images",
        [{ label: "Open search", fn: openPalette }],
        ["Theme", "Take a tour"],
      ),
  },
  {
    kw: [
      "how many",
      "count",
      "stats",
      "statistics",
      "numbers",
      "total",
      "overview",
    ],
    run: () =>
      R(
        `At a glance: ${totalFiles()} files across 4 folders (Quiz ${folderData.quiz.files}, Exams ${folderData.exams.files}, Laboratory ${folderData.laboratory.files}, Projects ${folderData.projects.files}), ${galleryItems.length} gallery photos, and ${liveItems().length} live web projects.`,
        [{ label: "Open folders", fn: () => goTo("#archive") }],
        ["Highlights", "Projects"],
      ),
  },
  {
    kw: [
      "what time",
      "time is it",
      "current time",
      "today s date",
      "date today",
      "what date",
    ],
    run: () =>
      R(
        `Right now it's ${new Date().toLocaleString([], { weekday: "long", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}.`,
        [],
        ["Take a tour", "Fun fact"],
      ),
  },
  {
    kw: [
      "how old",
      "birthday",
      "age",
      "address",
      "phone",
      "contact number",
      "where do you live",
      "where does arril live",
      "single",
      "boyfriend",
      "girlfriend",
      "relationship",
      "instagram",
      "facebook",
      "tiktok",
      "twitter",
    ],
    run: () =>
      R(
        "That's personal info Arril hasn't put on this page, so I can't share it. For anything beyond the portfolio, send a message.",
        [goContact],
        ["Contact", "About Arril"],
      ),
  },
  {
    kw: [
      "cool",
      "nice",
      "awesome",
      "great",
      "amazing",
      "love it",
      "wow",
      "good job",
      "impressive",
      "beautiful",
    ],
    run: () =>
      R(
        pick([
          "Thank you so much! 🥹 Arril will be thrilled to hear that.",
          "Aww, that means a lot! 💛 Arril worked hard on this.",
          "You're too kind! ✨ Want to tell Arril yourself?",
        ]),
        [goContact],
        ["Contact", "Surprise me"],
      ),
  },
  {
    kw: ["thanks", "thank you", "thx", "salamat", "ty"],
    run: () =>
      R(
        pick([
          `You're very welcome${nm()}! 😊`,
          "Anytime! Happy to help. 💛",
          "My pleasure! That's what I'm here for.",
        ]) + " Come back whenever you like.",
        [],
        ["Take a tour", "Contact"],
      ),
  },
  {
    kw: ["bye", "goodbye", "see you", "cya", "ingat"],
    run: () =>
      R(
        `Bye${nm()}! 👋 It was lovely chatting with you. Take care, and thanks for visiting Arril's portfolio!`,
        [],
        ["Contact", "Take a tour"],
      ),
  },
  {
    kw: ["clear", "reset", "start over"],
    run: () => ({
      ...R("Fresh start! What would you like to see?", [], BASE_CHIPS),
      clear: true,
    }),
  },
  {
    kw: [
      "who is arril",
      "who s arril",
      "about arril",
      "introduce",
      "bio",
      "summary",
      "profile",
      "carlos",
      "arril",
      "yourself",
      "about you",
    ],
    w: 0.4,
    run: () =>
      R(
        `${PROFILE.name} is a ${PROFILE.section} student (${PROFILE.year}) taking ${PROFILE.course} at ${PROFILE.school}. The work spans interactive media in TouchDesigner, computer vision, web apps and hands-on IT labs, all compiled in this portfolio. Arril is also a working student with a passion for leading, living by the motto "${PROFILE.motto}".`,
        [],
        ["Skills", "Motto", "Highlights", "Contact"],
      ),
  },
];

const WARM = [
  "skill",
  "interest",
  "goal",
  "achievement",
  "project",
  "quizzes",
  "exam",
  "lab",
  "gallery",
  "course",
  "web app",
  "motto",
  "working student",
  "who is arril",
  "how many",
  "recommend",
];
INTENTS.forEach((i) => {
  if (WARM.includes(i.kw[0])) i.warm = true;
});

function fallback(q) {
  ctx.misses++;
  const stop = new Set([
    "the",
    "and",
    "what",
    "who",
    "how",
    "about",
    "tell",
    "can",
    "you",
    "are",
    "for",
    "this",
    "that",
    "with",
    "have",
    "does",
    "show",
    "arril",
  ]);
  const toks = q.split(" ").filter((t) => t.length > 2 && !stop.has(t));
  const hits = allItems
    .map((it) => ({
      it,
      s: toks.filter((t) =>
        norm(`${it.p.name} ${it.p.tag} ${it.p.desc} ${it.f.name}`).includes(t),
      ).length,
    }))
    .filter((x) => x.s)
    .sort((a, b) => b.s - a.s)
    .slice(0, 3);
  if (hits.length)
    return R(
      "Hmm, I'm not totally sure what you meant, but these might be what you're looking for:",
      hits.map((x) => actItem(x.it)),
      ["Projects", "Skills", "Contact"],
    );
  if (ctx.misses >= 2)
    return R(
      "Sorry, that one is beyond what I know yet. 😅 The quickest way to get a real answer is to message Arril directly, who'd be glad to help!",
      [...contactActions().slice(0, 2), goContact],
      BASE_CHIPS,
    );
  return R(
    "Oops, that one went over my head! 😅 I know a lot about Arril's profile, skills, projects, quizzes, labs and contacts. Try one of the suggestions below, or say \"help\" and I'll show you what I can do.",
    [],
    BASE_CHIPS,
  );
}

function respond(raw) {
  const q = norm(raw);
  let m = raw.match(/\b(?:my name is|call me)\s+([a-z][a-z'-]{1,20})/i);
  if (m) {
    ctx.name = m[1][0].toUpperCase() + m[1].slice(1);
    try {
      localStorage.setItem("eliUser", ctx.name);
    } catch (e) {}
    return R(
      `Nice to meet you, ${ctx.name}! 😊 I'll remember your name. What would you like to explore?`,
      [],
      BASE_CHIPS,
    );
  }
  if (/^(what s my name|what is my name|who am i)$/.test(q))
    return R(
      ctx.name
        ? `You're ${ctx.name}.`
        : 'I don\'t know yet. Tell me with "my name is ...".',
      [],
      BASE_CHIPS,
    );
  if (
    /^(more|tell me more|details|go on|continue|elaborate|more like this)$/.test(
      q,
    )
  )
    return more();
  if (/^(open it|open that|show it|yes|yeah|yep|sure|ok|okay)$/.test(q)) {
    if (ctx.last && ctx.last.item) {
      choosePal(ctx.last.item);
      return R(`Opening ${ctx.last.item.p.name}.`, [], BASE_CHIPS, ctx.last);
    }
    return R("What would you like to see?", [], BASE_CHIPS);
  }
  if (ctx.tourActive && /^(next|next stop)$/.test(q))
    return tourStep(ctx.tour + 1);
  if (/^stop( tour)?$/.test(q)) {
    ctx.tourActive = false;
    return R(
      "No problem, tour stopped! Ask me anything else. 😊",
      [],
      BASE_CHIPS,
    );
  }
  const item = findItem(q);
  if (item) return projectReply(item);
  let best = null,
    top = 0;
  for (const it of INTENTS) {
    const s =
      it.kw.reduce((n, w) => n + (kwHit(q, w) ? w.split(" ").length : 0), 0) *
      (it.w || 1);
    if (s > top) {
      best = it;
      top = s;
    }
  }
  if (best) {
    ctx.misses = 0;
    const res = best.run(q, raw);
    if (best.warm && Math.random() < 0.5) res.text += " " + pick(closers);
    return res;
  }
  return fallback(q);
}

let chatHistory = [];
try {
  chatHistory = JSON.parse(sessionStorage.getItem("eliChat") || "[]");
} catch (e) {
  chatHistory = [];
}
function persistChat() {
  try {
    sessionStorage.setItem("eliChat", JSON.stringify(chatHistory.slice(-60)));
  } catch (e) {}
}
function say(text, who, actions = [], save = true) {
  const m = document.createElement("div");
  m.className = `msg ${who}`;
  const body = document.createElement("div");
  body.className = "msg-body";
  const p = document.createElement("p");
  p.textContent = text;
  body.append(p);
  if (actions.length) {
    const row = document.createElement("div");
    row.className = "msg-actions";
    actions.forEach((a) => {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = a.label;
      b.addEventListener("click", (e) => a.fn(e));
      row.append(b);
    });
    body.append(row);
  }
  if (who === "bot") {
    const av = document.createElement("span");
    av.className = "msg-eli";
    av.innerHTML = ELI;
    m.append(av);
  }
  m.append(body);
  chatLog.append(m);
  chatLog.scrollTop = chatLog.scrollHeight;
  if (save && text) {
    chatHistory.push({ t: text, w: who });
    persistChat();
  }
  return m;
}
function setChips(list) {
  chatChips.innerHTML = "";
  [...new Set(list && list.length ? list : BASE_CHIPS)]
    .slice(0, 6)
    .forEach((c) => {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = c;
      b.addEventListener("click", () => ask(c));
      chatChips.append(b);
    });
  chatChips.scrollLeft = 0;
}
function speak(res, react = true) {
  say(res.text, "bot", res.actions);
  setChips(res.chips);
  if (res.last !== undefined) ctx.last = res.last;
  if (react) eliReact("hop");
}
function ask(text) {
  const raw = text.trim();
  if (!raw) return;
  say(raw, "user");
  eliReact("think", 900);
  const typing = say("", "bot");
  typing.classList.add("typing");
  typing.querySelector("p").innerHTML =
    '<span class="dots"><i></i><i></i><i></i></span>';
  const res = respond(raw);
  setTimeout(
    () => {
      typing.remove();
      if (res.clear) {
        chatLog.replaceChildren();
        chatHistory = [];
        persistChat();
      }
      speak(res);
    },
    Math.min(1100, 450 + res.text.length * 5),
  );
}
setChips(BASE_CHIPS);
function setChat(open, focus = true) {
  chat.classList.toggle("open", open);
  chatBtn.setAttribute("aria-expanded", open);
  eliBubble.hidden = true;
  if (open) {
    if (!chatLog.children.length) {
      const hr = new Date().getHours();
      const greet =
        hr < 12 ? "Good morning" : hr < 18 ? "Good afternoon" : "Good evening";
      say(
        `${greet}${ctx.name ? ", " + ctx.name : ""}! 👋 I'm Eli, Arril's little robot friend. I'm so happy you stopped by! Ask me about Arril, the projects, skills or labs, or try a tour or a quick quiz.`,
        "bot",
      );
    }
    eliReact("hop");
    chatLog.scrollTop = chatLog.scrollHeight;
    if (focus) setTimeout(() => chatInput.focus(), 200);
  }
  try {
    sessionStorage.setItem("eliOpen", open ? "1" : "0");
  } catch (e) {}
}
chatBtn.addEventListener("click", () =>
  setChat(!chat.classList.contains("open")),
);
$("#chatClose").addEventListener("click", () => setChat(false));
$("#chatForm").addEventListener("submit", (e) => {
  e.preventDefault();
  ask(chatInput.value);
  chatInput.value = "";
});
chatHistory.forEach((m) => say(m.t, m.w, [], false));
let wasOpen = false;
try {
  wasOpen = sessionStorage.getItem("eliOpen") === "1";
} catch (e) {}
if (chatHistory.length && wasOpen) setChat(true, false);
let nudged = chatHistory.length > 0;
try {
  nudged = nudged || sessionStorage.getItem("eliNudge") === "1";
} catch (e) {}
if (!nudged) {
  setTimeout(() => {
    if (chat.classList.contains("open")) return;
    eliBubble.hidden = false;
    eliReact("hop");
    try {
      sessionStorage.setItem("eliNudge", "1");
    } catch (e) {}
    setTimeout(() => (eliBubble.hidden = true), 7000);
  }, 5000);
}

lucide.createIcons();
