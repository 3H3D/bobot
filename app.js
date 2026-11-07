const SUPABASE_URL = 'https://fvzayaghmxskcvwbllpr.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_49UN3oQJiIcqmsIUj0nPEA_J2HVD1Dn';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

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
