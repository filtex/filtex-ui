import React, {createRef} from "react";

import './Filtex.css';

export interface FiltexProps {
}

const Filtex = (props: FiltexProps) => {
    const filtexRef = createRef<HTMLDivElement>();

    return (
        <div className="filtex" ref={filtexRef}>
            Filtex
        </div>
    )
};

export default Filtex;
