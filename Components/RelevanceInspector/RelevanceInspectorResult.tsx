/* eslint-disable no-use-before-define */
import React from "react";
import {
  buildRelevanceInspector,
  RankingInformation,
  RelevanceInspector as RelevanceInspectorType,
  RelevanceInspectorState,
  Unsubscribe,
} from "@coveo/headless";
import { headlessEngine } from '../../helpers/Engine';
import { Avatar } from "@material-ui/core";
import { Result } from "@coveo/headless";
import BugReportIcon from "@material-ui/icons/BugReport";
import RelevanceInspectorWindow from "./RelevanceInspectorWindow";

interface IDebugProps {
  result: Result;
  index: number;
}

export default class RelevanceInspectorResult extends React.Component<IDebugProps, {}> {
  private headlessRelevanceInspector: RelevanceInspectorType;
  private unsubscribe: Unsubscribe = () => { };

  private result: Result;
  private index: number;
  state: RelevanceInspectorState & {
    openModal: false;
  };

  constructor(props: IDebugProps) {
    super(props);
    this.result = props.result;
    this.index = props.index;
    this.headlessRelevanceInspector = buildRelevanceInspector(headlessEngine);
    this.state = {
      ...this.headlessRelevanceInspector.state,
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

  debug() {
    return this.headlessRelevanceInspector.state.isEnabled;
  }

  setDebugWindow() {
    this.setState({ openModal: this.state.openModal ? false : true });
  }

  applyDebugWindow(openModal: boolean) {
    this.setState({ openModal });
  }

  getJson = () => {
    let json: RankingInformation | { message: string; } = { message: 'missing info' };
    if (this.headlessRelevanceInspector.state.rankingInformation[this.index]?.ranking) {
      json = this.headlessRelevanceInspector.state.rankingInformation[this.index].ranking;
    }
    return json;
  };

  render() {
    const avatarStyle = {
      width: "30px",
      height: "30px",
      display: "inline-flex",
      verticalAlign: "middle",
      marginLeft: "15px"
    };

    return (
      <>
        {this.headlessRelevanceInspector.state.isEnabled ? (
          <>
            <Avatar style={avatarStyle}>
              <BugReportIcon
                onClick={() => {
                  this.setDebugWindow();
                }}
              />
            </Avatar>
            <RelevanceInspectorWindow
              open={this.state.openModal}
              expandAll={true}
              setOpen={this.applyDebugWindow.bind(this)}
              json={this.getJson()}
            ></RelevanceInspectorWindow>
          </>
        ) : (
          <></>
        )}
      </>
    );
  }
}
