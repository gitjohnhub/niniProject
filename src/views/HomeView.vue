<template>
  <a-row>
    <a-col :span="2"> </a-col>
    <a-col :span="10">
      <a-card>
        <a-upload-dragger
          name="file"
          :multiple="true"
          v-model:fileList="fileList"
          :before-upload="handleBeforeUpload"
          :customRequest="handleUpload"
          @change="handleChange"
        >
          <p class="ant-upload-drag-icon">
            <inbox-outlined></inbox-outlined>
          </p>
          <p class="ant-upload-text">Click or drag file to this area to upload</p>
          <p class="ant-upload-hint">
            Support for a single or bulk upload. Strictly prohibit from uploading company data or
            other band files
          </p>
        </a-upload-dragger>
      </a-card>
    </a-col>
    <a-col :span="10">
      <a-row>
        <a-card>
          <a-checkbox v-model:checked="hasTitle">是否包含标题行</a-checkbox>
          <a-button type="primary" @click="downloadLink('merged')"> 下载 </a-button>
        </a-card>
      </a-row>
      <a-row>
        <a-card>
          <a-space direction="horizontal">
            <span v-for="(row, index) in fileRowsList" :key="index">
              <a-statistic :title="`第${index + 1}张表`" :value="row" />
            </span>
            <a-statistic title="总计" :value="totalRows" />
          </a-space>
        </a-card>
      </a-row>
    </a-col>
  </a-row>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import { InboxOutlined } from '@ant-design/icons-vue';
import type { CSSProperties } from 'vue';
import { message } from 'ant-design-vue';
import ExcelJS from 'exceljs';
import type { Buffer } from 'buffer';
import type { UploadChangeParam, UploadProps } from 'ant-design-vue';
const fileList = ref<UploadProps['fileList']>([]); // 存储上传的文件列表
const hasTitle = ref<boolean>(true);
const handleChange = (info: UploadChangeParam) => {
  const status = info.file.status;
  if (status !== 'uploading') {
    console.log(info.file, info.fileList);
  }
  if (status === 'done') {
    message.success(`${info.file.name} file uploaded successfully.`);
  } else if (status === 'error') {
    message.error(`${info.file.name} file upload failed.`);
  }
};
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
const totalRows = ref(0);
const fileRowsList = ref<Number[]>([]);
const processExcelList = async (fileList: any[]) => {
  const mergedWorkbook = new ExcelJS.Workbook();
  const mergedWorksheet = mergedWorkbook.addWorksheet('Merged');
  for (const [index, file] of fileList.entries()) {
    const arrayBuffer = await readFileAsync(file.originFileObj).catch((error) =>
      console.log(error)
    );
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(arrayBuffer as Buffer);
    workbook.eachSheet((worksheet) => {
      const rowNum = hasTitle.value ? worksheet.rowCount - 1 : worksheet.rowCount;
      fileRowsList.value.push(rowNum);
      totalRows.value += rowNum;
      worksheet.eachRow((row, rowNumber) => {
        if (index === 0) {
          mergedWorksheet.addRow(row.values);
        } else {
          if (hasTitle.value && rowNumber === 1) {
            return;
          }
          mergedWorksheet.addRow(row.values);
        }
      });
    });
  }
  return mergedWorkbook;
};
const downloadLink = async (filename: string) => {
  const mergedWorkbook = await processExcelList(fileList.value!);
  console.log('cell===>', mergedWorkbook.getWorksheet(1)?.getRow(1).getCell(1).value);
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
};
const handleUpload = async ({ onProgress, onSuccess, file }: any) => {
  try {
    await processExcel(file); // 等待 processExcel 函数完成
    onProgress({ percent: 100 });
    onSuccess({ file });
  } catch (error) {
    console.error('上传失败', error);
    // message.error('文件上传失败');
  }
};
const cardStyle: CSSProperties = {
  width: '620px',
};
const imgStyle: CSSProperties = {
  display: 'block',
  width: '273px',
};
</script>
