export type DocumentItemType = {
  label: string;
  fileName: string;
};

export type UploadingDocumentType = {
  label: string;
  folder: string;
  items: DocumentItemType[];
};

export type Uploads = {
  created_at?: string;
  isUploaded: boolean;
  label: string;
  pathToFile?: string;
  pathToUpload?: string;
};

export type UploadedDocType = {
  label: string;
  pathToFile: string;
  created_at: string;
};

export type UploadingDocType = {
  label: string;
  pathToUpload: string;
};
