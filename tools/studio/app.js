/* Portfolio Studio — browser side. No framework, no build step. */

const $ = (id) => document.getElementById(id);
const state = { images: [], coverName: null, config: null };

const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const kb = (n) => (n > 1048576 ? (n / 1048576).toFixed(2) + ' MB' : Math.round(n / 1024) + ' KB');

function setStatus(msg, kind = '') {
  const el = $('status');
  el.textContent = msg;
  el.className = kind;
}

/* ---------- config -------------------------------------------------------- */

const config = await fetch('/api/config').then((r) => r.json());
state.config = config;
$('year').value = config.year;
$('tagList').innerHTML = config.tags.map((t) => `<option value="${t}">`).join('');

/* ---------- title / slug -------------------------------------------------- */

function currentSlug() {
  return slugify($('title').value);
}

function refreshSlug() {
  const slug = currentSlug();
  const preview = $('slugPreview');
  if (!slug) { preview.textContent = '—'; preview.classList.remove('over'); }
  else if (config.slugs.includes(slug)) {
    preview.textContent = `${slug} — already exists`;
    preview.classList.add('over');
  } else {
    preview.textContent = slug;
    preview.classList.remove('over');
  }
  refreshSave();
}

$('title').addEventListener('input', refreshSlug);
$('summary').addEventListener('input', () => {
  const n = $('summary').value.length;
  $('summaryCount').textContent = n;
  $('summaryCount').parentElement.classList.toggle('over', n > 180);
  refreshSave();
});
$('stack').addEventListener('input', refreshSave);

/* ---------- uploads ------------------------------------------------------- */

const drop = $('drop');
const picker = $('picker');

drop.addEventListener('click', () => picker.click());
drop.addEventListener('dragover', (e) => { e.preventDefault(); drop.classList.add('hot'); });
drop.addEventListener('dragleave', () => drop.classList.remove('hot'));
drop.addEventListener('drop', (e) => {
  e.preventDefault();
  drop.classList.remove('hot');
  handleFiles([...e.dataTransfer.files]);
});
picker.addEventListener('change', () => { handleFiles([...picker.files]); picker.value = ''; });

