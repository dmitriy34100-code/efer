const BOARD_SIZE = 8;
const CELL_SIZE = 52; // 48px + 4px gap
let score = 0;
let nextTarget = 100;
let grid = Array(BOARD_SIZE).fill().map(() => Array(BOARD_SIZE).fill(null));

const SHAPES = [
    { coords: [[0,0],[0,1],[1,0],[1,1]], color: 'c1' }, // Квадрат
    { coords: [[0,0],[0,1],[0,2]], color: 'c2' },       // Линия 3
    { coords: [[0,0],[1,0],[2,0]], color: 'c3' },       // Вертикаль
    { coords: [[0,0],[1,0],[1,1]], color: 'c4' },       // Уголок
    { coords: [[0,0]], color: 'c5' }                    // Точка
];

const boardEl = document.getElementById('board');
const shelfEl = document.getElementById('shapes-container');

document.getElementById('start-btn').onclick = () => {
    document.getElementById('welcome-screen').classList.add('hidden');
    document.getElementById('game-container').classList.remove('hidden');
    initGame();
};

function initGame() {
    boardEl.innerHTML = '';
    for(let r=0; r<BOARD_SIZE; r++) {
        for(let c=0; c<BOARD_SIZE; c++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            boardEl.appendChild(cell);
        }
    }
    spawnShapes();
}

function spawnShapes() {
    shelfEl.innerHTML = '';
    for(let i=0; i<3; i++) {
        const data = SHAPES[Math.floor(Math.random() * SHAPES.length)];
        shelfEl.appendChild(createShapeEl(data));
    }
}

function createShapeEl(data) {
    const el = document.createElement('div');
    el.className = 'shape';
    const rows = Math.max(...data.coords.map(p => p[0])) + 1;
    const cols = Math.max(...data.coords.map(p => p[1])) + 1;
    el.style.gridTemplateRows = `repeat(${rows}, 30px)`;
    el.style.gridTemplateColumns = `repeat(${cols}, 30px)`;

    data.coords.forEach(p => {
        const b = document.createElement('div');
        b.className = data.color;
        b.style.gridRowStart = p[0]+1; b.style.gridColumnStart = p[1]+1;
        b.style.borderRadius = '4px';
        el.appendChild(b);
    });

    el.onmousedown = (e) => startDrag(e, el, data);
    return el;
}

function startDrag(e, el, data) {
    const clone = el.cloneNode(true);
    clone.classList.add('dragging');
    document.body.appendChild(clone);
    el.style.visibility = 'hidden';

    const move = (e) => {
        clone.style.left = e.pageX - 45 + 'px';
        clone.style.top = e.pageY - 45 + 'px';
    };

    document.onmousemove = move;
    move(e);

    document.onmouseup = () => {
        document.onmousemove = null;
        document.onmouseup = null;
        
        const rect = boardEl.getBoundingClientRect();
        const col = Math.round((e.pageX - rect.left - 25) / CELL_SIZE);
        const row = Math.round((e.pageY - rect.top - 25) / CELL_SIZE);

        if(canPlace(data.coords, row, col)) {
            place(data, row, col);
            el.remove();
            checkLines();
            if(shelfEl.children.length === 0) spawnShapes();
        } else {
            el.style.visibility = 'visible';
        }
        clone.remove();
    };
}

function canPlace(coords, r, c) {
    return coords.every(([dr, dc]) => {
        const nr = r + dr, nc = c + dc;
        return nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && !grid[nr][nc];
    });
}

function place(data, r, c) {
    data.coords.forEach(([dr, dc]) => {
        grid[r+dr][c+dc] = data.color;
        const index = (r+dr) * BOARD_SIZE + (c+dc);
        boardEl.children[index].classList.add(data.color);
    });
}

function checkLines() {
    let fullR = [], fullC = [];
    for(let i=0; i<BOARD_SIZE; i++) {
        if(grid[i].every(v => v !== null)) fullR.push(i);
        if(grid.every(row => row[i] !== null)) fullC.push(i);
    }

    fullR.forEach(r => {
        grid[r].fill(null);
        for(let c=0; c<BOARD_SIZE; c++) boardEl.children[r*BOARD_SIZE+c].className = 'cell';
        addScore(100);
    });

    fullC.forEach(c => {
        for(let r=0; r<BOARD_SIZE; r++) {
            grid[r][c] = null;
            boardEl.children[r*BOARD_SIZE+c].className = 'cell';
        }
        addScore(100);
    });
}

function addScore(n) {
    score += n;
    document.getElementById('score').innerText = score;
    
    if(score >= nextTarget) {
        if(nextTarget === 100) nextTarget = 500;
        else nextTarget += 500;
        document.getElementById('target-score').innerText = nextTarget;
        // Эффект победы
        document.getElementById('target-text').style.transform = 'scale(1.2)';
        setTimeout(() => document.getElementById('target-text').style.transform = 'scale(1)', 200);
    }
}
