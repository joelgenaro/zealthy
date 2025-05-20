import { useIsMobile } from '@/components/hooks/useIsMobile';
import { Medication } from '@/context/AppContext/reducers/types/visit';
import { QuestionnaireQuestionAnswerOptions } from '@/types/questionnaire';
import { Box, Paper } from '@mui/material';
import { styled } from '@mui/system';
import DOMPurify from 'dompurify';
import Image from 'next/image';
import { useMemo } from 'react';

const Title = styled(Box)`
  display: flex;
  gap: 24px;
  width: 100%;
  font-weight: 500;
  
  .title {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: start;
    gap: 2px;
    .recommended {
      padding: 4px 12px;
      background-color: #ffe792;
      border-radius: 38px;
      font-weight: 500;
      font-size: 12px;
      line-height: 16px;
      margin-bottom: 6px;
    }

    h3 {
      font-size: 22px;
      font-weight: 400;
      line-height: 28px;
      margin: 0;
      @media (max-width: 1024px) {
        font-size: 20px; 
      }
  
   
      @media (max-width: 768px) {
        font-size: 19px; 
      }
  
      
      @media (max-width: 480px) {
        font-size: 18px; 
      }
    }

  }

    @media (max-width: 1024px) {
      font-size: 15px; 
    }

    
    @media (max-width: 768px) {
      font-size: 14px; 
    }

    
    @media (max-width: 480px) {
      font-size: 13px; 
    }
    .price {
      color: ${({ theme }) => theme.palette.primary.main};
    }
  }
  .cost {
    .cost-label {
      display: flex;
      justify-content: end;
    }
    .payment {
      color: #1b1b1b;
      font-size: 18px;
      font-weight: 700;
    }
  }
`;

const Description = styled(Box)`
  .graph {
    background: #f6f7f7;
    padding: 16px 24px;
    margin: 24px 0;

    strong {
      font-weight: 600;
    }

    .properties {
      display: flex;
      gap: 12px;
      font-size: 12px;
      line-height: 16px;
      margin-top: 8px;
      margin-bottom: 32px;
    }
  }

  p {
    margin: 0;
  }
`;

type Option = {
  label: string;
  value: Medication;
  subLabel: string;
  answer: QuestionnaireQuestionAnswerOptions;
  image: string;
  pricePerUnit: number;
  isMostPopular?: boolean;
  isBestValue?: boolean;
};

interface OptionProps {
  option: Option;
  selectedMedication: any;
  onSelect: (option: Option) => void;
}

const EnclomipheneTreatment = ({
  option,
  selectedMedication,
  onSelect,
}: OptionProps) => {
  const { label, subLabel, image, isMostPopular, isBestValue } = useMemo(
    () => ({
      ...option,
      label: DOMPurify.sanitize(option.label),
      subLabel: option.subLabel && DOMPurify.sanitize(option.subLabel),
    }),
    [option]
  );
  const isMobile = useIsMobile();

  const isSelected = selectedMedication?.price === option?.pricePerUnit;

  return (
    <Paper
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'start',
        gap: 2,
        p: isMobile ? '15px' : '20px',
        boxShadow: '0 8px 16px 4px rgba(81, 76, 40, 0.08)',
        borderRadius: 4,
        cursor: 'pointer',
        backgroundColor: isSelected ? '#B8F5CC!important' : '#FFFFFF',
        '&:hover': {
          backgroundColor: isSelected ? '#B8F5CC!important' : '#f5f5f5',
        },
      }}
    >
      <Box sx={{ display: 'flex' }} onClick={() => onSelect(option)}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginRight: 2,
          }}
        >
          {isBestValue && (
            <Box
              sx={{
                backgroundColor: '#B8F5CC',
                color: '#000',
                borderRadius: '12px',
                padding: '2px 8px',
                fontSize: '12px',
                fontWeight: '600',
                lineHeight: '24px',
                marginBottom: '4px',
              }}
            >
              Best Value
            </Box>
          )}
          {isMostPopular && (
            <Box
              sx={{
                backgroundColor: '#B8F5CC',
                color: '#000',
                borderRadius: '12px',
                padding: '2px 8px',
                fontSize: '12px',
                fontWeight: '600',
                lineHeight: '24px',
                marginBottom: '4px',
              }}
            >
              Most Popular
            </Box>
          )}
          <Image
            src={image}
            alt="enclomiphene med"
            width={isMobile ? 101 : 150}
            height={isMobile ? 85 : 110}
            style={{ margin: 0, padding: 0 }}
          />
        </Box>
        <Title dangerouslySetInnerHTML={{ __html: label }} />
      </Box>
      {subLabel && (
        <Description dangerouslySetInnerHTML={{ __html: subLabel }} />
      )}
    </Paper>
  );
};

export default EnclomipheneTreatment;
