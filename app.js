// Auto-Generate Kode UPC (12 Digit)
function autoGenUPC() {
  const randomSuffix = Math.floor(10000000000 + Math.random() * 90000000000);
  document.getElementById('upc-input').value = `83${randomSuffix}`;
}

// Auto-Generate Kode ISRC (ID-FRW-26-XXXXX)
function autoGenISRC() {
  const random5Digits = Math.floor(10000 + Math.random() * 90000);
  document.getElementById('isrc-input').value = `ID-FRW-26-${random5Digits}`;
}

// Handlers Pilihan File
function handleAudioSelect(input) {
  if (input.files && input.files[0]) {
    document.getElementById('audio-status-text').innerText = `Terpilih: ${input.files[0].name}`;
    document.getElementById('audio-status-text').style.color = "#10b981";
  }
}

function handleCoverSelect(input) {
  if (input.files && input.files[0]) {
    document.getElementById('cover-status-text').innerText = `Terpilih: ${input.files[0].name}`;
    document.getElementById('cover-status-text').style.color = "#10b981";
  }
}

// Handler Submit Rilisan
document.getElementById('artist-release-form').addEventListener('submit', function(e) {
  e.preventDefault();

  const releaseData = {
    title: document.getElementById('title-input').value,
    artist: document.getElementById('artist-input').value,
    upc: document.getElementById('upc-input').value,
    isrc: document.getElementById('isrc-input').value,
    timestamp: new Date().toISOString()
  };

  alert(`Rilisan "${releaseData.title}" berhasil diunggah! Berkas akan ditinjau oleh Admin label.`);
  this.reset();
  document.getElementById('audio-status-text').innerText = "Klik atau seret file master di sini";
  document.getElementById('cover-status-text').innerText = "Klik atau seret gambar sampul";
});
