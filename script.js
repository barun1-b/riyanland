/* =========================================================
   BARYULAND — SCRIPT
   How it works:
   - LOCATIONS is a big data object. Each location has "scenes".
   - Each scene is built from simple building blocks:
       type: 'menu'  -> a list of clickable options
       type: 'stage' -> a black scene with glowing objects (your images go here)
       type: 'note'  -> shows a sticky-note popup
   - Clicking things navigates to other scenes within the same location.
   - To ADD a new place: add a new key to LOCATIONS + a building in index.html.
   ========================================================= */

/* ----- grab elements once ----- */
const mapEl        = document.getElementById('map');
const sceneEl      = document.getElementById('scene');
const sceneBody    = document.getElementById('sceneBody');
const sceneTitle   = document.getElementById('sceneTitle');
const locationLabel= document.getElementById('locationLabel');
const closeBtn     = document.getElementById('closeBtn');
const backBtn      = document.getElementById('backBtn');
const popup        = document.getElementById('popup');
const popupContent = document.getElementById('popupContent');
const popupClose   = document.getElementById('popupClose');

/* navigation history so the back button works inside a location */
let currentLocation = null;
let sceneHistory = [];

/* =========================================================
   THE DATA — all locations & scenes live here.
   Edit text in [brackets]. Drop image filenames where noted.
   ========================================================= */
