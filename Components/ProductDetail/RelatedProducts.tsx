import { Component } from 'react';
import { IProduct, normalizeProduct } from '../ProductCard/Product.spec';
import { withRouter } from 'next/router';
import { routerPush } from '../../helpers/Context';
import { ProductCardProps } from '../ProductCard/ProductCard';
import store from '../../reducers/cartStore';
import getConfig from 'next/config';

const { publicRuntimeConfig } = getConfig();

export interface IRelatedProductState {
  label: string;
  color: string;
}

class RelatedProducts extends Component<ProductCardProps, IRelatedProductState> {
  state: IRelatedProductState;
  constructor(props) {
    super(props);

    const product = this.props.product as any;
    this.state = { label: product.ec_name, color: product[publicRuntimeConfig.features?.colorField] };
  }

  setLabel(product?: IProduct) {
    const raw = (product || this.props.product) as any;
    this.setState({ label: raw.ec_name, color: raw[publicRuntimeConfig.features?.colorField] });
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

    let products = [product, ...product.childResults.map(normalizeProduct)].sort((a, b) => {
      return a.ec_name.localeCompare(b.ec_name);
    });

    const imageField = 'ec_images';

    const relatedProducts = products.map((i, idx) => {
      let img: string | string[] = i[imageField];
      if (img instanceof Array && img.length) {
        img = img[0];
      }
      return (
        <div
          title={i.ec_name}
          key={`thumbnail-${idx}`}
          style={{ backgroundImage: `url(${img})` }}
          data-src={img}
          className='related-product__swatch'
          onClick={() => {
            this.handleClick(i);
          }}
          onMouseOver={() => this.setLabel(i)}
          onMouseOut={() => this.setLabel()}></div>
      );
    });

    // Hide color if all have the same value
    const distinctColors = Array.from(new Set(products.map((p) => p[publicRuntimeConfig.features?.colorField])));
    return (
      <div className='related-products'>
        <div style={{ whiteSpace: 'nowrap' }}>
          <span className='related-product__label'>Related: </span>
          <b>
            {this.state.label} {distinctColors.length > 1 && this.state.color ? `(${this.state.color})` : ''}
          </b>
        </div>
        <div>{relatedProducts}</div>
      </div>
    );
  }
}
export default withRouter(RelatedProducts);
