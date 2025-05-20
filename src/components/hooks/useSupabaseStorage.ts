import { Database } from '@/lib/database.types';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useCallback } from 'react';

const EXPIRES_IN = 60;

export const useSupabaseStorage = () => {
  const supabase = useSupabaseClient<Database>();

  const downloadFile = useCallback(
    async (filePath: string) =>
      supabase.storage
        .from('patients')
        .download(filePath)
        .then(({ data }) => data && URL.createObjectURL(data)),
    [supabase]
  );

  const fetchFiles = useCallback(
    async (folder: string) =>
      supabase.storage
        .from('patients')
        .list(folder)
        .then(({ data }) => data || []),
    [supabase]
  );

  const generateLink = useCallback(
    async (pathToFile: string, bucketName = 'patients') =>
      await supabase.storage
        .from(bucketName)
        .createSignedUrl(pathToFile, EXPIRES_IN)
        .then(({ data }) => data?.signedUrl || ''),
    [supabase]
  );

  return {
    downloadFile,
    fetchFiles,
    generateLink,
  };
};
