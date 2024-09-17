const canvas = document.getElementById('waterCanvas');
const ctx = canvas.getContext('2d');

// Set canvas dimensions
canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;

// Constants for water simulation
const numPoints = 55; // Number of points along the water surface
const defaultWaterHeightFactor = 0.5; // Initial water height factor (50% of canvas height)
const defaultDamping = 0.925; // Initial damping
const defaultTension = 0.025; // Initial tension
const defaultGravity = 0.05; // Initial gravity
const defaultViscosity = 0.99; // Initial viscosity

// Variables to hold the state of the water surface
let points = new Array(numPoints).fill(0);
let velocities = new Array(numPoints).fill(0);
let waterHeight = canvas.height * defaultWaterHeightFactor;
let damping = defaultDamping;
let tension = defaultTension;
let gravity = defaultGravity;
let viscosity = defaultViscosity;
let showSphere = true;

// Mouse state for interaction
let mouseX = null;
let mouseY = null;

// Mouse event for interaction with water
canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = event.clientX - rect.left;
    mouseY = event.clientY - rect.top;

    const segmentWidth = canvas.width / numPoints;
    const hoverIndex = Math.floor(mouseX / segmentWidth);
    const sphereRadius = 50; // Radius of influence for the mouse

    // Only disturb the water if the mouse is near the surface and within the sphere of influence
    if (hoverIndex >= 0 && hoverIndex < numPoints && showSphere && Math.abs(points[hoverIndex] - mouseY) < sphereRadius) {
        velocities[hoverIndex] = -5; // Disturb the water at the mouse location
    }
});

// Initialize the water surface to the default height
function initializeWater() {
    for (let i = 0; i < numPoints; i++) {
        points[i] = waterHeight;
        velocities[i] = 0; // Initial velocities set to zero
    }
}

// Water physics update function
function updateWater() {
    for (let i = 0; i < numPoints; i++) {
        // Calculate forces: the tension (spring force) from neighboring points
        const left = i > 0 ? points[i - 1] : points[i];
        const right = i < numPoints - 1 ? points[i + 1] : points[i];
        const force = tension * (left + right - 2 * points[i]);

        // Update velocity based on force, gravity, and damping
        velocities[i] += force;
        velocities[i] *= damping * viscosity;

        // Update position based on velocity
        points[i] += velocities[i];

        // Apply constraints: Ensure the water does not fall below the bottom of the canvas
        if (points[i] > canvas.height) {
            points[i] = canvas.height;
            velocities[i] *= -0.3; // Bounce off the bottom
        }

        // Ensure water stays at or above the initial water level
        if (points[i] < waterHeight) {
            points[i] = waterHeight;
            velocities[i] *= -0.5; // Bounce at waterHeight (upper boundary)
        }
    }

    // Propagate wave motion to neighboring points
    for (let i = 0; i < numPoints; i++) {
        if (i > 0) velocities[i - 1] += (points[i] - points[i - 1]) * 0.1;
        if (i < numPoints - 1) velocities[i + 1] += (points[i] - points[i + 1]) * 0.1;
    }
}

// Render the water surface
function renderWater() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const segmentWidth = canvas.width / numPoints;

    // Draw the water surface
    ctx.fillStyle = '#0077b6';
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    ctx.lineTo(0, points[0]);

    for (let i = 1; i < numPoints; i++) {
        ctx.lineTo(i * segmentWidth, points[i]);
    }

    ctx.lineTo(canvas.width, canvas.height);
    ctx.closePath();
    ctx.fill();

    // Draw sphere of influence if enabled
    if (showSphere) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, 50, 0, Math.PI * 2);
        ctx.stroke();
    }
}

// Main animation loop
function animate() {
    updateWater();
    renderWater();
    requestAnimationFrame(animate);
}

// Start the animation
initializeWater(); // Initialize the water surface at the start
animate();

// Slider for controlling water height dynamically
document.getElementById('waterHeightSlider').addEventListener('input', (e) => {
    const newWaterHeightFactor = parseFloat(e.target.value);
    waterHeight = canvas.height * newWaterHeightFactor;

    // Reset the water surface to the new height
    initializeWater();
});

// Slider for controlling damping dynamically
document.getElementById('dampingSlider').addEventListener('input', (e) => {
    damping = parseFloat(e.target.value);
});

// Slider for controlling tension dynamically
document.getElementById('tensionSlider').addEventListener('input', (e) => {
    tension = parseFloat(e.target.value);
});

// Slider for controlling gravity dynamically
document.getElementById('gravitySlider').addEventListener('input', (e) => {
    gravity = parseFloat(e.target.value);
});

// Slider for controlling viscosity dynamically
document.getElementById('viscositySlider').addEventListener('input', (e) => {
    viscosity = parseFloat(e.target.value);
});

// Button to toggle visibility of the sphere of influence
document.getElementById('tensionSlider').addEventListener('input', (e) => {
    tension = parseFloat(e.target.value);
});

// Toggle sphere of influence visibility
const sphereToggleBtn = document.getElementById('toggleSphereBtn');
let sphereVisible = false;
sphereToggleBtn.addEventListener('click', () => {
    sphereVisible = !sphereVisible;
});

// Update mouse interaction
canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = event.clientX - rect.left;
    mouseY = event.clientY - rect.top;

    const segmentWidth = canvas.width / numPoints;
    const hoverIndex = Math.floor(mouseX / segmentWidth);

    if (hoverIndex >= 0 && hoverIndex < numPoints && sphereVisible && Math.abs(points[hoverIndex] - mouseY) < 50) {
        velocities[hoverIndex] = -5;
    }
});
