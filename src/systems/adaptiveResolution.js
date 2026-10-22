// Lowers the render resolution on GPUs that can't hold a smooth frame rate
// (mostly integrated laptop graphics). Only ever steps down, so it can't oscillate.

import { MAX_FPS } from './animate';

// Rendering is capped at MAX_FPS, so step down only when the GPU can't keep up with the cap
const TARGET_FPS = MAX_FPS * 0.9;
const MIN_PIXEL_RATIO = 0.75;
const STEP = 0.25;
const SAMPLE_SECONDS = 2;
// The first moments after Start are slow on every GPU (overlay fade, music starting),
// so they aren't counted; otherwise capable GPUs get downgraded for good.
const WARMUP_SECONDS = 3;

export function createAdaptiveResolution(renderer, composer) {
    let frames = 0;
    let elapsed = 0;
    let warmup = WARMUP_SECONDS;

    // Call once per frame with the frame delta in seconds
    return function update(delta) {
        // Ignore stalls (tab switches, GC pauses) so they don't count as slowness
        if (delta > 0.5) return;

        if (warmup > 0) {
            warmup -= delta;
            return;
        }

        frames++;
        elapsed += delta;
        if (elapsed < SAMPLE_SECONDS) return;

        const fps = frames / elapsed;
        frames = 0;
        elapsed = 0;

        const ratio = renderer.getPixelRatio();
        if (fps >= TARGET_FPS || ratio <= MIN_PIXEL_RATIO) return;

        const newRatio = Math.max(MIN_PIXEL_RATIO, ratio - STEP);
        renderer.setPixelRatio(newRatio);
        composer.setPixelRatio(newRatio);
        console.log(`Adaptive resolution: ${fps.toFixed(0)} fps, pixel ratio ${ratio} -> ${newRatio}`);
    };
}
