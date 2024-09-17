const canvas = document.getElementById('waterCanvas');
const ctx = canvas.getContext('2d');

// Set canvas dimensions
canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;

// Variables for water simulation
const numPoints = 200; // Number of points on the surface
const waterHeight = canvas.height * 0.5;
const damping = 0.98; // Friction of the water
const tension = 0.025; // Spring constant for water waves

let points = new Array(numPoints).fill(0).map(() => waterHeight);
let velocities = new Array(numPoints).fill(0);

// Mouse position
let mouseX = null;
let mouseY = null;

// Event Listener for Mouse Move
canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = event.clientX - rect.left;
    mouseY = event.clientY - rect.top;

    const segmentWidth = canvas.width / numPoints;
    const hoverIndex = Math.floor(mouseX / segmentWidth);
    if (hoverIndex >= 0 && hoverIndex < numPoints) {
        velocities[hoverIndex] = -10; // Create an initial disturbance
    }
});

// Water wave physics simulation
function updateWater() {
    for (let i = 0; i < numPoints; i++) {
        // Calculate spring forces
        const left = i > 0 ? points[i - 1] : points[i];
        const right = i < numPoints - 1 ? points[i + 1] : points[i];
        const force = tension * (left + right - 2 * points[i]);

        // Update velocity and apply damping
        velocities[i] += force;
        velocities[i] *= damping;

        // Update position
        points[i] += velocities[i];
    }

    // Spread waves to neighboring points
    for (let i = 0; i < numPoints; i++) {
        if (i > 0) velocities[i - 1] += (points[i] - points[i - 1]) * 0.1;
        if (i < numPoints - 1) velocities[i + 1] += (points[i] - points[i + 1]) * 0.1;
    }
}

// Render the water surface
function renderWater() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const segmentWidth = canvas.width / numPoints;

    ctx.fillStyle = '#0077b6'; // Water color
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    ctx.lineTo(0, points[0]);

    for (let i = 1; i < numPoints; i++) {
        ctx.lineTo(i * segmentWidth, points[i]);
    }

    ctx.lineTo(canvas.width, canvas.height);
    ctx.closePath();
    ctx.fill();
}

// Main loop
function animate() {
    updateWater();
    renderWater();
    requestAnimationFrame(animate);
}

// Initialize animation
animate();
