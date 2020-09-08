const canvasElement = document.querySelector('canvas');
let canvasCoords = canvasElement.getBoundingClientRect();
const ctx = canvasElement.getContext('2d');
const keys = new Set();
 
const canvas = {
	w: canvasElement.width,
	h: canvasElement.height
};

const sprites = {
	// Base game
	background() {
 		const background = new Image();
 		background.src = 'assets/img/space.png';	
 		return background;	
	},
	ship() {
		const ship = new Image();
		ship.src = 'assets/img/spaceship.png';
		return ship;
	},
	asteroid() {
		const asteroid = new Image();
		asteroid.src ='assets/img/asteroid.png';
		return asteroid;
	},
	// Bonuses
	bomb() {
		const bomb = new Image();
		bomb.src = 'assets/img/bomb.png';
		return bomb;
	},
	jump() {
		const jump = new Image();
		jump.src = 'assets/img/jump-up.png';
		return jump;
	},
	slow() {
		const slow = new Image();
		slow.src = 'assets/img/slow-up.png';
		return slow;
	},
	speed() {
		const speed = new Image();
		speed.src = 'assets/img/speed-up.png';
		return speed;
	}
};

const background = {
	img: sprites.background(),

 	render() {
  	ctx.drawImage(this.img,0,0, canvas.w, canvas.h);
 	}
};

const multiplicity = {
	'0': 3, //very easy
	'1': 2,   //easy
	'2': 1, //medium
	'3': 0.2  //hard
};
const gameSettings = {
	difficult: '2',
	game: true, //true - game is running, stop - game is stopped
	bonusDuration: 1000,
	bonusBombScore: 100,
	bonusJumpScore: 10,
	bonusSlowScore: 150,
	bonusSpeedScore: 30,
	shipSpeedLimit: 12,
	shipJumpLimit: 300,
	shipSpeedBonus: 1,
	shipJumpBonus: 20,
	asteroidSlowSpeed: 3,
	menuPrimaryColor: 'hsl(198, 20%, 20%)',
	menuPrimaryColorA: 'hsla(198, 55%, 20%, 0.9)',
	menuPrimaryColorLight: 'hsl(198, 55%, 20%)',
	textPrimaryColor: '#fff',
	textImportantColor: '#e64',
	textSelectColor: '#ff8300',
	textInterface: 'hsl(250, 50%, 50%)'
};

const shipOriginalValues = {
	ox: canvas.w / 2,
	oy: canvas.h - 80, 
	speed: 5,
	jumpPower: 100
};
const ship = {
	w: 50,
	h: 50,
	speed: 5,
	ox: canvas.w / 2,
	oy: canvas.h - 80,
	dx: 0,
	dy: 0,
	jumpPower: 100,
	img: sprites.ship(),

	create() {
		ctx.drawImage(this.img, this.ox, this.oy, this.w, this.h);
	},

	move() {
		this.ox += this.dx;
		this.oy += this.dy;

		this.wallCollision();
	},

	jump() {
		this.oy -= this.jumpPower;

		this.wallCollision();
	},

	increaseSpeed() {
		this.speed += gameSettings.shipSpeedBonus;
	},
	increaseJump() {
		this.jumpPower += gameSettings.shipJumpBonus;
	},

	wallCollision() {
		if (this.ox + this.w > canvas.w) {
			this.ox = canvas.w - this.w;
		}
		if (this.ox < 0) {
			this.ox = 0;
		}
		if (this.oy + this.h > canvas.h) {
			this.oy = canvas.h - this.h;
		}
		if (this.oy < 0) {
			this.oy = 0;
		}
	},

	setOriginalPosition() {
		this.ox = shipOriginalValues.ox;
		this.oy = shipOriginalValues.oy;
		this.speed = shipOriginalValues.speed;
		this.jumpPower = shipOriginalValues.jumpPower;
	},

	draw() {
		if (gameSettings.game) {
			this.create();
			this.move();
		}
	}
}

