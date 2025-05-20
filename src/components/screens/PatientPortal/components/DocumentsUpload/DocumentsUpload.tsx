import { useMemo, useState, useEffect, ChangeEvent, useCallback } from 'react';
import {
  Container,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
  Box,
  Link,
  Button,
} from '@mui/material';
import {
  usePatient,
  useAllPatientPrescriptionRequest,
  usePatientCompletedVisits,
  usePatientLabWorks,
  useAllVisiblePatientSubscription,
} from '@/components/hooks/data';
import { UploadingDocumentType, UploadedDocType } from './types';
import DocumentCards from '@/components/shared/DocumentCards';
import OtherDocuments from './components/OtherDocuments';
import FaxesUpload from './components/FaxesUpload';
import Loading from '@/components/shared/Loading/Loading';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import { format } from 'date-fns';
import { useUploadDocument } from '@/components/hooks/useUploadDocument';
import WhiteBox from '@/components/shared/layout/WhiteBox';
import Spinner from '@/components/shared/Loading/Spinner';
import ErrorMessage from '@/components/shared/ErrorMessage';
import { useBetterDocumentLoading } from '@/components/hooks/useBetterDocumentLoading';

const insuranceDocuments = (patient_id: number): UploadingDocumentType[] => [
  {
    label: 'Insurance card',
    folder: `patient-${patient_id}/insurance-card`,
    items: [
      {
        label: 'Insurance card front',
        fileName: 'front',
      },
      {
        label: 'Insurance card back',
        fileName: 'back',
      },
    ],
  },
  {
    label: 'Secondary insurance card (only if applicable)',
    folder: `patient-${patient_id}/secondary-insurance-card`,
    items: [
      {
        label: 'Insurance card front',
        fileName: 'front',
      },
      {
        label: 'Insurance card back',
        fileName: 'back',
      },
    ],
  },
  {
    label: 'Pharmacy benefits card',
    folder: `patient-${patient_id}/pharmacy-card`,
    items: [
      {
        label: 'Pharmacy benefits card front',
        fileName: 'front',
      },
      {
        label: 'Pharmacy benefits card back',
        fileName: 'back',
      },
    ],
  },
  {
    label: 'Savings card',
    folder: `patient-${patient_id}/saving-card`,
    items: [
      {
        label: 'Savings card',
        fileName: 'front',
      },
    ],
  },
];

