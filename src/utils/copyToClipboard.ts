import toast from 'react-hot-toast';

export const handleCopy = (data: string) => {
  navigator.clipboard.writeText(data || '');
  toast.success('Copied to Clipboard');
};
