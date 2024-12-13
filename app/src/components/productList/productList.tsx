import { createSignal, Show, Component } from "solid-js";
import "./productList.css"; // Import the CSS file
import productIcon from "../../../assets/product.png";

export interface Product {
  name: string;
  icon?: string; // Optional icon URL for products
}

interface ProductDropdownProps {
  products: Product[];
  onSelect: (product: Product) => void;
}

const ProductDropdown: Component<ProductDropdownProps> = (props) => {
  const [isOpen, setIsOpen] = createSignal(false);
  const [selectedProduct, setSelectedProduct] = createSignal<Product | null>(
    null
  );

  const handleSelect = (product: Product) => {
    setSelectedProduct(product);
    props.onSelect(product);
    setIsOpen(false); // Close dropdown after selection
  };

  handleSelect(props.products[0]);

  return (
    <div class="dropdown-container">
      <button class="dropdown-button" onClick={() => setIsOpen(!isOpen())}>
        {selectedProduct()?.name || "Выберите товар"}
        <span>{isOpen() ? "⬆" : "⬇"}</span>
      </button>

      <Show when={isOpen()}>
        <div class="dropdown-menu">
          {props.products.map((product) => (
            <div class="dropdown-item" onClick={() => handleSelect(product)}>
              <img src={product.icon || productIcon} alt="icon" />
              {product.name}
            </div>
          ))}
        </div>
      </Show>
    </div>
  );
};

export default ProductDropdown;
