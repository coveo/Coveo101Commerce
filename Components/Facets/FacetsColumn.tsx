import getConfig from 'next/config';
const { publicRuntimeConfig } = getConfig();

import { Accordion, AccordionDetails, AccordionSummary, Button, Grid, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CategoryFacet from '../Categories/CategoryFacet';
import ReactFacet from './Facet';
import FacetColor from '../Fashion/FacetColor';
import FacetSize from '../Fashion/FacetSize';
import FacetManager from './FacetManager';
import { SearchEngine } from '@coveo/headless';

interface IFacetsColumnProps {
  engine: SearchEngine;
  isOpen: boolean;
  onClose: () => void;
}

export default function FacetsColumn(props: IFacetsColumnProps) {

  const categoryField = 'ec_category_no_gender';

  return (
    <div className={props.isOpen ? 'search-facets__container show-facets' : 'search-facets__container'}>
      <div className='mobile-backdrop' onClick={props.onClose}></div>

      <Grid item className='search__facet-column'>
        <Button onClick={props.onClose} className='btn--close-facets'>
          Close
        </Button>
        <Typography className='facets-column-title'>Filter</Typography>

        <Accordion className='facet-accordion' elevation={0} defaultExpanded={true}>
          <AccordionSummary aria-controls='panel1a-content' id='panel1a-header' expandIcon={<ExpandMoreIcon />}>
            <Typography className='facet-accordion-title'>Category</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <CategoryFacet
              id='category-facet--ec_category'
              engine={props.engine}
              facetId='ec_category'
              label='Category'
              field={categoryField}
            />
          </AccordionDetails>
        </Accordion>

        <ReactFacet
          key='cat_gender'
          id='cat_gender'
          facetId='cat_gender'
          engine={props.engine}
          field='cat_gender'
          label='Gender'
          showCounts={false}
          defaultExpanded={true}
        />

        <ReactFacet
          key='store_name'
          id='store_name'
          facetId='store_name'
          engine={props.engine}
          field='store_name'
          label='Stores'
          numberOfValues={3}
          showCounts={false}
          defaultExpanded={true}
        />

        {publicRuntimeConfig.features?.colorField && (
          <Accordion className='facet-accordion' elevation={0} defaultExpanded={true} data-facet="Color">
            <AccordionSummary aria-controls='panel1a-content' id='panel1a-header' expandIcon={<ExpandMoreIcon />}>
              <Typography className='facet-accordion-title'>Color</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <FacetColor id='color' engine={props.engine} facetId={publicRuntimeConfig.features.colorField} label='Color' field={publicRuntimeConfig.features.colorField} />
            </AccordionDetails>
          </Accordion>
        )}
        {publicRuntimeConfig.features?.sizeField && (
          <Accordion className='facet-accordion' elevation={0} data-facet="Size">
            <AccordionSummary aria-controls='panel1a-content' id='panel1a-header' expandIcon={<ExpandMoreIcon />}>
              <Typography className='facet-accordion-title'>Size</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <FacetSize id='size' engine={props.engine} facetId={publicRuntimeConfig.features.sizeField} label='Size' field={publicRuntimeConfig.features.sizeField} />
            </AccordionDetails>
          </Accordion>
        )}

        <FacetManager engine={props.engine} additionalFacets={publicRuntimeConfig.facetFields}>
          <ReactFacet id='facet--ec_brand' engine={props.engine} facetId='ec_brand' label='Brand' field='ec_brand' />
        </FacetManager>
      </Grid>
    </div>

  );
}
