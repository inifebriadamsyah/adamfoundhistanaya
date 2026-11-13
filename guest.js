// ==========================================
// GUEST INVITATION PERSONALIZATION
// ==========================================

window.guestReady = (async () => {
  const guestHeading = document.querySelector("[data-guest-name]");

  if (!guestHeading) {
    console.warn("Guest name element tidak ditemukan.");
    return;
  }

  // Ambil kode penerima dari URL.
  const urlParams = new URLSearchParams(window.location.search);

  const guestSlug = (urlParams.get("to") || "").trim().toLowerCase();

  // DATA TAMU
  const theGuests = {
    "demo-andi": "Wempy Ananta Gordon",
    "kemenag-kota-madiun": "Keluarga Besar Kantor Kemenag Kota Madiun",
    "pimpinan-kantor": "Pimpinan Kantor Kemenag Kota Madiun",
    "audy-instania-narita": "Audy Instania Narita",
    "nadia-nabila-salma": "Nadia Nabila Salma",
    "syafriaz-zulfa-m": "Syafriaz Zulfa M.",
    "⁠haifa-mandalika": "⁠Haifa Mandalika",
    "pray-sally": "⁠Pray Sally F. B. D. G.",
    "lydia-safira": "Lydia Safira N. Q.",
    "anggi-sri-fatmawati": "Anggi Sri Fatmawati",
    "rosyiidah-hasna": "Rosyiidah Hasna",
    "norliya-rachmawati": "Norliya Rachmawati",
    "feri-afrianto": "Feri Afrianto",
    "rizki-ahmad-fauzi": "Rizki Ahmad Fauzi",
    "muhammad-zainuddin": "Muhammad Zainuddin",
    "dimas-rizal-kusuma-shindu": "Dimas Rizal Kusuma Shindu",
    "ubai-yusuf-siraj-samudera": "Ubai Yusuf Siraj Samudera",
    "zulfikar-fahmi-haedar": "Zulfikar Fahmi Haedar",
    "saifuddin-nurul-muhti": "Saifuddin Nurul Muhti",
    "ferdian-dwi-cahyo": "Ferdian Dwi Cahyo",
    "aldy-syah-humaira": "Aldy Syah Daviq R. & Humaira Nur Pradani ",
    "syafrie-dwi-faisal": "Syafrie Dwi Faisal",
    "farhan-aji-pratama": "Farhan Aji Pratama",
    "yoga-faisal-nur": "Yoga Faisal Nur",
    "imam-muslim-luthfiana-ratna-wati": "Imam Muslim & Luthfiana Ratna Wati",
    "m-nur-shoim-fuadati-mushaffa": "M. Nur Shoim & Fuadati Mushaffa",
    "m-shodiq-wahyudi": "M. Shodiq Wahyudi",
    "eko-purnomo": "Eko Purnomo",
    "melani-vira-anissa-n-a": "Melani Vira Anissa N. A."
  };

  // Cari nama penerima.
  const guestName = theGuests[guestSlug] || "Nama Tamu Undangan";

  // Tampilkan nama pada hero.
  guestHeading.textContent = guestName;

  // Ubah title pada tab browser.
  document.title = `Adam finally found his Hawa - Undangan Tasyakuran Pernikahan kepada ${guestName}`;

  // Simpan informasi tamu.
  window.invitationGuest = {
    slug: guestSlug,
    displayName: guestName,
  };

  console.log("Guest invitation:", window.invitationGuest);
})();