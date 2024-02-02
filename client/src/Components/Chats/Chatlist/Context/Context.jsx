import {
    Menu,
    Item,
    Separator,
    Submenu,
    useContextMenu
} from "react-contexify";

import "react-contexify/dist/ReactContexify.css";
import './Context.css'

const MENU_ID = "menu-id";

export default function App({ MENU_ID, onHide,displayConfirm }) {
    function handleItemClick({ event, props, triggerEvent, data }) {
        console.log(props, triggerEvent, data);
    }
    const style = {
        backgroundColor: '#ed80fd', 
        "--contexify-menu-bgColor": "#ed80fd",
        "--contexify-separator-color": "#ffffff",
        "--contexify-item-color": "#ffffff",
        "--contexify-activeItem-color": "#fff",
        "--contexify-activeItem-bgColor": "#5961f9",
        "--contexify-rightSlot-color": "#6f6e77",
        "--contexify-activeRightSlot-color": "#fff",
        "--contexify-arrow-color": "#6f6e77",
        "--contexify-activeArrow-color": "#fff",
    };
    return (
        <div>
            <Menu style={style} onVisibilityChange={onHide} id={MENU_ID}>
                <Item onClick={handleItemClick}>
                    Edit
                </Item>
                <Item onClick={()=>displayConfirm(true)}>
                    Delete
                </Item>
            </Menu>
        </div>
    );
}