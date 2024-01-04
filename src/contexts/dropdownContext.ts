import React from "react";

export const DropdownContext = React.createContext({
    options: { hidden: true },
    setOptions: (_: any) => {}
});
