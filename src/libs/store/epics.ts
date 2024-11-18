import type { AppEpic, SaveState } from "@/libs/types";
import type { Event } from "@carere/solux";
import { mapValues } from "radash";
import { debounceTime, filter, of, switchMap, tap } from "rxjs";
import { toast } from "solid-sonner";
import {
  addNewCandle,
  fetching,
  loading,
  setCandles,
  stateSaved,
  updateBackTestCurrentTime,
  updateCurrentCandle,
  updateIndicators,
} from "./events";

export const saveStateEpic: AppEpic = (event$, state) =>
  event$.pipe(
    filter<Event>(
      ({ type }) =>
        ![
          loading.type,
          stateSaved.type,
          setCandles.type,
          updateCurrentCandle.type,
          addNewCandle.type,
          updateBackTestCurrentTime.type,
          updateIndicators.type,
          fetching.type,
        ].includes(type),
    ),
    debounceTime(3000),
    switchMap(() => {
      const stateToSave: SaveState = {
        sessions: {
          ...state.sessions,
          entities: mapValues(state.sessions.entities, (s) => ({
            ...s,
            charts: mapValues(s.charts, (c) => ({
              ...c,
              fetching: false,
            })),
            indicators: {},
            candles: {},
          })),
        },
      };

      localStorage.setItem("ashiso-state", JSON.stringify(stateToSave));

      return of(stateSaved());
    }),
    tap(() => toast("State saved")),
  );
