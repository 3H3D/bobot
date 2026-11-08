const SUPABASE_URL = 'https://fvzayaghmxskcvwbllpr.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2emF5YWdobXhza2N2d2JsbHByIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQwNTkzMDcsImV4cCI6MjEwOTYzNTMwN30.vbICKBavN-4lVBSm_oQfVK9Z9tmy18D4B7a_9YqgGhI';

// Inisialisasi Klien Supabase
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// Pengecekan Sesi Login Artis
async function checkAuth() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) {
    window.location.href = 'login.html';
  }
}
checkAuth();

// Navigasi Menu
function navigateTo(sectionId, clickedElement) {
  const sections = document.querySelectorAll('.app-section');
  sections.forEach(sec => sec.style.display = 'none');

  const targetSection = document.getElementById(sectionId);
  if (targetSection) {
    targetSection.style.display = 'block';
  }

  const navItems = document.querySelectorAll('.tc-nav-item');
  navItems.forEach(item => item.classList.remove('active'));
  if (clickedElement) {
    clickedElement.classList.add('active');
  }

  if (sectionId === 'section-my-catalog') {
    loadCatalogData();
  }
}

// Ambil Data Katalog Rilis (Khusus Tampilan Artis - Tanpa Tombol Delete)
async function loadCatalogData() {
  const catalogContainer = document.getElementById('catalog-list');
  catalogContainer.innerHTML = 'Loading catalog data...';

  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) {
    catalogContainer.innerHTML = 'Please sign in to view your catalog.';
    return;
  }

  const { data: releases, error } = await supabaseClient
    .from('releases')
    .select('*')
    .eq('user_id', session.user.id);

  if (error) {
    catalogContainer.innerHTML = 'Failed to load catalog: ' + error.message;
    return;
  }

  if (releases.length === 0) {
    catalogContainer.innerHTML = 'No distributed releases found yet.';
    return;
  }

  let html = '<div style="display:flex; flex-direction:column; gap:12px;">';
  releases.forEach(rel => {
    html += `
      <div style="background:#111; border:1px solid #222; padding:16px; border-radius:8px; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <h4 style="margin:0; color:#fff;">${rel.title || 'Untitled'}</h4>
          <span style="font-size:12px; color:#a0a0a0;">Artist: ${rel.artist || '-'}</span>
        </div>
        <div style="text-align:right; font-size:12px; color:#888;">
          <div>UPC: ${rel.upc || '-'}</div>
          <div>ISRC: ${rel.isrc || '-'}</div>
        </div>
      </div>
    `;
  });
  html += '</div>';

  catalogContainer.innerHTML = html;
}

// Generator Kode Otomatis
function generateAutoUPC() {
  const randomSuffix = Math.floor(10000000000 + Math.random() * 90000000000);
  return `83${randomSuffix}`;
}

function generateAutoISRC() {
  const random5Digits = Math.floor(10000 + Math.random() * 90000);
  return `ID-FRW-26-${random5Digits}`;
}

function handleAudioSelect(input) {
  if (input.files && input.files[0]) {
    document.getElementById('audio-status-text').innerText = `Selected: ${input.files[0].name}`;
    document.getElementById('audio-status-text').style.color = "#10b981";
  }
}

function handleCoverSelect(input) {
  if (input.files && input.files[0]) {
    document.getElementById('cover-status-text').innerText = `Selected: ${input.files[0].name}`;
    document.getElementById('cover-status-text').style.color = "#10b981";
  }
}

// Event Listener Submit: Upload File ke Storage + Simpan Metadata ke Database
document.getElementById('artist-release-form').addEventListener('submit', async function(e) {
  e.preventDefault();

  const releaseTitle = document.getElementById('title-input').value;
  const displayArtist = document.getElementById('artist-input').value;
  const audioFile = document.getElementById('audio-input').files[0];
  const coverFile = document.getElementById('cover-input').files[0];

  if (!releaseTitle || !displayArtist) {
    alert("Mohon isi Judul Lagu dan Nama Artis terlebih dahulu!");
    return;
  }

  const submitBtn = this.querySelector('button[type="submit"]');
  const originalBtnText = submitBtn.innerHTML;
  submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Uploading assets...';
  submitBtn.disabled = true;

  const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();
  if (sessionError || !session) {
    alert("Sesi login kedaluwarsa. Silakan sign in ulang.");
    window.location.href = 'login.html';
    return;
  }

  let audioUrl = '';
  let coverUrl = '';

  // 1. Upload File Audio ke Supabase Storage (Bucket: audio-assets)
  if (audioFile) {
    const audioFileName = `${session.user.id}/${Date.now()}_${audioFile.name}`;
    const { data: audioData, error: audioError } = await supabaseClient.storage
      .from('audio-assets')
      .upload(audioFileName, audioFile);

    if (audioError) {
      alert("Gagal mengunggah file audio: " + audioError.message);
      submitBtn.innerHTML = originalBtnText;
      submitBtn.disabled = false;
      return;
    }
    audioUrl = audioData.path;
  }

  // 2. Upload Cover Art ke Supabase Storage (Bucket: cover-art)
  if (coverFile) {
    const coverFileName = `${session.user.id}/${Date.now()}_${coverFile.name}`;
    const { data: coverData, error: coverError } = await supabaseClient.storage
      .from('cover-art')
      .upload(coverFileName, coverFile);

    if (coverError) {
      alert("Gagal mengunggah cover art: " + coverError.message);
      submitBtn.innerHTML = originalBtnText;
      submitBtn.disabled = false;
      return;
    }
    coverUrl = coverData.path;
  }

  // 3. Generate Kode UPC & ISRC Otomatis
  const autoUpc = generateAutoUPC();
  const autoIsrc = generateAutoISRC();

  // 4. Simpan ke Database Tabel releases
  const { error: dbError } = await supabaseClient
    .from('releases')
    .insert([
      { 
        user_id: session.user.id, 
        title: releaseTitle, 
        artist: displayArtist, 
        upc: autoUpc, 
        isrc: autoIsrc,
        audio_url: audioUrl,
        cover_url: coverUrl
      }
    ]);

  submitBtn.innerHTML = originalBtnText;
  submitBtn.disabled = false;

  if (dbError) {
    alert("Gagal menyimpan ke database: " + dbError.message);
  } else {
    alert(`Berhasil! Rilis "${releaseTitle}" berhasil diunggah.\nUPC: ${autoUpc}\nISRC: ${autoIsrc}`);
    this.reset();
    
    document.getElementById('audio-status-text').innerText = "Click or drop audio file here";
    document.getElementById('cover-status-text').innerText = "Click or drop cover image";
    document.getElementById('audio-status-text').style.color = "#828ca0";
    document.getElementById('cover-status-text').style.color = "#828ca0";
  }
});
