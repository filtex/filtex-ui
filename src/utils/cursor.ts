const getCursorState = (el: any, start: number) => {
    const coordinates = getCoordinates(el, start);
    const x = el.offsetLeft - el.scrollLeft + coordinates.x;
    const y = el.offsetTop - el.scrollTop + coordinates.y;

    const inXBounds = el.offsetLeft <= x && x <= el.offsetLeft + el.offsetWidth;
    const inYBounds = el.offsetTop <= y && y <= el.offsetTop + el.offsetHeight;
    const isInBounds = inXBounds && inYBounds;

    return {
        coordinates: { x, y },
        isInBounds
    };
};

const getCoordinates = (el: any, selectionPoint: number) => {
    const { offsetLeft: inputX, offsetTop: inputY } = el;

    const div = document.createElement('div');

    const copyStyle: any = getComputedStyle(el);
    for (const prop of copyStyle) {
        div.style[prop] = copyStyle[prop];
    }

    const swap = '.';
    const inputValue = el.tagName === 'INPUT' ? el.value.replace(/ /g, swap) : el.innerHTML;

    div.textContent = inputValue.substr(0, selectionPoint);

    if (el.tagName === 'TEXTAREA') {
        div.style.height = 'auto';
    }

    if (el.tagName === 'TEXTAREA') {
        div.style.width = 'auto';
    }

    const span = document.createElement('span');

    span.textContent = inputValue.substr(selectionPoint) || '.';

    div.appendChild(span);

    document.body.appendChild(div);

    const { offsetLeft: spanX, offsetTop: spanY } = span;

    document.body.removeChild(div);

    return {
        x: inputX + spanX,
        y: inputY + spanY
    };
}

export { getCursorState };
