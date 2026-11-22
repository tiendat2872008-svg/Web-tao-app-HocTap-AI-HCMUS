// Danh mục học phần để THÊM vào học kỳ (nguồn: CTĐT ngành TTNT, khóa tuyển 2025 – dùng tạm cho K2026)
// Mỗi học phần: { id, name, tc, type, lt, th, bt, dt }
//   lt/th/bt = số tiết lý thuyết / thực hành / bài tập;  dt = số tiết thực hiện đề tài (chỉ có ở mục 7.2.3)
const CATALOG = {};
const GROUPS = {};
// Gợi ý học trước chỉ để hỗ trợ tự lập kế hoạch, KHÔNG phải điều kiện đăng ký học phần.
// CTĐT TTNT 2025 không công bố các quan hệ này trong Mục 8. Dữ liệu bên dưới được
// giữ riêng, có nguồn rõ ràng, và phải được xác minh lại trên Portal cho đúng khóa tuyển.
const STUDY_GUIDANCE_SOURCE = Object.freeze({
  title: 'Danh mục Môn tiên quyết & Môn học trước FIT HCMUS',
  url: 'https://www.fit.hcmus.edu.vn/vn/Portals/2/CTDT/CQ_TienQuyet_HocTruoc.pdf',
  note: 'Tài liệu tham khảo công khai; chưa phải xác nhận điều kiện đăng ký cho khóa TTNT 2025.'
});
const STUDY_GUIDANCE = Object.freeze({
  CSC14003: ['CSC10004'],
  CSC14004: ['CSC10004'],
  CSC14005: ['CSC14003'],
  CSC15006: ['CSC10004']
});
const _row = ([id, name, tc, type, lt, th, bt, dt]) => (CATALOG[id] = CATALOG[id] || { id, name, tc, type, lt, th, bt, dt: dt || 0 }).id;
const _ids = rows => rows.map(_row);
const _t4 = (id, name) => [id, name, 4, 'TC', 45, 30, 0];
// Nhóm thường: from = học kỳ sớm nhất được phép thêm nhóm này
const _group = (key, code, name, block, from, rows) => { GROUPS[key] = { code, name, block, from, ids: _ids(rows) }; };
// Nhóm có lựa chọn con (subs): mỗi sub { key, name, desc, note?, wide?, rows }; wide = mở cửa sổ lớn
const _subs = (key, code, name, block, from, unit, subs) => {
  const s = subs.map(x => ({ key: x.key, name: x.name, desc: x.desc, note: x.note || '', wide: !!x.wide, ids: _ids(x.rows) }));
  GROUPS[key] = { code, name, block, from, unit, subs: s, ids: [...new Set(s.flatMap(x => x.ids))] };
};
// Các nhóm được phép thêm ở học kỳ sem (theo thứ tự hiển thị)
// Mọi nhóm đều thêm được ở mọi học kỳ (học sớm / học muộn / học lại); g.from chỉ là học kỳ KHUYẾN NGHỊ.
const groupsFor = sem => Object.entries(GROUPS);
// Danh sách mã học phần đang hiển thị trong cửa sổ (theo nhóm / lựa chọn con đã chọn)
const modalIds = M => {
  const g = GROUPS[M.group], s = g && g.subs && g.subs.find(x => x.key === M.sub);
  return s ? s.ids : g && !g.subs ? g.ids : [];
};

// 7.1.1 Lý luận chính trị – Pháp luật (14 TC, tất cả bắt buộc)  — học kỳ 1–8
_group('g711', '7.1.1', 'Lý luận chính trị – Pháp luật', 'dc', 1, [
  ['BAA00101', 'Triết học Mác – Lênin', 3, 'BB', 45, 0, 0],
  ['BAA00102', 'Kinh tế chính trị Mác – Lênin', 2, 'BB', 30, 0, 0],
  ['BAA00103', 'Chủ nghĩa xã hội khoa học', 2, 'BB', 30, 0, 0],
  ['BAA00104', 'Lịch sử Đảng Cộng sản Việt Nam', 2, 'BB', 30, 0, 0],
  ['BAA00003', 'Tư tưởng Hồ Chí Minh', 2, 'BB', 30, 0, 0],
  ['BAA00004', 'Pháp luật đại cương', 3, 'BB', 45, 0, 0]
]);

