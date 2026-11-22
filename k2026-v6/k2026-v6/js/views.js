// Giao diện từng tab (tách theo CN). Mỗi hàm trả về chuỗi HTML.
const pct = (a, b) => Math.min(100, Math.round(a / b * 1000) / 10);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const typeChip = t => `<span class="ty ty-${t}">${t}</span>`;
// Học lại: môn bị F (dưới 4.0) phải học lại. Học cải thiện: môn ĐÃ ĐẠT học lại để nâng điểm.
// Cả hai: điểm lần trước được giữ trong lịch sử, điểm tính GPA = điểm cao nhất các lần học.
const STATUSES = [['', 'Chưa học', 'none'], ['doing', 'Đang học', 'doing'], ['done', 'Đã xong', 'done'], ['retake', 'Học lại', 'retake'], ['improve', 'Học cải thiện', 'improve']];
const semOpts = (S, cur) => semList(S).map(i => `<option value="${i}" ${+cur === i ? 'selected' : ''}>${i}</option>`).join('');
const ICON_SEARCH = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>';
const gradeChip = r => { const s = Grade.best(r); return s !== null ? `<span class="g g${Grade.letter(s)}">${Grade.letter(s)}</span> ${Grade.p4(s).toFixed(1)}` : '—'; };

// Cửa sổ "Thêm học phần": bước 1 chọn nhóm (theo học kỳ) → [bước 2 chọn lựa chọn con nếu nhóm có] → bước cuối chọn học phần
function modalTable(S, M) {
  const have = {};
  listCourses(S).forEach(c => { have[c.id] = c.sem; });
  const all = modalIds(M).map(id => CATALOG[id]), dt = all.some(c => c.dt), cols = dt ? 8 : 7;   // cột ĐT (đề tài) chỉ hiện ở mục 7.2.3
  const rows = all.filter(c => matchQ(c, M.q)).map(c => {
    const at = have[c.id];
    return `<tr class="${at ? 'dis' : 'pick'}" ${at ? '' : `data-pick="${c.id}" tabindex="0"`}><td>${c.id}</td><td>${esc(c.name)}${at ? ` <span class="badge wn">Đã có ở HK${at}</span>` : ''}</td><td>${c.tc}</td><td>${typeChip(c.type)}</td><td>${c.lt}</td><td>${c.th}</td><td>${c.bt}</td>${dt ? `<td>${c.dt || ''}</td>` : ''}</tr>`;
  }).join('');
  return `<table><tr><th>Mã HP</th><th>Tên học phần</th><th>TC</th><th>Loại</th><th title="Số tiết lý thuyết">LT</th><th title="Số tiết thực hành">TH</th><th title="Số tiết bài tập">BT</th>${dt ? '<th title="Số tiết thực hiện đề tài">ĐT</th>' : ''}</tr>${rows || `<tr><td colspan="${cols}">Không có học phần khớp.</td></tr>`}</table>`;
}
function viewModal(S, M) {
  if (!M.open) return '';
  const g = GROUPS[M.group], sub = g && g.subs ? g.subs.find(x => x.key === M.sub) : null;
  const step = !g ? 1 : (g.subs && !sub ? 2 : 3);
  const where = g ? `${esc(g.name)}${sub ? ' › ' + esc(sub.name) : ''}` : '';
  const hint = step === 1 ? 'Chọn nhóm kiến thức' : step === 2 ? `${where} · chọn một ${g.unit}` : `${where} · bấm vào một học phần để thêm`;
  const head = `<div class="mh"><div><h3 id="mtitle">Thêm học phần vào Học kỳ ${M.sem}</h3><span class="mut">${hint}</span></div><button class="pill" data-close="1" aria-label="Đóng">✕</button></div>`;
  const card = (attr, title, line) => `<button class="gcard" ${attr}><b>${title}</b><span class="mut">${line}</span></button>`;
  let body;
  if (step === 1) {
    body = `<div class="mb"><p class="mut">Môn đã có trong bảng muốn học lại / học cải thiện: chọn trạng thái <b>Học lại</b> hoặc <b>Học cải thiện</b> ở tab Học phần, không cần thêm lại.</p><div class="gcards">${groupsFor(M.sem).map(([k, x]) => card(`data-grp="${k}"`, esc(x.name), `${x.subs ? `${x.subs.length} ${x.unit}` : `${x.ids.length} học phần`}${M.sem < x.from ? ` · khuyến nghị từ HK${x.from}` : ''}`)).join('')}</div></div>`;
  } else if (step === 2) {
    body = `<div class="mt"><button class="pill" data-back="1">← Quay lại</button></div>
      <div class="mb"><div class="gcards">${g.subs.map(x => card(`data-sub="${x.key}"`, esc(x.name), `${esc(x.desc)} · ${x.ids.length} học phần`)).join('')}</div></div>`;
  } else {
    const dt = modalIds(M).some(id => CATALOG[id].dt);
    body = `<div class="mt"><button class="pill" data-back="1">← Quay lại</button><input id="mq" placeholder="Tìm theo mã hoặc tên…" value="${esc(M.q)}" autocomplete="off"></div>
      ${sub && sub.note ? `<div class="mnote">${esc(sub.note)}</div>` : ''}
      <div class="mb tbl" id="mlist">${modalTable(S, M)}</div><div class="mf mut">LT = tiết lý thuyết · TH = tiết thực hành · BT = tiết bài tập${dt ? ' · ĐT = tiết thực hiện đề tài' : ''} · BB = Bắt buộc, TC = Tự chọn</div>`;
  }
  return `<div class="mbg"><div class="modal${sub && sub.wide ? ' wide' : ''}" role="dialog" aria-modal="true" aria-labelledby="mtitle" tabindex="-1">${head}${body}</div></div>`;
}

