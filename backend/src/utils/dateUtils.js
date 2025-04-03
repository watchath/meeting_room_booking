const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
};
  
const formatTime = (date) => {
    const d = new Date(date);
    return d.toLocaleTimeString('th-TH', {
        hour: '2-digit',
        minute: '2-digit'
    });
};
  
const formatDateTime = (date) => {
    return `${formatDate(date)} ${formatTime(date)}`;
};
  
const getWorkingHours = () => {
    const hours = [];
    for (let i = 8; i <= 18; i++) {
      hours.push(`${i}:00`);
      if (i < 18) {
        hours.push(`${i}:30`);
      }
    }
    return hours;
};
  
module.exports = {
    formatDate,
    formatTime,
    formatDateTime,
    getWorkingHours
};