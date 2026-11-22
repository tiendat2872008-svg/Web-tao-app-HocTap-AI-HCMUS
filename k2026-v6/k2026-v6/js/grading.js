// CN-02, CN-03, CN-07: quy tắc tính toán (không đụng DOM, không ghi vào state)
const EPS = 1e-9;

// ---- CN-02: thang điểm (SRS mục 3 – theo Cẩm nang K2025) ----
const SCALE = [
  { min: 8.5, l: 'A', p: 4, rank: 'Giỏi / Xuất sắc' },
  { min: 7.0, l: 'B', p: 3, rank: 'Khá' },
  { min: 5.5, l: 'C', p: 2, rank: 'Trung bình' },
  { min: 4.0, l: 'D', p: 1, rank: 'Yếu' },
  { min: 0,   l: 'F', p: 0, rank: 'Kém (phải học lại)' }
];
const Grade = {
  round1: s => Math.round(+s * 10 + EPS) / 10,                 // điểm hệ 10 làm tròn 1 chữ số thập phân
  ceil1: s => Math.ceil(+s * 10 - 1e-6) / 10,                  // làm tròn LÊN (điểm cần đạt)
  band: s => { const v = Grade.round1(s); return SCALE.find(b => v >= b.min) || SCALE[SCALE.length - 1]; },
  letter: s => Grade.band(s).l,
  p4: s => Grade.band(s).p,
  valid: v => v !== null && v !== undefined && v !== '' && Number.isFinite(+v),
  // Điểm của lần học hiện tại (ô "Điểm hệ 10")
  hasCurrent: r => !!r && Grade.valid(r.score),
  // Mọi lần học: các lần trước (history) + lần hiện tại. Điểm dùng để tính = điểm CAO NHẤT trong các lần học.
  scores: r => !r ? [] : [r.score, ...(Array.isArray(r.history) ? r.history.map(h => h && h.score) : [])].filter(Grade.valid).map(v => Grade.round1(v)),
  best: r => { const a = Grade.scores(r); return a.length ? Math.max(...a) : null; },
  hasScore: r => Grade.best(r) !== null,
  // Đạt: có điểm ≥ 4.0, hoặc 'Đã xong' mà không có điểm (miễn / đạt không điểm). Có điểm < 4.0 = F, không đạt.
  passed: r => !!r && (Grade.hasScore(r) ? Grade.best(r) >= 4 : r.status === 'done'),
  // Môn tích lũy: đã xong / học lại / học cải thiện và đạt — định nghĩa DUY NHẤT dùng cho TC, GPA và What-if.
  // Học cải thiện chưa có điểm mới vẫn giữ điểm đạt cũ.
  accumulated: r => !!r && (r.status === 'done' || r.status === 'retake' || r.status === 'improve') && Grade.passed(r)
};

// ---- Số học kỳ: mặc định 8, người dùng có thể thêm tới MAX_SEM (học quá 4 năm) ----
const MIN_SEM = 8, MAX_SEM = 12;
const semCount = state => Math.min(MAX_SEM, Math.max(MIN_SEM, Number.isInteger(+state.semCount) ? +state.semCount : MIN_SEM));
const semList = state => Array.from({ length: semCount(state) }, (_, i) => i + 1);

// ---- Tìm kiếm tiếng Việt: bỏ dấu, không phân biệt hoa thường ("ti" khớp "Vi tích phân") ----
const norm = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'd').toLowerCase();
const matchQ = (c, q) => !q || norm(c.id + ' ' + c.name).includes(norm(q).trim());

