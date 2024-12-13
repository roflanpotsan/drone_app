import { render } from "solid-js/web";
import { Router } from "@solidjs/router";
import App from "./app";
import './index.css'

render(() => (
    <App />
), document.getElementById("root") as HTMLElement);
