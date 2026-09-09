/**
 * Rejects if a promise doesn't settle within `ms`, so a hung network call
 * (e.g. Firestore failing to connect inside a webview) surfaces a visible
 * error instead of an infinite spinner. The thrown error carries
 * `code = "app/timeout"` so the UI can show a clear, translated message.
 */
export function withTimeout<T>(promise: Promise<T>, ms = 20000): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      const err = new Error("Request timed out") as Error & { code: string };
      err.code = "app/timeout";
      reject(err);
    }, ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}
