import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Modal from "@material-ui/core/Modal";
import Backdrop from "@material-ui/core/Backdrop";
import Fade from "@material-ui/core/Fade";
//import ReactJson from "react-json-view";
import dynamic from 'next/dynamic';
const DynamicReactJson = dynamic(import('react-json-view'), { ssr: false });

const useStyles = makeStyles((theme) => ({
  modal: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  paper: {
    width: "80%",
    height: "80%",
    overflow: "auto",
    backgroundColor: theme.palette.background.paper,
    border: "2px solid #000",
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3)
  }
}));

const jsonStyle = {
  backgroundColor: "#000"
};

function RelevanceInspectorWindow(props) {
  //const { classes } = this.props;
  const classes = useStyles();
  const { open, setOpen, json, expandAll } = props;
  // const handleOpen = () => {
  //   console.log("handleOpen");
  //   setOpen(true);
  //   //this.setState({ open: false });
  // };

  const handleClose = () => {
    setOpen(false);
  };

  const whatToDisplay = (field) => {
    let returnValue = true;
    if (field.name === "root" || field.name === false) returnValue = false;
    if (field.name === "expressions") returnValue = false;
    if (field.type === "array") returnValue = false;
    if (field.name === "rankingInformation") returnValue = true;
    if (expandAll === true) {
      returnValue = false;
    }
    return returnValue;
  };

  const handleCopy = (copy) => {
    navigator.clipboard.writeText(JSON.stringify(copy.src, null, "\t"));
  };

  return (
    <div>
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        className={classes.modal}
        open={open}
        onClose={handleClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 100
        }}
      >
        <Fade in={open}>
          <div className={classes.paper}>
            {/* <div onClick={handleClose}>Close</div> */}
            <h2 id="transition-modal-title">Debug Information</h2>
            <DynamicReactJson
              name={false}
              src={json}
              style={jsonStyle}
              theme="monokai"
              iconStyle="square"
              enableClipboard={handleCopy}
              shouldCollapse={whatToDisplay}
              collapseStringsAfterLength={50}
            />{" "}
          </div>
        </Fade>
      </Modal>
    </div>
  );
}
export default RelevanceInspectorWindow;
