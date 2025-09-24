/** @format */

import { setupWorker } from "msw/browser";
import { mypageHandlers } from "./mypageHandlers";
import { alarmHandlers } from "./alarmHandlers";
import { fatigueHandler } from "./fatigueHandlers";

export const worker = setupWorker(
  ...mypageHandlers,
  ...alarmHandlers,
  ...fatigueHandler
);
