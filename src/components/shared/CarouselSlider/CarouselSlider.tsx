import Box from '@mui/material/Box';
import {
  CarouselProvider,
  Slider,
  Slide,
  ButtonBack,
  ButtonNext,
} from 'pure-react-carousel';
import 'pure-react-carousel/dist/react-carousel.es.css';
import Arrow from '../icons/Arrow';

interface CarouselSliderProps {
  items: JSX.Element[];
  visibleSlides?: number;
}

const CarouselSlider = ({ items, visibleSlides = 1 }: CarouselSliderProps) => {
  return (
    <CarouselProvider
      naturalSlideWidth={100}
      naturalSlideHeight={125}
      visibleSlides={visibleSlides}
      totalSlides={items.length}
      isIntrinsicHeight={true}
    >
      <Box
        sx={{
          position: 'relative',
          '& .carousel__inner-slide': {
            display: 'flex',
            justifyContent: 'center',
          },
        }}
      >
        <Slider
          style={{ marginLeft: 24, marginRight: 24 }}
          horizontalPixelThreshold={200}
        >
          {items.map((item, idx) => (
            <Slide key={idx} index={idx}>
              {item}
            </Slide>
          ))}
        </Slider>
        {items.length > visibleSlides && (
          <>
            <SlideNextButton />
            <SlideBackButton />
          </>
        )}
      </Box>
    </CarouselProvider>
  );
};

const SlideNextButton = () => (
  <ButtonNext
    style={{
      position: 'absolute',
      right: 0,
      top: '50%',
      border: 0,
      background: 'transparent',
      width: '24px',
      padding: 0,
    }}
  >
    <Arrow style={{ transform: 'rotate(-90deg)', color: '#AFAFAF' }} />
  </ButtonNext>
);

const SlideBackButton = () => (
  <ButtonBack
    style={{
      position: 'absolute',
      left: 0,
      top: '50%',
      border: 0,
      background: 'transparent',
      width: '24px',
      padding: 0,
    }}
  >
    <Arrow style={{ transform: 'rotate(90deg)', color: '#AFAFAF' }} />
  </ButtonBack>
);

export default CarouselSlider;
