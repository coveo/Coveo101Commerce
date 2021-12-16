import { Component } from 'react';
import { IProduct } from './Product.spec';
import getConfig from 'next/config';

const { publicRuntimeConfig } = getConfig();

export interface IProductGroupingProps {
  relatedProducts: any[];
  onClick: any;
  changeImage: any;
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
    const { relatedProducts } = this.state;

    const relatedProductsRendered = relatedProducts.map((i, idx) => {
      const image = i.raw[publicRuntimeConfig.features?.colorSwatchField] || (i.raw.ec_images?.length && i.raw.ec_images[0]) || i.raw.ec_images || '/missing.svg';
      const imageOnHover = i.raw.ec_images?.length ? i.raw.ec_images[0] : i.raw.ec_images || '/missing.svg';

      return (
        <div
          key={`thumbnail-${idx}`}
          title={i.raw[publicRuntimeConfig.features?.colorField] || i.raw.ec_name}
          style={{ backgroundImage: `url(${image})` }}
          data-src={image}
          className='grouping__thumbnail'
          onClick={() => {
            this.props.onClick(i);
          }}
          onMouseEnter={() => this.props.changeImage(imageOnHover)}
          onMouseLeave={() => this.props.changeImage()}></div>
      );
    });

    if (relatedProducts.length > 0) {
      return (
        <div className='product-grouping'>
          <div className='product-grouping__label'>Also available in:</div>
          {relatedProductsRendered}
        </div>
      );
    } else {
      return <></>;
    }
  }
}

export default ProductGrouping;
