import React from 'react';

import getConfig from 'next/config';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { Accordion, AccordionDetails, AccordionSummary, Container, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import { NextRouter } from 'next/router';
import { IProduct } from '../ProductCard/Product.spec';

import Price from '../../Components/Price';
import Rating from '../ProductCard/Rating';
import ImagesSlider from './ImagesSlider';
import AddRemoveProduct from '../Cart/AddRemoveProduct';

import FrequentlyBoughtTogether from '../Recommendations/FrequentlyBoughtTogether';
import FrequentlyViewedDifferentCategory from '../../Components/Recommendations/FrequentlyViewedDifferentCategory';
import FrequentlyViewedSameCategory from '../../Components/Recommendations/FrequentlyViewedSameCategory';
import FrequentlyViewedTogether from '../Recommendations/FrequentlyViewedTogether';
import AvailableColors from '../../Components/Fashion/AvailableColors';
import AvailableSizes from '../../Components/Fashion/AvailableSizes';
import RelatedProducts from './RelatedProducts';

const { publicRuntimeConfig } = getConfig();

interface IProductDetailPage {
  router?: NextRouter;
  product: IProduct;
}

export interface IProductDetailState {
  currentSize: string;
  sku: string;
}

class ProductDetailPage extends React.Component<IProductDetailPage, IProductDetailState> {
  state: IProductDetailState;

  constructor(props) {
    super(props);

    const availableSizes: string[] = this.props.product['cat_available_sizes'] || [];
    const currentSize = (availableSizes.length ? availableSizes[0] : '');

    this.state = { currentSize, sku: '' };
  }

  componentDidMount() { this.setSkuAndSize(); }
  componentDidUpdate() { this.setSkuAndSize(); }

  private setSkuAndSize() {
    let sku = this.props.product.permanentid;

    const productSizes: string[] = this.props.product['cat_available_sizes'] || [];
    const productSize = productSizes.length ? productSizes[0] : '';
    const size = productSizes.includes(this.state.currentSize) ? this.state.currentSize : productSize;
    if (size) {
      sku = sku + '_' + size.replace(/[^0-9a-zA-Z]+/g, '-');
    }

    if (sku !== this.state.sku) {
      this.setState({
        currentSize: size,
        sku,
      });
    }
  }

  onSelectSize(size: string) {
    const sku = this.props.product.permanentid + '_' + size;
    this.setState({
      currentSize: size,
      sku,
    });
  }

  render() {
    const product = this.props.product;
    const reviewcount = (product as any).customerreviewcount || 3;
    let images = typeof product.ec_images === 'string' ? [product.ec_images] : product.ec_images;

    let features = product['cat_features'] || [];
    if (features.length) {
      features = features.map((feature, idx) => {
        if (feature.includes('\n')) {
          feature = (
            <div>
              <b>{feature.split('\n')[0]}</b>
              <br />
              {feature.split('\n').slice(1).join('\n')}
            </div>
          );
        }
        return <div key={`f-${product.permanentid}-${idx}`}>{feature}</div>;
      });
      features = (
        <Accordion className='product-detail__accordian'>
          <AccordionSummary id='panel-features' expandIcon={<ExpandMoreIcon />}>
            <Typography>Features</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <div className='features'>{features}</div>
          </AccordionDetails>
        </Accordion>
      );
    } else features = null;

    let details = null;
    try {
      details = JSON.parse(product['details']);
      let detailsTable = Object.keys(details).map((key, idx) => {
        return (
          <tr key={`features-${idx}`}>
            <th>{key}</th>
            <td>{details[key].join('\n')}</td>
          </tr>
        );
      });
      details = (
        <Accordion className='product-detail__accordian'>
          <AccordionSummary id='panel-details' expandIcon={<ExpandMoreIcon />}>
            <Typography>Details</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <table className='details' cellSpacing={0}>
              <tbody>{detailsTable}</tbody>
            </table>
          </AccordionDetails>
        </Accordion>
      );
    } catch (e) {
      details = null;
    }

    return (
      <Container className='pdp-container'>
        <Grid container spacing={6}>
          <Grid item>
            <div className='pdp__header'>
              <Typography className='pdp__tl' variant='h1'>
                {product.ec_name}
              </Typography>
              <div className='product-detail__subheader'>
                {product.ec_fit_size && (
                  <span>
                    Fit <b>{product.ec_fit_size}</b>
                  </span>
                )}
                {product.permanentid != product.ec_item_group_id && (
                  <span>
                    Model <b>{product.ec_item_group_id}</b>
                  </span>
                )}
              </div>
            </div>

            <Grid item container spacing={6}>
              <Grid item id='pdp-image' data-product-id={product.permanentid} >
                <ImagesSlider key={images.join()} images={images} />
              </Grid>
              <Grid item xs className='pdp-details-grid'>
                <Grid item>
                  {publicRuntimeConfig.features?.productRelatedByColorsAndSize && (
                    <Grid item>
                      <Typography variant='h1' className={'pdp__tl'}>
                        {product.ec_name}
                      </Typography>
                    </Grid>
                  )}
                  <Grid item>
                    <div className='pdp__price'>
                      <Price product={product as any} />
                    </div>
                  </Grid>
                  <Grid item>
                    <div className='pdp__rating'>
                      <Rating value={product.ec_rating} />
                      <span className='pdp__rating-reviews'>{reviewcount} Reviews</span>
                    </div>
                  </Grid>
                </Grid>

                {publicRuntimeConfig.features?.productRelatedByColorsAndSize && (
                  <div>
                    <div className='pdp__available-color'>
                      <AvailableColors product={product} />
                    </div>
                    <div className='pdp__available-size'>
                      <AvailableSizes product={product} currentSize={this.state.currentSize} onSelect={(size) => this.onSelectSize(size)} />
                    </div>
                  </div>
                )}

                <div className='pdp__sku'>SKU: {this.state.sku}</div>

                <div className='pdp__addToCart'>
                  <AddRemoveProduct sku={this.state.sku} product={product} />
                </div>

                <div
                  className='pdp-text-description'
                  dangerouslySetInnerHTML={{
                    __html: product.ec_description,
                  }}></div>

                <div className='pdp__sku-id-model'>
                  {this.state.sku != product.permanentid && <div>PRODUCT-ID: {product.permanentid}</div>}
                  {product.permanentid != product.ec_item_group_id && <div>MODEL: {product.ec_item_group_id}</div>}
                </div>

                <Accordion className='pdp-accordion-description' defaultExpanded={true}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls='panel1a-content' id='panel1a-header'>
                    <Typography>Description</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <div
                      dangerouslySetInnerHTML={{
                        __html: product.ec_description,
                      }}></div>
                    <div className='pdp__sku-id-model'>
                      {this.state.sku != product.permanentid && <div>PRODUCT-ID: {product.permanentid}</div>}
                      {product.permanentid != product.ec_item_group_id && <div>MODEL: {product.ec_item_group_id}</div>}
                    </div>
                  </AccordionDetails>
                </Accordion>

                {!publicRuntimeConfig.features?.productRelatedByColorsAndSize && <RelatedProducts product={product} />}

                {features}
                {details}
                <div id='q-pdp-badges'></div>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Grid container className='pdp-recommendations-grid'>
          {publicRuntimeConfig.scenario === 'fashion' ? (
            <>
              <FrequentlyViewedSameCategory title='Similar Products for You' skus={[product.permanentid]} searchHub='PDP' />
              <FrequentlyViewedDifferentCategory title='Good Match With' skus={[product.permanentid]} searchHub='PDP' />
            </>
          ) : (
            <>
              <FrequentlyViewedTogether title='Products frequently seen together' skus={[product.permanentid]} searchHub='PDP' />
              <FrequentlyBoughtTogether title='Products frequently bought together' skus={[product.permanentid]} searchHub='PDP' />
            </>
          )}
        </Grid>
      </Container>
    );
  }
}

export default ProductDetailPage;
