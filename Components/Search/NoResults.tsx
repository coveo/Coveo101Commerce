import React from "react";
import {
  buildHistoryManager,
  HistoryManager
} from "@coveo/headless";
import { headlessEngine } from "../../helpers/Engine";
import { Button } from '@material-ui/core';

export default class NoResults extends React.Component {
  private headlessHistory: HistoryManager;

  constructor(props: any) {
    super(props);
    this.headlessHistory = buildHistoryManager(headlessEngine);
  }

  goBackHistory() {
    this.headlessHistory.back();
  }

  render() {
    if (typeof window === 'undefined') {
      return null;
    }

    return (
      <div>
        No results
        <Button onClick={() => this.goBackHistory()}>
          Undo Last Action
        </Button>
      </div>
    );
  }
}