const EXTRA_SHORT = { gdtc1: ['Thể dục 1', 'Đạt'], gdtc2: ['Thể dục 2', 'Đạt'], gdqp: ['GDQP-AN', 'Hoàn thành'], ngoai: ['Ngoại ngữ', 'Đạt'] };
function viewDash(S, st) {   // CN-03
  const p = pct(st.tc, TOTAL_TC), ex = S.extras, left = TOTAL_TC - st.tc, keys = Object.keys(BLOCKS);
  const missEx = EXTRAS.filter(([k]) => !ex[k]).map(([k]) => EXTRA_SHORT[k][0]);
  const exTc = EXTRAS.reduce((n, [k, , tc]) => n + (ex[k] ? tc : 0), 0);   // TC chứng chỉ đã đạt (không cộng vào 138)
  const gpaOk = st.N > 0 && st.gpa + EPS >= GPA_MIN;
  const warn = [
    [st.tc >= TOTAL_TC, st.tc >= TOTAL_TC ? `Tích lũy: đủ ${TOTAL_TC} TC` : `Tích lũy: còn thiếu ${left} / ${TOTAL_TC} TC`],
    [gpaOk, !st.N ? 'GPA: chưa có học phần có điểm' : gpaOk ? `GPA ${st.gpa.toFixed(2)} đạt mức tối thiểu ${GPA_MIN.toFixed(2)}` : `GPA ${st.gpa.toFixed(2)} dưới mức tối thiểu ${GPA_MIN.toFixed(2)}`],
    [!missEx.length, missEx.length ? `Điều kiện phụ: còn thiếu ${missEx.join(', ')}` : 'Điều kiện phụ: đã đủ Thể dục 1, Thể dục 2, GDQP-AN, Ngoại ngữ'],
    [st.blocks.tn >= BLOCKS.tn.tc, `Khối tốt nghiệp: ${st.blocks.tn} / ${BLOCKS.tn.tc} TC`]
  ];
  if (st.failed.length) warn.push([false, `${st.failed.length} học phần điểm F cần học lại: ${st.failed.map(c => esc(c.name)).join(', ')}`]);
  const allOk = warn.every(w => w[0]);
  // Thanh tổng: 4 đoạn theo tỉ lệ TC của từng khối, mỗi đoạn tô theo tiến độ khối đó
  const seg = keys.map(k => `<div class="dseg" style="flex:${BLOCKS[k].tc}" title="${BLOCKS[k].name}: ${st.blocks[k]} / ${BLOCKS[k].tc} TC"><i style="width:${pct(st.blocks[k], BLOCKS[k].tc)}%"></i></div>`).join('');
  const blockRows = keys.map(k => { const b = BLOCKS[k], q = pct(st.blocks[k], b.tc); return `<div class="dblock">
      <div class="dbn"><b>${b.name}</b><span class="mut">${b.tc} TC${st.blocksRaw[k] > st.blocks[k] ? ` · đã học ${st.blocksRaw[k]}` : ''}</span></div>
      <div class="dbar"><i style="width:${q}%"></i></div>
      <div class="dbv"><b>${st.blocks[k]} / ${b.tc} TC</b><span class="mut">${q}%</span></div>
      <button class="dlink" data-block-go="${k}">Xem môn ›</button></div>`; }).join('');
  return `<div class="card dhero"><div class="row dtop"><span class="dlabel">Tiến độ tổng thể</span><span class="mut">Mục tiêu: ${TOTAL_TC} tín chỉ bắt buộc</span></div>
    <div class="dhead"><span class="dpct">${p}%</span><span><b class="dfrac">${st.tc} / ${TOTAL_TC} tín chỉ</b><br><span class="mut">${left > 0 ? `Còn thiếu ${left} TC để đủ điều kiện tích lũy` : 'Đã đủ tín chỉ tích lũy'}</span></span></div>
    <div class="dsegs">${seg}</div>
    <div class="dlegend">${keys.map(k => `<span>${BLOCKS[k].name} <b>${st.blocks[k]}/${BLOCKS[k].tc}</b></span>`).join('')}</div></div>
  <div class="dgrid3">
    <div class="card dstat"><div class="row dtop"><span class="dlabel">Tín chỉ tích lũy</span><span class="dico">TC</span></div>
      <div><span class="dnum">${st.tc}</span> <span class="mut dden">/ ${TOTAL_TC} TC</span></div>
      <span class="mut">Đã đạt ${st.tc} TC · còn thiếu ${left} TC</span></div>
    <div class="card dstat"><div class="row dtop"><span class="dlabel">ĐTB tích lũy (GPA thang 4.0)</span><span class="dico">GPA</span></div>
      <div><span class="dnum">${st.gpa.toFixed(2)}</span> <span class="mut dden">/ 4.0</span></div>
      <div class="dbar"><i style="width:${pct(st.gpa, 4)}%"></i></div>
      <span class="mut">ĐTBTL hệ 10: <b>${st.avg10.toFixed(2)}</b>${st.N ? ` · ${WHATIF.rank(st.avg10)}` : ''} · tính trên ${st.N} TC đạt có điểm, không gồm môn điều kiện phụ</span></div>
    <div class="card dstat"><div class="row dtop"><span class="dlabel">Điều kiện phụ</span><span class="mut">Bấm để đánh dấu</span></div>
      <div class="dchips">${EXTRAS.map(([k, name, tc]) => `<label class="dchip ${ex[k] ? 'on' : ''}" title="${esc(name)}${tc ? ` (${tc} TC)` : ''}"><input type="checkbox" data-extra="${k}" ${ex[k] ? 'checked' : ''}>${ex[k] ? '✓' : '○'} ${EXTRA_SHORT[k][0]}${tc ? ` (${tc} TC)` : ''} · ${ex[k] ? EXTRA_SHORT[k][1] : 'Chưa đạt'}</label>`).join('')}</div>
      <span class="mut">Chứng chỉ GDTC + GDQP-AN: <b>${exTc} / ${EXTRA_TC} TC</b>. Theo CTĐT, các tín chỉ này tính riêng, không cộng vào ${TOTAL_TC} TC chuyên môn và GPA.</span></div>
  </div>
  <div class="dgrid2">
    <div class="card"><h3 class="dh">Tiến độ 4 khối kiến thức</h3>${blockRows}</div>
    <div class="dcol">
      <div class="card"><div class="row dtop"><h3 class="dh">Cảnh báo tốt nghiệp</h3><span class="badge ${allOk ? 'ok' : 'wn'}">${allOk ? 'Đủ điều kiện' : 'Chưa đủ điều kiện'}</span></div>
        ${warn.map(([ok, t]) => `<div class="dwarn"><span class="dwi ${ok ? 'ok' : 'wn'}">${ok ? '✓' : '!'}</span><span>${t}</span></div>`).join('')}</div>
      <div class="dcta"><div><b>Mô phỏng điểm (What-if)</b><span>Chọn hạng mục tiêu, xem điểm cần đạt ở số tín chỉ còn lại và gợi ý học cải thiện.</span></div><button data-go="whatif">Mở Mô phỏng ›</button></div>
    </div>
  </div>`;
}

