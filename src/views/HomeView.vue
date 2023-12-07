<template>
  <a-upload
    :show-upload-list="true"
    name="file"
    v-model:fileList="fileList"
    :before-upload="handleBeforeUpload"
    :customRequest="handleUpload"
  >
    <a-button> 上传Excel文件 </a-button>
  </a-upload>
  <a-button @click="downloadLink('merged')"> 下载 </a-button>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import { Upload, Button, message } from 'ant-design-vue';
import ExcelJS from 'exceljs';
import type { Buffer } from 'buffer';
import type { UploadChangeParam, UploadProps } from 'ant-design-vue';
const fileList = ref<UploadProps['fileList']>([]); // 存储上传的文件列表

const handleBeforeUpload = (file: any) => {
  const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  if (!isExcel) {
    message.error('请上传Excel文件');
  }
  return isExcel;
};
const processExcel = (file: any) => {
  return new Promise((resolve, reject) => {
    resolve(file);
  });
};
const readFileAsync = (file: any) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      resolve(event.target!.result);
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};
const processExcelList = async (fileList: any[]) => {
  const mergedWorkbook = new ExcelJS.Workbook();
  const mergedWorksheet = mergedWorkbook.addWorksheet('Merged');
  for (const file of fileList){
    const arrayBuffer = await readFileAsync(file.originFileObj).catch((error) =>
      console.log(error)
    );
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(arrayBuffer as Buffer);
    workbook.eachSheet((worksheet) => {
      worksheet.eachRow((row, rowNumber) => {
        mergedWorksheet.addRow(row.values);
        console.log('cell===>',mergedWorksheet.getRow(1).getCell(6).value)

      });
    });
    console.log('cell===>',mergedWorksheet.getRow(1).getCell(1).value)
  };
  return mergedWorkbook;
};
const  downloadLink = async (filename: string) =>{
  const mergedWorkbook = await processExcelList(fileList.value!)
  console.log('cell===>',mergedWorkbook.getWorksheet(1)?.getRow(1).getCell(1).value)
  mergedWorkbook.xlsx.writeBuffer().then((buffer: any) => {
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.xlsx`;
    link.click();
    window.URL.revokeObjectURL(url);
  });
}
const handleUpload = async ({ onProgress, onSuccess, file }: any) => {
  try {
    // console.log('upload file==>', file);
    // const arrayBuffer = await readFileAsync(file);
    // const workbook = new ExcelJS.Workbook();
    // await workbook.xlsx.load(arrayBuffer as Buffer);
    // workbook.eachSheet((worksheet) => {
    //   worksheet.eachRow((row, rowNumber) => {
    //     mergedWorksheet.addRow(row.values);
    //   });
    // });
    processExcel(file).then(() => {
      message.success('文件上传成功');
      onProgress({ percent: 100 });
      onSuccess({ file });
    });
  } catch (error) {
    console.error('上传失败', error);
    message.error('文件上传失败');
  }
};
</script>