// ---- CN-06: lịch học — giờ tiết, kiểm tra dữ liệu nhập và trùng tiết ----
const PERIODS_PER_DAY = 12, MAX_LEN = 6;
const CLASS_TYPES = { lt: 'Lý thuyết', th: 'Thực hành', bt: 'Bài tập' };
const Sched = {
  minutes(e) { const c = CAMPUS[e.campus], [h, m] = c.start.split(':').map(Number), a = h * 60 + m + (e.start - 1) * c.len; return [a, a + e.len * c.len]; },
  // Trả về thông báo lỗi (chuỗi) hoặc '' nếu hợp lệ
  check(start, len) {
    if (!Number.isInteger(start) || start < 1 || start > PERIODS_PER_DAY) return `Tiết bắt đầu phải là số nguyên từ 1 đến ${PERIODS_PER_DAY}.`;
    if (!Number.isInteger(len) || len < 1 || len > MAX_LEN) return `Số tiết phải là số nguyên từ 1 đến ${MAX_LEN}.`;
    if (start + len - 1 > PERIODS_PER_DAY) return `Tiết ${start} + ${len} tiết vượt quá tiết ${PERIODS_PER_DAY} trong ngày.`;
    return '';
  },
  // Các lịch trùng giờ với e (cùng thứ, khoảng thời gian giao nhau)
  clashes(list, e, skip = -1) {
    const [a, b] = Sched.minutes(e);
    return list.filter((x, i) => i !== skip && +x.day === +e.day && (() => { const [c, d] = Sched.minutes(x); return a < d && c < b; })());
  },
  clashSet(list) { const s = new Set(); list.forEach((e, i) => { if (Sched.clashes(list, e, i).length) s.add(i); }); return s; }
};

// Danh sách học phần đang hiển thị = học phần cố định (COURSES) + học phần người dùng đã thêm (state.added)
function listCourses(state) {
  const planSem = state.planSem && typeof state.planSem === 'object' ? state.planSem : {};
  const base = COURSES.map(c => ({ ...c, sem: Number.isInteger(planSem[c.id]) ? planSem[c.id] : c.sem }));
  const extra = (state.added || []).map(a => {
    const c = CATALOG[a.id], g = GROUPS[a.group];
    return c && g ? { ...c, sem: a.sem, block: g.block, group: a.group, added: true } : null;
  }).filter(Boolean);
  return base.concat(extra);
}

// ---- CN-06: kiểm tra kế hoạch học kỳ ----
const PLAN_LIMITS = { recommended: 24, maximum: 30 };
const Plan = {
  limits: PLAN_LIMITS,
  analyze(state) {
    const excluded = new Set(Array.isArray(state.planExcluded) ? state.planExcluded : []);
    const all = listCourses(state), list = all.filter(c => !excluded.has(c.id)), semesters = {};
    for (const sem of semList(state)) {
      const courses = list.filter(c => c.sem === sem);
      const credits = courses.reduce((n, c) => n + (+c.tc || 0), 0);
      const warnings = [];
      if (credits > PLAN_LIMITS.maximum) warnings.push({ level: 'no', text: `Vượt trần tham khảo ${PLAN_LIMITS.maximum} TC (${credits} TC đã xếp).` });
      else if (credits > PLAN_LIMITS.recommended) warnings.push({ level: 'wn', text: `Vượt mức khuyến nghị ${PLAN_LIMITS.recommended} TC (${credits} TC đã xếp).` });
      courses.forEach(course => {
        (STUDY_GUIDANCE[course.id] || []).forEach(id => {
          const suggested = list.find(c => c.id === id);
          if (!suggested || suggested.sem < course.sem) return;
          warnings.push({
            level: 'wn',
            course: course.id,
            text: `${course.id}: gợi ý học ${suggested.name} trước (đang xếp HK${suggested.sem}). Đây không phải điều kiện đăng ký chính thức; hãy xác nhận trên Portal.`
          });
        });
      });
      semesters[sem] = { courses, credits, warnings, level: warnings.some(w => w.level === 'no') ? 'no' : warnings.length ? 'wn' : 'ok' };
    }
    const plannedCredits = list.reduce((n, c) => n + (+c.tc || 0), 0);
    return { semesters, plannedCredits, unplanned: all.filter(c => excluded.has(c.id)), progress: Math.min(100, Math.round(plannedCredits / TOTAL_TC * 1000) / 10) };
  }
};