function viewCourses(S, f) {   // CN-01 + CN-02
  const all = listCourses(S), filtering = !!(f.q || f.block), n = semCount(S);
  const opt = (v, t, cur) => `<option value="${v}" ${String(cur) === String(v) ? 'selected' : ''}>${t}</option>`;
  let rows = '';
  for (const sem of semList(S)) {   // luôn hiện đủ các học kỳ (mặc định HK1–HK8), mỗi học kỳ có nút "Thêm học phần" ở cuối
    if (f.sem && sem != f.sem) continue;
    const list = all.filter(c => c.sem === sem && matchQ(c, f.q) && (!f.block || c.block == f.block));
    if (filtering && !list.length) continue;   // đang tìm/lọc khối: ẩn học kỳ rỗng và nút thêm
    rows += `<tr class="sem"><td colspan="9">Học kỳ ${sem}</td></tr>`;
    if (!list.length) rows += `<tr class="empty"><td colspan="9">Chưa có học phần.</td></tr>`;
    list.forEach(c => {
      const r = S.courses[c.id] || {}, st = r.status || '', off = !st && !Grade.hasScore(r), best = Grade.best(r);
      const past = (r.history || []).map(h => `<span class="badge hist" title="Điểm lần học trước, vẫn được giữ. GPA lấy điểm cao nhất.">Lần trước HK${h.sem}: ${Grade.round1(h.score).toFixed(1)}</span>`).join(' ');
      rows += `<tr class="crow"><td class="code">${c.id}</td><td>${esc(c.name)}${past ? `<br>${past}` : ''}</td><td class="c">${c.tc}</td><td class="c">${typeChip(c.type)}</td>
      <td>${(() => { const x = STATUSES.find(a => a[0] === st) || STATUSES[0]; return `<button type="button" class="stbtn st-${x[2]}" data-stbtn="${c.id}" aria-haspopup="listbox" aria-expanded="false"><span class="dot"></span>${x[1]}</button>`; })()}</td>
      <td><input class="sc${off ? ' off' : ''}" type="number" min="0" max="10" step="0.1" data-sc="${c.id}" aria-label="Điểm ${c.id}" value="${Grade.hasCurrent(r) ? r.score : ''}" placeholder="${r.history && r.history.length ? 'Lần mới' : '0–10'}"></td><td>${gradeChip(r)}</td>
      <td><input class="tg" type="number" min="0" max="10" step="0.1" data-tg="${c.id}" aria-label="Điểm mục tiêu ${c.id}" value="${IMPROVE.hasTarget(r) ? r.target : ''}" placeholder="—">${best !== null && best < 4 && st !== 'retake' ? ' <span class="badge no" title="Điểm F (dưới 4.0): phải học lại">Cần học lại</span>'
        : best !== null && IMPROVE.hasTarget(r) && Grade.round1(r.target) > best && st !== 'improve' ? ' <span class="badge wn" title="Điểm mục tiêu cao hơn điểm thật">Nên cải thiện</span>' : ''}</td>
      <td>${c.added ? `<button class="pill rm" data-rm="${c.id}" title="Gỡ học phần này khỏi bảng">Gỡ</button>` : ''}</td></tr>`;
    });
    if (!filtering) rows += `<tr class="addrow"><td colspan="9"><button class="pill" data-add-sem="${sem}">+ Thêm học phần</button>${sem === n && n > MIN_SEM && !list.length ? ` <button class="pill rm" data-rm-term="1" title="Xóa học kỳ trống cuối cùng">Xóa Học kỳ ${n}</button>` : ''}</td></tr>`;
  }
  if (!filtering && !f.sem) rows += `<tr class="addrow"><td colspan="9">${n < MAX_SEM ? `<button class="pill" data-add-term="1">+ Thêm học kỳ ${n + 1}</button> <span class="mut">Dùng khi học quá ${MIN_SEM} học kỳ (tối đa ${MAX_SEM}).</span>` : `<span class="mut">Đã đạt tối đa ${MAX_SEM} học kỳ.</span>`}</td></tr>`;
  const fsel = (id, label, all, items, cur) => `<label class="fsel"><span class="fl">${label}</span><select id="${id}"><option value="">${all}</option>${items.map(([v, t]) => opt(v, t, cur)).join('')}</select></label>`;
  return `<div class="fbar"><label class="fsearch">${ICON_SEARCH}<input id="fq" placeholder="Tìm theo mã hoặc tên học phần…" value="${esc(f.q)}" autocomplete="off"></label>
    ${fsel('fsem', 'Học kỳ kiến nghị', `Tất cả (HK1 – HK${n})`, semList(S).map(i => [i, 'Học kỳ ' + i]), f.sem)}
    ${fsel('fblock', 'Khối kiến thức', 'Tất cả khối kiến thức', Object.entries(BLOCKS).map(([k, b]) => [k, b.name]), f.block)}</div>
    <div id="ctable"><div class="card tw tcard"><table><tr class="hd"><th>Mã HP</th><th>Tên học phần</th><th class="c">TC</th><th class="c">Loại</th><th>Trạng thái</th><th>Điểm hệ 10</th><th>Chữ · Hệ 4</th><th>Điểm mục tiêu</th><th></th></tr>${rows || '<tr><td colspan="9">Không có học phần khớp bộ lọc.</td></tr>'}</table>
    <p class="mut foot"><b>BB</b> = Bắt buộc, <b>TC</b> = Tự chọn. GDTC, GDQP-AN, Ngoại ngữ không tính vào GPA và tín chỉ tích lũy. Tìm kiếm không cần gõ dấu. <b>Học lại</b> = môn bị F học lại; <b>Học cải thiện</b> = môn đã đạt học lại để nâng điểm — chọn trạng thái này, điểm cũ được lưu lại và GPA lấy điểm cao nhất. <b>Điểm mục tiêu</b> cao hơn điểm thật → được đề xuất học cải thiện ở tab Mô phỏng điểm.</p></div></div>`;
}

