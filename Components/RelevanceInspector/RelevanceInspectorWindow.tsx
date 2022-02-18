import React from 'react';
import { makeStyles } from '@mui/styles';
import Modal from '@mui/material/Modal';
import Backdrop from '@mui/material/Backdrop';
import Fade from '@mui/material/Fade';
//import ReactJson from "react-json-view";
import dynamic from 'next/dynamic';
const DynamicReactJson = dynamic(import('react-json-view'), { ssr: false });

const useStyles = makeStyles(() => ({
  paper: {
  },
}));

const jsonStyle = {
  backgroundColor: '#000',
};

function RelevanceInspectorWindow(props) {
  const classes = useStyles();
  const { open, setOpen, json, expandAll } = props;

  const handleClose = () => {
    setOpen(false);
  };

  const whatToDisplay = (field) => {
    let returnValue = true;
    if (field.name === 'root' || field.name === false) returnValue = false;
    if (field.name === 'expressions') returnValue = false;
    if (field.type === 'array') returnValue = false;
    if (field.name === 'rankingInformation') returnValue = true;
    if (expandAll === true) {
      returnValue = false;
    }
    return returnValue;
  };

  const handleCopy = (copy) => {
    navigator.clipboard.writeText(JSON.stringify(copy.src, null, '\t'));
  };

  return (
    <div>
      <Modal
        aria-labelledby='transition-modal-title'
        aria-describedby='transition-modal-description'
        className='relevance-inspector__modal'
        open={open}
        onClose={handleClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 100,
        }}>
        <Fade in={open}>
          <div className={`background-paper ${classes.paper}`}>
            {/* <div onClick={handleClose}>Close</div> */}
            <h2 id='transition-modal-title'>Debug Information</h2>
            <DynamicReactJson
              name={false}
              src={json}
              style={jsonStyle}
              theme='monokai'
              iconStyle='square'
              enableClipboard={handleCopy}
              shouldCollapse={whatToDisplay}
              collapseStringsAfterLength={50}
            />{' '}
          </div>
        </Fade>
      </Modal>
    </div>
  );
}
export default RelevanceInspectorWindow;
