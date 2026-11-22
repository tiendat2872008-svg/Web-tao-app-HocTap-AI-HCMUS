// Điều phối: state, tab, sự kiện, lưu tự động
let S = Store.load();
const F = { q: '', sem: '', block: '' };            // bộ lọc CN-01
const W = { target: 7, assumed: {}, sem: '', scope: 'graduation', selectedScenario: '', scenarioName: '', shareOpen: false }; // sandbox CN-07
const M = { open: false, sem: 0, group: '', sub: '', q: '' }; // cửa sổ "Thêm học phần" (không lưu)
let tab = location.hash.slice(1) || 'dash';
const $ = s => document.querySelector(s);
const toast = t => { const e = $('#toast'); e.textContent = t; e.classList.add('on'); setTimeout(() => e.classList.remove('on'), 1800); };
const persist = () => Store.save(S);

// ---- Danh sách trạng thái tự vẽ (có chấm màu) ----
let stBtn = null;
const stMenu = () => $('#stmenu') || document.body.appendChild(Object.assign(document.createElement('div'), { id: 'stmenu', role: 'listbox' }));
function closeStMenu(refocus) {
  const m = $('#stmenu'); if (m) m.classList.remove('open');
  if (stBtn) { stBtn.setAttribute('aria-expanded', 'false'); if (refocus && stBtn.isConnected) stBtn.focus({ preventScroll: true }); }
  stBtn = null;
}
function openStMenu(btn) {
  closeStMenu(); stBtn = btn; btn.setAttribute('aria-expanded', 'true');
  const cur = (rec(btn.dataset.stbtn).status) || '', m = stMenu();
  m.innerHTML = STATUSES.map(([v, l, k]) => `<button type="button" role="option" class="stopt st-${k}${v === cur ? ' sel' : ''}" data-stopt="${v}"><span class="dot"></span>${l}</button>`).join('');
  const r = btn.getBoundingClientRect();
  m.style.minWidth = Math.max(r.width, 170) + 'px'; m.style.left = r.left + 'px'; m.style.top = '0'; m.classList.add('open');
  const h = m.offsetHeight, below = innerHeight - r.bottom;
  m.style.top = (below >= h + 8 ? r.bottom + 4 : Math.max(8, r.top - h - 4)) + 'px';
  (m.querySelector('.sel') || m.firstElementChild).focus({ preventScroll: true });
}
function setStatus(id, v) {
  rec(id).status = v; persist(); closeStMenu(); render();
  const b = document.querySelector(`[data-stbtn="${id}"]`); if (b) b.focus({ preventScroll: true });
}

function render() {
  closeStMenu();
  const st = computeStats(S);
  document.documentElement.dataset.theme = S.theme;
  $('#tab-dash').innerHTML = viewDash(S, st) + viewGpaTerms(S);
  $('#tab-courses').innerHTML = viewCourses(S, F);
  $('#tab-schedule').innerHTML = viewSchedule(S);
  $('#tab-whatif').innerHTML = viewWhatif(S, st, W);
  $('#tab-data').innerHTML = viewData(S);
  document.querySelectorAll('main>section').forEach(s => s.classList.toggle('on', s.id === 'tab-' + tab));
  document.querySelectorAll('#tabs button').forEach(b => b.classList.toggle('on', b.dataset.tab === tab));
  const nav = $('#tabs'), ab = $('#tabs button.on');   // điện thoại: menu cuộn ngang → giữ tab đang chọn trong tầm nhìn
  if (nav && ab && nav.scrollWidth > nav.clientWidth) nav.scrollLeft = ab.offsetLeft - (nav.clientWidth - ab.offsetWidth) / 2;
  const modalOpen = M.open || W.shareOpen;
  $('#modal').innerHTML = viewModal(S, M) + viewShareModal(S, st, W);
  document.body.classList.toggle('noscroll', modalOpen);
  document.querySelectorAll('header.top, main').forEach(x => { x.inert = modalOpen; });   // chặn thao tác phía sau khi cửa sổ mở
}
const go = t => { tab = t; location.hash = t; render(); };
function refreshWhatifResults() {
  const node = $('#wfLiveResults');
  if (node) node.innerHTML = viewWhatifResults(S, computeStats(S), W);
  document.querySelectorAll('#wfTargets [data-target]').forEach(b => b.classList.toggle('on', +b.dataset.target === +W.target));
}

