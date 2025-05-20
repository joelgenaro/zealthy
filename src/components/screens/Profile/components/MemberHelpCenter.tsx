import { useIsMobile } from '@/components/hooks/useIsMobile';
import CenteredContainer from '@/components/shared/layout/CenteredContainer';
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUp from '@mui/icons-material/KeyboardArrowUp';
import Collapse from '@mui/material/Collapse';
import Icon from '@mui/material/Icon';
import Typography from '@mui/material/Typography';
import Box from '@mui/system/Box';
import Stack from '@mui/system/Stack';
import Link from 'next/link';
import React, { useState } from 'react';

const MemberHelpCenter = () => {
  const [displayAnswer, setDisplayAnswer] = useState(null);
  const isMobile = useIsMobile();

  const handleDisplayAnswer = (question: any) => {
    setDisplayAnswer(displayAnswer =>
      displayAnswer === question ? null : question
    );
  };

  const semaglutideTirzepatideQuestions = [
    {
      question: 'Is Semaglutide the same as Wegovy or Ozempic?',
      answer: (
        <>
          Semaglutide is the active ingredient in Wegovy and Ozempic.
          Semaglutide is known for being more cost effective than the brand
          medication like Wegovy. At Zealthy we’re dedicated to providing you
          affordable healthcare. We offer monthly or quarterly shipments of
          semaglutide for as little as $151/month, with or without insurance
          (this compares to $1K+ for brand name alternatives without insurance
          approval). Please note that Semaglutide is not FDA approved. Get
          started here:{' '}
          <Link href="/patient-portal/weight-loss-treatment/compound">
            https://app.getzealthy.com/patient-portal/weight-loss-treatment/compound
          </Link>{' '}
        </>
      ),
    },
    {
      question: 'Is Tirzepatide the same as Zepbound or Mounjaro?',
      answer: (
        <>
          Tirzepatide is the active ingredient in Zepbound and Mounjaro.
          Tirzepatide is known for being more cost effective than the brand
          medication like Zepbound. At Zealthy we’re dedicated to providing you
          affordable healthcare. We offer monthly or quarterly shipments of
          tirzepatide for as little as $216/month, with or without insurance
          (this compares to $1K+ for brand name alternatives without insurance
          approval). Regarding both compounds, it is important to note that they
          are not FDA approved. Get started here:{' '}
          <Link href="/patient-portal/weight-loss-treatment/compound">
            https://app.getzealthy.com/patient-portal/weight-loss-treatment/compound
          </Link>{' '}
        </>
      ),
    },
    {
      question: 'Are GLP-1 medications safe?',
      answer:
        'Yes, some GLP-1 medications are FDA-approved and have been scientifically proven to help people lose weight. GLP-1 medications such as Zepbound and Wegovy, which are FDA approved for weight loss, have been able to help people lose weight and keep it off. Other medications like Compounded Semaglutide and Compounded Tirzepatide are frequently used off label for weight loss. Please note that Semaglutide and Tirzepatide are not FDA approve.',
    },
    {
      question: 'How long will it take to notice weight loss?',
      answer:
        'It depends, but consistency is important. Some people may notice weight loss right away, but it can take longer for others to notice any weight loss. Continue to take as directed and your provider will titrate your dose as needed to promote optimal weight loss tailored to your clinical needs. On average, what is typically considered safe is 1-2 pounds per week (or 6-8 pounds per month) of weight loss.',
    },
    {
      question:
        'Do I need to request refills if I order Semaglutide or Tirzepatide?',
      answer:
        'Yes, you should complete your refill request a week before your medication is due to end. It’s important to be consistent and your provider will ensure to titrate the dose as needed based on your refill request form. Be on the lookout for an email to let you know that it’s time to complete your refill request. You must complete this to receive your refills, unless you already paid for a 3 month supply. Please note that Semaglutide and Tirzepatide are not FDA approved.',
    },
    {
      question: 'Does Semaglutide or Tirzepatide need to be refrigerated?',
      answer:
        'Yes! Once you receive your medication it’s important to put the vial(s) in the fridge. It’s shipped with ice packs, but it’s important to put the medication in the fridge once it’s been delivered. Please note that Semaglutide and Tirzepatide are not FDA approved.',
    },
    {
      question: 'How do I administer the medication my provider ordered today?',
      answer: (
        <>
          An injection instructions video and PDF file are displayed in your
          home page to help you through the injection process. Your injection
          instructions will include the amount of units to inject for the whole
          duration of your medication. Go to your “Medications” tab to see
          injection instructions for your order:{' '}
          <Link href="/manage-prescriptions/order-history">
            https://app.getzealthy.com/manage-prescriptions/order-history
          </Link>{' '}
        </>
      ),
    },
    {
      question: 'Are there any side effects?',
      answer:
        'It’s important to notify your provider if you have any side effects. Nausea, diarrhea, constipation and lack of appetite are among the most common. Your provider may be able to prescribe medication that you can take to help manage these side effects.',
    },
    {
      question:
        'What should I do if I experience side effects from my medication?',
      answer:
        "If you experience any side effects from your medication, it's important to notify your healthcare provider immediately. They can provide guidance on how to manage the side effects or adjust your treatment plan accordingly. In some cases, your provider may recommend discontinuing the medication or switching to an alternative option.",
    },
    {
      question: 'Can I cancel my order?',
      answer:
        'Once the medication has been processed, we are no longer able to cancel the medication order and a refund cannot be issued. Contact your care team if you have any questions.',
    },
    {
      question: 'Do I need to make changes to my diet?',
      answer:
        'Our clinicians commonly prescribe GLP-1 medications that are appetite suppressants, which means that you may not feel the same level of cravings that you typically do. Your weight loss coach can help you find a balanced diet and regular exercise routine to ensure you achieve your weight loss goals.',
    },
    {
      question:
        'Can I speak with my healthcare provider about adjusting my medication dosage?',
      answer:
        'Yes, you can discuss any medication dosage adjustments with your healthcare provider. Simply schedule a consultation appointment through your Zealthy account, and your provider will evaluate your current treatment plan and make any necessary adjustments based on your individual needs and health status.',
    },
    {
      question: 'Are there any updates or changes to my treatment plan?',
      answer:
        'To check for updates or changes to your treatment plan, log in to your Zealthy account and review any notifications or messages from your healthcare provider. You can also schedule a follow-up appointment to discuss any updates or changes directly with your provider.',
    },
    {
      question: 'What should I do if I miss a dose of my medication?',
      answer:
        "If you miss a dose of your medication, take it as soon as you remember, unless it's almost time for your next scheduled dose. In that case, skip the missed dose and continue with your regular dosing schedule. Do not take a double dose to make up for a missed one, as this can increase the risk of side effects or complications. If you have any concerns or questions about missed doses, contact your healthcare provider for guidance.",
    },
    {
      question:
        "Can I request a medication switch if I'm not seeing the desired results?",
      answer:
        "If you're not seeing the desired results from your current medication, you can discuss the possibility of a medication switch with your healthcare provider. They can evaluate your response to the current treatment and recommend alternative options that may be more effective for your condition. Schedule a consultation appointment through your Zealthy account to discuss your concerns and explore potential medication changes with your provider.",
    },
    {
      question:
        "Can I receive a medication dosage adjustment if I've experienced weight changes?",
      answer:
        "If you've experienced significant weight changes while taking your medication, it's important to inform your healthcare provider. They can evaluate your current dosage and make any necessary adjustments based on factors such as weight fluctuations, changes in health status, and treatment response. Schedule a consultation appointment through your Zealthy account to discuss your weight changes and potential dosage adjustments with your provider.",
    },
    {
      question:
        "What should I do if I have questions about my medication that aren't covered here?",
      answer:
        "If you have questions about your medication that aren't covered here, you can contact Zealthy's customer support team for assistance. They can provide information, resources, and support to address your concerns and ensure you have a positive experience with your medication regimen.",
    },
  ];

  const billingAndSubscriptionQuestions = [
    {
      question: 'Will my account be automatically billed?',
      answer:
        'Your subscription will automatically be renewed and billed each month unless you have pre-paid your membership.',
    },
    {
      question: 'How do I request a refund? When will I receive it?',
      answer: (
        <>
          Contact your care team to clarify what the charge was for and if the
          charge is eligible for a refund then it should be back in your account
          within 7-10 business days depending on your bank. Any other questions
          or concerns on your refund please contact our team at{' '}
          <Link href="mailto:support@getzealthy.com">
            support@getzealthy.com
          </Link>{' '}
        </>
      ),
    },
    {
      question: 'Is compound GLP-1 included in my membership?',
      answer: (
        <>
          In order to have compound GLP-1 shipped directly to your home then it
          is a separate charge (not included in your membership). We offer
          compound GLP-1 like Semaglutide which is the main active ingredient in
          Wegovy for as little as $151/month. We also offer Tirzepatide which is
          the main active ingredient in Zepbound for as little as $216/month.
          We’ll be able to ship compound GLP-1 straight to your door (no prior
          authorization submission required). Get started here:{' '}
          <Link href="/patient-portal/weight-loss-treatment/compound">
            https://app.getzealthy.com/patient-portal/weight-loss-treatment/compound
          </Link>{' '}
        </>
      ),
    },
    {
      question: 'What happens if my payment method was declined?',
      answer:
        "If your payment is declined, we'll send you an email notification with instructions on how to update your payment information. You will receive an email once the payment has been successful.",
    },
    {
      question: 'What is your refund policy?',
      answer:
        'You can cancel your membership at any time, but we ask that you send us a clear request at least 48 hours prior to your next membership charge. We cannot guarantee a refund if you request cancellation after you have been charged for your membership.',
    },
    {
      question: 'Where is my refund?',
      answer: (
        <>
          If your purchase is eligible for a refund and has been confirmed that
          it was issued by our team it should be back in your account within
          7-10 business days depending on your bank. Please keep in mind that we
          can only issue a refund back to your original form of payment, so if
          you cancel that form of payment we are unable to issue a refund of any
          kind. Any other questions or concerns on your refund please message
          your care team or email{' '}
          <Link href="mailto:support@getzealthy.com">
            support@getzealthy.com
          </Link>
          .{' '}
        </>
      ),
    },
    {
      question: 'Can I pause my membership?',
      answer: `Unfortunately we’re not able to pause your subscription. However, you can delay shipments from the home page of your Zealthy portal if you select "Manage subscription." The reason you cannot pause your subscription is that it’s important to be under a provider’s care while you're on medication. If you choose to cancel your membership, please notify your provider regarding discontinuing your medication. Canceled memberships will have their prior authorizations to cover GLP-1 medication canceled and will not be eligible for refills, since our medical providers won’t be able to monitor your treatment plan if you cancel.`,
    },
    {
      question: 'Is this a one-time plan?',
      answer:
        'All our weight loss memberships are recurring, since it’s important to be under a provider’s care while on medication. You can cancel at any time.',
    },
    {
      question: 'How can I change my payment information?',
      answer: (
        <>
          If you need to update your payment information please go to{' '}
          <Link href="/patient-portal/profile?page=payment">
            https://app.getzealthy.com/patient-portal/profile?page=payment
          </Link>
        </>
      ),
    },
  ];

  const shippingAndDeliveryQuestions = [
    {
      question:
        'What should I do if my medication is delayed or arrives damaged?',
      answer: (
        <>
          For assistance, please contact our customer support team by emailing{' '}
          <Link href="mailto:support@getzealthy.com">
            support@getzealthy.com
          </Link>{' '}
          or calling 1-877-870-0323.
        </>
      ),
    },
    {
      question:
        'How is Semaglutide and Tirzepatide medication packaged for shipping?',
      answer:
        'Semaglutide and Tirzepatide medication is carefully packaged for shipment to ensure its integrity and effectiveness during transit. It is enclosed in temperature-controlled packaging with ice packs to maintain the proper temperature and guarantee safe, reliable delivery.',
    },
    {
      question: 'Is there a signature required upon delivery?',
      answer:
        "A signature is not required upon delivery. However, Zealthy recommends using the tracking number provided by FedEx or UPS to track the package's status and estimated delivery time.",
    },
    {
      question: 'Can I change my shipping address after placing an order?',
      answer: (
        <>
          If your order has not yet shipped from our pharmacy, you can update
          your shipping address. Please contact our customer support team by
          emailing{' '}
          <Link href="mailto:support@getzealthy.com">
            support@getzealthy.com
          </Link>{' '}
          or calling 1-877-870-0323.
        </>
      ),
    },
    {
      question: 'Is tracking information provided for shipped orders?',
      answer: (
        <>
          Yes, you will receive tracking information via email, text, and your
          Zealthy home page will update once we receive a tracking number for
          your order. If you don’t see it in your inbox, please check your spam
          or junk folders. If you’re still unable to locate the email, feel free
          to contact us at{' '}
          <Link href="mailto:support@getzealthy.com">
            support@getzealthy.com
          </Link>
          , and we’ll be happy to provide you with the tracking number.
        </>
      ),
    },
    {
      question: 'How long does it take for my order to be delivered?',
      answer:
        'After your consultation and once the doctor has prescribed your medication plan, please allow 1-2 business days for our pharmacy to prepare your custom compounded medication. We will then ship your order via FedEx/UPS 2-day delivery service.',
    },
  ];

  const refillProcessQuestions = [
    {
      question: 'How do I get a semaglutide or tirzepatide refill?',
      answer:
        "If you are on a monthly supply then after your third week of injecting your medication, you will submit your order for a refill. If you are on a quarterly supply then after your 11th week of injecting your medication, you will submit your order for a refill. You must complete it to receive your next month's supply. You will be able to do this through this link.",
    },
    {
      question: 'Why do I need to submit a refill request?',
      answer:
        'In order to receive additional medication for a monthly or quarterly supply then a refill request will need to be submitted. A provider will review your request and provide your treatment plan.',
    },
    {
      question: 'What kind of questions will I be asked in the refill form?',
      answer:
        'Our refill process is designed for your provider to learn how your experience on the medication has been and any health concerns. Your provider will determine a treatment plan for you to ensure you’re consistently losing weight.',
    },
  ];

  return (
    <CenteredContainer>
      <Typography variant="h3">Help Center for Weight Loss Members</Typography>
      <Stack sx={{ gap: '1rem' }}>
        <Typography fontWeight="600">
          Compound Semaglutide & Tirzepatide
        </Typography>
        <Stack sx={{ gap: '0.5rem' }}>
          {semaglutideTirzepatideQuestions &&
            semaglutideTirzepatideQuestions.map((q, i) => (
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
                      <Typography variant="subtitle2" sx={{ color: '#535353' }}>
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
      <Stack sx={{ gap: '1rem' }}>
        <Typography fontWeight="600">Billing & Subscriptions</Typography>
        <Stack sx={{ gap: '0.5rem' }}>
          {billingAndSubscriptionQuestions &&
            billingAndSubscriptionQuestions.map((q, i) => (
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
                      <Typography variant="subtitle2" sx={{ color: '#535353' }}>
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
      <Stack sx={{ gap: '1rem' }}>
        <Typography fontWeight="600">Shipping and Delivery</Typography>
        <Stack sx={{ gap: '0.5rem' }}>
          {shippingAndDeliveryQuestions &&
            shippingAndDeliveryQuestions.map((q, i) => (
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
                      <Typography variant="subtitle2" sx={{ color: '#535353' }}>
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
      <Stack sx={{ gap: '1rem' }}>
        <Typography fontWeight="600">Refill Process</Typography>
        <Stack sx={{ gap: '0.5rem' }}>
          {refillProcessQuestions &&
            refillProcessQuestions.map((q, i) => (
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
                      <Typography variant="subtitle2" sx={{ color: '#535353' }}>
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
      {isMobile ? <br></br> : null}
    </CenteredContainer>
  );
};

export default MemberHelpCenter;