// ---- CN-03: thống kê tiến độ & GPA ----
// GDTC, GDQP-AN, Ngoại ngữ nằm ở EXTRAS (không thuộc COURSES) nên không vào GPA / TC tích lũy.
function computeStats(state) {
  const zero = () => Object.fromEntries(Object.keys(BLOCKS).map(k => [k, 0]));
  const o = { tc: 0, tcRaw: 0, N: 0, S: 0, gp: 0, blocks: zero(), blocksRaw: zero(), failed: [] };
  listCourses(state).forEach(c => {
    const r = state.courses[c.id];
    if (Grade.hasScore(r) && !Grade.passed(r)) o.failed.push(c);       // F chưa học lại
    if (!Grade.accumulated(r)) return;
    o.blocksRaw[c.block] += c.tc; o.tcRaw += c.tc;
    if (Grade.hasScore(r)) { const s = Grade.best(r); o.N += c.tc; o.S += s * c.tc; o.gp += Grade.p4(s) * c.tc; }
  });
  // Mỗi khối chỉ tính tối đa đúng số TC quy định (56/38/34/10) → tổng không vượt 138
  Object.keys(BLOCKS).forEach(k => { o.blocks[k] = Math.min(o.blocksRaw[k], BLOCKS[k].tc); o.tc += o.blocks[k]; });
  o.gpa = o.N ? o.gp / o.N : 0;        // GPA hệ 4 = Σ(TC × điểm hệ 4) / Σ TC (môn đạt có điểm)
  o.avg10 = o.N ? o.S / o.N : 0;       // ĐTBTL hệ 10
  return o;
}

// ---- CN-07: What-if (kết quả mô phỏng KHÔNG ghi vào dữ liệu thật) ----
const WHATIF = {
  targets: { 'Trung bình': 5, 'Khá': 7, 'Giỏi': 8, 'Xuất sắc': 9 },
  FLOOR: 5,                                        // SRS: mỗi HP phải ≥ 5.0
  rank(avg) {
    const t = Object.entries(WHATIF.targets).sort((a, b) => b[1] - a[1]).find(([, v]) => avg + EPS >= v);
    return t ? t[0] : 'Chưa đạt hạng';
  },
  // Học phần được nhập điểm giả định: chưa có điểm đạt (chưa học / đang học / bị F cần học lại)
  pending: (c, courses = {}) => !Grade.passed(courses[c.id]),
  // ĐTBTL' = (S + Σ a'·n') / (N + Σ n') — chỉ lấy học phần chưa có điểm đạt thật; giả định < 4.0 (F) không tính
  predict(st, assumed, list, courses = {}, semester = '') {
    let a = 0, g = 0, n = 0, skipped = 0, termS = 0, termGP = 0, termN = 0;
    list.forEach(c => {
      const record = courses[c.id] || {}, pending = WHATIF.pending(c, courses);
      const real = Grade.hasScore(record) && Grade.passed(record) ? Grade.best(record) : null;
      const raw = assumed[c.id], simulated = pending && raw !== '' && raw !== undefined && raw !== null && Number.isFinite(+raw);
      const s = real !== null ? real : simulated ? Grade.round1(raw) : null;
      if (s !== null && s >= 4 && (real !== null || simulated)) {
        if (real === null) { a += s * c.tc; g += Grade.p4(s) * c.tc; n += c.tc; }
        if (semester && String(c.sem) === String(semester)) { termS += s * c.tc; termGP += Grade.p4(s) * c.tc; termN += c.tc; }
      } else if (simulated && s < 4) skipped++;
    });
    const N = st.N + n, avg = N ? (st.S + a) / N : 0;
    return {
      avg, gpa4: N ? (st.gp + g) / N : 0, rank: WHATIF.rank(avg), tc: N, added: n, skipped,
      addedS: a, addedGp: g, termAvg10: termN ? termS / termN : null,
      termGpa4: termN ? termGP / termN : null, termCredits: termN
    };
  },
  // Tính điểm hệ 10 tối thiểu trên các tín chỉ còn lại cho mục tiêu học kỳ hoặc tốt nghiệp.
  need(st, T, { scope = 'graduation', semester = '', assumed = {}, list = [], courses = {} } = {}) {
    if (scope === 'semester' && !semester) return { status: 'select-term', R: 0, ok: false };
    const scopedAssumed = { ...assumed };
    if (scope === 'semester') list.filter(c => c.sem > +semester).forEach(c => { delete scopedAssumed[c.id]; });
    const projection = WHATIF.predict(st, scopedAssumed, list, courses);
    let R;
    if (scope === 'semester') {
      const period = list.filter(c => String(c.sem) === String(semester) && WHATIF.pending(c, courses));
      const passed = period.reduce((sum, c) => {
        const v = scopedAssumed[c.id];
        return v !== '' && v !== undefined && v !== null && Number.isFinite(+v) && Grade.round1(v) >= 4 ? sum + c.tc : sum;
      }, 0);
      R = Math.max(0, period.reduce((sum, c) => sum + c.tc, 0) - passed);
    } else R = Math.max(0, TOTAL_TC - st.tc - projection.added);
    const baseS = st.S + projection.addedS, baseN = st.N + projection.added;
    if (!R) {
      const avg = baseN ? baseS / baseN : 0;
      return { raw: avg, x: avg, ok: avg + EPS >= T, R: 0, done: true, status: avg + EPS >= T ? 'safe' : 'impossible' };
    }
    const raw = (T * (baseN + R) - baseS) / R;
    const x = Math.max(raw, WHATIF.FLOOR);
    const status = raw > 10 + EPS ? 'impossible' : raw > 8.5 ? 'risk' : raw > 6.5 ? 'effort' : 'safe';
    return { raw, x, ok: raw <= 10 + EPS, R, done: false, status };
  }
};

