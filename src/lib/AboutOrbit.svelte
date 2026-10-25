<script>
    import { onMount } from "svelte";

    let x = $state(0);
    let y = $state(0);
    let rotation = $state(0);

    let pointerX = 0;
    let pointerY = 0;
    let pointerSpeed = 0;
    let previousPointerX = 0;
    let previousPointerY = 0;

    let vx = 0;
    let vy = 0;
    let frame;
    let active = false;

    const SIZE = 200;
    const RADIUS = 100;

    onMount(() => {
        const initialize = () => {
            x = window.innerWidth * 0.76;
            y = window.innerHeight * 0.32;
        };

        initialize();

        pointerX = window.innerWidth / 2;
        pointerY = window.innerHeight / 2;

        function onPointerMove(event) {
            const dx = event.clientX - previousPointerX;
            const dy = event.clientY - previousPointerY;

            pointerSpeed = Math.min(Math.hypot(dx, dy), 40);

            previousPointerX = event.clientX;
            previousPointerY = event.clientY;

            pointerX = event.clientX;
            pointerY = event.clientY;
            active = true;
        }

        function animate() {
            // Il puntatore genera una spinta quando si avvicina al globo.
            const dx = x - pointerX;
            const dy = y - pointerY;
            const distance = Math.max(Math.hypot(dx, dy), 1);

            const influence = Math.max(0, 1 - distance / 300);

            if (active && influence > 0) {
                const force = influence * (0.75 + pointerSpeed * 0.045);
                vx += (dx / distance) * force;
                vy += (dy / distance) * force;
            }

            // Inerzia: il globo continua a muoversi, poi rallenta.
            vx *= 0.986;
            vy *= 0.986;

            x += vx;
            y += vy;

            // Rimbalzo morbido ai bordi dello schermo.
            const margin = SIZE * 0.55;

            if (x < margin) {
                x = margin;
                vx = Math.abs(vx) * 0.75;
            } else if (x > window.innerWidth - margin) {
                x = window.innerWidth - margin;
                vx = -Math.abs(vx) * 0.75;
            }

            if (y < margin) {
                y = margin;
                vy = Math.abs(vy) * 0.75;
            } else if (y > window.innerHeight - margin) {
                y = window.innerHeight - margin;
                vy = -Math.abs(vy) * 0.75;
            }

            rotation += 0.12 + pointerSpeed * 0.012;
            pointerSpeed *= 0.94;

            frame = requestAnimationFrame(animate);
        }

        window.addEventListener("pointermove", onPointerMove, {
            passive: true,
        });

        frame = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener("pointermove", onPointerMove);
            cancelAnimationFrame(frame);
        };
    });
</script>

<div
    class="orbit-layer"
    aria-hidden="true"
    style={`--x: ${x - RADIUS}px; --y: ${y - RADIUS}px;`}
>
    <svg
        class="orbit-art"
        width={SIZE}
        height={SIZE}
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
    >
        <defs>
            <path
                id="southering-orbit"
                d="M 100,100 m -88,0 a 88,88 0 1,1 176,0 a 88,88 0 1,1 -176,0"
            />
            <clipPath id="globe-clip">
                <circle cx="100" cy="100" r="57" />
            </clipPath>
        </defs>

        <!-- Orbita tipografica -->
        <g
            class="orbit-type"
            style={`transform: rotate(${-rotation * 0.38}deg);`}
        >
            <text>
                <textPath href="#southering-orbit" startOffset="0%"
                    >SOUTHERING DECOLONIALITY · SOUTHERING DECOLONIALITY ·
                </textPath>
            </text>
        </g>

        <!-- Globo inciso -->
        <g class="globe" style={`transform: rotate(${rotation}deg);`}>
            <circle cx="100" cy="100" r="57" />

            <g clip-path="url(#globe-clip)">
                <ellipse cx="100" cy="100" rx="24" ry="57" />
                <ellipse cx="100" cy="100" rx="43" ry="57" />
                <ellipse cx="100" cy="100" rx="57" ry="21" />
                <ellipse cx="100" cy="100" rx="57" ry="40" />
                <path d="M43 100 H157" />
                <path d="M48 78 Q100 95 152 78" />
                <path d="M48 122 Q100 105 152 122" />
            </g>

            <path d="M100 43 V157" />
        </g>
    </svg>
</div>

<style>
    .orbit-layer {
        position: fixed;
        z-index: 110;
        top: 0;
        left: 0;
        width: 200px;
        height: 200px;
        pointer-events: none;
        user-select: none;
        opacity: 1;
        transform: translate3d(var(--x), var(--y), 0);
        will-change: transform;
        color: currentColor;
    }

    .orbit-art {
        display: block;
        overflow: visible;
    }

    .globe {
        transform-box: view-box;
        transform-origin: 100px 100px;
        fill: none;
        stroke: currentColor;
        stroke-width: 0.8;
    }

    .orbit-type {
        transform-box: view-box;
        transform-origin: 100px 100px;
        fill: currentColor;
    }

    .orbit-type text {
        font-family: VT323, monospace !important;
        font-size: 15px;
        font-weight: 500;
        letter-spacing: 1.8px;
    }

    @media (max-width: 640px) {
        .orbit-layer {
            opacity: 0.58;
            transform: translate3d(var(--x), var(--y), 0) scale(0.78);
            transform-origin: top left;
        }
    }

    @media (prefers-reduced-motion: reduce) {
        .orbit-layer {
            opacity: 1;
        }
    }
</style>
