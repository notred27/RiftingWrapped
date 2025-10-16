import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function KofiWidget() {
  const location = useLocation();

  useEffect(() => {
    const allowedPaths = ["/", "/about", "/faq"];
    const isAllowed = allowedPaths.includes(location.pathname);

    const iframe = document.querySelector("iframe[id^='kofi-wo-container']");

    if (isAllowed) {
      if (window.kofiWidgetOverlay) {
        window.kofiWidgetOverlay.draw("notred27", {
          type: "floating-chat",
          "floating-chat.donateButton.position": "right",
          "floating-chat.donateButton.text": "Support Us",
          "floating-chat.donateButton.background-color": "#ffffff",
          "floating-chat.donateButton.text-color": "#323842",
        });
      }
 
      if (iframe && !iframe.getAttribute("title")) {
        iframe.setAttribute("title", "Ko-fi floating chat widget");
      }
    } else {
      // Remove iframe if leaving allowed page
      if (iframe) iframe.remove();
    }
  }, [location.pathname]);

  return null;
}

export default KofiWidget;
