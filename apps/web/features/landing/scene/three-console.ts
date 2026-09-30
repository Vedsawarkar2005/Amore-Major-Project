import * as THREE from "three";

/*
 * React Three Fiber 9.8 (the latest stable release) creates a THREE.Clock for
 * its render loop, and three.js r183+ logs a deprecation warning whenever a
 * Clock is constructed. The Clock still works; the warning comes from inside
 * R3F and can't be fixed from app code. So drop exactly that message and pass
 * every other three.js log, warning and error through unchanged.
 *
 * Remove this module once R3F stops constructing THREE.Clock.
 */
const ignoredMessages = new Set([
  "THREE.Clock: This module has been deprecated. Please use THREE.Timer instead.",
]);

type StackTraceLike = { getError: (message: string) => Error };

function isStackTrace(value: unknown): value is StackTraceLike {
  return (
    typeof value === "object" &&
    value !== null &&
    "isStackTrace" in value &&
    "getError" in value &&
    typeof (value as any).getError === "function"
  );
}

const threeWithConsole = THREE as unknown as {
  setConsoleFunction?: (fn: (type: "log" | "warn" | "error", message: string, ...params: unknown[]) => void) => void;
};

if (typeof threeWithConsole.setConsoleFunction === "function") {
  threeWithConsole.setConsoleFunction((type, message, ...params) => {
    if (ignoredMessages.has(message)) return;

    // Mirror three.js's default output, including its node-shader stack traces.
    const [first] = params;
    if (isStackTrace(first)) {
      (console as Record<string, any>)[type]?.(first.getError(message));
      return;
    }
    (console as Record<string, any>)[type]?.(message, ...params);
  });
}

