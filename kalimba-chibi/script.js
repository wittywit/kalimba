if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').then(registration => {
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
    }, err => {
      console.log('ServiceWorker registration failed: ', err);
    });
  });
}

document.body.addEventListener('click', () => {
  if (ac.state === 'suspended') {
    ac.resume();
  }
});

var MidiPlayer = MidiPlayer;
var instrument;
var loadFile, loadDataUri, Player;
Player = new MidiPlayer.Player();
var AudioContext = window.AudioContext || window.webkitAudioContext || false;
var ac = new AudioContext() || new webkitAudioContext();
var currentTime;
var timeoutId;
var timeoutId2;
var timeoutId3;
var bool1 = 0;
var tempo = 50;

var tempodiv = document.querySelector(".tempo");
var tempoInput = document.getElementById("tempo-input");
var lesson_modediv = document.querySelector("#lesson_mode");
var keydivs = document.querySelectorAll(".key");
var keynoteanimationdiv = document.querySelector("key-note-animation");
var loadingdiv = document.querySelector("#loading");


var playbuttondiv = document.querySelector("#play-button");
var stopbuttondiv = document.querySelector("#stop-button");
var resetbuttondiv = document.querySelector("#reset-button");
var tempobuttondiv = document.querySelector(".tempo");

var shownumbersbuttondiv = document.querySelector("#show_numbers");
var keyboardlayoutbuttondiv = document.querySelector("#keyboard_layout");

var menubuttondiv = document.querySelector("#menu-button");
var settingspaneldiv = document.querySelector("#settings-panel");

menubuttondiv.addEventListener("click", function() {
  settingspaneldiv.classList.toggle("open");
});

var isRecording = false;
var recordedNotes = [];
var startTime;

var recordbuttondiv = document.querySelector("#record-button");
var playrecordingbuttondiv = document.querySelector("#play-recording-button");

recordbuttondiv.addEventListener("click", function() {
  if (isRecording) {
    isRecording = false;
    recordbuttondiv.innerHTML = "Record";
    recordbuttondiv.classList.remove("btn-danger");
    recordbuttondiv.classList.add("btn-success");
    recordbuttondiv.classList.remove("blinking-record");
    playbuttondiv.removeAttribute("disabled");
  } else {
    isRecording = true;
    recordedNotes = [];
    startTime = Date.now();
    recordbuttondiv.innerHTML = "Stop";
    recordbuttondiv.classList.remove("btn-success");
    recordbuttondiv.classList.add("btn-danger");
    recordbuttondiv.classList.add("blinking-record");
    playbuttondiv.setAttribute("disabled", "disabled");
  }
});

playrecordingbuttondiv.addEventListener("click", function() {
  playRecording();
});

function playRecording() {
  var now = Date.now();
  var timeOffset = 0;
  recordedNotes.forEach(function(note) {
    timeOffset += note.time;
    setTimeout(function() {
      instrument.play(note.note);
      randomize();
    }, timeOffset);
  });
}

window.addEventListener("keydown", function (e) {
  var key = notetonote(keyboardtonote(e.key));
  if (keyboardlayoutbuttondiv.checked) {
    key = keyboardtonote(e.key);
  }
  console.log(key);
  var notediv = document.querySelector('[data-note="' + key + '"]');
  notediv.classList.add("key_active");
  instrument.play(key);
  randomize();
});

window.addEventListener("keyup", function (e) {
  var key = notetonote(keyboardtonote(e.key));
  if (keyboardlayoutbuttondiv.checked) {
    key = keyboardtonote(e.key);
  }
  console.log(key);
  var notediv = document.querySelector('[data-note="' + key + '"]');
  notediv.classList.remove("key_active");
});

