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

document.getElementById('artist-release-form').addEventListener('submit', function(e) {
  e.preventDefault();

  const releaseTitle = document.getElementById('title-input').value;
  alert(`Release "${releaseTitle}" successfully submitted to distribution pipeline!`);
  this.reset();
  
  document.getElementById('audio-status-text').innerText = "Click or drop audio file here";
  document.getElementById('cover-status-text').innerText = "Click or drop cover image";
  document.getElementById('audio-status-text').style.color = "#828ca0";
  document.getElementById('cover-status-text').style.color = "#828ca0";
});
