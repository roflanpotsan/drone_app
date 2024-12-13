import Button from "../../button/button";
import Modal from "../base/base";
import { createEffect, createSignal, onCleanup } from "solid-js";
import Map from "../../map/map";
import "./map.css";

export default function MapModal({
  isModalOpen,
  closeModal,
  coordinates,
}: any) {
  return (
    <Modal isOpen={isModalOpen()} onClose={closeModal}>
      <div class="modal__order__wrapper">
        <div class="modal__order__text-wrap">
          <h2 class="modal__order__text-header">Отслеживание заказа</h2>
          <p class="modal__order__text-info">
            Здесь вы можете отслеживать свой заказ в реальном времени.
          </p>
        </div>
        <div class="modal__order__map">
          <Map
            onCoordinatesChange={() => {
              return;
            }}
            trackingMode={true}
            fixedCoordinates={coordinates()}
          />
        </div>
        <div class="modal__order__button-wrap">
          <Button text="Закрыть" onClick={closeModal} />
        </div>
      </div>
    </Modal>
  );
}
