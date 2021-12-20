import { useState, useRef } from 'react';
import NavigateNext from '@material-ui/icons/NavigateNext';
import NavigateBefore from '@material-ui/icons/NavigateBefore';

export interface IImageCarouselProps {
  images: string[];
  shiftLength: number;
  width: number;
}

export default function ImageCarousel({ images, shiftLength, width }: IImageCarouselProps) {
  let scrl = useRef(null);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [isScrollEnd, setScrollEnd] = useState(false);

  const scrollImage = (shiftLength) => {
    scrl.current.scrollLeft += shiftLength;
    scrollCheck();
  };

  const scrollCheck = () => {
    setScrollLeft(scrl.current.scrollLeft);
    const isEnd: boolean = Math.floor(scrl.current.scrollWidth - scrl.current.scrollLeft) <= scrl.current.offsetWidth;
    setScrollEnd(isEnd);
  };

  return (
    <div className='carousel_container'>
      <div className='carousel-btn__container'>{scrollLeft !== 0 && <NavigateBefore className='carousel__btn carousel-btn-prev' onClick={() => scrollImage(-shiftLength)} />}</div>
      <ul ref={scrl} onScroll={scrollCheck}>
        {images.map((image, idx) => (
          <li key={`image-carousel-${idx}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img style={{ width: `${width}px` }} src={image} alt={image} />
          </li>
        ))}
      </ul>
      <div className='carousel-btn__container'>{!isScrollEnd && <NavigateNext className='carousel__btn carousel-btn-next' onClick={() => scrollImage(+shiftLength)} />}</div>
    </div>
  );
}
