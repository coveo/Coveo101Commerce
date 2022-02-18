import { ProductCard } from '../ProductCard/ProductCard';
import { Card, CardMedia, CardContent, Typography } from '@mui/material';
import { withRouter } from 'next/router';
import Price from '../Price';
import { IProduct } from '../ProductCard/Product.spec';

class RecommendationCard extends ProductCard {
  render() {
    const product: IProduct = this.state.product;
    const image: string = (product.ec_images?.length && product.ec_images[0]) || '/missing.svg';

    return (
      <Card className='recommendations-card' elevation={0}>
        <CardMedia className='recommendations-card__media' image={image} onClick={() => this.handleProductClick(product, true)} />
        <CardContent>
          <Typography className='recommendations-card__link' onClick={() => this.handleProductClick(product, true)}>
            {product.ec_name}
          </Typography>
          <Price product={product as any} />
        </CardContent>
      </Card>
    );
  }
}

export default withRouter(RecommendationCard);
