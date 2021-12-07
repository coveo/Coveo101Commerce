import { ProductCard } from "../ProductCard/ProductCard";
import { Card, CardMedia, CardContent, Typography } from "@material-ui/core";
import { withRouter } from "next/router";
import Price from "../Price";
import { IProduct } from '../ProductCard/Product.spec';

class RecommendationCard extends ProductCard {

  render() {
    const product: IProduct = this.state.product;
    const image: string = (product.ec_images?.length && product.ec_images[0]) || '/missing.svg';

    return (
      <Card className="recommendations-card">
        <CardMedia className="recommendations-card__media" image={image} onClick={() => this.handleProductClick(product, true)} />
        <CardContent>
          <Price product={product as any} />
          <Typography className="recommendations-card__link" onClick={() => this.handleProductClick(product, true)}>
            {product.ec_name}
          </Typography>
        </CardContent>
      </Card>
    );
  }
}

export default withRouter(RecommendationCard);
