/** @format */

import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";
import { alarmHandlers } from "./alarmHandlers";
import { fatigueHandler } from "./fatigueHandlers";
import { routeHandlers } from "./routeHandlers";
import { placeSearchHandlers } from "./placeSearchHandlers";
import { favoritePlacesHandlers } from "./favoritePlacesHandlers";
import { searchHistoryHandlers } from "./searchHistoryHandlers";
import { bookmarkHandlers } from "./bookmarkHandlers";

export const worker = setupWorker(
  ...handlers,
  ...alarmHandlers,
  ...fatigueHandler,
  ...routeHandlers,
  ...placeSearchHandlers,
  ...favoritePlacesHandlers,
  ...searchHistoryHandlers,
  ...bookmarkHandlers
);
