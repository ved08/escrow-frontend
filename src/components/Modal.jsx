
import './Modal.css'; // Optional: for styling the modal
import { IoIosClose } from "react-icons/io";
const Modal = ({ show, onClose, children, title }) => {
    if (!show) {
        return null;
    }

    return (
        <div className="modal-overlay">
            <div className="modal-content">
            <h1>{title}</h1>
            <IoIosClose className='close-button' size={40} onClick={onClose}/>
                {children}
            </div>
        </div>
    );
};

export default Modal;
