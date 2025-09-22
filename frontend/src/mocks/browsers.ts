/** @format */

import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";
import { alarmHandlers } from "./alarmHandlers";

export const worker = setupWorker(...handlers, ...alarmHandlers);
