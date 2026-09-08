import React from 'react';

export const PoolBadge = ({ pool, isCaptain }) => {
  if (isCaptain) {
    return <span className="pool-badge pool-badge-captain">CAPTAIN</span>;
  }

  switch (pool) {
    case 'POOL_A':
      return <span className="pool-badge pool-badge-pool-a">POOL A (₹1,000)</span>;
    case 'POOL_B':
      return <span className="pool-badge pool-badge-pool-b">POOL B (₹800)</span>;
    case 'POOL_C':
      return <span className="pool-badge pool-badge-pool-c">POOL C (₹400)</span>;
    case 'UNASSIGNED':
      return <span className="pool-badge pool-badge-unassigned">UNASSIGNED</span>;
    default:
      return <span className="pool-badge pool-badge-unassigned">{pool || 'UNASSIGNED'}</span>;
  }
};
