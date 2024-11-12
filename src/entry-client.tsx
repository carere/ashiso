// @refresh reload
import { StartClient, mount } from "@solidjs/start/client";

const el = document.getElementById("app");

if (!el) throw new Error("Could not find root element to load application");

mount(() => <StartClient />, el);
