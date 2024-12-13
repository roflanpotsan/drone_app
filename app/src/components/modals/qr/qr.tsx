import Button from "../../button/button";
import Modal from "../base/base";
import { createEffect } from "solid-js";
import QRCode from "qrcode";
import "./qr.css";

export default function QrModal({ isModalOpen, closeModal, qrValue }: any) {
  let qrCanvasRef: HTMLCanvasElement | null = null;

  createEffect(() => {
    if (isModalOpen() && qrCanvasRef) {
      // Generate QR code on modal open
      QRCode.toCanvas(
        qrCanvasRef,
        qrValue,
        { width: 200, margin: 1 },
        (error) => {
          if (error) console.error("QR Code generation failed:", error);
        }
      );
    }
  });

  return (
    <Modal isOpen={isModalOpen()} onClose={closeModal}>
      <div class="modal__order__wrapper">
        <div class="modal__order__text-wrap">
          <h2 class="modal__order__text-header">QR-код</h2>
          <p class="modal__order__text-info">
            Ваш Qr-код для получения заказа.
          </p>
        </div>
        <div class="modal__order__map">
          <canvas
            ref={(el) => (qrCanvasRef = el)}
            class="modal__qr-canvas"
          ></canvas>
        </div>
        <div class="modal__order__button-wrap">
          <Button text="Закрыть" onClick={closeModal} />
        </div>
      </div>
    </Modal>
  );
}
