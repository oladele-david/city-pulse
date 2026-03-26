import { InterswitchCheckoutConfig } from "@/types/api";

declare global {
  interface Window {
    webpayCheckout?: (
      request: InterswitchCheckoutConfig["request"] & {
        onComplete: (response: unknown) => void;
      },
    ) => void;
  }
}

const scriptCache = new Map<string, Promise<void>>();

function loadScript(scriptUrl: string) {
  if (!scriptCache.has(scriptUrl)) {
    scriptCache.set(
      scriptUrl,
      new Promise<void>((resolve, reject) => {
        if (typeof window.webpayCheckout === "function") {
          resolve();
          return;
        }

        const existingScript = document.querySelector<HTMLScriptElement>(
          `script[data-interswitch-src="${scriptUrl}"]`,
        );

        if (existingScript) {
          if (existingScript.dataset.loaded === "true") {
            resolve();
            return;
          }

          existingScript.addEventListener("load", () => resolve(), { once: true });
          existingScript.addEventListener(
            "error",
            () => reject(new Error("Could not load Interswitch checkout script.")),
            { once: true },
          );
          return;
        }

        const script = document.createElement("script");
        script.src = scriptUrl;
        script.async = true;
        script.dataset.interswitchSrc = scriptUrl;
        script.onload = () => {
          script.dataset.loaded = "true";
          resolve();
        };
        script.onerror = () =>
          reject(new Error("Could not load Interswitch checkout script."));
        document.body.appendChild(script);
      }),
    );
  }

  return scriptCache.get(scriptUrl)!;
}

export async function openInterswitchCheckout(
  checkout: InterswitchCheckoutConfig,
  onComplete: (response: unknown) => void,
) {
  await loadScript(checkout.scriptUrl);

  if (typeof window.webpayCheckout !== "function") {
    throw new Error("Interswitch checkout is not available on this page.");
  }

  window.webpayCheckout({
    ...checkout.request,
    onComplete,
  });
}
