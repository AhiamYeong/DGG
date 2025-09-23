export type BookmarkRoute = {
  bookmarkRouteId: number;
  name: string;
  departureName: string;
  destinationName: string;
};

export type AddRouteBookmarkRequest = {
  name: string;
  departureName: string;
  destinationName: string;
  routeKey: string;
};

