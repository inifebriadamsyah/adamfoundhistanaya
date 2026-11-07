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

  const guestSlug = (
    urlParams.get("to") || ""
  ).trim().toLowerCase();

  // DATA DEMO SEMENTARA
  // Nantinya data ini akan diambil dari Supabase.
  const demoGuests = {
    "demo-andi": "Bapak Andi",
    "pegawai-kantor": "Pegawai di Kantor",
    "audy-instania-narita": "Audy Instania Narita",
    "nadia-nabila-salma": "Nadia Nabila Salma",
    "syafriaz-zulfa-m": "Syafriaz Zulfa M.",
  };

  // Cari nama penerima.
  const guestName = demoGuests[guestSlug] || "Tamu Undangan";

  // Tampilkan nama ke HTML.
  guestHeading.textContent = guestName;

  // Simpan informasi tamu yang sedang membuka undangan.
  window.invitationGuest = {
    slug: guestSlug,
    displayName: guestName,
  };

  console.log("Guest invitation:", window.invitationGuest);
})();