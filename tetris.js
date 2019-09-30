const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
const scale = 20;
let dropCounter = 0;
const dropInterval = 1000; // 1 second
let lastTime = 0;

context.scale(scale, scale);


const player = {
	matrix: createPiece('L'),
	pos: {x: 5, y: 0}
}
const arena = createMatrix(12, 20);

function createMatrix(width, height) {
	const matrix = [];
	while (height--) {
		matrix.push(new Array(width).fill(0));
	}
	return matrix;
}

function createPiece(type) {
	switch (type) {
		case 'T':
			return [
				[1, 1, 1],
				[0, 1, 0],
				[0, 0, 0]
			]
			break;
		case 'O':
			return [
				[1, 1],
				[1, 1]
			]
			break;
		case 'I':
			return [
				[0, 1, 0, 0],
				[0, 1, 0, 0],
				[0, 1, 0, 0],
				[0, 1, 0, 0]
			]
			break;
		case 'S':
			return [
				[0, 1, 1],
				[1, 1, 0],
				[0, 0, 0]
			]
			break;
		case 'Z':
			return [
				[1, 1, 0],
				[0, 1, 1],
				[0, 0, 0]
			]
			break;
		case 'L':
			return [
				[0, 1, 0],
				[0, 1, 0],
				[0, 1, 1]
			]
			break;
		case 'J':
			return [
				[0, 1, 0],
				[0, 1, 0],
				[1, 1, 0]
			]
			break;
	}
}

function draw() {
	context.fillStyle = "#000";
	context.fillRect(0, 0, canvas.width, canvas.height);
	drawMatrix(arena, {x: 0, y: 0});
	drawMatrix(player.matrix, player.pos);
}

function drawMatrix(matrix, offset) {
	matrix.forEach((row, y) => {
		row.forEach((value, x) => {
			// console.table('ROW', row, 'Y-Cord', y, 'VALUE', value, 'X-Cord', x);
			// if there's a mino, fill it in
			if (value !== 0) {
				context.fillStyle = 'purple';
				context.fillRect(x + offset.x, y + offset.y, 1, 1);
			}
		})
	})
}

function merge(arena, player) {
	player.matrix.forEach((row, y) => {
		row.forEach((value, x) => {
			if (value !== 0) {
				arena[y + player.pos.y][x + player.pos.x] = value;
			}
		})
	})
}

function collide(arena, player) {
	const [matrix, offset] = [player.matrix, player.pos];
	for (let y = 0; y < matrix.length; y++) {
		for (let x = 0; x < matrix[y].length; x++){
			// check for a mino
			if (matrix[y][x] !== 0 &&
					// check that the arena does not have a row
					(arena[y + offset.y] &&
					// check that the row does not have a column
					arena[y + offset.y][x + offset.x]) !== 0) {
				return true;
			}
		}
	}
	// all is clear
	return false;
}

function update(time = 0) {
	let deltaTime = time - lastTime;
	lastTime = time;
	dropCounter += deltaTime;

	if (dropCounter > dropInterval) {
		playerDrop();
	}

	draw();
	requestAnimationFrame(update);
}

function playerReset() {
	const pieces = 'ILJOTSZ';
	// const pieces = ['I','L','J','O','T','S','Z'];
	// let bag = pieces.map(piece => {
	// 	createPiece(piece);
	// })
	// console.log(bag);
	// console.log(pieces.length * Math.random() | 0);
	player.matrix = createPiece(pieces[pieces.length * Math.random() | 0])
	player.pos.y = 0;
	player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);
}

function playerDrop() {
	player.pos.y++;
	if (collide(arena, player)) {
		player.pos.y--;
		merge(arena, player);
		playerReset();
	}
	dropCounter = 0; // reset dropCounter
}

function playerMove(dir) {
	player.pos.x += dir;
	if (collide(arena, player)){
		player.pos.x -= dir;
	}
}

function playerRotate(dir) {
	const pos = player.pos.x;
	let offset = 1;
	rotate(player.matrix, dir);
	while (collide(arena, player)) {
		player.pos.x += offset;
		// if that didn't work, go back in the other direction
		offset = -(offset + (offset > 0 ? 1 : -1))
		// bail if not working
		if (offset > player.matrix[0].length) {
			rotate(player.matrix, -dir);
			player.pos.x = pos;
			return;
		}
	}
}

function rotate(matrix, dir) {
	for (let y = 0; y < matrix.length; y++) {
		for (let x = 0; x < y; x++) {
			[
				matrix[x][y],
				matrix[y][x]
			] = [
				matrix[y][x],
				matrix[x][y]
			]
		}
	}
	// check direction
	if (dir > 0) {
		matrix.forEach(row => row.reverse());
	} else {
		matrix.reverse();
	}
}

document.addEventListener('keydown', event => {
	switch (event.keyCode) {
		case 37: // left arrow
			playerMove(-1)
			break;
		case 39: // right arrow
			playerMove(1)
			break;
		case 40: // down arrow
			playerDrop();
			break;
			case 90: // z
			// rotate left
			playerRotate(-1)
			break;
		case 38: // spacebar
			playerRotate(1);
			break;
		case 67: // c
			// rotate right
			playerRotate(1)
			break;
	}
})

update();