function viewSchedule(S) {   // CN-06 – kế hoạch học phần theo học kỳ + lịch Portal
  const plan = Plan.analyze(S), all = listCourses(S);
  const semesterCards = Object.entries(plan.semesters).map(([sem, item]) => {
    const warnings = item.warnings.map(w => `<div class="dwarn"><span class="badge ${w.level}">${w.level === 'no' ? '!' : '·'}</span><span>${esc(w.text)}</span></div>`).join('');
    const rows = item.courses.map(c => `<div class="plan-course row"><span><b>${esc(c.name)}</b><br><span class="mut">${c.id} · ${c.tc} TC</span></span>
      <label class="mut">Học kỳ <select data-plan-sem="${c.id}" aria-label="Chuyển ${esc(c.name)} sang học kỳ">${semOpts(S, sem)}</select></label>
      ${c.added ? `<button class="pill rm" data-rm="${c.id}" title="Gỡ học phần tự chọn">Gỡ</button>` : `<button class="pill" data-plan-remove="${c.id}" title="Bỏ môn khỏi kế hoạch, vẫn giữ trong tiến độ học tập">Bỏ khỏi KH</button>`}</div>`).join('') || '<p class="mut">Chưa có học phần trong kỳ này.</p>';
    const width = Math.min(100, Math.round(item.credits / PLAN_LIMITS.maximum * 100));
    return `<div class="card plan-semester"><div class="row"><h3>Học kỳ ${sem}</h3><button class="pill" data-add-sem="${sem}">+ Thêm môn</button></div>
      <div class="dhead"><b>${item.credits} TC</b><span class="mut">/ ${PLAN_LIMITS.recommended} TC khuyến nghị</span></div><div class="dbar"><i style="width:${width}%"></i></div>
      ${item.credits > PLAN_LIMITS.maximum ? `<p><span class="badge no">Vượt trần tham khảo ${PLAN_LIMITS.maximum} TC</span></p>` : item.credits > PLAN_LIMITS.recommended ? `<p><span class="badge wn">Vượt mức khuyến nghị ${PLAN_LIMITS.recommended} TC</span></p>` : ''}
      ${warnings ? `<div class="plan-warnings">${warnings}</div>` : '<p class="mut">Không có cảnh báo.</p>'}${rows}</div>`;
  }).join('');
  const unplanned = plan.unplanned.length ? `<div class="card plan-unplanned"><h3>Học phần chưa xếp vào kế hoạch</h3>${plan.unplanned.map(c => `<div class="plan-course row"><span><b>${esc(c.name)}</b><br><span class="mut">${c.id} · ${c.tc} TC</span></span>
    <label class="mut">Học kỳ <select data-restore-sem="${c.id}" aria-label="Học kỳ để xếp lại ${esc(c.name)}">${semOpts(S, c.sem)}</select></label><button class="pill" data-plan-include="${c.id}">Thêm lại</button></div>`).join('')}</div>` : '';
  const campus = Object.keys(CAMPUS);
  const time = (cp, p, n) => { const [h, m] = CAMPUS[cp].start.split(':').map(Number), a = h * 60 + m + (p - 1) * CAMPUS[cp].len, b = a + n * CAMPUS[cp].len, f = x => String(Math.floor(x / 60)).padStart(2, '0') + ':' + String(x % 60).padStart(2, '0'); return f(a) + '–' + f(b); };
  const items = S.schedule.map((e, i) => ({ ...e, i })), clash = Sched.clashSet(S.schedule), cn = id => (all.find(c => c.id === id) || {}).name || id;
  const scheduledBar = Math.min(100, Math.round(plan.plannedCredits / TOTAL_TC * 100));
  return `<div class="card plan-overview"><div class="row"><div><h3>Kế hoạch tín chỉ theo học kỳ</h3><span class="mut">Mặc định theo <a href="${CTDT_TTNT_2025.url}" target="_blank" rel="noopener">${CTDT_TTNT_2025.title}</a>. Có thể điều chỉnh để lập kế hoạch cá nhân.</span></div><b>${plan.plannedCredits} / ${TOTAL_TC} TC</b></div>
    <div class="dbar"><i style="width:${scheduledBar}%"></i></div><p class="mut">Đã xếp ${plan.plannedCredits} TC · yêu cầu tốt nghiệp ${TOTAL_TC} TC. Ngưỡng tải học kỳ trong ứng dụng: ${PLAN_LIMITS.recommended} TC khuyến nghị, ${PLAN_LIMITS.maximum} TC trần tham khảo. Cảnh báo vàng về học phần học trước chỉ là gợi ý, không phải điều kiện đăng ký; ${CTDT_TTNT_2025.note}</p></div>
    ${unplanned}<div class="grid plan-grid">${semesterCards}</div>
    <div class="card"><h3>Lịch học (từ kết quả đăng ký trên Portal)</h3><div class="sform">
    <select id="sc-course" aria-label="Học phần">${all.map(c => `<option value="${c.id}">${c.id} – ${esc(c.name)}</option>`).join('')}</select>
    <select id="sc-day" aria-label="Thứ">${DAYS.map((d, i) => `<option value="${i}">${d}</option>`).join('')}</select>
    <select id="sc-campus" aria-label="Cơ sở">${campus.map(c => `<option>${c}</option>`).join('')}</select>
    <select id="sc-type" aria-label="Loại buổi học">${Object.entries(CLASS_TYPES).map(([k, v]) => `<option value="${k}">${v}</option>`).join('')}</select>
    <label class="sfl"><span class="mut">Tiết bắt đầu</span><input type="number" id="sc-start" min="1" max="${PERIODS_PER_DAY}" step="1" value="1" aria-label="Tiết bắt đầu"></label><label class="sfl"><span class="mut">Số tiết</span><input type="number" id="sc-len" min="1" max="${MAX_LEN}" step="1" value="3" aria-label="Số tiết"></label></div>
    <div class="row"><span class="mut">Tiết 1–${PERIODS_PER_DAY}, mỗi buổi tối đa ${MAX_LEN} tiết. Lịch trùng giờ sẽ được cảnh báo.</span><button class="pill sadd" id="sc-add">Thêm lịch Portal</button></div><p class="sc-err" id="sc-err" role="alert"></p></div>
    ${clash.size ? `<div class="card"><div class="dwarn"><span class="badge no">!</span><span>Có ${clash.size} buổi học bị trùng giờ (đánh dấu đỏ bên dưới). Kiểm tra lại lịch đăng ký trên Portal.</span></div></div>` : ''}
    <div class="grid">${DAYS.map((d, di) => `<div class="card"><h3>${d}</h3>${items.filter(e => e.day == di).sort((a, b) => a.start - b.start).map(e => `<div class="row${clash.has(e.i) ? ' sclash' : ''}"><span><b>${esc(cn(e.course))}</b> <span class="badge ty-${e.type || 'lt'}">${CLASS_TYPES[e.type] || CLASS_TYPES.lt}</span>${clash.has(e.i) ? ' <span class="badge no">Trùng tiết</span>' : ''}<br><span class="mut">${time(e.campus, e.start, e.len)} · tiết ${e.start}–${e.start + e.len - 1} · ${esc(e.campus)}</span></span><button class="pill" data-del="${e.i}">Xóa</button></div>`).join('') || '<span class="mut">Chưa có lịch.</span>'}</div>`).join('')}</div>`;
}

