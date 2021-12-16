import { Component } from 'react';
import ImageCarousel from './ImageCarousel';

export interface IImagesSliderProps {
  images: string[];
}
export interface IImagesSliderState {
  images: string[];
  currentImage: string;
}

class ImagesSlider extends Component<IImagesSliderProps, IImagesSliderState> {
  state: IImagesSliderState;
  constructor(props) {
    super(props);

    let images = props.images;
    if (typeof images === 'string') {
      images = images.split(';');
    }

    this.state = {
      images,
      currentImage: images[0],
    };
  }

  changeImage(currentImage) {
    this.setState({ currentImage });
  }

  render() {
    const { images, currentImage } = this.state;

    const allImages = images.map((i, idx) => <div key={`thumbnail-${idx}`} style={{ backgroundImage: `url(${i})` }} data-src={i} className='img-thumbnail' onClick={() => this.changeImage(i)} />);

    return (
      <>
        <div className='carousel'>
          <ImageCarousel images={images} shiftLength={400} height={550} width={400} />
        </div>
        <div className='image-slider__container'>
          <div className='selected-img' style={{ backgroundImage: `url(${currentImage})` }} />
          <div className='img-thumbnails'>{allImages}</div>
        </div>
      </>
    );
  }
}

export default ImagesSlider;