const asteroidOriginalValues = {
	speed: 8
}
const asteroid = {
	maxwidth: 80,
  speed: 8,
  num: 10,
  activeAsteroids: [],
	img: sprites.asteroid(),

	create(method, idx) {
		if (method === 'create') {
			let multiplicator = idx || 1;
			let width = (Math.random() + 30) + Math.random() * this.maxwidth;
			let height = width;
			let ox = Math.random() * canvas.w - width;
			let oy = (Math.random() * canvas.h - (canvas.h + height)) * multiplicator * multiplicity[gameSettings['difficult']];

			ctx.drawImage(this.img, ox, oy, width, height);

			this.addActiveAsteroids(ox, oy, width, height);
			return;
		}

		ctx.drawImage(this.img,
									this.activeAsteroids[idx].x,
									this.activeAsteroids[idx].y, 
									this.activeAsteroids[idx].w, 
									this.activeAsteroids[idx].h);
	},

	addActiveAsteroids(ox, oy, width, height) {
		let xy = {
				x: ox,
				y: oy,
				w: width,
				h: height
				}; 
		this.activeAsteroids.push(xy);
	},

	render() {
		if (this.activeAsteroids.length < this.num) {
			for (let i = 0; i < this.num; i++) {
				this.create('create', i);
			}
			return;
		}

		for (let i = 0; i < this.num; i++) {
			this.create('', i);			
		}
	},

	move() {
		for (let i = 0; i < this.activeAsteroids.length; i++) {
			this.collision(i);
			this.activeAsteroids[i].y += this.speed;

			if (this.activeAsteroids[i].y > canvas.h) {
				score.total++;
				this.speed += 0.01;

				this.activeAsteroids[i].y = Math.random() - ((Math.random() + 1) * i * 10 * multiplicity[gameSettings['difficult']] + this.maxwidth);
				this.activeAsteroids[i].x = Math.random() * canvas.w;
				this.activeAsteroids[i].w = (Math.random() + 30) + Math.random() * this.maxwidth;
				this.activeAsteroids[i].h = this.activeAsteroids[i].w;
			}
		}
	},

	asteroidSlowSpeed() {
		this.speed = gameSettings.asteroidSlowSpeed;
		setTimeout(() => {
			this.speed = asteroidOriginalValues.speed;
		}, gameSettings.bonusDuration);
	},

	collision(idx) {
		if (ship.oy + ship.h * 0.2  <= this.activeAsteroids[idx].y + this.activeAsteroids[idx].h &&
				ship.ox + ship.w * 0.8 >= this.activeAsteroids[idx].x &&
				ship.ox + ship.w * 0.2 <= this.activeAsteroids[idx].x + this.activeAsteroids[idx].w &&
				ship.oy + ship.h * 0.8 >= this.activeAsteroids[idx].y &&
				this.activeAsteroids[idx].y < canvas.h &&
				this.activeAsteroids[idx].x < canvas.w) {
			game.stop();
		}
	},

	reset() {
		this.activeAsteroids = [];
		this.speed = asteroidOriginalValues.speed;
	},

	draw() {
			this.render();
			this.move();
	}
}

const score = {
	total: 0,

	create() {
		ctx.textAlign = 'start';
		ctx.font = 'bold 24px serif';
		ctx.fillStyle = gameSettings.textInterface;
		ctx.fillText(`Your Score: ${this.total}`, 10, 20);
	},

	restore() {
		this.total = 0;
	},

	bonusScore(bonus) {
		if (bonus === 'bomb') {
			this.total += gameSettings.bonusBombScore;
		} else if (bonus === 'jump') {
			this.total += gameSettings.bonusJumpScore;
		} else if (bonus === 'slow') {
			this.total += gameSettings.bonusSlowScore;
		} else {
			this.total += gameSettings.bonusSpeedScore;
		}
	}
}