// ---- Thêm / gỡ học phần ----
const showModal = () => { render(); const m = $('#modal .modal'); if (m) m.focus(); };
const openModal = sem => { M.open = true; M.sem = sem; M.group = ''; M.sub = ''; M.q = ''; showModal(); };
const closeModal = () => {
  const sem = M.sem; M.open = false; M.group = ''; M.sub = ''; M.q = ''; render();
  const b = document.querySelector(`[data-add-sem="${sem}"]`); if (b) b.focus();
};
const pickCourse = id => {
  const c = CATALOG[id];
  if (!c || !GROUPS[M.group] || !modalIds(M).includes(id) || listCourses(S).some(x => x.id === id)) return;
  const sem = M.sem;
  S.added.push({ id, sem, group: M.group }); persist(); closeModal();
  toast(`Đã thêm ${c.id} vào Học kỳ ${sem}`);
};
const removeAdded = id => {
  const r = S.courses[id];
  if (r && (r.status || Grade.hasScore(r)) && !confirm('Học phần này đã có trạng thái/điểm. Gỡ khỏi bảng sẽ xóa luôn dữ liệu đó. Tiếp tục?')) return;
  S.added = S.added.filter(a => a.id !== id); S.planExcluded = S.planExcluded.filter(x => x !== id); delete S.courses[id];
  S.schedule = S.schedule.filter(e => e.course !== id);
  persist(); render(); toast('Đã gỡ học phần');
};
function setPlanMembership(id, include, sem) {
  const course = listCourses(S).find(c => c.id === id);
  if (!course) return;
  if (!Array.isArray(S.planExcluded)) S.planExcluded = [];
  if (include) {
    const next = +sem;
    if (!Number.isInteger(next) || next < 1 || next > 8) return;
    S.planExcluded = S.planExcluded.filter(x => x !== id);
    if (course.added) { const item = S.added.find(a => a.id === id); if (item) item.sem = next; }
    else {
      const original = COURSES.find(c => c.id === id);
      if (original && original.sem === next) delete S.planSem[id]; else S.planSem[id] = next;
    }
    toast(`${id} đã thêm lại vào kế hoạch HK${next}`);
  } else {
    if (!S.planExcluded.includes(id)) S.planExcluded.push(id);
    toast(`${id} đã bỏ khỏi kế hoạch`);
  }
  persist(); render();
}
function moveCourse(id, sem) {
  const course = listCourses(S).find(c => c.id === id), next = +sem;
  if (!course || !Number.isInteger(next) || next < 1 || next > 8) return;
  if (course.added) {
    const item = S.added.find(a => a.id === id);
    if (item) item.sem = next;
  } else {
    const original = COURSES.find(c => c.id === id);
    if (original && original.sem === next) delete S.planSem[id];
    else S.planSem[id] = next;
  }
  persist(); render(); toast(`${course.id} đã chuyển sang HK${next}`);
}
// Dựng lại giao diện nhưng giữ con trỏ ở ô nhập điểm (kể cả khi vừa bấm Tab sang ô kế tiếp)
function renderKeepFocus() {
  setTimeout(() => {
    const a = document.activeElement, d = a && a.dataset, key = d && (d.sc !== undefined ? ['sc', d.sc] : d.as !== undefined ? ['as', d.as] : d.tg !== undefined ? ['tg', d.tg] : d.stbtn !== undefined ? ['stbtn', d.stbtn] : null);
    render();
    if (!key) return;
    const n = document.querySelector(`[data-${key[0]}="${key[1]}"]`);
    if (n) { n.focus({ preventScroll: true }); if (n.select) n.select(); }
  }, 0);
}
const rec = id => (S.courses[id] = S.courses[id] || { status: '', score: null });
const theme = () => { S.theme = S.theme === 'dark' ? 'light' : 'dark'; persist(); render(); };
const doExport = () => { persist(); Store.export(S); toast('Đã xuất file student_k2026.json'); };
const doReset = () => { if (confirm('Xóa toàn bộ dữ liệu đã nhập và kế hoạch đã lưu? Thao tác này không thể hoàn tác.')) { S = Store.fresh(); Object.assign(W, { target: 7, assumed: {}, sem: '', scope: 'graduation', selectedScenario: '', scenarioName: '', shareOpen: false }); persist(); render(); toast('Đã đặt lại dữ liệu'); } };

