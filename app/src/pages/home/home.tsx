import Layout from "../../components/layout/layout";
import DroneImage from "../../../assets/drone.png";
import "./home.css";
import Button from "../../components/button/button";
import { createSignal } from "solid-js";
import OrderModal from "../../components/modals/order/order";
import OrderCard from "../../components/orderCard/orderCard";
import { useLocation } from "@solidjs/router";
import { v4 as uuidv4 } from "uuid";

interface orderData {
  lat: number;
  lng: number;
  alt: number | null;
}

export default function Home() {
  const [isModalOpen, setModalOpen] = createSignal(false);
  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  const [orderExists, setOrderExists] = createSignal(false);
  const [readyToDisplay, setReadyToDisplay] = createSignal(false);

  const location = useLocation();
  let userID: string | null = location.pathname.slice(1);

  if (!userID) {
    console.log("No user specified");
    userID = localStorage.getItem("userID");
    console.log("LS UID", userID);
    if (!userID) {
      userID = uuidv4();
      localStorage.setItem("userID", userID);
    }
  }

  const createOrder = async ({ lat, lng, alt }: orderData) => {
    console.log(lat, lng, alt);
    try {
      const response = await fetch(
        `https://7d61-5-228-4-0.ngrok-free.app/orders/${userID}`,
        {
          method: "POST",
          body: JSON.stringify({ lat: lat, lon: lng, alt: alt }),
          headers: new Headers({
            "ngrok-skip-browser-warning": "69420",
            "Content-Type": "application/json",
          }),
        }
      );
      if (!response.ok) throw new Error("Failed to create order");
      const taskId = await response.text();
      console.log("Order created, task ID:", taskId);

      // Set flag to true since an order is now active
      setOrderExists(true);
      closeModal();
    } catch (error) {
      console.error("Error creating order:", error);
    }
  };

  const closeOrder = () => {
    setOrderExists(false);
  };

  const fetchOrderStatus = async () => {
    try {
      const response = await fetch(
        `https://7d61-5-228-4-0.ngrok-free.app/orders/status/${userID}`,
        {
          headers: new Headers({
            "ngrok-skip-browser-warning": "69420",
          }),
        }
      );
      if (response.ok) {
        setOrderExists(true);
        return;
      }
    } catch (error) {
      console.error("Error fetching order status:", error);
    }
  };

  fetchOrderStatus().then(() => {
    setReadyToDisplay(true);
  });

  return (
    <Layout>
      {!orderExists() && readyToDisplay() && (
        <div class="home__wrapper">
          <h1 class="home__info-header">
            Добро пожаловать в сервис доставки дронами Donkey!
          </h1>
          <img src={DroneImage} class="home__logo" />
          <p class="home__info-text">
            На данный момент у вас нет активных заказов.
          </p>
          <Button text="Создать заказ" onClick={openModal} />
          {isModalOpen() && (
            <OrderModal
              isModalOpen={isModalOpen}
              closeModal={closeModal}
              processConfirm={createOrder}
            />
          )}
        </div>
      )}
      {orderExists() && readyToDisplay() && (
        <div class="home__wrapper">
          <OrderCard processClose={closeOrder} userID={userID} />
        </div>
      )}
      {!readyToDisplay() && (
        <div class="home__wrapper">
          <div class="loader"></div>
        </div>
      )}
    </Layout>
  );
}
