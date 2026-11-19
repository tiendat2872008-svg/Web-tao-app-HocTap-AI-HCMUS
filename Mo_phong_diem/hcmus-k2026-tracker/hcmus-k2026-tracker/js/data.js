/* ==========================================================================
   DỮ LIỆU CTĐT CHUẨN CẨM NANG K2026 (138 TC CHUYÊN MÔN + MÔN ĐIỀU KIỆN)
   ========================================================================== */
window.AppData = (() => {
  const TOTAL_REQUIRED_CREDITS = 138;

  const KNOWLEDGE_BLOCKS = [
    { key: 'Đại cương', label: 'Giáo dục đại cương', target: 56 },
    { key: 'Cơ sở ngành', label: 'Cơ sở ngành', target: 38 },
    { key: 'Chuyên ngành', label: 'Chuyên ngành', target: 34, electiveTarget: 16 },
    { key: 'Tốt nghiệp', label: 'Khối tốt nghiệp', target: 10 }
  ];

  const SHIFTS = [
    { id: 'S1', label: 'Tiết 1–3', period: 'Sáng', time: '07:30 – 10:00', order: 1 },
    { id: 'S2', label: 'Tiết 4–6', period: 'Sáng', time: '10:10 – 12:40', order: 2 },
    { id: 'C1', label: 'Tiết 7–9', period: 'Chiều', time: '13:30 – 16:00', order: 3 },
    { id: 'C2', label: 'Tiết 10–12', period: 'Chiều', time: '16:10 – 18:40', order: 4 }
  ];

  const DAYS = [
    { value: 2, label: 'Thứ 2' },
    { value: 3, label: 'Thứ 3' },
    { value: 4, label: 'Thứ 4' },
    { value: 5, label: 'Thứ 5' },
    { value: 6, label: 'Thứ 6' },
    { value: 7, label: 'Thứ 7' }
  ];

  const DEFAULT_COURSES = [
    // === GIÁO DỤC ĐẠI CƯƠNG (56 TC) ===
    { id: 'CSC10001', name: 'Nhập môn lập trình', credits: 4, sem: 1, block: 'Đại cương', type: 'BB', status: 'DONE', score10: 8.8, day: 2, shift: 'S1', campus: 'Linh Trung' },
    { id: 'MTH00003', name: 'Vi tích phân 1B', credits: 3, sem: 1, block: 'Đại cương', type: 'BB', status: 'DONE', score10: 7.6, day: 3, shift: 'S1', campus: 'Linh Trung' },
    { id: 'MTH00030', name: 'Đại số tuyến tính', credits: 3, sem: 1, block: 'Đại cương', type: 'BB', status: 'DONE', score10: 8.5, day: 5, shift: 'C1', campus: 'Linh Trung' },
    { id: 'BAA00101', name: 'Triết học Mác – Lênin', credits: 3, sem: 1, block: 'Đại cương', type: 'BB', status: 'DONE', score10: 7.2, day: 4, shift: 'S2', campus: 'Linh Trung' },
    { id: 'CSC10002', name: 'Kỹ thuật lập trình', credits: 4, sem: 2, block: 'Đại cương', type: 'BB', status: 'DONE', score10: 9.0, day: 2, shift: 'S2', campus: 'Linh Trung' },
    { id: 'MTH00004', name: 'Vi tích phân 2B', credits: 3, sem: 2, block: 'Đại cương', type: 'BB', status: 'DONE', score10: 6.8, day: 4, shift: 'S1', campus: 'Linh Trung' },
    { id: 'MTH00040', name: 'Xác suất thống kê', credits: 4, sem: 2, block: 'Đại cương', type: 'BB', status: 'DONE', score10: 8.1, day: 6, shift: 'S1', campus: 'Linh Trung' },
    { id: 'MTH00041', name: 'Toán rời rạc', credits: 4, sem: 2, block: 'Đại cương', type: 'BB', status: 'DONE', score10: 8.6, day: 3, shift: 'C1', campus: 'Linh Trung' },
    { id: 'BAA00102', name: 'Kinh tế chính trị Mác – Lênin', credits: 2, sem: 2, block: 'Đại cương', type: 'BB', status: 'DONE', score10: 7.4, day: 5, shift: 'S2', campus: 'Linh Trung' },
    { id: 'PHY00001', name: 'Vật lý đại cương 1 (Cơ – Nhiệt)', credits: 3, sem: 3, block: 'Đại cương', type: 'TC', status: 'DONE', score10: 5.2, day: 6, shift: 'C1', campus: 'Linh Trung' },
    { id: 'BAA00004', name: 'Pháp luật đại cương', credits: 3, sem: 3, block: 'Đại cương', type: 'BB', status: 'DONE', score10: 8.0, day: 7, shift: 'S1', campus: 'Linh Trung' },
    { id: 'MTH00051', name: 'Toán ứng dụng và thống kê', credits: 4, sem: 3, block: 'Đại cương', type: 'BB', status: 'PENDING', score10: null, day: 3, shift: 'S2', campus: 'Nguyễn Văn Cừ' },

    // === CƠ SỞ NGÀNH (38 TC) ===
    { id: 'CSC10003', name: 'Phương pháp lập trình hướng đối tượng', credits: 4, sem: 3, block: 'Cơ sở ngành', type: 'BB', status: 'STUDYING', score10: null, day: 2, shift: 'S1', campus: 'Nguyễn Văn Cừ' },
    { id: 'CSC10004', name: 'Cấu trúc dữ liệu và giải thuật', credits: 4, sem: 3, block: 'Cơ sở ngành', type: 'BB', status: 'STUDYING', score10: null, day: 2, shift: 'S1', campus: 'Linh Trung' }, // Trùng Thứ 2 S1 để minh họa CN-06
    { id: 'CSC10006', name: 'Cơ sở dữ liệu', credits: 4, sem: 4, block: 'Cơ sở ngành', type: 'BB', status: 'STUDYING', score10: null, day: 2, shift: 'S2', campus: 'Linh Trung' }, // Chuyển cơ sở sát giờ Thứ 2 S1->S2
    { id: 'CSC10007', name: 'Hệ điều hành', credits: 4, sem: 4, block: 'Cơ sở ngành', type: 'BB', status: 'STUDYING', score10: null, day: 4, shift: 'C1', campus: 'Nguyễn Văn Cừ' },
    { id: 'CSC10008', name: 'Mạng máy tính', credits: 4, sem: 4, block: 'Cơ sở ngành', type: 'BB', status: 'DONE', score10: 3.5, day: 5, shift: 'S1', campus: 'Nguyễn Văn Cừ' }, // Điểm F minh họa cảnh báo học lại
    { id: 'CSC10009', name: 'Hệ thống máy tính', credits: 4, sem: 3, block: 'Cơ sở ngành', type: 'BB', status: 'DONE', score10: 8.5, day: 6, shift: 'S2', campus: 'Nguyễn Văn Cừ' },
    { id: 'CSC13002', name: 'Nhập môn công nghệ phần mềm', credits: 4, sem: 5, block: 'Cơ sở ngành', type: 'BB', status: 'PENDING', score10: null, day: 3, shift: 'C1', campus: 'Nguyễn Văn Cừ' },

    // === CHUYÊN NGÀNH (34 TC) ===
    { id: 'CSC14003', name: 'Cơ sở trí tuệ nhân tạo', credits: 4, sem: 5, block: 'Chuyên ngành', type: 'BB', status: 'STUDYING', score10: null, day: 5, shift: 'S1', campus: 'Nguyễn Văn Cừ' },
    { id: 'CSC14005', name: 'Nhập môn học máy', credits: 4, sem: 5, block: 'Chuyên ngành', type: 'BB', status: 'PENDING', score10: null, day: 3, shift: 'S1', campus: 'Nguyễn Văn Cừ' },
    { id: 'CSC14119', name: 'Nhập môn học sâu (Deep Learning)', credits: 4, sem: 6, block: 'Chuyên ngành', type: 'TC', status: 'PENDING', score10: null, day: 4, shift: 'S1', campus: 'Nguyễn Văn Cừ' },
    { id: 'CSC16002', name: 'Thị giác máy tính', credits: 4, sem: 6, block: 'Chuyên ngành', type: 'TC', status: 'PENDING', score10: null, day: 6, shift: 'C1', campus: 'Nguyễn Văn Cừ' },
    { id: 'CSC15006', name: 'Xử lý ngôn ngữ tự nhiên', credits: 4, sem: 7, block: 'Chuyên ngành', type: 'TC', status: 'PENDING', score10: null, day: 5, shift: 'C1', campus: 'Nguyễn Văn Cừ' },
    { id: 'CSC14007', name: 'Khai thác dữ liệu và ứng dụng', credits: 4, sem: 7, block: 'Chuyên ngành', type: 'TC', status: 'PENDING', score10: null, day: 6, shift: 'S1', campus: 'Nguyễn Văn Cừ' },

    // === KHỐI TỐT NGHIỆP (10 TC) ===
    { id: 'CSC10251', name: 'Khóa luận tốt nghiệp', credits: 10, sem: 8, block: 'Tốt nghiệp', type: 'BB', status: 'PENDING', score10: null, day: 7, shift: 'S1', campus: 'Nguyễn Văn Cừ' },

    // === NGOÀI 138 TC (ĐIỀU KIỆN PHỤ) ===
    { id: 'BAA00021', name: 'Giáo dục thể chất (GDTC 1 & 2)', credits: 4, sem: 1, block: 'Điều kiện', type: 'ĐK', status: 'DONE', score10: 8.0, day: 6, shift: 'S1', campus: 'Linh Trung' },
    { id: 'BAA00030', name: 'Giáo dục quốc phòng – An ninh', credits: 8, sem: 2, block: 'Điều kiện', type: 'ĐK', status: 'DONE', score10: 8.5, day: 7, shift: 'S1', campus: 'Linh Trung' },
    { id: 'ADD00031', name: 'Chuẩn Ngoại ngữ đầu ra (TOEIC/IELTS)', credits: 0, sem: 6, block: 'Điều kiện', type: 'ĐK', status: 'STUDYING', score10: null, day: 7, shift: 'C1', campus: 'Nguyễn Văn Cừ' }
  ];

  function convertScore10(score10) {
    if (score10 === null || score10 === undefined || score10 === '' || Number.isNaN(Number(score10))) {
      return { letter: '—', g4: null, rank: 'Chưa có điểm', css: 'grade-NONE', passed: false };
    }
    const v = Number(score10);
    if (v >= 8.5) return { letter: 'A', g4: 4.0, rank: 'Giỏi / Xuất sắc', css: 'grade-A', passed: true };
    if (v >= 7.0) return { letter: 'B', g4: 3.0, rank: 'Khá', css: 'grade-B', passed: true };
    if (v >= 5.5) return { letter: 'C', g4: 2.0, rank: 'Trung bình', css: 'grade-C', passed: true };
    if (v >= 4.0) return { letter: 'D', g4: 1.0, rank: 'Yếu (Nên cải thiện)', css: 'grade-D', passed: true };
    return { letter: 'F', g4: 0.0, rank: 'Kém (Phải học lại)', css: 'grade-F', passed: false };
  }

  function getGpaRank(gpa4, hasCredits) {
    if (!hasCredits) return { label: 'Chưa xếp loại', pillClass: 'pill-neutral' };
    if (gpa4 >= 3.6) return { label: 'Xuất sắc', pillClass: 'pill-emerald' };
    if (gpa4 >= 3.2) return { label: 'Giỏi', pillClass: 'pill-blue' };
    if (gpa4 >= 2.5) return { label: 'Khá', pillClass: 'pill-amber' };
    if (gpa4 >= 2.0) return { label: 'Trung bình', pillClass: 'pill-neutral' };
    return { label: 'Cảnh báo học vụ', pillClass: 'pill-rose' };
  }

  function computeMetrics(courses) {
    let earnedCredits = 0;
    let gpaCredits = 0;
    let sum4 = 0;
    let sum10 = 0;
    const failedCourses = [];
    const blockEarned = { 'Đại cương': 0, 'Cơ sở ngành': 0, 'Chuyên ngành': 0, 'Tốt nghiệp': 0 };
    let majorElectiveSelected = 0;

    courses.forEach((c) => {
      if (c.block === 'Điều kiện') return;
      if (c.block === 'Chuyên ngành' && c.type === 'TC' && (c.status === 'DONE' || c.status === 'STUDYING')) {
        majorElectiveSelected += c.credits;
      }
      if (c.status === 'DONE' && c.score10 !== null && c.score10 !== '') {
        const conv = convertScore10(c.score10);
        gpaCredits += c.credits;
        sum4 += conv.g4 * c.credits;
        sum10 += Number(c.score10) * c.credits;
        if (conv.passed) {
          earnedCredits += c.credits;
          if (blockEarned[c.block] !== undefined) blockEarned[c.block] += c.credits;
        } else {
          failedCourses.push(c);
        }
      }
    });

    const gpa4 = gpaCredits > 0 ? sum4 / gpaCredits : 0;
    const gpa10 = gpaCredits > 0 ? sum10 / gpaCredits : 0;
    const remainingCredits = Math.max(0, TOTAL_REQUIRED_CREDITS - earnedCredits);
    const percent = Math.min(100, (earnedCredits / TOTAL_REQUIRED_CREDITS) * 100);

    return {
      earnedCredits,
      remainingCredits,
      percent,
      gpaCredits,
      sum4,
      sum10,
      gpa4,
      gpa10,
      failedCourses,
      blockEarned,
      majorElectiveSelected
    };
  }

  return {
    TOTAL_REQUIRED_CREDITS,
    KNOWLEDGE_BLOCKS,
    SHIFTS,
    DAYS,
    DEFAULT_COURSES,
    convertScore10,
    getGpaRank,
    computeMetrics
  };
})();
