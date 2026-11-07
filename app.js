// Database memori sementara (In-Memory Repository)
let releasesDatabase = [];

// Tab Navigation Switching
function switchTab(tabName) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.btn-role').forEach(btn => btn.classList.remove('active'));

  if (tabName === 'artist') {
    document.getElementById('tab-artist').classList.add('active');
    document.getElementById('btn-portal-artist').classList.add('active');
  } else {
    document.getElementById('tab-admin').classList.add('active');
    document.getElementById('btn-panel-admin').classList.add('active');
    renderAdminTable();
  }
}

// Generator Kode Otomatis: UPC Code (12 Digit Barcode)
function generateUPC() {
  const randomSuffix = Math.floor(10000000000 + Math.random() * 90000000000);
  document.getElementById('upc-code').value = `8${randomSuffix}`;
}

// Generator Kode Otomatis: ISRC Code (Standard ID-NEX-26-XXXXX)
function generateISRC() {
  const random5Digits = Math.floor(10000 + Math.random() * 90000);
  document.getElementById('isrc-code').value = `ID-NEX-26-${random5Digits}`;
}

// Handle Form Submission (Portal Artis)
document.getElementById('release-form').addEventListener('submit', function(e) {
  e.preventDefault();

  const newRelease = {
    id: Date.now(),
    title: document.getElementById('release-title').value,
    artist: document.getElementById('artist-name').value,
    upc: document.getElementById('upc-code').value,
    isrc: document.getElementById('isrc-code').value,
    audioFile: document.getElementById('audio-file').files[0]?.name || 'master_audio.wav',
    coverFile: document.getElementById('cover-file').files[0]?.name || 'cover_art.jpg',
    status: 'Pending'
  };

  releasesDatabase.push(newRelease);
  alert(`Rilisan "${newRelease.title}" berhasil disimpan! Silakan periksa di Panel Admin.`);
  this.reset();
});

// Render Dynamic Table (Panel Admin)
function renderAdminTable() {
  const tbody = document.getElementById('admin-table-body');
  tbody.innerHTML = '';

  if (releasesDatabase.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color: #94a3b8;">Belum ada rilis lagu yang diunggah.</td></tr>`;
    return;
  }

  releasesDatabase.forEach(item => {
    const tr = document.createElement('tr');
    const badgeClass = item.status === 'Approved' ? 'badge-approved' : 'badge-pending';
    
    tr.innerHTML = `
      <td><strong>${item.title}</strong></td>
      <td>${item.artist}</td>
      <td><code>${item.upc}</code></td>
      <td><code>${item.isrc}</code></td>
      <td><span class="badge ${badgeClass}">${item.status}</span></td>
      <td>
        <div class="action-btns">
          ${item.status === 'Pending' 
            ? `<button class="btn-action btn-approve" onclick="approveAndDeliver(${item.id})">Approve API</button>` 
            : `<button class="btn-action btn-inspect" onclick="inspectPayload(${item.id})">Inspeksi DDEX</button>`
          }
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Simulasi Trigger Approval -> Direct B2B API Delivery
function approveAndDeliver(releaseId) {
  const item = releasesDatabase.find(r => r.id === releaseId);
  if (!item) return;

  item.status = 'Approved';
  renderAdminTable();

  // Membuka modal inspeksi hasil JSON & DDEX XML payload secara instan
  inspectPayload(releaseId);
}

// Inspeksi XML / JSON Payload Generator
function inspectPayload(releaseId) {
  const item = releasesDatabase.find(r => r.id === releaseId);
  if (!item) return;

  // Format Struktur XML DDEX ERN 3.8 Sederhana
  const ddexXmlFormat = `<?xml version="1.0" encoding="UTF-8"?>
<ern:NewReleaseMessage xmlns:ern="http://ddex.net/xml/ern/382">
  <MessageHeader>
    <MessageSender>PARTY_ID_AGREGATOR</MessageSender>
    <SentOnBehalfOf>${item.artist}</SentOnBehalfOf>
  </MessageHeader>
  <ReleaseList>
    <Release>
      <ReleaseId>
        <ICPN>${item.upc}</ICPN>
      </ReleaseId>
      <ReferenceTitle>${item.title}</ReferenceTitle>
    </Release>
  </ReleaseList>
  <ResourceList>
    <SoundRecording>
      <SoundRecordingId>
        <ISRC>${item.isrc}</ISRC>
      </SoundRecordingId>
      <ResourceReference>${item.audioFile}</ResourceReference>
    </SoundRecording>
  </ResourceList>
</ern:NewReleaseMessage>`;

  document.getElementById('payload-content').textContent = ddexXmlFormat;
  document.getElementById('modal-payload').classList.add('active');
}

// Close Inspection Modal
function closeModal() {
  document.getElementById('modal-payload').classList.remove('active');
}
