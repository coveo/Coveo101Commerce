import React from "react";
import TextField from "@material-ui/core/TextField";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { buildSearchBox, SearchBoxState, SearchBox as HeadlessSearchBox, Unsubscribe, loadBreadcrumbActions } from "@coveo/headless";
import { headlessEngine } from "../../helpers/Engine";
import { withRouter, NextRouter } from 'next/router';
import { routerPush, setContext } from "../../helpers/Context";

interface SearchBoxProps {
  router?: NextRouter;
  color: string;
}

class SearchBox extends React.Component<SearchBoxProps> {
  private headlessSearchBox: HeadlessSearchBox;
  state: SearchBoxState;
  private redirectPath = '/search';
  private unsubscribe: Unsubscribe = () => { };

  constructor(props: any) {
    super(props);

    this.headlessSearchBox = buildSearchBox(headlessEngine, {
      options: {
        highlightOptions: {
          notMatchDelimiters: {
            open: "<strong>",
            close: "</strong>"
          },
          correctionDelimiters: {
            open: "<i>",
            close: "</i>"
          }
        }
      }
    });
    this.state = this.headlessSearchBox.state;

  }

  componentDidMount() {
    this.setContextForTest();
    this.unsubscribe = this.headlessSearchBox.subscribe(() => this.updateState());
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  setContextForTest() {
    // When executed from tests, make sure to set the context
    const fromTest = this.props.router.query['fromTest'];
    if (fromTest) {
      setContext(headlessEngine);
    }
  }

  updateState() {
    this.setContextForTest();
    this.setState(this.headlessSearchBox.state);
  }

  handleRedirect() {
    if (this.props.router.pathname !== this.redirectPath) {
      routerPush(this.props.router, { pathname: this.redirectPath });
    }
  }

  handleKeyPress(event: any) {
    if (event.key === 'Enter') {
      this.handleRedirect();
    }
  }

  render() {
    return (
      <div className="searchBox">
        <Autocomplete
          filterOptions={(options) => options}
          id="search-box"
          inputValue={this.state.value}
          onInputChange={(_, newInputValue) => {
            this.headlessSearchBox.updateText(newInputValue);
          }}
          onChange={() => {
            //We only want to submit if we are on the main searchpage
            if (this.props.router.pathname === this.redirectPath) {
              const breadcrumbActions = loadBreadcrumbActions(headlessEngine);
              headlessEngine.dispatch(breadcrumbActions.deselectAllFacets());
            }
            this.headlessSearchBox.submit();

          }}
          onKeyPress={(e) => this.handleKeyPress(e)}
          options={this.state.suggestions}
          getOptionLabel={(option) => {
            return typeof option === "object" ? option.rawValue : option;
          }}
          onFocus={() => {
            if (!this.headlessSearchBox.state.value) {
              this.headlessSearchBox.updateText('');
            }
          }
          }
          renderOption={(option) => {
            return (<div className="redirection-div" onClick={() => {
              this.handleRedirect();
            }} dangerouslySetInnerHTML={{ __html: option.highlightedValue }}
            >
            </div>
            );
          }}
          freeSolo

          renderInput={(params) => (
            <TextField
              {...params}
              id="filled-secondary"
              placeholder="Search"
              variant="outlined"
              size="small"
            />
          )}
        />
      </div>
    );
  }
}

export default withRouter(SearchBox);
