// CN-01: Danh mục học phần K2026 (dùng tạm CTĐT khóa 2025; bổ sung đủ 138 TC dần)
const TOTAL_TC = 138, GPA_MIN = 2.0, VERSION = 'K2026';
const BLOCKS = {
  dc: { name: 'Giáo dục đại cương', tc: 56 }, cs: { name: 'Cơ sở ngành', tc: 38 },
  cn: { name: 'Chuyên ngành', tc: 34 },       tn: { name: 'Tốt nghiệp', tc: 10 }
};
// Học phần CỐ ĐỊNH trong từng học kỳ (đối chiếu CTĐT TTNT khóa tuyển 2025, mục 7 và 8: mã, TC, loại, số tiết).
// Học phần tự chọn khác thêm bằng nút "Thêm học phần" (danh mục trong catalog.js).
// [mã, tên, TC, loại (BB/TC), học kỳ, khối, tiết LT, tiết TH, tiết BT]
const COURSES = [
  // Học kỳ 1 (Năm 1)
  ['MTH00021','Vi tích phân 1',4,'BB',1,'dc',45,30,0],
  ['MTH00045','Toán rời rạc',4,'BB',1,'dc',45,30,0],
  ['CSC00009','Giới thiệu ngành Trí tuệ nhân tạo',4,'BB',1,'dc',45,30,0],
  ['CSC10013','Cơ sở lập trình cho trí tuệ nhân tạo',4,'BB',1,'cs',45,30,0],
  // Học kỳ 2 (Năm 1)
  ['MTH00022','Vi tích phân 2',4,'BB',2,'dc',45,30,0],
  ['MTH00035','Đại số tuyến tính',4,'BB',2,'dc',45,30,0],
  ['CSC10004','Cấu trúc dữ liệu và giải thuật',4,'BB',2,'cs',45,30,0],
  // Học kỳ 3 (Năm 2)
  ['MTH00044','Xác suất thống kê',4,'BB',3,'dc',45,30,0],
  ['MTH00050','Toán học tổ hợp',4,'BB',3,'dc',45,30,0],
  ['CSC10003','Phương pháp lập trình hướng đối tượng',4,'BB',3,'cs',45,30,0],
  ['CSC14003','Cơ sở trí tuệ nhân tạo',4,'BB',3,'cs',45,30,0],
  // Học kỳ 4 (Năm 2)
  ['CSC10015','Tư duy tính toán cho trí tuệ nhân tạo',4,'BB',4,'cs',45,30,0],
  ['CSC10006','Cơ sở dữ liệu',4,'BB',4,'cs',45,30,0],
  ['CSC14005','Nhập môn học máy',4,'TC',4,'cn',45,30,0],
  // Học kỳ 5 (Năm 3)
  ['CSC10007','Hệ điều hành',4,'BB',5,'cs',45,30,0],
  ['CSC10008','Mạng máy tính',4,'BB',5,'cs',45,30,0],
  ['CSC14004','Khai thác dữ liệu và ứng dụng',4,'TC',5,'cn',45,30,0],
  ['CSC15006','Nhập môn xử lý ngôn ngữ tự nhiên',4,'TC',5,'cn',45,30,0],
  // Học kỳ 6 (Năm 3)
  ['CSC10011','Công nghệ phần mềm cho hệ thống trí tuệ nhân tạo',4,'BB',6,'cs',45,30,0],
  ['CSC10009','Hệ thống máy tính',2,'BB',6,'cs',30,0,0],
  ['CSC16004','Thị giác máy tính',4,'TC',6,'cn',45,30,0],
  // Học kỳ 7 (Năm 4)
  ['CSC18001','Nhập môn học sâu',4,'TC',7,'cn',45,30,0],
  ['CSC18002','Nhập môn Trí tuệ nhân tạo tạo sinh',4,'TC',7,'cn',45,30,0],
  // Học kỳ 8 (Năm 4)
  ['CSC15009','Xử lý tín hiệu số',4,'TC',8,'cn',45,30,0]
].map(([id,name,tc,type,sem,block,lt,th,bt]) => ({id,name,tc,type,sem,block,lt,th,bt}));
// Mã học phần cũ (dữ liệu mẫu) → mã đúng theo CTĐT; dùng để chuyển điểm đã nhập sang mã mới
const ID_ALIAS = { MTH00025: 'MTH00050', KLTN: 'CSC10251' };
// Điều kiện phụ – không tính vào GPA và tín chỉ tích lũy
const EXTRAS = [['gdtc','Chứng chỉ GDTC (4 TC)'],['gdqp','Chứng chỉ GDQP-AN (4 TC)'],['ngoai','Chuẩn Ngoại ngữ đầu ra']];
// CN-06: giờ bắt đầu tiết theo cơ sở (MẪU – cập nhật theo Portal)
const CAMPUS = { 'Nguyễn Văn Cừ': { start: '07:00', len: 50 }, 'Linh Trung': { start: '07:00', len: 50 } };
const DAYS = ['Thứ 2','Thứ 3','Thứ 4','Thứ 5','Thứ 6','Thứ 7'];
