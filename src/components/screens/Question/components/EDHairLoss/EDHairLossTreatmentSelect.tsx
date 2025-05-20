import React, { useState } from 'react';
import {
  Box,
  Stack,
  Typography,
  IconButton,
  Container,
  Dialog,
  DialogContent,
  Collapse,
} from '@mui/material';
import Image from 'next/image';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CloseIcon from '@mui/icons-material/Close';
import ArrowRightAlt from '@mui/icons-material/ArrowRightAlt';
import { QuestionWithName, Questionnaire } from '@/types/questionnaire';
import EDHLTreatmentDetailsInfo from 'public/images/ed-hl/ed-hl-treatment-details-info.svg';
import EDHLProductImage from 'public/images/ed-hl/ed-hl-product-image.png';
import EDHLProductImage3 from 'public/images/ed-hl/ed-hl-treatment-select-3.png';
import Tooltip from '@mui/material/Tooltip';
import { useIsMobile } from '@/components/hooks/useIsMobile';

interface EDHairLossTreatmentSelectProps {
  question: QuestionWithName;
  questionnaire: Questionnaire;
  onNext: (nextPage?: string) => void;
}

const sources = {
  '1': 'Francesco Montorsi et al., "A Randomized, Double-Blind, Placebo-Controlled, Parallel Study to Assess the Efficacy and Safety of Once-A-Day Tadalafil in Men with Erectile Dysfunction Who Are Naïve to PDE5 Inhibitors."',
  '2': 'Beach, Renée A. et al., "Low-dose oral minoxidil for treating alopecia: A 3-year North American retrospective case series" J. of the American Academy of Dermatology.',
  '3': 'Based on a meta-analysis of four randomized controlled trials that found that tadalafil daily had a lower incidence of treatment-emergent side effects relative to tadalafil on-demand after at least 24 weeks of long-term treatment.',
  '4': 'Based on survey data from a 30-week comparison study of 378 men who were prescribed daily tadalafil, on-demand tadalafil, and on-demand sildenafil (5 mg per day, 20 mg PRN, and 100 mg PRN, respectively).',
  '5': 'Based on survey data from a 30-week comparison study of 145 men who were prescribed daily and on-demand tadalafil (10 mg and 20 mg, respectively).',
  '6': 'Randolph, Michael and Antonella Tosti. "Oral minoxidil treatment for hair loss: A review of efficacy and safety." J. of the Academy of American Dermatology. (2020).',
  '7': 'Rittmaster RS. Finasteride. N Engl J Med 1994; 330:120.',
};

const listItems = [
  {
    title: 'Why Sex + Hair?',
    body: 'Reclaim your confidence with one convenient solution that combines proven ingredients to help you have better erections and keep your hair looking full.',
    imgSrc: '/images/ed-hl/ed-hl-tadalafil-works.png',
  },
  {
    title: 'Minoxidil + Finasteride',
    body: 'Tadalafil supports better sexual performance by suppressing an enzyme in the body called PDE5.\n\nWhen PDE5 is suppressed, blood is able to flow more freely through the body including to the (you guessed it) penis.\n\nMore blood flow to the penis means harder, more satisfying erections once you’re sexually stimulated.',
    imgSrc: '/images/ed-hl/ed-hl-treatment-select-1.png',
  },
  {
    title: 'Product Image 2',
    body: 'Finasteride combats hair loss by blocking a hormone called DHT, which shrinks hair follicles and makes hair fall out. Less DHT means less hair loss.\n\nMinoxidil boosts hair growth by shedding old hairs and replacing them with new ones. It also improves blood flow to your scalp, helping hair grow back thicker and stronger.',
    imgSrc: '/images/ed-hl/ed-hl-treatment-select-2.png',
  },
  {
    title: '',
    body: 'Boost your performance and regrow your hair with doctor-trusted ingredients. All it takes is just one daily pill.',
    imgSrc: '',
  },
];

type SectionKey =
  | 'Active Ingredient'
  | 'What to know'
  | 'Potential side effects'
  | 'Important Safety Information';

interface ContentDetail {
  keyText?: string;
  description: string;
  isDisclaimer?: boolean;
  supText?: string;
}

const sectionContent: Record<
  SectionKey,
  { title: string; details: ContentDetail[] }
