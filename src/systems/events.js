
function setupCarControls(car) {
    window.addEventListener('keydown', (event) => {
        switch (event.key) {
            case 'w':
                car.moveForward();
                break;
            case 's':
                car.moveBackward();
                break;
            case 'a':
                car.rotateLeft();
                break;
            case 'd':
                car.rotateRight();
                break;
        }
    });
}

export {setupCarControls};