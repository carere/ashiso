import { useSolux } from "@carere/solux";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { RootState } from "./types";

//
// Utils
//

export const cn = (...classLists: ClassValue[]) => twMerge(clsx(classLists));

//
// Store
//

export const useStore = useSolux<RootState, undefined>;
