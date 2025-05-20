import { Typography, Radio, Button } from '@mui/material';
import { Box } from '@mui/system';
import ListItems from './ListItems';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLanguage } from '@/components/hooks/data';
import { CompoundDetailProps } from '../WeightLossTreatment';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import DOMPurify from 'dompurify';
import { useSelector } from '@/components/hooks/useSelector';
import { useIntakeState } from '@/components/hooks/useIntake';
import getConfig from '../../../../../../../config';

interface WeightLossOptions7861Var2Props {
  videoUrl?: string;
  checked: string;
  compoundDetails: CompoundDetailProps;
  handleChange: (value: string) => void;
  handleConfirmQuantity: () => Promise<void>;
}

const WeightLossOptions7861Var2 = ({
  videoUrl,
  checked,
  compoundDetails,
  handleChange,
  handleConfirmQuantity,
}: WeightLossOptions7861Var2Props) => {
  const [learnMore, setLearnMore] = useState<boolean>(false);
  const [learnSingleMore, setLearnSingleMore] = useState<boolean>(false);
  const [learnMoreSixMonth, setLearnMoreSixMonth] = useState<boolean>(false);
  const [learnMoreTwelveMonth, setLearnMoreTwelveMonth] =
    useState<boolean>(false);
  const searchParams = useSearchParams();
  const review = searchParams?.get('review');
  const quantity = searchParams?.get('quantity');
  const medicationSelected = searchParams?.get('med') ?? '';
  const language = useLanguage();
  const [showVideo, setShowVideo] = useState(false);
  const { potentialInsurance } = useIntakeState();
  const [seeMore, setSeeMore] = useState<boolean>(false);

  const siteName = getConfig(
    process.env.NEXT_PUBLIC_VERCEL_URL ?? 'app.getzealthy.com'
  ).name;

  //currently these 3 will only ever be true if it is a variant user in test 4601.
  const hasWeightLoss3Month = useSelector(store => store.coaching).find(
    c => c.name === 'Zealthy 3-Month Weight Loss'
  );
  const hasWeightLoss6Month = useSelector(store => store.coaching).find(
    c => c.name === 'Zealthy 6-Month Weight Loss'
  );
  const hasWeightLoss12Month = useSelector(store => store.coaching).find(
    c => c.name === 'Zealthy 12-Month Weight Loss'
  );

  useEffect(() => {
    if (checked.length) setShowVideo(true);
  }, [checked, compoundDetails, medicationSelected]);

  let averageWeightLossText = medicationSelected
    ?.toLowerCase()
    ?.includes('semaglutide')
    ? `On average, people lose 2% of their weight after 1 month on Semaglutide**`
    : `On average, people lose 3% of their weight after 1 month on Tirzepatide**`;

  let threeMonthAverageWeightLossText = medicationSelected
    ?.toLowerCase()
    ?.includes('semaglutide')
    ? `On average, people lose 7% of their weight in their first 3 months of Semaglutide**`
    : `On average, people lose 8% of their weight in their first 3 months of Tirzepatide**`;

  let instructionsText = 'Instructions:';
  let injectionInstructionsText =
    'Injection instructions and video will be in your Zealthy home page once prescribed:';
  let quantitySelectionTitle =
    "Tell us how much medication you'd like to receive.";
  let quantitySelectionSubtitle = `For a limited time, Zealthy is offering a 20% discount on your medication ${
    potentialInsurance !== 'OH' &&
    !(hasWeightLoss12Month || hasWeightLoss3Month || hasWeightLoss6Month)
      ? 'and the next 2 months of your membership'
      : ''
  } if you purchase a 3 month supply.`;
  let limitedTimeText = '';
  if (medicationSelected !== null) {
    limitedTimeText =
      language === 'esp'
        ? `Por tiempo limitado ahorre $${compoundDetails?.[medicationSelected]?.saving}`
        : `For a limited time save $${compoundDetails?.[medicationSelected]?.saving}`;
  }
  let learnMoreText = 'Learn more';
  let viewLessText = 'View less';
  let continueText = 'Continue';
  let videoText = `Want to learn more about semaglutide and tirzepatide at ${siteName} from our Medical Director? Watch this video.`;

  if (language === 'esp') {
    videoText = `¿Quieres aprender más sobre semaglutida y tirzepatida en ${siteName} de parte de nuestro Director Médico? Mira este video.`;
    averageWeightLossText = medicationSelected
      ?.toLowerCase()
      ?.includes('semaglutide')
      ? `En promedio, las personas pierden 2% de su peso después de 1 mes con Semaglutida**`
      : `En promedio, las personas pierden 2% de su peso después de 1 mes con Tirzepatida**`;

    instructionsText = 'Instrucciones:';
    injectionInstructionsText =
      'Las instrucciones de inyección y el video estarán en su página de inicio de Zealthy una vez recetado:';
    quantitySelectionTitle = 'Díganos cuánto medicamento le gustaría recibir.';
    quantitySelectionSubtitle = `Por tiempo limitado, Zealthy está ofreciendo un 20% de descuento en su medicamento ${
      potentialInsurance !== 'OH' &&
      !(hasWeightLoss12Month || hasWeightLoss3Month || hasWeightLoss6Month)
        ? 'y los próximos 2 meses de su membresía'
        : ''
    } si compra un suministro de 3 meses.`;
    if (medicationSelected !== null) {
      limitedTimeText = `Por tiempo limitado ahorre $${compoundDetails?.[medicationSelected]?.saving}`;
    }
    learnMoreText = 'Aprender más';
    viewLessText = 'Ver menos';
    continueText = 'Continuar';
  }

  return (
    <>
      {medicationSelected && !review && quantity && (
        <Box>
          <Typography variant="h2" sx={{ marginBottom: '1rem' }}>
            {quantitySelectionTitle}
          </Typography>
          <Typography variant="subtitle1" sx={{ marginBottom: '3rem' }}>
            For a limited time, Zealthy is offering a discount on your
            medication + membership for longer term supplies.
          </Typography>
          <Typography variant="subtitle1" sx={{ marginBottom: '1rem' }}>
            {medicationSelected === 'Semaglutide'
              ? 'Semaglutide is the active ingredient in Wegovy and Ozempic.'
              : 'Tirzepatide is the active ingredient in Zepbound and Mounjaro.'}
          </Typography>
          {checked === 'single' || checked === 'bulk' ? (
            <Typography variant="subtitle1" sx={{ marginBottom: '3rem' }}>
              {videoText}
            </Typography>
          ) : null}
          {showVideo && (
            <Box sx={{ marginY: '1rem' }}>
              <video
                width="100%"
                controls
                style={{ borderRadius: '10px' }}
                poster={
                  'https://api.getzealthy.com/storage/v1/object/public/images/programs/thumbnail.png'
                }
              >
                <source src={videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </Box>
          )}
          {/** ************************************************************************************ */}
          {/** 6 Month Option */}
          {compoundDetails?.[medicationSelected].medSixMonthData && (
            <Box
              sx={{
                padding: '1.5rem',
                borderRadius: '1rem',
                background: '#ffffff',
                boxShadow: '0px 8px 16px 4px rgba(81, 76, 40, 0.08)',
                display: 'flex',
                flexDirection: 'column',
                marginBottom: '1rem',
                gap: '1.5rem',
                cursor: 'pointer',
              }}
              onClick={() => handleChange('six-month')}
            >
              {compoundDetails?.[medicationSelected].medData.price! * 6 +
                675 -
                (compoundDetails?.[medicationSelected].medSixMonthData?.price! +
                  540) >
                0 && (
                <Box
                  sx={{
                    borderRadius: '0.75rem',
                    background: '#F7F9A5',
                    display: 'flex',
                    width: 'fit-content',
                    height: '3.25rem',
                    padding: '1rem 1.25rem',
                    justifyContent: 'center',
                    alignItems: 'flex-start',
                    alignSelf: 'center',
                    fontWeight: 600,
                  }}
                >
                  {language === 'esp'
                    ? `Por tiempo limitado ahorre $${
                        compoundDetails?.[medicationSelected].medData.price! *
                          6 +
                        675 -
                        (compoundDetails?.[medicationSelected].medSixMonthData
                          ?.price! +
                          540)
                      }`
                    : `For a limited time save $${
                        compoundDetails?.[medicationSelected].medData.price! *
                          6 +
                        675 -
                        (compoundDetails?.[medicationSelected].medSixMonthData
                          ?.price! +
                          540)
                      }`}
                </Box>
              )}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  height: '100%',
                }}
              >
                <Radio
                  value={checked}
                  checked={checked === 'six-month'}
                  inputProps={{
                    'aria-label': 'controlled',
                    height: '100%',
                  }}
                />
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box>
                    <Typography variant="h3" fontWeight="600" mb="0.3rem">
                      {`${Math.round(
                        (1 -
                          compoundDetails?.[medicationSelected]?.medSixMonthData
                            ?.discounted_price! /
                            compoundDetails?.[medicationSelected]?.medData
                              .price!) *
                          100
                      )}% off on a 6 month supply of medication`}
                    </Typography>

                    <Typography variant="body1" mb={'0.2rem'}>
                      {`${
                        compoundDetails?.[medicationSelected]?.name
                      } ${compoundDetails?.[
                        medicationSelected
                      ]?.medSixMonthData?.dosage?.replace('mgs', 'mg')}`}
                    </Typography>
                    <Typography
                      fontWeight={700}
                      textAlign="center"
                      sx={{
                        marginBottom: '1rem',
                        fontStyle: 'italic',
                        textAlign: 'left',
                      }}
                    >
                      {medicationSelected === 'Tirzepatide'
                        ? 'On average, people lose 14% of their weight in their first 6 months with tirzepatide**'
                        : 'On average, people lose 10.9% of their weight in their first 6 months with semaglutide**'}
                    </Typography>
                  </Box>
                  <Typography
                    variant="body1"
                    mb="1rem"
                    fontSize="1rem !important"
                  >
                    {compoundDetails?.[medicationSelected]?.medData.price! >
                      compoundDetails?.[medicationSelected]?.medSixMonthData
                        ?.discounted_price! && (
                      <Typography
                        component="span"
                        variant="body1"
                        fontSize="1rem !important"
                        sx={{
                          textDecoration: 'line-through',
                          marginRight: '0.2rem',
                          width: '20px',
                        }}
                      >
                        {language === 'esp'
                          ? `$${compoundDetails?.[medicationSelected]?.medData.price}/mes`
                          : `$${compoundDetails?.[medicationSelected]?.medData.price}/month`}
                      </Typography>
                    )}
                    {language === 'esp'
                      ? `$${Math.floor(
                          compoundDetails?.[medicationSelected]?.medSixMonthData
                            ?.discounted_price || 0
                        )}/mes para ${
                          compoundDetails?.[medicationSelected]?.name
                        } (suministro de 6 meses)`
                      : `$${Math.floor(
                          compoundDetails?.[medicationSelected]?.medSixMonthData
                            ?.discounted_price || 0
                        )}/month for ${
                          compoundDetails?.[medicationSelected]?.name
                        } (6 month supply)`}
                  </Typography>

                  {learnMoreSixMonth ? (
                    <>
                      <Typography
                        variant="body1"
                        mb={'1rem'}
                        fontSize="0.75rem !important"
                      >
                        {
                          "You'll get 22% off the next 5 months of your weight loss membership. This means your next 5 months of membership will be just $105/month."
                        }
                      </Typography>
                      <Typography
                        variant="body1"
                        fontSize="0.75rem !important"
                        mb="1rem"
                      >
                        {
                          'In order to receive a 6 month supply of your medication, you will need to pay for your next 5 months of your membership because your Zealthy provider will need to be able to monitor your care over the next 6 months at least.'
                        }
                      </Typography>
                      <ListItems
                        dosage={`${compoundDetails?.[medicationSelected]?.name} ${compoundDetails?.[medicationSelected]?.medSixMonthData?.dosage}`}
                        isOral={medicationSelected === 'Oral Semaglutide'}
                      />
                      <Typography
                        variant="body1"
                        fontSize="0.75rem !important"
                        mb="1rem"
                      >
                        {medicationSelected === 'Oral Semaglutide'
                          ? 'Instructions:'
                          : `Injection instructions and video will be in your
                      Zealthy home page once prescribed:`}
                      </Typography>
                      <Typography
                        component="div"
                        variant="body1"
                        fontSize="0.75rem !important"
                        mb="1rem"
                        sx={{
                          '.subtitle': {
                            color: '#989898',
                            fontFamily: 'Inter',
                            fontSize: '0.625rem',
                            fontStyle: 'normal',
                            fontWeight: '700',
                            lineHeight: '1.25rem',
                            letterSpacing: '-0.00375rem',
                            marginBottom: '3px',
                          },
                          '>p': {
                            marginTop: 0,
                            marginBottom: '3px',
                          },
                        }}
                        dangerouslySetInnerHTML={{
                          __html: DOMPurify.sanitize(
                            String(
                              compoundDetails?.[
                                medicationSelected
                              ]?.medSixMonthData?.dose?.replace(
                                '---BREAK---',
                                ''
                              )
                            )
                          ),
                        }}
                      />

                      <Typography
                        fontSize="0.75rem !important"
                        fontStyle="italic"
                        mb="1rem"
                      >
                        {medicationSelected
                          .toLowerCase()
                          ?.includes('semaglutide')
                          ? language === 'esp'
                            ? `**Esto se basa en datos de un estudio de 2022 publicado por la Asociación Médica Americana titulado "Resultados de pérdida de peso asociados con el tratamiento con semaglutida para pacientes con sobrepeso u obesidad."`
                            : `**This is based on data from a 2022 study published in the American Medical Association titled “Weight Loss Outcomes Associated With Semaglutide Treatment for Patients with Overweight or Obesity.”`
                          : language === 'esp'
                          ? `**Esto se basa en datos de un estudio de 2022 publicado en el New England Journal of Medicine titulado "Tirzepatida una vez por semana para el tratamiento de la obesidad."`
                          : `**This is based on data from a 2022 study published in the New England Journal of Medicine titled “Tirzepatide Once Weekly for the Treatment of Obesity.”`}
                      </Typography>
                    </>
                  ) : null}
                  <Button
                    color="grey"
                    fullWidth
                    onClick={e => {
                      e.stopPropagation();
                      setLearnMoreSixMonth(more => !more);
                    }}
                  >
                    {learnMoreSixMonth ? viewLessText : learnMoreText}
                    {learnMoreSixMonth ? (
                      <KeyboardArrowUpIcon />
                    ) : (
                      <KeyboardArrowDownIcon />
                    )}
                  </Button>
                </Box>
              </Box>
            </Box>
          )}

          <Button
            color="grey"
            fullWidth
            sx={{ marginBottom: '16px' }}
            onClick={() => setSeeMore(more => !more)}
          >
            {seeMore ? 'See less' : 'View more'}
            {seeMore ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </Button>

          {/** 12 Month Option */}
          {seeMore &&
            compoundDetails?.[medicationSelected].medTwelveMonthData && (
              <Box
                sx={{
                  padding: '1.5rem',
                  borderRadius: '1rem',
                  background: '#ffffff',
                  boxShadow: '0px 8px 16px 4px rgba(81, 76, 40, 0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  marginBottom: '1rem',
                  gap: '1.5rem',
                  cursor: 'pointer',
                }}
                onClick={() => handleChange('twelve-month')}
              >
                {compoundDetails?.[medicationSelected].medData.price! * 12 +
                  1485 -
                  (compoundDetails?.[medicationSelected].medTwelveMonthData
                    ?.price! +
                    1089) >
                  0 && (
                  <Box
                    sx={{
                      borderRadius: '0.75rem',
                      background: '#F7F9A5',
                      display: 'flex',
                      width: 'fit-content',
                      height: '3.25rem',
                      padding: '1rem 1.25rem',
                      justifyContent: 'center',
                      alignItems: 'flex-start',
                      alignSelf: 'center',
                      fontWeight: 600,
                    }}
                  >
                    {language === 'esp'
                      ? `Por tiempo limitado ahorre $${
                          compoundDetails?.[medicationSelected].medData.price! *
                            12 +
                          1485 -
                          (compoundDetails?.[medicationSelected]
                            .medTwelveMonthData?.price! +
                            1089)
                        }`
                      : `For a limited time save $${
                          compoundDetails?.[medicationSelected].medData.price! *
                            12 +
                          1485 -
                          (compoundDetails?.[medicationSelected]
                            .medTwelveMonthData?.price! +
                            1089)
                        }`}
                  </Box>
                )}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    height: '100%',
                  }}
                >
                  <Radio
                    value={checked}
                    checked={checked === 'twelve-month'}
                    inputProps={{
                      'aria-label': 'controlled',
                      height: '100%',
                    }}
                  />
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Box>
                      <Typography variant="h3" fontWeight="600" mb="0.3rem">
                        {`${Math.round(
                          (1 -
                            compoundDetails?.[medicationSelected]
                              ?.medTwelveMonthData?.discounted_price! /
                              compoundDetails?.[medicationSelected]?.medData
                                .price!) *
                            100
                        )}% off on a 12 month supply of medication`}
                      </Typography>

                      <Typography variant="body1" mb={'0.2rem'}>
                        {`${
                          compoundDetails?.[medicationSelected]?.name
                        } ${compoundDetails?.[
                          medicationSelected
                        ]?.medTwelveMonthData?.dosage?.replace('mgs', 'mg')}`}
                      </Typography>
                      <Typography
                        fontWeight={700}
                        textAlign="center"
                        sx={{
                          marginBottom: '1rem',
                          fontStyle: 'italic',
                          textAlign: 'left',
                        }}
                      >
                        {medicationSelected === 'Tirzepatide'
                          ? 'On average, people lose 20% of their weight in their first year with tirzepatide**'
                          : 'On average, people lose 14.9% of their weight in their first year with semaglutide**'}
                      </Typography>
                    </Box>
                    <Typography
                      variant="body1"
                      mb="1rem"
                      fontSize="1rem !important"
                    >
                      {compoundDetails?.[medicationSelected]?.medData.price! >
                        compoundDetails?.[medicationSelected]
                          ?.medTwelveMonthData?.discounted_price! && (
                        <Typography
                          component="span"
                          variant="body1"
                          fontSize="1rem !important"
                          sx={{
                            textDecoration: 'line-through',
                            marginRight: '0.2rem',
                            width: '20px',
                          }}
                        >
                          {language === 'esp'
                            ? `$${compoundDetails?.[medicationSelected]?.medData.price}/mes`
                            : `$${compoundDetails?.[medicationSelected]?.medData.price}/month`}
                        </Typography>
                      )}
                      {language === 'esp'
                        ? `$${Math.floor(
                            compoundDetails?.[medicationSelected]
                              ?.medTwelveMonthData?.discounted_price || 0
                          )}/mes para ${
                            compoundDetails?.[medicationSelected]?.name
                          } (suministro de 12 meses)`
                        : `$${Math.floor(
                            compoundDetails?.[medicationSelected]
                              ?.medTwelveMonthData?.discounted_price || 0
                          )}/month for ${
                            compoundDetails?.[medicationSelected]?.name
                          } (12 month supply)`}
                    </Typography>

                    {learnMoreTwelveMonth ? (
                      <>
                        <Typography
                          variant="body1"
                          mb={'1rem'}
                          fontSize="0.75rem !important"
                        >
                          {
                            "You'll get 27% off the next 11 months of your weight loss membership. This means your next 11 months of membership will be just $99/month."
                          }
                        </Typography>
                        <Typography
                          variant="body1"
                          fontSize="0.75rem !important"
                          mb="1rem"
                        >
                          {
                            'In order to receive a year supply of your medication, you will need to pay for your next 11 months of your membership because your Zealthy provider will need to be able to monitor your care over the next 12 months at least.'
                          }
                        </Typography>
                        <ListItems
                          dosage={`${compoundDetails?.[medicationSelected]?.name} ${compoundDetails?.[medicationSelected]?.medTwelveMonthData?.dosage}`}
                          isOral={medicationSelected === 'Oral Semaglutide'}
                        />
                        <Typography
                          variant="body1"
                          fontSize="0.75rem !important"
                          mb="1rem"
                        >
                          {medicationSelected === 'Oral Semaglutide'
                            ? 'Instructions:'
                            : `Injection instructions and video will be in your
                      Zealthy home page once prescribed:`}
                        </Typography>
                        <Typography
                          component="div"
                          variant="body1"
                          fontSize="0.75rem !important"
                          mb="1rem"
                          sx={{
                            '.subtitle': {
                              color: '#989898',
                              fontFamily: 'Inter',
                              fontSize: '0.625rem',
                              fontStyle: 'normal',
                              fontWeight: '700',
                              lineHeight: '1.25rem',
                              letterSpacing: '-0.00375rem',
                              marginBottom: '3px',
                            },
                            '>p': {
                              marginTop: 0,
                              marginBottom: '3px',
                            },
                          }}
                          dangerouslySetInnerHTML={{
                            __html: DOMPurify.sanitize(
                              String(
                                compoundDetails?.[
                                  medicationSelected
                                ]?.medTwelveMonthData?.dose?.replace(
                                  '---BREAK---',
                                  ''
                                )
                              )
                            ),
                          }}
                        />

                        <Typography
                          fontSize="0.75rem !important"
                          fontStyle="italic"
                          mb="1rem"
                        >
                          {medicationSelected
                            .toLowerCase()
                            ?.includes('semaglutide')
                            ? language === 'esp'
                              ? `**Esto se basa en datos de un estudio de 2022 publicado por la Asociación Médica Americana titulado "Resultados de pérdida de peso asociados con el tratamiento con semaglutida para pacientes con sobrepeso u obesidad."`
                              : `**This is based on data from a 2022 study published in the American Medical Association titled “Weight Loss Outcomes Associated With Semaglutide Treatment for Patients with Overweight or Obesity.”`
                            : language === 'esp'
                            ? `**Esto se basa en datos de un estudio de 2022 publicado en el New England Journal of Medicine titulado "Tirzepatida una vez por semana para el tratamiento de la obesidad."`
                            : `**This is based on data from a 2022 study published in the New England Journal of Medicine titled “Tirzepatide Once Weekly for the Treatment of Obesity.”`}
                        </Typography>
                      </>
                    ) : null}
                    <Button
                      color="grey"
                      fullWidth
                      onClick={e => {
                        e.stopPropagation();
                        setLearnMoreTwelveMonth(more => !more);
                      }}
                    >
                      {learnMoreTwelveMonth ? viewLessText : learnMoreText}
                      {learnMoreTwelveMonth ? (
                        <KeyboardArrowUpIcon />
                      ) : (
                        <KeyboardArrowDownIcon />
                      )}
                    </Button>
                  </Box>
                </Box>
              </Box>
            )}

          {seeMore && (
            <Box
              sx={{
                padding: '1.5rem',
                borderRadius: '1rem',
                background: '#ffffff',
                boxShadow: '0px 8px 16px 4px rgba(81, 76, 40, 0.08)',
                display: 'flex',
                flexDirection: 'column',
                marginBottom: '1rem',
                gap: '1.5rem',
                cursor: 'pointer',
              }}
              onClick={() => handleChange('bulk')}
            >
              {compoundDetails?.[medicationSelected]?.saving! > 0 && (
                <Box
                  sx={{
                    borderRadius: '0.75rem',
                    background: '#F7F9A5',
                    display: 'flex',
                    width: 'fit-content',
                    height: '3.25rem',
                    padding: '1rem 1.25rem',
                    justifyContent: 'center',
                    alignItems: 'flex-start',
                    alignSelf: 'center',
                    fontWeight: 600,
                  }}
                >
                  {language === 'esp'
                    ? `Por tiempo limitado ahorre $${compoundDetails?.[medicationSelected]?.saving}`
                    : `For a limited time save $${compoundDetails?.[medicationSelected]?.saving}`}
                </Box>
              )}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  height: '100%',
                }}
              >
                <Radio
                  value={checked}
                  checked={checked === 'bulk'}
                  inputProps={{
                    'aria-label': 'controlled',
                    height: '100%',
                  }}
                />
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box>
                    <Typography variant="h3" fontWeight="600" mb="0.3rem">
                      {compoundDetails?.[medicationSelected]?.title}
                    </Typography>

                    <Typography variant="body1" mb={'0.2rem'}>
                      {`${
                        compoundDetails?.[medicationSelected]?.name
                      } ${compoundDetails?.[
                        medicationSelected
                      ]?.medBulkData.dosage?.replace('mgs', 'mg')}`}
                    </Typography>
                    <Typography
                      fontWeight={700}
                      textAlign="center"
                      sx={{
                        marginBottom: '1rem',
                        fontStyle: 'italic',
                        textAlign: 'left',
                      }}
                    >
                      {threeMonthAverageWeightLossText}
                    </Typography>
                  </Box>
                  <Typography
                    variant="body1"
                    mb="1rem"
                    fontSize="1rem !important"
                  >
                    {compoundDetails?.[medicationSelected]?.medData.price! >
                      compoundDetails?.[medicationSelected]?.medBulkData
                        ?.discounted_price! && (
                      <Typography
                        component="span"
                        variant="body1"
                        fontSize="1rem !important"
                        sx={{
                          textDecoration: 'line-through',
                          marginRight: '0.2rem',
                          width: '20px',
                        }}
                      >
                        {language === 'esp'
                          ? `$${compoundDetails?.[medicationSelected]?.medData.price}/mes`
                          : `$${compoundDetails?.[medicationSelected]?.medData.price}/month`}
                      </Typography>
                    )}
                    {language === 'esp'
                      ? `$${Math.floor(
                          compoundDetails?.[medicationSelected]?.medBulkData
                            ?.discounted_price || 0
                        )}/mes para ${
                          compoundDetails?.[medicationSelected]?.name
                        } (suministro de 3 meses)`
                      : `$${Math.floor(
                          compoundDetails?.[medicationSelected]?.medBulkData
                            ?.discounted_price || 0
                        )}/month for ${
                          compoundDetails?.[medicationSelected]?.name
                        } (3 month supply)`}
                  </Typography>

                  {learnMore ? (
                    <>
                      <Typography
                        variant="body1"
                        mb={'1rem'}
                        fontSize="0.75rem !important"
                      >
                        {compoundDetails?.[medicationSelected]?.body1}
                      </Typography>
                      <Typography
                        variant="body1"
                        fontSize="0.75rem !important"
                        mb="1rem"
                      >
                        {compoundDetails?.[medicationSelected]?.body2}
                      </Typography>
                      <ListItems
                        dosage={`${compoundDetails?.[medicationSelected]?.name} ${compoundDetails?.[medicationSelected]?.medBulkData.dosage}`}
                        isOral={medicationSelected === 'Oral Semaglutide'}
                      />
                      <Typography
                        variant="body1"
                        fontSize="0.75rem !important"
                        mb="1rem"
                      >
                        {medicationSelected === 'Oral Semaglutide'
                          ? 'Instructions:'
                          : `Injection instructions and video will be in your
                      Zealthy home page once prescribed:`}
                      </Typography>
                      <Typography
                        component="div"
                        variant="body1"
                        fontSize="0.75rem !important"
                        mb="1rem"
                        sx={{
                          '.subtitle': {
                            color: '#989898',
                            fontFamily: 'Inter',
                            fontSize: '0.625rem',
                            fontStyle: 'normal',
                            fontWeight: '700',
                            lineHeight: '1.25rem',
                            letterSpacing: '-0.00375rem',
                            marginBottom: '3px',
                          },
                          '>p': {
                            marginTop: 0,
                            marginBottom: '3px',
                          },
                        }}
                        dangerouslySetInnerHTML={{
                          __html: DOMPurify.sanitize(
                            String(
                              compoundDetails?.[medicationSelected]?.medBulkData
                                ?.dose
                            )
                          ),
                        }}
                      />

                      <Typography
                        fontSize="0.75rem !important"
                        fontStyle="italic"
                        mb="1rem"
                      >
                        {medicationSelected
                          .toLowerCase()
                          ?.includes('semaglutide')
                          ? language === 'esp'
                            ? `**Esto se basa en datos de un estudio de 2022 publicado por la Asociación Médica Americana titulado "Resultados de pérdida de peso asociados con el tratamiento con semaglutida para pacientes con sobrepeso u obesidad."`
                            : `**This is based on data from a 2022 study published in the American Medical Association titled “Weight Loss Outcomes Associated With Semaglutide Treatment for Patients with Overweight or Obesity.”`
                          : language === 'esp'
                          ? `**Esto se basa en datos de un estudio de 2022 publicado en el New England Journal of Medicine titulado "Tirzepatida una vez por semana para el tratamiento de la obesidad."`
                          : `**This is based on data from a 2022 study published in the New England Journal of Medicine titled “Tirzepatide Once Weekly for the Treatment of Obesity.”`}
                      </Typography>
                    </>
                  ) : null}
                  <Button
                    color="grey"
                    fullWidth
                    onClick={e => {
                      e.stopPropagation();
                      setLearnMore(more => !more);
                    }}
                  >
                    {learnMore ? viewLessText : learnMoreText}
                    {learnMore ? (
                      <KeyboardArrowUpIcon />
                    ) : (
                      <KeyboardArrowDownIcon />
                    )}
                  </Button>
                </Box>
              </Box>
            </Box>
          )}
          {seeMore && (
            <Box
              sx={{
                padding: '1.5rem',
                borderRadius: '1rem',
                background: '#ffffff',
                boxShadow: '0px 8px 16px 4px rgba(81, 76, 40, 0.08)',
                display: 'flex',
                flexDirection: 'column',
                marginBottom: '3rem',
                gap: '1.5rem',
                cursor: 'pointer',
              }}
              onClick={() => handleChange('single')}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                }}
              >
                <Radio
                  value={checked}
                  checked={checked === 'single'}
                  inputProps={{ 'aria-label': 'controlled' }}
                />
                <Box
                  sx={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box>
                    <Typography variant="h3" fontWeight="600" mb="0.3rem">
                      {compoundDetails?.[medicationSelected]?.singleTitle}
                    </Typography>
                    <Typography variant="body1" mb={'0.2rem'}>
                      {`${
                        compoundDetails?.[medicationSelected]?.name
                      } ${compoundDetails?.[
                        medicationSelected
                      ]?.medData.dosage?.replace('mgs', 'mg')}`}
                    </Typography>
                    {/*<Typography variant="body1" mb={'0.2rem'}>*/}
                    {/*  {`${*/}
                    {/*    compoundDetails?.[medicationSelected]?.name*/}
                    {/*  } ${compoundDetails?.[*/}
                    {/*    medicationSelected*/}
                    {/*  ]?.medData.dosage?.replace('mgs', 'mg')}`}*/}
                    {/*</Typography>*/}
                  </Box>

                  <Typography
                    variant="body1"
                    fontWeight={700}
                    mb="1rem"
                    sx={{ fontStyle: 'italic' }}
                  >
                    {averageWeightLossText}
                  </Typography>

                  <Typography
                    variant="body1"
                    mb="1rem"
                    fontSize="1rem !important"
                  >
                    {compoundDetails?.[medicationSelected]?.singleDescription}
                  </Typography>
                  {learnSingleMore ? (
                    <>
                      <ListItems
                        dosage={`${
                          compoundDetails?.[medicationSelected]?.name
                        } ${compoundDetails?.[
                          medicationSelected
                        ]?.medData.dosage.replace('mgs', 'mg')}`}
                        isOral={medicationSelected === 'Oral Semaglutide'}
                      />
                      <Typography
                        variant="body1"
                        fontSize="0.75rem !important"
                        mb="1rem"
                      >
                        {medicationSelected === 'Oral Semaglutide'
                          ? instructionsText
                          : injectionInstructionsText}
                      </Typography>
                      <Typography
                        component="div"
                        variant="body1"
                        fontSize="0.75rem !important"
                        mb="1rem"
                        sx={{
                          '.subtitle': {
                            color: '#989898',
                            fontFamily: 'Inter',
                            fontSize: '0.625rem',
                            fontStyle: 'normal',
                            fontWeight: '700',
                            lineHeight: '1.25rem',
                            letterSpacing: '-0.00375rem',
                            marginBottom: '3px',
                          },
                          '>p': {
                            marginTop: 0,
                            marginBottom: '3px',
                          },
                        }}
                        dangerouslySetInnerHTML={{
                          __html: DOMPurify.sanitize(
                            String(
                              compoundDetails?.[medicationSelected]?.medData
                                ?.dose
                            )
                          ),
                        }}
                      />
                      <Typography
                        fontSize="0.75rem !important"
                        fontStyle="italic"
                        mb="1rem"
                      >
                        {medicationSelected
                          .toLowerCase()
                          ?.includes('semaglutide')
                          ? language === 'esp'
                            ? `**Esto se basa en datos de un estudio de 2022 publicado por la Asociación Médica Americana titulado "Resultados de pérdida de peso asociados con el tratamiento con semaglutida para pacientes con sobrepeso u obesidad."`
                            : `**This is based on data from a 2022 study published in the American Medical Association titled “Weight Loss Outcomes Associated With Semaglutide Treatment for Patients with Overweight or Obesity.”`
                          : language === 'esp'
                          ? `**Esto se basa en datos de un estudio de 2022 publicado en el New England Journal of Medicine titulado "Tirzepatida una vez por semana para el tratamiento de la obesidad."`
                          : `**This is based on data from a 2022 study published in the New England Journal of Medicine titled “Tirzepatide Once Weekly for the Treatment of Obesity.”`}
                      </Typography>
                    </>
                  ) : null}
                  <Button
                    color="grey"
                    fullWidth
                    onClick={e => {
                      e.stopPropagation();
                      setLearnSingleMore(more => !more);
                    }}
                  >
                    {learnSingleMore ? viewLessText : learnMoreText}
                    {learnSingleMore ? (
                      <KeyboardArrowUpIcon />
                    ) : (
                      <KeyboardArrowDownIcon />
                    )}
                  </Button>
                </Box>
              </Box>
            </Box>
          )}
          <Button
            disabled={checked.length === 0}
            fullWidth
            onClick={handleConfirmQuantity}
          >
            {continueText}
          </Button>
        </Box>
      )}
    </>
  );
};

export default WeightLossOptions7861Var2;
