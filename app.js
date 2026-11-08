const SUPABASE_URL = 'https://fvzayaghmxskcvwbllpr.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2emF5YWdobXhza2N2d2JsbHByIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQwNTkzMDcsImV4cCI6MjEwOTYzNTMwN30.vbICKBavN-4lVBSm_oQfVK9Z9tmy18D4B7a_9YqgGhI';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);


// Pengecekan Sesi Login Artis
async function checkAuth() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) {
    window.location.href = 'login.html';
  }
}
checkAuth();

// Fungsi untuk mengganti tampilan menu utama & mengatur efek aktif pada tombol sidebar
function navigateTo(sectionId, clickedElement) {
  // 1. Sembunyikan semua seksi konten
  const sections = document.querySelectorAll('.app-section');
  sections.forEach(sec => sec.style.display = 'none');

  // 2. Tampilkan seksi yang dipilih
  const targetSection = document.getElementById(sectionId);
  if (targetSection) {
    targetSection.style.display = 'block';
  }

  // 3. Atur kelas 'active' pada tombol navigasi sidebar
  const navItems = document.querySelectorAll('.tc-nav-item');
  navItems.forEach(item => item.classList.remove('active'));
  if (clickedElement) {
    clickedElement.classList.add('active');
  }

  // 4. Muat data katalog otomatis jika menu 'My Catalog' diklik
  if (sectionId === 'section-my-catalog') {
    loadCatalogData();
  }
}

// Fungsi Mengambil Data Katalog Rilis dari Supabase Database
async function loadCatalogData() {
  const catalogContainer = document.getElementById('catalog-list');
  catalogContainer.innerHTML = 'Loading catalog data...';

  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) {
    catalogContainer.innerHTML = 'Please sign in to view your catalog.';
    return;
  }

  // Tarik data rilis milik user dari tabel releases Supabase
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

  // Tampilkan data rilis ke dalam bentuk daftar ringkas
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

function autoGenUPC() {
  const randomSuffix = Math.floor(10000000000 + Math.random() * 90000000000);
  document.getElementById('upc-input').value = `83${randomSuffix}`;
}

function autoGenISRC() {
  const random5Digits = Math.floor(10000 + Math.random() * 90000);
  document.getElementById('isrc-input').value = `ID-FRW-26-${random5Digits}`;
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

document.getElementById('artist-release-form').addEventListener('submit', async function(e) {
  e.preventDefault();

  const releaseTitle = document.getElementById('title-input').value;
  const displayArtist = document.getElementById('artist-input').value;
  const upcCode = document.getElementById('upc-input').value;
  const isrcCode = document.getElementById('isrc-input').value;

  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) {
    alert("Session expired. Please sign in again.");
    window.location.href = 'login.html';
    return;
  }

  // Simpan data rilis ke database Supabase
  const { error } = await supabaseClient
    .from('releases')
    .insert([
      { 
        user_id: session.user.id, 
        title: releaseTitle, 
        artist: displayArtist, 
        upc: upcCode, 
        isrc: isrcCode 
      }
    ]);

  if (error) {
    alert("Submission failed: " + error.message);
  } else {
    alert(`Release "${releaseTitle}" successfully submitted to distribution pipeline!`);
    this.reset();
    
    document.getElementById('audio-status-text').innerText = "Click or drop audio file here";
    document.getElementById('cover-status-text').innerText = "Click or drop cover image";
    document.getElementById('audio-status-text').style.color = "#828ca0";
    document.getElementById('cover-status-text').style.color = "#828ca0";
  }
});
