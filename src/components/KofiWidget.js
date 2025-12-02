// src/components/KoFiWidget.jsx
import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

const KOFI_SRC = "https://storage.ko-fi.com/scripts/overlay-widget.js";
const KOFI_USERNAME = "notred27";

export default function KoFiWidget({ allowedPaths = ["/", "/about", "/faq"] } = {}) {
  const location = useLocation();

  // refs to avoid re-injects / re-draws
  const scriptInjectedRef = useRef(false); // script tag present or injected
  const drewRef = useRef(false); // whether .draw has been called
  const observerRef = useRef(null);
  const idleHandleRef = useRef(null);
  const gestureHandlerRef = useRef(null);

  // helper: check if script already exists on the page
  const scriptAlreadyPresent = () =>
    !!document.querySelector(`script[src^="${KOFI_SRC.replace(/^[^:]+:\/\//, "")}"]`) ||
    !!document.querySelector(`script[src="${KOFI_SRC}"]`);

  // inject script and init (idempotent)
  const injectScriptAndInit = () => {
    if (scriptInjectedRef.current) {
      // already injected: try to init immediately if overlay object exists
      initIfReady();
      return;
    }

    if (scriptAlreadyPresent()) {
      scriptInjectedRef.current = true;
      initIfReady();
      return;
    }

    // create script tag
    const s = document.createElement("script");
    s.src = KOFI_SRC;
    s.async = true;
    s.onload = () => {
      scriptInjectedRef.current = true;
      initIfReady();
    };
    s.onerror = () => {
      // don't spam retries; we could set a retry policy here if desired
      console.warn("Ko-fi widget failed to load");
    };
    document.body.appendChild(s);
    scriptInjectedRef.current = true;
  };

  // initialize overlay if the global API is available
  const initIfReady = () => {
    if (drewRef.current) return; // already drawn

    if (typeof window !== "undefined" && window.kofiWidgetOverlay && allowedPaths.includes(location.pathname)) {
      try {
        window.kofiWidgetOverlay.draw(KOFI_USERNAME, {
          type: "floating-chat",
          "floating-chat.donateButton.position": "right",
          "floating-chat.donateButton.text": "Support Us",
          "floating-chat.donateButton.background-color": "#ffffff",
          "floating-chat.donateButton.text-color": "#323842",
        });
        drewRef.current = true;

        // Accessibility: set iframe title once it appears
        observerRef.current = new MutationObserver(() => {
          const iframe = document.querySelector("iframe[id^='kofi-wo-container']");
          if (iframe && !iframe.getAttribute("title")) {
            iframe.setAttribute("title", "Ko-fi floating support widget");
            if (observerRef.current) {
              observerRef.current.disconnect();
              observerRef.current = null;
            }
          }
        });
        observerRef.current.observe(document.body, { childList: true, subtree: true });
      } catch (err) {
        console.error("Ko-fi init failed:", err);
      }
    }
  };

  // remove iframe(s) if we leave allowed path
  const removeKofiIframe = () => {
    const iframes = document.querySelectorAll("iframe[id^='kofi-wo-container']");
    iframes.forEach((f) => f.remove());
    drewRef.current = false;
  };

  useEffect(() => {
    const isAllowed = allowedPaths.includes(location.pathname);

    // If we're on an allowed route, schedule loading (idle) and also attach gesture loader
    if (isAllowed) {
      // If overlay already available, init immediately
      if (typeof window !== "undefined" && window.kofiWidgetOverlay) {
        initIfReady();
        return;
      }

      // schedule via requestIdleCallback (or fallback setTimeout)
      if ("requestIdleCallback" in window) {
        idleHandleRef.current = requestIdleCallback(() => injectScriptAndInit(), { timeout: 2000 });
      } else {
        idleHandleRef.current = setTimeout(() => injectScriptAndInit(), 1200);
      }

      // but also load on first user gesture in case idle takes too long
      const userGesture = () => {
        injectScriptAndInit();
        // cleanup gesture listeners once invoked
        window.removeEventListener("click", gestureHandlerRef.current);
        window.removeEventListener("keydown", gestureHandlerRef.current);
      };
      gestureHandlerRef.current = userGesture;
      window.addEventListener("click", userGesture, { once: true, passive: true });
      window.addEventListener("keydown", userGesture, { once: true, passive: true });

      // try immediate init in case script already loaded earlier by other code
      initIfReady();
    } else {
      // Not allowed path: ensure iframe removed and stop any scheduled loads
      if (idleHandleRef.current) {
        if ("cancelIdleCallback" in window && typeof idleHandleRef.current === "number") {
          cancelIdleCallback(idleHandleRef.current);
        } else {
          clearTimeout(idleHandleRef.current);
        }
        idleHandleRef.current = null;
      }
      // remove gesture listeners in case present
      if (gestureHandlerRef.current) {
        window.removeEventListener("click", gestureHandlerRef.current);
        window.removeEventListener("keydown", gestureHandlerRef.current);
        gestureHandlerRef.current = null;
      }
      // remove any existing iframe overlay
      removeKofiIframe();
    }

    // cleanup when this component unmounts or location changes
    return () => {
      if (idleHandleRef.current) {
        if ("cancelIdleCallback" in window && typeof idleHandleRef.current === "number") {
          cancelIdleCallback(idleHandleRef.current);
        } else {
          clearTimeout(idleHandleRef.current);
        }
        idleHandleRef.current = null;
      }
      if (gestureHandlerRef.current) {
        window.removeEventListener("click", gestureHandlerRef.current);
        window.removeEventListener("keydown", gestureHandlerRef.current);
        gestureHandlerRef.current = null;
      }
      // don't aggressively remove the script tag; only remove iframe if leaving allowed routes
      if (!allowedPaths.includes(location.pathname)) {
        removeKofiIframe();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, JSON.stringify(allowedPaths)]); // rerun when path changes

  return null;
}
