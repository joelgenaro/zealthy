import styled from '@emotion/styled';
import { Slider as MuiSlider } from '@mui/material';

const Slider = styled(MuiSlider)`
  height: 6px;
  padding: 5px 0;

  .MuiSlider-rail {
    background-color: #d8d8d8;
  }

  .MuiSlider-mark {
    display: none;
  }

  .MuiSlider-track {
    border: none;
  }

  .MuiSlider-thumbSizeMedium {
    width: 16px;
    height: 16px;
  }

  .MuiSlider-markLabel {
    top: 100%;
    font-size: 14px;
    line-height: 20px;
    color: #777777;
    &[data-index='0'] {
      transform: translateX(0);
    }
    &[data-index='1'] {
      transform: translateX(-100%);
    }
  }
`;

export default Slider;
