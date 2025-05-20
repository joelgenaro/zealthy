import { Database } from '@/lib/database.types';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useCallback } from 'react';

const supportedFormats = [
  'image/png',
  'image/jpeg',
  'image/heic',
  'application/pdf',
];

const supportedFormatsFriendly = ['PNG', 'JPEG', 'HEIC/HEIF', 'PDF'];

export const useUploadDocument = () => {
  const supabase = useSupabaseClient<Database>();

  const fetchFiles = useCallback(
    async (folder: string) => {
      return supabase.storage
        .from('patients')
        .list(folder)
        .then(({ data }) => data || []);
    },
    [supabase]
  );

  const uploadFile = useCallback(
    async (file: File | Blob, pathToUpload: string) => {
      if (!supportedFormats.includes(file.type)) {
        return {
          data: null,
          error: new Error(
            `Sorry, at this moment we only support the following formats: ${supportedFormatsFriendly.join(
              ', '
            )}`
          ),
        };
      }

      let promises = [];
      let fileToUpload: File | Blob = file;

      if (['image/heic', 'image/heif'].includes(file.type)) {
        const heic2any = require('heic2any');
        fileToUpload = await heic2any({
          blob: file,
          toType: 'image/jpeg',
        });
      }

      const lastSlashIndex = pathToUpload.lastIndexOf('/');
      const folderPath = pathToUpload.substring(0, lastSlashIndex + 1);
      let fileName = pathToUpload.substring(lastSlashIndex + 1);

      fileName = fileName
        .replace(/\s+/g, '_')
        .replace(/[^\w\d.-]/g, '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

      if (!fileName) {
        const timestamp = Date.now();
        const extension = fileToUpload.type.split('/')[1];
        fileName = `file_${timestamp}.${extension}`;
      }

      const sanitizedPath = folderPath + fileName;

      const hasExtension = /\.(jpg|jpeg|png|pdf|heic)$/i.test(sanitizedPath);

      const uploadPath = hasExtension
        ? sanitizedPath
        : `${sanitizedPath}.${fileToUpload.type.split('/')[1]}`;

      console.log('Uploading file to path:', uploadPath);

      promises.push(
        supabase.storage.from('patients').upload(uploadPath, fileToUpload, {
          cacheControl: '3600',
          upsert: true,
        })
      );

      /* CANVAS UPLOAD DISABLED FOR NOW */

      // if (file.type === "application/pdf") {
      //   const coding = file?.name?.toLowerCase().split(" ").join("-");

      //   let fileReader: FileReader | null = new FileReader();
      //   fileReader.onload = () => {
      //     const result = fileReader!.result;
      //     promises.push(uploadPDF(result as string, coding));
      //   };
      //   fileReader.readAsDataURL(file);
      // } else {
      //   promises.push(
      //     resizeImage(fileToUpload).then((base64) =>
      //       uploadImage({
      //         name: file?.name,
      //         type: fileToUpload.type,
      //         fileToUpload: base64,
      //       })
      //     )
      //   );
      // }

      const [data] = await Promise.all(promises);

      return {
        data,
        error: null,
      };
    },
    [supabase]
  );

  const downloadFile = useCallback(
    async (pathToFile: string) => {
      return supabase.storage
        .from('patients')
        .download(pathToFile)
        .then(({ data }) => data && URL.createObjectURL(data));
    },
    [supabase]
  );

  const removeFile = useCallback(
    async (pathToFile: string) => {
      return supabase.storage.from('patients').remove([pathToFile]);
    },
    [supabase]
  );

  const listFilesInFolder = useCallback(
    async (folder: string) => {
      return supabase.storage.from('patients').list(folder);
    },
    [supabase]
  );

  return {
    fetchFiles,
    removeFile,
    downloadFile,
    uploadFile,
    listFilesInFolder,
  };
};
