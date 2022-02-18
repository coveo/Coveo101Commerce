import { Component } from 'react';
import { IProduct, normalizeProduct } from '../ProductCard/Product.spec';
import { withRouter } from 'next/router';
import { routerPush } from '../../helpers/Context';
import { ProductCardProps } from '../ProductCard/ProductCard';
import store from '../../reducers/cartStore';
import getConfig from 'next/config';

const { publicRuntimeConfig } = getConfig();

export interface IAvailableColorsState {
  label: string;
  code: string;
}

class AvailableColors extends Component<ProductCardProps, IAvailableColorsState> {
  state: IAvailableColorsState;
  colorField = publicRuntimeConfig.features?.colorField;
  constructor(props) {
    super(props);

    const product = this.props.product as any;
    this.state = { label: product[this.colorField], code: product[publicRuntimeConfig.features?.colorCodeField] || product[this.colorField] };
  }

  setColorLabels(product?: IProduct) {
    const raw = (product || this.props.product) as any;
    this.setState({ label: raw[this.colorField], code: raw[publicRuntimeConfig.features?.colorCodeField] || raw[this.colorField] });
  }

  handleClick(product: IProduct) {
    let currentProductsClicked: IProduct[] = JSON.parse(localStorage.getItem('clickedProducts')) || [];
    if (currentProductsClicked.length > 5) {
      currentProductsClicked.shift();
    }

    currentProductsClicked.push(product);

    const routerOptions = {
      pathname: '/pdp/[sku]',
      query: {
        sku: product.permanentid,
        model: product.ec_item_group_id,
      },
    };
    const { storeId } = store.getState();
    if (storeId) {
      routerOptions.query['storeId'] = storeId;
    }

    routerPush(this.props.router, routerOptions);
  }

  render() {
    const product: IProduct = this.props.product;

    // Products in the same group (or model/style) are folded in "childResults" in the search response.
    if (product.childResults.length < 1) {
      return null;
    }

    let products = [product, ...product.childResults.map(normalizeProduct)];

    const relatedProducts = products.map((i, idx) => {
      const imageUrl =
        (publicRuntimeConfig.features?.colorSwatchField && i[publicRuntimeConfig.features?.colorSwatchField]) || (typeof i?.ec_images === 'string' && i?.ec_images) || i?.ec_images[0] || '';
      return (
        <div
          key={`thumbnail-${idx}`}
          className='available-color__swatch-container'
          onClick={() => {
            this.handleClick(i);
          }}
          onMouseOver={() => this.setColorLabels(i)}
          onMouseOut={() => this.setColorLabels()}>
          <div className='available-color__swatch' style={{ backgroundImage: `url(${imageUrl})` }} data-src={imageUrl}></div>
        </div>
      );
    });

    return (
      <div className='available-color'>
        <div>
          <span className='available-color__label'>Color: </span>
          <b className='available-color-name'>
            {this.state.label} {this.state.code ? `(${this.state.code})` : ''}
          </b>
        </div>
        <div className='available-color__relatedProducts'>{relatedProducts}</div>
      </div>
    );
  }
}
export default withRouter(AvailableColors);