function viewWhatifResults(S, st, W) {
  const all = listCourses(S), pr = WHATIF.predict(st, W.assumed, all, S.courses, W.sem);
  const need = WHATIF.need(st, W.target, { scope: W.scope, semester: W.sem, assumed: W.assumed, list: all, courses: S.courses });
  const needStatus = { safe: ['ok', 'An toàn'], effort: ['wn', 'Cần cố gắng'], risk: ['no', 'Rủi ro cao'], impossible: ['no', 'Bất khả thi'] };
  const status = needStatus[need.status] || ['wn', 'Chọn học kỳ'];
  const needText = need.status === 'select-term' ? 'Chọn một học kỳ ở bảng điểm để tính mục tiêu cuối kỳ.'
    : need.status === 'risk' ? `Mức trung bình cần thiết rất cao (${need.x.toFixed(2)}); theo dõi GPA và khả năng đạt điểm từng môn.`
    : need.done ? `${need.ok ? 'Mục tiêu đã đạt theo mô phỏng.' : 'Không còn tín chỉ dự kiến để bù mục tiêu này.'} ĐTBTL mô phỏng: ${need.x.toFixed(2)}.`
      : need.ok ? `Cần trung bình tối thiểu ${need.x.toFixed(2)} trên ${need.R} TC còn lại.`
        : `Cần ${need.x.toFixed(2)} trên ${need.R} TC còn lại; vượt mức tối đa 10.0 nên không khả thi.`;
  const periodText = W.sem ? `HK${W.sem}: ${pr.termAvg10 === null ? 'chưa có điểm dự kiến' : `ĐTBTL ${pr.termAvg10.toFixed(2)} · GPA ${pr.termGpa4.toFixed(2)} trên ${pr.termCredits} TC`}` : 'Chọn học kỳ để xem GPA riêng của kỳ.';
  const probation = pr.tc > 0 && pr.gpa4 < GPA_MIN;
  const progress = Math.min(100, Math.round((st.tc + pr.added) / TOTAL_TC * 100));
  return `<div class="grid wf-metrics">
      <div class="card"><h3>GPA học kỳ đang chọn</h3><div class="big">${W.sem && pr.termGpa4 !== null ? pr.termGpa4.toFixed(2) : '—'}</div><span class="mut">${periodText}</span></div>
      <div class="card"><h3>ĐTBTL tích lũy dự báo</h3><div class="big">${pr.avg.toFixed(2)} <span class="badge ${pr.rank === 'Chưa đạt hạng' ? 'wn' : 'ok'}">${pr.rank}</span></div><span class="mut">GPA hệ 4 ${pr.gpa4.toFixed(2)} · hiện tại ${st.gpa.toFixed(2)} · tính trên ${pr.tc} TC có điểm</span>
        ${probation ? `<p><span class="badge no">GPA dưới ngưỡng cảnh báo ${GPA_MIN.toFixed(1)}</span></p>` : ''}${pr.skipped ? `<p class="mut">${pr.skipped} điểm giả định dưới 4.0 không được tính tích lũy.</p>` : ''}</div>
    </div>
    <div class="card"><div class="row"><h3>Kết quả mô phỏng</h3><span class="badge ${pr.tc === 0 ? 'wn' : probation ? 'no' : 'ok'}">${pr.tc === 0 ? 'Chưa đủ dữ liệu' : probation ? 'Cần theo dõi học vụ' : 'Đang trong ngưỡng GPA'}</span></div>
      <div class="dhead"><b>${st.tc + pr.added} / ${TOTAL_TC} TC dự kiến</b><span class="mut">${progress}%</span></div><div class="dbar"><i style="width:${progress}%"></i></div></div>
    <div class="card"><div class="row"><h3>Điểm cần đạt cho mục tiêu</h3><span class="badge ${status[0]}">${status[1]}</span></div><div class="big">${need.status === 'select-term' ? '—' : need.ok ? need.x.toFixed(2) : 'Không khả thi'}</div><span class="mut">${needText} Mỗi học phần cần tối thiểu ${WHATIF.FLOOR.toFixed(1)} theo mô hình hiện tại.</span></div>`;
}

