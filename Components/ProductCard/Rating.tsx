import React from 'react';

export default function Rating(props) {
  const value = (props as any).value;
  if (value === undefined) {
    return <div className='widget-rating'></div>;
  }
  const width = `${value / 0.05}%`;
  const rightWidth = 100 - Number(width) + '%';

  return (
    <div className='widget-rating'>
      <div className='rating-fill' style={{ width }}>
        ★★★★★
      </div>
      <div className='rating-fill-right' style={{ width: rightWidth }}>
        ★★★★★
      </div>
    </div>
  );
}
//☆☆☆☆☆
