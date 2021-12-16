import React from 'react';
import Header from './Header';
import Footer from './Footer';
import Container from '@material-ui/core/Container';
import Box from '@material-ui/core/Box';
import CoveoUA from '../../helpers/CoveoAnalytics';

class App extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    CoveoUA.logPageView();
  }
  componentDidUpdate() {
    CoveoUA.logPageView();
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
