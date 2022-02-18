/* eslint-disable no-use-before-define */
import React from "react";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import Typography from "@mui/material/Typography";
import { buildResultsPerPage, ResultsPerPageState, ResultsPerPage as headlessResultsPerPage, Unsubscribe } from "@coveo/headless";

export interface ResultsPerPageProps {
  engine: any;
}

export default class ResultsPerPage extends React.Component<ResultsPerPageProps> {
  private headlessResultsPerPage: headlessResultsPerPage;
  state: ResultsPerPageState;
  private unsubscribe: Unsubscribe = () => { };
  private defaultNumberOfResults = 30;

  constructor(props: any) {
    super(props);
    this.headlessResultsPerPage = buildResultsPerPage(this.props.engine, {
      initialState: { numberOfResults: this.defaultNumberOfResults }
    });

    this.state = this.headlessResultsPerPage.state;
  }

  componentDidMount() {
    this.unsubscribe = this.headlessResultsPerPage.subscribe(() => this.updateState());
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  updateState() {
    this.setState(this.headlessResultsPerPage.state);
  }

  render() {

    return (
      <FormControl component="fieldset">
        <Typography>Results per page</Typography>
        <RadioGroup
          row
          name="test"
          defaultValue={this.defaultNumberOfResults}
          value={this.state.numberOfResults}
          onChange={(event) => {
            this.headlessResultsPerPage.set(parseInt(event.target.value, 10));
          }}
        >
          <FormControlLabel value={30} control={<Radio />} label="30" />
          <FormControlLabel value={50} control={<Radio />} label="50" />
        </RadioGroup>
      </FormControl>
    );
  }
}
