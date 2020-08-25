function setup() {
    noLoop();
}

function draw() {
    let canvasElement = document.getElementById('mainCanvas');
    canvasElement.width = window.innerWidth;
    canvasElement.height = window.innerHeight;

    let initialPoint = [Math.floor(Math.random() * canvasElement.width), Math.floor(Math.random() * canvasElement.height)];
    let initialHue = Math.floor(Math.random() * 360);

    depthFirstSearch(initialPoint, initialHue);
}

function depthFirstSearch(initialCell, initialHue) {
    let canvasElement = document.getElementById('mainCanvas');
    let canvasCtx = canvasElement.getContext("2d");
    let hue = initialHue;
    let sat = 100;
    let val = 50;

    let noiseScale = 0.0005;

    let totalCells = canvasElement.width * canvasElement.height;
    let visitedCells = [];
    let totalVisited = 0;
    let stack = [];

    for (let i = 0; i < canvasElement.width; i++) {
        visitedCells.push([]);
        for (let j = 0; j < canvasElement.height; j++) {
            visitedCells[i].push(false);
        }
    }

    function visit(cell) {
        visitedCells[cell[0]][cell[1]] = true;
        totalVisited++;

        hue = (initialHue + stack.length / 1000) % 360;
        val = noise(stack.length * noiseScale, (totalVisited % 1000) * noiseScale) * (100 - 25 + 1) + 25;
        sat = noise(cell[0] * noiseScale, cell[1] * noiseScale) * (100 - 60 + 1) + 60;
        val *= 0.01;
        sat *= 0.01;

        hslHue = hue;
        hslLig = val * 0.5 * (2 - sat);
        hslSat = hslLig == 0 || hslLig == 1 ? 0 : (val - hslLig) / Math.min(hslLig, 1 - hslLig);

        hslLig *= 100;
        hslSat *= 100;

        canvasCtx.fillStyle = "hsl(" + hslHue + ", " + hslSat + "%, " + hslLig + "%)";
        canvasCtx.fillRect(cell[0], cell[1], 1, 1);
    }

    let currentCell = initialCell;
    visit(currentCell);

    function step() {
        if (totalVisited >= totalCells) return;

        for (var i = 0; i < 10000; i++) {
            let unvisitedNeighbours = getUnvisitedNeighbours(visitedCells, currentCell, canvasElement.width, canvasElement.height);

            if (unvisitedNeighbours.length > 0) {
                let nextCell = Math.floor(Math.random() * (unvisitedNeighbours.length));
                stack.push(currentCell);
                currentCell = unvisitedNeighbours[nextCell];
                visit(currentCell);
            } else if (stack.length > 0) {
                currentCell = stack.pop();
            }
        }

        requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
}

function getUnvisitedNeighbours(visitedCells, currentCell, maxWidth, maxHeight) {
    let neighbours = [];

    function isVisited(x, y) {
        if (x < 0 || x >= maxWidth || y < 0 || y >= maxHeight) return true;
        return visitedCells[x][y];
    }

    if (!isVisited(currentCell[0] - 1, currentCell[1])) neighbours.push([currentCell[0] - 1, currentCell[1]]);
    if (!isVisited(currentCell[0] + 1, currentCell[1])) neighbours.push([currentCell[0] + 1, currentCell[1]]);
    if (!isVisited(currentCell[0], currentCell[1] - 1)) neighbours.push([currentCell[0], currentCell[1] - 1]);
    if (!isVisited(currentCell[0], currentCell[1] + 1)) neighbours.push([currentCell[0], currentCell[1] + 1]);

    return neighbours;
}