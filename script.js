const apiKey = '84b025c3c958339df5fe36150e5a27e1';
const startButton = document.getElementById('startButton');
const gameArea = document.getElementById('gameArea');
const currentArtistDiv = document.getElementById('currentArtist');
const resultsDiv = document.getElementById('results');

let currentArtist = '';
const targetArtist = 'JPEGMAFIA';
let path = [];

function startGame() {
    currentArtist = 'Kendrick Lamar';
    path = [currentArtist];
    startButton.style.display = 'none';
    gameArea.style.display = 'block';
    showArtist(currentArtist);
}

function showArtist(artist) {
    currentArtistDiv.innerHTML = `<b>Current artist:</b> ${artist}`;
    resultsDiv.textContent = 'Loading similar artists...';
    fetchSimilarArtists(artist);
}

function fetchSimilarArtists(artist) {
    const url = `https://ws.audioscrobbler.com/2.0/?method=artist.getsimilar&artist=${encodeURIComponent(artist)}&api_key=${apiKey}&format=json&limit=10`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data && data.similarartists && data.similarartists.artist) {
                const artists = data.similarartists.artist;
                if (artists.length === 0) {
                    resultsDiv.textContent = 'No similar artists found.';
                    return;
                }
                resultsDiv.innerHTML = '<b>Choose a similar artist:</b><br><br>';
                artists.forEach(a => {
                    const btn = document.createElement('button');
                    btn.textContent = a.name;
                    btn.style.margin = '5px';
                    btn.onclick = () => handleArtistClick(a.name);
                    resultsDiv.appendChild(btn);
                });
            } else {
                resultsDiv.textContent = 'No similar artists found.';
            }
        })
        .catch(error => {
            resultsDiv.textContent = 'Error fetching data.';
            console.error(error);
        });
}

function handleArtistClick(artist) {
    path.push(artist);
    if (artist.toLowerCase() === targetArtist.toLowerCase()) {
        currentArtistDiv.innerHTML = `<b>You win!</b> You reached ${targetArtist} in ${path.length - 1} steps.<br>Path: ${path.join(' → ')}`;
        resultsDiv.innerHTML = '<button onclick="location.reload()">Play Again</button>';
    } else {
        showArtist(artist);
    }
}

startButton.addEventListener('click', startGame);
