/** @format */

import { setupWorker } from "msw/browser";
import { mypageHandlers } from "./mypageHandlers";
import { alarmHandlers } from "./alarmHandlers";
import { fatigueHandler } from "./fatigueHandlers";
import { routeHandlers } from "./routeHandlers";
import { placeSearchHandlers } from "./placeSearchHandlers";
import { favoritePlacesHandlers } from "./favoritePlacesHandlers";
import { searchHistoryHandlers } from "./searchHistoryHandlers";
import { bookmarkHandlers } from "./bookmarkHandlers";

export const worker = setupWorker(
  ...mypageHandlers,
  ...alarmHandlers,
  ...fatigueHandler,
  ...routeHandlers,
  ...placeSearchHandlers,
  ...favoritePlacesHandlers,
  ...searchHistoryHandlers,
  ...bookmarkHandlers
);
