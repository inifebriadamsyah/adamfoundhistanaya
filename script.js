if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

window.scrollTo(0, 0);

window.addEventListener("pageshow", () => {
  window.scrollTo(0, 0);
});

document.addEventListener("DOMContentLoaded", async () => {
  if (document.fonts?.ready) await document.fonts.ready;

  gsap.registerPlugin(ScrollTrigger, CustomEase, SplitText);
  CustomEase.create("hop", "0.9, 0, 0.1, 1");

  // Address bar mobile tidak memicu refresh berlebihan.
  ScrollTrigger.config({
    ignoreMobileResize: true,
  });

  const $ = (selector, root = document) => root.querySelector(selector);

  // 1. LENIS

  const lenis = new Lenis({
    autoRaf: false,
    smoothWheel: true,
    syncTouch: true,
    infinite: false,
    overscroll: false,
  });

  lenis.on("scroll", ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);
  lenis.stop();

  // 2. PRELOADER
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

  // Progress bar.
  gsap.set(".progress-bar", {
    scaleX: 0,
    transformOrigin: "left",
  });

  // Preloader images.
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
    console.log("[PRELOADER]", {
      introFinished,
      logoFinished,
      scenesStarted,
    });

    if (introFinished && logoFinished && !scenesStarted) {
      window.scrollTo(0, 0);

      lenis.scrollTo(0, {
        immediate: true,
        force: true,
      });

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

  // Logo animation.
  introTimeline.to(
    chars, {
    yPercent: (index) => {
      if (index === 0 || index === chars.length - 1) {
        return 0;
      }

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

      gsap.set([initialChar, lastChar], {
        y: 0,
        yPercent: 0,
      });

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

  // 3. HELPER SCENE
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

  // WORD FILL

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

  // CLOUD DRIFT
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

    if (!cloudBack || !cloudFront) return;

    const tweens = [
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
    ];

    driftByScene.set(scene, tweens);

    driftObserver.unobserve(scene);
    driftObserver.observe(scene);
  }

  // 4. HERO
  function buildHero(isMobile, fills) {
    const scene = $(".scene-hero");

    if (!scene) {
      console.error("Hero section tidak ditemukan.");
      return;
    }

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

    const paperPlane = $(".hero-paper-plane", scene);
    const coupleParallax = $(".hero-couple-parallax", scene);

    const parallaxTopTrack = $(
      ".hero-parallax-row--top .hero-parallax-track",
      scene,
    );

    const parallaxBottomTrack = $(
      ".hero-parallax-row--bottom .hero-parallax-track",
      scene,
    );

    if (
      !sky ||
      !cloudBack ||
      !cloudFront ||
      !win ||
      !header ||
      !copy ||
      !center ||
      !heroText
    ) {
      console.error("Elemen hero tidak lengkap.");
      return;
    }

    const skyDistance = () =>
      Math.max(0, sky.offsetHeight - scene.clientHeight);

    // Semua perangkat memakai durasi scroll mobile.
    const heroScreens = 16;

    const denominator = Math.max(fills.length - 1, 1);

    const fillEnd = t.fillStart + t.fillLen + t.fillDur;

    const textExitStart = fillEnd + 0.12;
    const textExitDuration = 0.01;
    const cloudFadeDuration = 1;

    const tl = gsap.timeline({
      scrollTrigger: scenePin(scene, heroScreens),
    });

    tl.to(
      win, {
      scale: 20,
      duration: 0.95,
      ease: "none",
    },
      0,
    )
      .to(
        header, {
        scale: 2,
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

    // Word fill.
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

    // Animasi awal cloud selesai pada timeline position 1.
    const cloudDriftStart = Math.max(1, t.fillStart);

    const cloudDriftDuration = Math.max(0.01, fillEnd - cloudDriftStart);

    // CLOUD BACK
    tl.to(
      cloudBack, {
      y: () => -skyDistance() * 0.25 - window.innerHeight * 0.25,
      duration: cloudDriftDuration,
      ease: "none",
    },
      cloudDriftStart,
    );

    // CLOUD FRONT
    tl.to(
      cloudFront, {
      y: () => -skyDistance() * 0.45 - window.innerHeight * 0.125,
      duration: cloudDriftDuration,
      ease: "none",
    },
      cloudDriftStart,
    );

    // PAPER PLANE: FOLLOW HERO TEXT FILL
    if (paperPlane) {
      const planeStartX = () => scene.clientWidth + paperPlane.offsetWidth;

      const planeEndX = () => -paperPlane.offsetWidth;

      gsap.set(paperPlane, {
        autoAlpha: 0,
        x: planeStartX(),
        y: 0,
        scale: 2,
        rotation: 7,
      });

      tl.fromTo(
        paperPlane, {
        autoAlpha: 1,
        x: planeStartX,
        y: -400,
        scale: 1.25,
        rotation: 7,
      }, {
        autoAlpha: 1,
        x: planeEndX,
        y: -104,
        scale: 1.55,
        rotation: 15,
        duration: fillEnd - t.fillStart,
        ease: "none",
        immediateRender: false,
      },
        t.fillStart,
      );

      tl.set(
        paperPlane, {
        autoAlpha: 0,
      },
        fillEnd,
      );
    }

    // CLOUD FADE
    tl.to(
      [cloudBack, cloudFront], {
      opacity: 0,
      duration: cloudFadeDuration * 0.5,
      ease: "power2.out",
    },
      textExitStart,
    );

    // HERO TEXT EXIT
    tl.to(
      heroText, {
      y: () => -(window.innerHeight + heroText.offsetHeight) * 0.65,
      autoAlpha: 0,
      opacity: 0,
      duration: textExitDuration + 0.75,
      ease: "power2.out",
    },
      textExitStart,
    );


    // HERO COUPLE TEXT PARALLAX
    // CONTINUOUS REPEATING TEXT
    if (
      coupleParallax &&
      parallaxTopTrack &&
      parallaxBottomTrack
    ) {

      // 1. REPEAT TEXT CONTENT
      function repeatParallaxTrack(track, requiredWidth) {

        // Bersihkan clone jika fungsi dipanggil kembali.
        track
          .querySelectorAll("[data-parallax-clone]")
          .forEach((clone) => clone.remove());

        // Dua span asli dari HTML menjadi template.
        const originalItems = Array.from(track.children);

        if (!originalItems.length) return;

        // Tambahkan pasangan teks sampai panjang track mencukupi.
        let iterations = 0;

        while (
          track.scrollWidth < requiredWidth &&
          iterations < 40
        ) {

          originalItems.forEach((item) => {
            const clone = item.cloneNode(true);

            clone.dataset.parallaxClone = "true";
            clone.setAttribute("aria-hidden", "true");

            track.appendChild(clone);
          });

          iterations++;
        }
      }

      // Track dibuat cukup panjang untuk menampung seluruh perjalanan.
      // 4.8 kali lebar viewport menjaga baris atas tetap terisi.
      repeatParallaxTrack(
        parallaxTopTrack,
        scene.clientWidth * 4.8
      );

      repeatParallaxTrack(
        parallaxBottomTrack,
        scene.clientWidth * 4.8
      );

      // 2. PARALLAX TIMING
      // Mulai bersamaan dengan heroText mulai keluar.
      const parallaxStart = textExitStart;

      // Ambil durasi timeline sebelum tween parallax ditambahkan.
      const parallaxEnd = tl.duration();

      const parallaxDuration = Math.max(
        0,
        parallaxEnd - parallaxStart
      );

      if (parallaxDuration > 0) {

        // 3. INITIAL POSITION
        // Saat halaman pertama kali dibuka,
        // kedua baris berada di luar layar bagian bawah.
        gsap.set(coupleParallax, {
          y: () => scene.clientHeight * 0.18,
        });

        // Baris atas dimulai dari kiri.
        gsap.set(parallaxTopTrack, {
          x: 0,
        });

        // Baris bawah dimulai sedikit ke kiri,
        // sehingga pergerakannya nanti menuju kanan.
        gsap.set(parallaxBottomTrack, {
          x: () => -scene.clientWidth * 2.37,
        });


        // 4. VERTICAL MOVEMENT

        // Masuk dari bawah saat heroText mulai exit,
        // kemudian bergerak naik melewati layar.
        tl.to(
          coupleParallax, {
          y: () => -scene.clientHeight * 1.16,
          duration: parallaxDuration,
          ease: "none",
        },
          parallaxStart
        );

        // 5. TOP ROW: MOVE LEFT
        tl.to(
          parallaxTopTrack, {
          x: () => -scene.clientWidth * 1.2,
          duration: parallaxDuration,
          ease: "none",
        },
          parallaxStart
        );

        // 6. BOTTOM ROW: MOVE RIGHT
        tl.to(
          parallaxBottomTrack, {
          x: 0,
          duration: parallaxDuration * 1.1,
          ease: "none",
        },
          parallaxStart
        );
      }
    }
    driftClouds(scene);
  }

  // 5. INTRO

  const CLIP = {
    hiddenBottom: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",

    visible: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",

    hiddenTop: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
  };

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
    exitDur: 0.68,
  };

  const BRIDE = {
    enter: 3.22,
    photo: 3.82,
    scan: 4.11,
    id: 4.08,
    name: 4.2,
    rows: 4.4,
    exit: 6.12,
    exitDur: 0.7,
  };

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

  // 6. OUTRO ELEMENTS

  const outroScene = $(".scene-outro");
  const main = $("main");

  if (!outroScene || !main) {
    console.error("Scene outro atau main tidak ditemukan.");
    lenis.start();
    return;
  }

  const outroBg = $(".outro-background", outroScene);
  const outroBgZoom = $(".outro-bg-zoom", outroBg);

  const outroPoster = $(".outro-prelocation", outroScene);
  const outroPosterCopy = $(".outro-prelocation-copy", outroScene);

  const outroWin = $(".window-container", outroScene);
  const outroWinZoom = $(".outro-window-zoom", outroWin);

  const outroHeader = $(".outro-header", outroScene);

  if (!outroBg || !outroBgZoom || !outroWin || !outroWinZoom || !outroHeader) {
    console.error("Elemen outro tidak lengkap.");
    lenis.start();
    return;
  }

  // Berikan class overlay.
  outroBg.classList.add("outro-overlay-bg");
  outroWin.classList.add("outro-overlay-window");
  outroHeader.classList.add("outro-overlay-header");

  // Buat clipping viewport.
  const outroViewport = document.createElement("div");
  outroViewport.className = "outro-overlay-viewport";

  // Pindahkan elemen outro ke viewport.
  outroViewport.append(outroBg, outroWin, outroHeader);

  if (outroPoster) {
    outroViewport.appendChild(outroPoster);
  }

  if (outroPosterCopy) {
    outroViewport.appendChild(outroPosterCopy);
  }

  // PENTING:
  // Masukkan viewport ke dalam main agar elemen tidak terlepas
  // dari DOM setelah dipindahkan.
  main.appendChild(outroViewport);

  // Sembunyikan sebelum OUTRO REVEAL dimulai.
  gsap.set(outroViewport, {
    autoAlpha: 0,
  });

  // SPLITTEXT OUTRO HEADER

  const splitOutroHeader = SplitText.create(
    ".outro-header h1, .outro-header p", {
    type: "lines",
    linesClass: "line",
    mask: "lines",
  },
  );

  const outroHeaderLines = splitOutroHeader.lines;

  // SPLITTEXT PRELOCATION COPY

  let splitOutroCopy = null;
  let outroCopyLines = [];

  if (outroPosterCopy) {
    const copyParagraph = $("p", outroPosterCopy);

    if (copyParagraph) {
      splitOutroCopy = SplitText.create(copyParagraph, {
        type: "lines",
        linesClass: "line",
        mask: "lines",
      });

      outroCopyLines = splitOutroCopy.lines;
    }
  }

  // Kondisi awal teks poster.
  gsap.set(outroCopyLines, {
    yPercent: 115,
  });

  if (outroPosterCopy) {
    gsap.set(outroPosterCopy, {
      autoAlpha: 0,
    });
  }

  // 7. INTRO TIMELINE

  function buildIntro(isMobile) {
    const section = $(".intro-section");

    if (!section) {
      console.error("Intro section tidak ditemukan.");
      return;
    }

    const bg = $(".intro-bg", section);

    const groom = cardParts($(".intro-panel--groom", section));

    const bride = cardParts($(".intro-panel--bride", section));

    [groom, bride].forEach(initCard);

    // Background bergerak dari bawah.
    gsap.set(outroBg, {
      yPercent: 100,
    });

    // Background zoom dimulai dari normal.
    gsap.set(outroBgZoom, {
      scale: 1,
      xPercent: 0,
      transformOrigin: "center center",
    });

    // Prelocation poster disembunyikan selama intro.
    if (outroPoster) {
      gsap.set(outroPoster, {
        autoAlpha: 0,
        xPercent: 0,
        scale: 3,
        transformOrigin: "center center",
      });
    }

    // Teks poster juga disembunyikan.
    if (outroPosterCopy) {
      gsap.set(outroPosterCopy, {
        autoAlpha: 0,
      });
    }

    gsap.set(outroCopyLines, {
      yPercent: 115,
    });

    // Window Naya.
    gsap.set(outroWin, {
      autoAlpha: 0,
    });

    gsap.set(outroWinZoom, {
      scale: 24,
      transformOrigin: "center center",
    });

    // Header.
    gsap.set(outroHeader, {
      autoAlpha: 0,
      scale: 1,
      transformOrigin: "center center",
    });

    gsap.set(outroHeaderLines, {
      yPercent: 100,
    });

    // Perhitungan jarak background.
    const verticalDistance = () =>
      Math.max(0, bg.offsetHeight - section.clientHeight);

    const horizontalDistance = () =>
      Math.max(0, bg.offsetWidth - section.clientWidth);

    // Selalu gunakan durasi scroll mobile.
    const baseStoryScreens = 20;

    const storyScreens = baseStoryScreens * (STORY_UNITS / STORY_BASE_UNITS);

    const storyPx = window.innerHeight * storyScreens;

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

    // FASE 0: background bergerak dari bawah ke posisi awal.
    if (leadIn > 0) {
      tl.fromTo(
        bg, {
        y: () => verticalDistance(),
      }, {
        y: 0,
        duration: leadIn / 0.5,
        ease: "power4.out",
      },
        0,
      );
    }

    // FASE 1: Groom masuk.
    revealCard(tl, groom, GROOM, at);

    // FASE 2: Background pan ke kanan.
    tl.to(
      bg, {
      x: () => -horizontalDistance(),
      duration: PAN.duration,
      ease: "power1.inOut",
    },
      at(PAN.start),
    );

    hideCard(tl, groom, GROOM, at);

    // FASE 3: Bride masuk dan keluar.
    revealCard(tl, bride, BRIDE, at);
    hideCard(tl, bride, BRIDE, at);

    // FASE 4: Background kembali ke bawah.
    tl.to(
      bg, {
      y: () => verticalDistance() * 1.5,
      duration: BG_RETURN_DURATION,
      ease: "power1.inOut",
    },
      at(STORY_BASE_UNITS),
    );


    // OUTRO REVEAL


    const OUTRO_DURATION = BG_RETURN_DURATION * 5.5;

    const OUTRO_REVEAL_DURATION = OUTRO_DURATION * 0.65;

    const OUTRO_REVEAL_OVERLAP = 0.22;

    const OUTRO_REVEAL_START = at(STORY_BASE_UNITS + OUTRO_REVEAL_OVERLAP);

    tl.set(
      outroViewport, {
      autoAlpha: 1,
    },
      OUTRO_REVEAL_START,
    );

    tl.fromTo(
      outroBg, {
      yPercent: 150,
      scale: 0,
    }, {
      yPercent: 4,
      duration: OUTRO_REVEAL_DURATION * 0.5,
      ease: "power1.inOut",
      immediateRender: false,
      scale: 0.7,
    },
      OUTRO_REVEAL_START,
    );

    tl.to(
      outroWin, {
      autoAlpha: 1,
      duration: 0.001,
    },
      OUTRO_REVEAL_START,
    );

    tl.fromTo(
      outroWinZoom, {
      scale: 6,
    }, {
      scale: 1,
      duration: OUTRO_REVEAL_DURATION * 0.25,
      ease: "power1.inOut",
      immediateRender: false,
    },
      OUTRO_REVEAL_START,
    );

    const OUTRO_HEADER_START = at(
      STORY_BASE_UNITS + OUTRO_REVEAL_DURATION * 0.5,
    );

    tl.set(
      outroHeader, {
      autoAlpha: 1,
    },
      OUTRO_HEADER_START,
    );

    tl.to(
      outroHeaderLines, {
      yPercent: 0,
      duration: 1,
      ease: "power4.out",
      stagger: 0.1,
    },
      OUTRO_HEADER_START,
    );
  }

  // 8. OUTRO

  function buildOutro(isMobile) {
    const scene = $(".scene-outro");

    if (
      !scene ||
      !outroBg ||
      !outroBgZoom ||
      !outroWin ||
      !outroWinZoom ||
      !outroHeader
    ) {
      console.error("Tidak dapat membangun outro.");
      return;
    }

    const screens = 14.5;

    const tl = gsap.timeline({
      scrollTrigger: scenePin(scene, screens),
    });

    // BACKGROUND PHOTO: Scale 0.7 -> 1.15.
    tl.fromTo(
      outroBg, {
      scale: 0.7,
      transformOrigin: "center center",
    }, {
      scale: 1.15,
      duration: 0.35,
      ease: "power1.inOut",
      immediateRender: false,
    },
      0.01,
    );

    // WINDOW NAYA: Scale 1 -> 6.
    tl.fromTo(
      outroWinZoom, {
      scale: 1,
      transformOrigin: "center center",
    }, {
      scale: 6,
      duration: 0.45,
      ease: "power1.inOut",
      immediateRender: false,
    },
      0.035,
    );

    // Window tetap terlihat selama zoom.
    tl.to(
      outroWin, {
      autoAlpha: 1,
      duration: 0.45,
      ease: "power1.inOut",
      immediateRender: false,
    },
      0.035,
    );

    // OUTRO HEADER: Scale 1 -> 3 lalu menghilang.
    tl.fromTo(
      outroHeader, {
      scale: 1,
      autoAlpha: 1,
      transformOrigin: "center center",
    }, {
      scale: 3,
      autoAlpha: 0,
      duration: 0.22,
      ease: "power1.inOut",
      immediateRender: false,
    },
      0.025,
    );


    // 1. PRELOCATION POSTER: ZOOM OUT
    if (outroPoster) {
      tl.to(
        outroPoster, {
        autoAlpha: 1,
        scale: 1,
        xPercent: -7.2,
        duration: 0.38,
        ease: "power2.out",
      },
        0.35,
      );
    }

    // 2. BACKGROUND SHIFT TO THE RIGHT
    tl.to(
      outroBgZoom, {
      xPercent: 15.5,
      scale: 0.86,
      transformOrigin: "center center",
      duration: 0.25,
      ease: "power1.inOut",
    },
      0.58,
    );

    // 3. PRELOCATION TEXT REVEAL
    const COPY_START = 0.82;
    const COPY_DURATION = 0.1;
    const COPY_STAGGER = 0.09;

    if (outroPosterCopy && outroCopyLines.length) {
      tl.set(
        outroPosterCopy, {
        autoAlpha: 1,
      },
        COPY_START,
      );

      tl.fromTo(
        outroCopyLines, {
        yPercent: 115,
      }, {
        yPercent: 0,
        duration: COPY_DURATION,
        stagger: COPY_STAGGER,
        ease: "power3.out",
        immediateRender: false,
      },
        COPY_START,
      );
    }

    // 4. HOLD / GAP BEFORE LOCATION
    const COPY_END =
      COPY_START +
      COPY_DURATION +
      Math.max(0, outroCopyLines.length - 1) * COPY_STAGGER;

    const LOCATION_GAP = 0.35;

    const locationGap = {
      progress: 0,
    };

    tl.to(
      locationGap, {
      progress: 1,
      duration: LOCATION_GAP,
      ease: "none",
    },
      COPY_END,
    );
  }

  // 9. LOCATION WORK SECTION
  function buildLocationSection() {
    const section = $(".location-section");

    if (!section) {
      console.warn("Location section tidak ditemukan.");
      return;
    }

    const stage = $(".location-stage", section);
    const workItem = $(".location-work-item", section);
    const backgroundImage = $(".location-image img", workItem);

    const photoCards = gsap.utils.toArray(
      ".location-photo-container",
      workItem,
    );

    const photoImages = gsap.utils.toArray(
      ".location-photo-container img",
      workItem,
    );

    const overlay = $(".location-item-overlay", workItem);

    const title = $(".location-title", workItem);

    const titleLines = gsap.utils.toArray("[data-location-line]", title);

    if (
      !stage ||
      !workItem ||
      !backgroundImage ||
      photoCards.length !== 3 ||
      !overlay ||
      !title ||
      !titleLines.length
    ) {
      console.warn("Struktur location section belum lengkap.");

      return;
    }

    // GHOST SCROLL
    $(".location-ghost-container", section)?.remove();

    const ghostContainer = document.createElement("div");

    ghostContainer.className = "location-ghost-container";

    ghostContainer.setAttribute("aria-hidden", "true");

    const ghostItem = document.createElement("div");

    ghostItem.className = "location-ghost-item";
    ghostItem.style.height = "300vh";

    ghostContainer.appendChild(ghostItem);
    section.appendChild(ghostContainer);


    // INITIAL STATE
    gsap.set(stage, {
      clearProps: "clipPath",
    });

    gsap.set(workItem, {
      clipPath: "inset(100% 0% 0% 0%)",
    });

    // Background.
    gsap.set(backgroundImage, {
      scale: 1.4,
      yPercent: 10,
      opacity: 0.75,
      transformOrigin: "center center",
    });

    // Photo cards.
    gsap.set(photoCards, {
      x: () => window.innerWidth * 1.1,
      autoAlpha: 0,
    });

    gsap.set(photoImages, {
      scale: 1.04,
    });

    // Overlay.
    gsap.set(overlay, {
      autoAlpha: 0,
    });

    // Location text.
    gsap.set(title, {
      autoAlpha: 0,
    });

    gsap.set(titleLines, {
      yPercent: 125,
      rotation: 2.5,
    });

    // PHASE 1: WORK ITEM REVEAL
    const stStarting = {
      trigger: ghostItem,
      scrub: 1.2,
      start: "top bottom",

      // Durasi swipe lebih panjang dan lebih lambat.
      end: () =>
        `+=${Math.round(window.innerHeight * 1.35)}`,

      invalidateOnRefresh: true,
    };

    gsap.to(workItem, {
      clipPath: "inset(0% 0% 0% 0%)",
      ease: "none",
      scrollTrigger: stStarting,
    });

    // Background zoom.
    gsap.to(backgroundImage, {
      yPercent: 10,
      scale: 1.2,
      ease: "none",
      scrollTrigger: stStarting,
    });

    // PHASE 2: BACKGROUND DARKEN
    const stDarken = {
      trigger: ghostItem,
      scrub: 1,
      start: "top top",
      end: "35% top",
      invalidateOnRefresh: true,
    };

    gsap.to(backgroundImage, {
      opacity: 0.3,
      ease: "none",
      scrollTrigger: stDarken,
    });

    gsap.to(overlay, {
      autoAlpha: 0.22,
      ease: "none",
      scrollTrigger: stDarken,
    });

    // PHASE 3: THREE PHOTO CARDS SLIDE IN
    const stPhotos = {
      trigger: ghostItem,
      scrub: 1.3,
      start: "35% top",
      end: "92% top",
      invalidateOnRefresh: true,
    };

    gsap.to(photoCards, {
      x: 0,
      autoAlpha: 1,
      stagger: 0.12,
      duration: 1,
      ease: "none",
      scrollTrigger: stPhotos,
    });

    // PHASE 4: LOCATION TEXT
    const titleReveal = gsap.timeline({
      scrollTrigger: {
        trigger: ghostItem,
        start: "92% top",
        toggleActions: "play none none none",
        invalidateOnRefresh: true,
      },
    });

    titleReveal.to(
      title, {
      autoAlpha: 1,
      duration: 0.01,
    },
      0,
    );

    titleReveal.fromTo(
      titleLines, {
      yPercent: 125,
      rotation: 2.5,
    }, {
      yPercent: 0,
      rotation: 0,
      duration: 1.2,
      stagger: 0.08,
      ease: "power3.out",
      immediateRender: false,
    },
      0,
    );

    // PHASE 5: FINAL MOVEMENT
    const stFinal = {
      trigger: ghostItem,
      scrub: true,
      start: "92% top",
      end: "bottom top",
      invalidateOnRefresh: true,
    };

    gsap.to(overlay, {
      autoAlpha: 0.38,
      ease: "none",
      scrollTrigger: stFinal,
    });
  }

  // ==========================================
  // STICKY LOCATION FOOTER
  // ==========================================
  function buildLocationFooter() {
    const section = $(".location-section");
    const footer = $(".location-sticky-footer");

    if (!section || !footer) {
      console.warn("Location footer tidak ditemukan.");
      return;
    }

    // Kondisi awal: tersembunyi di bawah layar.
    gsap.set(footer, {
      autoAlpha: 0,
      y: 35,
    });

    // Animasi masuk.
    const footerReveal = gsap.to(footer, {
      autoAlpha: 1,
      y: 0,
      duration: 0.5,
      ease: "power3.out",
      paused: true,
    });

    // Tampilkan setelah location section mencapai bagian akhir.
    ScrollTrigger.create({
      trigger: section,
      start: "bottom bottom",
      end: "bottom top",

      invalidateOnRefresh: true,

      onEnter: () => {
        footerReveal.play();
      },

      onLeave: () => {
        footerReveal.play();
      },

      onEnterBack: () => {
        footerReveal.play();
      },

      onLeaveBack: () => {
        footerReveal.reverse();
      },
    });
  }

  // 10. START ALL SCENES
  function startScenes() {
    const required = [
      ".scene-hero",
      ".hero-center",
      ".intro-section",
      ".scene-outro",
      ".outro-background",
      ".outro-prelocation",
      ".outro-prelocation-copy",
      ".location-section",
    ];

    const missing = required.filter((selector) => !$(selector));

    if (missing.length) {
      console.error("Scene tidak lengkap. Periksa selector HTML:", missing);

      lenis.start();
      return;
    }

    try {
      console.log("[SCENE] Starting scene initialization...");

      // Word-fill hanya untuk hero.
      const heroFills = splitWordFills($(".scene-hero .scene-copy h2"));

      gsap.set($(".scene-hero .scene-copy"), {
        autoAlpha: 0,
      });

      gsap.set(heroFills, {
        opacity: 0,
      });

      buildHero(true, heroFills);
      buildIntro(true);
      buildOutro(true);
      buildLocationSection();
      buildLocationFooter();

      // Hitung ulang semua posisi setelah seluruh trigger dibuat.
      ScrollTrigger.refresh();

      console.log(
        "[SCENE] Initialization complete.",
        "Active ScrollTriggers:",
        ScrollTrigger.getAll().length,
      );

      lenis.start();
    } catch (error) {
      console.error("[SCENE INITIALIZATION ERROR]", error);

      // Jangan biarkan Lenis terkunci ketika terjadi error.
      lenis.start();
    }
  }
});