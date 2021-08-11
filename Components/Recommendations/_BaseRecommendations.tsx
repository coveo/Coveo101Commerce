import React from 'react';
import { headlessEngine_Recommendations } from '../../helpers/Engine';
import { Unsubscribe } from '@coveo/headless';
import RecommendationCard from '../Recommendations/RecommendationCard';
import { Grid, Container, Typography } from '@material-ui/core';

interface IRecommendationProps {
  sku?: string,
  skus?: string[],
  title: string,
  maxNumberOfRecommendations?: number,
}

export default class BaseRecommendations extends React.Component<IRecommendationProps> {
  private RecommendationsList: any;
  private unsubscribe: Unsubscribe;
  state: any;
  private engine;

  constructor(props, searchHub, builder) {
    super(props);

    const rec_options: { options; } = {
      options: {
        maxNumberOfRecommendations: this.props.maxNumberOfRecommendations || 3,
        additionalFields: ['source', 'urihash', 'ec_item_group_id'],
      }
    };

    if (this.props.sku) {
      rec_options.options.sku = this.props.sku;
    }

    if (this.props.skus && this.props.skus.length) {
      rec_options.options.skus = this.props.skus;
    }

    this.engine = headlessEngine_Recommendations(searchHub);

    this.RecommendationsList = builder(this.engine, rec_options);

    this.state = this.RecommendationsList.state;
    this.RecommendationsList.refresh();
  }

  componentDidMount() {
    this.unsubscribe = this.RecommendationsList.subscribe(() => this.updateState());
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  shouldComponentUpdate(nextProps) {
    if (nextProps.skus && nextProps.skus.length && nextProps.skus !== this.state.skus) {
      this.setState({ skus: nextProps.skus });
      this.RecommendationsList.setSkus(nextProps.skus);
      this.RecommendationsList.refresh();
    }

    if (nextProps.sku && nextProps.sku !== this.state.sku) {
      this.setState({ sku: nextProps.sku });
      this.RecommendationsList.setSku(nextProps.sku);
      this.RecommendationsList.refresh();
    }

    return true;
  }

  private updateState() {
    let recommendations = this.RecommendationsList.state.recommendations;
    recommendations = recommendations.map((r, index) => {
      // merge additionalFields into product. 
      return { ...r, ...r.additionalFields, index };
    });

    if (!this._areSameArrays(recommendations, this.state.recommendations)) {
      this.setState({ recommendations });
    }

    return true;
  }

  public render() {
    if (this.state.recommendations.length < 1) {
      return (null);
    }

    return (
      <Container>
        <Grid item className="recommendations-component">
          <Typography variant="h3">{this.props.title}</Typography>
          <Grid container spacing={2}>
            {
              this.state.recommendations.map((product, index) => {
                return (
                  <Grid key={product.permanentid} item xs={4}>
                    <RecommendationCard searchUid={this.engine.state.productRecommendations.searchUid} product={product} index={index} />
                  </Grid>
                );
              })
            }
          </Grid>
        </Grid>
      </Container>
    );
  }

  private _areSameArrays(arr1: string[], arr2: string[]): boolean {
    const str1 = (arr1 || []).slice().sort().join();
    const str2 = (arr2 || []).slice().sort().join(); // using slice() in case array is 'frozen', need to copy it before sorting
    return (str1 === str2);
  }

}
