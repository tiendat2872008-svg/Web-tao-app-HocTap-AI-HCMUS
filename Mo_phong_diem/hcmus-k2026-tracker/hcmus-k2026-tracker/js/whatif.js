/* ==========================================================================
   TAB 2 (CN-07): MÔ PHỎNG ĐIỂM & MỤC TIÊU XẾP LOẠI — WHAT-IF SIMULATOR
   ========================================================================== */
window.AppWhatIf = (() => {
  let sandboxScores = {}; // Không bao giờ ghi đè vào AppState.courses

  function getFutureCourses(courses) {
    return courses.filter((c) => {
      if (c.block === 'Điều kiện') return false;
      const passed = c.status === 'DONE' && c.score10 !== null && Number(c.score10) >= 4.0;
      return !passed;
    });
  }

  function applyPreset(score10) {
    const futures = getFutureCourses(window.AppState.courses);
    futures.forEach((c) => { sandboxScores[c.id] = score10; });
    render(window.AppState.courses);
    window.AppStorage.showToast(`Đã áp dụng giả định ${score10.toFixed(1)} điểm (Sandbox)`);
  }

  function resetSandbox() {
    sandboxScores = {};
    render(window.AppState.courses);
  }

  function render(courses) {
    const futures = getFutureCourses(courses);
    document.getElementById('wiCourseCountBadge').textContent = `${futures.length} học phần`;

    const grid = document.getElementById('whatIfGrid');
    if (futures.length === 0) {
      grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">Bạn đã hoàn thành toàn bộ các học phần chuyên môn hiện có!</div>`;
    } else {
      grid.innerHTML = futures.map((c) => {
        const val = sandboxScores[c.id] !== undefined ? sandboxScores[c.id] : 8.0;
        const conv = window.AppData.convertScore10(val);
        const isRetake = c.status === 'DONE' && c.score10 !== null && c.score10 < 4.0;
        return `
          <div class="sim-course-card">
            <div class="sim-card-top">
              <div>
                <span class="course-code">${c.id}</span>
                <span class="pill pill-neutral" style="margin-left:4px">${c.credits} TC</span>
                ${isRetake ? '<span class="pill pill-rose" style="margin-left:4px">Học lại</span>' : ''}
                <div class="course-name-main" style="margin-top:4px">${c.name}</div>
              </div>
              <span class="grade-chip ${conv.css}" id="sim-badge-${c.id}">
                ${val.toFixed(1)} → ${conv.letter} (${conv.g4.toFixed(1)})
              </span>
            </div>
            <div class="sim-slider-row">
              <input type="range" min="0" max="10" step="0.1" value="${val}" data-sim-range="${c.id}" aria-label="Thanh trượt điểm ${c.id}" />
              <input type="number" class="sim-num-input" min="0" max="10" step="0.1" value="${val}" data-sim-num="${c.id}" aria-label="Nhập điểm giả định ${c.id}" />
            </div>
          </div>`;
      }).join('');

      grid.querySelectorAll('[data-sim-range]').forEach((el) => {
        el.addEventListener('input', (e) => {
          const id = el.getAttribute('data-sim-range');
          const v = clampScore(e.target.value);
          sandboxScores[id] = v;
          const numEl = grid.querySelector(`[data-sim-num="${id}"]`);
          if (numEl) numEl.value = v;
          updateSingleSimBadge(id, v);
          recalculate(window.AppState.courses);
        });
      });

      grid.querySelectorAll('[data-sim-num]').forEach((el) => {
        el.addEventListener('change', (e) => {
          const id = el.getAttribute('data-sim-num');
          const v = clampScore(e.target.value);
          sandboxScores[id] = v;
          el.value = v;
          const rngEl = grid.querySelector(`[data-sim-range="${id}"]`);
          if (rngEl) rngEl.value = v;
          updateSingleSimBadge(id, v);
          recalculate(window.AppState.courses);
        });
      });
    }

    recalculate(courses);
  }

  function clampScore(raw) {
    const n = Number(raw);
    if (Number.isNaN(n)) return 0;
    return Math.round(Math.max(0, Math.min(10, n)) * 10) / 10;
  }

  function updateSingleSimBadge(id, val) {
    const badge = document.getElementById(`sim-badge-${id}`);
    if (!badge) return;
    const conv = window.AppData.convertScore10(val);
    badge.className = `grade-chip ${conv.css}`;
    badge.textContent = `${val.toFixed(1)} → ${conv.letter} (${conv.g4.toFixed(1)})`;
  }

  function recalculate(courses) {
    const m = window.AppData.computeMetrics(courses);
    const checked = document.querySelector('input[name="whatIfTarget"]:checked');
    const target4 = checked ? Number(checked.value) : 3.60;
    const target10 = checked ? Number(checked.getAttribute('data-s10')) : 9.0;

    // Công thức chuẩn trong báo cáo: x = [T*(N + R) - S] / R
    const N = m.gpaCredits;
    const R = m.remainingCredits;
    const S4 = m.sum4;
    const S10 = m.sum10;

    document.getElementById('whatIfParamsText').textContent = `N = ${N} TC đã tích lũy • R = ${R} TC còn lại`;
    document.getElementById('wiCurrentGpa').textContent = m.gpa4.toFixed(2);

    const req4 = R > 0 ? (target4 * (N + R) - S4) / R : m.gpa4;
    const req10 = R > 0 ? (target10 * (N + R) - S10) / R : m.gpa10;

    const pill = document.getElementById('feasibilityPill');
    const bar = document.getElementById('feasibilityBar');
    const hint = document.getElementById('feasibilityHint');
    const reqEl = document.getElementById('wiRequiredScore');
    const req10El = document.getElementById('wiRequiredScore10');

    if (req4 > 4.0 || req10 > 10.0) {
      reqEl.textContent = '> 4.00';
      req10El.textContent = 'Hệ 10: > 10.0';
      pill.textContent = 'Không khả thi';
      pill.className = 'pill pill-rose';
      bar.style.width = '100%';
      bar.style.background = '#DC2626';
      hint.textContent = 'Vượt trần điểm tối đa — cần chọn mục tiêu khác hoặc học cải thiện';
    } else {
      const disp10 = Math.max(5.0, req10);
      const disp4 = Math.max(1.0, req4);
      reqEl.textContent = disp4.toFixed(2);
      req10El.textContent = req10 < 5.0 ? 'Hệ 10: 5.0 (Điểm sàn)' : `Hệ 10: ${disp10.toFixed(2)}`;

      if (disp10 < 8.0) {
        pill.textContent = 'Khả thi';
        pill.className = 'pill pill-emerald';
        bar.style.width = `${Math.min(60, Math.max(20, (disp10 / 10) * 80))}%`;
        bar.style.background = 'linear-gradient(90deg, #10B981, #059669)';
        hint.textContent = 'Mức điểm thực tế (< 8.0/10) — dễ đạt nếu duy trì đều đặn';
      } else {
        pill.textContent = 'Thử thách cao';
        pill.className = 'pill pill-amber';
        bar.style.width = `${Math.min(92, (disp10 / 10) * 95)}%`;
        bar.style.background = 'linear-gradient(90deg, #F59E0B, #EA580C)';
        hint.textContent = 'Đòi hỏi tập trung cao (8.0 – 10.0/10) ở các học kỳ còn lại';
      }
    }

    // Tính GPA dự báo từ các slider mô phỏng
    let simSum4 = m.sum4;
    let simCredits = m.gpaCredits;
    const futures = getFutureCourses(courses);

    futures.forEach((c) => {
      const s10 = sandboxScores[c.id] !== undefined ? sandboxScores[c.id] : 8.0;
      const conv = window.AppData.convertScore10(s10);
      // Nếu là môn học lại (điểm F cũ đã có trong sum4 với 0đ), chỉ cộng điểm mới thay thế
      const wasF = c.status === 'DONE' && c.score10 !== null && c.score10 < 4.0;
      if (wasF) {
        simSum4 += conv.g4 * c.credits;
      } else {
        simSum4 += conv.g4 * c.credits;
        simCredits += c.credits;
      }
    });

    const forecastGpa = simCredits > 0 ? simSum4 / simCredits : 0;
    const fRank = window.AppData.getGpaRank(forecastGpa, simCredits > 0);
    document.getElementById('wiForecastGpa').textContent = forecastGpa.toFixed(2);
    document.getElementById('wiForecastRank').textContent = `Dự kiến hạng: ${fRank.label}`;
  }

  return { render, recalculate, applyPreset, resetSandbox };
})();