function downloadSummaryCard() {
  const st = computeStats(S), all = listCourses(S), pr = WHATIF.predict(st, W.assumed, all, S.courses, W.sem);
  const need = WHATIF.need(st, W.target, { scope: W.scope, semester: W.sem, assumed: W.assumed, list: all, courses: S.courses });
  const title = W.scenarioName || 'Kịch bản hiện tại';
  const canvas = document.createElement('canvas'); canvas.width = 1200; canvas.height = 630;
  const ctx = canvas.getContext('2d');
  if (!ctx) return toast('Không thể tạo ảnh trên trình duyệt này');
  const bg = ctx.createLinearGradient(0, 0, 1200, 630); bg.addColorStop(0, '#102b4c'); bg.addColorStop(1, '#2563eb');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'rgba(255,255,255,.1)'; ctx.beginPath(); ctx.arc(1080, 70, 210, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#bfdbfe'; ctx.font = '700 24px Segoe UI, sans-serif'; ctx.fillText('K2026 · TRÍ TUỆ NHÂN TẠO', 76, 78);
  ctx.fillStyle = '#ffffff'; ctx.font = '700 48px Segoe UI, sans-serif'; ctx.fillText(title.slice(0, 32), 76, 154);
  ctx.fillStyle = '#dbeafe'; ctx.font = '500 24px Segoe UI, sans-serif'; ctx.fillText(W.sem ? `Mô phỏng học kỳ ${W.sem}` : 'Mô phỏng nhiều học kỳ', 76, 202);
  ctx.fillStyle = '#ffffff'; ctx.font = '800 112px Segoe UI, sans-serif'; ctx.fillText(pr.avg.toFixed(2), 76, 350);
  ctx.fillStyle = '#bfdbfe'; ctx.font = '600 24px Segoe UI, sans-serif'; ctx.fillText('ĐTBTL HỆ 10 DỰ BÁO', 82, 395);
  ctx.fillStyle = '#ffffff'; ctx.font = '600 30px Segoe UI, sans-serif'; ctx.fillText(`GPA hệ 4: ${pr.gpa4.toFixed(2)}   ·   Xếp loại: ${pr.rank}`, 76, 470);
  ctx.fillStyle = '#dbeafe'; ctx.font = '500 24px Segoe UI, sans-serif';
  const needLine = need.status === 'select-term' ? 'Chọn học kỳ để tính điểm mục tiêu' : need.ok ? `Mục tiêu ${W.target.toFixed(1)} · cần đạt ${need.x.toFixed(2)} điểm trung bình` : `Mục tiêu ${W.target.toFixed(1)} · hiện không khả thi`;
  ctx.fillText(needLine, 76, 522);
  ctx.fillStyle = 'rgba(255,255,255,.72)'; ctx.font = '500 18px Segoe UI, sans-serif'; ctx.fillText('Tạo từ ứng dụng Quản lý Tiến độ Học tập K2026', 76, 584);
  canvas.toBlob(blob => {
    if (!blob) return toast('Không thể xuất ảnh PNG');
    const a = document.createElement('a'), url = URL.createObjectURL(blob);
    a.href = url; a.download = `k2026-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'mo-phong'}.png`;
    a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); toast('Đã tải thẻ tóm tắt PNG');
  }, 'image/png');
}
function openShareCard() {
  W.shareOpen = true; render();
  const modal = $('#modal .wf-share-modal'); if (modal) modal.focus();
}
function closeShareCard() {
  W.shareOpen = false; render();
  const button = $('#wfShare'); if (button) button.focus({ preventScroll: true });
}

