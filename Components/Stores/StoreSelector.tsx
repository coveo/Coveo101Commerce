import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import getConfig from 'next/config';


const { publicRuntimeConfig } = getConfig();

const useStyles = makeStyles((theme) => ({
  root: {
    color: '#fff !important'
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
    color: '#fff !important'
  },
  labels: {
    color: '#fff !important'
  },
  icon: {
    fill: '#fff !important'
  },

  selectEmpty: {
    marginTop: theme.spacing(2),
    color: '#fff  !important'
  },
}));


export default function StoreSelector(props) {
  const classes = useStyles();
  const { store, setStore } = props;

  const handleChange = (event) => {
    setStore(event.target.value);
  };

  function getStores() {

    let stores = publicRuntimeConfig.stores.map((cstore) => {
      return <MenuItem key={'MIT-' + cstore.id} value={cstore.id}>{cstore.name}</MenuItem>;
    });
    return stores;
  }

  let stores = getStores();
  if (publicRuntimeConfig.showStores == false) {
    return null;
  }
  return (
    <div>
      <FormControl className={classes.formControl}>
        <InputLabel id="storeSelectlabel" className={classes.labels}>Store</InputLabel>
        <Select
          labelId="storeSelectlabel"
          id="storeSelectInput"
          value={store}
          disableUnderline
          onChange={handleChange}
          className={classes.labels}
          inputProps={{
            classes: {
              icon: classes.icon,
            },
          }}
        >
          {stores}
        </Select>
      </FormControl>
    </div>
  );
}
