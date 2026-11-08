"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import jsQR from "jsqr";

import { Button } from "@heroui/react";
import { Icon } from "@iconify/react/dist/iconify.js";

type QrScannerProps = {
  onScan: (code: string) => void;
};

function QrScanner({ onScan }: QrScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const qrCodeRef = useRef<string | null>(null);
  const rafRef = useRef<number | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [isTorchSupported, setIsTorchSupported] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const toggleTorch = useCallback(() => {
    if (!stream) return;
    const track = stream.getVideoTracks()[0];
    let capabilities;
    if ("getCapabilities" in track) {
      capabilities = track.getCapabilities();
    }

    if (capabilities && "torch" in capabilities) {
      let torchState = false;
      if ("getSettings" in track) {
        torchState = (track.getSettings() as any).torch || false;
      }

      if ("applyConstraints" in track) {
        track
          .applyConstraints({
            advanced: [
              { torch: !torchState },
            ] as unknown as MediaTrackConstraintSet[],
          })
          .then(() => {
            setIsTorchOn(!torchState);
          })
          .catch((error) => {
            console.error("Failed to toggle torch:", error);
          });
      }
    }
  }, [stream]);

  const checkTorchSupport = useCallback((s: MediaStream) => {
    const track = s.getVideoTracks()[0];
    if ("getCapabilities" in track) {
      const capabilities = track.getCapabilities();
      if (capabilities && "torch" in capabilities) {
        setIsTorchSupported(true);
      }
    }
  }, []);

  const tick = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.height = video.videoHeight;
      canvas.width = video.videoWidth;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = context.getImageData(
          0,
          0,
          canvas.width,
          canvas.height
        );
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        if (!code) setIsReading(false);
        if (code) setIsReading(true);
        if (code && code.data !== qrCodeRef.current) {
          qrCodeRef.current = code.data;
          onScan(code.data);
        }
      }
    }
    rafRef.current = requestAnimationFrame(tick);
  }, [onScan]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let cancelled = false;
    let acquiredStream: MediaStream | null = null;

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError(
        "La cámara no está disponible. En móvil, la página debe servirse por HTTPS para acceder a la cámara."
      );
      return;
    }

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: { ideal: "environment" } } })
      .then((s) => {
        if (cancelled) {
          s.getTracks().forEach((t) => t.stop());
          return;
        }
        acquiredStream = s;
        setStream(s);
        checkTorchSupport(s);
      })
      .catch((error) => {
        console.error("Error al acceder a los dispositivos multimedia.", error);
        const name = error?.name as string | undefined;
        if (name === "NotAllowedError" || name === "PermissionDeniedError") {
          setCameraError(
            "Permiso de cámara denegado. Habilítalo en los ajustes del navegador."
          );
        } else if (name === "NotFoundError" || name === "OverconstrainedError") {
          setCameraError("No se encontró una cámara disponible en el dispositivo.");
        } else if (name === "NotReadableError") {
          setCameraError("La cámara está en uso por otra aplicación.");
        } else {
          setCameraError(
            "No se pudo iniciar la cámara. Intenta recargar la página."
          );
        }
      });

    return () => {
      cancelled = true;
      if (acquiredStream) {
        acquiredStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [checkTorchSupport]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !stream) return;

    video.srcObject = stream;
    video.setAttribute("playsinline", "true");
    video.muted = true;

    let active = true;
    video
      .play()
      .then(() => {
        if (!active) return;
        rafRef.current = requestAnimationFrame(tick);
      })
      .catch((error) => {
        console.error("Error al reproducir el video:", error);
      });

    return () => {
      active = false;
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      if (video.srcObject) {
        video.srcObject = null;
      }
    };
  }, [stream, tick]);

  if (cameraError) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center gap-2">
        <Icon
          icon="solar:videocamera-record-bold-duotone"
          width={48}
          className="text-danger"
        />
        <p className="text-sm text-danger">{cameraError}</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <video
        ref={videoRef}
        className="w-full rounded-2xl"
        playsInline
        muted
      />
      <canvas ref={canvasRef} className="hidden" />
      {stream && (
        <>
          <div
            className="absolute"
            style={{
              top: "50%",
              left: "50%",
              width: "180px",
              height: "180px",
              transform: "translate(-50%, -50%)",
            }}
          >
            <div
              className={`absolute top-0 left-0 border-t-4 border-l-4 ${
                isReading ? "border-success" : "border-secondary"
              } rounded-tl-lg w-10 h-10 transition-colors duration-200`}
            ></div>
            <div
              className={`absolute top-0 right-0 border-t-4 border-r-4 ${
                isReading ? "border-success" : "border-secondary"
              } rounded-tr-lg w-10 h-10 transition-colors duration-200`}
            ></div>
            <div
              className={`absolute bottom-0 left-0 border-b-4 border-l-4 ${
                isReading ? "border-success" : "border-secondary"
              } rounded-bl-lg w-10 h-10 transition-colors duration-200`}
            ></div>
            <div
              className={`absolute bottom-0 right-0 border-b-4 border-r-4 ${
                isReading ? "border-success" : "border-secondary"
              } rounded-br-lg w-10 h-10 transition-colors duration-200`}
            ></div>
          </div>
          {isTorchSupported && (
            <Button
              isIconOnly
              variant="light"
              onClick={toggleTorch}
              className="absolute bottom-4 right-4"
            >
              <Icon
                icon={
                  isTorchOn
                    ? "solar:flashlight-line-duotone"
                    : "solar:flashlight-on-line-duotone"
                }
                width="24"
              />
            </Button>
          )}
        </>
      )}
    </div>
  );
}

export default QrScanner;
