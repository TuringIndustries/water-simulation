const canvas = document.getElementById('waterCanvas');
const ctx = canvas.getContext('2d');

function setCanvasDimensions() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
}

setCanvasDimensions(); // Initialize the canvas dimensions

const numPoints = 100;
const defaultValues = {
    waveSpeed: 0.035,
    mouseRadius: 40,
    damping: 0.95,
    maxMouseDistance: 40
};

let points = new Array(numPoints).fill(canvas.height * 0.5);
let velocities = new Array(numPoints).fill(0);
let waveSpeed = defaultValues.waveSpeed;
let mouseRadius = defaultValues.mouseRadius;
let damping = defaultValues.damping;
let maxMouseDistance = defaultValues.maxMouseDistance;

let mouseX = null;
let mouseY = null;
let mousePrevX = null;
let mousePrevY = null;
let mouseVelocityX = 0;
let mouseVelocityY = 0;
let mouseActive = false;
let lastMouseInteraction = 0;
const interactionTimeout = 5;

function getTotalArea() {
    let totalArea = 0;
    for (let i = 0; i < numPoints; i++) {
        totalArea += points[i];
    }
    return totalArea;
}

function adjustForVolume() {
    const currentArea = getTotalArea();
    const targetArea = canvas.height * 0.5 * numPoints;
    const areaDifference = targetArea - currentArea;
    const adjustmentPerPoint = areaDifference / numPoints;

    for (let i = 0; i < numPoints; i++) {
        points[i] += adjustmentPerPoint;
    }
}

function updateWater() {
    const segmentWidth = canvas.width / numPoints;

    for (let i = 0; i < numPoints; i++) {
        let left = points[i - 1] || points[i];
        let right = points[i + 1] || points[i];
        velocities[i] += waveSpeed * (left + right - 2 * points[i]);
        velocities[i] *= damping;
        points[i] += velocities[i];

        let currentTime = Date.now();
        if (mouseActive && (currentTime - lastMouseInteraction < interactionTimeout)) {
            let pointX = i * segmentWidth;
            let distX = Math.abs(pointX - mouseX);
            let distY = Math.abs(mouseY - points[i]);

            if (distX < mouseRadius && distY < maxMouseDistance) {
                let strength = 1 - (distY / maxMouseDistance);
                let velocityImpact = (mouseVelocityY - velocities[i]) * 0.055 * strength;
                velocities[i] += velocityImpact;
                let displacement = 0.05 * strength * (mouseY - points[i]);
                velocities[i] += displacement;
            }
        }

        if (points[i] > canvas.height) {
            points[i] = canvas.height;
        }
    }

    adjustForVolume();

    for (let i = 0; i < numPoints; i++) {
        points[i] += 0.01 * (canvas.height * 0.5 - points[i]);
    }
}

function renderWater() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#0077b6';
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    ctx.lineTo(0, points[0]);

    let segmentWidth = canvas.width / numPoints;
    for (let i = 1; i < numPoints; i++) {
        ctx.lineTo(i * segmentWidth, points[i]);
    }

    ctx.lineTo(canvas.width, points[numPoints - 1]);
    ctx.lineTo(canvas.width, canvas.height);
    ctx.closePath();
    ctx.fill();
}

canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = event.clientX - rect.left;
    mouseY = event.clientY - rect.top;
    lastMouseInteraction = Date.now();
    mouseActive = true;

    if (mousePrevX !== null && mousePrevY !== null) {
        mouseVelocityX = mouseX - mousePrevX;
        mouseVelocityY = mouseY - mousePrevY;
    }

    mousePrevX = mouseX;
    mousePrevY = mouseY;
});

canvas.addEventListener('mousedown', () => {
    mouseActive = true;
    lastMouseInteraction = Date.now();
});

canvas.addEventListener('mouseup', () => {
    mouseActive = false;
});

window.addEventListener('resize', () => {
    setCanvasDimensions();
    points = new Array(numPoints).fill(canvas.height * 0.5);
});

function animate() {
    updateWater();
    renderWater();
    requestAnimationFrame(animate);
}

animate();

// Update sliders and reset button
document.getElementById('waveSpeed').addEventListener('input', (event) => {
    waveSpeed = parseFloat(event.target.value);
    document.getElementById('waveSpeedValue').textContent = waveSpeed;
});

document.getElementById('mouseRadius').addEventListener('input', (event) => {
    mouseRadius = parseFloat(event.target.value);
    document.getElementById('mouseRadiusValue').textContent = mouseRadius;
});

document.getElementById('damping').addEventListener('input', (event) => {
    damping = parseFloat(event.target.value);
    document.getElementById('dampingValue').textContent = damping;
});

document.getElementById('maxMouseDistance').addEventListener('input', (event) => {
    maxMouseDistance = parseFloat(event.target.value);
    document.getElementById('maxMouseDistanceValue').textContent = maxMouseDistance;
});

document.getElementById('resetButton').addEventListener('click', () => {
    document.getElementById('waveSpeed').value = defaultValues.waveSpeed;
    document.getElementById('mouseRadius').value = defaultValues.mouseRadius;
    document.getElementById('damping').value = defaultValues.damping;
    document.getElementById('maxMouseDistance').value = defaultValues.maxMouseDistance;

    waveSpeed = defaultValues.waveSpeed;
    mouseRadius = defaultValues.mouseRadius;
    damping = defaultValues.damping;
    maxMouseDistance = defaultValues.maxMouseDistance;

    document.getElementById('waveSpeedValue').textContent = waveSpeed;
    document.getElementById('mouseRadiusValue').textContent = mouseRadius;
    document.getElementById('dampingValue').textContent = damping;
    document.getElementById('maxMouseDistanceValue').textContent = maxMouseDistance;
});
