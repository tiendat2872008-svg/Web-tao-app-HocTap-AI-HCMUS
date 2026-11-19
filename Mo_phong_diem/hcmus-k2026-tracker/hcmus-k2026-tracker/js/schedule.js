/* ==========================================================================
   TAB 3 (CN-06): XÂY DỰNG KẾ HOẠCH HỌC KỲ & LƯỚI THỜI KHÓA BIỂU
   ========================================================================== */
window.AppSchedule = (() => {
  let selectedMobileDay = 2;

  function render(courses) {
    const scope = document.getElementById('planScopeSelect').value;
    const campusFilter = document.getElementById('planCampusFilter').value;

    // 1. Danh sách môn gợi ý bên trái
    const sidebarList = courses.filter((c) => {
      const matchCampus = campusFilter === 'ALL' || c.campus === campusFilter;
      if (!matchCampus) return false;
      if (scope === 'ACTIVE') return c.status === 'STUDYING';
      if (scope === 'ALL_UNFINISHED') return c.status !== 'DONE' || (c.score10 !== null && c.score10 < 4.0);
      return String(c.sem) === scope;
    });

    // 2. Danh sách môn đang xếp trên lưới TKB (trạng thái Đang học)
    const scheduled = courses.filter((c) => {
      const matchCampus = campusFilter === 'ALL' || c.campus === campusFilter;
      return c.status === 'STUDYING' && matchCampus;
    });

    // Cập nhật tổng số môn & tín chỉ
    const totalCredits = scheduled.reduce((sum, c) => sum + c.credits, 0);
    document.getElementById('planTotalCourses').textContent = scheduled.length;
    document.getElementById('planTotalCredits').textContent = `${totalCredits} TC`;

    const loadBadge = document.getElementById('planLoadBadge');
    if (totalCredits === 0) {
      loadBadge.textContent = 'Chưa chọn môn';
      loadBadge.className = 'pill pill-neutral';
    } else if (totalCredits > 24) {
      loadBadge.textContent = 'Quá tải (> 24 TC)';
      loadBadge.className = 'pill pill-rose';
    } else if (totalCredits < 12) {
      loadBadge.textContent = 'Nhẹ (< 12 TC)';
      loadBadge.className = 'pill pill-amber';
    } else {
      loadBadge.textContent = 'Tải học tập chuẩn (12–24 TC)';
      loadBadge.className = 'pill pill-emerald';
    }

    // 3. Phân tích xung đột trùng ca & xung đột di chuyển cơ sở sát giờ
    const slotMap = {};
    const conflicts = [];
    const dayMap = {};

    scheduled.forEach((c) => {
      const key = `${c.day}-${c.shift}`;
      if (!slotMap[key]) slotMap[key] = [];
      slotMap[key].push(c);

      if (!dayMap[c.day]) dayMap[c.day] = [];
      dayMap[c.day].push(c);
    });

    Object.entries(slotMap).forEach(([key, items]) => {
      if (items.length > 1) {
        const [d, shId] = key.split('-');
        const shiftObj = window.AppData.SHIFTS.find((s) => s.id === shId);
        const names = items.map((x) => `${x.id} (${x.campus})`).join(' và ');
        conflicts.push(`Trùng lịch Thứ ${d} — ${shiftObj ? shiftObj.label : shId}: ${names}.`);
      }
    });

    // Kiểm tra di chuyển giữa 2 cơ sở Nguyễn Văn Cừ & Linh Trung ở 2 ca liên tiếp trong cùng buổi
    Object.entries(dayMap).forEach(([day, items]) => {
      const s1 = items.filter((x) => x.shift === 'S1');
      const s2 = items.filter((x) => x.shift === 'S2');
      s1.forEach((a) => {
        s2.forEach((b) => {
          if (a.campus !== b.campus) {
            conflicts.push(`Xung đột di chuyển Thứ ${day}: ${a.id} (${a.campus}, Tiết 1–3) nối tiếp ngay ${b.id} (${b.campus}, Tiết 4–6) chỉ cách nhau 10 phút.`);
          }
        });
      });
    });

    const banner = document.getElementById('scheduleConflictBanner');
    const cList = document.getElementById('scheduleConflictList');
    if (conflicts.length > 0) {
      banner.classList.remove('hidden');
      cList.innerHTML = conflicts.map((msg) => `<li>${msg}</li>`).join('');
    } else {
      banner.classList.add('hidden');
    }

    renderSidebar(sidebarList);
    renderDesktopTimetable(slotMap);
    renderMobileTimetable(scheduled, slotMap);
  }

  function renderSidebar(list) {
    const container = document.getElementById('plannerCourseList');
    if (list.length === 0) {
      container.innerHTML = `<div class="empty-state" style="padding:28px 10px">Không có học phần nào trong phạm vi lọc. Hãy thử chọn "Tất cả môn chưa hoàn thành".</div>`;
      return;
    }

    container.innerHTML = list.map((c) => {
      const checked = c.status === 'STUDYING';
      const isRetake = c.status === 'DONE' && c.score10 !== null && c.score10 < 4.0;
      return `
        <div class="planner-item ${checked ? 'is-selected' : ''} ${isRetake ? 'is-retake' : ''}">
          <label class="planner-check-row">
            <input type="checkbox" ${checked ? 'checked' : ''} data-plan-toggle="${c.id}" />
            <div class="planner-meta">
              <div class="planner-top-line">
                <span class="course-code">${c.id} • HK${c.sem}</span>
                <span class="pill ${isRetake ? 'pill-rose' : 'pill-neutral'}">${isRetake ? 'Cần học lại' : `${c.credits} TC`}</span>
              </div>
              <div class="planner-name">${c.name}</div>
            </div>
          </label>
          <div class="planner-slot-editors">
            <select class="input-select" data-slot-field="day" data-slot-id="${c.id}" aria-label="Thứ học ${c.id}">
              ${window.AppData.DAYS.map((d) => `<option value="${d.value}" ${Number(c.day) === d.value ? 'selected' : ''}>${d.label}</option>`).join('')}
            </select>
            <select class="input-select" data-slot-field="shift" data-slot-id="${c.id}" aria-label="Ca học ${c.id}">
              ${window.AppData.SHIFTS.map((s) => `<option value="${s.id}" ${c.shift === s.id ? 'selected' : ''}>${s.label}</option>`).join('')}
            </select>
            <select class="input-select" data-slot-field="campus" data-slot-id="${c.id}" aria-label="Cơ sở ${c.id}">
              <option value="Nguyễn Văn Cừ" ${c.campus === 'Nguyễn Văn Cừ' ? 'selected' : ''}>CS N.V.Cừ</option>
              <option value="Linh Trung" ${c.campus === 'Linh Trung' ? 'selected' : ''}>CS Linh Trung</option>
            </select>
          </div>
        </div>`;
    }).join('');

    container.querySelectorAll('[data-plan-toggle]').forEach((cb) => {
      cb.addEventListener('change', (e) => {
        const id = cb.getAttribute('data-plan-toggle');
        window.AppController.updateCourseStatus(id, e.target.checked ? 'STUDYING' : 'PENDING');
      });
    });

    container.querySelectorAll('[data-slot-field]').forEach((sel) => {
      sel.addEventListener('change', (e) => {
        const id = sel.getAttribute('data-slot-id');
        const field = sel.getAttribute('data-slot-field');
        const val = field === 'day' ? Number(e.target.value) : e.target.value;
        window.AppController.updateCourseSlot(id, field, val);
      });
    });
  }

  function renderDesktopTimetable(slotMap) {
    const tbody = document.getElementById('timetableBody');
    tbody.innerHTML = window.AppData.SHIFTS.map((sh) => {
      const cells = window.AppData.DAYS.map((d) => {
        const items = slotMap[`${d.value}-${sh.id}`] || [];
        const isConflict = items.length > 1;
        return `
          <td class="slot-cell ${isConflict ? 'slot-conflict' : ''}">
            ${items.map((it) => {
              const campusCls = it.campus === 'Linh Trung' ? 'campus-lt' : '';
              return `
                <div class="tt-event ${campusCls} ${isConflict ? 'is-conflict' : ''}">
                  <div class="tt-event-code">${it.id} (${it.credits} TC)</div>
                  <div class="tt-event-name">${it.name}</div>
                  <div class="tt-event-meta">${it.campus}</div>
                </div>`;
            }).join('')}
          </td>`;
      }).join('');

      return `
        <tr>
          <td class="shift-cell">
            ${sh.label}
            <span class="shift-time">${sh.time}</span>
          </td>
          ${cells}
        </tr>`;
    }).join('');
  }

  function renderMobileTimetable(scheduled, slotMap) {
    const tabsEl = document.getElementById('mobileDayTabs');
    tabsEl.innerHTML = window.AppData.DAYS.map((d) => {
      const count = scheduled.filter((c) => Number(c.day) === d.value).length;
      return `
        <button type="button" class="day-pill ${selectedMobileDay === d.value ? 'active' : ''}" data-mob-day="${d.value}">
          ${d.label}${count > 0 ? ` (${count})` : ''}
        </button>`;
    }).join('');

    tabsEl.querySelectorAll('[data-mob-day]').forEach((btn) => {
      btn.addEventListener('click', () => {
        selectedMobileDay = Number(btn.getAttribute('data-mob-day'));
        renderMobileTimetable(scheduled, slotMap);
      });
    });

    const listEl = document.getElementById('mobileTimetableList');
    const dayItems = scheduled
      .filter((c) => Number(c.day) === selectedMobileDay)
      .sort((a, b) => {
        const oa = window.AppData.SHIFTS.find((s) => s.id === a.shift)?.order || 9;
        const ob = window.AppData.SHIFTS.find((s) => s.id === b.shift)?.order || 9;
        return oa - ob;
      });

    if (dayItems.length === 0) {
      listEl.innerHTML = `<div class="empty-state" style="padding:26px 10px">Thứ ${selectedMobileDay} hiện chưa có tiết học nào.</div>`;
      return;
    }

    listEl.innerHTML = dayItems.map((c) => {
      const sh = window.AppData.SHIFTS.find((s) => s.id === c.shift);
      const isConflict = (slotMap[`${c.day}-${c.shift}`] || []).length > 1;
      const campusCls = c.campus === 'Linh Trung' ? 'campus-lt' : '';
      return `
        <div class="mob-tt-card ${campusCls} ${isConflict ? 'is-conflict' : ''}">
          <div style="display:flex; justify-content:space-between; align-items:center">
            <strong style="font-size:12.5px; color:var(--navy)">${sh ? `${sh.label} (${sh.time})` : c.shift}</strong>
            <span class="pill ${isConflict ? 'pill-rose' : 'pill-neutral'}">${isConflict ? 'Trùng lịch!' : `${c.credits} TC`}</span>
          </div>
          <div class="course-name-main">${c.id} — ${c.name}</div>
          <div style="font-size:12px; color:var(--text-muted)">Cơ sở ${c.campus}</div>
        </div>`;
    }).join('');
  }

  return { render };
})();
