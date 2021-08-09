import { Result } from '@coveo/headless';

export interface IProduct extends Result {
  permanentid: string; // sku
  ec_brand?: string;
  ec_category?: string[];
  ec_description?: string;
  ec_image?: string;
  ec_images?: string[];
  ec_item_group_id?: string;
  ec_name: string;
  ec_price: number;
  ec_promo_price?: number;
  // ec_price_to_report?: number;
  ec_rating?: number;
  ec_shortdesc?: string;
  sku: string;

  details?: any;
  features?: any;
  cat_slug?: string[];
  childResults?: any[];
  model?: string;
  index?: number;

  ec_fit_size?: string;
}

export function normalizeProduct(props): IProduct {
  let product = props.product || props;
  let childResults = [];
  if (product.childResults) {
    childResults = product.childResults;
  }
  if (product.raw) {
    product = product.raw;

  }

  // product = {
  //   ...product,
  // permanentid: product.permanentid || product.sku,
  // ec_category: product[configField.ec_category] || product.ec_category || product.categories,
  // ec_description: product[configField.ec_description] || product.ec_description || product.description,
  // ec_images: product[configField.ec_images] || product.ec_images,
  // ec_brand: product[configField.ec_brand] || product.ec_brand || product.brand,
  // ec_name: product[configField.ec_name] || product.ec_name || product.name,
  // ec_rating: product[configField.ec_rating] || product.ec_rating || product.rating,
  // ec_price: product[configField.ec_price] || product.ec_price || product.price,
  // ec_promo_price: product[configField.ec_promo_price] || product.ec_promo_price || product.promoPrice,
  // ec_price_to_report: product[configField.ec_price_to_report],
  // model: product.ec_item_group_id || product[configField.model] || product.model || product.productid,
  // features: product.features || product.ec_tags
  // };

  product = { // make product extensible.
    ...product,
    childResults,
  };

  // make sure ec_category is an array
  if (product.ec_category && !(product.ec_category instanceof Array)) {
    console.warn('ec_category field is not an array for product: ', product);
    product.ec_category = [product.ec_category];
  }

  return product;
}