// Nút "⋯" (chỉ hiện trên điện thoại): mở/đóng các thao tác Giao diện / Xuất / Nhập / Đặt lại
const setMore = open => { const h = $('header.top'), b = $('#btnMore'); h.classList.toggle('menu-open', open); if (b) b.setAttribute('aria-expanded', open); };
document.addEventListener('click', e => {
  const t = e.target;
  if (t.closest('#btnMore')) return setMore(!$('header.top').classList.contains('menu-open'));
  if (!t.closest('#actions') || t.closest('button,label')) setMore(false);
  const sb = t.closest('[data-stbtn]'), so = t.closest('[data-stopt]');
  if (so && stBtn) return setStatus(stBtn.dataset.stbtn, so.dataset.stopt);
  if (sb) { const same = sb === stBtn; closeStMenu(); if (!same) openStMenu(sb); return; }
  closeStMenu();
  if (W.shareOpen && t.classList.contains('wf-modal-bg')) return closeShareCard();
  if (M.open && t.classList.contains('mbg')) return closeModal();           // bấm vùng tối ngoài cửa sổ
  const m = t.closest('[data-add-sem],[data-grp],[data-sub],[data-back],[data-close],[data-pick],[data-rm],[data-plan-remove],[data-plan-include],[data-share-close]');
  if (m) {                                                                   // closest(): nút/dòng có phần tử con bên trong
    const k = m.dataset;
    if (k.addSem) openModal(+k.addSem);
    else if (k.grp) { M.group = k.grp; M.sub = ''; M.q = ''; showModal(); }
    else if (k.sub) { M.sub = k.sub; M.q = ''; showModal(); }
    else if (k.back !== undefined) { if (M.sub) M.sub = ''; else M.group = ''; M.q = ''; showModal(); }   // lùi 1 bước
    else if (k.close !== undefined) closeModal();
    else if (k.pick) pickCourse(k.pick);
    else if (k.rm) removeAdded(k.rm);
    else if (k.planRemove) setPlanMembership(k.planRemove, false);
    else if (k.planInclude) { const select = document.querySelector(`[data-restore-sem="${k.planInclude}"]`); setPlanMembership(k.planInclude, true, select && select.value); }
    else if (k.shareClose !== undefined) closeShareCard();
    return;
  }
  const d = t.dataset;
  const bg = t.closest('[data-block-go]');
  if (bg) { F.block = bg.dataset.blockGo; F.sem = ''; F.q = ''; return go('courses'); }   // "Xem môn" → tab Học phần lọc theo khối
  const gb = t.closest('[data-go]');
  if (gb && !d.tab) return go(gb.dataset.go);
  if (d.tab) go(d.tab);
  else if (t.closest('[data-target]')) { W.target = +t.closest('[data-target]').dataset.target; const x = $('#wgTarget'); if (x) x.value = W.target; refreshWhatifResults(); }
  else if (d.del !== undefined) { S.schedule.splice(+d.del, 1); persist(); render(); }
  else if (t.id === 'btnTheme' || t.id === 'btnTheme2') theme();
  else if (t.id === 'btnExport' || t.id === 'btnExport2') doExport();
  else if (t.id === 'btnReset' || t.id === 'btnReset2') doReset();
  else if (t.id === 'wReset') { W.assumed = {}; render(); }
  else if (t.id === 'wfShare') openShareCard();
  else if (t.id === 'wfDownloadCard') downloadSummaryCard();
  else if (t.id === 'wfSaveScenario' || t.id === 'wfUpdateScenario') {
    const saved = Store.saveScenario(S, { id: t.id === 'wfUpdateScenario' ? W.selectedScenario : '', name: $('#wfScenarioName').value, target: W.target, scope: W.scope, sem: W.sem, assumed: W.assumed });
    W.selectedScenario = saved.id; W.scenarioName = saved.name; persist(); render(); toast('Đã lưu kịch bản mô phỏng');
  }
  else if (t.id === 'wfDeleteScenario' && W.selectedScenario) {
    const item = S.scenarios.find(x => x.id === W.selectedScenario);
    if (item && confirm(`Xóa kịch bản “${item.name}”?`)) { Store.deleteScenario(S, W.selectedScenario); W.selectedScenario = ''; W.scenarioName = ''; persist(); render(); toast('Đã xóa kịch bản'); }
  }
  else if (t.id === 'sc-add') { S.schedule.push({ course: $('#sc-course').value, day: +$('#sc-day').value, campus: $('#sc-campus').value, start: +$('#sc-start').value || 1, len: +$('#sc-len').value || 1 }); persist(); render(); }
});
document.addEventListener('change', e => {
  const t = e.target, d = t.dataset;
  if (d.sc !== undefined) { const r = rec(d.sc), v = t.value === '' ? null : Math.min(10, Math.max(0, +t.value)); r.score = v; if (v !== null && r.status !== 'retake') r.status = 'done'; persist(); renderKeepFocus(); }
  else if (d.extra) { S.extras[d.extra] = t.checked; persist(); render(); }
  else if (d.planSem !== undefined) moveCourse(d.planSem, t.value);
  else if (d.tg !== undefined) { const r = rec(d.tg); r.target = t.value === '' || !Number.isFinite(+t.value) ? null : Math.min(10, Math.max(0, Math.round(+t.value * 10) / 10)); persist(); renderKeepFocus(); }
  else if (t.id === 'wSem') { W.sem = t.value; render(); }
  else if (t.id === 'wgScope') { W.scope = t.value; refreshWhatifResults(); }
  else if (t.id === 'wfScenario') {
    const scenario = S.scenarios.find(x => x.id === t.value);
    if (!scenario) Object.assign(W, { target: 7, assumed: {}, scope: 'graduation', selectedScenario: '', scenarioName: '' });
    else Object.assign(W, { target: scenario.target, assumed: { ...scenario.assumed }, scope: scenario.scope, sem: scenario.sem, selectedScenario: scenario.id, scenarioName: scenario.name });
    render();
  }
  else if (t.id === 'fsem') { F.sem = t.value; render(); } else if (t.id === 'fblock') { F.block = t.value; render(); }
  else if (t.id === 'fileImport') {
    const f = t.files[0]; if (!f) return; const rd = new FileReader();
    rd.onload = () => { try { const d = JSON.parse(rd.result); if (!Store.validate(d)) throw 0; S = Store.fix({ ...Store.fresh(), ...d }); persist(); render(); toast('Đã nhập dữ liệu'); } catch (x) { toast('File không hợp lệ: cần file .json xuất từ ứng dụng K2026'); } };
    rd.readAsText(f); t.value = '';
  }
});
document.addEventListener('keydown', e => {
  if (stBtn) {
    const o = [...document.querySelectorAll('#stmenu .stopt')], i = o.indexOf(document.activeElement);
    if (e.key === 'Escape') { e.preventDefault(); return closeStMenu(true); }
    if (e.key === 'ArrowDown') { e.preventDefault(); return o[(i + 1) % o.length].focus(); }
    if (e.key === 'ArrowUp') { e.preventDefault(); return o[(i - 1 + o.length) % o.length].focus(); }
    if (e.key === 'Tab') return closeStMenu();
  }
  if (M.open || W.shareOpen) {
    if (e.key === 'Escape') { e.preventDefault(); if (W.shareOpen) closeShareCard(); else closeModal(); return; }
    if (M.open && e.key === 'Enter' && e.target.dataset && e.target.dataset.pick) pickCourse(e.target.dataset.pick);
  }
});
document.addEventListener('input', e => {
  const t = e.target, d = t.dataset;
  if (d.as !== undefined || d.asRange !== undefined) {
    const id = d.as !== undefined ? d.as : d.asRange;
    const value = t.value === '' ? '' : Number.isFinite(+t.value) ? Math.min(10, Math.max(0, +t.value)) : '';
    W.assumed[id] = value;
    const number = document.querySelector(`[data-as="${id}"]`), range = document.querySelector(`[data-as-range="${id}"]`), preview = document.querySelector(`[data-grade-preview="${id}"]`);
    if (number && number !== t) number.value = value === '' ? '' : value;
    if (range && range !== t) range.value = value === '' ? 0 : value;
    if (preview) preview.innerHTML = value === '' ? '—' : gradeChip({ score: value });
    refreshWhatifResults(); return;
  }
  if (t.id === 'wgTarget') {
    W.target = t.value === '' || !Number.isFinite(+t.value) ? 5 : Math.min(10, Math.max(5, +t.value));
    refreshWhatifResults(); return;
  }
  if (t.id === 'wfScenarioName') { W.scenarioName = t.value; return; }
  if (e.target.id === 'mq') { M.q = e.target.value; $('#mlist').innerHTML = modalTable(S, M); return; }   // chỉ cập nhật bảng, giữ nguyên ô nhập (an toàn với gõ Telex/VNI)
  if (e.target.id === 'fq') {   // chỉ cập nhật bảng, giữ nguyên ô nhập (an toàn với gõ Telex/VNI)
    F.q = e.target.value; closeStMenu();
    const tmp = document.createElement('div'); tmp.innerHTML = viewCourses(S, F);
    $('#ctable').innerHTML = tmp.querySelector('#ctable').innerHTML;
  } });
window.addEventListener('scroll', () => closeStMenu(), true);
window.addEventListener('resize', () => closeStMenu());
window.addEventListener('beforeunload', persist);
document.addEventListener('visibilitychange', () => { if (document.hidden) persist(); });
window.addEventListener('hashchange', () => { tab = location.hash.slice(1) || 'dash'; render(); });
render();
