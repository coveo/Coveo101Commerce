import React from "react";
import { withStyles } from '@material-ui/core/styles';
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";

import { Accordion, AccordionDetails, AccordionSummary, Container, Typography } from "@material-ui/core";
import Grid from '@material-ui/core/Grid';
import { NextRouter } from "next/router";
import { IProduct } from "../ProductCard/Product.spec";

import Price from "../../Components/Price";
import Rating from "../ProductCard/Rating";
import ImagesSlider from "./ImagesSlider";
import AddRemoveProduct from "../../Components/cart/AddRemoveProduct";

import FrequentlyViewedTogether from '../../Components/Recommendations/FrequentlyViewedTogether';
import FrequentlyBoughtTogether from '../../Components/Recommendations/FrequentlyBoughtTogether';
import AvailableColors from "../../Components/Fashion/AvailableColors";
import AvailableSizes from "../../Components/Fashion/AvailableSizes";


interface IProductDetailPage {
  router?: NextRouter,
  product: IProduct,
}

const styles = () => ({
  subheader: {
    margin: '10px 0',
    '& > *': {
      marginRight: '30px',
    }
  },
  sale: {
    fontWeight: 'bold',
    color: '#ED731A',
  },
  features: {
    '& > div': {
      marginBottom: '10px',
    }
  },
  details: {
    '& tr > *': {
      padding: '5px',
      margin: 0,
      border: 0,
    },
    '& tr:nth-child(odd)': {
      backgroundColor: '#F7F8F9',
    },
    '& th': {
      whiteSpace: 'pre',
      textAlign: 'left',
    },
    '& td': {
      whiteSpace: 'pre-wrap',
    }
  },
});

export interface IProductDetailState {
  currentSize: string;
  sku: string;
}


class ProductDetailPage extends React.Component<IProductDetailPage, IProductDetailState>{
  state: IProductDetailState;

  constructor(props) {
    super(props);

    const product = this.props.product;
    const availableSizes: string[] = product['cat_available_sizes'] || [];
    const currentSize = availableSizes.length ? availableSizes[0] : '';
    const sku = product.permanentid + (currentSize ? '_' + currentSize : '');

    this.state = { currentSize, sku };
  }

  componentDidUpdate() {
    let size = (this.props.product['cat_available_sizes'] || []).includes(this.state.currentSize) ? this.state.currentSize : this.props.product['cat_available_sizes'][0];
    let sku = this.props.product.permanentid + '_' + size;

    if (sku !== this.state.sku) {
      this.setState({
        currentSize: size,
        sku: sku,
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
    const { classes } = this.props as any;

    const product = this.props.product;
    const reviewcount = (product as any).customerreviewcount || 3;
    const images = product.ec_images || [product.ec_image];

    let features = (product.features || []);
    if (features.length) {
      features = features.map(
        (feature, idx) => {
          if (feature.includes('\n')) {
            feature = <div>
              <b>{feature.split('\n')[0]}</b><br />
              {feature.split('\n').slice(1).join('\n')}
            </div>;
          }
          return <div key={`f-${product.permanentid}-${idx}`}>{feature}</div>;
        }
      );
      features = <Accordion>
        <AccordionSummary id="panel-features" expandIcon={<ExpandMoreIcon />}>
          <Typography>Features</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <div className={classes.features}>{features}</div>
        </AccordionDetails>
      </Accordion>;
    }
    else features = null;

    let details = null;
    try {
      details = JSON.parse(product.details);
      let detailsTable = Object.keys(details).map((key, idx) => {
        return <tr key={`features-${idx}`}><th>{key}</th><td>{details[key].join('\n')}</td></tr>;
      });
      details = <Accordion>
        <AccordionSummary id="panel-details" expandIcon={<ExpandMoreIcon />}>
          <Typography>Details</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <table className={classes.details} cellSpacing={0}><tbody>{detailsTable}</tbody></table>
        </AccordionDetails>
      </Accordion>;
    }
    catch (e) {
      details = null;
    }

    return <Container maxWidth="md">
      <Grid container spacing={6}>
        <Grid item>
          <div className="pdp__header">
            <Typography className="pdp__tl" variant="h1">{product.ec_name}</Typography>
            <div className={classes.subheader}>
              {product.ec_fit_size &&
                <span>Fit <b>{product.ec_fit_size}</b></span>
              }
              {product.permanentid != product.ec_item_group_id &&
                <span>Model <b>{product.ec_item_group_id}</b></span>
              }
              <span>Sku <b>{this.state.sku}</b></span>
            </div>
          </div>

          <Grid item container>
            <Grid item xs>
              <ImagesSlider key={images.join()} images={images} />
            </Grid>
            <Grid item xs>
              <Grid container justifyContent="space-between" alignItems="center">
                <Grid item>
                  <Price product={product as any} />
                </Grid>
                <Grid item>
                  <Rating value={product.ec_rating} />
                  <span>({reviewcount} reviews)</span>
                </Grid>
              </Grid>
              <AvailableColors product={product} />
              <AvailableSizes product={product} currentSize={this.state.currentSize} onSelect={(size) => this.onSelectSize(size)} />
              <div dangerouslySetInnerHTML={{ __html: product.ec_description }}></div>

              <div>
                <AddRemoveProduct sku={this.state.sku} product={product} label="In cart:" />
              </div>

              {features}
              {details}
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      <FrequentlyViewedTogether title={'Products frequently seen together'} skus={[product.permanentid]} />
      <FrequentlyBoughtTogether title={'Products frequently bought together'} sku={product.permanentid} />
    </Container>;
  }
}

export default withStyles(styles as any)(ProductDetailPage);
