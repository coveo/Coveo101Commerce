/* eslint-disable no-use-before-define */
import React from 'react';
import { buildQuerySummary, QuerySummaryState, QuerySummary as HeadlessQuerySummary, SearchEngine, Unsubscribe } from '@coveo/headless';
import { Box } from '@mui/material';

export interface IQuerySummaryProps {
  engine: SearchEngine;
}

export default class QuerySummary extends React.Component<IQuerySummaryProps> {
  private headlessQuerySummary: HeadlessQuerySummary;
  state: QuerySummaryState;
  private unsubscribe: Unsubscribe = () => { };

  constructor(props: any) {
    super(props);

    this.headlessQuerySummary = buildQuerySummary(this.props.engine);

    this.state = this.headlessQuerySummary.state;
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  componentDidMount() {
    this.unsubscribe = this.headlessQuerySummary.subscribe(() => this.updateState());
  }

  updateState() {
    this.setState(this.headlessQuerySummary.state);
  }

  renderNoResults() {
    return <Box mt={5}>No results</Box>;
  }

  renderBold(input: string) {
    return (
      <Box component='span'>
        <strong>{input}</strong>
      </Box>
    );
  }

  renderRange() {
    return this.renderBold(` ${this.state.firstResult}-${this.state.lastResult}`);
  }

  renderTotal() {
    return <Box component='span'> {this.renderBold(this.state.total.toString())}</Box>;
  }

  renderQuery() {
    if (this.state.hasQuery) {
      return <Box component='span'> for {this.renderBold(this.state.query)}</Box>;
    }
  }

  renderDuration() {
    return ` in ${this.state.durationInSeconds} seconds`;
  }

  renderHasResults() {
    return (
      <Box>
        Results{this.renderRange()} of {this.renderTotal()}
        {this.renderQuery()}
        {/* {this.renderDuration()} */}
      </Box>
    );
  }

  render() {
    if (typeof window === 'undefined' || !this.state.hasDuration) {
      // avoid flashing a "no-result" on load
      return null;
    }
    if (!this.state.hasResults) {
      return this.renderNoResults();
    }
    return this.renderHasResults();
  }
}
