
const pressedKeys = new Set();

export const inputState = {
  throttle: 0,  // +1 forward, -1 reverse, 0 none
  steer: 0      // -1 left, +1 right, 0 none
};

const KEYMAP = {
  forward: ['w', 'arrowup'],
  backward: ['s', 'arrowdown'],
  left: ['a', 'arrowleft'],
  right: ['d', 'arrowright']
};

let keydownHandler = null;
let keyupHandler = null;

export function addCarMovementEventListener() {
  if (keydownHandler) {
    console.warn('Keyboard controls already initialized');
    return;
  }

  keydownHandler = _handleKeyDown;
  keyupHandler = _handleKeyUp;

  window.addEventListener('keydown', keydownHandler, { passive: false });
  window.addEventListener('keyup', keyupHandler, { passive: true });
}

export function disposeKeyboardControls() {
  if (!keydownHandler) {
    console.warn('Keyboard controls not initialized');
    return;
  }

  window.removeEventListener('keydown', keydownHandler);
  window.removeEventListener('keyup', keyupHandler);

  _resetInputSystem();
}

function _handleKeyDown(event) {
  const key = event.key.toLowerCase();

  _preventDefaultForGameKeys(event, key);
  pressedKeys.add(key);
  _updateInputState();
}

function _handleKeyUp(event) {
  const key = event.key.toLowerCase();

  pressedKeys.delete(key);
  _updateInputState();
}

function _preventDefaultForGameKeys(event, key) {
  const isArrowKey = key.startsWith('arrow');
  const isSpaceKey = key === ' ';

  if (isArrowKey || isSpaceKey) {
    event.preventDefault();
  }
}

function _resetInputSystem() {
  keydownHandler = null;
  keyupHandler = null;
  pressedKeys.clear();
  inputState.throttle = 0;
  inputState.steer = 0;
}

function _updateInputState() {
  const activeActions = _getActiveActions();

  inputState.throttle = _calculateThrottle(activeActions);
  inputState.steer = _calculateSteering(activeActions);
}

function _getActiveActions() {
  return {
    forward: _isActionPressed('forward'),
    backward: _isActionPressed('backward'),
    left: _isActionPressed('left'),
    right: _isActionPressed('right')
  };
}

function _isActionPressed(action) {
  return KEYMAP[action].some(k => pressedKeys.has(k));
}

function _calculateThrottle({ forward, backward }) {
  if (forward && backward) return 0;
  if (forward) return 1;
  if (backward) return -1;
  return 0;
}

function _calculateSteering({ left, right }) {
  if (left && right) return 0;
  if (right) return 1;
  if (left) return -1;
  return 0;
}