// 7.1.2 Khoa học xã hội – Kinh tế – Kỹ năng (chọn 01 học phần, 2 TC)  — học kỳ 1–8
_group('g712', '7.1.2', 'Khoa học xã hội – Kinh tế – Kỹ năng', 'dc', 1, [
  ['BAA00005', 'Kinh tế đại cương', 2, 'TC', 30, 0, 0],
  ['BAA00006', 'Tâm lý đại cương', 2, 'TC', 30, 0, 0],
  ['BAA00007', 'Phương pháp luận sáng tạo', 2, 'TC', 30, 0, 0]
]);

// 7.1.3 Toán – Khoa học tự nhiên – Công nghệ – Môi trường  — học kỳ 1–8
// (6 môn Toán bắt buộc đã nằm trong danh sách học phần cố định nên không liệt kê ở đây)
_group('g713', '7.1.3', 'Toán – Khoa học tự nhiên – Công nghệ – Môi trường', 'dc', 1, [
  // chọn 01 học phần Toán (4 TC)
  ['MTH00051', 'Toán ứng dụng và thống kê', 4, 'TC', 45, 30, 0],
  ['MTH00052', 'Phương pháp tính', 4, 'TC', 45, 30, 0],
  ['MTH00053', 'Lý thuyết số', 4, 'TC', 45, 30, 0],
  ['MTH00056', 'Phương pháp toán cho trí tuệ nhân tạo', 4, 'TC', 45, 30, 0],
  // chọn 06 TC khoa học tự nhiên
  ['CHE00001', 'Hóa đại cương 1', 3, 'TC', 30, 0, 30],
  ['CHE00002', 'Hóa đại cương 2', 3, 'TC', 30, 0, 30],
  ['CHE00081', 'Thực hành Hóa đại cương 1', 2, 'TC', 0, 60, 0],
  ['CHE00082', 'Thực hành Hóa đại cương 2', 2, 'TC', 0, 60, 0],
  ['BIO00001', 'Sinh đại cương 1', 3, 'TC', 45, 0, 0],
  ['BIO00002', 'Sinh đại cương 2', 3, 'TC', 45, 0, 0],
  ['BIO00081', 'Thực tập Sinh đại cương 1', 1, 'TC', 0, 30, 0],
  ['BIO00082', 'Thực tập Sinh đại cương 2', 1, 'TC', 0, 30, 0],
  ['PHY00001', 'Vật lý đại cương 1 (Cơ - Nhiệt)', 3, 'TC', 45, 0, 0],
  ['PHY00002', 'Vật lý đại cương 2 (Điện từ - Quang)', 3, 'TC', 45, 0, 0],
  ['PHY00081', 'Thực hành Vật lý đại cương', 2, 'TC', 0, 60, 0],
  // chọn 01 học phần (2 TC)
  ['GEO00002', 'Khoa học Trái đất', 2, 'TC', 30, 0, 0],
  ['ENV00001', 'Môi trường đại cương', 2, 'TC', 30, 0, 0],
  ['ENV00003', 'Con người và môi trường', 2, 'TC', 30, 0, 0]
]);

