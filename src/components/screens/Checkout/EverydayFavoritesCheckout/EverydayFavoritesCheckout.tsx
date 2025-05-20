import { useIsMobile } from '@/components/hooks/useIsMobile';
import { useVisitState } from '@/components/hooks/useVisit';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Image from 'next/image';
import Typography from '@mui/material/Typography';
import LoadingButton from '@/components/shared/Button/LoadingButton';
import { useState } from 'react';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import { Collapse, Icon } from '@mui/material';
import CheckoutDrawer from './components/CheckoutDrawer';
import { EditDeliveryAddress } from '@/components/shared/UpdatePatientInfo';

const EverydayFavoritesCheckout = () => {
  const isMobile = useIsMobile();
  const { medications } = useVisitState();
  const [displayContent, setDisplayContent] = useState<boolean>(false);
  const [displayDetails, setDisplayDetails] = useState<boolean>(false);
  const [displayInstructions, setDisplayInstructions] =
    useState<boolean>(false);
  const [openDrawer, setOpenDrawer] = useState<boolean>(false);
  const [page, setPage] = useState<string>('confirm');

  const handleClick = () => {
    setOpenDrawer(o => !o);
  };
  const handleClose = () => {
    setOpenDrawer(false);
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        marginBottom: isMobile ? '90px' : '',
        paddingBottom: '50px',
      }}
    >
      {page === 'confirm' && (
        <>
          <Box
            sx={{
              borderRadius: '5px',
              background: 'linear-gradient(180deg, #FEFEFE 0%, #88C29C 100%)',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <Image
              alt={medications[0].name}
              src={medications[0].image!}
              width={300}
              height={290}
              quality={100}
            />
          </Box>
          <br />
          <Stack gap="0.8rem">
            <Typography
              fontWeight={700}
              fontSize="17px!important"
              sx={{ color: '#005315' }}
            >
              Everyday Favorites
            </Typography>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.3rem',
              }}
            >
              <Typography variant="h3">{medications[0].name}</Typography>
              <Typography fontSize="1.1rem!important">{`$${medications[0].price}`}</Typography>
            </Box>
            <Typography fontSize="1rem!important" variant="h4">
              {medications[0].description}
            </Typography>
            <hr
              style={{
                borderTop: '0.5px solid #D6D6D6',
                width: '98%',
                position: 'relative',
                bottom: '6px',
              }}
            />
            <Box
              display="flex"
              justifyContent="space-between"
              sx={{ cursor: 'pointer' }}
              onClick={() => setDisplayContent(display => !display)}
            >
              <Typography
                fontWeight={700}
                fontSize="17px!important"
                sx={{ color: '#005315' }}
              >
                {"Why you'll love it"}
              </Typography>
              <Icon>
                {displayContent ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
              </Icon>
            </Box>
            {medications?.[0]?.loveIt?.map((content: any, idx: number) => (
              <Collapse
                in={displayContent}
                timeout="auto"
                unmountOnExit
                key={idx}
              >
                <Box
                  key={idx}
                  display="flex"
                  flexDirection="column"
                  sx={{ gap: '0.6rem' }}
                >
                  <Typography fontWeight={600}>
                    {Object.keys(content)}
                  </Typography>
                  <Typography variant="h4">{Object.values(content)}</Typography>
                </Box>
              </Collapse>
            ))}
            <hr
              style={{
                borderTop: '0.5px solid #D6D6D6',
                width: '98%',
                position: 'relative',
                bottom: '6px',
              }}
            />
            <Box
              display="flex"
              justifyContent="space-between"
              sx={{ cursor: 'pointer' }}
              onClick={() => setDisplayDetails(display => !display)}
            >
              <Typography
                fontWeight={700}
                fontSize="17px!important"
                sx={{ color: '#005315' }}
              >
                {'Product details'}
              </Typography>
              <Icon>
                {displayDetails ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
              </Icon>
            </Box>

            {medications?.[0]?.details?.map((content, idx) => (
              <Collapse
                in={displayDetails}
                timeout="auto"
                unmountOnExit
                key={idx}
              >
                <Box>
                  <ul style={{ margin: '1px 0 1px 0' }}>
                    <li>
                      <Typography variant="h4">{content}</Typography>
                    </li>
                  </ul>
                </Box>
              </Collapse>
            ))}
            <hr
              style={{
                borderTop: '0.5px solid #D6D6D6',
                width: '98%',
                position: 'relative',
                bottom: '6px',
              }}
            />
            <Box
              display="flex"
              justifyContent="space-between"
              sx={{ cursor: 'pointer' }}
              onClick={() => setDisplayInstructions(display => !display)}
            >
              <Typography
                fontWeight={700}
                fontSize="17px!important"
                sx={{ color: '#005315' }}
              >
                {'How it works'}
              </Typography>
              <Icon>
                {displayInstructions ? (
                  <KeyboardArrowUp />
                ) : (
                  <KeyboardArrowDown />
                )}
              </Icon>
            </Box>
            <Collapse in={displayInstructions} timeout="auto" unmountOnExit>
              <Box display="flex" flexDirection="column" sx={{ gap: '0.7rem' }}>
                <Typography fontSize="1rem!important" fontWeight="700">
                  {Object.keys(medications?.[0]?.instructions)}
                </Typography>
                <Typography variant="h4">
                  {Object.values(medications?.[0]?.instructions)}
                </Typography>
              </Box>
            </Collapse>
            <LoadingButton
              fullWidth
              onClick={handleClick}
              sx={{ marginTop: '20px' }}
            >
              Buy Now
            </LoadingButton>
          </Stack>
          <CheckoutDrawer
            open={openDrawer}
            onClose={handleClose}
            medication={medications[0]}
            setPage={setPage}
            page={page}
          />
          {isMobile ? <br /> : null}
        </>
      )}
      {page === 'delivery-address' && (
        <>
          <EditDeliveryAddress goHome={() => setPage('confirm')} />
        </>
      )}
    </Container>
  );
};

export default EverydayFavoritesCheckout;
