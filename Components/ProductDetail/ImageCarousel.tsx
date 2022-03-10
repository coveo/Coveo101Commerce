import { useEffect, useState } from 'react';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Slider from 'react-slick';
import { Grid } from '@mui/material';

export interface IImageCarouselProps {
  images: string[];
}

export default function ImageCarousel({ images }: IImageCarouselProps) {
  const [nav1, setNav1] = useState(null);
  const [nav2, setNav2] = useState(null);
  const [slider1, setSlider1] = useState(null);
  const [slider2, setSlider2] = useState(null);

  useEffect(() => {
    setNav1(slider1);
    setNav2(slider2);
  }, [slider1, slider2]);

  const settingsMain = {
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    fade: true,
    asNavFor: '.slider-nav',
    responsive: [
      {
        breakpoint: 600,
        settings: {
          dots: true,
        },
      },
    ],
  };

  const settingsThumbs = {
    slidesToScroll: 1,
    asNavFor: '.slider-for',
    centerMode: true,
    swipeToSlide: true,
    focusOnSelect: true,
    vertical: true,
    verticalSwiping: true,
  };

  return (
    <Grid container className='carousel_container'>
      <Grid item md={4} style={{ width: '150px' }}>
        <div className='thumbnail-slider-wrap'>
          <Slider {...settingsThumbs} asNavFor={nav1} ref={(slider) => setSlider2(slider)}>
            {images.map((image, idx) => (
              <div className='slick-slide' key={idx}>
                <img className='slick-slide-image' src={image} alt='alternate image' />
              </div>
            ))}
          </Slider>
        </div>
      </Grid>
      <Grid item md={8} className='pdp-main-img-grid'>
        <Slider {...settingsMain} asNavFor={nav2} ref={(slider) => setSlider1(slider)}>
          {images.map((image, idx) => (
            <div className='slick-slide' key={idx}>
              <img className='slick-slide-image' src={image} alt='main image' />
            </div>
          ))}
        </Slider>
      </Grid>
    </Grid>
  );
}
