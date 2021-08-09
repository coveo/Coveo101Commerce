import {
  buildFacetManager,
  SearchEngine,
  FacetManager as HeadlessFacetManager,
  Unsubscribe,
  FacetManagerPayload
} from '@coveo/headless';
import React, { Children, ReactElement } from 'react';
import ReactFacet from "./Facet";

type FacetManagerChild = ReactElement<{
  facetId: string,
  field: string,
  label: string,
  engine: SearchEngine,
  id: string;
}>;

interface IFacetField {
  field: string;
  label: string;
}

interface IFacetManagerProps {
  additionalFacets: IFacetField[];
  engine: SearchEngine;
  children: FacetManagerChild | FacetManagerChild[];
}

class FacetManager extends React.Component<IFacetManagerProps> {
  private facetManager: HeadlessFacetManager;
  private unsubscribe: Unsubscribe = () => { };

  constructor(props: any) {
    super(props);

    this.facetManager = buildFacetManager(this.props.engine);
  }

  componentDidMount() {
    this.updateState();

    this.unsubscribe = this.facetManager.subscribe(() => this.updateState());
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  updateState() {
    this.setState(this.facetManager.state);
  }

  createPayload(facets: FacetManagerChild[]): FacetManagerPayload<FacetManagerChild>[] {
    return facets.map((facet) => ({
      facetId: facet.props.facetId,
      payload: facet,
    }));
  }

  render() {
    const childFacets = Children.toArray(this.props.children) as FacetManagerChild[];

    //Add the additionalFacets
    this.props.additionalFacets?.map(item => {
      childFacets.push(<ReactFacet key={item.field} id={item.field} engine={this.props.engine} facetId={item.field} label={item.label} field={item.field} />);
    });

    const payload = this.createPayload(childFacets);
    let sortedFacets = this.facetManager.sort(payload).map((p) => p.payload);
    if (sortedFacets.length === 0) {
      sortedFacets = childFacets;
    }

    return (
      <>
        {sortedFacets}
      </>
    );
  }
}

export default FacetManager;
