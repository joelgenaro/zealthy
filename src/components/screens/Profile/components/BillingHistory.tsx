import axios from 'axios';
import Link from 'next/link';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { useEffect, useMemo, useState } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import Container from '@mui/material/Container';
import Icon from '@mui/material/Icon';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import FileDownload from '@mui/icons-material/FileDownload';
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUp from '@mui/icons-material/KeyboardArrowUp';
import { useIsMobile } from '@/components/hooks/useIsMobile';
import Loading from '@/components/shared/Loading/Loading';
import Footer from '@/components/shared/layout/Footer';
import { Database } from '@/lib/database.types';
import { Pathnames } from '@/types/pathnames';
import { useAllVisiblePatientSubscription } from '@/components/hooks/data';

type Invoice = Database['public']['Tables']['invoice']['Row'];

interface BillingHistoryProps {
  patient: Database['public']['Tables']['patient']['Row'];
}

const BillingHistory = ({ patient }: BillingHistoryProps) => {
  const supabase = useSupabaseClient<Database>();
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [displayAnswer, setDisplayAnswer] = useState(null);
  const { data: visibleSubscriptions } = useAllVisiblePatientSubscription();

  const weightLossSubs = visibleSubscriptions?.filter(s =>
    s.subscription.name.includes('Weight Loss')
  );

  const handleDisplayAnswer = (question: any) => {
    setDisplayAnswer(displayAnswer =>
      displayAnswer === question ? null : question
    );
  };

  async function fetchInvoicePDF(invoiceId: string) {
    console.log('invoiceId', invoiceId);
    const data = await axios
      .post('/api/service/payment/get-invoice-pdf', {
        invoiceId,
      })
      .then(res => res.data);

    if (!data.includes('pdf')) {
      console.error(data);
      toast.error('Error retrieving receipt');
    } else {
      window?.open(data);
    }
  }

  const invoiceDescription = (description: string) => {
    if (description === '1 × Zealthy Weight Loss (at $135.00 / month)') {
      return 'Zealthy Monthly Weight Loss Membership';
    }

    return description;
  };

  const roundInvoiceAmount = (amount: number) => {
    const amountStr = amount.toString();

    const regex = /^\d+\.\d{1}$/;
    if (regex.test(amountStr)) {
      return parseFloat(amountStr).toFixed(2);
    }
    return amount;
  };

  async function fetchInvoices() {
    await supabase
      .from('invoice')
      .select('*')
      .eq('patient_id', patient.id)
      .eq('status', 'paid')
      .neq('amount_due', 0)
      .order('created_at', { ascending: false })
      .then(res => {
        if (res.error) {
          console.error(res.error);
        } else {
          setInvoices(res.data);
        }
      });

    setLoading(false);
  }

  useEffect(() => {
    if (loading && patient.id) {
      fetchInvoices();
    }
  });

  const frequentlyAskedQuestion = [
    {
      question: 'Will my account be automatically billed?',
      answer:
        'Your subscription will automatically be renewed and billed each month unless you have pre-paid your membership.',
    },
    {
      question: 'Is compound GLP-1 included in my membership?',
      answer:
        'If you ordered a 1 month supply then it’s not included in your monthly membership charge. If you ordered a 3 month supply then it is included in your membership charge. For a 3 month supply, you will not be charged your monthly membership cost for the next 2 months.',
    },
    {
      question: 'Why am I getting charged before I receive my medication?',
      answer: (
        <>
          In order to have your medication be shipped directly to your home we
          will need to have it be prepaid. All of our pricing is listed here:{' '}
          <Link
            href="https://acrobat.adobe.com/id/urn:aaid:sc:VA6C2:ffe53c15-1e27-4a4c-a4e7-1099f2f6f321?viewer%21megaVerb=group-discover"
            target="_blank"
          >
            Pricing List
          </Link>
          . If you’re not sure why a charge was made, reach out to your care
          team:{' '}
          <Link href="/messages">https://app.getzealthy.com/messages</Link>
        </>
      ),
    },
    {
      question: 'What was I charged for?',
      answer:
        'If you’re unsure about a charge, you can download the receipt that is right next to the charge amount. The receipt will provide further information about the charge. ',
    },
    {
      question: 'How do I ask for a refund?',
      answer:
        'For a refund request, reach out to your care team for further clarification on the charge. It’s important to provide an explanation if you haven’t received your medication (for a medication charge) within 10 business days from the date that you were charged. If a refund is issued, it takes about 5-7 business days for it to reach your bank account.',
    },
  ];

  return (
    <Container maxWidth="md">
      <Typography variant="h2" marginBottom={5}>
        Billing History
      </Typography>
      {loading && <Loading />}
      {!loading && invoices.length === 0 ? (
        <Typography variant="body1">No invoices found.</Typography>
      ) : (
        <Stack spacing={4}>
          {invoices.map(invoice => (
            <Stack
              key={invoice.reference_id}
              direction="row"
              justifyContent="space-between"
              alignItems="flex-start"
              gap={3}
            >
              <Stack gap={0.3}>
                <Typography variant="body1">
                  {invoiceDescription(
                    invoice?.description?.replace('vial', '') || ''
                  )}
                </Typography>
                <Stack>
                  <Typography variant="body1" color="grey">
                    {invoice.is_refunded
                      ? `${
                          invoice.amount_due &&
                          invoice.amount_refunded &&
                          invoice.amount_refunded < invoice.amount_due
                            ? 'Partial Refund'
                            : 'Refund'
                        } Issued: ${format(
                          new Date(invoice?.refunded_at || ''),
                          'M/d/yyyy'
                        )}`
                      : `Charged: ${format(
                          new Date(invoice.created_at),
                          'M/d/yyyy'
                        )}`}
                  </Typography>
                  {invoice.is_refunded && (
                    <Typography
                      variant="caption"
                      color="grey"
                      sx={{
                        fontSize: '10px !important',
                        fontStyle: 'italic',
                      }}
                    >
                      May take 5-7 days from Refund Issued date to appear in
                      account
                    </Typography>
                  )}
                </Stack>
              </Stack>
              <Box
                alignItems="right"
                justifyItems="flex-end"
                display="grid"
                gap={isMobile ? 1 : 0.3}
                gridTemplateColumns={isMobile ? '160px' : '1fr 160px'}
              >
                <Stack alignItems="flex-end">
                  <Typography variant="body1">
                    ${roundInvoiceAmount(invoice.amount_due || 0)}
                  </Typography>
                  {invoice.amount_due &&
                    invoice.amount_refunded &&
                    invoice.amount_refunded < invoice.amount_due && (
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: '13px !important',
                          fontStyle: 'italic',
                          textAlign: 'right',
                          minWidth: '150px',
                        }}
                      >
                        Partial refund: ${invoice.amount_refunded}
                      </Typography>
                    )}
                </Stack>
                {invoice.reference_id.includes('in_') && (
                  <Link
                    href="#"
                    onClick={() => fetchInvoicePDF(invoice.reference_id)}
                    style={{
                      textDecoration: 'none',
                      color: '#00531B',
                    }}
                  >
                    <Stack direction="row" gap={0.5} alignItems="center">
                      <Typography>Download receipt</Typography>
                      <FileDownload fontSize="small" />
                    </Stack>
                  </Link>
                )}
              </Box>
            </Stack>
          ))}
        </Stack>
      )}
      <br></br>
      <br></br>
      {(weightLossSubs?.length || 0) > 0 &&
      (!weightLossSubs?.find(s => s?.price === 449) ||
        !weightLossSubs?.find(s => s?.price === 297)) ? (
        <Stack sx={{ gap: '1rem' }}>
          <Typography fontWeight="600">Frequently Asked Questions</Typography>
          <Stack sx={{ gap: '0.5rem' }}>
            {frequentlyAskedQuestion &&
              frequentlyAskedQuestion.map((q, i) => (
                <>
                  <Box
                    key={i}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                    }}
                  >
                    <Stack sx={{ gap: '0.5rem' }}>
                      <Typography
                        variant="h6"
                        onClick={() => handleDisplayAnswer(q.question)}
                      >
                        {q.question}
                      </Typography>
                      <Collapse
                        in={displayAnswer === q.question}
                        timeout="auto"
                        unmountOnExit
                      >
                        <Typography
                          variant="subtitle2"
                          sx={{ color: '#535353' }}
                        >
                          {q.answer}
                        </Typography>
                      </Collapse>
                    </Stack>
                    <Icon onClick={() => handleDisplayAnswer(q.question)}>
                      {displayAnswer === q.question ? (
                        <KeyboardArrowUp />
                      ) : (
                        <KeyboardArrowDown />
                      )}
                    </Icon>
                  </Box>
                  <hr
                    style={{
                      borderTop: '1px solid #bbb',
                      width: '100%',
                    }}
                  />
                </>
              ))}
          </Stack>
        </Stack>
      ) : null}
      <Stack marginTop={7} textAlign="center" color="grey">
        <Typography variant="body1">Question about a payment?</Typography>
        <Link href={Pathnames.MESSAGES} style={{ color: 'grey' }}>
          <Typography variant="body1">Message your Care Team</Typography>
        </Link>
      </Stack>
      <Footer />
    </Container>
  );
};

export default BillingHistory;
