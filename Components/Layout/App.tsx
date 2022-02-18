import React from 'react';
import Header from './Header';
import Footer from './Footer';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';

class App extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <>
        <Header></Header>
        <Container maxWidth='xl' className='layout__container' disableGutters>
          <Box my={4}>{this.props.children}</Box>
        </Container>
        <Footer></Footer>
      </>
    );
  }
}

export default App;
