import React from "react";
import {
  SearchEngine,
  BreadcrumbManager,
  BreadcrumbManagerState,
  Unsubscribe,
  buildBreadcrumbManager
} from '@coveo/headless';
import { Grid, Chip } from "@mui/material";

export interface IBreadcrumbsProps {
  engine: SearchEngine,
}

export default class Breadcrumbs extends React.Component<IBreadcrumbsProps> {
  private breadcrumbs: BreadcrumbManager;
  state: BreadcrumbManagerState;
  private unsubscribe: Unsubscribe = () => { };
  constructor(props) {
    super(props);

    this.breadcrumbs = buildBreadcrumbManager(this.props.engine);
    this.state = this.breadcrumbs.state;
  }

  componentDidMount() {
    this.unsubscribe = this.breadcrumbs.subscribe(() => this.updateState());
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  updateState() {
    this.setState(this.breadcrumbs.state);
  }

  makeBreadcrumbs(breadcrumbType) {
    let breadcrumbElements = [];

    this.breadcrumbs.state[breadcrumbType].forEach(facetBreadcrumbs => {

      let breadcrumbValues = [];

      if (breadcrumbType === 'categoryFacetBreadcrumbs') {
        const lastPath = facetBreadcrumbs.path[facetBreadcrumbs.path.length - 1];
        breadcrumbValues.push({ value: lastPath.value, path: lastPath.path.join('|'), deselect: facetBreadcrumbs.deselect });
      }
      else {
        breadcrumbValues.push(...facetBreadcrumbs.values);
      }

      breadcrumbValues.forEach(breadcrumbValue => {
        const value = breadcrumbValue.value?.value || breadcrumbValue.value;
        const label = breadcrumbValue.path ? breadcrumbValue.path.replace(/\|/g, ' / ') : value;
        breadcrumbElements.push(
          <Grid item key={"breadcrumb--" + value}>
            <Chip
              className="breadcrumb__chip"
              key={value}
              label={label}
              data-value={breadcrumbValue.path || value}
              onDelete={() => breadcrumbValue.deselect()}
              onClick={() => breadcrumbValue.deselect()}
            />
          </Grid>
        );
      });
    });
    return breadcrumbElements;
  }

  getBreadCrumb() {
    let categoryBreadcrumbs = this.makeBreadcrumbs('categoryFacetBreadcrumbs');
    let facetBreadcrumbs = this.makeBreadcrumbs('facetBreadcrumbs');

    return categoryBreadcrumbs.concat(facetBreadcrumbs);
  }

  isBreadcrumbPopulated(breadcrumbObject) {
    return Object.keys(breadcrumbObject).length > 0;
  }

  isThereBreadcrumb() {
    const bc = this.breadcrumbs.state;
    return this.isBreadcrumbPopulated(bc.categoryFacetBreadcrumbs) || this.isBreadcrumbPopulated(bc.dateFacetBreadcrumbs) || this.isBreadcrumbPopulated(bc.facetBreadcrumbs) || this.isBreadcrumbPopulated(bc.numericFacetBreadcrumbs);
  }

  render() {

    if (!this.isThereBreadcrumb()) {
      return null;
    }

    return <Grid container spacing={2} className="breadcrumb__container">
      {this.getBreadCrumb()}
    </Grid>;
  }
}