const gameMenuOriginalValues = {
	baseY: (100 - canvas.h),
	textY: (140 - canvas.h),
	scoreY: (170 - canvas.h),
	btnStartY: -20,
	btnDiffY: -300
};
const gameMenu = {
	baseY: (100 - canvas.h),
	textY: (140 - canvas.h),
	scoreY: (170 - canvas.h),
	btnStartY: -20,
	btnStartW: 200,
	btnStartH: 50,
	btnDiffY: -300,
	btnDiffW: 280,
	btnDiffH: 60,
	speed: 10,

	createBase() {
		ctx.lineWidth = 10;
		ctx.strokeStyle = gameSettings.menuPrimaryColor;
		ctx.beginPath();
		ctx.fillStyle = gameSettings.menuPrimaryColorA;
		ctx.rect(50, this.baseY, canvas.w - 100, canvas.h - 100);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
	},
	createText() {
		ctx.textAlign = 'center';

		ctx.beginPath();
		ctx.font = 'bold 32px serif';
		ctx.fillStyle = gameSettings.textPrimaryColor;
		ctx.fillText('Game Over', canvas.w / 2, this.textY)
		ctx.closePath();

		ctx.beginPath();
		ctx.font = 'bold 24px serif';
		ctx.fillStyle = gameSettings.textImportantColor;
		ctx.fillText(`Your score: ${score.total}`, canvas.w / 2, this.scoreY)
		ctx.closePath();

		ctx.beginPath();
		ctx.font = '28px serif';
		ctx.fillStyle = gameSettings.textPrimaryColor;
		ctx.fillText('Select difficulty', canvas.w / 2, this.btnDiffY - 30);
		ctx.closePath();
	},
	createButtonStart() {
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';

		ctx.beginPath();
		ctx.fillStyle = gameSettings.menuPrimaryColor;
		ctx.font = '30px serif';
		ctx.fillRect(canvas.w / 2 - this.btnStartW / 2,
							   this.btnStartY - this.btnStartH, 
							   this.btnStartW, 
							   this.btnStartH);
		ctx.fillStyle = gameSettings.textPrimaryColor;
		ctx.fillText('Start Game', canvas.w / 2, this.btnStartY - this.btnStartH / 2);
		ctx.closePath();
	},
	createButtonDiff() {
		ctx.fillStyle = gameSettings.menuPrimaryColor;
		ctx.fillRect(canvas.w / 2 - this.btnDiffW / 2,
							   this.btnDiffY, 
							   this.btnDiffW, 
							   this.btnDiffH);
	},
	createButtonDiffElements() {
		ctx.strokeStyle = gameSettings.menuPrimaryColorLight;
		ctx.lineWidth = 3;
		ctx.font = '21px serif';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';

		for (let i = 0; i <= 4; i++) {
			let highlight = gameSettings.textPrimaryColor;
			if (multiplicity[i] == multiplicity[gameSettings.difficult]) {
				highlight = gameSettings.textSelectColor;
			}
			let x = (canvas.w / 2 - this.btnDiffW / 2) + this.btnDiffW / 4 * i;
			let y = this.btnDiffY;
			let txtX = x + this.btnDiffW / 8;
			let txtY = y + this.btnDiffH / 2;

			ctx.beginPath();
			if (i > 0) {
				ctx.moveTo(x, y);
				ctx.lineTo(x, y + this.btnDiffH);
			}
			if (i < 4) {
				ctx.fillStyle = highlight;
				ctx.fillText(`${i}`, txtX, txtY);
				ctx.stroke();
			}
		}
	},

	create() {
		this.createBase();
		this.createText();
		this.createButtonStart();
		this.createButtonDiff();
		this.createButtonDiffElements();
	},

	move() {
		if (this.baseY + this.speed > 50) return;

		this.baseY += this.speed;
		this.textY += this.speed;
		this.scoreY += this.speed;
		this.btnStartY += this.speed;
		this.btnDiffY += this.speed;
	},

	restoreValues() {
		this.baseY = gameMenuOriginalValues.baseY;
		this.textY = gameMenuOriginalValues.textY;
		this.scoreY = gameMenuOriginalValues.scoreY;
		this.btnStartY = gameMenuOriginalValues.btnStartY;
		this.btnDiffY = gameMenuOriginalValues.btnDiffY;
	},

	reloadButtonDiffElements() {
		gameMenu.createButtonDiff();
		gameMenu.createButtonDiffElements();
	},

	changeCursor(area) {
		if (area === 'inside') {
			canvasElement.classList.add('cursor-pointer');
		} else {
			canvasElement.classList.remove('cursor-pointer');
		}
	},

	draw() {
		if (gameSettings.game || this.baseY > 50) return;

		ctx.clearRect(0, 0, canvas.w, canvas.h);

		background.render();

		this.create();
		this.move();

		requestAnimationFrame(gameMenu.draw.bind(this));
	}
};

