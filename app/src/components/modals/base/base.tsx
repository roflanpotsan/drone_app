import { createSignal, onMount, onCleanup } from "solid-js";
import "./base.css";

type ModalProps = {
  isOpen: boolean; // Controls whether the modal is visible
  onClose: () => void; // Callback to close the modal
  children: any; // Content to display inside the modal
};

const Modal = (props: ModalProps) => {
  let dialogRef: HTMLDialogElement | undefined;

  onMount(() => {
    if (props.isOpen) {
      dialogRef?.showModal();
    }
  });

  onCleanup(() => {
    dialogRef?.close();
  });

  return (
    <dialog ref={dialogRef} class="base-modal">
      <div>{props.children}</div>
    </dialog>
  );
};

export default Modal;
