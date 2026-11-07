document.addEventListener("DOMContentLoaded", async () => {
  if (document.fonts?.ready) await document.fonts.ready;

  gsap.registerPlugin(ScrollTrigger, CustomEase, SplitText);
  CustomEase.create("hop", "0.9, 0, 0.1, 1");

  // Address bar Chrome/Safari mobile naik-turun tidak boleh memicu refresh ScrollTrigger.
  ScrollTrigger.config({
    ignoreMobileResize: true,
  });

  const $ = (selector, root = document) => root.querySelector(selector);

  // ==========================================
  // 1. LENIS - SINGLE INSTANCE
  // ==========================================
  const lenis = new Lenis({
    autoRaf: false,
    smoothWheel: true,
    syncTouch: true,
    infinite: false,
    overscroll: false,
  });

  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  // Scroll dikunci sampai preloader selesai.
  lenis.stop();

  // ==========================================
  // 2. PRELOADER
  // ==========================================
  const createSplit = (selector, type, className) => {
    const element = $(selector);
    if (!element) return null;

    return SplitText.create(element, {
      type,
      [type + "Class"]: className,
      mask: type,
    });
  };

  const splitPreloaderHeader = createSplit(
    ".preloader-header a",
    "chars",
    "char",
  );

  const splitPreloaderCopy = createSplit(".preloader-copy p", "lines", "line");

  const splitHeader = SplitText.create(".hero-header h1, .hero-header h6", {
    type: "lines",
    linesClass: "line",
    mask: "lines",
  });

  const chars = splitPreloaderHeader?.chars || [];
  const lines = splitPreloaderCopy?.lines || [];
  const headerLines = splitHeader?.lines || [];

  const initialChar = chars[0];
  const lastChar = chars[chars.length - 1];

  chars.forEach((char, index) => {
    gsap.set(char, {
      yPercent: index % 2 === 0 ? -100 : 100,
    });
  });

  gsap.set(lines, {
    yPercent: 100,
  });

  gsap.set(headerLines, {
    yPercent: 100,
  });

  // State awal preloader.
  gsap.set(".progress-bar", {
    scaleX: 0,
    transformOrigin: "left",
  });

  gsap.set(".preloader-images .img", {
    clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
  });

  gsap.set(".preloader-images .img img", {
    scale: 2,
  });

  const preloaderImages = gsap.utils.toArray(".preloader-images .img");

  const preloaderImagesInner = gsap.utils.toArray(".preloader-images .img img");

  let introFinished = false;
  let logoFinished = false;
  let scenesStarted = false;

  function tryStartScenes() {
    if (introFinished && logoFinished && !scenesStarted) {
      scenesStarted = true;
      startScenes();
    }
  }

  const introTimeline = gsap.timeline({
    delay: 0.25,
    onComplete: () => {
      introFinished = true;
      tryStartScenes();
    },
  });

  introTimeline
    .to(".progress-bar", {
      scaleX: 1,
      duration: 4,
      ease: "power3.inOut",
    })
    .set(".progress-bar", {
      transformOrigin: "right",
    })
    .to(".progress-bar", {
      scaleX: 0,
      duration: 1,
      ease: "power3.in",
    });

  preloaderImages.forEach((image, index) => {
    introTimeline.to(
      image, {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
        duration: 1,
        ease: "hop",
        delay: index * 0.75,
      },
      "-=5",
    );
  });

  preloaderImagesInner.forEach((image, index) => {
    introTimeline.to(
      image, {
        scale: 1,
        duration: 1.5,
        ease: "hop",
        delay: index * 0.75,
      },
      "-=5.25",
    );
  });

  introTimeline.to(
    lines, {
      yPercent: 0,
      duration: 2,
      ease: "hop",
      stagger: 0.1,
    },
    "-=5.5",
  );

  introTimeline.to(
    chars, {
      yPercent: 0,
      duration: 1,
      ease: "hop",
      stagger: 0.025,
    },
    "-=5",
  );

  introTimeline.to(
    ".preloader-images", {
      clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
      duration: 1,
      ease: "hop",
    },
    "-=1.5",
  );

  introTimeline.to(
    lines, {
      y: "-125%",
      duration: 2,
      ease: "hop",
      stagger: 0.1,
    },
    "-=2",
  );

  // Logo: huruf tengah keluar, huruf pertama & terakhir bertemu di tengah, lalu naik ke atas.
  introTimeline.to(
    chars, {
      yPercent: (index) => {
        if (index === 0 || index === chars.length - 1) return 0;
        return index % 2 === 0 ? 100 : -100;
      },

      duration: 1,
      ease: "hop",
      stagger: 0.025,
      delay: 0.5,

      onStart: () => {
        if (!initialChar || !lastChar) return;

        [initialChar, lastChar].forEach((char) => {
          const mask = char.parentElement;

          if (mask?.classList.contains("char-mask")) {
            mask.style.overflow = "visible";
          }
        });

        // Kunci posisi vertikal sebelum mengukur.
        gsap.set([initialChar, lastChar], {
          y: 0,
          yPercent: 0,
        });

        // Tunggu layout Safari stabil sebelum mengukur.
        requestAnimationFrame(() => {
          const centerX = document.documentElement.clientWidth / 2;

          const firstRect = initialChar.getBoundingClientRect();

          const lastRect = lastChar.getBoundingClientRect();

          const firstX = centerX - firstRect.left - firstRect.width;

          const lastX = centerX - lastRect.left;

          gsap.to([initialChar, lastChar], {
            x: (index) => (index === 0 ? firstX : lastX),
            duration: 1,
            delay: 0.5,
            ease: "hop",

            onComplete: () => {
              gsap.to(".preloader-header", {
                top: "1.85rem",
                y: 0,
                scale: 0.54,
                zIndex: 1101,
                mixBlendMode: "normal",
                duration: 1.75,
                ease: "hop",

                onComplete: () => {
                  logoFinished = true;
                  tryStartScenes();
                },
              });
            },
          });
        });
      },
    },
    "-=2.5",
  );

  introTimeline.to(
    ".preloader", {
      clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
      duration: 1.75,
      ease: "hop",
    },
    "-=0.5",
  );

  introTimeline.to(
    ".hero-header h6 .line", {
      yPercent: 0,
      duration: 1,
      delay: 0.3,
      ease: "power4.out",
      stagger: 0.1,
    },
    "-=0.75",
  );

  introTimeline.to(
    ".hero-header h1 .line", {
      yPercent: 0,
      duration: 1,
      delay: 0.3,
      ease: "power4.out",
      stagger: 0.1,
    },
    "-=0.75",
  );

  // ==========================================
  // 3. HELPER SCENE (dipakai hero & outro)
  // ==========================================

  // Waktu (0–1) tiap elemen di timeline zoom.
  // Mobile lebih awal & lebih lambat.
  const timing = (isMobile) =>
    isMobile ? {
      center: 0.3,
      copy: 0.45,
      fillStart: 0.48 * 2,
      fillLen: 0.45 * 2,
      fillDur: 0.08,
    } : {
      center: 0.47,
      copy: 0.62,
      fillStart: 0.66,
      fillLen: 0.27,
      fillDur: 0.04,
    };

  const scenePin = (trigger, screens) => ({
    trigger,
    start: "top top",
    end: () => `+=${Math.round(window.innerHeight * screens)}`,
    pin: true,
    pinSpacing: true,
    scrub: 1.2,
    anticipatePin: 1,
    invalidateOnRefresh: true,
  });

  const sceneParts = (scene) => ({
    sky: $(".sky-container", scene),
    cloudBack: $(".cloud-back", scene),
    cloudFront: $(".cloud-front", scene),
    win: $(".window-container", scene),
    header: $(".scene-header", scene),
    copy: $(".scene-copy", scene),
  });

  // Pecah teks menjadi kata:
  // lapisan shadow (redup) + fill (putih, dianimasikan).
  function splitWordFills(element) {
    if (!element) return [];

    const split = SplitText.create(element, {
      type: "words",
      wordsClass: "gradient-word",
    });

    return split.words.map((word) => {
      const text = word.textContent;

      const shadow = document.createElement("span");
      shadow.className = "word-shadow";
      shadow.textContent = text;

      const fill = document.createElement("span");
      fill.className = "word-fill";
      fill.textContent = text;

      word.replaceChildren(shadow, fill);

      return fill;
    });
  }

  // Awan bergerak terus, tetapi dijeda saat scene di luar layar.
  const driftByScene = new Map();

  const driftObserver = new IntersectionObserver((entries) => {
    entries.forEach(({
      target,
      isIntersecting
    }) => {
      driftByScene
        .get(target)
        ?.forEach((tween) => (isIntersecting ? tween.resume() : tween.pause()));
    });
  });

  function driftClouds(scene) {
    const {
      cloudBack,
      cloudFront
    } = sceneParts(scene);

    driftByScene.set(scene, [
      gsap.to(cloudBack, {
        x: "35%",
        duration: 18,
        ease: "none",
        repeat: -1,
        yoyo: true,
        paused: true,
      }),

      gsap.to(cloudFront, {
        x: "25%",
        duration: 10,
        ease: "none",
        repeat: -1,
        yoyo: true,
        delay: 3,
        paused: true,
      }),
    ]);

    // Unobserve + observe memaksa callback awal.
    driftObserver.unobserve(scene);
    driftObserver.observe(scene);
  }

  // ==========================================
  // 4. HERO (zoom in menembus pintu)
  // ==========================================
  function buildHero(isMobile, fills) {
    const scene = $(".scene-hero");

    const {
      sky,
      cloudBack,
      cloudFront,
      win,
      header,
      copy
    } = sceneParts(scene);

    const center = $(".hero-center", scene);
    const heroText = $(".hero-copy h2", scene);
    const t = timing(isMobile);

    const skyDistance = () =>
      Math.max(0, sky.offsetHeight - scene.clientHeight);

    // Durasi keseluruhan scene hero.
    // Memberi ruang scroll untuk teks bergerak keluar layar.
    const heroScreens = isMobile ? 16 : 9.5;

    // Akhir animasi pengisian kata terakhir.
    const denominator = Math.max(fills.length - 1, 1);
    const fillEnd = t.fillStart + t.fillLen + t.fillDur;

    const textExitStart = fillEnd + 0.12;
    const textExitDuration = 0.01;
    const cloudFadeDuration = 1;

    const tl = gsap.timeline({
      scrollTrigger: scenePin(scene, heroScreens),
    });

    // Animasi utama hero.
    tl.to(
        win, {
          scale: 32,
          duration: 0.75,
          ease: "none",
        },
        0,
      )
      .to(
        header, {
          scale: 7,
          z: 800,
          duration: 0.5,
          ease: "none",
        },
        0,
      )
      .to(
        header, {
          scale: 9,
          z: 1000,
          duration: 0.5,
          ease: "none",
        },
        0.5,
      )
      .to(
        header, {
          opacity: 0,
          duration: 0.15,
          ease: "none",
        },
        0.35,
      )
      .to(
        sky, {
          y: () => -skyDistance(),
          duration: 1,
          ease: "none",
        },
        0,
      )
      .to(
        cloudBack, {
          y: () => -skyDistance() * 0.25,
          duration: 1,
          ease: "none",
        },
        0,
      )
      .to(
        cloudFront, {
          y: () => -skyDistance() * 0.45,
          duration: 1,
          ease: "none",
        },
        0,
      )
      .to(
        center, {
          autoAlpha: 0,
          y: -120,
          scale: 0.97,
          duration: 0.45,
          ease: "none",
          opacity: 0,
        },
        t.center,
      )
      .to(
        copy, {
          autoAlpha: 1,
          duration: 0.001,
          ease: "none",
        },
        t.copy,
      );

    // Hero text fade in.
    gsap.set(heroText, {
      opacity: 0,
      autoAlpha: 1,
    });

    tl.to(
      heroText, {
        opacity: 1,
        duration: Math.max(0.12, t.fillStart - t.center),
        ease: "none",
      },
      t.center * 1.2,
    );

    // WORD-FILL: mengisi tulisan satu per satu.
    fills.forEach((fill, i) => {
      tl.to(
        fill, {
          opacity: 1,
          duration: t.fillDur,
          ease: "none",
        },
        t.fillStart + (i / denominator) * t.fillLen,
      );
    });

    // Cloud menghilang.
    tl.to(
      [cloudBack, cloudFront], {
        opacity: 0,
        duration: cloudFadeDuration * 0.5,
        ease: "power2.out",
      },
      textExitStart,
    );

    // Hero text bergerak keluar layar dengan lebih lambat.
    tl.to(
      heroText, {
        y: () => -(window.innerHeight + heroText.offsetHeight) * 0.45,
        autoAlpha: 0,
        opacity: 0,
        duration: textExitDuration + 0.75,
        ease: "power2.out",
      },
      textExitStart,
    );

    driftClouds(scene);
  }

  // ==========================================
  // 5. INTRO
  // pan langit -> kartu groom -> pan kanan -> kartu bride
  // ==========================================
  const CLIP = {
    hiddenBottom: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",

    visible: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",

    hiddenTop: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
  };

  // Durasi utama intro dan transisi background setelah bride keluar.
  const STORY_BASE_UNITS = 6.62;
  const BG_RETURN_DURATION = 1.4;
  const STORY_UNITS = STORY_BASE_UNITS + BG_RETURN_DURATION;

  const GROOM = {
    enter: 0.26,
    photo: 0.62,
    scan: 0.91,
    id: 0.88,
    name: 0.98,
    rows: 1.18,
    exit: 2.62,
    exitDur: 0.48,
  };

  const BRIDE = {
    enter: 3.22,
    photo: 3.82,
    scan: 4.11,
    id: 4.08,
    name: 4.2,
    rows: 4.4,
    exit: 6.12,
    exitDur: 0.5,
  };

  // Pan background ke kanan.
  const PAN = {
    start: 1.98,
    duration: 2.75,
  };

  const cardParts = (panel) => ({
    card: $(".intro-card", panel),
    inner: $(".intro-card-inner", panel),
    photo: $(".intro-photo-wrap", panel),
    img: $(".intro-photo-wrap img", panel),
    scan: $(".intro-photo-scan-line", panel),
    id: $(".intro-card-id", panel),
    name: $(".intro-name", panel),
    rows: gsap.utils.toArray(".intro-data-row", panel),
  });

  function initCard(c) {
    gsap.set(c.card, {
      autoAlpha: 0,
      clipPath: CLIP.hiddenBottom,
    });

    gsap.set(c.inner, {
      scale: 1.18,
      transformOrigin: "center center",
    });

    gsap.set(c.photo, {
      clipPath: "inset(100% 0% 0% 0%)",
    });

    gsap.set(c.img, {
      scale: 1.18,
    });

    gsap.set([c.id, c.name, ...c.rows], {
      autoAlpha: 0,
      y: 12,
    });

    gsap.set(c.scan, {
      autoAlpha: 0,
      top: "0%",
    });
  }

  function revealCard(tl, c, t, at) {
    tl.to(
        c.card, {
          autoAlpha: 1,
          clipPath: CLIP.visible,
          duration: 0.72,
          ease: "hop",
        },
        at(t.enter),
      )
      .to(
        c.inner, {
          scale: 1,
          duration: 0.9,
          ease: "hop",
        },
        at(t.enter),
      )
      .to(
        c.photo, {
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 0.3,
          ease: "hop",
        },
        at(t.photo),
      )
      .to(
        c.img, {
          scale: 1,
          duration: 0.55,
          ease: "hop",
        },
        at(t.photo),
      )
      .to(
        c.scan, {
          autoAlpha: 1,
          top: "100%",
          duration: 0.24,
          ease: "none",
        },
        at(t.scan),
      )
      .to(
        c.id, {
          autoAlpha: 1,
          y: 0,
          duration: 0.12,
          ease: "power2.out",
        },
        at(t.id),
      )
      .to(
        c.name, {
          autoAlpha: 1,
          y: 0,
          duration: 0.16,
          ease: "power2.out",
        },
        at(t.name),
      );

    c.rows.forEach((row, i) => {
      tl.to(
        row, {
          autoAlpha: 1,
          y: 0,
          duration: 0.13,
          ease: "power2.out",
        },
        at(t.rows + i * 0.1),
      );
    });
  }

  function hideCard(tl, c, t, at) {
    tl.to(
      c.card, {
        autoAlpha: 0,
        clipPath: CLIP.hiddenTop,
        duration: t.exitDur,
        ease: "hop",
      },
      at(t.exit),
    ).to(
      c.inner, {
        scale: 1.16,
        duration: t.exitDur,
        ease: "hop",
      },
      at(t.exit),
    );
  }

  // ==========================================
  // OUTRO ELEMENTS
  // ==========================================
  const outroScene = $(".scene-outro");

  const outroBg = $(".outro-background", outroScene);
  const outroWin = $(".window-container", outroScene);
  const outroHeader = $(".outro-header", outroScene);

  // Beri class khusus untuk styling fixed overlay.
  outroBg.classList.add("outro-overlay-bg");
  outroWin.classList.add("outro-overlay-window");
  outroHeader.classList.add("outro-overlay-header");

  // Pindahkan elemen keluar dari scene-outro.
  document.body.append(outroBg, outroWin, outroHeader);

  // Split teks outro satu kali di luar buildIntro.
  // Dengan begitu outroHeaderLines sudah tersedia saat initial state dibuat,
  // dan SplitText tidak dibuat ulang setiap breakpoint berubah.
  const splitOutroHeader = SplitText.create(
    ".outro-header h1, .outro-header p", {
      type: "lines",
      linesClass: "line",
      mask: "lines",
    }
  );

  const outroHeaderLines = splitOutroHeader.lines;

  // ==========================================
  // 6. INTRO TIMELINE
  // ==========================================
  function buildIntro(isMobile) {
    const section = $(".intro-section");
    const bg = $(".intro-bg", section);

    const groom = cardParts($(".intro-panel--groom", section));

    const bride = cardParts($(".intro-panel--bride", section));

    [groom, bride].forEach(initCard);

    // Initial state outro overlay.
    gsap.set(outroBg, {
      yPercent: 100,
      scale: 1,
      transformOrigin: "center center",
    });

    gsap.set(outroWin, {
      autoAlpha: 0,
      scale: 24,
      transformOrigin: "center center",
    });

    gsap.set(outroHeader, {
      autoAlpha: 0,
      scale: 1,
      transformOrigin: "center center",
    });

    gsap.set(outroHeaderLines, {
      yPercent: 100,
    });

    // Mobile: gambar 3x lebar layar dan jauh lebih tinggi dari layar.
    // Desktop: tinggi gambar = layar.
    const verticalDistance = () =>
      Math.max(0, bg.offsetHeight - section.clientHeight);

    const horizontalDistance = () =>
      Math.max(0, bg.offsetWidth - section.clientWidth);

    const baseStoryScreens = isMobile ? 20 : 8;

    const storyScreens = baseStoryScreens * (STORY_UNITS / STORY_BASE_UNITS);

    const storyPx = window.innerHeight * storyScreens;

    // Memperlambat gerakan background ke atas.
    const BG_SCROLL_MULTIPLIER = 3.2;

    const leadIn =
      (STORY_UNITS * verticalDistance() * BG_SCROLL_MULTIPLIER) / storyPx;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: () =>
          `+=${Math.round(
            verticalDistance() * BG_SCROLL_MULTIPLIER +
            window.innerHeight * storyScreens,
          )}`,
        pin: true,
        pinSpacing: true,
        scrub: 1.6,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });

    tl.addLabel("story", leadIn);

    const at = (n) => `story+=${n}`;

    // FASE 0 (mobile saja):
    // gambar bergeser ke atas sampai bagian bawah gambar mentok.
    if (leadIn > 0) {
      tl.fromTo(
        bg, {
          y: () => verticalDistance(),
        }, {
          y: 0,
          duration: leadIn / 0.5,
          ease: "power4.Out",
        },
        0,
      );
    }

    // FASE 1: kartu groom masuk.
    revealCard(tl, groom, GROOM, at);

    // FASE 2: pan background ke kanan, kartu groom keluar.
    tl.to(
      bg, {
        x: () => -horizontalDistance(),
        duration: PAN.duration,
        ease: "power1.inOut",
      },
      at(PAN.start),
    );

    hideCard(tl, groom, GROOM, at);

    // FASE 3: kartu bride masuk lalu keluar.
    revealCard(tl, bride, BRIDE, at);
    hideCard(tl, bride, BRIDE, at);

    // FASE 4: background bergerak kembali ke bawah
    // setelah kartu bride selesai keluar.
    tl.to(
      bg, {
        y: () => verticalDistance() * 1.5,
        // scale: 1.5,
        duration: BG_RETURN_DURATION,
        ease: "power1.inOut",
      },
      at(STORY_BASE_UNITS),
    );

    // ==========================================
    // OUTRO REVEAL
    // ==========================================

    const OUTRO_DURATION = BG_RETURN_DURATION * 5.5;

    const OUTRO_REVEAL_START = at(STORY_BASE_UNITS * 0.5);

    // Background foto bergerak naik dari bawah layar.
    tl.to(
      outroBg, {
        yPercent: 0,
        duration: OUTRO_DURATION * 0.65,
        ease: "power1.inOut",
      },
      OUTRO_REVEAL_START
    );

    // Window Naya muncul dari zoom besar ke ukuran normal.
    tl.fromTo(
      outroWin, {
        scale: 24,
        autoAlpha: 0,
        backgroundColor: "transparent",
      }, {
        scale: 1,
        autoAlpha: 1,
        backgroundColor: "transparent",
        duration: OUTRO_DURATION * 0.65,
        ease: "power1.inOut",
        immediateRender: false,
      },
      OUTRO_REVEAL_START
    );

    // Header muncul.
    const OUTRO_HEADER_START = at(STORY_BASE_UNITS * 1.15);

    tl.set(
      outroHeader, {
        autoAlpha: 1,
      },
      OUTRO_HEADER_START
    );

    tl.to(
      outroHeaderLines, {
        yPercent: 0,
        duration: 1,
        ease: "power4.out",
        stagger: 0.1,
      },
      OUTRO_HEADER_START
    );
  }

  // ==========================================
  // 7. OUTRO
  // ==========================================
  function buildOutro(isMobile) {
    const scene = $(".scene-outro");

    if (!scene || !outroBg || !outroWin || !outroHeader) return;

    const screens = isMobile ? 6.5 : 8.5;

    const tl = gsap.timeline({
      scrollTrigger: scenePin(scene, screens),
    });

    // BACKGROUND FOTO
    // Scale 1 -> 2
    tl.fromTo(
      outroBg, {
        scale: 1,
        yPercent: 0,
        transformOrigin: "center center",
      }, {
        scale: 2,
        yPercent: 0,
        duration: 0.15,
        ease: "power1.inOut",
        immediateRender: false,
      },
      0.01
    );


    // WINDOW NAYA
    // Scale 1 -> 6
    tl.fromTo(
      outroWin, {
        scale: 1,
        autoAlpha: 1,
        transformOrigin: "center center",
      }, {
        scale: 6,
        autoAlpha: 0,
        duration: 0.15,
        ease: "power1.inOut",
        immediateRender: false,
      },
      0.01
    );

    // OUTRO HEADER
    // Scale 1 -> 3
    tl.fromTo(
      outroHeader, {
        scale: 1,
        autoAlpha: 1,
        transformOrigin: "center center",
      }, {
        scale: 3,
        autoAlpha: 0,
        duration: 0.15,
        ease: "power1.inOut",
        immediateRender: false,
      },
      0.01
    );

    driftClouds(scene);
  }

  // ==========================================
  // 9. LOCATION SECTION
  // ==========================================
  function buildLocationSection() {
    const section = $(".location-section");

    if (!section) return;

    const stage = $(".location-stage", section);

    const imageCards = Array.from(
      section.querySelectorAll("[data-location-image]"),
    );

    const titleLines = Array.from(
      section.querySelectorAll("[data-location-line]"),
    );

    // Initial state.
    gsap.set(stage, {
      clipPath: "inset(100% 0% 0% 0%)",
    });

    // Semua gambar masuk dari kanan.
    gsap.set(imageCards, {
      x: "110vw",
    });

    gsap.set(titleLines, {
      yPercent: 125,
      rotate: 2.5,
    });

    // Main animation.
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: "bottom bottom",
        scrub: 1.2,
        invalidateOnRefresh: true,
      },
    });

    // Stage reveals from bottom to top.
    tl.to(
      stage, {
        clipPath: "inset(0% 0% 0% 0%)",
        duration: 0.2,
        ease: "none",
      },
      0,
    );

    // All images enter from the right.
    tl.to(
      imageCards, {
        x: 0,
        duration: 0.52,
        stagger: 0.04,
        ease: "power2.out",
      },
      0.12,
    );

    // Title reveals from below.
    tl.to(
      titleLines, {
        yPercent: 0,
        rotate: 0,
        duration: 0.22,
        stagger: 0.08,
        ease: "power2.out",
      },
      0.42,
    );
  }

  // ==========================================
  // 9. START SEMUA SCENE
  // ==========================================
  function startScenes() {
    const required = [
      ".scene-hero",
      ".hero-center",
      ".intro-section",
      ".scene-outro",
    ];

    if (!required.every((selector) => $(selector))) {
      console.error("Scene tidak lengkap. Periksa selector HTML:", required);

      lenis.start();
      return;
    }

    // Pecah teks hero saja menjadi word-fill.
    // Paragraf outro tidak lagi menggunakan animasi word-fill.
    const heroFills = splitWordFills($(".scene-hero .scene-copy h2"));

    gsap.set($(".scene-hero .scene-copy"), {
      autoAlpha: 0,
    });

    gsap.set(heroFills, {
      opacity: 0,
    });

    // Semua ScrollTrigger dibuat dalam satu urutan:
    // hero -> intro -> outro -> location.
    // Otomatis dibangun ulang saat breakpoint berubah.
    const build = (isMobile) => {
      buildHero(isMobile, heroFills);
      buildIntro(isMobile);
      buildOutro(isMobile);
      buildLocationSection();
    };

    const mm = gsap.matchMedia();

    mm.add("(max-width: 767px)", () => build(true));
    mm.add("(min-width: 768px)", () => build(false));

    ScrollTrigger.refresh();
    lenis.start();
  }
});