function viewWhatif(S, st, W) {   // CN-07 – giả định cập nhật tức thì, không đổi điểm thật
  const all = listCourses(S), pending = all.filter(c => WHATIF.pending(c, S.courses) && (!W.sem || String(c.sem) === String(W.sem)));
  const rows = pending.map(c => {
    const v = W.assumed[c.id], rangeValue = v === '' || v === undefined ? 0 : Math.min(10, Math.max(0, +v));
    return `<tr data-assumption-row="${c.id}"><td>${c.id}</td><td>${esc(c.name)}</td><td>${c.tc}</td><td><div class="wf-score-control">
      <input type="range" min="0" max="10" step="0.1" value="${rangeValue}" data-as-range="${c.id}" aria-label="Thanh trượt điểm dự kiến ${esc(c.name)}">
      <input type="number" min="0" max="10" step="0.1" data-as="${c.id}" value="${v ?? ''}" aria-label="Điểm dự kiến ${esc(c.name)}" placeholder="0–10"></div></td>
      <td data-grade-preview="${c.id}">${v !== undefined && v !== '' ? gradeChip({ score: v }) : '—'}</td></tr>`;
  }).join('');
  const scenarios = (S.scenarios || []).map(x => `<option value="${esc(x.id)}" ${W.selectedScenario === x.id ? 'selected' : ''}>${esc(x.name)}</option>`).join('');
  return `<div class="note">Chế độ thử nghiệm: thay đổi điểm không ghi đè điểm thật. Lưu kịch bản nếu muốn giữ lại trên thiết bị này.</div>
    <div class="grid whatif-layout"><div class="card tw wf-input"><div class="row"><div><h3>Bảng mô phỏng điểm</h3><span class="mut">Thanh trượt và ô nhập cập nhật kết quả ngay khi thay đổi.</span></div>${semSel('wSem', W.sem)}</div>
      <table><tr><th>Mã HP</th><th>Tên học phần</th><th>TC</th><th>Điểm dự kiến</th><th>Chữ · Hệ 4</th></tr>${rows || `<tr><td colspan="5">${W.sem ? `Học kỳ ${W.sem} không có môn chưa đạt hoặc đang chờ điểm.` : 'Không có học phần chờ mô phỏng.'}</td></tr>`}</table>
      <button class="pill" id="wReset">Đặt lại điểm mô phỏng</button></div>
      <aside class="wf-side"><div class="card"><h3>Kịch bản</h3><div class="row"><select id="wfScenario" aria-label="Chọn kịch bản đã lưu"><option value="">Kịch bản mới</option>${scenarios}</select><button class="pill" id="wfDeleteScenario" ${W.selectedScenario ? '' : 'disabled'}>Xóa</button></div>
        <div class="row"><input id="wfScenarioName" maxlength="48" placeholder="Tên kịch bản, ví dụ: Săn học bổng" value="${esc(W.scenarioName || '')}" aria-label="Tên kịch bản"></div>
        <div class="row"><button class="pill" id="wfSaveScenario">Lưu thành bản mới</button><button class="pill" id="wfUpdateScenario" ${W.selectedScenario ? '' : 'disabled'}>Cập nhật bản đã chọn</button></div>
        <button class="pill" id="wfShare">Xuất thẻ tóm tắt</button></div>
        <div class="card"><h3>Tính ngược mục tiêu ĐTBTL</h3><p class="mut">Nhập mục tiêu hệ 10 để tính điểm trung bình cần đạt trên số tín chỉ còn lại.</p>
          <div class="row"><label>Mục tiêu hệ 10 <input id="wgTarget" type="number" min="5" max="10" step="0.1" value="${W.target}"></label><label>Thời điểm <select id="wgScope"><option value="graduation" ${W.scope !== 'semester' ? 'selected' : ''}>Khi tốt nghiệp</option><option value="semester" ${W.scope === 'semester' ? 'selected' : ''}>Cuối học kỳ đang chọn</option></select></label></div>
          <div class="targets" id="wfTargets">${Object.entries(WHATIF.targets).map(([name, score]) => `<button type="button" data-target="${score}" class="${+W.target === score ? 'on' : ''}"><b>${name}</b> <span class="mut">≥ ${score.toFixed(1)}</span></button>`).join('')}</div>
        </div>
        <div id="wfLiveResults" aria-live="polite">${viewWhatifResults(S, st, W)}</div></aside></div>
    ${viewImprove(S, st)}`;
}