const LOCATIONS = {

  /* ---------------- LIBRARY ---------------- */
  library: {
    title: 'The Library',
    start: 'enter',
    scenes: {
      enter: {
        type: 'stage',
        // >>> INSERT IMAGE: images/library.png  (set bg below) <<<
        bg: '', // e.g. 'images/library.png'
        caption: 'You step inside. Dust motes float in the warm light...',
        objects: [
          { emoji:'📖', label:'Browse shelves', x:30, y:50, go:'shelves' },
          { emoji:'🧑‍🏫', label:'Talk to librarian', x:60, y:40, go:'librarian' },
          { emoji:'🗄️', label:'Search archives', x:78, y:65, go:'archives' },
        ],
      },
      shelves: {
        type: 'menu',
        heading: 'Browse Shelves',
        items: [
          { text:'💌 Romance — love letters to him', go:'note', note:{ title:'Romance', body:'[insert love letter here]' } },
          { text:'👻 Horror — something bad happening to us', go:'note', note:{ title:'Horror', body:'[insert text here]' } },
          { text:'🐉 Fantasy — our future together', go:'note', note:{ title:'Fantasy', body:'[insert text here]' } },
          { text:'🎵 Poetry — songs / rnb stuff', go:'note', note:{ title:'Poetry', body:'[insert text here]' } },
          { text:'🔍 Mystery — hidden drawer...', go:'mystery' },
          { text:'↩ Back', go:'enter' },
        ],
      },
      mystery: {
        type:'stage',
        bg:'', // >>> INSERT IMAGE: images/library-mystery.png <<<
        caption:'Something behind the shelf catches your eye...',
        objects:[
          { emoji:'🗝️', label:'Hidden drawer', x:50, y:55, go:'note',
            note:{ title:'Hidden Drawer', body:'[insert mystery / future note here]' } },
          { emoji:'↩', label:'Back', x:12, y:88, go:'shelves' },
        ],
      },
      librarian: {
        type:'menu',
        heading:'The Librarian',
        items:[
          { text:'💬 Get book recommendations (sticky note)', go:'note',
            note:{ title:'Recommendations', body:'[insert sticky note recs from him here]' } },
          { text:'📕 Check out a book', go:'note', note:{ title:'Checked Out', body:'[insert text here]' } },
          { text:'📗 Return a book', go:'note', note:{ title:'Returned', body:'[insert text here]' } },
          { text:'📙 Return an OVERDUE book', go:'note', note:{ title:'Overdue!', body:'[insert cute scolding text here]' } },
          { text:'↩ Back', go:'enter' },
        ],
      },
      archives: {
        type:'menu',
        heading:'Search Archives',
        items:[
          { text:'🧸 Memories of us as friends', go:'note', note:{ title:'Memories', body:'[insert text + IMAGE: images/archive-friends.png]' } },
          { text:'📸 Screenshots of the past', go:'note', note:{ title:'Thursday, March 19th', body:'[insert screenshots IMAGE here]' } },
          { text:'📝 Sticky notes', go:'note', note:{ title:'Sticky Notes', body:'[insert text here]' } },
          { text:'🔮 Alt plotline — message from future Baru?', go:'note', note:{ title:'Future Baru', body:'[insert text here]' } },
          { text:'↩ Back', go:'enter' },
        ],
      },
    },
  },

  /* ---------------- PARK ---------------- */
  park: {
    title: 'The Park',
    start: 'enter',
    scenes: {
      enter: {
        type:'stage',
        bg:'', // >>> INSERT IMAGE: images/park.png <<<
        caption:'You walk through the gates into the open green.',
        objects:[
          { emoji:'🪑', label:'Sit on the bench', x:25, y:60, go:'bench' },
          { emoji:'🌸', label:'Pick flowers', x:48, y:45, go:'flowers' },
          { emoji:'🌅', label:'Watch the sunset', x:70, y:35, go:'sunset' },
          { emoji:'🚶', label:'Go on a walk', x:60, y:70, go:'walk' },
          { emoji:'⭐', label:'Stargaze', x:85, y:25, go:'stars' },
        ],
      },
      bench: {
        type:'menu',
        heading:'On the Bench',
        items:[
          { text:'🗣️ Talk to a stranger (a clue...?)', go:'note', note:{ title:'Stranger', body:'[insert vision / clue text here]' } },
          { text:'🦆 Feed the ducks', go:'note', note:{ title:'A duck drops a note!', body:'[insert duck note here]' } },
          { text:'↩ Back', go:'enter' },
        ],
      },
      flowers: {
        type:'note',
        note:{ title:'She loves me...', body:'[insert "she loves me / she loves me not" mini-game text + final bouquet IMAGE: images/bouquet.png]' },
        back:'enter',
      },
      sunset: {
        type:'note',
        note:{ title:'Sunset', body:'[insert sunset photo IMAGE: images/sunset.png + small affirmation paragraph]' },
        back:'enter',
      },
      walk: {
        type:'menu',
        heading:'A Walk Together',
        items:[
          { text:'📈 Timeline of us', go:'note', note:{ title:'Timeline', body:'[insert relationship milestones here]' } },
          { text:'🚧 The future (closed gates)', go:'note', note:{ title:'The Future', body:'[insert "not yet..." text here]' } },
          { text:'↩ Back', go:'enter' },
        ],
      },
      stars: {
        type:'note',
        note:{ title:'Stargazing', body:'The stars spell out <strong>R + B</strong> ✨<br><br>[insert "i love you forever, written in the stars" text here]' },
        back:'enter',
      },
    },
  },

  /* ---------------- ARCADE ---------------- */
  arcade: {
    title: 'The Arcade',
    start:'enter',
    scenes: {
      enter: {
        type:'stage',
        bg:'', // >>> INSERT IMAGE: images/arcade.png <<<
        caption:'Neon flickers. Coins jingle in your pocket.',
        objects:[
          { emoji:'🎰', label:'Claw machine', x:25, y:50, go:'claw' },
          { emoji:'🏆', label:'Leaderboard', x:50, y:40, go:'leaderboard' },
          { emoji:'🎟️', label:'Redeem tickets', x:72, y:55, go:'tickets' },
          { emoji:'📷', label:'Photo booth', x:60, y:72, go:'photobooth' },
        ],
      },
      claw: {
        type:'menu',
        heading:'Claw Machine',
        items:[
          { text:'🎁 Present 1', go:'note', note:{ title:'Gift', body:'[insert gift idea 1 here]' } },
          { text:'🎁 Present 2', go:'note', note:{ title:'Gift', body:'[insert gift idea 2 here]' } },
          { text:'🎁 Present 3', go:'note', note:{ title:'Gift', body:'[insert gift idea 3 here]' } },
          { text:'🪙 Insert coin (last go free — special treatment!)', go:'note', note:{ title:'★ FREE GO ★', body:'[insert randomised message here]' } },
          { text:'↩ Back', go:'enter' },
        ],
      },
      leaderboard: {
        type:'note',
        note:{ title:'Leaderboard Unavailable', body:'...instead, here are things I love about you:<br><br>[insert list here]' },
        back:'enter',
      },
      tickets: {
        type:'note',
        note:{ title:'Redeem Tickets', body:'[insert voice note link + small letter here]' },
        back:'enter',
      },
      photobooth: {
        type:'note',
        note:{ title:'Photo Booth', body:'[insert photobooth IMAGE: images/photobooth.png + filter picker text]' },
        back:'enter',
      },
    },
  },

  /* ---------------- CINEMA ---------------- */
  cinema: {
    title: 'The Cinema',
    start:'enter',
    scenes: {
      enter: {
        type:'stage',
        bg:'', // >>> INSERT IMAGE: images/cinema.png <<<
        caption:'Popcorn in the air. The lights are dimming...',
        objects:[
          { emoji:'🎫', label:'Buy ticket (seat 4B)', x:28, y:55, go:'movie' },
          { emoji:'💺', label:'Back row seat', x:55, y:45, go:'backrow' },
          { emoji:'🍿', label:'Buy snacks', x:75, y:60, go:'snacks' },
          { emoji:'⭐', label:'Leave a review', x:48, y:75, go:'review' },
        ],
      },
      movie: {
        type:'menu',
        heading:'Seat 4B',
        items:[
          { text:'▶️ Part 1 — 3 min vlog', go:'note', note:{ title:'Now Showing', body:'[insert vlog 1 video/link here]' } },
          { text:'🍦 Interval — butterscotch ice cream', go:'note', note:{ title:'Interval', body:'[insert text here]' } },
          { text:'▶️ Part 2 — 3 min vlog', go:'note', note:{ title:'Now Showing', body:'[insert vlog 2 video/link here]' } },
          { text:'↩ Back', go:'enter' },
        ],
      },
      backrow: {
        type:'note',
        note:{ title:'Back Row', body:'You find a note tucked under the seat...<br><br>[insert note here]' },
        back:'enter',
      },
      snacks: {
        type:'note',
        note:{ title:'Snacks', body:'Lovely popcorn 🍿 + cola 🥤<br><br>Worker: "Oh, you have a girlfriend? She\'s lucky."<br><br>[insert text here]' },
        back:'enter',
      },
      review: {
        type:'note',
        note:{ title:'Leave a Review', body:'[insert Notion feed link + other reviews from "me" here]' },
        back:'enter',
      },
    },
  },

  /* ---------------- APARTMENT ---------------- */
  apartment: {
    title: 'The Apartment',
    start:'enter',
    scenes: {
      enter: {
        type:'stage',
        bg:'', // >>> INSERT IMAGE: images/apartment.png <<<
        caption:'Home. It smells like you here.',
        objects:[
          { emoji:'💡', label:'Turn on lights', x:20, y:30, go:'note', note:{ title:'Lights On', body:'[insert "light mode" text here]' } },
          { emoji:'🖼️', label:'Look around', x:40, y:45, go:'look' },
          { emoji:'🎶', label:'Play vinyl', x:62, y:38, go:'note', note:{ title:'Our Blend', body:'[insert rnb playlist link here]' } },
          { emoji:'📚', label:'Bookshelf', x:78, y:50, go:'bookshelf' },
          { emoji:'🧊', label:'Open fridge', x:30, y:70, go:'fridge' },
          { emoji:'🪑', label:'Sit at desk', x:55, y:72, go:'desk' },
          { emoji:'🛋️', label:'Sleep on couch', x:72, y:78, go:'note', note:{ title:'Couch', body:'[insert babying excerpt here]' } },
          { emoji:'📺', label:'Watch TV', x:88, y:65, go:'note', note:{ title:'TV', body:'[insert tv show picks here]' } },
        ],
      },
      look: {
        type:'menu',
        heading:'Look Around',
        items:[
          { text:'📰 Old magazine', go:'note', note:{ title:'Magazine', body:'[insert text here]' } },
          { text:'🖼️ Posters', go:'note', note:{ title:'Posters', body:'[insert IMAGE: images/posters.png]' } },
          { text:'🪴 Plants + flowers', go:'note', note:{ title:'Plants', body:'[insert text here]' } },
          { text:'↩ Back', go:'enter' },
        ],
      },
      bookshelf: {
        type:'menu',
        heading:'Bookshelf',
        items:[
          { text:'💿 Vinyls — albums that remind me of you', go:'note', note:{ title:'Vinyls', body:'[insert albums here]' } },
          { text:'📖 Books — little letters I wrote you', go:'note', note:{ title:'Letters', body:'[insert letters here]' } },
          { text:'↩ Back', go:'enter' },
        ],
      },
      fridge: {
        type:'menu',
        heading:'The Fridge',
        items:[
          { text:'🍱 Favourite food + snacks', go:'note', note:{ title:'Yum', body:'[insert text here]' } },
          { text:'📝 Sticky notes', go:'note', note:{ title:'Fridge Notes', body:'[insert text here]' } },
          { text:'🧲 Magnets', go:'note', note:{ title:'Magnets', body:'[insert text here]' } },
          { text:'↩ Back', go:'enter' },
        ],
      },
      desk: {
        type:'menu',
        heading:'At the Desk',
        items:[
          { text:'🗄️ Search drawer (find a note)', go:'note', note:{ title:'Drawer', body:'[insert note here]' } },
          { text:'💻 Get some work done', go:'note', note:{ title:'Work', body:"I'm so proud of you, Riyu! 💗<br><br>[insert text here]" } },
          { text:'↩ Back', go:'enter' },
        ],
      },
    },
  },

  /* ---------------- BEACH ---------------- */
  beach: {
    title: 'The Beach',
    start:'enter',
    scenes: {
      enter: {
        type:'stage',
        bg:'', // >>> INSERT IMAGE: images/beach.png <<<
        caption:'Waves roll in. The sand is warm under your feet.',
        objects:[
          { emoji:'🐚', label:'Collect seashells', x:22, y:60, go:'shells' },
          { emoji:'✍️', label:'Write in the sand', x:42, y:50, go:'note', note:{ title:'In the Sand', body:'[insert rnb photo IMAGE: images/sand.png]' } },
          { emoji:'🍾', label:'Message in a bottle', x:60, y:65, go:'bottle' },
          { emoji:'🏰', label:'Build a sandcastle', x:38, y:75, go:'note', note:{ title:'Our Future', body:'[insert "our future house / our lives together" text here]' } },
          { emoji:'☄️', label:'Meteor shower', x:78, y:30, go:'note', note:{ title:'Make a wish', body:'[insert wish text here]' } },
          { emoji:'🔥', label:'Bonfire', x:70, y:78, go:'bonfire' },
        ],
      },
      shells: {
        type:'note',
        note:{ title:'Seashells', body:'Each shell has a note on the back...<br><br>[insert seashell notes here]' },
        back:'enter',
      },
      bottle: {
        type:'note',
        note:{ title:'Message in a Bottle', body:'You uncork it...<br><br>[insert note from me here]' },
        back:'enter',
      },
      bonfire: {
        type:'menu',
        heading:'Bonfire',
        items:[
          { text:'🔥 Burn past memories', go:'note', note:{ title:'Let go', body:'[insert text here]' } },
          { text:'💬 Confessions', go:'note', note:{ title:'Confessions', body:'[insert text here]' } },
          { text:'🌙 Deep conversations', go:'note', note:{ title:'Deep Talk', body:'[insert text here]' } },
          { text:'↩ Back', go:'enter' },
        ],
      },
    },
  },

};