const bonuses = {
	w: 40,
	h: 40,
	speed: 4,
	bonusesCoords: [],
	imgBomb: sprites.bomb(),
	imgJump: sprites.jump(),
	imgSlow: sprites.slow(),
	imgSpeed: sprites.speed(),

	renderBonuses() {
		if (this.bonusesCoords.length === 0) {
			let multiplicator = multiplicity[gameSettings['difficult']];
			let img = this.randomBonus();
			let ox = Math.random() * canvas.w - this.w;
			let oy = (Math.random() * (-canvas.h / multiplicator) - this.h - score.total * 10);

			this.createBonus('create', img, ox, oy);
			this.addCoords(img, ox, oy);

		} else {
			let ox = this.bonusesCoords[0].x;
			let oy = this.bonusesCoords[0].y;

			this.createBonus('');
		}
	},

	createBonus(mode, img, ox, oy) {
		if (mode === 'create') {
			ctx.drawImage(img, ox, oy, this.w, this.h);
		} else {
			ctx.drawImage(this.bonusesCoords[0].img, 
				            this.bonusesCoords[0].x, 
				            this.bonusesCoords[0].y, 
				            this.w, this.h);
		}
	},
	addCoords(image, ox, oy) {
		const xy = {
			img: image,
			x: ox,
			y: oy 
		};
		
		this.bonusesCoords.push(xy);
	},

	randomBonus() {
		const random = Math.random() * 1000;

		if (random <= 600) {
			return this.imgJump;
		} else if (random > 600 && random <= 800) {
			return this.imgSpeed;
		} else if (random > 800 && random <= 950) {
			return this.imgBomb;
		} else {
			return this.imgSlow;
		}
	},
	removeBonus() {
		this.bonusesCoords = [];
	},

	move() {
		if (this.bonusesCoords.length === 0) return;

		let img = this.bonusesCoords[0].img;

		for (let i of this.bonusesCoords) {
			i.y += this.speed;
			this.collision(img);

			if (i.y > canvas.h) {
				this.removeBonus();
			}
		}
	},

	bombCollision() {
		asteroid.reset();
		score.bonusScore('bomb');
	},
	slowCollision() {
		asteroid.asteroidSlowSpeed();
		score.bonusScore('slow');
	},
	speedCollision() {
		if (ship.speed <= gameSettings.shipSpeedLimit) {
			ship.increaseSpeed();	
		}
		score.bonusScore('speed');
	},
	jumpCollision() {
		if (ship.jumpPower <= gameSettings.shipJumpLimit) {
			ship.increaseJump();
		}
		score.bonusScore('jump');
	},

	collision(img) {
		if (ship.ox <= this.bonusesCoords[0].x + this.w &&
				ship.ox + ship.w >= this.bonusesCoords[0].x &&
				ship.oy <= this.bonusesCoords[0].y + this.h &&
				ship.oy + ship.h >=this.bonusesCoords[0].y) {
			this.removeBonus();
			if (img === this.imgBomb) {
				this.bombCollision();
			} else if (img === this.imgSlow) {
				this.slowCollision();
			} else if (img === this.imgSpeed) {
				this.speedCollision();
			} else {
				this.jumpCollision();
			}
		}
	},

	draw() {
		this.renderBonuses();
		this.move();
	}
};

const interface = {
	speedX: 10,
	speedY: canvas.h - 20,
	jumpX: canvas.w - 10,
	jumpY: canvas.h - 20,
	text: 'bolder 21px serif',
	color: 'hsl(30, 80%, 50%)',

	createShipSpeed() {
		ctx.textAlign = 'start';
		ctx.font = this.text;
		ctx.fillStyle = this.color;
		ctx.fillText(`Speed: ${ship.speed}`, this.speedX, this.speedY);
	},
	createShipJumpPower() {
		ctx.textAlign = 'end';
		ctx.font = this.text;
		ctx.fillStyle = this.color;
		ctx.fillText(`Jump: ${ship.jumpPower}`, this.jumpX, this.jumpY);
	},

	draw() {
		this.createShipSpeed();
		this.createShipJumpPower();
	}
};

const game = {
	run() {
		if (!gameSettings.game) {
			return;
		};
		background.render();

		asteroid.draw();

		bonuses.draw();

		ship.draw();

		score.create();

		interface.draw();

		requestAnimationFrame(game.run);
	}, 
	stop() {
		gameSettings.game = false;
		gameMenu.draw();
	}, 
	changeDifficulty(diff) {
		gameSettings.difficult = diff;
		gameMenu.reloadButtonDiffElements();
		ship.setOriginalPosition();
	},

	restart() {
		asteroid.reset();
		score.restore();
		ship.setOriginalPosition();
		gameMenu.restoreValues();
		bonuses.removeBonus();
		gameSettings.game = true;
		game.run()
	}
};

