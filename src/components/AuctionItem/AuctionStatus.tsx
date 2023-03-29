import React from 'react'
import { AUCTION_STATUS } from '~/constants/auction';

export default function AuctionStatus({ status }: {status: string}) {
  let statusClass = '';
  switch (status) {
    case AUCTION_STATUS.active:
      statusClass = 'bg-blue-100 text-blue-800'
      break;
    case AUCTION_STATUS.draft:
      statusClass = 'bg-gray-100 text-gray-800'
      break;
    case AUCTION_STATUS.cancelled:
      statusClass = 'bg-red-100 text-red-800'
      break;
    case AUCTION_STATUS.completed:
      statusClass = 'bg-green-100 text-green-800'
      break;
    default:
      break;
  }
  return (
    <div className={`text-xs font-medium px-2.5 py-0.5 rounded uppercase ${statusClass}`}>{status}</div>
  )
}

