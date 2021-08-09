import { Component } from "react";
import { withStyles } from '@material-ui/core/styles';

const styles = () => ({
  root: {
    display: 'inline-block',
    textAlign: 'center',
  },
  main: {
    height: '400px',
    width: '400px',
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center center',
  },
  thumbnails: {
    border: '1px solid #E4EAED',
    marginBottom: '10px',
  },
  thumbnail: {
    display: 'inline-block',
    margin: '5px 10px',
    height: '60px',
    width: '60px',
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center center',
    cursor: 'pointer',
  }
});

export interface IImagesSliderProps {
  images: string[];
}
export interface IImagesSliderState {
  images: string[];
  currentImage: string,
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
    const { classes } = this.props as any;
    const { images, currentImage } = this.state;

    const allImages = images.map((i, idx) => <div
      key={`thumbnail-${idx}`}
      style={{ backgroundImage: `url(${i})` }} data-src={i}
      className={classes.thumbnail} onClick={() => this.changeImage(i)} />
    );

    return <div className={classes.root}>
      <div className={classes.main} style={{ backgroundImage: `url(${currentImage})` }} />
      <div className={classes.thumbnails}>{allImages}</div>
    </div>
  }

}

export default withStyles(styles as any)(ImagesSlider);