const pressKeys = {
	doubleArrowPress() {
		if (keys.has('ArrowUp') &&
			keys.has('ArrowRight')) {
			ship.dx = ship.speed;
			ship.dy = -ship.speed;
			return;
		}
		if (keys.has('ArrowUp') &&
			keys.has('ArrowLeft')) {
			ship.dx = -ship.speed;
			ship.dy = -ship.speed;
			return;
		}
		if (keys.has('ArrowDown') &&
			keys.has('ArrowRight')) {
			ship.dx = ship.speed;
			ship.dy = ship.speed;
			return;
		}
		if (keys.has('ArrowDown') &&
			keys.has('ArrowLeft')) {
			ship.dx = -ship.speed;
			ship.dy = ship.speed;
			return;
		}
	},
	singleArrowPress(e) {
		if (e.key === 'ArrowRight') {
			ship.dx = ship.speed;
			keys.add('ArrowRight');
		}
		if (e.key === 'ArrowLeft') {
			ship.dx = -ship.speed;
			keys.add('ArrowLeft');
		}
		if (e.key === 'ArrowUp') {
			ship.dy = -ship.speed;
			keys.add('ArrowUp');
		}
		if (e.key === 'ArrowDown') {
			ship.dy = ship.speed;
			keys.add('ArrowDown');
		}
	},
	pressR(e) {
		if (e.key === 'r' && !gameSettings.game) {
			game.restart();
		}
	}
};


game.run();


document.addEventListener('keydown', (e) => {
	pressKeys.doubleArrowPress();
	pressKeys.singleArrowPress(e);
	pressKeys.pressR(e);
});
document.addEventListener('keyup', (e) => {
	keys.delete(e.key)

	if (e.key === ' ') {
		ship.jump();
	}

	if (e.key === "ArrowDown" ||
		  e.key === 'ArrowUp') {
		ship.dy = 0;
		return;
	}
	if (e.key === 'ArrowRight' ||
			e.key === 'ArrowLeft') {
		ship.dx = 0;
	return;
	}
});

canvasElement.addEventListener('click', (e) => {
	let x = e.clientX - canvasCoords.left;
	let y = e.clientY;

	if (x >= canvas.w / 2 - gameMenu.btnStartW / 2 &&
		  x <= canvas.w / 2 + gameMenu.btnStartW / 2 &&
		  y >= gameMenu.btnStartY - gameMenu.btnStartH &&
		  y <= gameMenu.btnStartY) {
		game.restart();
	}

	for (let i = 0; i <= 3; i++) {
		let leftX = (canvas.w / 2 - gameMenu.btnDiffW / 2) + gameMenu.btnDiffW / 4 * i;
		let rightX = (canvas.w / 2 - gameMenu.btnDiffW / 4) + gameMenu.btnDiffW / 4 * i;
			if (x >= leftX &&
			    x <= rightX &&
			    y >= gameMenu.btnDiffY &&
			    y <= gameMenu.btnDiffY + gameMenu.btnDiffH) {
				game.changeDifficulty(i);
		}
	}
});
canvasElement.addEventListener('mousemove', (e) => {
	gameMenu.changeCursor();

	let x = e.clientX - canvasCoords.left;
	let y = e.clientY;

	if (x >= canvas.w / 2 - gameMenu.btnStartW / 2 &&
		  x <= canvas.w / 2 + gameMenu.btnStartW / 2 &&
		  y >= gameMenu.btnStartY - gameMenu.btnStartH &&
		  y <= gameMenu.btnStartY) {
		gameMenu.changeCursor('inside');
	}

	for (let i = 0; i <= 3; i++) {
		let leftX = (canvas.w / 2 - gameMenu.btnDiffW / 2) + gameMenu.btnDiffW / 4 * i;
		let rightX = (canvas.w / 2 - gameMenu.btnDiffW / 4) + gameMenu.btnDiffW / 4 * i;
			if (x >= leftX &&
			    x <= rightX &&
			    y >= gameMenu.btnDiffY &&
			    y <= gameMenu.btnDiffY + gameMenu.btnDiffH) {
				gameMenu.changeCursor('inside');
		}
	}
});

window.addEventListener('resize', () => {
	canvasCoords = canvasElement.getBoundingClientRect();
});
