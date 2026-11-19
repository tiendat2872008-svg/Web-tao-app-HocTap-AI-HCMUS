/* ==========================================================================
   OFFLINE-FIRST STORAGE (localStorage + JSON Export/Import + Toast)
   ========================================================================== */
window.AppStorage = (() => {
  const KEYS = {
    COURSES: 'hcmus_k2026_courses_v2',
    THEME: 'hcmus_k2026_theme_v2',
    MAJOR: 'hcmus_k2026_major_v2'
  };

  function loadCourses() {
    try {
      const raw = localStorage.getItem(KEYS.COURSES);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Lỗi đọc localStorage, khôi phục mặc định.', e);
    }
    return JSON.parse(JSON.stringify(window.AppData.DEFAULT_COURSES));
  }

  function saveCourses(courses) {
    localStorage.setItem(KEYS.COURSES, JSON.stringify(courses));
    const el = document.getElementById('saveStatusText');
    if (el) {
      const now = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      el.textContent = `Đã lưu ${now}`;
    }
  }

  function loadTheme() {
    return localStorage.getItem(KEYS.THEME) || 'light';
  }

  function saveTheme(theme) {
    localStorage.setItem(KEYS.THEME, theme);
  }

  function loadMajor() {
    return localStorage.getItem(KEYS.MAJOR) || 'TTNT';
  }

  function saveMajor(major) {
    localStorage.setItem(KEYS.MAJOR, major);
  }

  function exportJSON(courses, major) {
    const payload = {
      app: 'HCMUS Academic Progress Tracker K2026',
      exportedAt: new Date().toISOString(),
      major,
      courses
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student_k2026.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast('Đã xuất tệp sao lưu student_k2026.json');
  }

  function importJSON(file, onSuccess) {
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        const list = Array.isArray(parsed) ? parsed : parsed.courses;
        if (!Array.isArray(list) || !list.every((x) => x.id && x.name)) {
          throw new Error('Cấu trúc tệp không khớp');
        }
        onSuccess(list, parsed.major || null);
        showToast('Khôi phục dữ liệu từ file JSON thành công!');
      } catch (err) {
        alert('Tệp JSON không hợp lệ hoặc bị lỗi định dạng. Vui lòng kiểm tra lại!');
      }
    };
    reader.readAsText(file, 'utf-8');
  }

  function showToast(message) {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const item = document.createElement('div');
    item.className = 'toast';
    item.textContent = message;
    container.appendChild(item);
    setTimeout(() => {
      item.style.opacity = '0';
      item.style.transition = 'opacity 0.25s';
      setTimeout(() => item.remove(), 260);
    }, 2600);
  }

  return {
    loadCourses,
    saveCourses,
    loadTheme,
    saveTheme,
    loadMajor,
    saveMajor,
    exportJSON,
    importJSON,
    showToast
  };
})();
