const eyebrows = ['angry', 'sad', 'caret']
const eyes = ['full', 'heart', 'angry', 'caret', 'arch', 'half', 'dead', 'squint', 'squint2', 'line', 'confused', 'empty']
const mouths = ['open-happy', 'open-happy-big', 'surprised', 'surprised-big', 'confused', 'frown', 'frown-big', 'smile', 'smile-big', 'smirk', 'cat', 'wide', 'wide2', 'open-frown', 'untitled', 'line', 'angry']
const extras = ['lightning', 'teardrop']

console.log('No. of possible combinations:',
            mouths.length * eyes.length * eyes.length * (extras.length + 1))

function randomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function setEyebrow(eyebrow, side) {
  let elem = side === 'left' ? window.eyebrowLeft : window.eyebrowRight
  elem.setAttribute('href', '#eye-' + eyebrow + '-' + side)
}

function setEye(eye, side) {
  let elem = side === 'left' ? window.eyeLeft : window.eyeRight
  elem.setAttribute('href', '#eye-' + eye + '-' + side)
}

function setMouth(mouth) {
  window.mouth.setAttribute('href', '#mouth-' + mouth)
}

function setExtra(extra) {
  window.extra.setAttribute('href', '#extra-' + extra)
}

function randomize() {
  let leftEye  = randomElement(eyes)
  let rightEye = Math.random() < 0.5 ? randomElement(eyes) : leftEye
  
  setEye(leftEye, 'left')
  setEye(rightEye, 'right')
  setMouth(randomElement(mouths))
  setExtra(Math.random() < 0.1 ? randomElement(extras) : '')
}

let auto = false
if (location.pathname.match(/fullcpgrid/i)) {
  setInterval(randomize, 200)
} else {
  // document.body.onclick = randomize
}

function useAmericanEnglish() {
  let enPref = navigator.languages.find(s => s.startsWith('en-')) || 'en-US'
  let locale = enPref.split('-')[1].toLowerCase()
  return ['us', 'ca', 'zh'].includes(locale)
}

if (!useAmericanEnglish()) {
  document.querySelectorAll('.z').forEach(e => e.textContent = 's')
}