// 7.2.2.2 Kiến thức tự chọn ngành/chuyên ngành  — học kỳ 6–8
_group('g7222', '7.2.2.2', 'Kiến thức tự chọn ngành/chuyên ngành', 'cn', 6, [
  ['CSC10102', 'Kiến tập nghề nghiệp', 2, 'TC', 15, 30, 0],
  ['CSC10103', 'Khởi nghiệp', 3, 'TC', 30, 30, 0],
  _t4('CSC10104', 'Quy hoạch tuyến tính'),
  _t4('CSC12106', 'Tương tác người – máy'),
  _t4('CSC14112', 'Sinh trắc học'),
  _t4('CSC14120', 'Lập trình song song'),
  _t4('CSC15010', 'Blockchain và ứng dụng'),
  _t4('CSC16109', 'Ứng dụng xử lý ảnh số và video số'),
  _t4('CSC17001', 'Phân tích dữ liệu thông minh'),
  _t4('CSC18101', 'Trí tuệ nhân tạo cho an ninh thông tin'),
  _t4('CSC18102', 'Phương pháp toán cho tối ưu'),
  _t4('CSC18103', 'Trí tuệ bầy đàn'),
  _t4('CSC18104', 'Nhập môn hệ thống đa tác nhân'),
  _t4('CSC18106', 'Mô hình ngôn ngữ lớn'),
  _t4('CSC18107', 'Các chủ đề chọn lọc trong Trí tuệ nhân tạo')
]);

