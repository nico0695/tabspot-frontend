/* ==========================================================
   TabSpot DS — interactivity: theme toggle, stepper, renderer
   ========================================================== */

// ---------- Theme toggle ----------
(function theme() {
  const root = document.documentElement;
  const saved = localStorage.getItem('tabspot-theme');
  if (saved) root.setAttribute('data-theme', saved);
  document.querySelectorAll('[data-theme-btn]').forEach(btn => {
    btn.addEventListener('click', () => {
      const t = btn.dataset.themeBtn;
      root.setAttribute('data-theme', t);
      localStorage.setItem('tabspot-theme', t);
      document.querySelectorAll('[data-theme-btn]').forEach(b => {
        b.setAttribute('aria-selected', b.dataset.themeBtn === t ? 'true' : 'false');
      });
    });
  });
  // initial sync of buttons with saved theme
  const cur = root.getAttribute('data-theme');
  document.querySelectorAll('[data-theme-btn]').forEach(b => {
    b.setAttribute('aria-selected', b.dataset.themeBtn === cur ? 'true' : 'false');
  });
})();

// ---------- Transposition logic ----------
const NOTES_SHARP = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
const NOTES_FLAT  = ['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B'];
const CHORD_RE = /^([A-G])(b|#)?(.*)$/;

function transposeChord(chord, semis) {
  const m = chord.match(CHORD_RE);
  if (!m) return chord;
  const [, letter, acc, tail] = m;
  const src = (acc === 'b') ? NOTES_FLAT : NOTES_SHARP;
  let idx = src.indexOf(letter + (acc || ''));
  if (idx < 0) idx = NOTES_SHARP.indexOf(letter);
  if (idx < 0) return chord;
  const newIdx = ((idx + semis) % 12 + 12) % 12;
  const base = (acc === 'b') ? NOTES_FLAT[newIdx] : NOTES_SHARP[newIdx];
  // Transpose bass note (/G) too if present
  const slash = tail.match(/^(.*)\/([A-G])(b|#)?(.*)$/);
  if (slash) {
    const [, mid, bL, bAcc, bTail] = slash;
    let bIdx = (bAcc === 'b' ? NOTES_FLAT : NOTES_SHARP).indexOf(bL + (bAcc||''));
    if (bIdx < 0) bIdx = NOTES_SHARP.indexOf(bL);
    if (bIdx >= 0) {
      const nb = ((bIdx + semis) % 12 + 12) % 12;
      const bNew = (bAcc === 'b') ? NOTES_FLAT[nb] : NOTES_SHARP[nb];
      return base + mid + '/' + bNew + bTail;
    }
  }
  return base + tail;
}

// ---------- Stepper (standalone demo) ----------
function bindStepper(root, { onChange, initialNote = 'G' } = {}) {
  if (!root) return;
  const noteEl = root.querySelector('[data-note]');
  let semis = 0;
  root.querySelectorAll('[data-step]').forEach(btn => {
    btn.addEventListener('click', () => {
      semis += parseInt(btn.dataset.step, 10);
      const newNote = transposeChord(initialNote, semis);
      if (noteEl) noteEl.textContent = newNote;
      onChange && onChange(semis, newNote);
    });
  });
  return {
    reset() {
      semis = 0;
      if (noteEl) noteEl.textContent = initialNote;
      onChange && onChange(0, initialNote);
    }
  };
}

const stepper = document.getElementById('stepper');
if (stepper) {
  const semisOut = document.querySelector('[data-semitones]');
  const ctrl = bindStepper(stepper, {
    onChange: (s) => semisOut.textContent = `${s >= 0 ? '+' : ''}${s} semitono${Math.abs(s) === 1 ? '' : 's'}`
  });
  const resetBtn = document.querySelector('[data-reset]');
  if (resetBtn && ctrl) resetBtn.addEventListener('click', () => {
    ctrl.reset();
    semisOut.textContent = '0 semitonos';
  });
}

// ---------- Star rating (toggle hover preview) ----------
document.querySelectorAll('.stars').forEach(row => {
  const orig = parseInt(row.dataset.value, 10) || 0;
  const btns = [...row.querySelectorAll('button')];
  btns.forEach((b, i) => {
    b.addEventListener('mouseenter', () => row.dataset.value = i + 1);
    b.addEventListener('click', () => { row.dataset.value = i + 1; row.dataset._set = i + 1; });
  });
  row.addEventListener('mouseleave', () => {
    row.dataset.value = row.dataset._set || orig;
  });
});

// ---------- Favorite toggle on song cards ----------
document.querySelectorAll('.song__fav').forEach(b => {
  b.addEventListener('click', (e) => {
    e.stopPropagation();
    b.classList.toggle('is-on');
    const svg = b.querySelector('svg path');
    if (svg) {
      if (b.classList.contains('is-on')) {
        svg.setAttribute('fill', 'currentColor');
        svg.removeAttribute('stroke');
      } else {
        svg.setAttribute('fill', 'none');
        svg.setAttribute('stroke', 'currentColor');
        svg.setAttribute('stroke-width', '1.6');
      }
    }
  });
});

// ---------- ChordPro Parser + Renderer ----------
const SAMPLES = {
  mixed: `{title: De Música Ligera}
{artist: Soda Stereo}
{key: G}

{soc: Intro}
{start_of_tab}
e|-------------------|
B|-------------------|
G|--0--2--0----------|
D|--0--2--0--2--0----|
A|-------------------|
E|-------------------|
{end_of_tab}

{soc: Verso}
[G]Ella du[D]rmió al ca[Em]lor de las [C]masas
[G]y yo des[D]perté que[Em]riendo so[C]ñarla

{soc: Estribillo}
[Em]Algún tiempo a[C]trás...
[G]pensé en escri[D]birle
[Em]nunca su[C]pe bien
[G]por qué no lo [D]hice`,

  chords: `{title: Flaca}
{artist: Andrés Calamaro}
{key: G}

{soc: Verso 1}
[G]Ya sé que no vol[D]verás
[Em]lo que te qui[C]se te lo di
[G]y fue lo me[D]jor de mi vi[Em]da

{soc: Estribillo}
Y [G]flaca, [D]flaca bon[Em]ita, flaca
de [C]mis amar[G]es, nunca [D]te olvi[C]des
de [G]mí`,

  tab: `{title: Seven Nation Army}
{artist: The White Stripes}
{key: Em}

{soc: Riff principal (bajo)}
{start_of_tab}
G|-----------------|
D|-----------------|
A|--7-7-10-7-5-3-2-|
E|-----------------|
{end_of_tab}

{soc: Repetición}
{start_of_tab}
G|---------------------|
D|---------------------|
A|--7-7-10-7-5-3-2---2-|
E|---------------------|
{end_of_tab}`
};

const CHORD_TOKEN = /\[([^\]]+)\]/g;

function parseChordPro(src, semis = 0) {
  const lines = src.split('\n');
  const out = [];
  let inTab = false;
  let tabBuf = [];
  const meta = {};

  const flushTab = () => {
    if (tabBuf.length) {
      out.push({ type: 'tab', content: tabBuf.join('\n') });
      tabBuf = [];
    }
  };

  for (const raw of lines) {
    const line = raw;
    const trimmed = line.trim();

    if (inTab) {
      if (/^\{end_of_tab\}/i.test(trimmed) || /^\{eot\}/i.test(trimmed)) {
        inTab = false;
        flushTab();
      } else {
        tabBuf.push(line);
      }
      continue;
    }

    if (/^\{start_of_tab\}/i.test(trimmed) || /^\{sot\}/i.test(trimmed)) {
      inTab = true;
      continue;
    }

    // Directive
    const dir = trimmed.match(/^\{([a-z_]+)\s*:\s*(.*)\}$/i);
    if (dir) {
      const key = dir[1].toLowerCase();
      const val = dir[2];
      if (['title','t','artist','st','subtitle','key'].includes(key)) {
        if (key === 't') meta.title = val;
        else if (key === 'st') meta.subtitle = val;
        else meta[key] = val;
      } else if (key === 'soc' || key === 'start_of_chorus' || key === 'sov' || key === 'start_of_verse' || key === 'comment' || key === 'c') {
        out.push({ type: 'header', text: val });
      }
      continue;
    }

    if (trimmed === '') {
      out.push({ type: 'empty' });
      continue;
    }

    // chord/syll line
    const pairs = [];
    let lastIndex = 0;
    let m;
    const tokens = [];
    CHORD_TOKEN.lastIndex = 0;
    while ((m = CHORD_TOKEN.exec(line)) !== null) {
      if (m.index > lastIndex) {
        tokens.push({ kind: 'text', value: line.slice(lastIndex, m.index) });
      }
      tokens.push({ kind: 'chord', value: m[1] });
      lastIndex = m.index + m[0].length;
    }
    if (lastIndex < line.length) {
      tokens.push({ kind: 'text', value: line.slice(lastIndex) });
    }

    // build pairs (chord + text until next chord)
    if (tokens.length === 0) {
      out.push({ type: 'line', pairs: [{ chord: '', text: line }] });
      continue;
    }
    // If the line starts with text, first pair has no chord
    let i = 0;
    if (tokens[0].kind === 'text') {
      pairs.push({ chord: '', text: tokens[0].value });
      i = 1;
    }
    while (i < tokens.length) {
      const tk = tokens[i];
      if (tk.kind === 'chord') {
        const next = tokens[i + 1];
        if (next && next.kind === 'text') {
          pairs.push({ chord: tk.value, text: next.value });
          i += 2;
        } else {
          pairs.push({ chord: tk.value, text: ' ' });
          i += 1;
        }
      } else {
        // shouldn't normally hit here, but safe
        pairs.push({ chord: '', text: tk.value });
        i += 1;
      }
    }
    out.push({ type: 'line', pairs });
  }

  if (inTab) flushTab();

  // Transpose chords
  if (semis !== 0) {
    out.forEach(n => {
      if (n.type === 'line') {
        n.pairs.forEach(p => { if (p.chord) p.chord = transposeChord(p.chord, semis); });
      }
    });
    if (meta.key) meta.key = transposeChord(meta.key, semis);
  }

  return { meta, nodes: out };
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}

function renderChordPro(ast) {
  const { meta, nodes } = ast;
  const parts = [];
  if (meta.title || meta.artist) {
    parts.push('<div class="cp-meta">');
    if (meta.title) parts.push(`<div class="cp-meta__title">${escapeHtml(meta.title)}</div>`);
    if (meta.artist) parts.push(`<div class="cp-meta__sub">${escapeHtml(meta.artist)}</div>`);
    if (meta.key) parts.push(`<div class="cp-meta__key">Tonalidad: ${escapeHtml(meta.key)}</div>`);
    parts.push('</div>');
  }

  for (const n of nodes) {
    if (n.type === 'header') {
      parts.push(`<div class="cp-h">${escapeHtml(n.text)}</div>`);
    } else if (n.type === 'empty') {
      parts.push('<div class="cp-line cp-line--empty"></div>');
    } else if (n.type === 'tab') {
      parts.push(`<pre class="cp-tabblock">${escapeHtml(n.content)}</pre>`);
    } else if (n.type === 'line') {
      const pairs = n.pairs.map(p => {
        const chord = p.chord ? `<span class="cp-chord">${escapeHtml(p.chord)}</span>` : `<span class="cp-chord">&nbsp;</span>`;
        const text = escapeHtml(p.text).replace(/ /g, '&nbsp;');
        return `<span class="cp-pair">${chord}<span class="cp-syll">${text}</span></span>`;
      }).join('');
      parts.push(`<div class="cp-line chord-line">${pairs}</div>`);
    }
  }
  return parts.join('');
}

// Wire renderer
(function renderer() {
  const src = document.getElementById('chordpro-src');
  const out = document.getElementById('chordpro-out');
  const samples = document.getElementById('renderer-samples');
  const transEl = document.getElementById('renderer-trans');
  if (!src || !out) return;

  let semis = 0;
  let keyBase = 'G';

  const rerender = () => {
    const ast = parseChordPro(src.value, semis);
    out.innerHTML = renderChordPro(ast);
  };

  const loadSample = (name) => {
    src.value = SAMPLES[name] || SAMPLES.mixed;
    const keyLine = src.value.match(/\{key:\s*([^}]+)\}/i);
    keyBase = keyLine ? keyLine[1].trim() : 'G';
    semis = 0;
    if (transEl) transEl.querySelector('[data-note]').textContent = keyBase;
    rerender();
  };

  if (samples) {
    samples.querySelectorAll('button').forEach(b => {
      b.addEventListener('click', () => {
        samples.querySelectorAll('button').forEach(x => x.classList.remove('is-on'));
        b.classList.add('is-on');
        loadSample(b.dataset.sample);
      });
    });
  }

  if (transEl) {
    transEl.querySelectorAll('[data-step]').forEach(btn => {
      btn.addEventListener('click', () => {
        semis += parseInt(btn.dataset.step, 10);
        transEl.querySelector('[data-note]').textContent = transposeChord(keyBase, semis);
        rerender();
      });
    });
  }

  src.addEventListener('input', rerender);

  loadSample('mixed');
})();
