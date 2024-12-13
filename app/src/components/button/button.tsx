import { Component } from "solid-js";
import './button.css'

type ButtonProps = {
  text: string;
  onClick?: () => void;
  className?: string;
};

const Button: Component<ButtonProps> = (props) => {
  return (
    <button
      class={`btn ${props.className || ""}`}
      onClick={props.onClick}
    >
      {props.text}
    </button>
  );
};

export default Button;
