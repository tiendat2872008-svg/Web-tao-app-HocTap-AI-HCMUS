// 3.4: Tính điểm trung bình (ĐTB) & tín chỉ tích lũy THEO TỪNG HỌC KỲ — mở rộng CN-03
// Không đụng DOM khi tính, không ghi vào state. Dùng lại đúng quy tắc của grading.js
// (Grade.accumulated / Grade.passed / Grade.p4 / Grade.round1) nên số liệu luôn khớp Dashboard.
// Nạp SAU js/grading.js:  <script src="js/gpa.js"></script>
const TermStats = {
  // Học phần "có phát sinh" trong kỳ: đã chọn trạng thái (đang học / đã xong / học lại) hoặc đã có điểm
  active: r => !!r && (!!r.status || Grade.hasScore(r)),

  // Trả về { rows, last }. rows = các học kỳ đã có học phần phát sinh, theo thứ tự HK1 → HK8.
  compute(state) {
    const all = listCourses(state), rows = [];
    let cS = 0, cGp = 0, cN = 0, cTC = 0, prev = null;
    for (let sem = 1; sem <= 8; sem++) {
      const list = all.filter(c => c.sem === sem);
      let registered = 0, earned = 0, failedTc = 0, S = 0, gp = 0, N = 0;
      list.forEach(c => {
        const r = state.courses[c.id];
        if (!TermStats.active(r)) return;
        registered += c.tc;
        if (Grade.hasScore(r) && !Grade.passed(r)) failedTc += c.tc;     // F, chưa học lại
        if (!Grade.accumulated(r)) return;
        earned += c.tc;
        if (Grade.hasScore(r)) {                                          // môn đạt có điểm mới vào ĐTB
          const s = Grade.round1(r.score);
          N += c.tc; S += s * c.tc; gp += Grade.p4(s) * c.tc;
        }
      });
      if (!registered) continue;                                          // học kỳ chưa có gì → bỏ qua
      cS += S; cGp += gp; cN += N; cTC += earned;
      const row = {
        sem, registered, earned, failedTc, N,
        avg10: N ? S / N : null, gpa4: N ? gp / N : null,                 // ĐTB học kỳ
        cumEarned: cTC,
        cumAvg10: cN ? cS / cN : null, cumGpa4: cN ? cGp / cN : null      // ĐTB tích lũy đến hết kỳ này
      };
      row.cumN = cN;
      row.rank = row.avg10 === null ? '' : WHATIF.rank(row.avg10);
      row.delta = prev && row.cumGpa4 !== null && prev.cumGpa4 !== null ? row.cumGpa4 - prev.cumGpa4 : null;
      row.warning = row.gpa4 !== null && row.gpa4 + EPS < GPA_MIN;        // dưới ngưỡng cảnh báo học vụ
      rows.push(row); prev = row;
    }
    return { rows, last: rows.length ? rows[rows.length - 1] : null };
  }
};

// Giao diện (cùng lớp CSS với các thẻ Dashboard: .card, .tw, table, .badge, .mut, .dh)
function viewGpaTerms(S) {
  const { rows } = TermStats.compute(S), f = (v, d = 2) => v === null ? '—' : v.toFixed(d);
  const trend = d => d === null ? '—' : Math.abs(d) < 0.005 ? '＝ 0.00' : d > 0 ? `<span class="badge ok">▲ +${d.toFixed(2)}</span>` : `<span class="badge no">▼ ${d.toFixed(2)}</span>`;
  const body = rows.map(r => `<tr>
      <td><b>HK${r.sem}</b></td><td class="c">${r.registered}</td>
      <td class="c">${r.earned}${r.failedTc ? ` <span class="badge no" title="Học phần điểm F cần học lại">F: ${r.failedTc} TC</span>` : ''}</td>
      <td class="c">${f(r.avg10)}</td><td class="c">${f(r.gpa4)}${r.warning ? ' <span class="badge no" title="Dưới ngưỡng cảnh báo ' + GPA_MIN.toFixed(1) + '">!</span>' : ''}</td>
      <td>${r.rank || '—'}</td>
      <td class="c"><b>${f(r.cumAvg10)}</b></td><td class="c"><b>${f(r.cumGpa4)}</b></td><td class="c">${trend(r.delta)}</td></tr>`).join('');
  return `<div class="card"><div class="row"><h3 class="dh">ĐTB &amp; tín chỉ theo học kỳ</h3><span class="mut">Chỉ tính môn đạt có điểm, không gồm môn điều kiện phụ</span></div>
    ${rows.length ? `<div class="tw"><table><tr><th>Học kỳ</th><th title="Tổng TC các học phần đã chọn trạng thái trong kỳ">TC đăng ký</th><th>TC đạt</th><th>ĐTB HK (hệ 10)</th><th>GPA HK (hệ 4)</th><th>Xếp loại</th><th>ĐTBTL (hệ 10)</th><th>GPA tích lũy (hệ 4)</th><th>Xu hướng</th></tr>${body}</table></div>`
      : '<p class="mut">Chưa có học phần nào được chọn trạng thái hoặc nhập điểm. Vào tab Học phần để bắt đầu.</p>'}</div>`;
}
