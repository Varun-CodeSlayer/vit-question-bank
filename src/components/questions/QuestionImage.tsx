/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export interface QuestionImageProps {
  storagePath: string;
  questionNumber: string;
}

export default function QuestionImage({
  storagePath,
  questionNumber,
}: QuestionImageProps) {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">(() =>
    storagePath ? "loading" : "error"
  );
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Clean path safely without double-encoding
  const cleanPath = storagePath
    ? storagePath
        .split("/")
        .map((segment) => encodeURIComponent(decodeURIComponent(segment)))
        .join("/")
    : "";

  const { data } = supabase.storage
    .from("Question images")
    .getPublicUrl(cleanPath);

  const imageUrl = data?.publicUrl || null;

  // Handle ESC key to close lightbox
  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setLightboxOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen]);

  const altText = `Diagram for ${questionNumber}`;

  return (
    <div className="qimage-wrap">
      {status === "loading" && (
        <div className="qimage-skeleton" aria-busy="true" aria-label="Loading diagram...">
          <svg className="ic s" viewBox="0 0 24 24" aria-hidden="true" style={{ animation: "spin 1.5s linear infinite" }}>
            <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="12" />
          </svg>
          <span>Loading diagram for {questionNumber}...</span>
        </div>
      )}

      {status === "error" && (
        <div className="qimage-unavailable" role="status" aria-label="Diagram unavailable">
          <div className="qimage-unavailable-icon">
            <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
            </svg>
          </div>
          <div className="qimage-unavailable-text">
            <strong>Image unavailable</strong>
            <small>
              The diagram for {questionNumber} ({storagePath}) is not yet available in storage.
            </small>
          </div>
        </div>
      )}

      {imageUrl && status !== "error" && (
        <div
          className="qimage-container"
          style={{
            display: status === "loaded" ? "inline-block" : "block",
            position: status === "loaded" ? "relative" : "absolute",
            opacity: status === "loaded" ? 1 : 0,
            pointerEvents: status === "loaded" ? "auto" : "none",
            height: status === "loaded" ? "auto" : 0,
            overflow: "hidden",
          }}
          onClick={() => setLightboxOpen(true)}
          role="button"
          tabIndex={0}
          aria-label={`Enlarge diagram for ${questionNumber}`}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setLightboxOpen(true);
            }
          }}
        >
          <img
            src={imageUrl}
            alt={altText}
            className="qimage-img"
            onLoad={() => setStatus("loaded")}
            onError={() => {
              console.warn(
                `[QuestionImage] Failed to render image at "${imageUrl}" for ${questionNumber}`
              );
              setStatus("error");
            }}
          />
          {status === "loaded" && (
            <div className="qimage-zoom-hint" aria-hidden="true">
              <svg className="ic s" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
                <path d="M11 8v6M8 11h6" />
              </svg>
              <span>Click to zoom</span>
            </div>
          )}
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxOpen && imageUrl && (
        <div
          className="qimage-lightbox-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label={`Enlarged ${altText}`}
          onClick={() => setLightboxOpen(false)}
        >
          <div
            className="qimage-lightbox-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="qimage-lightbox-close"
              onClick={() => setLightboxOpen(false)}
              aria-label="Close enlarged diagram"
            >
              <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
            <img
              src={imageUrl}
              alt={altText}
              className="qimage-lightbox-img"
            />
            <div className="qimage-lightbox-caption">
              {altText} · Click backdrop or press Esc to close
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

