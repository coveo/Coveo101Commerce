import React from 'react';
import { Button, FormControlLabel, FormGroup, Grid, Switch, TextField, Typography } from '@mui/material';

import { ContextValue, Unsubscribe } from '@coveo/headless';

import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';
import CloseIcon from '@mui/icons-material/Close';
import CodeIcon from '@mui/icons-material/Code';
import SearchIcon from '@mui/icons-material/Search';
import SettingsIcon from '@mui/icons-material/Settings';
import ViewListIcon from '@mui/icons-material/ViewList';

import RelevanceInspector from '../RelevanceInspector/RelevanceInspector';
import { applyContextToEngines, headlessEngine, redoSearch, } from '../../helpers/Engine';

import getConfig from 'next/config';
const { publicRuntimeConfig } = getConfig();

export interface IOverlayState {
  open: boolean;
  genderInContext: boolean;
  context: Record<string, ContextValue>,
  contextViewAsJson: boolean;
  contextViewJsonError: boolean;
}

export class Overlay extends React.Component<{}, IOverlayState> {
  state: IOverlayState;
  updatingEngineLock: boolean;
  private unsubscribe: Unsubscribe = () => { };

  constructor(props) {
    super(props);
    this.updatingEngineLock = false;

    let contextInStorage = {};
    try {
      contextInStorage = JSON.parse(sessionStorage.getItem('debug_custom_context'));
    }
    catch (e) { /* no-op */ }

    this.state = {
      contextViewAsJson: false,
      contextViewJsonError: false,
      open: false,
      genderInContext: sessionStorage.getItem('user_gender_disabled') !== 'true',
      context: { ...contextInStorage || {}, ...headlessEngine.state.context?.contextValues },
    };
  }

