import { useEffect } from "react";

import { useLocation } from "react-router-dom";

function KofiWidget() {
    const location = useLocation();

    useEffect(() => {
        const allowedPaths = ["/", "/about", "/faq"];
        const isAllowed = allowedPaths.includes(location.pathname);

        if (isAllowed && window.kofiWidgetOverlay) {
            window.kofiWidgetOverlay.draw("notred27", {
                type: "floating-chat",
                "floating-chat.donateButton.position": "right",
                "floating-chat.donateButton.text": "Support Us",
                "floating-chat.donateButton.background-color": "#ffffff",
                "floating-chat.donateButton.text-color": "#323842",
            });

            // Wait for iframe
            const observer = new MutationObserver(() => {
                const iframe = document.querySelector("iframe[id^='kofi-wo-container']");
                if (iframe && !iframe.getAttribute("title")) {
                    iframe.setAttribute("title", "Ko-fi floating support widget");
                    observer.disconnect();
                }
            });

            observer.observe(document.body, { childList: true, subtree: true });
        }

        return () => {
            if (!isAllowed) {
                const iframe = document.querySelector("iframe[id^='kofi-wo-container']");
                if (iframe) iframe.remove();
            }
        };
    }, [location.pathname]);

    return null;
}

export default KofiWidget;