> = {
  'Active Ingredient': {
    title: 'Active Ingredients',
    details: [
      {
        keyText: 'Tadalafil',
        description: '',
      },
      {
        keyText: '-',
        description: ' The active ingredient in Cialis®.',
      },
      {
        keyText: '-',
        description:
          ' 84% of men reported achieving an erection hard enough for sex.',
        supText: '1',
      },
      {
        keyText: 'Peppermint',
        description: '',
      },
      {
        keyText: '-',
        description: ' Minty fresh flavor.',
      },
      {
        keyText: '-',
        description: ' Gives meds a fresh, new taste.',
      },
      {
        keyText: 'Minoxidil',
        description: '',
      },
      {
        keyText: '-',
        description: ' Stimulates hair follicles.',
      },
      {
        keyText: '-',
        description: ' Shown to regrow hair.',
        supText: '2',
      },
      { keyText: 'Finasteride', description: '' },
      {
        keyText: '-',
        description: ' Prevents hair follicle shrinkage and loss.',
      },
      {
        keyText: '-',
        description: ' Shown to prevent hair loss.',
        supText: '7',
      },

      {
        description:
          '*Compounded products are not approved nor evaluated for safety or effectiveness by the FDA.\nA provider will review your responses and determine if treatment, including this option, is a good fit for you.',
        isDisclaimer: true,
      },
    ],
  },
  'What to know': {
    title: 'What to Know',
    details: [
      {
        description:
          'Tadalafil helps you have worry-free, spontaneous sex, while minoxidil aids in regrowing hair, and finasteride helps reduce hair loss.',
      },

      {
        keyText: 'When taking treatment',
        description: '',
      },
      {
        keyText: '-',
        description: ' Arousal is still necessary to get an erection.',
      },
      {
        keyText: '-',
        description:
          ' Expect a lower incidence of side effects with tadalafil.',
        supText: '3',
      },
      {
        keyText: 'Results to expect',
        description: '',
      },
      {
        keyText: '-',
        description:
          ' Men experienced increased sexual self-confidence when prescribed daily tadalafil vs as-needed ED treatments.',
        supText: '4',
      },
      {
        keyText: '-',
        description:
          ' Daily tadalafil users reported improved erections and finishing more frequently compared to those prescribed on-demand.',
        supText: '5',
      },
      {
        keyText: '-',
        description: ' Minoxidil is shown to regrow hair in 3-6 months.',
        supText: '6',
      },
      {
        keyText: '-',
        description:
          ' Finasteride is shown to prevent hair follicle shrinkage and slowing hair loss.',
      },
    ],
  },
  'Potential side effects': {
    title: 'Potential Side Effects',
    details: [
      {
        keyText: '-',
        description: ` Just like any medication, there's always a potential for side effects. However, minor side effects are normal and not a sign of anything abnormal or dangerous. Potential common and temporary side effects of tadalafil include headache, indigestion, visual changes (such as blurry or blue tinted vision), back pain, muscle aches, flushing, and stuffy or runny nose. These side effects usually go away after a few hours.`,
      },
      {
        keyText: '-',
        description: ` Oral minoxidil can cause shedding at first as new hair growth cycles begin, but this improves with continued use. Other possible side effects include increased hair growth on the face or body.`,
      },
      {
        keyText: '-',
        description: ` Oral Finasteride can cause sexual dysfunction, gynecomastia (benign proliferation of glandular tissue of the breast), and teratogenicity (increase risk for abnormal fetal development of the mаle genital tract. Impregnating another individual while taking oral fiոаѕteriԁе is not considered a risk to the fetus). Although oral finasteride therapy decreases risk for prostate cancer, the drug may increase the risk for high-grade prostate cancer lesions.`,
      },
      {
        keyText: '-',
        description: ` Your treatment includes unlimited access to your Care Team and licensed providers for any questions or adjustments.`,
      },
    ],
  },
  'Important Safety Information': {
    title: 'Important Safety Information',
    details: [
      {
        keyText: 'Sex + Hair',
        description:
          ' is a compounded product and is not FDA-approved. FDA does not verify the safety or effectiveness of compounded drugs.',
      },
      {
        keyText: 'Do not take Sex + Hair if you:',
        description: '',
      },
      {
        description:
          '• Take any medicines called nitrates, often prescribed for chest pain, or guanylate cyclase stimulators like Adempas (riociguat) for pulmonary hypertension. Your blood pressure could drop to an unsafe level.',
      },
      {
        description: '• Are pregnant or breastfeeding.',
      },
      {
        description:
          '• Use recreational drugs called “poppers” like amyl nitrate or butyl nitrate.',
      },
      {
        description:
          '• Have a history of certain types of heart, kidney or liver disease. Be sure to completely share details of any heart, kidney or liver conditions with your provider so they can determine if treatment is safe for you.',
      },
      {
        description:
          '• Have a history of a mini-stroke (TIA) or stroke (CVA). Be sure to completely share details of any previous mini-stroke or stroke with your provider so they can determine if treatment is safe for you.',
      },
      {
        description:
          '• Have uncontrolled high blood pressure or high blood pressure and taking 2 or more blood pressure medications.',
      },
      {
        description: '• Have pheochromocytoma.',
      },
      {
        description: '• Are using another product containing minoxidil.',
      },
      {
        description:
          '• Are allergic to tadalafil, minoxidil, finasteride, biotin, vitamin B12, vitamin D3, l-theanine or any of the inactive ingredients in Sex Rx + Hair Hero. Inactive ingredients include: corn starch, dextrose, maltodextrin, magnesium stearate, microcrystalline cellulose, silicon dioxide, silica, sucralose, FD&C Red #40/Allura Red AC, FD&C Blue #1/Brilliant Blue and FD&C Yellow #6/Sunset Yellow FCF.',
      },
      {
        description: '• Are younger than 18 years of age.',
      },
      {
        description:
          'Sexual dysfunction can sometimes be the sign of an underlying health condition such as cardiovascular disease or high cholesterol. Discuss your health with your doctor to ensure that you are healthy enough for sex. If you experience chest pain, dizziness, or nausea during sexual intercourse, seek immediate medical help.',
      },
      {
        keyText:
          'Sex + Hair can cause serious side effects. Rarely reported side effects include:',
        description: '',
      },
      {
        description:
          '• An erection that will not go away (priapism). If you have an erection that lasts more than 4 hours, get medical help right away. If it is not treated right away, priapism can permanently damage your penis.',
      },
      {
        description:
          '• Sudden vision loss in one or both eyes. Sudden vision loss in one or both eyes can be a sign of a serious eye problem called non-arteritic anterior ischemic optic neuropathy (NAION). Stop taking Sex Rx + Hair Hero and call your healthcare provider right away if you have any sudden vision loss.',
      },
      {
        description:
          '• Sudden hearing decrease or hearing loss. Some people may also have ringing in their ears (tinnitus) or dizziness. If you have these symptoms, stop taking Sex + Hair and contact a doctor right away.',
      },
      {
        description: '• New or worsening chest pain.',
      },
      {
        description: '• Shortness of breath.',
      },
      {
        description: '• Sudden changes to your vision or hearing.',
      },
      {
        description: '• Very severe heartburn.',
      },
      {
        keyText:
          'Before you take Sex + Hair, tell your healthcare provider if you:',
        description: '',
      },
      {
        description:
          '• Have or have had heart problems such as a heart attack, irregular heartbeat, angina, chest pain, narrowing of the aortic valve, or heart failure.',
      },
      {
        description: '• Have had heart surgery within the last 6 months.',
      },
      {
        description: '• Have pulmonary hypertension.',
      },
      {
        description: '• Have had a stroke.',
      },
      {
        description:
          '• Have low blood pressure, or high blood pressure that is not controlled.',
      },
      {
        description: '• Have a deformed penis shape.',
      },
      {
        description:
          '• Have had an erection that lasted for more than 4 hours.',
      },
      {
        description:
          '• Have problems with your blood cells such as sickle cell anemia, multiple myeloma, or leukemia.',
      },
      {
        description:
          '• Have retinitis pigmentosa, a rare genetic (runs in families) eye disease.',
      },
      {
        description:
          '• Have ever had severe vision loss, including an eye problem called non-arteritic anterior ischemic optic neuropathy NAION.',
      },
      {
        description: '• Have bleeding problems.',
      },
      {
        description: '• Have or have had stomach ulcers.',
      },
      {
        description: '• Have liver problems.',
      },
      {
        description: '• Have kidney problems or are having kidney dialysis.',
      },
      {
        description: '• Have any other medical conditions.',
      },
      {
        keyText:
          'Tell your healthcare provider about all the medicines you take, including prescription and over-the-counter medicines, vitamins, and herbal supplements. Sex + Hair may affect the way other medicines work, and other medicines may affect the way Sex + Hair works, causing side effects. Especially tell your healthcare provider if you take any of the following:',
        description: '',
      },
      {
        description:
          '• Medicines called nitrates like nitroglycerin or isosorbide.',
      },
      {
        description:
          '• Medicines called guanylate cyclase stimulators such as Adempas© (riociguat).',
      },
      {
        description:
          '• Medicines called alpha-blockers such as Hytrin© (terazosin HCl), Flomax© (tamsulosin HCl), Cardura© (doxazosin mesylate), Minipress© (prazosin HCl), Uroxatral© (alfuzosin HCl), Jalyn© (dutasteride and tamsulosin HCl), or Rapaflo© (silodosin). Alpha-blockers are sometimes prescribed for prostate problems or high blood pressure. In some patients, the use of tadalafil with alpha-blockers can lead to a drop in blood pressure or to fainting.',
      },
      {
        description:
          '• Medicines called HIV protease inhibitors, such as ritonavir (Norvir©), indinavir sulfate (Crixivan©), saquinavir (Fortovase© or Invirase©), or atazanavir sulfate (Reyataz©).',
      },
      {
        description:
          '• Some types of oral antifungal medicines, such as ketoconazole (Nizoral©) and itraconazole (Sporanox©).',
      },
      {
        description:
          '• Some types of antibiotics, such as clarithromycin (Biaxin©), telithromycin (Ketek©), or erythromycin.',
      },
      {
        description: '• Other medicines that treat hair loss.',
      },
      {
        description: '• Other medicines or treatments for sexual dysfunction.',
      },
      {
        description:
          'Tadalafil, which is the same medicine found in another drug called Adcirca©. Adcirca© is used to treat a rare disease called pulmonary arterial hypertension (PAH). Tadalafil should not be used with Adcirca or with other PAH treatments containing tadalafil or any other PDE5 inhibitors (such as Revatio© sildenafil).',
      },
      {
        keyText:
          'Sex + Hair Medication does not protect against sexually transmitted diseases, including HIV.',
        description: '',
      },
      {
        description:
          'The most common side effects of tadalafil include: headache; flushing; upset stomach; abnormal vision, such as changes in color vision (such as having a blue color tinge) and blurred vision; stuffy or runny nose; back pain; muscle pain; nausea; dizziness; rash.',
      },
      {
        description:
          'The most common side effects of minoxidil include: hypertrichosis, (increased hair growth on the face or body), lightheadedness, palpitations or tachycardia, headaches, leg swelling or fluid retention (edema), swelling around the eyes, insomnia, nausea, rash, breast tenderness or enlargement (reported in less than 1% of patients; typically resolves after the medication is stopped), sexual dysfunction.',
      },
      {
        description:
          'The most common side effects of oral finasteride include decreased libido, erectile dysfunction, and reduced semen volume during ejaculation. Some individuals may also experience breast tenderness or enlargement (gynecomastia) and, less commonly, skin rash. These side effects are generally mild and reversible after discontinuing the medication. However, in rare cases, certain sexual side effects may persist even after stopping the drug, a condition sometimes referred to as post-finasteride syndrome.',
      },
      {
        description:
          'If you experience signs or symptoms of an allergic reaction, stop taking Sex + Hair and seek medical attention immediately.',
      },
    ],
  },
};

