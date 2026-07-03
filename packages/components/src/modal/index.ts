import Close from './Close';
import ModalComponent from './Modal';
import Portal from './Portal';
import { Body, Footer, Header } from './Section';
import Trigger from './Trigger';

/**
 * @category Components
 */
const Modal = Object.assign(ModalComponent, {
    Trigger,
    Portal,
    Header,
    Body,
    Footer,
    Close,
});

export type * from './interfaces';
export default Modal;
