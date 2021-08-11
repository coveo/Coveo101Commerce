import React from "react";

import { Breadcrumbs, Link, Typography } from '@material-ui/core';
import { NextRouter, withRouter } from "next/router";
import { IProduct, normalizeProduct } from "../ProductCard/Product.spec";
import categoryExtract from "../../helpers/categoryExtract";
import { routerPush } from '../../helpers/Context';
import store from '../../reducers/cartStore';

export interface IBreadcrumbProps {
  product: IProduct,
  current?: string[],
  router?: NextRouter;
}
export interface IBreadcrumbState {
  labels: string[],
  values: string[],
}

class CategoryBreadcrumb extends React.Component<IBreadcrumbProps, IBreadcrumbState> {

  constructor(props: any) {
    super(props);
    this.state = { labels: [], values: [] };
  }

  componentDidMount() {
    this.splitLabelsAndValues();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.product !== this.props.product) {
      this.splitLabelsAndValues();
    }
  }

  handleClick(categorySlug) {
    const options = {
      pathname: '/plp/[category]',
      query: {
        category: categorySlug,
      }
    };
    const { storeId } = store.getState();
    if (storeId) {
      options.query['storeId'] = storeId;
    }
    routerPush(this.props.router, options);
  }

  renderCategories(categories) {
    return categories.map(c =>
      <Link onClick={() => this.handleClick(c.value)} className="breadcrumb-link" key={'breadcrumb--' + c.value}>
        {c.label}
      </Link>
    );
  }

  render() {
    const labels = this.state.labels.map(label => label.split('|').pop());
    const values = this.state.values;

    if (labels.length > values.length) {
      return <Typography>- invalid categories -</Typography>;
    }

    const categories = labels.map((label, i) => {
      return {
        label,
        value: values[i],
      };
    });

    return (
      <Breadcrumbs className="category-breadcrumb" separator="›" aria-label="breadcrumb">
        {this.renderCategories(categories)}
      </Breadcrumbs>
    );
  }

  splitLabelsAndValues() {
    let product: IProduct = normalizeProduct({ ...this.props });
    let { labels, values } = categoryExtract(product, this.props.current);

    return this.setState({
      labels,
      values,
    });
  }
}

export default withRouter(CategoryBreadcrumb);
