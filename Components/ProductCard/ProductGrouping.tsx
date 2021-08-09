import { Component } from "react";
import { withStyles } from '@material-ui/core/styles';
import { IProduct } from "./Product.spec";

const styles = () => ({
  root: {
    display: 'inline-block',
    width: '100%',
    marginBottom: '10px',
  },
  main: {
    height: '60px',
    width: '60px',
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center center',
  },
  thumbnail: {
    display: 'inline-block',
    margin: '5px 10px',
    height: '40px',
    width: '30px',
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
    backgroundPositionY: '10px',
    cursor: 'pointer',
    textAlign: 'center',
    fontSize: '0.6em',
  }
});

export interface IProductGroupingProps {
  relatedProducts: any[];
  onClick: any;
}

export interface IProductGroupingState {
  relatedProducts: any[];
  product: IProduct;
}

class ProductGrouping extends Component<IProductGroupingProps, IProductGroupingState> {
  state: IProductGroupingState;
  constructor(props) {
    super(props);
    this.state = { ...props };
  }

  render() {
    const { classes } = this.props as any;
    const { relatedProducts } = this.state;

    const relatedProductsRendered = relatedProducts.map((i, idx) => <div
      key={`thumbnail-${idx}`}
      title={i.raw.cat_color || i.raw.ec_name}
      style={{ backgroundImage: `url(${i.raw.cat_color_swatch || i.raw.ec_images[0]})` }} data-src={i.raw.cat_color_swatch || i.raw.ec_images[0]}
      className={classes.thumbnail} onClick={() => { this.props.onClick(i); }}></div>
    );

    if (relatedProducts.length > 0) {
      return <div className={classes.root}>
        Also available in:<br />
        {relatedProductsRendered}
      </div>;
    } else {
      return <></>;
    }
  }

}

export default withStyles(styles as any)(ProductGrouping);