async function handleFiles(files) {
  const slug = currentSlug();
  if (!slug) return setStatus('Add a title first — it decides where images are stored.', 'err');

  const type = $('type').value;
  const images = files.filter((f) => /^image\//.test(f.type));
  if (!images.length) return setStatus('No image files in that drop.', 'err');

  for (const file of images) {
    setStatus(`Compressing ${file.name}…`);
    try {
      const qs = new URLSearchParams({ type, slug, name: file.name });
      const res = await fetch(`/api/upload?${qs}`, {
        method: 'POST',
        headers: { 'content-type': 'application/octet-stream' },
        body: file,
      });
      const out = await res.json();
      if (!res.ok) throw new Error(out.error);

      state.images.push({ ...out, alt: '', caption: '' });
      if (!state.coverName) state.coverName = out.name;
      render();
      setStatus(`${out.name} — ${kb(out.before)} → ${kb(out.after)}`, 'ok');
    } catch (err) {
      setStatus(`${file.name}: ${err.message}`, 'err');
    }
  }
  refreshSave();
}

function render() {
  $('shots').innerHTML = '';
  for (const img of state.images) {
    const row = document.createElement('div');
    row.className = 'shot';

    const saved = img.before > img.after
      ? `<span class="saved">${kb(img.before)} → ${kb(img.after)}</span>`
      : kb(img.after);

    row.innerHTML = `
      <img src="/api/thumb" alt="" hidden>
      <div class="fields">
        <div class="name">${img.name} · ${img.width}×${img.height} · ${saved}</div>
        <input class="alt" placeholder="Alt text — describe what's in the image" value="${img.alt}">
        <input class="caption" placeholder="Caption (optional)" value="${img.caption}">
      </div>
      <div class="side">
        <label class="cover-pick">
          <input type="radio" name="cover" ${state.coverName === img.name ? 'checked' : ''} style="width:auto">
          cover
        </label>
        <button class="linkish" type="button">remove</button>
      </div>`;

    row.querySelector('.alt').addEventListener('input', (e) => { img.alt = e.target.value; refreshSave(); });
    row.querySelector('.caption').addEventListener('input', (e) => { img.caption = e.target.value; });
    row.querySelector('input[type=radio]').addEventListener('change', () => { state.coverName = img.name; });
    row.querySelector('button').addEventListener('click', () => {
      state.images = state.images.filter((i) => i.name !== img.name);
      if (state.coverName === img.name) state.coverName = state.images[0]?.name ?? null;
      render(); refreshSave();
      setStatus(`${img.name} removed from this project. The file is still on disk — use Discard uploads to clear them.`);
    });

    // Preview straight from the processed file via the dev asset path.
    const thumb = row.querySelector('img');
    thumb.src = img.src.replace('/images/', '/preview/');
    thumb.hidden = false;
    thumb.onerror = () => { thumb.hidden = true; };

    $('shots').appendChild(row);
  }
}

/* ---------- save ---------------------------------------------------------- */

function problems() {
  const out = [];
  const title = $('title').value.trim();
  if (title.length < 3) out.push('title');
  if (config.slugs.includes(currentSlug())) out.push('slug already exists');
  if (!$('summary').value.trim() || $('summary').value.length > 180) out.push('summary');
  if (!$('stack').value.trim()) out.push('stack');
  if (!state.images.length) out.push('at least one image');
  if (state.images.some((i) => i.alt.trim().length < 3)) out.push('alt text on every image');
  return out;
}

function refreshSave() {
  const bad = problems();
  $('save').disabled = bad.length > 0;
  $('save').title = bad.length ? `Needs: ${bad.join(', ')}` : '';
}

$('save').addEventListener('click', async () => {
  const bad = problems();
  if (bad.length) return setStatus(`Still needed: ${bad.join(', ')}`, 'err');

  const list = (v) => v.split(',').map((s) => s.trim()).filter(Boolean);
  const payload = {
    title: $('title').value.trim(),
    slug: currentSlug(),
    type: $('type').value,
    year: Number($('year').value),
    summary: $('summary').value.trim(),
    stack: list($('stack').value),
    tags: list($('tags').value),
    role: $('role').value.trim() || undefined,
    repo: $('repo').value.trim() || undefined,
    live: $('live').value.trim() || undefined,
    caseStudy: $('caseStudy').value.trim() || undefined,
    order: $('order').value === '' ? undefined : Number($('order').value),
    draft: $('draft').checked,
    content: $('content').value.trim() || undefined,
    coverName: state.coverName,
    coverAlt: state.images.find((i) => i.name === state.coverName)?.alt,
    images: state.images.map(({ name, src, alt, caption }) => ({ name, src, alt: alt.trim(), caption: caption.trim() })),
  };

  setStatus('Writing…');
  $('save').disabled = true;
  try {
    const res = await fetch('/api/project', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const out = await res.json();
    if (!res.ok) throw new Error(out.error);

    setStatus('Saved.', 'ok');
    $('result').hidden = false;
    $('result').textContent =
      `wrote  ${out.file}\n` +
      `images ${out.imageCount} in ${out.assetDir}\n\n` +
      `next   npm run check\n` +
      `       git diff        # review\n` +
      `       git add -A && git commit`;
    config.slugs.push(out.slug);
  } catch (err) {
    setStatus(err.message, 'err');
    $('save').disabled = false;
  }
});

$('discard').addEventListener('click', async () => {
  const slug = currentSlug();
  if (!slug) return setStatus('Nothing to discard.', '');
  if (!confirm(`Delete all uploaded images for "${slug}"? This removes the folder from src/assets.`)) return;
  const res = await fetch('/api/discard', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ type: $('type').value, slug }),
  });
  const out = await res.json();
  if (!res.ok) return setStatus(out.error, 'err');
  state.images = []; state.coverName = null;
  render(); refreshSave();
  setStatus(`Removed ${out.removed}`, 'ok');
});

refreshSlug();
render();
