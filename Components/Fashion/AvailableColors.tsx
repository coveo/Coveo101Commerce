import { Component } from "react";
import { createStyles, withStyles } from '@material-ui/core/styles';
import { IProduct, normalizeProduct } from "../ProductCard/Product.spec";
import CoveoUA from "../../helpers/CoveoAnalytics";
import { withRouter } from "next/router";
import { routerPush } from '../../helpers/Context';
import { ProductCardProps } from "../ProductCard/ProductCard";
import store from '../../reducers/cartStore';

const styles = () =>
  createStyles({
    root: {
    },
    label: {
      fontStyle: 'normal',
    },
    swatches: {
    },
    swatch: {
      display: 'inline-block',
      height: '40px',
      width: '30px',
      margin: '8px',
      backgroundSize: 'contain',
      backgroundRepeat: 'no-repeat',
      backgroundPositionY: '10px',
      cursor: 'pointer',
      textAlign: 'center',
      fontSize: '0.6em',
    },
  });


export interface IAvailableColorsState {
  label: string;
  code: string;
}

class AvailableColors extends Component<ProductCardProps, IAvailableColorsState> {
  state: IAvailableColorsState;
  constructor(props) {
    super(props);

    const product = this.props.product as any;
    this.state = { label: product.cat_color, code: product.cat_color_code };
  }

  setColorLabels(product?: IProduct) {
    const raw = (product || this.props.product) as any;
    this.setState({ label: raw.cat_color, code: raw.cat_color_code });
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
      }
    };
    const { storeId } = store.getState();
    if (storeId) {
      routerOptions.query['storeId'] = storeId;
    }

    CoveoUA.productClick(
      product, this.props.searchUid, false,
      () => routerPush(this.props.router, routerOptions)
    );

  }

  render() {
    const { classes } = this.props as any;
    const product: IProduct = this.props.product;

    // Products in the same group (or model/style) are folded in "childResults" in the search response. 
    if (product.childResults.length < 1) {
      return null;
    }

    let products = [product, ...product.childResults.map(normalizeProduct)];

    const imageField = 'cat_color_swatch';
    const relatedProducts = products.map((i, idx) => <div
      key={`thumbnail-${idx}`}
      style={{ backgroundImage: `url(${i[imageField]})` }} data-src={i[imageField]}
      className={classes.swatch} onClick={() => { this.handleClick(i); }} onMouseOver={() => this.setColorLabels(i)} onMouseOut={() => this.setColorLabels()}></div>
    );

    return (
      <div className={classes.root}>
        <div>
          <span className={classes.label}>Colors: </span>
          <b>{this.state.label} {this.state.code ? `(${this.state.code})` : ''}</b>
        </div>
        <div className={classes.swatches}>{relatedProducts}</div>
      </div>
    );

  }
}
export default withStyles(styles as any)(withRouter(AvailableColors));

