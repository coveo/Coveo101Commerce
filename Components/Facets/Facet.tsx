import React from 'react';
import { buildFacet, Facet, FacetState, FacetValue, Unsubscribe, SearchEngine } from '@coveo/headless';
import { Grid, Typography, Button, Checkbox, FormControlLabel, ListItem, List, ListItemText, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import getConfig from 'next/config';
const { publicRuntimeConfig } = getConfig();

export interface IFacetProps {
  id: string;
  engine: SearchEngine;
  facetId: string;
  field: string;
  label: string;
  numberOfValues?: number;
  showCounts?: boolean;
  sortCriteria?: 'score' | 'alphanumeric' | 'occurrences' | 'automatic';
  defaultExpanded?: boolean;
}

class ReactFacet extends React.Component<IFacetProps> {
  private facet: Facet;
  state: FacetState;
  private unsubscribe: Unsubscribe = () => { };

  constructor(props: any) {
    super(props);

    this.facet = buildFacet(this.props.engine, {
      options: {
        facetId: this.props.facetId,
        field: this.props.field,
        numberOfValues: this.props.numberOfValues || 5,
        sortCriteria: this.props.sortCriteria || 'occurrences',
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

    let selected = this.isSelected(item);
    if (selected) {
      facetItemCssClasses += ' coveo-selected';
    }

    const counts = this.props.showCounts !== false ? <span className='facet-count'>({item.numberOfResults})</span> : null;

    // For values likes Stores : "Quebec, QC (2700 Laurier)" - we are splitting the value on 2 lines. 
    let displayValue = item.value;
    if (/(\s|\w)+ \((\s|\w)+\)$/.test(displayValue)) {
      displayValue = displayValue.replace(' (', '\n(');
    }

    return (
      <ListItem data-facet-value={item.value} disableGutters key={item.value} className={facetItemCssClasses} onClick={() => this.onSelect(item)}>
        <FormControlLabel
          className={'checkbox--padding'}
          control={<Checkbox checked={selected} />}
          label={
            <ListItemText
              // Label clicks are not registered under ListItem so have to keep this one too
              onClick={() => this.onSelect(item)}>
              <span className='facet-value'>{displayValue}</span>
              {counts}
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
      <Button color='primary' className={'btn-control--primary CoveoFacetShowMore'} onClick={() => this.showMore()} startIcon={<AddIcon fontSize={'small'} />} size='small'>
        Show more
      </Button>
    );
  }

  private get showLessButton() {
    if (!this.state.canShowLessValues) {
      return null;
    }

    return (
      <Button color='inherit' className={'btn-control--secondary CoveoFacetShowLess'} onClick={() => this.showLess()} startIcon={<RemoveIcon fontSize={'small'} />} size='small'>
        Show Less
      </Button>
    );
  }

  private get resetButton() {
    return (
      <Button color='primary' onClick={() => this.deselectAll()} className={'facet-reset-btn'}>
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

        <List className='MuiListFacet'>{this.values.map((listItem) => this.listItem(listItem))}</List>
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

  isSelected(item: FacetValue) {
    return this.facet.isValueSelected(item);
  }

  onSelect(item: FacetValue) {
    this.facet.toggleSelect(item);
  }

  showMore() {
    this.facet.showMoreValues();
  }

  showLess() {
    this.facet.showLessValues();
  }

  deselectAll() {
    this.facet.deselectAll();
  }

  render() {
    return (
      this.hasValues && (
        <Accordion className='facet-accordion' elevation={0} defaultExpanded={this.props.defaultExpanded} data-facet={this.props.label}>
          <AccordionSummary aria-controls='panel1a-content' id='panel1a-header' expandIcon={<ExpandMoreIcon />}>
            <Typography className='facet-accordion-title'>{this.props.label}</Typography>
          </AccordionSummary>
          <AccordionDetails>{this.facetTemplate}</AccordionDetails>
        </Accordion>
      )
    );
  }
}

export default ReactFacet;