/* =========================================================
   RENDERING — turn a scene's data into HTML
   ========================================================= */

/* Build a "stage" scene (black canvas + glowing objects).
   This is where YOUR background image goes via the bg field. */
function renderStage(scene) {
  // inline background only if you provided one
  const bgStyle = scene.bg
    ? `background-image:url('${scene.bg}')`
    : '';
  const stageClass = scene.bg ? 'scene-stage scene-stage--img' : 'scene-stage';

  // build each glowing clickable object
  const objectsHTML = (scene.objects || []).map((o, i) => `
    <button class="glow-object"
            style="left:${o.x}%; top:${o.y}%;"
            data-index="${i}">
      ${o.emoji}
      <span class="glow-label">${o.label}</span>
    </button>
  `).join('');

  sceneBody.innerHTML = `
    ${scene.caption ? `<p class="scene-caption">${scene.caption}</p>` : ''}
    <div class="${stageClass}" style="${bgStyle}">
      ${objectsHTML}
    </div>
  `;

  // wire up the glow object clicks
  sceneBody.querySelectorAll('.glow-object').forEach(btn => {
    btn.addEventListener('click', () => {
      const obj = scene.objects[btn.dataset.index];
      handleAction(obj);
    });
  });
}

/* Build a "menu" scene (list of clickable options). */
function renderMenu(scene) {
  const itemsHTML = scene.items.map((it, i) => `
    <button class="menu-item" data-index="${i}">${it.text}</button>
  `).join('');

  sceneBody.innerHTML = `
    <div class="scene-menu">
      ${scene.heading ? `<h3>${scene.heading}</h3>` : ''}
      ${itemsHTML}
    </div>
  `;

  sceneBody.querySelectorAll('.menu-item').forEach(btn => {
    btn.addEventListener('click', () => {
      handleAction(scene.items[btn.dataset.index]);
    });
  });
}

