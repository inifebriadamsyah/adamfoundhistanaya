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
    "feri-afrianto": "Feri Afrianto"
  };

  // Cari nama penerima.
  const guestName = theGuests[guestSlug] || "Tamu Undangan";

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
