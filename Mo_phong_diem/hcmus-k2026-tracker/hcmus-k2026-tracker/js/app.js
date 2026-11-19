/* ==========================================================================
   APP CONTROLLER — KHỞI TẠO SPA, CHUYỂN TAB, DARK MODE & RESPONSIVE DRAWER
   ========================================================================== */
window.AppState = {
  courses: [],
  major: 'TTNT',
  theme: 'light'
};

window.AppController = (() => {
  function refreshAll() {
    window.AppDashboard.renderBento(window.AppState.courses);
    window.AppDashboard.renderCourseMatrix(window.AppState.courses);
    window.AppWhatIf.render(window.AppState.courses);
    window.AppSchedule.render(window.AppState.courses);
  }

  function updateCourseStatus(id, newStatus) {
    const item = window.AppState.courses.find((c) => c.id === id);
    if (!item) return;
    item.status = newStatus;
    if (newStatus !== 'DONE') item.score10 = null;
    window.AppStorage.saveCourses(window.AppState.courses);
    refreshAll();
  }

  function updateCourseScore(id, score10) {
    const item = window.AppState.courses.find((c) => c.id === id);
    if (!item) return;
    item.score10 = score10;
    if (score10 !== null) item.status = 'DONE';
    window.AppStorage.saveCourses(window.AppState.courses);
    refreshAll();
  }

  function updateCourseSlot(id, field, value) {
    const item = window.AppState.courses.find((c) => c.id === id);
    if (!item) return;
    item[field] = value;
    window.AppStorage.saveCourses(window.AppState.courses);
    window.AppSchedule.render(window.AppState.courses);
  }

  function applyTheme(theme) {
    window.AppState.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    document.getElementById('iconSun').classList.toggle('hidden', theme !== 'dark');
    document.getElementById('iconMoon').classList.toggle('hidden', theme === 'dark');
    window.AppStorage.saveTheme(theme);
  }

  function switchTab(tabKey) {
    document.querySelectorAll('.seg-tab').forEach((btn) => {
      const active = btn.getAttribute('data-tab') === tabKey;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-selected', String(active));
    });
    document.querySelectorAll('.tab-panel').forEach((panel) => {
      panel.classList.toggle('active', panel.id === `tab-${tabKey}`);
    });
  }

  function toggleBottomSheet(open) {
    const sheet = document.getElementById('filterBottomSheet');
    if (open) {
      window.AppDashboard.syncFilterInputs();
      sheet.classList.remove('hidden');
      sheet.setAttribute('aria-hidden', 'false');
    } else {
      sheet.classList.add('hidden');
      sheet.setAttribute('aria-hidden', 'true');
    }
  }

  function handleReset() {
    if (confirm('Bạn có chắc muốn khôi phục toàn bộ điểm số và lịch học về mặc định của Cẩm nang K2026?')) {
      window.AppState.courses = JSON.parse(JSON.stringify(window.AppData.DEFAULT_COURSES));
      window.AppStorage.saveCourses(window.AppState.courses);
      window.AppWhatIf.resetSandbox();
      refreshAll();
      window.AppStorage.showToast('Đã khôi phục dữ liệu mặc định K2026');
    }
  }

  function init() {
    window.AppState.courses = window.AppStorage.loadCourses();
    window.AppState.major = window.AppStorage.loadMajor();
    applyTheme(window.AppStorage.loadTheme());

    const majorSel = document.getElementById('majorSelect');
    majorSel.value = window.AppState.major;
    majorSel.addEventListener('change', (e) => {
      window.AppState.major = e.target.value;
      window.AppStorage.saveMajor(window.AppState.major);
      window.AppStorage.showToast(`Đã chuyển chuyên ngành: ${e.target.options[e.target.selectedIndex].text}`);
    });

    // Segmented Tabs
    document.querySelectorAll('.seg-tab').forEach((btn) => {
      btn.addEventListener('click', () => switchTab(btn.getAttribute('data-tab')));
    });

    // Dark/Light Mode
    document.getElementById('themeToggleBtn').addEventListener('click', () => {
      applyTheme(window.AppState.theme === 'dark' ? 'light' : 'dark');
    });

    // Export / Import / Reset
    document.getElementById('exportBtn').addEventListener('click', () => {
      window.AppStorage.exportJSON(window.AppState.courses, window.AppState.major);
    });
    document.getElementById('resetBtn').addEventListener('click', handleReset);
    document.getElementById('importFileInput').addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      window.AppStorage.importJSON(file, (newCourses, newMajor) => {
        window.AppState.courses = newCourses;
        if (newMajor) {
          window.AppState.major = newMajor;
          majorSel.value = newMajor;
          window.AppStorage.saveMajor(newMajor);
        }
        window.AppStorage.saveCourses(newCourses);
        refreshAll();
      });
      e.target.value = '';
    });

    // Mobile Overflow Menu
    const mobBtn = document.getElementById('mobileMenuBtn');
    const mobDrop = document.getElementById('mobileMenuDropdown');
    mobBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      mobDrop.classList.toggle('hidden');
    });
    document.addEventListener('click', () => mobDrop.classList.add('hidden'));
    mobDrop.querySelector('[data-action="export"]').addEventListener('click', () => {
      window.AppStorage.exportJSON(window.AppState.courses, window.AppState.major);
    });
    mobDrop.querySelector('[data-action="reset"]').addEventListener('click', handleReset);

    // Dashboard Filters
    document.getElementById('courseSearch').addEventListener('input', (e) => {
      window.AppDashboard.setFilter('search', e.target.value);
    });
    document.getElementById('filterSemester').addEventListener('change', (e) => {
      window.AppDashboard.setFilter('semester', e.target.value);
    });
    document.getElementById('filterBlock').addEventListener('change', (e) => {
      window.AppDashboard.setFilter('block', e.target.value);
    });
    document.getElementById('clearFiltersBtn').addEventListener('click', () => {
      window.AppDashboard.resetFilters();
    });

    // Mobile Filter Bottom Sheet
    document.getElementById('openMobileFilterBtn').addEventListener('click', () => toggleBottomSheet(true));
    document.getElementById('closeBottomSheetBtn').addEventListener('click', () => toggleBottomSheet(false));
    document.getElementById('bottomSheetBackdrop').addEventListener('click', () => toggleBottomSheet(false));
    document.getElementById('mobResetFilterBtn').addEventListener('click', () => {
      window.AppDashboard.resetFilters();
      toggleBottomSheet(false);
    });
    document.getElementById('mobApplyFilterBtn').addEventListener('click', () => {
      window.AppDashboard.setFilter('semester', document.getElementById('mobFilterSemester').value);
      window.AppDashboard.setFilter('block', document.getElementById('mobFilterBlock').value);
      window.AppDashboard.setFilter('status', document.getElementById('mobFilterStatus').value);
      toggleBottomSheet(false);
    });

    // What-if CN-07 controls
    document.querySelectorAll('input[name="whatIfTarget"]').forEach((r) => {
      r.addEventListener('change', () => window.AppWhatIf.recalculate(window.AppState.courses));
    });
    document.getElementById('whatIfPresetA').addEventListener('click', () => window.AppWhatIf.applyPreset(8.5));
    document.getElementById('whatIfPresetB').addEventListener('click', () => window.AppWhatIf.applyPreset(7.5));
    document.getElementById('whatIfResetBtn').addEventListener('click', () => window.AppWhatIf.resetSandbox());

    // Schedule CN-06 controls
    document.getElementById('planScopeSelect').addEventListener('change', () => {
      window.AppSchedule.render(window.AppState.courses);
    });
    document.getElementById('planCampusFilter').addEventListener('change', () => {
      window.AppSchedule.render(window.AppState.courses);
    });

    refreshAll();
  }

  return {
    init,
    refreshAll,
    updateCourseStatus,
    updateCourseScore,
    updateCourseSlot
  };
})();

document.addEventListener('DOMContentLoaded', window.AppController.init);
