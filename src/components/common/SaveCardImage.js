import { useCallback, useEffect, useRef, useState } from "react";

import { toBlob } from "html-to-image";

import { trackEvent } from "../../resources/analytics.js";

// Charts and heatmaps animate in; wait for them to settle before the
// background render so the saved image isn't caught mid-animation.
const PRERENDER_DELAY_MS = 2500;

// 1x1 transparent PNG. Used in place of any image the browser isn't allowed to
// read (no CORS headers), so one bad image leaves a gap instead of failing
// the whole export.
const TRANSPARENT_PIXEL =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

function renderCard(node) {
    const bg = getComputedStyle(document.documentElement).getPropertyValue("--bg-color").trim() || "#0a0e14";
    return toBlob(node, {
        pixelRatio: Math.max(2, window.devicePixelRatio || 1),
        backgroundColor: bg,
        cacheBust: true,
        imagePlaceholder: TRANSPARENT_PIXEL,
    });
}

function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function fileSlug(name) {
    return (name || "my").replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "").toLowerCase() || "my";
}

export default function SaveCardImage({ targetRef, username, year }) {
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState(null);
    const blobRef = useRef(null);

    const filename = `${fileSlug(username)}-rifting-wrapped-${year}.png`;
    const shareText = `My League of Legends ${year}, wrapped. Get yours at riftingwrapped.com #RiftingWrapped`;

    const makeFile = (blob) => new File([blob], filename, { type: "image/png" });

    // Can this browser share image files (mostly mobile)? Probe with an empty
    // PNG since canShare needs a real File to answer.
    const canShareFiles =
        typeof navigator !== "undefined" &&
        typeof navigator.canShare === "function" &&
        navigator.canShare({ files: [new File([""], "probe.png", { type: "image/png" })] });

    // Render ahead of time. iOS Safari only allows navigator.share() shortly
    // after a tap, and rendering can take longer than that, so an image that
    // is already rendered keeps the share sheet from being blocked.
    const prerender = useCallback(async () => {
        if (!targetRef.current) return null;
        const blob = await renderCard(targetRef.current);
        blobRef.current = blob;
        return blob;
    }, [targetRef]);

    useEffect(() => {
        const id = setTimeout(() => {
            prerender().catch((err) => console.warn("Summary card prerender failed:", err));
        }, PRERENDER_DELAY_MS);
        return () => clearTimeout(id);
    }, [prerender]);

    const getBlob = async () => blobRef.current || (await prerender());

    const onShare = async () => {
        setError(null);
        setBusy(true);
        try {
            const blob = await getBlob();
            if (!blob) throw new Error("Nothing to render");
            try {
                await navigator.share({ files: [makeFile(blob)], title: "My Rifting Wrapped", text: shareText });
                trackEvent("share", { method: "image_native" });
            } catch (err) {
                if (err?.name === "AbortError") return; // user closed the share sheet
                // Share was blocked (e.g. the tap "expired" while rendering):
                // fall back to saving the file so the tap still does something.
                downloadBlob(blob, filename);
                trackEvent("share", { method: "image_download" });
            }
        } catch (err) {
            console.error("Failed to create summary image:", err);
            setError("Couldn't create the image. Try taking a screenshot instead.");
        } finally {
            setBusy(false);
        }
    };

    const onDownload = async () => {
        setError(null);
        setBusy(true);
        try {
            const blob = await getBlob();
            if (!blob) throw new Error("Nothing to render");
            downloadBlob(blob, filename);
            trackEvent("share", { method: "image_download" });
        } catch (err) {
            console.error("Failed to create summary image:", err);
            setError("Couldn't create the image. Try taking a screenshot instead.");
        } finally {
            setBusy(false);
        }
    };

    return (
        // stopPropagation: taps here must not also trigger the slide deck's
        // edge-tap navigation.
        <div className="save-card-actions" onClick={(e) => e.stopPropagation()}>
            {canShareFiles &&
                <button type="button" className="shareButton" onClick={onShare} disabled={busy}>
                    {busy ? "Preparing…" : "Share image"}
                </button>
            }
            <button type="button" className="shareButton" onClick={onDownload} disabled={busy}>
                {busy && !canShareFiles ? "Preparing…" : "Save image"}
            </button>
            {error && <p className="save-card-error" role="alert">{error}</p>}
        </div>
    );
}