/* Render whichever scene type we're given. */
function renderScene(sceneKey) {
  const loc = LOCATIONS[currentLocation];
  const scene = loc.scenes[sceneKey];
  if (!scene) return;

  // a 'note' scene immediately pops a sticky note, then shows nothing else
  if (scene.type === 'note') {
    showPopup(scene.note.title, scene.note.body);
    // if it has a 'back' target, render that underneath so closing returns there
    if (scene.back) {
      renderSceneRaw(loc.scenes[scene.back], scene.back);
    }
    return;
  }

  renderSceneRaw(scene, sceneKey);
}

/* Render the visual part of a scene (no auto-popup). */
function renderSceneRaw(scene, sceneKey) {
  if (scene.type === 'stage') renderStage(scene);
  else if (scene.type === 'menu') renderMenu(scene);
}

/* =========================================================
   ACTION HANDLER — what happens when you click something
   ========================================================= */
function handleAction(item) {
  if (!item || !item.go) return;

  // 'note' = show a sticky note popup (don't navigate away)
  if (item.go === 'note') {
    showPopup(item.note.title, item.note.body);
    return;
  }

  // otherwise navigate to another scene in this location
  goToScene(item.go);
}

/* =========================================================
   NAVIGATION
   ========================================================= */
function openLocation(key) {
  currentLocation = key;
  const loc = LOCATIONS[key];
  if (!loc) return;

  sceneTitle.textContent = loc.title;
  locationLabel.textContent = `~ ${loc.title} ~`;
  sceneHistory = [];               // reset history per location
  goToScene(loc.start, true);

  sceneEl.classList.remove('hidden');
  sceneEl.setAttribute('aria-hidden', 'false');
}

