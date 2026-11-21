// CN-04 + CN-05: localStorage, Export/Import
const KEY = 'k2026-progress';
const Store = {
  fresh: () => ({ version: VERSION, totalCredits: TOTAL_TC, major: 'Trí tuệ nhân tạo', theme: 'light', courses: {}, extras: {}, schedule: [], added: [], planSem: {}, planExcluded: [], scenarios: [], savedAt: null }),
  // Chuẩn hóa dữ liệu đọc từ localStorage / file nhập: bổ sung trường mới, đổi mã cũ, loại bỏ mục sai để không làm sập giao diện
  fix(s) {
    s.courses = s.courses && typeof s.courses === 'object' ? s.courses : {};
    s.extras = s.extras && typeof s.extras === 'object' ? s.extras : {};
    s.planSem = s.planSem && typeof s.planSem === 'object' ? s.planSem : {};
    s.planExcluded = Array.isArray(s.planExcluded) ? s.planExcluded : [];
    s.scenarios = Array.isArray(s.scenarios) ? s.scenarios : [];
    Object.entries(ID_ALIAS).forEach(([o, n]) => { if (s.courses[o] && !s.courses[n]) s.courses[n] = s.courses[o]; delete s.courses[o]; });
    const base = new Set(COURSES.map(c => c.id)), seen = new Set();
    s.added = (Array.isArray(s.added) ? s.added : []).filter(a => {
      const ok = a && CATALOG[a.id] && GROUPS[a.group] && Number.isInteger(a.sem) && a.sem >= 1 && a.sem <= 8 && !base.has(a.id) && !seen.has(a.id);
      if (ok) seen.add(a.id); return ok;
    });
    s.planSem = Object.fromEntries(Object.entries(s.planSem).map(([id, sem]) => [ID_ALIAS[id] || id, sem])
      .filter(([id, sem]) => base.has(id) && Number.isInteger(sem) && sem >= 1 && sem <= 8));
    const validPlanCourses = new Set([...base, ...s.added.map(a => a.id)]);
    s.planExcluded = [...new Set(s.planExcluded.map(id => ID_ALIAS[id] || id).filter(id => validPlanCourses.has(id)))];
    s.schedule = (Array.isArray(s.schedule) ? s.schedule : []).filter(e => e && CAMPUS[e.campus] && DAYS[e.day] !== undefined).map(e => ({ ...e, course: ID_ALIAS[e.course] || e.course }));
    const knownCourses = new Set([...base, ...Object.keys(CATALOG)]);
    s.scenarios = s.scenarios.filter(x => x && typeof x === 'object' && typeof x.name === 'string')
      .map((x, i) => {
        const assumed = {};
        Object.entries(x.assumed && typeof x.assumed === 'object' ? x.assumed : {}).forEach(([id, score]) => {
          const key = ID_ALIAS[id] || id;
          if (knownCourses.has(key) && score !== '' && Number.isFinite(+score)) assumed[key] = Math.min(10, Math.max(0, +score));
        });
        return {
          id: String(x.id || `scenario-${i + 1}`), name: x.name.trim().slice(0, 48) || `Kịch bản ${i + 1}`,
          target: Number.isFinite(+x.target) ? Math.min(10, Math.max(5, +x.target)) : 7,
          scope: x.scope === 'semester' ? 'semester' : 'graduation',
          sem: Number.isInteger(+x.sem) && +x.sem >= 1 && +x.sem <= 8 ? +x.sem : '',
          assumed, savedAt: x.savedAt || null
        };
      });
    return s;
  },
  load() { try { const s = JSON.parse(localStorage.getItem(KEY)); return s && s.courses ? this.fix(s) : this.fresh(); } catch (e) { return this.fresh(); } },
  save(state) { state.savedAt = new Date().toISOString(); try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} },
  export(state) { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' })); a.download = 'student_k2026.json'; a.click(); URL.revokeObjectURL(a.href); },
  saveScenario(state, input) {
    const item = {
      id: input.id || `scenario-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: String(input.name || '').trim().slice(0, 48) || `Kịch bản ${state.scenarios.length + 1}`,
      target: Math.min(10, Math.max(5, Number(input.target) || 7)),
      scope: input.scope === 'semester' ? 'semester' : 'graduation',
      sem: Number.isInteger(+input.sem) && +input.sem >= 1 && +input.sem <= 8 ? +input.sem : '',
      assumed: { ...(input.assumed || {}) }, savedAt: new Date().toISOString()
    };
    const i = state.scenarios.findIndex(x => x.id === item.id);
    if (i < 0) state.scenarios.push(item); else state.scenarios[i] = item;
    return item;
  },
  deleteScenario(state, id) { state.scenarios = state.scenarios.filter(x => x.id !== id); },
  validate(d) { return d && typeof d === 'object' && d.version === VERSION && d.courses && typeof d.courses === 'object'; },
  size: () => ((localStorage.getItem(KEY) || '').length / 1024).toFixed(1)
};
