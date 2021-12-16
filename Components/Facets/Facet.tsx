import React from "react";
import {
  buildFacet,
  Facet,
  FacetState,
  FacetValue,
  Unsubscribe,
  SearchEngine
} from '@coveo/headless';
import { Grid, Typography, Button, Checkbox, FormControlLabel, ListItem, List, ListItemText } from '@material-ui/core';

export interface IFacetProps {
  facetId: string,
  field: string,
  label: string,
  engine: SearchEngine,
  id: string;
}

class ReactFacet extends React.Component<IFacetProps> {

  private facet: Facet;
  state: FacetState;
  private numberOfValues = 5;
  private unsubscribe: Unsubscribe = () => { };

  constructor(props: any) {
    super(props);

    this.facet = buildFacet(this.props.engine, {
      options: {
        facetId: this.props.facetId,
        field: this.props.field,
        numberOfValues: this.numberOfValues,
        sortCriteria: "occurrences",
      }
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

    return (
      <ListItem
        data-facet-value={item.value}
        disableGutters key={item.value} className={facetItemCssClasses}
        onClick={() => this.onSelect(item)}>
        <FormControlLabel
          className={'checkbox--padding'}
          control={
            <Checkbox
              checked={selected}
            />
          }
          label={
            (
              <ListItemText
                // Label clicks are not registered under ListItem so have to keep this one too
                onClick={() => this.onSelect(item)}
              >
                <span className="facet-value">{item.value}</span>
                <span className="facet-count">({item.numberOfResults})</span>
              </ListItemText>
            )
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
      <Button
        color="primary"
        className={'btn-control--primary CoveoFacetShowMore'}
        onClick={
          () => this.showMore()
        }
      >
        Show more
      </Button>
    );
  }

  private get showLessButton() {
    if (!this.state.canShowLessValues) {
      return null;
    }

    return (
      <Button
        color="inherit"
        className={'btn-control--secondary CoveoFacetShowLess'}
        onClick={
          () => this.showLess()
        }
      >
        Show Less
      </Button>
    );
  }

  private get resetButton() {
    return (
      <Button
        color="primary"
        onClick={
          () => this.deselectAll()
        }
      >
        clear X
      </Button>
    );
  }

  private get facetTemplate() {

    return (
      <div id={this.props.id} className="CoveoFacet">
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
          {this.values.map((listItem) => this.listItem(listItem))}
        </List>
        {this.showMoreButton}
        {this.showLessButton}
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
    return this.hasValues && this.facetTemplate;
  }
}

export default ReactFacet;
