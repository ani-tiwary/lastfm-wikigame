require('dotenv').config();
const apiKey = process.env.LASTFM_API_KEY;
const startButton = document.getElementById('startButton');
const gameArea = document.getElementById('gameArea');
const currentArtistDiv = document.getElementById('currentArtist');
const resultsDiv = document.getElementById('results');

let currentArtist = '';
const targetArtist = 'JPEGMAFIA';
let path = [];

const artistNameMap = {
    'jid': 'J.I.D',
    'j.i.d': 'J.I.D',
    'j.i.d.': 'J.I.D',
    'yeat': 'yeat',
    'kendrick': 'Kendrick Lamar',
    'kendrick lamar': 'Kendrick Lamar',
    'jpegmafia': 'JPEGMAFIA',
    'peggy': 'JPEGMAFIA'
};

function startGame() {
    currentArtist = 'Kendrick Lamar';
    path = [currentArtist];
    startButton.style.display = 'none';
    gameArea.style.display = 'block';
    showArtist(currentArtist);
}

function normalizeArtistName(artistName) {
    const normalized = artistName.toLowerCase().trim();
    return artistNameMap[normalized] || artistName;
}

async function findCorrectArtistName(artistName) {
    const normalizedName = normalizeArtistName(artistName);
    const searchUrl = `https://ws.audioscrobbler.com/2.0/?method=artist.search&artist=${encodeURIComponent(normalizedName)}&api_key=${apiKey}&format=json&limit=5`;
    
    try {
        const response = await fetch(searchUrl);
        const data = await response.json();
        
        if (data.results && data.results.artistmatches && data.results.artistmatches.artist) {
            const artists = data.results.artistmatches.artist;
            return artists[0].name;
        }
    } catch (error) {
        console.error('Error searching for artist:', error);
    }
    
    return normalizedName;
}

function showArtist(artist) {
    currentArtistDiv.innerHTML = `<b>Current artist:</b> ${artist}`;
    resultsDiv.textContent = 'Loading similar artists...';
    fetchSimilarArtists(artist);
}

async function fetchSimilarArtists(artist) {
    const correctArtistName = await findCorrectArtistName(artist);
    
    const url = `https://ws.audioscrobbler.com/2.0/?method=artist.getsimilar&artist=${encodeURIComponent(correctArtistName)}&api_key=${apiKey}&format=json&limit=10`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (data && data.similarartists && data.similarartists.artist && data.similarartists.artist.length > 0) {
            const artists = data.similarartists.artist;
            resultsDiv.innerHTML = '<div class="options-title">Choose a similar artist:</div>';
            
            artists.forEach(a => {
                const btn = document.createElement('button');
                btn.textContent = a.name;
                btn.className = 'artist-btn';
                btn.onclick = () => handleArtistClick(a.name);
                resultsDiv.appendChild(btn);
            });
        } else {
            handleNoSimilarArtists(correctArtistName);
        }
    } catch (error) {
        resultsDiv.textContent = 'Error fetching data.';
        console.error(error);
    }
}

function handleNoSimilarArtists(artistName) {
    resultsDiv.innerHTML = `
        <div class="error-message">
            <b>No similar artists found for "${artistName}"</b><br>
            This might be because the artist is new or has limited data.
        </div>
        <div class="options-title">Options:</div>
        <button onclick="skipArtist('${artistName}')" class="skip-btn">
            Skip this artist
        </button>
        <button onclick="tryAlternativeArtists('${artistName}')" class="alternative-btn">
            Try popular alternatives
        </button>
    `;
}

function skipArtist(artistName) {
    if (path.length > 1) {
        path.pop();
        const previousArtist = path[path.length - 1];
        showArtist(previousArtist);
    } else {
        startGame();
    }
}

async function tryAlternativeArtists(artistName) {
    const popularArtists = [
        'Kendrick Lamar', 'Drake', 'Travis Scott', 'Post Malone', 
        'J. Cole', 'Eminem', 'The Weeknd', 'Future', 'Lil Baby',
        'DaBaby', 'Megan Thee Stallion', 'Cardi B', 'Doja Cat'
    ];
    
    resultsDiv.innerHTML = '<div class="options-title">Try one of these popular artists:</div>';
    
    const availableArtists = popularArtists.filter(artist => 
        !path.includes(artist) && artist.toLowerCase() !== artistName.toLowerCase()
    );
    
    availableArtists.slice(0, 8).forEach(artist => {
        const btn = document.createElement('button');
        btn.textContent = artist;
        btn.className = 'alternative-btn';
        btn.onclick = () => handleArtistClick(artist);
        resultsDiv.appendChild(btn);
    });
    
    const backBtn = document.createElement('button');
    backBtn.textContent = 'Go back';
    backBtn.className = 'back-btn';
    backBtn.onclick = () => fetchSimilarArtists(artistName);
    resultsDiv.appendChild(backBtn);
}

function handleArtistClick(artist) {
    path.push(artist);
    if (artist.toLowerCase() === targetArtist.toLowerCase()) {
        currentArtistDiv.innerHTML = `<b>You win!</b> You reached ${targetArtist} in ${path.length - 1} steps.<br>Path: ${path.join(' → ')}`;
        resultsDiv.innerHTML = '<button onclick="location.reload()" class="alternative-btn">Play Again</button>';
    } else {
        showArtist(artist);
    }
}

startButton.addEventListener('click', startGame);
