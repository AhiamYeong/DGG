/** @format */

import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";
import { alarmHandlers } from "./alarmHandlers";
import { fatigueHandler } from "./fatigueHandlers";

export const worker = setupWorker(
  ...handlers,
  ...alarmHandlers,
  ...fatigueHandler
);
