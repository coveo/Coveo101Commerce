import React from "react";
import {
  CategoryFacetState,
  CategoryFacet as HeadlessCategoryFacet,
  buildCategoryFacet,
  CategoryFacetValue,
  Unsubscribe,
  SearchEngine
} from '@coveo/headless';
import { Grid, Typography, List, ListItem, ListItemText, Button } from '@material-ui/core';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import { IProduct, normalizeProduct } from "../ProductCard/Product.spec";
import categoryExtract from "../../helpers/categoryExtract";

export interface IFacetProps {
  facetId: string,
  field: string,
  label: string,
  engine: SearchEngine,
  id: string,
  currentPath?: string[],
  productForCategory?: IProduct;
}

class CategoryFacet extends React.PureComponent<IFacetProps> {
  private facet: HeadlessCategoryFacet;
  state: CategoryFacetState;
  private unsubscribe: Unsubscribe = () => { };

  buildCategoryFacetFN(): CategoryFacetState {
    let basePath = [];

    if (this.props.productForCategory && this.props.currentPath) {
      const normalizedFirstProduct = normalizeProduct(this.props.productForCategory);
      const categoryValues = categoryExtract(normalizedFirstProduct, this.props.currentPath);
      const labels = categoryValues.labels.map(label => label.split('|').pop());
      basePath = labels;
    }

    this.facet = buildCategoryFacet(this.props.engine, {
      options: {
        field: this.props.field,
        facetId: this.props.facetId,
        delimitingCharacter: '|',
        basePath,
        sortCriteria: "occurrences",
      }
    });
    return this.facet.state;
  }

  componentDidMount() {
    this.setState(this.buildCategoryFacetFN());
    this.unsubscribe = this.facet.subscribe(() => this.updateState());
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  updateState() {
    this.setState(this.facet.state);
  }

  private get parents() {
    const parents = this.state.parents;
    return parents.map((parent, i) => {
      const isLast = i === parents.length - 1;
      return this.buildParent(parent, isLast);
    });
  }

  private buildParent(parent: CategoryFacetValue, isLast: boolean) {

    const parentClasses = isLast ? 'parent-item' : 'parent-item-back';

    return (
      <ListItem
        className={parentClasses + ' coveo-selected'}
        key={parent.value + '-' + parent.path}
        data-facet-value={parent.value}
        onClick={() => !isLast && this.facet.toggleSelect(parent)}>
        {!isLast && <ArrowBackIosIcon />}
        {parent.value}
      </ListItem>
    );
  }

  private get values() {
    const hasParents = (this.facet?.state?.parents?.length || 0) > 0;
    const values = this.state?.values || [];
    return values.map((value: CategoryFacetValue) => this.buildValue(value, hasParents));
  }

  private buildValue(item: CategoryFacetValue, hasParents: boolean) {

    const valueClasses = hasParents ? "facet-list-item " + 'facet-child' : 'facet-list-item';

    return (
      <ListItem
        data-facet-value={item.value}
        key={[...item.path, item.value].join('-')}
        className={valueClasses}
        onClick={() => this.facet.toggleSelect(item)}>
        <ListItemText>
          <span className="facet-value">{item.value}</span>
          <span className="facet-count">({item.numberOfResults})</span>
        </ListItemText>
      </ListItem>
    );
  }

  private get resetButton() {
    return (
      <Button
        color="primary"
        onClick={
          () => this.facet.deselectAll()
        }
      >
        clear X
      </Button>
    );
  }

  private get showMore() {
    if (!this.state.canShowMoreValues) {
      return null;
    }
    return (
      <Button
        color="primary"
        className={'btn-control--primary CoveoFacetShowMore'}
        onClick={
          () => this.facet.showMoreValues()
        }
      >
        Show more
      </Button>
    );
  }

  private get showLess() {
    if (!this.state.canShowLessValues) {
      return null;
    }
    return (
      <Button
        color="inherit"
        className={'btn-control--secondary CoveoFacetShowLess'}
        onClick={
          () => this.facet.showLessValues()
        }
      >
        Show Less
      </Button>
    );
  }

  render() {

    if (this.values.length === 0) {
      return null;
    }
    return (
      <div className="CoveoCategoryFacet" id={this.props.id}>
        <Grid container justifyContent={'space-between'} alignItems={'center'}>
          <Grid item>
            <Typography noWrap className="facet-title">
              {this.props.label}
            </Typography>
          </Grid>
          <Grid item>
            {this.state.hasActiveValues && this.resetButton}
          </Grid>
        </Grid>
        <List className="MuiListFacet">
          {this.parents}
          {this.values}
        </List>
        {this.showMore}
        {this.showLess}
      </div>

    );
  }
}

export default CategoryFacet;
