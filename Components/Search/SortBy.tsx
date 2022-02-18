import React from 'react';
import { SortState, SortInitialState, buildRelevanceSortCriterion, buildFieldSortCriterion, Unsubscribe, buildSort, SearchEngine, Sort as headlessSort, SortOrder } from '@coveo/headless';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

/* eslint-disable no-unused-vars */
enum SortOptionLabel {
  Relevance = 'relevance',
  Highest = 'Price: highest to lowest',
  Lowest = 'Price: lowest to lowest',
}

enum SortOptionValues {
  Relevance = 'relevancy',
  Highest = 'descending',
  Lowest = 'ascending',
}
/* eslint-enable no-unused-vars */

export interface ISortByProps {
  engine: SearchEngine;
}

export default class SortBy extends React.Component<ISortByProps> {
  private headlessSort: headlessSort;
  private unsubscribe: Unsubscribe = () => { };
  state: SortState;

  constructor(props: any) {
    super(props);
    const initialState: Partial<SortInitialState> = { criterion: this.relevance };
    this.headlessSort = buildSort(this.props.engine, { initialState });
    this.state = this.headlessSort.state;
  }

  componentDidMount() {
    this.unsubscribe = this.headlessSort.subscribe(() => this.updateState());
  }

  disconnectedCallback() {
    this.unsubscribe();
  }

  updateState() {
    this.setState(this.headlessSort.state);
  }

  private select(e: any) {
    const select = e.target.value;

    switch (select) {
      case SortOptionLabel.Relevance:
        this.headlessSort.sortBy(this.relevance);
        break;

      case SortOptionLabel.Highest:
        this.headlessSort.sortBy(this.highest);
        break;

      case SortOptionLabel.Lowest:
        this.headlessSort.sortBy(this.lowest);
        break;

      default:
        break;
    }
  }

  private get relevance() {
    return buildRelevanceSortCriterion();
  }

  private get highest() {
    return buildFieldSortCriterion('ec_promo_price', SortOrder.Descending);
  }

  private get lowest() {
    return buildFieldSortCriterion('ec_promo_price', SortOrder.Ascending);
  }

  private get currentSelectedValue() {
    const currentValue = this.state.sortCriteria === SortOptionValues.Relevance ? SortOptionValues.Relevance : this.state.sortCriteria.split(' ')[1];

    switch (currentValue) {
      case SortOptionValues.Relevance:
        return SortOptionLabel.Relevance;

      case SortOrder.Descending:
        return SortOptionLabel.Highest;

      case SortOrder.Ascending:
        return SortOptionLabel.Lowest;

      default:
        break;
    }
    return currentValue;
  }

  render() {
    return (
      <FormControl className='CoveoSortBy'>
        <InputLabel id='demo-simple-select-label'>Sort By</InputLabel>
        <Select
          labelId='sort-by-label'
          id='sort-by-select'
          value={this.currentSelectedValue}
          onChange={(e: any) => this.select(e)}
        >
          <MenuItem value={SortOptionLabel.Relevance}>Relevance</MenuItem>
          <MenuItem value={SortOptionLabel.Highest}>Highest Price</MenuItem>
          <MenuItem value={SortOptionLabel.Lowest}>Lowest Price</MenuItem>
        </Select>
      </FormControl>
    );
  }
}