// 7.2.2.3 Kiến thức tự chọn tự do  — học kỳ 6–8; có 2 lựa chọn: 9 môn của mục này / Phụ lục 1 (100 môn, cửa sổ lớn)
const _APX1 = { CSC10121: [3, 'TC', 30, 30, 0], CSC10102: [2, 'TC', 15, 30, 0], CSC10103: [3, 'TC', 30, 30, 0], CSC10107: [4, 'TC', 30, 60, 0] };  // các môn không phải 4 TC · 45/30/0
const _PHU_LUC_1 = [   // đúng thứ tự trong Phụ lục 1 của CTĐT (không có cột "bài tập" nên BT = 0)
  ['CSC18001', 'Nhập môn học sâu'], ['CSC18002', 'Nhập môn Trí tuệ nhân tạo tạo sinh'], ['CSC18101', 'Trí tuệ nhân tạo cho an ninh thông tin'],
  ['CSC18102', 'Phương pháp toán cho tối ưu'], ['CSC18103', 'Trí tuệ bầy đàn'], ['CSC18104', 'Nhập môn hệ thống đa tác nhân'],
  ['CSC18106', 'Mô hình ngôn ngữ lớn'], ['CSC18107', 'Các chủ đề chọn lọc trong Trí tuệ nhân tạo'], ['CSC18105', 'Trí tuệ nhân tạo ứng dụng'],
  ['CSC12002', 'Cơ sở dữ liệu nâng cao'], ['CSC12003', 'Hệ quản trị cơ sở dữ liệu'], ['CSC12004', 'Phân tích thiết kế hệ thống thông tin'],
  ['CSC12005', 'Phát triển ứng dụng hệ thống thông tin hiện đại'], ['CSC10121', 'Kỹ năng mềm'], ['CSC10102', 'Kiến tập nghề nghiệp'],
  ['CSC10103', 'Khởi nghiệp'], ['CSC10104', 'Quy hoạch tuyến tính'], ['CSC10105', 'Nhập môn tư duy thuật toán'],
  ['CSC10106', 'Thuật toán tổ hợp và ứng dụng'], ['CSC10107', 'Thực tập thực tế'], ['CSC12001', 'An toàn và bảo mật dữ liệu trong hệ thống thông tin'],
  ['CSC12105', 'Thương mại điện tử'], ['CSC12106', 'Tương tác người – máy'], ['CSC17101', 'Hệ thống tư vấn'],
  ['CSC13003', 'Kiểm thử phần mềm'], ['CSC13005', 'Phân tích và quản lý yêu cầu phần mềm'], ['CSC13006', 'Quản lý dự án phần mềm'],
  ['CSC13007', 'Phát triển game'], ['CSC13008', 'Phát triển ứng dụng web'], ['CSC13009', 'Phát triển phần mềm cho thiết bị di động'],
  ['CSC13010', 'Thiết kế phần mềm'], ['CSC13106', 'Kiến trúc phần mềm'], ['CSC13112', 'Thiết kế giao diện'],
  ['CSC13001', 'Lập trình Windows'], ['CSC13101', 'Các chủ đề nâng cao trong Công nghệ phần mềm'], ['CSC13102', 'Lập trình ứng dụng Java'],
  ['CSC13103', 'Nhập môn hệ thống phân tán'], ['CSC13107', 'Mẫu thiết kế hướng đối tượng và ứng dụng'], ['CSC13117', 'Phát triển game nâng cao'],
  ['CSC14001', 'Automata và ngôn ngữ hình thức'], ['CSC14002', 'Các hệ cơ sở tri thức'], ['CSC14004', 'Khai thác dữ liệu và ứng dụng'],
  ['CSC14005', 'Nhập môn học máy'], ['CSC14006', 'Nhận dạng'], ['CSC14101', 'Ẩn dữ liệu và chia sẻ thông tin'],
  ['CSC14111', 'Nhập môn thiết kế và phân tích giải thuật'], ['CSC14118', 'Nhập môn dữ liệu lớn'], ['CSC14120', 'Lập trình song song'],
  ['CSC14008', 'Phương pháp nghiên cứu khoa học'], ['CSC14105', 'Khoa học về web'], ['CSC14112', 'Sinh trắc học'],
  ['CSC14113', 'Trình biên dịch'], ['CSC14117', 'Nhập môn lập trình kết nối vạn vật'], ['CSC14007', 'Nhập môn phân tích độ phức tạp thuật toán'],
  ['CSC15001', 'An ninh máy tính'], ['CSC15002', 'Bảo mật cơ sở dữ liệu'], ['CSC15003', 'Mã hóa ứng dụng'],
  ['CSC15004', 'Học thống kê'], ['CSC15005', 'Nhập môn mã hóa – mật mã'], ['CSC15006', 'Nhập môn xử lý ngôn ngữ tự nhiên'],
  ['CSC15007', 'Thống kê máy tính và ứng dụng'], ['CSC15009', 'Xử lý tín hiệu số'], ['CSC15011', 'Nhập môn ngôn ngữ học thống kê và ứng dụng'],
  ['CSC15012', 'Ứng dụng xử lý ngôn ngữ tự nhiên trong doanh nghiệp'], ['CSC15109', 'Nhập môn tính toán lượng tử'], ['CSC15010', 'Blockchain và ứng dụng'],
  ['CSC15102', 'Phân tích mạng xã hội'], ['CSC15107', 'Phân tích dữ liệu bảo toàn tính riêng tư'], ['CSC15108', 'Pháp chứng cho dữ liệu số'],
  ['CSC16001', 'Đồ họa máy tính'], ['CSC16002', 'Phương pháp toán trong phân tích dữ liệu thị giác'], ['CSC16003', 'Phân tích thống kê dữ liệu nhiều biến'],
  ['CSC16004', 'Thị giác máy tính'], ['CSC16005', 'Xử lý ảnh số và video số'], ['CSC16101', 'Đồ họa ứng dụng'],
  ['CSC16102', 'Kỹ thuật lập trình xử lý ảnh số và video số'], ['CSC16105', 'Truy vấn thông tin thị giác'], ['CSC16106', 'Nhập môn lập trình điều khiển thiết bị thông minh'],
  ['CSC16107', 'Ứng dụng thị giác máy tính'], ['CSC16109', 'Ứng dụng xử lý ảnh số và video số'], ['CSC16113', 'Thị giác máy tính ba chiều'],
  ['CSC16114', 'Học sâu trong Thị giác máy tính'], ['CSC16115', 'Thiết kế và vận hành hệ thống thị giác máy tính trong thực tế'], ['CSC10108', 'Trực quan hóa dữ liệu'],
  ['CSC14119', 'Nhập môn khoa học dữ liệu'], ['CSC17001', 'Phân tích dữ liệu thông minh'], ['CSC17104', 'Lập trình cho khoa học dữ liệu'],
  ['CSC17103', 'Khai thác dữ liệu đồ thị'], ['CSC17106', 'Xử lý phân tích dữ liệu trực tuyến'], ['CSC11002', 'Hệ thống viễn thông'],
  ['CSC11003', 'Lập trình mạng'], ['CSC11004', 'Mạng máy tính nâng cao'], ['CSC11006', 'Nhập môn điện toán đám mây'],
  ['CSC11007', 'Nhập môn DevOps'], ['CSC11106', 'Truyền thông không dây'], ['CSC11115', 'An ninh mạng'],
  ['CSC11116', 'DevOps nâng cao'], ['CSC11117', 'Hệ điều hành Linux và ứng dụng'], ['CSC11118', 'Triển khai và vận hành điện toán đám mây'],
  ['CSC11120', 'Bảo mật web và thiết bị di động']
].map(([id, name]) => _APX1[id] ? [id, name, ..._APX1[id]] : _t4(id, name));

