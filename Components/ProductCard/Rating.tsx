import React from "react";

export default function Rating(props) {
  const value = (props as any).value;
  if (value === undefined) {
    return <div className="widget-rating"></div>;
  }
  const width = `${value / 0.05}%`;

  return (<div className="widget-rating">
    <div className="rating-fill" style={{ width }}>★★★★★</div>
    <div>☆☆☆☆☆</div>
  </div>)
}

