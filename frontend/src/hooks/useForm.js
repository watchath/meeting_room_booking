import { useState } from 'react';

export const useForm = (initialValues = {}, validate = () => ({})) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newValues = {
      ...values,
      [name]: value
    };

    setValues(newValues);
    
    setTouched({
      ...touched,
      [name]: true
    });

    // เมื่อมีการเปลี่ยนค่าให้ตรวจสอบ validation ใหม่
    const validationErrors = validate(newValues);
    
    /// เคลียร์ error เฉพาะฟิลด์ที่ถูกแก้ไข
    setErrors({
      ...errors,
      [name]: validationErrors[name] || null
    });

  };

  const handleBlur = (e) => {
    const { name } = e.target;
    
    setTouched({
      ...touched,
      [name]: true
    });
    
    // Validate when user blurs an input
    const validationErrors = validate(values);
    setErrors(validationErrors);
  };

  const handleSubmit = (onSubmit) => (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allTouched = Object.keys(values).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    
    setTouched(allTouched);
    
    // Validate all fields
    const validationErrors = validate(values);
    setErrors(validationErrors);
    
    // If no errors, call onSubmit
    if (Object.keys(validationErrors).length === 0) {
      onSubmit(values);
    }
  };

  // ปรับปรุงฟังก์ชัน setValues ให้จัดการกับ errors ด้วย
  const customSetValues = (newValues) => {
    setValues(newValues);
    
    // ล้าง errors ทั้งหมดเมื่อมีการ set values ใหม่
    // หรือคุณอาจจะต้องการ validate ใหม่ทันทีก็ได้: setErrors(validate(newValues));
    setErrors({});
  };

  // เพิ่มฟังก์ชันสำหรับตั้งค่า error ของฟิลด์เดียว
  const setFieldError = (fieldName, errorMessage) => {
    setErrors(prevErrors => ({
      ...prevErrors,
      [fieldName]: errorMessage
    }));
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  };

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    setValues: customSetValues, // ใช้ฟังก์ชันที่แก้ไขแล้ว
    setFieldError
  };
};