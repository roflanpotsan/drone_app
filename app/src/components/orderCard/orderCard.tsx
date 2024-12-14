import "./orderCard.css";
import QrModal from "../modals/qr/qr";
import MapModal from "../modals/map/map";

import ProductImg from "../../../assets/product.png";
import Button from "../button/button";
import { createEffect, createSignal, onCleanup } from "solid-js";
import { API_URL } from "../../settings";

const STATUS = {
  none: "Ожидание",
  take_off: "Взлёт",
  on_the_way: "В пути",
  descending: "Спуск",
  search_qr: "Поиск QR-кода",
  finished_successful: "Успех",
  finished_unsuccessful: "Возврат",
};

const STATUS_CLR = {
  none: "color-process",
  take_off: "color-process",
  on_the_way: "color-process",
  descending: "color-process",
  search_qr: "color-process",
  finished_successful: "color-ok",
  finished_unsuccessful: "color-fail",
};

type STATUS_KEY = keyof typeof STATUS;

export default function OrderCard({ processClose, userID }: any) {
  const [isQrModalOpen, setQrModalOpen] = createSignal(false);
  const openQrModal = () => setQrModalOpen(true);
  const closeQrModal = () => setQrModalOpen(false);

  const [isMapModalOpen, setMapModalOpen] = createSignal(false);
  const openMapModal = () => setMapModalOpen(true);
  const closeMapModal = () => setMapModalOpen(false);

  const [coordinates, setCoordinates] = createSignal({
    lat: 55.7558,
    lng: 37.6173,
    alt: 0,
  });

  const [status, setStatus] = createSignal<STATUS_KEY>("none");
  const [orderID, setOrderID] = createSignal(null);

  const [readyToDisplay, setReadyToDisplay] = createSignal(false);

  createEffect(() => {
    const fetchOrderStatus = async () => {
      try {
        const response = await fetch(`${API_URL}/orders/status/${userID}`, {
          headers: new Headers({
            "ngrok-skip-browser-warning": "69420",
          }),
        });
        if (!response.ok) {
          if (response.status === 404) {
            console.error("Order not found.");
            processClose();
          } else {
            console.error("Failed to fetch order status.");
          }
          return;
        }
        const data = await response.json();
        console.log(data);
        setReadyToDisplay(true);

        // Assuming `data` contains lat, lng, and alt
        if (!orderID()) {
          if (data.id) setOrderID(data.id);
        }

        if (data.status) {
          setStatus(data.status);
        }

        if (data.geo.lat && data.geo.lon) {
          setCoordinates({
            lat: data.geo.lat,
            lng: data.geo.lon,
            alt: data.geo.alt || 0, // Provide a default value for alt if not present
          });
        } else {
          console.error("Invalid data received from the API.");
        }
      } catch (error) {
        console.error("Error fetching order status:", error);
      }
    };

    const interval = setInterval(fetchOrderStatus, 1000); // Fetch every second

    onCleanup(() => clearInterval(interval)); // Clean up the interval
  });

  return (
    <>
      {readyToDisplay() && (
        <div class="order-card__wrapper">
          <div class="order-card__header">
            <img class="order-card__logo" src={ProductImg}></img>
            <h1 class="order-card__header__text">Заказ</h1>
          </div>
          <span class="order-card__info__text">id: {orderID()}</span>
          <div class="order-card__info-row">
            <span class={STATUS_CLR[status()]}>{STATUS[status()]}</span>
          </div>
          <div class="order-card__button-row">
            <Button
              text=""
              className="icon-btn icon-map"
              onClick={openMapModal}
            />
            <Button
              text=""
              className="icon-btn icon-qr"
              onClick={openQrModal}
            />
          </div>
          {(status() === "finished_successful" ||
            status() === "finished_unsuccessful") && (
            <Button
              text="Закрыть"
              className="order-card__btn"
              onClick={processClose}
            />
          )}
          {isQrModalOpen() && (
            <QrModal
              isModalOpen={isQrModalOpen}
              closeModal={closeQrModal}
              qrValue={orderID()}
            />
          )}
          {isMapModalOpen() && (
            <MapModal
              isModalOpen={isMapModalOpen}
              closeModal={closeMapModal}
              coordinates={coordinates}
            />
          )}
        </div>
      )}
      {!readyToDisplay() && <div class="loader"></div>}
    </>
  );
}