function viewShareModal(S, st, W) {
  if (!W.shareOpen) return '';
  const all = listCourses(S), pr = WHATIF.predict(st, W.assumed, all, S.courses, W.sem);
  const need = WHATIF.need(st, W.target, { scope: W.scope, semester: W.sem, assumed: W.assumed, list: all, courses: S.courses });
  const title = W.scenarioName || 'Kịch bản hiện tại';
  const needLabel = need.status === 'select-term' ? 'Chọn học kỳ để tính' : need.ok ? `Cần đạt ${need.x.toFixed(2)} điểm TB` : 'Mục tiêu chưa khả thi';
  return `<div class="mbg wf-modal-bg"><div class="modal wf-share-modal" role="dialog" aria-modal="true" aria-labelledby="wfShareTitle" tabindex="-1">
    <div class="mh"><div><h3 id="wfShareTitle">Thẻ tóm tắt mô phỏng</h3><span class="mut">Có thể tải thành ảnh PNG để chia sẻ.</span></div><button class="pill" data-share-close aria-label="Đóng">✕</button></div>
    <div class="mb"><div class="card wf-share-card"><span class="mut">K2026 · TRÍ TUỆ NHÂN TẠO</span><h2>${esc(title)}</h2><div class="big wf-share-score">${pr.avg.toFixed(2)} <small>ĐTBTL / 10</small></div>
      <p>GPA hệ 4: <b>${pr.gpa4.toFixed(2)}</b> · Xếp loại: <b>${esc(pr.rank)}</b></p><p>${W.sem ? `GPA HK${W.sem}: ${pr.termGpa4 === null ? '—' : pr.termGpa4.toFixed(2)}` : 'Mô phỏng nhiều học kỳ'}</p><p>Mục tiêu ${W.target.toFixed(1)} · ${esc(needLabel)}</p></div>
      <div class="row"><button class="pill" data-share-close>Đóng</button><button class="pill" id="wfDownloadCard">Tải ảnh PNG</button></div></div></div></div>`;
}

// Ô chọn học kỳ nhỏ ở góc phải tiêu đề thẻ
const semSel = (id, cur) => `<select id="${id}" aria-label="Chọn học kỳ" style="width:auto"><option value="">Tất cả HK</option>${semList(S).map(i => `<option value="${i}" ${String(cur) === String(i) ? 'selected' : ''}>Học kỳ ${i}</option>`).join('')}</select>`;

function viewImprove(S, st) {   // Gợi ý học cải thiện theo điểm mục tiêu từng môn – chỉ mô phỏng
  const r = IMPROVE.suggest(S, st), d = v => (v >= 0 ? '+' : '') + v.toFixed(2);
  const head = '<div class="row"><h3>Gợi ý học cải thiện</h3><span class="mut">Theo điểm mục tiêu từng môn (tab Học phần)</span></div>';
  if (!r.list.length) return `<div class="card" style="margin-top:14px">${head}<p class="mut">Chưa có môn nào có điểm mục tiêu cao hơn điểm thật. Nhập <b>Điểm mục tiêu</b> cho từng môn ở tab Học phần để nhận gợi ý.</p><button class="pill" data-go="courses">Mở tab Học phần</button></div>`;
  const rows = r.list.map(x => `<tr><td>${esc(x.name)}${x.failed ? ' <span class="badge no">F – bắt buộc học lại</span>' : ''}</td><td class="c">${x.sem}</td><td class="c">${x.tc}</td>
    <td>${x.old.toFixed(1)} · ${gradeChip({ score: x.old })}</td><td><b>${x.target.toFixed(1)}</b> · ${gradeChip({ score: x.target })}</td>
    <td>+${(x.target - x.old).toFixed(1)}</td><td>${d(x.d10)}</td><td>${d(x.d4)}</td></tr>`).join('');
  return `<div class="card" style="margin-top:14px">${head}
    <p class="mut">Đề xuất học cải thiện các môn có <b>điểm mục tiêu lớn hơn điểm thật</b>. Cột ĐTBTL / GPA tăng = mức tăng nếu chỉ học lại riêng môn đó và đạt đúng điểm mục tiêu (điểm mới chỉ thay điểm cũ nếu cao hơn).</p>
    <div class="tw"><table><tr><th>Tên học phần</th><th class="c">HK</th><th class="c">TC</th><th>Điểm thật</th><th>Điểm mục tiêu</th><th>Cần tăng</th><th>ĐTBTL tăng</th><th>GPA tăng</th></tr>${rows}</table></div>
    <p>Nếu học cải thiện cả ${r.list.length} môn đạt điểm mục tiêu: ĐTBTL ${st.avg10.toFixed(2)} → <b>${r.avg10.toFixed(2)}</b> <span class="badge ${r.rank === 'Chưa đạt hạng' ? 'wn' : 'ok'}">${r.rank}</span> · GPA ${st.gpa.toFixed(2)} → <b>${r.gpa.toFixed(2)}</b></p></div>`;
}