var notetonumber = function (note) {
  var notes = [
    "Cb4", "C4", "C#4", "Db4", "D4", "D#4", "Eb4", "E4", "E#4",
    "F4", "F#4", "Gb4", "G4", "G#4", "Ab4", "A4", "A#4", "Bb4", "B4",
    "Cb5", "C5", "C#5", "Db5", "D5", "D#5", "Eb5", "E5", "E#5",
    "F5", "F#5", "Gb5", "G5", "G#5", "Ab5", "A5", "A#5", "Bb5", "B5",
    "Cb6", "C6", "C#6", "Db6", "D6", "D#6", "Eb6", "E6", "E#6"
  ];
  var notenumbers = [
    "1", "1", "1", "2", "2", "2", "3", "3", "3",
    "4", "4", "5", "5", "5", "6", "6", "6", "7", "7",
    "1", "1", "1", "2", "2", "2", "3", "3", "3",
    "4", "4", "5", "5", "5", "6", "6", "6", "7", "7",
    "1", "1", "1", "2", "2", "2", "3", "3", "3",
  ];
  return notenumbers[notes.indexOf(note)];
};



var keyboardtonote = function (keyboard) {
  var keyboards = [
    "`",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "0",
    "-",
    "=",
    "Backspace",
    "Insert",
    "Home",
    "PageUp",
  ];
  var notes = [
    "C4",
    "D4",
    "E4",
    "F4",
    "G4",
    "A4",
    "B4",
    "C5",
    "D5",
    "E5",
    "F5",
    "G5",
    "A5",
    "B5",
    "C6",
    "D6",
    "E6",
  ];
  return notes[keyboards.indexOf(keyboard)];
};

var notetonote = function (note) {
  var notes = [
    "C4",
    "D4",
    "E4",
    "F4",
    "G4",
    "A4",
    "B4",
    "C5",
    "D5",
    "E5",
    "F5",
    "G5",
    "A5",
    "B5",
    "C6",
    "D6",
    "E6",
  ];
  var notes1 = [
    "D6",
    "B5",
    "G5",
    "E5",
    "C5",
    "A4",
    "F4",
    "D4",
    "C4",
    "E4",
    "G4",
    "B4",
    "D5",
    "F5",
    "A5",
    "C6",
    "E6",
  ];
  return notes1[notes.indexOf(note)];
};

var play = function () {
  playbuttondiv.innerHTML = "Pause";
  // Warte 4 Sekunden, bevor der Player gestartet wird
  setTimeout(function () {
    Player.play();
  }, 4000); // 4000 Millisekunden entsprechen 4 Sekunden
};

var pause = function () {
  Player.pause();
  playbuttondiv.innerHTML = "Play";
};

var stop = function () {
  if (lesson_modediv.checked) {
    lesson_modediv.checked = false;
    clearTimeout(timeoutId);
    clearTimeout(timeoutId2);
    clearTimeout(timeoutId3);
    setTimeout(function () {
      stop();
      keydivs.forEach((key) => {
        key.classList.remove("key_active");
      });
    }, 8000);
  }
  Player.stop();
  playbuttondiv.innerHTML = "Play";
};

var reset = function () {
  keydivs.forEach((key) => {
    key.classList.remove("key_active");
  });
  tempoInput.innerHTML = tempo;
};

playbuttondiv.addEventListener("click", function (e) {
  Player.isPlaying() ? pause() : play();
});

stopbuttondiv.addEventListener("click", function (e) {
  stop();
});

resetbuttondiv.addEventListener("click", function (e) {
  reset();
});

tempobuttondiv.addEventListener("change", function (e) {
  Player.setTempo(this.value);
});

var updateTempoDisplay = function () {
  tempoInput.value = Player.tempo;
};