const LabResultItem = ({
  lab,
}: {
  lab: UploadedDocType & { uniqueId?: string };
}) => {
  const { isDocumentLoading, openDocument, loadDocument } =
    useBetterDocumentLoading({
      onReturnFromDocument: () => {},
    });

  const [isLoading, setIsLoading] = useState(false);
  const { downloadFile } = useUploadDocument();

  const documentLoading = isDocumentLoading(lab.pathToFile);

  const handleDownload = useCallback(
    async (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      setIsLoading(true);

      try {
        const freshUrl = await downloadFile(lab.pathToFile);

        if (freshUrl) {
          await loadDocument(lab.pathToFile, async () => {
            try {
              const response = await fetch(freshUrl);
              return await response.blob();
            } catch (error) {
              console.error('Error loading document:', error);
              return null;
            }
          });

          openDocument(lab.pathToFile, freshUrl);
        } else {
          console.error('Could not get document URL');
        }
      } catch (error) {
        console.error('Error downloading document:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [lab.pathToFile, openDocument, downloadFile, loadDocument]
  );

  return (
    <Link
      href="#"
      download={lab.label}
      underline="none"
      color="inherit"
      sx={{
        cursor: isLoading || documentLoading ? 'wait' : 'pointer',
        opacity: isLoading || documentLoading ? 0.7 : 1,
        position: 'relative',
      }}
      onClick={handleDownload}
      data-testid={`lab-result-item-${lab.pathToFile}`}
    >
      <Box
        width="100%"
        height="95px"
        border="1px solid #D8D8D8"
        bgcolor="white"
        borderRadius="10px"
        padding="24px"
        display="flex"
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
      >
        <Stack gap="10px" direction="row" alignItems="center">
          <DescriptionOutlinedIcon color="primary" fontSize="large" />
          <Stack gap="4px">
            <Typography variant="body1">
              {format(new Date(lab.created_at), 'MMMM d, yyyy')}
            </Typography>
            <Typography variant="h4">{lab.label}</Typography>
            {(isLoading || documentLoading) && (
              <Typography variant="caption" color="text.secondary">
                Preparing download...
              </Typography>
            )}
          </Stack>
        </Stack>
        <Box sx={{ opacity: 0.5 }}>→</Box>
      </Box>
    </Link>
  );
};

interface DocumentsUploadProps {}

const DocumentsUpload = ({}: DocumentsUploadProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { data: patient, isLoading: isPatientLoading } = usePatient();
  const { data: prescriptionRequest = [], isLoading: isPrescriptionLoading } =
    useAllPatientPrescriptionRequest();
  const { data: onlineVisits = [], isLoading: isVisitsLoading } =
    usePatientCompletedVisits();
  const { data: labWorks, isLoading: isLabWorksLoading } = usePatientLabWorks();
  const { data: visibleSubscriptions = [], isLoading: isSubscriptionsLoading } =
    useAllVisiblePatientSubscription();
  const { fetchFiles, downloadFile, uploadFile } = useUploadDocument();

  const [enclomipheneLabDocs, setEnclomipheneLabDocs] = useState<
    Array<UploadedDocType & { uniqueId: string }>
  >([]);
  const [prepLabDocs, setPrepLabDocs] = useState<
    Array<UploadedDocType & { uniqueId: string }>
  >([]);
  const [loadingLabs, setLoadingLabs] = useState(true);
  const [uploadingEnclomipheneLab, setUploadingEnclomipheneLab] =
    useState(false);
  const [uploadingPrepLab, setUploadingPrepLab] = useState(false);
  const [labUploadError, setLabUploadError] = useState('');

  const { loadDocument, preloadDocument } = useBetterDocumentLoading({
    onReturnFromDocument: () => {},
  });

  const isDataLoading =
    isPatientLoading ||
    isPrescriptionLoading ||
    isVisitsLoading ||
    isLabWorksLoading ||
    isSubscriptionsLoading;

  const isEnclomiphenePatient = useMemo(() => {
    return prescriptionRequest?.some(pr =>
      pr?.specific_medication?.includes('Enclomiphene')
    );
  }, [prescriptionRequest]);

  const isPrepPatient = useMemo(() => {
    return onlineVisits.some(v => v.specific_care === 'Prep');
  }, [onlineVisits]);

  const isWLPatient = useMemo(() => {
    return onlineVisits.some(v => v.specific_care === 'Weight Loss');
  }, [onlineVisits]);

  const hasWeightLossSubscription = useMemo(() => {
    return visibleSubscriptions.some(sub =>
      sub?.subscription?.name?.includes('Weight Loss')
    );
  }, [visibleSubscriptions]);

  const shouldShowInsuranceDocuments = useMemo(() => {
    return hasWeightLossSubscription || isWLPatient || isPrepPatient;
  }, [hasWeightLossSubscription, isWLPatient, isPrepPatient]);

  const insuranceDocumentsToUploads = useMemo(() => {
    if (!patient) return [];
    return insuranceDocuments(patient.id);
  }, [patient]);

  const fetchLabDocuments = useCallback(
    async (folder: string) => {
      if (!folder) return [];

      try {
        const files = await fetchFiles(folder);
        if (!files?.length) {
          return [];
        }

        const docs = files.map(file => ({
          label: file.name,
          pathToFile: `${folder}/${file.name}`,
          created_at: file.created_at,
          uniqueId: `${folder}/${file.name}-${file.created_at}`,
        }));

        docs.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        if (docs.length > 0) {
          const firstDoc = docs[0];
          downloadFile(firstDoc.pathToFile).then(url => {
            if (url) {
              preloadDocument(firstDoc.pathToFile, async () => {
                try {
                  const response = await fetch(url);
                  return await response.blob();
                } catch (error) {
                  console.error('Error preloading document:', error);
                  return null;
                }
              });
            }
          });
        }

        return docs;
      } catch (error) {
        console.error(`Error fetching documents from ${folder}:`, error);
        return [];
      }
    },
    [fetchFiles, downloadFile, preloadDocument]
  );

  useEffect(() => {
    if (!patient?.id || (!isEnclomiphenePatient && !isPrepPatient)) {
      setLoadingLabs(false);
      return;
    }

    const isInitialLoad =
      enclomipheneLabDocs.length === 0 && prepLabDocs.length === 0;

    if (isInitialLoad) {
      setLoadingLabs(true);
    }

    const controller = new AbortController();
    const signal = controller.signal;

    const loadAllDocuments = async () => {
      if (signal.aborted) return;

      try {
        const promises = [];
        const foldersToCheck = [];

        if (isEnclomiphenePatient) {
          promises.push(
            fetchLabDocuments(`patient-${patient.id}/enclomiphene-labs`)
          );
          foldersToCheck.push(`patient-${patient.id}/enclomiphene-labs`);

          promises.push(
            fetchLabDocuments(`patient-${patient.id}/enclomiphene`)
          );
          foldersToCheck.push(`patient-${patient.id}/enclomiphene`);
        }

        if (isPrepPatient) {
          promises.push(fetchLabDocuments(`patient-${patient.id}/prep-labs`));
          foldersToCheck.push(`patient-${patient.id}/prep-labs`);
        }

        const labWorkPromise = fetchLabDocuments(
          `patient-${patient.id}/lab-work`
        );
        promises.push(labWorkPromise);
        foldersToCheck.push(`patient-${patient.id}/lab-work`);

        const results = await Promise.all(promises);

        if (signal.aborted) return;

        const labWorkResults = results[results.length - 1];

        const deduplicateDocuments = (
          docs: Array<UploadedDocType & { uniqueId: string }>
        ) => {
          const uniqueIds = new Set();
          return docs.filter(doc => {
            if (!doc || !doc.uniqueId || uniqueIds.has(doc.uniqueId)) {
              return false;
            }
            uniqueIds.add(doc.uniqueId);
            return true;
          });
        };

        if (isEnclomiphenePatient && !isPrepPatient) {
          setEnclomipheneLabDocs(
            deduplicateDocuments([
              ...results[0],
              ...results[1],
              ...labWorkResults,
            ])
          );
        } else if (!isEnclomiphenePatient && isPrepPatient) {
          setPrepLabDocs(
            deduplicateDocuments([...results[0], ...labWorkResults])
          );
        } else if (isEnclomiphenePatient && isPrepPatient) {
          const encloDocs = [...results[0], ...results[1]];
          const prepDocs = [...results[2]];
          const hasPreplabDocs = prepDocs.length > 0;
          const hasEncloDocs = encloDocs.length > 0;

          // If both have docs, assign lab-work to prep section
          if (hasPreplabDocs && hasEncloDocs) {
            setEnclomipheneLabDocs(deduplicateDocuments(encloDocs));
            setPrepLabDocs(
              deduplicateDocuments([...prepDocs, ...labWorkResults])
            );
          } else if (hasPreplabDocs) {
            // If only prep has docs, assign lab-work to prep
            setEnclomipheneLabDocs(deduplicateDocuments(encloDocs));
            setPrepLabDocs(
              deduplicateDocuments([...prepDocs, ...labWorkResults])
            );
          } else if (hasEncloDocs) {
            // If only enclo has docs, assign lab-work to prep
            setEnclomipheneLabDocs(deduplicateDocuments(encloDocs));
            setPrepLabDocs(
              deduplicateDocuments([...prepDocs, ...labWorkResults])
            );
          } else {
            // If neither has docs, assign lab-work to both
            setEnclomipheneLabDocs(
              deduplicateDocuments([...encloDocs, ...labWorkResults])
            );
            setPrepLabDocs(deduplicateDocuments([...prepDocs]));
          }
        }
      } catch (error) {
        console.error('Error loading lab documents:', error);
        setLabUploadError(
          'Failed to load your lab documents. Please try refreshing the page.'
        );
      } finally {
        if (!signal.aborted) {
          setLoadingLabs(false);
        }
      }
    };

    const timeoutId = setTimeout(() => {
      if (!signal.aborted) {
        loadAllDocuments();
      }
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [patient?.id, isEnclomiphenePatient, isPrepPatient, fetchLabDocuments]);

  const handleLabFileUpload = useCallback(
    async (
      file: File,
      uploadFolder: string,
      setUploading: (loading: boolean) => void,
      setDocs: (
        updater: (
          prevDocs: Array<UploadedDocType & { uniqueId: string }>
        ) => Array<UploadedDocType & { uniqueId: string }>
      ) => void,
      currentDocsCount: number
    ) => {
      if (!patient) return;

      setUploading(true);
      setLabUploadError('');

      const originalName = file.name;

      const fileName = originalName;

      try {
        const { data, error } = await uploadFile(
          file,
          `${uploadFolder}/${fileName}`
        );

        if (error) {
          console.error('Upload error:', error);
          setLabUploadError(error.message);
          return;
        }

        if (!data) {
          console.error('Upload successful but no data returned');
          return;
        }

        const path = data.data?.path || '';
        const displayName = file.name;

        const newDoc = {
          pathToFile: path,
          label: displayName,
          created_at: new Date().toISOString(),
          uniqueId: `${path}-${new Date().toISOString()}`,
        };

        setDocs(prevDocs => [newDoc, ...prevDocs]);

        const url = await downloadFile(path);

        if (url) {
          await loadDocument(path, async () => {
            try {
              const response = await fetch(url);
              return await response.blob();
            } catch (error) {
              console.error('Error pre-loading document:', error);
              return null;
            }
          });
        }
      } catch (err) {
        console.error('Unexpected upload error:', err);
        setLabUploadError(
          'An unexpected error occurred during upload. Please try again.'
        );
      } finally {
        setUploading(false);
      }
    },
    [patient, uploadFile, downloadFile, loadDocument]
  );

  const handleEnclomipheneLabUpload = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (!patient || !e.target.files?.[0]) return;

      const file = e.target.files[0];
      const uploadFolder = `patient-${patient.id}/enclomiphene-labs`;

      handleLabFileUpload(
        file,
        uploadFolder,
        setUploadingEnclomipheneLab,
        setEnclomipheneLabDocs,
        enclomipheneLabDocs.length
      ).finally(() => {
        if (e.target) {
          e.target.value = '';
        }
      });
    },
    [patient, handleLabFileUpload, enclomipheneLabDocs.length]
  );

  const handlePrepLabUpload = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (!patient || !e.target.files?.[0]) return;

      const file = e.target.files[0];
      const uploadFolder = `patient-${patient.id}/prep-labs`;

      handleLabFileUpload(
        file,
        uploadFolder,
        setUploadingPrepLab,
        setPrepLabDocs,
        prepLabDocs.length
      ).finally(() => {
        if (e.target) {
          e.target.value = '';
        }
      });
    },
    [patient, handleLabFileUpload, prepLabDocs.length]
  );

  const handleLabUpload = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (isEnclomiphenePatient && !isPrepPatient) {
        handleEnclomipheneLabUpload(e);
      } else if (!isEnclomiphenePatient && isPrepPatient) {
        handlePrepLabUpload(e);
      }
    },
    [
      isEnclomiphenePatient,
      isPrepPatient,
      handleEnclomipheneLabUpload,
      handlePrepLabUpload,
    ]
  );

  if (isDataLoading) {
    return <Loading />;
  }

  const siteName = 'Zealthy';
  const govtInsuranceText = `${siteName}'s weight loss program is not available to those who have government insurance, such as Medicare, Medicaid, or Tricare.`;

  return (
    <Container
      maxWidth={isMobile ? 'xs' : 'sm'}
      sx={{ marginTop: `${isMobile ? '-25px' : '0px'}` }}
    >
      <Typography mb={'3rem'} variant="h2">
        My Documents
      </Typography>

      {isWLPatient && (
        <Typography mb={3} fontWeight="500">
          {govtInsuranceText}
        </Typography>
      )}

      <Stack gap={6} sx={{ marginBottom: `${isMobile ? '65px' : '0px'}` }}>
        {shouldShowInsuranceDocuments && (
          <>
            {insuranceDocumentsToUploads.map(document => (
              <DocumentCards
                key={document.label}
                document={document}
                patient={patient!}
              />
            ))}
          </>
        )}

        {(isEnclomiphenePatient || isPrepPatient) && (
          <Stack gap={4}>
            <Typography variant="h3">Lab Results</Typography>

            {loadingLabs ? (
              <Loading />
            ) : isEnclomiphenePatient && isPrepPatient ? (
              <>
                <Stack gap={3}>
                  <Typography variant="h4" fontWeight="650">
                    Enclomiphene
                  </Typography>

                  {enclomipheneLabDocs.length > 0 ? (
                    <Stack gap={2}>
                      {enclomipheneLabDocs.map(doc => (
                        <LabResultItem key={doc.uniqueId} lab={doc} />
                      ))}
                    </Stack>
                  ) : (
                    <Typography variant="body1">
                      You do not have any Enclomiphene lab results within the
                      Zealthy system at this time.
                    </Typography>
                  )}

                  <WhiteBox padding="24px">
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography
                        color={theme.palette.primary.main}
                        fontWeight="600"
                      >
                        Enclomiphene lab results
                      </Typography>
                      <Button component="label" variant="rounded" size="small">
                        {uploadingEnclomipheneLab ? (
                          <Spinner size="1.3em" color="inherit" />
                        ) : (
                          'Upload'
                        )}
                        <input
                          type="file"
                          hidden
                          accept="image/png,image/jpeg,image/heic,application/pdf"
                          onChange={handleEnclomipheneLabUpload}
                        />
                      </Button>
                    </Stack>
                  </WhiteBox>
                </Stack>

                <Stack gap={3}>
                  <Typography variant="h4" fontWeight="650">
                    PrEP
                  </Typography>

                  {prepLabDocs.length > 0 ? (
                    <Stack gap={2}>
                      {prepLabDocs.map(doc => (
                        <LabResultItem key={doc.uniqueId} lab={doc} />
                      ))}
                    </Stack>
                  ) : (
                    <Typography variant="body1">
                      You do not have any PrEP lab results within the Zealthy
                      system at this time.
                    </Typography>
                  )}

                  <WhiteBox padding="24px">
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography
                        color={theme.palette.primary.main}
                        fontWeight="600"
                      >
                        PrEP lab results
                      </Typography>
                      <Button component="label" variant="rounded" size="small">
                        {uploadingPrepLab ? (
                          <Spinner size="1.3em" color="inherit" />
                        ) : (
                          'Upload'
                        )}
                        <input
                          type="file"
                          hidden
                          accept="image/png,image/jpeg,image/heic,application/pdf"
                          onChange={handlePrepLabUpload}
                        />
                      </Button>
                    </Stack>
                  </WhiteBox>
                </Stack>
              </>
            ) : (
              <>
                {isEnclomiphenePatient && (
                  <Typography
                    variant="h4"
                    fontWeight="650"
                    fontSize="16px!important"
                  >
                    Enclomiphene
                  </Typography>
                )}

                {isPrepPatient && (
                  <Typography
                    variant="h4"
                    fontWeight="650"
                    fontSize="16px!important"
                  >
                    PrEP
                  </Typography>
                )}

                {isEnclomiphenePatient && (
                  <>
                    {enclomipheneLabDocs.length > 0 ? (
                      <Stack gap={2}>
                        {enclomipheneLabDocs.map(doc => (
                          <LabResultItem key={doc.uniqueId} lab={doc} />
                        ))}
                      </Stack>
                    ) : (
                      <Typography variant="body1">
                        You do not have any Enclomiphene lab results within the
                        Zealthy system at this time.
                      </Typography>
                    )}
                  </>
                )}

                {isPrepPatient && (
                  <>
                    {prepLabDocs.length > 0 ? (
                      <Stack gap={2}>
                        {prepLabDocs.map(doc => (
                          <LabResultItem key={doc.uniqueId} lab={doc} />
                        ))}
                      </Stack>
                    ) : (
                      <Typography variant="body1">
                        You do not have any PrEP lab results within the Zealthy
                        system at this time.
                      </Typography>
                    )}
                  </>
                )}

                <WhiteBox padding="24px">
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography
                      color={theme.palette.primary.main}
                      fontWeight="600"
                    >
                      Lab test results
                    </Typography>
                    <Button component="label" variant="rounded" size="small">
                      {(isEnclomiphenePatient && uploadingEnclomipheneLab) ||
                      (isPrepPatient && uploadingPrepLab) ? (
                        <Spinner size="1.3em" color="inherit" />
                      ) : (
                        'Upload'
                      )}
                      <input
                        type="file"
                        hidden
                        accept="image/png,image/jpeg,image/heic,application/pdf"
                        onChange={handleLabUpload}
                      />
                    </Button>
                  </Stack>
                </WhiteBox>
              </>
            )}

            {labUploadError && <ErrorMessage>{labUploadError}</ErrorMessage>}
          </Stack>
        )}

        <OtherDocuments patientId={patient?.id} />

        <FaxesUpload />
      </Stack>
    </Container>
  );
};

export default DocumentsUpload;