function viewData(S) {   // CN-04 + CN-05
  return `<div class="card"><h3>Quản lý dữ liệu cá nhân</h3><p class="mut">Dữ liệu lưu trên thiết bị của bạn, không cần kết nối mạng.</p>
  <div class="grid"><div class="card"><span class="mut">Tín chỉ tích lũy</span><br><b>${computeStats(S).tc} / ${TOTAL_TC} TC</b></div><div class="card"><span class="mut">Học phần đã lưu</span><br><b>${Object.keys(S.courses).length} môn</b></div>
  <div class="card"><span class="mut">Dung lượng</span><br><b>${Store.size()} KB</b></div><div class="card"><span class="mut">Sao lưu gần nhất</span><br><b>${S.savedAt ? new Date(S.savedAt).toLocaleString('vi-VN') : 'Chưa có'}</b></div></div></div>
  <div class="grid"><div class="card"><h3>Nguồn lộ trình</h3><p class="mut"><a href="${CTDT_TTNT_2025.url}" target="_blank" rel="noopener">${CTDT_TTNT_2025.title}</a>. ${CTDT_TTNT_2025.note}</p></div>
  <div class="card"><h3>Gợi ý học phần học trước</h3><p class="mut"><a href="${STUDY_GUIDANCE_SOURCE.url}" target="_blank" rel="noopener">${STUDY_GUIDANCE_SOURCE.title}</a>. ${STUDY_GUIDANCE_SOURCE.note}</p></div>
  <div class="card"><h3>Chế độ giao diện</h3><p class="mut">Sáng (Navy / Slate Gray) hoặc tối (Dark Slate).</p><button class="pill" id="btnTheme2">Đổi giao diện</button></div>
  <div class="card"><h3>Xuất dữ liệu</h3><p class="mut">Tải file student_k2026.json về máy.</p><button class="pill" id="btnExport2">Tải file .json</button></div>
  <div class="card"><h3>Nhập dữ liệu</h3><p class="mut">Khôi phục từ file sao lưu. Nhập sẽ <b>ghi đè toàn bộ</b> dữ liệu hiện tại — xem hướng dẫn bên dưới.</p><label class="btn" for="fileImport">Chọn file .json</label></div>
  <div class="card"><h3>Đặt lại dữ liệu</h3><p class="mut">Xóa toàn bộ điểm đã nhập, không thể hoàn tác. Hãy xuất file sao lưu trước.</p><button class="pill danger" id="btnReset2">Đặt lại dữ liệu</button></div></div>
  <div class="card jsonguide"><h3>Hướng dẫn file sao lưu .json</h3>
    <ol>
      <li><b>Lấy file ở đâu?</b> Bấm <b>Tải file .json</b> (hoặc <b>Xuất JSON</b> trên thanh tiêu đề). Trình duyệt tải về file <code>student_k2026.json</code>. Không cần tự tạo file.</li>
      <li><b>Dùng để làm gì?</b> Sao lưu định kỳ, hoặc chuyển dữ liệu sang máy / trình duyệt khác: mở ứng dụng ở máy mới → <b>Chọn file .json</b> → chọn file vừa tải.</li>
      <li><b>File hợp lệ</b> phải được xuất từ ứng dụng này và có <code>"version": "${VERSION}"</code>. File khác (bảng điểm Portal, Excel, file tự viết sai cấu trúc) sẽ bị từ chối, dữ liệu hiện tại được giữ nguyên.</li>
      <li><b>Sau khi nhập</b>, toàn bộ điểm, kế hoạch, lịch học và kịch bản hiện có bị thay bằng nội dung file.</li>
    </ol>
    <details><summary>File chứa những gì?</summary>
      <table><tr><th>Trường</th><th>Nội dung</th></tr>
        <tr><td><code>version</code></td><td>Phiên bản dữ liệu, phải là "${VERSION}"</td></tr>
        <tr><td><code>courses</code></td><td>Theo từng mã học phần: trạng thái, điểm hệ 10 lần hiện tại, điểm mục tiêu, lịch sử các lần học lại / cải thiện</td></tr>
        <tr><td><code>extras</code></td><td>Điều kiện phụ: Thể dục 1, Thể dục 2, GDQP-AN, Ngoại ngữ (true = đạt)</td></tr>
        <tr><td><code>added</code></td><td>Học phần tự chọn đã thêm và học kỳ của chúng</td></tr>
        <tr><td><code>planSem</code>, <code>planExcluded</code>, <code>semCount</code></td><td>Kế hoạch học kỳ: môn đã chuyển kỳ, môn bỏ khỏi kế hoạch, số học kỳ</td></tr>
        <tr><td><code>schedule</code></td><td>Lịch học: môn, thứ, cơ sở, loại buổi (LT/TH/BT), tiết bắt đầu, số tiết</td></tr>
        <tr><td><code>scenarios</code></td><td>Kịch bản mô phỏng điểm đã lưu</td></tr>
        <tr><td><code>theme</code>, <code>savedAt</code></td><td>Chế độ giao diện, thời điểm lưu gần nhất</td></tr>
      </table>
      <pre>{ "version": "${VERSION}",
  "courses": { "MTH00021": { "status": "done", "score": 8.5 } },
  "extras": { "gdtc1": true, "gdtc2": false, "gdqp": false, "ngoai": false },
  "added": [], "schedule": [], "scenarios": [] }</pre>
    </details></div>`;
}