var playmidi = function (event) {
  if (bool1 == 0) {
    tempo = Player.tempo;
    bool1 = 1;
  }
  Player.setTempo(tempodiv.value);
  if (event.name == "Note on" && event.velocity > 0) {
    //$('key-note-animation').append('<div data-key-note="' + event.noteName + '"></div>');
    if (shownumbersbuttondiv.checked) {
      keynoteanimationdiv.insertAdjacentHTML(
        "afterbegin",
        `
		<div data-key-note="` +
          event.noteName +
          `"><span class="key-text">` +
          notetonumber(event.noteName) +
          `</span></div>
		`
      );
    } else {
      keynoteanimationdiv.insertAdjacentHTML(
        "afterbegin",
        `
		<div data-key-note="` +
          event.noteName +
          `"></div>
		`
      );
    }
  }
  setTimeout(function () {
    if (event.name == "Note on") {
      instrument.play(event.noteName, ac.currentTime, {
        gain: event.velocity / 100,
      });
      randomize();
      var notediv = document.querySelector(
        '[data-note="' + event.noteName.replace(/C-1/gi, "NO") + '"]'
      );
      notediv.classList.add("key_active");
      console.log(
        "event: " + event.name + ", " + event.noteName.replace(/C-1/gi, "NO")
      );
    }
    if (event.name == "Note off") {
      var notediv = document.querySelector(
        '[data-note="' + event.noteName.replace(/C-1/gi, "NO") + '"]'
      );
      notediv.classList.remove("key_active");
      console.log(
        "event: " + event.name + ", " + event.noteName.replace(/C-1/gi, "NO")
      );
    }
  }, 1800);
  tempoInput.innerHTML = Player.tempo;
};

var lesson_mode = function (event) {
  if (lesson_modediv.checked) {
    playmidi(event);
    timeoutId = setTimeout(function () {
      pause();
    }, 1500);
    timeoutId1 = setTimeout(function () {
      playmidi(event);
      randomize();
    }, 3000);
    timeoutId2 = setTimeout(function () {
      play();
    }, 7500);
  }
  if (!lesson_modediv.checked) {
    clearTimeout(timeoutId);
    clearTimeout(timeoutId2);
    clearTimeout(timeoutId3);
  }
};

loadDataUri = function (midiFileUrl) {
  console.log("Loading MIDI file:", midiFileUrl);
  bool1 = 0;
  Player = new MidiPlayer.Player(function (event) {
    playmidi(event);
    lesson_mode(event);
  });

  // Lade die MIDI-Datei von der externen URL
  fetch(midiFileUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.arrayBuffer();
    })
    .then((data) => {
      // Konvertiere die MIDI-Datei in Base64-Data URI
      var binary = "";
      var bytes = new Uint8Array(data);
      for (var i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      var base64DataUri = "data:audio/midi;base64," + window.btoa(binary);

      // Lade die MIDI-Datei in den Player
      Player.loadDataUri(base64DataUri);

      // Aktiviere den Play-Button nach dem Laden der MIDI-Datei
      playbuttondiv.removeAttribute("disabled");
    })
    .catch((error) => {
      console.error("Error loading MIDI file:", error);
    });
};

Soundfont.instrument(ac, "kalimba").then(function (instrumentnow) {
  instrument = instrumentnow;
  loadingdiv.style.display = "none";

  const songs = [
    "Carol_of_The_Bells_for_kalimba_shifted_170.mid",
    "Demons_100.mid",
    "Sad_Song_85.mid",
    "Tetris__Kalimba_120.mid",
  ];

  const songSelection = document.getElementById("song-selection");

  songs.forEach(song => {
    const option = document.createElement("option");
    option.value = song;
    option.text = song.replace(/_/g, " ").replace(".mid", "");
    songSelection.appendChild(option);
  });

  songSelection.addEventListener("change", function(e) {
    loadSong(e.target.value);
  });

  function loadSong(song) {
    Player.stop();
    const midiFileUrl = `songs/${song}`;
    loadDataUri(midiFileUrl);
  }

  loadSong(songs[0]);

  keydivs.forEach((key) => {
    key.addEventListener("click", function (e) {
      var note = e.target.dataset.note.replace(/C-1/gi, "C4");
      instrument.play(note);
      if (isRecording) {
        var now = Date.now();
        var time = now - startTime;
        recordedNotes.push({ note: note, time: time });
        startTime = now;
      }
      randomize();
    });
  });
});