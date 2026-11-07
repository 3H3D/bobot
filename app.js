let releasesDatabase = [];
let currentCoverData = null;

// Tab Switch Logic
function switchTab(tabName, element) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));

  element.classList.add('active');

  if (tabName === 'artist') {
    document.getElementById('tab-artist').classList.add('active');
    document.getElementById('page-title').innerText = "Buat Rilisan Baru";
    document.getElementById('page-subtitle').innerText = "Unggah master audio dan tentukan identifikasi unik UPC & ISRC";
  } else {
    document.getElementById('tab-admin').classList.add('active');
    document.getElementById('page-title').innerText = "Panel Pengawasan Admin";
    document.getElementById('page-subtitle').innerText = "Setujui rilisan untuk memicu pengiriman API B2B Global";
    renderAdminTable();
  }
}

// Cover Artwork Preview Handler
function handleCoverPreview(input) {
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = function(e) {
      currentCoverData = e.target.result;
      document.getElementById('cover-preview').innerHTML = `<img src="${e.target.result}" class="preview-img" alt="Cover Preview" />`;
    };
    reader.readAsDataURL(input.files[0]);
  }
}

// Audio File Selection Handler
function handleAudioSelect(input) {
  if (input.files && input.files[0]) {
    document.getElementById('audio-filename').innerText = input.files[0].name;
  }
}

// Auto-Generators
function generateUPC() {
  const randomSuffix = Math.floor(10000000000 + Math.random() * 90000000000);
  document.getElementById('upc-code').value = `83${randomSuffix}`;
}

function generateISRC() {
  const random5Digits = Math.floor(10000 + Math.random() * 90000);
  document.getElementById('isrc-code').value = `ID-FRW-26-${random5Digits}`;
}

// Form Submission
document.getElementById('release-form').addEventListener('submit', function(e) {
  e.preventDefault();

  const newRelease = {
    id: Date.now(),
    title: document.getElementById('release-title').value,
    artist: document.getElementById('artist-name').value,
    upc: document.getElementById('upc-code').value,
    isrc: document.getElementById('isrc-code').value,
    coverImg: currentCoverData || 'https://via.placeholder.com/150/1e293b/ffffff?text=No+Cover',
    audioFile: document.getElementById('audio-file').files[0]?.name || 'master_audio.wav',
    status: 'Pending'
  };

  releasesDatabase.push(newRelease);
  alert(`Rilisan "${newRelease.title}" berhasil diunggah ke antrean!`);
  
  // Reset Form
  this.reset();
  document.getElementById('cover-preview').innerHTML = `
    <i class="fa-solid fa-image drop-icon"></i>
    <p class="drop-text">Pilih atau geser file gambar</p>
    <span class="drop-hint">JPG / PNG (Min. 3000 x 3000px)</span>`;
  document.getElementById('audio-filename').innerText = "Pilih file audio berkualitas tinggi";
  currentCoverData = null;
});

// Admin Table Renderer
function renderAdminTable() {
  const tbody = document.getElementById('admin-table-body');
  tbody.innerHTML = '';

  if (releasesDatabase.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#64748b; padding: 24px;">Belum ada rilisan yang diunggah.</td></tr>`;
    return;
  }

  releasesDatabase.forEach(item => {
    const tr = document.createElement('tr');
    const badgeClass = item.status === 'Approved' ? 'badge-approved' : 'badge-pending';
    
    tr.innerHTML = `
      <td><img src="${item.coverImg}" class="table-thumb" alt="Thumb" /></td>
      <td><strong>${item.title}</strong><br><span style="font-size: 12px; color: #64748b;">${item.artist}</span></td>
      <td><code>${item.upc}</code></td>
      <td><code>${item.isrc}</code></td>
      <td><span class="badge-status ${badgeClass}">${item.status}</span></td>
      <td>
        ${item.status === 'Pending' 
          ? `<button class="btn-gen" style="padding:6px 12px;" onclick="approveRelease(${item.id})">Approve & Deliver</button>` 
          : `<button class="btn-gen" style="padding:6px 12px; background:#334155; color:#fff;" onclick="inspectPayload(${item.id})">Lihat DDEX</button>`
        }
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Approve Action
function approveRelease(id) {
  const item = releasesDatabase.find(r => r.id === id);
  if (item) {
    item.status = 'Approved';
    renderAdminTable();
    inspectPayload(id);
  }
}

// Payload Inspection Modal
function inspectPayload(id) {
  const item = releasesDatabase.find(r => r.id === id);
  if (!item) return;

  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<ern:NewReleaseMessage xmlns:ern="http://ddex.net/xml/ern/382">
  <MessageHeader>
    <MessageSender>FERWAP_MUSIC_DISTRO</MessageSender>
    <SentOnBehalfOf>${item.artist}</SentOnBehalfOf>
  </MessageHeader>
  <ReleaseList>
    <Release>
      <ReleaseId><ICPN>${item.upc}</ICPN></ReleaseId>
      <ReferenceTitle>${item.title}</ReferenceTitle>
    </Release>
  </ReleaseList>
  <ResourceList>
    <SoundRecording>
      <SoundRecordingId><ISRC>${item.isrc}</ISRC></SoundRecordingId>
      <ResourceReference>${item.audioFile}</ResourceReference>
    </SoundRecording>
  </ResourceList>
</ern:NewReleaseMessage>`;

  document.getElementById('payload-content').textContent = xmlContent;
  document.getElementById('modal-payload').classList.add('active');
}

function closeModal() {
  document.getElementById('modal-payload').classList.remove('active');
}
