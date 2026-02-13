const CFG = {
    HELICOPTER_SPEED: 0.1,
    BUILDING_SPEED: 4,
    SPAWN_RATE: 1000,
    HELI_COLOR: '#00ff9d',
    ENEMY_COLOR: '#ff3d3d',
    BULLET_SPEED: 10
};

class Building {
    constructor(x, y, w, h, heightFactor) {
        this.x = x; this.y = y; this.w = w; this.h = h;
        this.z = heightFactor; // Simulated altitude
        this.active = true;
    }
    draw(ctx) {
        // Simple 3D top-down perspective draw
        const perspectiveX = (this.x - ctx.canvas.width/2) * (1 + this.z * 0.1) + ctx.canvas.width/2;
        ctx.fillStyle = `rgba(40, 40, 60, ${0.5 + this.z * 0.1})`;
        ctx.fillRect(this.x, this.y, this.w, this.h);
        // "Roof"
        ctx.strokeStyle = '#444';
        ctx.strokeRect(this.x, this.y, this.w, this.h);
    }
}

export class GameEngine {
    constructor(canvas, ui) {
        this.canvas = canvas; this.ctx = canvas.getContext('2d'); this.ui = ui;
        this.reset();
        this.initControls();
    }

    reset() {
        this.score = 0; this.health = 100; this.running = false;
        this.heli = { x: 0, y: 0, w: 40, h: 60 };
        this.buildings = []; this.enemies = []; this.bullets = [];
        this.keys = {}; this.lastSpawn = 0;
    }

    initControls() {
        window.addEventListener('keydown', e => this.keys[e.code] = true);
        window.addEventListener('keyup', e => this.keys[e.code] = false);
    }

    start() {
        this.reset();
        this.heli.x = this.canvas.width / 2;
        this.heli.y = this.canvas.height * 0.7;
        this.running = true;
        this.loop();
    }

    spawn(now) {
        if (now - this.lastSpawn > CFG.SPAWN_RATE) {
            const w = 60 + Math.random() * 100;
            const h = 80 + Math.random() * 150;
            this.buildings.push(new Building(Math.random() * this.canvas.width, -200, w, h, Math.random() * 5));
            this.lastSpawn = now;
        }
    }

    update() {
        if (!this.running) return;
        // Movement
        if (this.keys.KeyA || this.keys.ArrowLeft) this.heli.x -= this.canvas.width * 0.01;
        if (this.keys.KeyD || this.keys.ArrowRight) this.heli.x += this.canvas.width * 0.01;
        if (this.keys.KeyW || this.keys.ArrowUp) this.heli.y -= 5;
        if (this.keys.KeyS || this.keys.ArrowDown) this.heli.y += 5;

        // Constraint
        this.heli.x = Math.max(50, Math.min(this.canvas.width - 50, this.heli.x));
        this.heli.y = Math.max(this.canvas.height * 0.5, Math.min(this.canvas.height - 100, this.heli.y));

        if (this.keys.Space && Date.now() % 200 < 20) {
            this.bullets.push({ x: this.heli.x, y: this.heli.y, active: true });
        }

        this.buildings.forEach(b => {
            b.y += CFG.BUILDING_SPEED;
            if (b.y > this.canvas.height) b.active = false;
        });
        this.bullets.forEach(b => {
            b.y -= CFG.BULLET_SPEED;
            if (b.y < -100) b.active = false;
        });

        this.buildings = this.buildings.filter(b => b.active);
        this.bullets = this.bullets.filter(b => b.active);
    }

    draw() {
        this.ctx.fillStyle = '#050a10';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Ground/City Grid
        this.ctx.strokeStyle = '#0a1a25';
        for(let i=0; i<this.canvas.width; i+=100) {
            this.ctx.beginPath(); this.ctx.moveTo(i, 0); this.ctx.lineTo(i, this.canvas.height); this.ctx.stroke();
        }

        this.buildings.forEach(b => b.draw(this.ctx));

        // Draw Bullets
        this.ctx.fillStyle = '#fff';
        this.bullets.forEach(b => this.ctx.fillRect(b.x-2, b.y, 4, 15));

        // Draw Helicopter (Modern Wireframe Style)
        this.ctx.strokeStyle = CFG.HELI_COLOR;
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(this.heli.x - 20, this.heli.y - 30, 40, 60);
        // Rotor
        const r = (Date.now() / 20) % (Math.PI * 2);
        this.ctx.beginPath();
        this.ctx.moveTo(this.heli.x - Math.cos(r)*40, this.heli.y - Math.sin(r)*10);
        this.ctx.lineTo(this.heli.x + Math.cos(r)*40, this.heli.y + Math.sin(r)*10);
        this.ctx.stroke();
    }

    loop() {
        if (!this.running) return;
        this.spawn(Date.now());
        this.update();
        this.draw();
        requestAnimationFrame(() => this.loop());
    }
}
