// Phones and tablets (a finger as the main pointer). Touchscreen laptops report a mouse.
export const isTouch = window.matchMedia('(pointer: coarse)').matches;