function goToScene(sceneKey, isFirst = false) {
  if (!isFirst) sceneHistory.push(sceneKey);
  renderScene(sceneKey);
}

/* Back button: go to previous scene, or close if at the start. */
function goBack() {
  if (sceneHistory.length > 1) {
    sceneHistory.pop();                       // drop current
    const prev = sceneHistory[sceneHistory.length - 1];
    renderScene(prev);
  } else {
    closeLocation();
  }
}

function closeLocation() {
  sceneEl.classList.add('hidden');
  sceneEl.setAttribute('aria-hidden', 'true');
  locationLabel.textContent = '~ choose a place to wander ~';
  currentLocation = null;
}

/* =========================================================
   POPUP (sticky note)
   ========================================================= */
function showPopup(title, body) {
  popupContent.innerHTML = `<strong>${title}</strong><br><br>${body}`;
  popup.classList.remove('hidden');
}
function closePopup() {
  popup.classList.add('hidden');
}

/* =========================================================
   EVENT WIRING
   ========================================================= */

/* every building on the map opens its location */
document.querySelectorAll('.building').forEach(b => {
  b.addEventListener('click', () => openLocation(b.dataset.location));
});

closeBtn.addEventListener('click', closeLocation);
backBtn.addEventListener('click', goBack);
popupClose.addEventListener('click', closePopup);

/* close popup by clicking outside the note */
popup.addEventListener('click', (e) => {
  if (e.target === popup) closePopup();
});

/* press ESC to back out of things (nice for keyboard players) */
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  if (!popup.classList.contains('hidden')) closePopup();
  else if (!sceneEl.classList.contains('hidden')) goBack();
});

/* =========================================================
   EASTER EGG — the wandering cat 🐈
   Click it a few times for a secret message.
   ========================================================= */
let catClicks = 0;
const secretCat = document.getElementById('secretCat');
secretCat.addEventListener('click', () => {
  catClicks++;
  // make it scurry to a random spot
  secretCat.style.top  = (15 + Math.random() * 70) + '%';
  secretCat.style.left = (10 + Math.random() * 80) + '%';

  if (catClicks === 5) {
    showPopup('🐈 A secret!', '[insert secret easter-egg message here — maybe a hidden love note?]');
    catClicks = 0;
  }
});
