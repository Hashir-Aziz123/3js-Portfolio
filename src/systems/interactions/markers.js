import * as THREE from 'three';

// Pulsing labels floating above the main interactive objects (styled in styles/style.css).
// They only show in the room view, and clicking or tapping one does the same as clicking
// its object, which gives phones a bigger target. A marker dims once its object is visited.
const HEIGHT_ABOVE_OBJECT = 0.12;
const LIFT_PX = 18; // extra screen space so markers sit clear of their objects
const GAP_PX = 4;

// Objects close together (the phone and printer, especially on small screens) would put
// their markers on top of each other, so markers higher on screen are nudged up until
// they clear the ones below.
function separate(placed) {
    const overlaps = (a, b) =>
        a.left < b.left + b.item.size.width && b.left < a.left + a.item.size.width &&
        a.top < b.top + b.item.size.height + GAP_PX && b.top < a.top + a.item.size.height + GAP_PX;

    placed.sort((a, b) => b.top - a.top); // lowest on screen first
    placed.forEach((marker, i) => {
        for (const below of placed.slice(0, i)) {
            if (overlaps(marker, below)) marker.top = below.top - marker.item.size.height - GAP_PX;
        }
    });
}

// entries: [{ object, label, onClick, nudge? }]; nudge = { x, y } in screen px for a
// marker that needs moving off something in the starting view
export function createMarkers(camera, entries) {
    const layer = document.createElement('div');
    layer.id = 'markers';
    document.body.appendChild(layer);

    const state = { hovered: null };

    const items = entries.map(({ object, label, onClick, nudge = { x: 0, y: 0 } }) => {
        // The room never moves, so the anchor above the object is worked out once
        const box = new THREE.Box3().setFromObject(object);
        const anchor = new THREE.Vector3(
            (box.min.x + box.max.x) / 2,
            box.max.y + HEIGHT_ABOVE_OBJECT,
            (box.min.z + box.max.z) / 2
        );

        const element = document.createElement('button');
        element.className = 'marker';
        element.innerHTML = `<span class="marker-dot"></span><span class="marker-label">${label}</span>`;
        element.addEventListener('click', onClick);
        element.addEventListener('mouseenter', () => { state.hovered = object; });
        element.addEventListener('mouseleave', () => { state.hovered = null; });
        layer.appendChild(element);

        return { object, anchor, element, nudge };
    });

    const projected = new THREE.Vector3();

    return {
        // The object whose marker is under the mouse, if any
        get hovered() {
            return state.hovered;
        },

        // Call every frame; markers follow their objects on screen while visible
        update(visible) {
            layer.classList.toggle('hidden', !visible);
            if (!visible) {
                state.hovered = null;
                return;
            }

            const placed = items.map((item) => {
                projected.copy(item.anchor).project(camera);
                const onScreen = projected.z < 1 && Math.abs(projected.x) <= 1 && Math.abs(projected.y) <= 1;
                item.element.style.visibility = onScreen ? '' : 'hidden';

                item.size ??= { width: item.element.offsetWidth, height: item.element.offsetHeight };
                // Screen rect, with the pill centered over its object
                const left = (projected.x + 1) / 2 * window.innerWidth - item.size.width / 2 + item.nudge.x;
                const top = (1 - projected.y) / 2 * window.innerHeight - item.size.height / 2 - LIFT_PX + item.nudge.y;
                return { item, left, top, onScreen };
            });

            separate(placed.filter((p) => p.onScreen));

            placed.forEach(({ item, left, top }) => {
                item.element.style.transform = `translate(${left}px, ${top}px)`;
            });
        },

        markVisited(object) {
            items.find((item) => item.object === object)?.element.classList.add('visited');
        }
    };
}
