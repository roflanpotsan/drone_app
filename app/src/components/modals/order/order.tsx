import Button from "../../button/button";
import Modal from "../base/base";
import { createSignal } from "solid-js";
import Map from "../../map/map";
import ProductDropdown from "../../productList/productList";
import { Product } from "../../productList/productList";
import "./order.css";

export default function OrderModal({
  isModalOpen,
  closeModal,
  processConfirm,
}: any) {
  const [selectedProduct, setSelectedProduct] = createSignal<Product | null>(
    null
  );
  const [markerCoords, setMarkerCoords] = createSignal<{
    lat: number;
    lng: number;
    alt?: number | null;
  } | null>(null);
  const [markerAlt, setMarkerAlt] = createSignal<number | null>(null);

  const products: Product[] = [{ name: "Тестовый товар" }];
  return (
    <Modal isOpen={isModalOpen()} onClose={closeModal}>
      <div class="modal__order__wrapper">
        <div class="modal__order__text-wrap">
          <h2 class="modal__order__text-header">Оформление заказа</h2>
          <p class="modal__order__text-info">
            Здесь вы можете оформить заказ. Выберите товар, адрес и этаж, а
            после нажмите "Подтвердить"
            {/* {"Высота " + markerCoords()?.alt} */}
          </p>
        </div>
        <ProductDropdown products={products} onSelect={setSelectedProduct} />
        <div class="modal__order__map">
          <Map onCoordinatesChange={(coords) => setMarkerCoords(coords)} />
        </div>
        <div class="modal__order__button-wrap">
          <Button className="btn-cancel" text="Отмена" onClick={closeModal} />
          <Button
            text="Подтвердить"
            onClick={() => processConfirm(markerCoords())}
          />
        </div>
      </div>
    </Modal>
  );
}
