import React from 'react';
import { buildFacet, Facet, FacetState, FacetValue, Unsubscribe, SearchEngine } from '@coveo/headless';
import { Grid, Typography, Button, FormControlLabel, ListItem, List, ListItemText } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import COLORS from './colors.json';
import COLORS_NTC_MAP from './colors_ntc_map.json'; // from Name That Color

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

    let swatch = COLORS[item.value]?.swatch || null;
    let colorCode = !swatch && COLORS_NTC_MAP[item.value];

    if (!(swatch || colorCode)) {
      swatch = 'https://fashion.coveodemo.com/images/no_color.png';
    }

    const swatchStyle: any = {};
    if (colorCode) {
      swatchStyle.backgroundColor = colorCode;
    }
    if (swatch) {
      swatchStyle.backgroundImage = `url(${swatch})`;
    }
    return (
      <ListItem data-facet-value={item.value} disableGutters key={item.value} className={facetItemCssClasses} onClick={() => this.facet.toggleSelect(item)}>
        <FormControlLabel
          className={'checkbox--padding facet-form-control-label'}
          control={<div className='facet-color-swatch' style={swatchStyle} />}
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
      <Button color='primary' className={'btn-control--primary CoveoFacetShowMore'} onClick={() => this.facet.showMoreValues()} startIcon={<AddIcon fontSize={'small'} />} size='small'>
        Show more
      </Button>
    );
  }

  private get showLessButton() {
    if (!this.state.canShowLessValues) {
      return null;
    }

    return (
      <Button color='inherit' className={'btn-control--secondary CoveoFacetShowLess'} onClick={() => this.facet.showLessValues()} startIcon={<RemoveIcon fontSize={'small'} />} size='small'>
        Show Less
      </Button>
    );
  }

  private get resetButton() {
    return (
      <Button color='primary' onClick={() => this.facet.deselectAll()} className={'facet-reset-btn'}>
        clear X
      </Button>
    );
  }

  private get facetTemplate() {
    return (
      <div id={this.props.id} className='CoveoFacet'>
        <Grid container justifyContent={'space-between'} alignItems={'center'}>
          <Grid item className={'facet-title-grid'}>
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
