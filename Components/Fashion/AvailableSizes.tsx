import { Component } from "react";
import { IProduct } from "../ProductCard/Product.spec";
import { ListItem, List, ListItemText } from '@material-ui/core';


export interface AvailableSizesProps {
  product: IProduct;
  currentSize: string;
  // eslint-disable-next-line no-unused-vars
  onSelect: (size: string) => void;
}

class AvailableSizes extends Component<AvailableSizesProps> {
  render() {
    const product: IProduct = this.props.product;

    if (product.childResults.length < 1) {
      return null;
    }

    const totalSizes: string[] = product['cat_total_sizes'];
    const availableSizes: string[] = product['cat_available_sizes'];

    const sizes = totalSizes.map((s: string) => (
      <ListItem
        data-facet-value={s}
        disableGutters
        key={'product-size-' + product['ec_product_id'] + '_' + s}
        className={
          'facet-list-item-size'
          + (availableSizes.includes(s) ? ' product-size-available' : ' product-size-not-available')
          + (s === this.props.currentSize ? ' coveo-selected' : '')
        }
        onClick={() => this.props.onSelect(s)}
      > <ListItemText>
          <span className={'facet-value item' + (s === this.props.currentSize ? ' coveo-selected' : '')}>{s}</span>
        </ListItemText>
      </ListItem >

    ));

    return (
      <div className="product-sizes">
        <div>Sizes:</div>
        <List className="MuiListFacetSize">
          {sizes}
        </List>
      </div>
    );

  }
}
export default AvailableSizes;

