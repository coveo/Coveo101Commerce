import React from 'react';
import { buildFacet, Facet, FacetState, FacetValue, Unsubscribe, SearchEngine } from '@coveo/headless';
import { Grid, Typography, Button, FormControlLabel, ListItem, List, ListItemText } from '@material-ui/core';
import COLORS from './colors.json';

export interface IFacetColorProps {
  facetId: string;
  field: string;
  label: string;
  engine: SearchEngine;
  id: string;
}

class FacetColor extends React.Component<IFacetColorProps> {
  private facet: Facet;
  state: FacetState;
  private numberOfValues = 6;
  private unsubscribe: Unsubscribe = () => { };

  constructor(props: any) {
    super(props);

    this.facet = buildFacet(this.props.engine, {
      options: {
        facetId: this.props.facetId,
        field: this.props.field,
        numberOfValues: this.numberOfValues,
        sortCriteria: 'occurrences',
      },
    });
    this.state = this.facet.state;
  }

  componentDidMount() {
    this.unsubscribe = this.facet.subscribe(() => this.updateState());
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  updateState() {
    this.setState(this.facet.state);
  }

  private listItem(item: FacetValue) {
    let facetItemCssClasses = 'facet-list-item';

    let selected = this.facet.isValueSelected(item);
    if (selected) {
      facetItemCssClasses += ' coveo-selected';
    }

    let swatch = COLORS[item.value]?.swatch || 'https://fashion.coveodemo.com/images/no_color.png';

    return (
      <ListItem data-facet-value={item.value} disableGutters key={item.value} className={facetItemCssClasses} onClick={() => this.facet.toggleSelect(item)}>
        <FormControlLabel
          className={'checkbox--padding facet-form-control-label'}
          control={<div className='facet-color-swatch' style={{ backgroundImage: `url(${swatch})` }} />}
          label={
            <ListItemText>
              <span className='facet-value'>{item.value}</span>
              <span className='facet-count'>({item.numberOfResults})</span>
            </ListItemText>
          }
        />
      </ListItem>
    );
  }

  private get showMoreButton() {
    if (!this.state.canShowMoreValues) {
      return null;
    }

    return (
      <Button color='primary' className={'btn-control--primary CoveoFacetShowMore'} onClick={() => this.facet.showMoreValues()}>
        Show more
      </Button>
    );
  }

  private get showLessButton() {
    if (!this.state.canShowLessValues) {
      return null;
    }

    return (
      <Button color='inherit' className={'btn-control--secondary CoveoFacetShowLess'} onClick={() => this.facet.showLessValues()}>
        Show Less
      </Button>
    );
  }

  private get resetButton() {
    return (
      <Button color='primary' onClick={() => this.facet.deselectAll()}>
        clear X
      </Button>
    );
  }

  private get facetTemplate() {
    return (
      <div id={this.props.id} className='CoveoFacet'>
        <Grid container justifyContent={'space-between'} alignItems={'center'}>
          <Grid item>
            <Typography noWrap className='facet-title'>
              {this.props.label}
            </Typography>
          </Grid>
          <Grid item>{this.state.hasActiveValues && this.resetButton}</Grid>
        </Grid>

        <List className='MuiListFacet facet-color-container'>{this.values.map((listItem) => this.listItem(listItem))}</List>
        <div className={'facet-more-less-btn'}>
          {this.showMoreButton}
          {this.showLessButton}
        </div>
      </div>
    );
  }

  get values() {
    return this.state.values || [];
  }

  get hasValues() {
    return this.values.length !== 0;
  }

  render() {
    return this.hasValues && this.facetTemplate;
  }
}

export default FacetColor;
