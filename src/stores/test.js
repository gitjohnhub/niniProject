import ExcelJS from 'exceljs'

// 创建一个工作簿和工作表
const workbook = new ExcelJS.Workbook();
const worksheet = workbook.addWorksheet('Sheet1');

// 添加一行数据
worksheet.addRow([
  empty,
  "吴仪凡",
  null,
  "中共嘉定新城（马陆镇）希望二坊社区支部委员会",
  "女",
  "1994-01-21",
  "汉族",
  "正式党员",
  "2020-10-12",
  "大学",
  "社区工作人员"
]);

// 保存工作簿到文件
workbook.xlsx.writeFile('output.xlsx')
  .then(() => {
    console.log('文件已保存');
  })
  .catch(error => {
    console.error('保存文件失败', error);
  });
