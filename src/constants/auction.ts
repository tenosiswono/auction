export enum AUCTION_STATUS {
  active = 'active',
  draft = 'draft',
  cancelled = 'cancelled',
  completed = 'completed',
}

export enum EXTENDED_AUCTION_STATUS {
  winner = "Winner!",
  outbid = "Outbid!",
  outbidded = "Outbidded!"
}

export const PUBLIC_STATUS: string[] = [
  AUCTION_STATUS.active,
  AUCTION_STATUS.completed,
];

export const PRIVATE_STATUS: string[] = [
  ...PUBLIC_STATUS,
  AUCTION_STATUS.draft,
  AUCTION_STATUS.cancelled,
];