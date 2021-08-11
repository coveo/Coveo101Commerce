/* eslint-disable no-use-before-define */
import React from "react";
import { Pagination } from "@material-ui/lab";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import { buildPager, PagerState, Pager as HeadlessPager, Unsubscribe } from "@coveo/headless";

export interface pagerProps {
  engine: any;
}

export default class Pager extends React.Component<pagerProps> {
  private headlessPager: HeadlessPager;
  state: PagerState;
  private unsubscribe: Unsubscribe = () => { };

  constructor(props: any) {
    super(props);

    this.headlessPager = buildPager(this.props.engine, {
      options: { numberOfPages: 3 }
    });

    this.state = this.headlessPager.state;
  }

  componentDidMount() {
    this.unsubscribe = this.headlessPager.subscribe(() => this.updateState());
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  updateState() {
    this.setState(this.headlessPager.state);
  }

  setPage(pageNumber: number) {
    this.headlessPager.selectPage(pageNumber);
  }

  get page() {
    return this.headlessPager.state.currentPage;
  }

  get count() {
    return this.headlessPager.state.maxPage;
  }

  render() {
    return (
      <Box>
        <Typography gutterBottom>Current page</Typography>
        <Pagination
          page={this.page}
          count={this.count}
          onChange={(e, page) => this.setPage(page)}
          variant="outlined"
          shape="rounded"
          size="small"
        />
      </Box>
    );
  }
}
