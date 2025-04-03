export const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };
  
  // ฟอร์แมตเวลาเป็น string ในรูปแบบ HH:MM:SS
  export const formatTime = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };
  
  // ฟอร์แมตวันที่และเวลาเป็น string ในรูปแบบ DD/MM/YYYY HH:MM:SS
  export const formatDateTime = (date) => {
    if (!date) return '';
    return `${formatDate(date)} ${formatTime(date)}`;
  };
  
  // แปลงวันที่เป็น ISO string สำหรับส่งให้ API
  export const toISOString = (date) => {
    if (!date) return '';
    return new Date(date).toISOString();
  };
  
  // สร้างช่วงวันของเดือน (สำหรับ Calendar)
  export const getMonthRange = (date = new Date()) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0);
    return { startOfMonth, endOfMonth };
  };
  
  // คำนวณความแตกต่างระหว่างวันที่เป็นจำนวนวันหรือชั่วโมง
  export const getDateDifference = (startDate, endDate, unit = 'hours') => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffMs = end - start;
    
    switch (unit) {
      case 'days':
        return Math.floor(diffMs / (1000 * 60 * 60 * 24));
      case 'hours':
        return Math.floor(diffMs / (1000 * 60 * 60));
      case 'minutes':
        return Math.floor(diffMs / (1000 * 60));
      default:
        return diffMs;
    }
  };