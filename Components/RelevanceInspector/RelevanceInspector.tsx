/* eslint-disable no-use-before-define */
import React from "react";
import {
  buildRelevanceInspector,
  loadSearchActions,
  loadSearchAnalyticsActions,
  RelevanceInspector as RelevanceInspectorType,
  RelevanceInspectorState,
  Unsubscribe,
} from "@coveo/headless";
import { headlessEngine } from '../../helpers/Engine';
import {
  Avatar,
  FormControlLabel,
  FormGroup,
  Switch
} from "@material-ui/core";
import BugReportIcon from "@material-ui/icons/BugReport";
import RelevanceInspectorWindow from "./RelevanceInspectorWindow";

export default class RelevanceInspector extends React.Component {
  private headlessRelevanceInspector: RelevanceInspectorType;
  private hideExecuteQuery: boolean = true;
  private unsubscribe: Unsubscribe = () => { };

  state: RelevanceInspectorState & {
    executeQueryOnChange: true;
    openModal: false;
  };

  constructor(props: any) {
    super(props);
    this.headlessRelevanceInspector = buildRelevanceInspector(headlessEngine);
    this.state = {
      ...this.headlessRelevanceInspector.state,
      executeQueryOnChange: true,
      openModal: false
    };
  }

  componentDidMount() {
    this.unsubscribe = this.headlessRelevanceInspector.subscribe(() => this.updateState());
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  updateState() {
    this.setState(this.headlessRelevanceInspector.state);
  }

  avatarStyle = {
    width: "30px",
    height: "30px",
    display: "inline-flex",
    verticalAlign: "middle"
  };

  setDebug(debug: boolean) {
    if (debug) {
      this.headlessRelevanceInspector.enable();
    } else {
      this.headlessRelevanceInspector.disable();
    }
    if (this.state.executeQueryOnChange) {
      const analyticActions = loadSearchAnalyticsActions(headlessEngine);
      const searchActions = loadSearchActions(headlessEngine);
      headlessEngine.dispatch(searchActions.executeSearch(analyticActions.logInterfaceLoad()));
    }
  }

  switchDebug = () => {
    this.setDebug(this.debug() ? false : true);
  };

  switchExecuteQuery = () => {
    this.setState({ executeQueryOnChange: this.state.executeQueryOnChange ? false : true });
  };

  debug() {
    return this.headlessRelevanceInspector.state.isEnabled;
  }

  setDebugWindow() {
    this.setState({ openModal: this.state.openModal ? false : true });
  }

  applyDebugWindow(openModal: boolean) {
    this.setState({ openModal });
  }

  render() {
    return (<FormGroup row>
      <FormControlLabel
        control={<Switch
          checked={this.headlessRelevanceInspector?.state?.isEnabled || false}
          onChange={() => this.switchDebug()}
          name="checkDebug"
        />}
        label="Enable Debug"
      />

      {!this.hideExecuteQuery && <FormControlLabel
        control={
          <Switch
            checked={this.state.executeQueryOnChange}
            onChange={() => this.switchExecuteQuery()}
            name="checkDebugExecute"
          />
        }
        label="Execute Query"
      />}

      {this.headlessRelevanceInspector.state.isEnabled && (
        <>
          <Avatar style={this.avatarStyle}>
            <BugReportIcon onClick={() => this.setDebugWindow()} />
          </Avatar>
          <RelevanceInspectorWindow
            open={this.state.openModal}
            setOpen={(opened) => this.applyDebugWindow(opened)}
            json={this.headlessRelevanceInspector.state}
          ></RelevanceInspectorWindow>
        </>
      )}
    </FormGroup>
    );
  }
}
