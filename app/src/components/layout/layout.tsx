import { A } from "@solidjs/router";
import { Component, JSX } from "solid-js";
import './layout.css'

const Layout: Component<{ children: JSX.Element }> = (props) => {
    return (
      <div class='layout-wrapper'>
        {props.children}
      </div>
    );
  };

export default Layout;