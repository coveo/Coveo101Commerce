import React from 'react';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import getConfig from 'next/config';

const { publicRuntimeConfig } = getConfig();

export default function StoreSelector(props) {
  const { store, setStore } = props;

  const handleChange = (event) => {
    setStore(event.target.value);
  };

  function getStores() {
    let stores = publicRuntimeConfig.stores.map((cstore) => {
      return (
        <MenuItem key={'MIT-' + cstore.id} value={cstore.id}>
          {cstore.name}
        </MenuItem>
      );
    });
    return stores;
  }

  let stores = getStores();
  if (publicRuntimeConfig.showStores == false) {
    return null;
  }
  return (
    <div className='store-selector'>
      <FormControl className='store__form-control'>
        <InputLabel id='storeSelectlabel' className='store__labels'>
          Store
        </InputLabel>
        <Select
          labelId='storeSelectlabel'
          id='storeSelectInput'
          value={store}
          disableUnderline
          onChange={handleChange}
          className='store__labels'
          inputProps={{
            classes: {
              icon: 'store__icon',
            },
          }}>
          {stores}
        </Select>
      </FormControl>
    </div>
  );
}
