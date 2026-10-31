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
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [requestedUrl, setRequestedUrl] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    async function loadImage() {
      // Clean and encode path segments safely without double-encoding
      const cleanPath = storagePath
        .split("/")
        .map((segment) => encodeURIComponent(decodeURIComponent(segment)))
        .join("/");

      // Set to true if the 'Question images' bucket is made public in Supabase
      const IS_BUCKET_PUBLIC = false;

      try {
        if (IS_BUCKET_PUBLIC) {
          const { data } = supabase.storage
            .from("Question images")
            .getPublicUrl(cleanPath);
          const url = data?.publicUrl || null;
          console.info(
            `[QuestionImage] Requested public URL for ${questionNumber}:`,
            url
          );
          if (isCancelled) return;
          setRequestedUrl(url);
          if (url) {
            setImageUrl(url);
          } else {
            setStatus("error");
          }
        } else {
          // Default: 3600 seconds (1 hour) signed URL for private bucket
          const { data, error } = await supabase.storage
            .from("Question images")
            .createSignedUrl(cleanPath, 3600);

          if (isCancelled) return;

          if (error || !data?.signedUrl) {
            console.warn(
              `[QuestionImage] Failed to create signed URL for path "${storagePath}":`,
              error
            );
            const fallbackUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL || "https://xykkmrzuvoqqzjtnyqmc.supabase.co"}/storage/v1/object/sign/Question%20images/${cleanPath}`;
            setRequestedUrl(fallbackUrl);
            setStatus("error");
            return;
          }

          console.info(
            `[QuestionImage] Successfully requested signed URL for ${questionNumber}:`,
            data.signedUrl
          );
          setRequestedUrl(data.signedUrl);
          setImageUrl(data.signedUrl);
        }
      } catch (err) {
        console.warn(`[QuestionImage] Unexpected error loading "${storagePath}":`, err);
        if (isCancelled) return;
        setStatus("error");
      }
    }

    if (storagePath) {
      loadImage();
    }

    return () => {
      isCancelled = true;
    };
  }, [storagePath, questionNumber]);

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
              {requestedUrl && ` [Requested: ${requestedUrl}]`}
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

