console.log("Let's write javascript now")
let currSong = new Audio();
let songs;
let currFolder = "Songs/Energetic_songs";
async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`/${folder}/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = []
    for (let e = 0; e < as.length; e++) {
        const element = as[e];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href)
        }
    }
    let songUl = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUl.innerHTML = "";
    for (const song of songs) {
        songName = song.split(`/${currFolder}/`)[1].replaceAll("%20", " ").replaceAll(".mp3", "")
        html_li = `<li>
        <img class="invert" src="images//music.svg" alt="music">
        <div class="info">
            <div class="songName">${songName}</div>
            <div class="artist">Artist</div>
        </div>
        <div class="playNow">
            <span>Play Now</span>
            <img src="images//play.svg" alt="Play Now">
        </div>
    </li>`
        songUl.innerHTML = songUl.innerHTML + html_li
    }

    //Attach Event listener to all list of songs
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            console.log(e.querySelector(".info").firstElementChild.innerHTML)
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
    })

    songName = songs[0].split(`/${currFolder}/`)[1].replaceAll("%20", " ").replaceAll(".mp3", "")
    playMusic(songName, true)
    document.querySelector(".circle").style.left = 0;
    document.querySelector(".songPlay").src = "images/play.svg";
    return songs;
}

const playMusic = (track, pause = false) => {
    currSong.src = `/${currFolder}/` + track + ".mp3"

    if (!pause) {
        currSong.play()
        play.src = "images//pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = track
    document.querySelector(".songtime").innerHTML = "00:00/00:00"
}

function secondsToTime(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    // Ensure the input is a non-negative number
    seconds = Math.max(0, seconds);

    // Calculate minutes and remaining seconds
    var minutes = Math.floor(seconds / 60);
    var remainingSeconds = Math.floor(seconds % 60);

    // Format the result as "00:00"
    var formattedTime =
        (minutes < 10 ? '0' : '') + minutes + ':' +
        (remainingSeconds < 10 ? '0' : '') + remainingSeconds;

    return formattedTime;
}

async function displayAlbums() {
    let a = await fetch("Songs/")
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    document.querySelector(".cardContainer").innerHTML = ""
    Array.from(anchors).forEach(async e => {
        if (e.href.includes("Songs")) {
            i = 0
            f_name = ""
            e.href.split("/").slice(-2).forEach(c=>{
                if((!c.includes(".")&& !c.includes("/")) &&(c != "Songs" && c!="")){
                    f_name = c;
                }
            })
            if(f_name != ""){
                console.log(f_name)
                let folder = f_name
                //Get the metadata of the folder 
                let ab = await fetch(`/Songs/${folder}/info.json`)
                let response = await ab.json()
                let inHtml = `<div data-folder="${folder}" class="card">
                <img
                src="/Songs/${folder}/cover.png"
                alt=""
                />
                <div class="play-btn">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 50 50"
                    width="55"
                    height="55"
                >
                    <circle cx="20" cy="20" r="20" fill="rgb(21, 209, 21)" />
                    <g fill="black" transform="translate(11, 10) scale(1.1)">
                    <path
                        d="m3.05 1.606 10.49 6.788a.7.7 0 0 1 0 1.212L3.05 14.394A.7.7 0 0 1 2 13.788V2.212a.7.7 0 0 1 1.05-.606z"
                    />
                    </g>
                </svg>
                </div>
                <h2>${response.title}</h2>
                <p>${response.description}</p>
            </div>`
                document.querySelector(".cardContainer").innerHTML = document.querySelector(".cardContainer").innerHTML + inHtml
                //Load the Playlist when card is clicked
                Array.from(document.getElementsByClassName("card")).forEach(e => {
                    e.addEventListener("click", async item => {
                        songs = await getSongs(`Songs/${e.dataset.folder}`)
                    })
                })
            }
        }
    })
}

async function main() {
    songs = await getSongs("Songs/Energetic_songs")

    // Display all the albums on the page
    displayAlbums()

    //Attach an Event listener to play, next and previous
    play.addEventListener("click", () => {
        if (currSong.paused) {
            currSong.play()
            play.src = "images//pause.svg"
        }
        else {
            play.src = "images//play.svg"
            currSong.pause()
        }
    })

    previous.addEventListener("click", () => {
        index = songs.indexOf(currSong.src) - 1;
        if (index == -1) {
            index = songs.length - 1
        }
        songName = songs[index].split(`/${currFolder}/`)[1].replaceAll("%20", " ").replaceAll(".mp3", "")
        playMusic(songName)
    })
    next.addEventListener("click", () => {
        index = songs.indexOf(currSong.src) + 1;
        if (index == songs.length) {
            index = 0
        }
        songName = songs[index].split(`/${currFolder}/`)[1].replaceAll("%20", " ").replaceAll(".mp3", "")
        playMusic(songName)
    })


    //Listen for time update event
    currSong.addEventListener("timeupdate", () => {
        let duration = currSong.duration;
        document.querySelector(".songtime").innerHTML = `${secondsToTime(currSong.currentTime)}/${secondsToTime(currSong.duration)}`
        document.querySelector(".circle").style.left = (currSong.currentTime / duration) * 100 + "%"
        if(currSong.currentTime == currSong.duration){
            index = songs.indexOf(currSong.src) + 1;
            if (index == songs.length) {
                index = 0
            }
            songName = songs[index].split(`/${currFolder}/`)[1].replaceAll("%20", " ").replaceAll(".mp3", "")
            playMusic(songName)
        }
    })

    // Add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = e.offsetX / e.target.getBoundingClientRect().width * 100;
        document.querySelector(".circle").style.left = percent + "%"
        currSong.currentTime = (currSong.duration * percent) / 100
    })
    // Add an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = 0
    })
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = -135 + "%"
    })

    //Add an event to volume
    document.querySelector(".range_bar").addEventListener("change", (e) => {
        currSong.volume = parseInt(e.target.value) / 100;
        console.log("Setting Volume to : ", e.target.value, "/100");
    })

    // Add event listener to mute the volume
    document.querySelector(".volume>img").addEventListener("click", e => {
        if (e.target.src.includes("images/volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            currSong.volume = 0;
            document.querySelector(".range_bar").value = 0;
        }
        else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            currSong.volume = 1;
            document.querySelector(".range_bar").value = 100;
        }
    });
}
main()