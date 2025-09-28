/** @format */

import { setupWorker } from "msw/browser";
import { mypageHandlers } from "./mypageHandlers";
import { alarmHandlers } from "./alarmHandlers";
import { fatigueHandler } from "./fatigueHandlers";
import { routeHandlers } from "./routeHandlers";
// import { placeSearchHandlers } from "./placeSearchHandlers"; // 장소 검색은 실제 백엔드 API 사용
import { favoritePlacesHandlers } from "./favoritePlacesHandlers";
import { bookmarkHandlers } from "./bookmarkHandlers";
import { mainPageHandler } from "./mainPageHandlers";

export const worker = setupWorker(
  ...mypageHandlers,
  ...alarmHandlers,
  ...fatigueHandler,
  ...routeHandlers,
  // ...placeSearchHandlers, // 장소 검색은 실제 백엔드 API 사용
  ...favoritePlacesHandlers,
  ...bookmarkHandlers,
  ...mainPageHandler
);
