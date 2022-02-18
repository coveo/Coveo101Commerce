const path = require('path');

module.exports = {
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')],
  },
  env: {
    ORG_ID: "__YOUR_ORG_ID_HERE__",
    API_KEY: "__YOUR_API_KEY_HERE__",
    SEARCH_PIPELINE: 'Search',
    // ENVIRONMENT: can be 'prod', 'dev', 'staging', 'hipaa'. Default is 'prod'.
    // REGION: can be 'us', 'eu', 'au'. Default is 'us'.
  },

  images: { domains: ['fashion.coveodemo.com'] },

  publicRuntimeConfig: {
    logo: '/logos/coveo_logo_black.svg',
    title: 'The Closet',
    scenario: 'fashion',

    features: {
      searchAsYouType: true,
      facetColor: true,
      facetSize: true,
      productRelatedByColorsAndSize: true,
      //map color and size fields (also sets color/size facet)
      colorField: "cat_color",
      colorCodeField: "cat_color_code",
      colorSwatchField: "cat_color_swatch",
      sizeField: "cat_size",
    },

    pipelinePDP: 'PDP',
    pipelinePLP: 'Listing',
    pipelineRecommendations: 'Recommendations',
    searchhubPDP: 'PDP',
    searchhubPLP: 'Listing',

    // Extra fields to return with search
    fields: [
      "cat_attributes",
      "cat_available_size_types",
      "cat_available_sizes",
      "cat_brand",
      "cat_categories",
      "cat_color",
      "cat_color_code",
      "cat_color_swatch",
      "cat_colors_info",
      "cat_discount",
      "cat_gender",
      "cat_mrp",
      "cat_rating_count",
      "cat_retailer_category",
      "cat_retailer_categoryh",
      "cat_retailer",
      "cat_size_type",
      "cat_size",
      "cat_slug",
      "cat_total_sizes"
    ],

    // Facets to display
    facetFields: [
      { field: 'cat_size_type', label: 'Fit', showCounts: false }
    ]
  },
};