// ---- Gợi ý học cải thiện theo ĐIỂM MỤC TIÊU từng học phần (mở rộng CN-07) ----
// Điểm mục tiêu nhập ở tab Học phần (state.courses[id].target). Môn đã có điểm thật mà điểm mục tiêu LỚN HƠN
// điểm thật → đề xuất học cải thiện (môn F → bắt buộc học lại). Chỉ mô phỏng, không ghi vào điểm thật.
const IMPROVE = {
  hasTarget: r => !!r && r.target !== null && r.target !== undefined && r.target !== '' && Number.isFinite(+r.target),
  // Thay điểm môn bằng điểm mục tiêu → tổng mới (luật lấy điểm cao nhất: chỉ khi mục tiêu > điểm cũ)
  _shift(x) {
    const t = x.target, newIn = t >= 4;                   // điểm mới có được tính tích lũy không
    if (x.counted) return newIn ? { S: (t - x.old) * x.tc, gp: (Grade.p4(t) - x.p4) * x.tc, N: 0 } : { S: 0, gp: 0, N: 0 };
    return newIn ? { S: t * x.tc, gp: Grade.p4(t) * x.tc, N: x.tc } : { S: 0, gp: 0, N: 0 };   // môn F: thêm mới vào GPA
  },
  _avg: (S, gp, N) => ({ avg10: N ? S / N : 0, gpa: N ? gp / N : 0 }),
  suggest(state, st) {
    const list = [];
    listCourses(state).forEach(c => {
      const r = state.courses[c.id];
      if (!Grade.hasScore(r) || !IMPROVE.hasTarget(r)) return;
      const old = Grade.best(r), target = Grade.round1(Math.min(10, Math.max(0, +r.target)));
      if (target <= old) return;                          // mục tiêu không lớn hơn điểm thật → không đề xuất
      const x = { id: c.id, name: c.name, tc: c.tc, sem: c.sem, old, target, letter: Grade.letter(old), p4: Grade.p4(old),
        counted: Grade.accumulated(r), failed: !Grade.passed(r) };
      const d = IMPROVE._shift(x), a = IMPROVE._avg(st.S + d.S, st.gp + d.gp, st.N + d.N);
      x.d10 = a.avg10 - st.avg10; x.d4 = a.gpa - st.gpa;   // mức tăng nếu chỉ học lại riêng môn này
      list.push(x);
    });
    list.sort((a, b) => a.sem - b.sem || a.old - b.old);
    const tot = list.reduce((t, x) => { const d = IMPROVE._shift(x); t.S += d.S; t.gp += d.gp; t.N += d.N; return t; }, { S: st.S, gp: st.gp, N: st.N });
    const after = IMPROVE._avg(tot.S, tot.gp, tot.N);
    return { list, avg10: after.avg10, gpa: after.gpa, rank: WHATIF.rank(after.avg10) };
  }
};
