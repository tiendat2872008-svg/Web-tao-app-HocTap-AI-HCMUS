/* ==========================================================================
   TAB 1: BENTO DASHBOARD & MA TRẬN HỌC PHẦN (INLINE EDITING + FILTER)
   ========================================================================== */
window.AppDashboard = (() => {
  const collapsedGroups = {};
  const filters = {
    search: '',
    semester: 'ALL',
    block: 'ALL',
    status: 'ALL'
  };

  function getFilters() { return filters; }

  function setFilter(key, val) {
    filters[key] = val;
    syncFilterInputs();
    renderCourseMatrix(window.AppState.courses);
  }

  function resetFilters() {
    filters.search = '';
    filters.semester = 'ALL';
    filters.block = 'ALL';
    filters.status = 'ALL';
    syncFilterInputs();
    renderCourseMatrix(window.AppState.courses);
  }

  function syncFilterInputs() {
    document.getElementById('courseSearch').value = filters.search;
    document.getElementById('filterSemester').value = filters.semester;
    document.getElementById('filterBlock').value = filters.block;
    document.getElementById('mobFilterSemester').value = filters.semester;
    document.getElementById('mobFilterBlock').value = filters.block;
    document.getElementById('mobFilterStatus').value = filters.status;

    const hasActive = filters.semester !== 'ALL' || filters.block !== 'ALL' || filters.status !== 'ALL';
    document.getElementById('mobileFilterCount').classList.toggle('hidden', !hasActive);
  }

  function renderBento(courses) {
    const m = window.AppData.computeMetrics(courses);
    const rank = window.AppData.getGpaRank(m.gpa4, m.gpaCredits > 0);

    document.getElementById('kpiEarnedCredits').textContent = m.earnedCredits;
    document.getElementById('kpiRemainingCredits').textContent = m.remainingCredits;
    document.getElementById('kpiProgressBadge').textContent = `${m.percent.toFixed(1)}%`;
    document.getElementById('kpiProgressBar').style.width = `${m.percent.toFixed(1)}%`;

    document.getElementById('kpiGpa4').textContent = m.gpa4.toFixed(2);
    document.getElementById('kpiGpa10').textContent = m.gpa10.toFixed(2);

    const rankEl = document.getElementById('kpiRankBadge');
    rankEl.textContent = rank.label;
    rankEl.className = `pill ${rank.pillClass}`;

    const failEl = document.getElementById('kpiFailWarning');
    if (m.failedCourses.length > 0) {
      failEl.classList.remove('hidden');
      failEl.textContent = `⚠ ${m.failedCourses.length} môn điểm F (${m.failedCourses.map((c) => c.id).join(', ')})`;
    } else {
      failEl.classList.add('hidden');
    }

    // 3 môn điều kiện phụ
    const prereqs = courses.filter((c) => c.block === 'Điều kiện');
    const donePrereq = prereqs.filter((p) => p.status === 'DONE').length;
    const sumEl = document.getElementById('kpiPrereqSummary');
    sumEl.textContent = `${donePrereq}/${prereqs.length} Đạt`;
    sumEl.className = `pill ${donePrereq === prereqs.length ? 'pill-emerald' : 'pill-amber'}`;

    document.getElementById('prereqList').innerHTML = prereqs.map((p) => {
      const ok = p.status === 'DONE';
      return `
        <div class="prereq-item">
          <span>${p.name}</span>
          <span class="pill ${ok ? 'pill-emerald' : 'pill-amber'}">${ok ? 'Đạt / Miễn' : 'Chưa xong'}</span>
        </div>`;
    }).join('');

    // Cảnh báo nhóm tự chọn chuyên ngành
    const elecChip = document.getElementById('electiveWarningChip');
    if (m.majorElectiveSelected < 16) {
      elecChip.classList.remove('hidden');
      elecChip.textContent = `Tự chọn CN: Đã chọn ${m.majorElectiveSelected}/16 TC`;
    } else {
      elecChip.classList.add('hidden');
    }

    // 4 Khối kiến thức
    document.getElementById('blocksGrid').innerHTML = window.AppData.KNOWLEDGE_BLOCKS.map((b) => {
      const cur = m.blockEarned[b.key] || 0;
      const pct = Math.min(100, Math.round((cur / b.target) * 100));
      const rem = Math.max(0, b.target - cur);
      return `
        <button type="button" class="block-tile" data-filter-block="${b.key}">
          <div class="block-tile-head">
            <strong>${b.label}</strong>
            <span>${cur}/${b.target} TC</span>
          </div>
          <div class="progress-track">
            <div class="progress-fill gradient-main" style="width:${pct}%"></div>
          </div>
          <div class="block-tile-sub">${rem === 0 ? 'Đã hoàn thành khối' : `Còn thiếu ${rem} TC (${pct}%)`}</div>
        </button>`;
    }).join('');

    document.querySelectorAll('.block-tile').forEach((btn) => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-filter-block');
        setFilter('block', filters.block === key ? 'ALL' : key);
      });
    });
  }

  function renderStatusPills(courses) {
    const counts = {
      ALL: courses.length,
      DONE: courses.filter((c) => c.status === 'DONE').length,
      STUDYING: courses.filter((c) => c.status === 'STUDYING').length,
      PENDING: courses.filter((c) => c.status === 'PENDING').length
    };
    const items = [
      { key: 'ALL', label: 'Tất cả' },
      { key: 'DONE', label: 'Đã xong' },
      { key: 'STUDYING', label: 'Đang học' },
      { key: 'PENDING', label: 'Chưa học' }
    ];
    const el = document.getElementById('statusPills');
    el.innerHTML = items.map((it) => `
      <button type="button" class="status-pill-btn ${filters.status === it.key ? 'active' : ''}" data-status="${it.key}">
        ${it.label} (${counts[it.key]})
      </button>`).join('');

    el.querySelectorAll('.status-pill-btn').forEach((btn) => {
      btn.addEventListener('click', () => setFilter('status', btn.getAttribute('data-status')));
    });
  }

  function renderCourseMatrix(courses) {
    renderStatusPills(courses);
    const kw = filters.search.trim().toLowerCase();
    const filtered = courses.filter((c) => {
      const mKw = !kw || c.id.toLowerCase().includes(kw) || c.name.toLowerCase().includes(kw);
      const mSem = filters.semester === 'ALL' || String(c.sem) === filters.semester;
      const mBlk = filters.block === 'ALL' || c.block === filters.block;
      const mSts = filters.status === 'ALL' || c.status === filters.status;
      return mKw && mSem && mBlk && mSts;
    });

    const groupsOrder = [
      { key: 'Đại cương', title: 'Khối Giáo dục đại cương', target: 56 },
      { key: 'Cơ sở ngành', title: 'Khối Cơ sở ngành', target: 38 },
      { key: 'Chuyên ngành', title: 'Khối Chuyên ngành', target: 34 },
      { key: 'Tốt nghiệp', title: 'Khối Tốt nghiệp', target: 10 },
      { key: 'Điều kiện', title: 'Ngoài 138 TC (Điều kiện phụ)', target: null }
    ];

    const tbody = document.getElementById('courseTableBody');
    const mobList = document.getElementById('courseMobileList');

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8"><div class="empty-state">Không tìm thấy học phần nào khớp với bộ lọc hiện tại.</div></td></tr>`;
      mobList.innerHTML = `<div class="empty-state">Không tìm thấy học phần nào khớp với bộ lọc hiện tại.</div>`;
      return;
    }

    let desktopHtml = '';
    let mobileHtml = '';

    groupsOrder.forEach((grp) => {
      const items = filtered.filter((c) => c.block === grp.key);
      if (items.length === 0) return;

      const earnedInGroup = items
        .filter((c) => c.status === 'DONE' && (c.block === 'Điều kiện' || (c.score10 !== null && c.score10 >= 4.0)))
        .reduce((s, c) => s + c.credits, 0);

      const badgeText = grp.target ? `${earnedInGroup}/${grp.target} TC` : `${items.length} môn điều kiện`;
      const isCollapsed = !!collapsedGroups[grp.key];

      desktopHtml += `
        <tr class="group-header-row ${isCollapsed ? 'group-collapsed' : ''}" data-group-toggle="${grp.key}">
          <td colspan="8">
            <div class="group-header-flex">
              <span class="group-title-left">
                <svg class="group-chevron" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4"><polyline points="6 9 12 15 18 9"/></svg>
                ${grp.title} (${items.length} môn)
              </span>
              <span class="pill pill-blue">${badgeText}</span>
            </div>
          </td>
        </tr>`;

      mobileHtml += `
        <div class="mobile-group-head">
          <span>${grp.title}</span>
          <span class="pill pill-blue">${badgeText}</span>
        </div>`;

      if (!isCollapsed) {
        items.forEach((c) => {
          const conv = window.AppData.convertScore10(c.score10);
          const typeClass = c.block === 'Điều kiện' ? 'type-DK' : (c.type === 'BB' ? 'type-BB' : 'type-TC');
          const typeText = c.block === 'Điều kiện' ? 'Ngoài 138 TC' : (c.type === 'BB' ? 'Bắt buộc' : 'Tự chọn');

          let extraHint = '';
          if (conv.letter === 'F') extraHint = `<span class="grade-hint hint-fail">Phải học lại</span>`;
          else if (conv.letter === 'D') extraHint = `<span class="grade-hint hint-improve">Nên cải thiện</span>`;

          desktopHtml += `
            <tr class="course-row">
              <td><span class="course-code">${c.id}</span></td>
              <td>
                <div class="course-name-main">${c.name}</div>
              </td>
              <td class="col-hk text-center">HK${c.sem}</td>
              <td class="text-center"><strong>${c.credits}</strong></td>
              <td><span class="type-badge ${typeClass}">${typeText}</span></td>
              <td>
                <select class="input-select inline-status" data-course-status="${c.id}" aria-label="Trạng thái ${c.id}">
                  <option value="PENDING" ${c.status === 'PENDING' ? 'selected' : ''}>⚪ Chưa học</option>
                  <option value="STUDYING" ${c.status === 'STUDYING' ? 'selected' : ''}>🟡 Đang học</option>
                  <option value="DONE" ${c.status === 'DONE' ? 'selected' : ''}>🟢 Đã xong</option>
                </select>
              </td>
              <td class="text-center">
                <input type="number" class="inline-score" step="0.1" min="0" max="10"
                  value="${c.score10 !== null ? c.score10 : ''}" placeholder="0–10"
                  data-course-score="${c.id}" aria-label="Điểm hệ 10 môn ${c.id}" />
              </td>
              <td class="text-center">
                <div class="grade-cell-stack">
                  <span class="grade-chip ${conv.css}">
                    ${conv.letter}${conv.g4 !== null ? ` (${conv.g4.toFixed(1)})` : ''}
                  </span>
                  ${extraHint}
                </div>
              </td>
            </tr>`;

          mobileHtml += `
            <article class="mobile-course-card">
              <div class="mob-card-top">
                <div>
                  <div class="mob-card-badges">
                    <span class="course-code">${c.id}</span>
                    <span class="type-badge ${typeClass}">${typeText}</span>
                    <span class="pill pill-neutral">${c.credits} TC</span>
                  </div>
                  <div class="course-name-main">${c.name}</div>
                </div>
                <div class="grade-cell-stack">
                  <span class="grade-chip ${conv.css}">
                    ${conv.letter}${conv.g4 !== null ? ` (${conv.g4.toFixed(1)})` : ''}
                  </span>
                  ${extraHint}
                </div>
              </div>
              <div class="mob-card-controls">
                <select class="input-select" data-course-status="${c.id}" aria-label="Trạng thái ${c.id}">
                  <option value="PENDING" ${c.status === 'PENDING' ? 'selected' : ''}>⚪ Chưa học</option>
                  <option value="STUDYING" ${c.status === 'STUDYING' ? 'selected' : ''}>🟡 Đang học</option>
                  <option value="DONE" ${c.status === 'DONE' ? 'selected' : ''}>🟢 Đã xong</option>
                </select>
                <input type="number" class="inline-score full" step="0.1" min="0" max="10"
                  value="${c.score10 !== null ? c.score10 : ''}" placeholder="Điểm 10"
                  data-course-score="${c.id}" aria-label="Điểm hệ 10 môn ${c.id}" />
              </div>
            </article>`;
        });
      }
    });

    tbody.innerHTML = desktopHtml;
    mobList.innerHTML = mobileHtml;
    bindInlineEvents();
  }

  function bindInlineEvents() {
    document.querySelectorAll('[data-group-toggle]').forEach((row) => {
      row.addEventListener('click', () => {
        const key = row.getAttribute('data-group-toggle');
        collapsedGroups[key] = !collapsedGroups[key];
        renderCourseMatrix(window.AppState.courses);
      });
    });

    document.querySelectorAll('[data-course-status]').forEach((sel) => {
      sel.addEventListener('change', (e) => {
        const id = sel.getAttribute('data-course-status');
        window.AppController.updateCourseStatus(id, e.target.value);
      });
    });

    document.querySelectorAll('[data-course-score]').forEach((inp) => {
      inp.addEventListener('change', (e) => {
        const id = inp.getAttribute('data-course-score');
        const raw = e.target.value.trim();
        if (raw === '') {
          window.AppController.updateCourseScore(id, null);
          return;
        }
        const val = Number(raw);
        if (Number.isNaN(val) || val < 0 || val > 10) {
          inp.classList.add('input-error');
          window.AppStorage.showToast('Lỗi: Điểm hệ 10 chỉ nhận giá trị từ 0.0 đến 10.0!');
          setTimeout(() => renderCourseMatrix(window.AppState.courses), 900);
          return;
        }
        window.AppController.updateCourseScore(id, Math.round(val * 10) / 10);
      });
    });
  }

  return {
    getFilters,
    setFilter,
    resetFilters,
    syncFilterInputs,
    renderBento,
    renderCourseMatrix
  };
})();