const EDHairLossTreatmentSelect = ({
  question,
  questionnaire,
  onNext,
}: EDHairLossTreatmentSelectProps) => {
  const [expandedSection, setExpandedSection] = useState<SectionKey | null>();
  const [openModal, setOpenModal] = useState(false);
  const isMobile = useIsMobile();

  const toggleExpand = (section: SectionKey) => {
    if (section === 'Important Safety Information') {
      setOpenModal(true);
    } else {
      setExpandedSection(prevSection =>
        prevSection === section ? null : section
      );
    }
  };

  const closeModal = () => {
    setOpenModal(false);
    setExpandedSection(null);
  };

  return (
    <Container maxWidth="md" sx={{ paddingBottom: 8 }}>
      <Stack spacing={2} sx={{ textAlign: 'center', marginTop: 4 }}>
        <Typography
          variant="h3"
          fontWeight={700}
          sx={{ fontFamily: 'Inter', color: '' }}
        >
          Tadalafil + Minoxidil + Finasteride
        </Typography>
        <Typography variant="h2" sx={{ color: '#1E8658' }}>
          Sex + Hair
        </Typography>
      </Stack>

      <Box sx={{ textAlign: 'center', marginY: 4 }}>
        <Image
          src={EDHLProductImage}
          alt="Pill Image"
          height={150}
          width={150}
          layout="intrinsic"
          quality={100}
          priority
        />
        <Typography
          variant="body1"
          sx={{
            fontWeight: 'bold',
            color: '#1E8658',
            marginBottom: 2,
          }}
        >
          As low as $44/mo*
        </Typography>
        <Box
          sx={{
            backgroundColor: '#DCF2E3',
            borderRadius: 2,
            paddingBottom: 2,
          }}
        >
          <Typography
            variant="body2"
            sx={{
              padding: 1,
              marginTop: 2,
              borderRadius: 2,
            }}
          >
            Selected for you based on:
          </Typography>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              gap: isMobile ? 1 : 2,
              marginTop: 1,
            }}
          >
            <Box
              sx={{
                padding: isMobile ? '4px 8px' : '8px 16px',
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                border: '1px solid #DCF2E3',
                textAlign: 'center',
              }}
            >
              <Typography
                sx={{
                  fontWeight: isMobile ? 'normal' : 'bold',
                  color: '#1E8658',
                }}
              >
                Hair Growth
              </Typography>
            </Box>
            <Box
              sx={{
                padding: isMobile ? '4px 8px' : '8px 16px',
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                border: '1px solid #DCF2E3',
                textAlign: 'center',
              }}
            >
              <Typography
                sx={{
                  fontWeight: isMobile ? 'normal' : 'bold',
                  color: '#1E8658',
                }}
              >
                Stronger Erections
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          backgroundColor: '#F5F5F5',
          borderRadius: 4,
          padding: 4,
          marginY: 4,
          width: '100%',
          overflow: 'hidden',
        }}
      >
        <Typography
          variant="h2"
          fontWeight="bold"
          fontFamily="Gelasio"
          sx={{ marginBottom: 2 }}
        >
          Treatment Details
        </Typography>
        <Typography variant="body2" sx={{ marginBottom: 2 }}>
          Level up in the bedroom and regrow thicker, fuller hair with the
          active ingredients in this compounded, 3-in-1 pill.
        </Typography>
        <Image
          src={EDHLTreatmentDetailsInfo}
          alt="Treatment Details Info"
          style={{
            display: 'block',
            margin: 'auto',
            marginBottom: '16px',
            width: '100%',
            height: 'auto',
            objectFit: 'contain',
            objectPosition: 'center',
          }}
        />

        {(
          [
            'Active Ingredient',
            'What to know',
            'Potential side effects',
          ] as SectionKey[]
        ).map(section => (
          <Box key={section} sx={{ marginBottom: 2 }}>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              onClick={() => toggleExpand(section)}
            >
              <Typography variant="h5" fontWeight="bold">
                {section}
              </Typography>
              <IconButton>
                {expandedSection === section ? (
                  <ExpandLessIcon />
                ) : (
                  <ExpandMoreIcon />
                )}
              </IconButton>
            </Box>
            <Collapse in={expandedSection === section}>
              {sectionContent[section].details.map((detail, index) => (
                <Typography
                  key={index}
                  fontSize={detail.isDisclaimer ? '0.75rem!important' : '1rem'}
                  fontStyle={
                    detail.isDisclaimer ? 'italic!important' : 'normal'
                  }
                  m={detail.isDisclaimer ? '1rem 0!important' : ''}
                  variant="body2"
                  sx={{
                    marginBottom: 1,
                    ...(detail.isDisclaimer && {
                      whiteSpace: 'pre-line',
                      padding: '0.25rem',
                      borderRadius: '8px',
                      fontSize: '0.75rem!important',
                    }),
                  }}
                >
                  {detail.keyText && <strong>{detail.keyText}</strong>}
                  {detail.description}
                  {detail.supText && (
                    <Tooltip
                      title={sources[detail.supText as keyof typeof sources]}
                    >
                      <sup
                        style={{
                          fontSize: '0.75rem',
                          fontStyle: 'italic',
                          margin: '2',
                        }}
                      >
                        {detail.supText}
                      </sup>
                    </Tooltip>
                  )}
                </Typography>
              ))}
            </Collapse>
          </Box>
        ))}

        <Box sx={{ marginBottom: 2 }}>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            onClick={() => toggleExpand('Important Safety Information')}
          >
            <Typography variant="h5" fontWeight="bold">
              Important Safety Information
            </Typography>
            <IconButton>
              <ArrowRightAlt />
            </IconButton>
          </Box>
        </Box>

        <Dialog
          open={openModal}
          onClose={closeModal}
          fullWidth
          maxWidth="md"
          PaperProps={{
            sx: {
              padding: 4,
              backgroundColor: 'white',
              maxWidth: '8.5in',
              maxHeight: '90vh',
              height: 'auto',
              minHeight: '50vh',
              boxShadow: 24,
              overflowY: 'hidden',
            },
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              zIndex: 2,
            }}
          >
            <IconButton onClick={closeModal}>
              <CloseIcon />
            </IconButton>
          </Box>

          <DialogContent
            sx={{
              paddingTop: '40px',
              maxHeight: '75vh',
              overflowY: 'auto',
              '::-webkit-scrollbar': {
                width: '8px',
                height: '8px',
              },
              '::-webkit-scrollbar-thumb': {
                backgroundColor: '#1E8658',
                borderRadius: '8px',
              },
              '::-webkit-scrollbar-track': {
                backgroundColor: '#f5f5f5',
              },
            }}
          >
            <Typography variant="h2" fontWeight="bold" gutterBottom>
              Important Safety Information
            </Typography>

            {sectionContent['Important Safety Information'].details.map(
              (detail, index) => (
                <Typography
                  key={index}
                  fontSize={detail.isDisclaimer ? '0.75rem!important' : '1rem'}
                  fontStyle={
                    detail.isDisclaimer ? 'italic!important' : 'normal'
                  }
                  m={detail.isDisclaimer ? '1rem 0!important' : ''}
                  variant="body2"
                  sx={{
                    marginBottom: 1,
                    ...(detail.isDisclaimer && {
                      backgroundColor: '#f8f8f8',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      fontSize: '0.75rem!important',
                      border: '1px solid #d3d3d3',
                    }),
                  }}
                >
                  {detail.keyText && <strong>{detail.keyText}</strong>}
                  {detail.description}
                  {detail.supText && (
                    <Tooltip
                      title={sources[detail.supText as keyof typeof sources]}
                    >
                      <sup
                        style={{
                          fontSize: '0.75rem',
                          fontStyle: 'italic',
                          margin: '2',
                        }}
                      >
                        {detail.supText}
                      </sup>
                    </Tooltip>
                  )}
                </Typography>
              )
            )}
          </DialogContent>
        </Dialog>
      </Box>

      <Typography variant="h2" fontWeight="bold" fontFamily="Gelasio">
        Why Sex + Hair
      </Typography>

      <Stack gap={4} sx={{ marginY: 4 }}>
        {listItems.map((item, index) => (
          <Box key={index} sx={{ textAlign: 'center' }}>
            <Typography
              variant="body2"
              sx={{
                marginBottom: 4,
                textAlign: 'left',
                whiteSpace: 'pre-line',
              }}
            >
              {item.body}
            </Typography>
            <Image
              src={item.imgSrc}
              alt={item.title}
              layout="responsive"
              width={448}
              quality={100}
              priority
            />
          </Box>
        ))}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            width: '115%',
            marginTop: '-50px',
            marginBottom: '-50px',
          }}
        >
          <Image
            src={EDHLProductImage3}
            alt="EDHLProductImage3"
            layout="responsive"
            priority
            quality={100}
            style={{
              width: '100%',
              height: 'auto',
              objectFit: 'cover',
            }}
          />
        </Box>
      </Stack>
    </Container>
  );
};

export default EDHairLossTreatmentSelect;
