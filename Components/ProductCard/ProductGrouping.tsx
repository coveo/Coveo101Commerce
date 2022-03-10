import { Component } from 'react';
import getConfig from 'next/config';
import { Tooltip } from '@mui/material';
import { IProduct } from './Product.spec';

const { publicRuntimeConfig } = getConfig();

export interface IColorInfo {
  code: string;
  label: string;
  swatch: string;
}

export interface IProductGroupingProps {
  product: IProduct;
  onClick: any;
  changeImage: any;
}

class ProductGrouping extends Component<IProductGroupingProps> {

  render() {
    const product = this.props.product;
    const relatedProducts = product.childResults;

    let allColors = [];
    try { allColors = JSON.parse((product as any).cat_colors_info); } catch (e) { /*no-op*/ }

    const relatedProductsRendered = relatedProducts.map((i, idx) => {
      const image = i.raw[publicRuntimeConfig.features?.colorSwatchField] || (i.raw.ec_images?.length && i.raw.ec_images[0]) || i.raw.ec_images || '/missing.svg';
      const imageOnHover = i.raw.ec_images?.length ? i.raw.ec_images[0] : i.raw.ec_images || '/missing.svg';

      return (
        <div key={`thumbnail-${idx}`} className='grouping__thumbnail-container'>
          <div
            title={i.raw[publicRuntimeConfig.features?.colorField] || i.raw.ec_name}
            style={{ backgroundImage: `url(${image})` }}
            data-src={image}
            className='grouping__thumbnail'
            onClick={() => {
              this.props.onClick(i);
            }}
            onMouseEnter={() => this.props.changeImage(imageOnHover)}
            onMouseLeave={() => this.props.changeImage()}></div>
        </div>
      );
    });

    const colorCodesInRelatedProducts = relatedProducts.map(i => i.raw.cat_color_code);
    colorCodesInRelatedProducts.push((product as any).cat_color_code); // Add current, so we don't duplicate it in the grouping.
    const disabledColors = (allColors || []).filter(colorInfo => !colorCodesInRelatedProducts.includes(colorInfo.code));
    const disabledColorsRendered = disabledColors.map((color_info, idx) => {
      return (
        <div key={`thumbnail-${idx}`} className='grouping__thumbnail-container grouping__thumbnail-disabled'>
          <Tooltip title="Color not available" placement="bottom">
            <div
              style={{ backgroundImage: `url(${color_info.swatch})` }}
              data-src={color_info.swatch}
              className='grouping__thumbnail'
            ></div>
          </Tooltip>
        </div>
      );
    });

    if (relatedProducts.length > 0) {
      return (
        <div className='product-grouping'>
          <div className='product-grouping__label'>Also available in:</div>
          {relatedProductsRendered}
          {disabledColorsRendered}
        </div>
      );
    } else {
      return <></>;
    }
  }
}

export default ProductGrouping;
