export default {
  root: {
    '&.AppHeader': {
      height: '80px',
      backgroundColor: '#fff',
      '& .MuiToolbar-root': {
        padding: '0 15px',
        position: 'relative'
      },
      '& .header-el': {
        padding: '15px',
        '&.header-el__last': {
          paddingRight: '15px'
        },
      },
      '& .MuiAutocomplete-root': {
        margin: '0!important',
        '& .MuiOutlinedInput-notchedOutline': {
          boxShadow: 'none',
          outline: 'none',
          border: 'none'
        }
      },
      '& .MuiInputBase-root': {
        background: 'rgba(0, 0, 0, 0.04)',
        border: 'none'
      },
      '& .MuiIconButton-root': {
        '&.header-icon': {
          marginLeft: '10px',
          '&.header-icon__no-hover:hover': {
            background: 'none'
          },
          '& .header-icon__txt': {
            fontSize: '16px',
            color: '#000'
          },
          '& .MuiSvgIcon-root': {
            width: '30px',
          }
        },
      },
      '& .logo': {
        cursor: 'pointer',
        padding: 0,
        width: '90px',
        height: 'auto',
        verticalAlign: 'bottom',
      },
      '& .megamenu__container': {
        color: '#000',
        maxHeight: '80vh',
        height: 'auto',
        overflow: 'auto',
        boxShadow: '0px 2px 4px -1px'
      }
    }
  }
}
