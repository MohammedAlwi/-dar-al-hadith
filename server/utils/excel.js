const XLSX = require('xlsx');

const parseExcel = (filePath, options = {}) => {
  const workbook = XLSX.readFile(filePath);
  const sheetName = options.sheet || workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet, { defval: '' });
  return { data, sheetNames: workbook.SheetNames, sheet };
};

const createExcel = (data, sheetName = 'Sheet1') => {
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
};

const getSheetNames = (filePath) => {
  const workbook = XLSX.readFile(filePath);
  return workbook.SheetNames;
};

module.exports = { parseExcel, createExcel, getSheetNames };