  componentDidMount() {
    this.updateContextInEngine();
    this.unsubscribe = headlessEngine.subscribe(() => { this.updateState(); });
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  componentDidUpdate(prevProps, prevState) {
    // compare contexts using sorted JSON
    const prevContextJson = JSON.stringify(prevState.context, Object.keys(prevState.context).sort());
    const thisContextJson = JSON.stringify(this.state.context, Object.keys(this.state.context).sort());

    if (thisContextJson !== prevContextJson) {
      this.updateContextInEngine();
      sessionStorage.setItem('debug_custom_context', JSON.stringify(this.state.context));
    }
  }

  contextAdd() {
    const context = { ...this.state.context };
    let idx = Object.keys(context).length;
    while (context['label' + idx] !== undefined) {
      idx++;
    }
    context['label' + idx] = '';
    this.setState({ context });
  }

  contextChangeLabel(event, key: string) {
    const newLabel: string = event.target.value;
    const context = { ...this.state.context };

    if (context[newLabel] === undefined) {
      context[newLabel] = context[key];
      delete context[key];
      this.setState({ context });
    }
  }

  contextChangeValue(key: string, newValue: string) {
    const context = { ...this.state.context };
    context[key] = newValue;
    this.setState({ context });
  }

  contextRemove(label: string) {
    const context = { ...this.state.context };
    try {
      delete context[label];
      this.setState({ context });
    }
    catch (e) {
      console.warn('Error(Overlay::contextRemove)', e);
    }
  }

  onChangeJson(event) {
    let isError = false;
    try {
      const newContext = JSON.parse(event.target.value);
      this.setState({ context: newContext });
    }
    catch (e) {
      isError = true;
    }
    if (this.state.contextViewJsonError !== isError) {
      this.setState({ contextViewJsonError: isError });
    }
  }

  toggleGenderInContext() {
    const genderInContext = !this.state.genderInContext;
    this.setState({ genderInContext }, () => {
      sessionStorage.setItem('user_gender_disabled', '' + !genderInContext);

      this.triggerSearch();
    });
  }

  toggleSwitch(contextKey: 'open' | 'contextViewAsJson', value?: boolean) {
    const newValue = (value !== undefined) ? value : !this.state[contextKey];
    this.setState({ [contextKey]: newValue } as any);
  }

  triggerSearch() {
    applyContextToEngines(this.state.context);
    redoSearch();
  }

  updateState() {
    if (this.updatingEngineLock) { return; }

    this.setState({
      context: { ...headlessEngine.state.context.contextValues, ...this.state.context, },
    });
  }

  updateContextInEngine() {
    this.updatingEngineLock = true; // use a simple lock to prevent updates here via engine's subscribe() since we will change its context
    applyContextToEngines({ ...this.state.context }); // use a copy, since the following add/remove to engine will affect the context in the state
    this.updatingEngineLock = false;
  }

  ContextLine([key, value]) {
    return <React.Fragment key={'custom-context-item--' + key}>
      <Grid item xs={5}>
        <TextField
          label='key'
          defaultValue={key}
          onBlur={(event) => this.contextChangeLabel(event, key)}
        />
      </Grid>
      <Grid item xs={6}>
        <TextField
          label='value'
          defaultValue={value}
          onBlur={(event) => this.contextChangeValue(key, event.target.value)}
        />
      </Grid>
      <Grid item xs={1}>
        <ClearIcon onClick={() => this.contextRemove(key)} sx={{ marginTop: '10px', height: '30px', width: '30px', }} />
      </Grid>
    </React.Fragment>;
  }

  renderContext() {
    const items = Object.entries(this.state.context).sort((a, b) => a[0].localeCompare(b[0])).map(i => this.ContextLine(i));

    const contextUI = this.state.contextViewAsJson ? <>
      <Grid item xs={12}>
        <TextField
          id="custom-context-json"
          label="JSON"
          defaultValue={JSON.stringify(this.state.context, Object.keys(this.state.context).sort(), 2)}
          fullWidth
          multiline
          error={this.state.contextViewJsonError}
          onChange={(event) => this.onChangeJson(event)}
        />
      </Grid>
      <Grid item xs={12}>
        <Button startIcon={<ViewListIcon />} onClick={() => this.toggleSwitch('contextViewAsJson')}>View as Grid</Button>
      </Grid>
    </> : <>
      {items}
      <Grid item xs={12}>
        <Button startIcon={<AddIcon />} onClick={() => this.contextAdd()}>Add new context</Button>
        <Grid item xs={12}>
        </Grid>
        <Button startIcon={<CodeIcon />} onClick={() => this.toggleSwitch('contextViewAsJson')}>View as JSON</Button>
      </Grid>
    </>;

    return <>
      <Grid container className='debug-overlay--custom-context' spacing={2}>
        <Grid item xs={12} sx={{ marginBottom: '10px' }}>
          <Typography variant='h4'>Custom Context</Typography>
          <Typography>(saved in Session Storage)</Typography>
        </Grid>

        {contextUI}

      </Grid>
    </>;
  }

  render() {
    if (!this.state.open) {
      return <SettingsIcon className='debug-overlay-container--toggle-btn close' sx={{ fontSize: 48 }} onClick={() => this.toggleSwitch('open')} />;
    }

    return (
      <>
        <div className='debug-overlay-container'>
          <Typography className='debug-overlay--title' variant='h3' align='center'>
            Debug panel
          </Typography>
          <div className='debug-overlay--content'>
            <RelevanceInspector />

            {publicRuntimeConfig.scenario === 'fashion' &&
              <FormGroup>
                <FormControlLabel sx={{ fontSize: '1.2rem', }} disableTypography
                  control={<Switch
                    checked={this.state.genderInContext}
                    onChange={() => this.toggleGenderInContext()}
                    name="ignoreGender"
                  />}
                  label="Use Gender in context"
                />
              </FormGroup>
            }

            {this.renderContext()}
          </div>

          <Button variant="outlined" startIcon={<SearchIcon />} onClick={() => this.triggerSearch()} sx={{ marginTop: '20px', float: 'right' }}>Search again</Button>
        </div>

        <CloseIcon className='debug-overlay-container--toggle-btn open' sx={{ fontSize: 48 }} onClick={() => this.toggleSwitch('open')} />
      </>
    );
  }
}

export default Overlay;
