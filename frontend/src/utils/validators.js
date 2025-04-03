// ตรวจสอบ Email
export const isValidEmail = (email) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };
  
  // ตรวจสอบรหัสผ่าน (ต้องมีตัวอักษรอย่างน้อย 6 ตัว)
  export const isValidPassword = (password) => {
    return password && password.length >= 6;
  };
  
  // ตรวจสอบชื่อผู้ใช้ (ต้องมีตัวอักษรอย่างน้อย 3 ตัว)
  export const isValidUsername = (username) => {
    return username && username.trim().length >= 3;
  };
  
  // ตรวจสอบการจอง (เวลาเริ่มต้องน้อยกว่าเวลาสิ้นสุด)
  export const isValidBooking = (startTime, endTime) => {
    if (!startTime || !endTime) return false;
    return new Date(startTime) < new Date(endTime);
  };
  
  // ตรวจสอบวันที่อยู่ในอดีตหรือไม่
  export const isPastDate = (date) => {
    // console.log(date)
    // console.log(new Date())
    return new Date(date) < new Date();
  };
  
  // ตรวจสอบจำนวนที่นั่งที่ถูกต้อง
  export const isValidCapacity = (capacity) => {
    return !isNaN(capacity) && parseInt(capacity) > 0;
  };
  
  // ตรวจสอบการชนกันของเวลาจอง
  export const hasTimeOverlap = (existingBookings, newStartTime, newEndTime) => {
    const newStart = new Date(newStartTime);
    const newEnd = new Date(newEndTime);
    
    return existingBookings.some(booking => {
      const existingStart = new Date(booking.startTime);
      const existingEnd = new Date(booking.endTime);
      
      // มีการซ้อนกันหากเวลาเริ่มต้นหรือสิ้นสุดของการจองใหม่อยู่ในช่วงเวลาของการจองที่มีอยู่
      return (
        (newStart >= existingStart && newStart < existingEnd) || // เวลาเริ่มอยู่ในช่วงการจองเดิม
        (newEnd > existingStart && newEnd <= existingEnd) || // เวลาสิ้นสุดอยู่ในช่วงการจองเดิม
        (newStart <= existingStart && newEnd >= existingEnd) // การจองใหม่ครอบคลุมการจองเดิม
      );
    });
  };