_subs('g7223', '7.2.2.3', 'Kiến thức tự chọn tự do', 'cn', 6, 'lựa chọn', [
  { key: 'a', name: '9 học phần tự chọn tự do', desc: 'Danh sách học phần tự chọn tự do của chương trình',
    rows: [
      ['CSC10121', 'Kỹ năng mềm', 3, 'TC', 30, 30, 0],
      _t4('CSC11003', 'Lập trình mạng'), _t4('CSC11004', 'Mạng máy tính nâng cao'),
      _t4('CSC12002', 'Cơ sở dữ liệu nâng cao'), _t4('CSC12003', 'Hệ quản trị cơ sở dữ liệu'),
      _t4('CSC12004', 'Phân tích thiết kế hệ thống thông tin'), _t4('CSC13006', 'Quản lý dự án phần mềm'),
      _t4('CSC13009', 'Phát triển phần mềm cho thiết bị di động'), _t4('CSC13112', 'Thiết kế giao diện')
    ] },
  { key: 'b', name: 'Phụ lục 1 – Các học phần tự chọn tự do', desc: 'Danh sách đầy đủ trong Phụ lục 1 (mở cửa sổ lớn)', wide: true, rows: _PHU_LUC_1 }
]);

// 7.2.3 Kiến thức tốt nghiệp (tích lũy tối thiểu 10 TC, chọn 01 trong 03 phương án)  — học kỳ 7–8
_subs('g723', '7.2.3', 'Kiến thức tốt nghiệp', 'tn', 7, 'phương án', [
  { key: 'pa1', name: 'Phương án 1', desc: 'Khóa luận tốt nghiệp · 10 TC',
    rows: [['CSC10251', 'Khóa luận tốt nghiệp', 10, 'TC', 0, 0, 0, 300]] },
  { key: 'pa2', name: 'Phương án 2', desc: 'Thực tập tốt nghiệp · 10 TC',
    rows: [['CSC10252', 'Thực tập tốt nghiệp', 10, 'TC', 0, 0, 0, 300]] },
  { key: 'pa3', name: 'Phương án 3', desc: 'Thực tập dự án tốt nghiệp (6 TC) + 1 học phần 4 TC',
    note: 'Phương án 3 gồm Thực tập dự án tốt nghiệp (6 TC) và chọn thêm 01 học phần (4 TC) trong 3 học phần còn lại; thêm lần lượt từng học phần.',
    rows: [
      ['CSC10204', 'Thực tập dự án tốt nghiệp', 6, 'TC', 0, 0, 0, 180],
      _t4('CSC18105', 'Trí tuệ nhân tạo ứng dụng'),
      _t4('CSC15012', 'Ứng dụng xử lý ngôn ngữ tự nhiên trong doanh nghiệp'),
      _t4('CSC16107', 'Ứng dụng thị giác máy tính')
    ] }
]);
