
const categoryParsed = (product, current) => {

  let labels = product.ec_category || [];
  let values = product.cat_slug || [];

  if (current) {
    let currentPath = current.join('/');
    // filter up to this current breadcrumbs.
    let newLabels = [];
    let newValues = [];
    for (let i = 0; i < values.length; i++) {
      newLabels.push(labels[i]);
      newValues.push(values[i]);
      if (values[i] === currentPath) {
        break;
      }
    }
    labels = newLabels;
    values = newValues;
  }
  return { labels, values };
};

export default categoryParsed;
