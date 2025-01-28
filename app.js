const canvas = document.getElementById('fireworks');
const ctx = canvas.getContext('2d');

// Thiết lập kích thước canvas
function setCanvasSize() {
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
}
setCanvasSize();
window.addEventListener('resize', setCanvasSize);

// Lớp Particle để tạo các hạt pháo hoa
class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.velocity = {
            x: (Math.random() - 0.5) * 8,
            y: (Math.random() - 0.5) * 8 - 2
        };
        this.alpha = 1;
        this.decay = Math.random() * 0.015 + 0.015;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.restore();
    }

    update() {
        this.velocity.y += 0.08;
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.alpha -= this.decay;
    }
}

// Mảng chứa các hạt pháo hoa
let particles = [];

// Thêm class cho pháo hoa hình rắn
class SnakeFirework {
    constructor(x, y) {
        this.points = [];
        this.x = x;
        this.y = y;
        this.angle = 0;
        this.length = 30;
        this.color = `hsl(${Math.random() * 360}, 100%, 50%)`;
        this.lifetime = 100;
    }

    draw() {
        ctx.beginPath();
        this.points.forEach((point, index) => {
            if (index === 0) {
                ctx.moveTo(point.x, point.y);
            } else {
                ctx.lineTo(point.x, point.y);
            }
        });
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.stroke();
    }

    update() {
        this.angle += 0.2;
        const newX = this.x + Math.cos(this.angle) * 5;
        const newY = this.y + Math.sin(this.angle) * 5;
        
        this.points.unshift({ x: newX, y: newY });
        if (this.points.length > this.length) {
            this.points.pop();
        }
        
        this.lifetime--;
    }
}

// Mảng chứa pháo hoa hình rắn
let snakeFireworks = [];

// Thêm class cho pháo hoa hình đặc biệt
class ShapeFirework {
    constructor(x, y, type) {
  this.x = x;
  this.y = y;
        this.particles = [];
        this.type = type;
        this.color = `hsl(${Math.random() * 360}, 100%, 50%)`;
        this.init();
    }

    init() {
        switch(this.type) {
            case 'snake':
                this.createSnake();
                break;
            case 'heart':
                this.createHeart();
                break;
            case 'star':
                this.createStar();
                break;
            case 'circle':
                this.createCircle();
                break;
        }
    }

    createSnake() {
        // Tạo hình rắn
        const points = 50;
        for (let i = 0; i < points; i++) {
            const angle = (i / points) * Math.PI * 4;
            const x = this.x + Math.cos(angle) * (i * 2);
            const y = this.y + Math.sin(angle) * (i * 1.5);
            const particle = new Particle(x, y, this.color);
            particle.velocity.x = (x - this.x) * 0.03;
            particle.velocity.y = (y - this.y) * 0.03;
            particle.decay = 0.01;
            this.particles.push(particle);
        }
    }

    createHeart() {
        // Tạo hình trái tim
        for (let i = 0; i < 180; i++) {
            const angle = (i / 180) * Math.PI * 2;
            const r = Math.sin(angle) * Math.sqrt(Math.abs(Math.cos(angle))) / (Math.sin(angle) + 1.4);
            const x = this.x + r * Math.cos(angle) * 50;
            const y = this.y - r * Math.sin(angle) * 50;
            const particle = new Particle(x, y, this.color);
            
            particle.velocity.x = (x - this.x) * 0.02;
            particle.velocity.y = (y - this.y) * 0.02;
            
            particle.decay = Math.random() * 0.01 + 0.005;
            this.particles.push(particle);
        }
        
        for (let i = 0; i < 50; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * 60;
            const x = this.x + Math.cos(angle) * radius;
            const y = this.y - Math.sin(angle) * radius;
            const particle = new Particle(x, y, this.color);
            
            particle.velocity.x = (Math.random() - 0.5) * 4;
            particle.velocity.y = (Math.random() - 0.5) * 4;
            particle.decay = Math.random() * 0.02 + 0.01;
            this.particles.push(particle);
        }
    }

    createStar() {
        // Tạo hình ngôi sao
        const points = 5;
        const outerRadius = 50;
        const innerRadius = 25;
        
        for (let i = 0; i < points * 2; i++) {
            const angle = (i / (points * 2)) * Math.PI * 2;
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const x = this.x + Math.cos(angle) * radius;
            const y = this.y + Math.sin(angle) * radius;
            const particle = new Particle(x, y, this.color);
            particle.velocity.x = (x - this.x) * 0.03;
            particle.velocity.y = (y - this.y) * 0.03;
            this.particles.push(particle);
        }
    }

    createCircle() {
        // Tạo hình tròn với hiệu ứng xoáy
        const points = 100;
        for (let i = 0; i < points; i++) {
            const angle = (i / points) * Math.PI * 2;
            const x = this.x + Math.cos(angle) * 50;
            const y = this.y + Math.sin(angle) * 50;
            const particle = new Particle(x, y, this.color);
            particle.velocity.x = Math.cos(angle + Math.PI/2) * 5;
            particle.velocity.y = Math.sin(angle + Math.PI/2) * 5;
            this.particles.push(particle);
        }
    }

    update() {
        this.particles.forEach(particle => {
            particle.update();
        });
        return this.particles.some(particle => particle.alpha > 0);
    }

    draw() {
        this.particles.forEach(particle => {
            particle.draw();
        });
    }
}

// Mảng chứa các pháo hoa hình đặc biệt
let shapeFireworks = [];

// Cập nhật hàm tạo pháo hoa
function createFirework(x, y, type = 'normal') {
    // Cập nhật bảng màu với các màu rực rỡ và đẹp mắt hơn
    const colors = [
        '#FF0000', // Đỏ tươi
        '#FFD700', // Vàng gold
        '#FF1493', // Pink đậm
        '#00FF00', // Lục
        '#4169E1', // Royal blue
        '#FF4500', // Orange đỏ
        '#8A2BE2', // Blue violet
        '#00FFFF', // Cyan
        '#FF69B4', // Hot pink
        '#FFA500', // Orange
        '#32CD32', // Lime green
        '#FF00FF', // Magenta
        '#FFFF00', // Yellow
        '#00FF7F', // Spring green
        '#9400D3'  // Violet đậm
    ];
    
    if (type === 'normal') {
        const particleCount = 250; // Tăng số lượng hạt
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        // Tạo hiệu ứng hình tròn
        for (let i = 0; i < particleCount; i++) {
            const angle = (i * 360) / particleCount;
            const particle = new Particle(x, y, color);
            const speed = Math.random() * 6 + 4; // Tăng tốc độ bay
            particle.velocity.x = Math.cos(angle * Math.PI / 180) * speed;
            particle.velocity.y = Math.sin(angle * Math.PI / 180) * speed;
            particles.push(particle);
        }

        // Tạo hiệu ứng phụ với nhiều hạt hơn
        setTimeout(() => {
            const subParticleCount = 80; // Tăng số lượng hạt phụ
            for (let i = 0; i < subParticleCount; i++) {
                const particle = new Particle(x, y, colors[Math.floor(Math.random() * colors.length)]);
                particle.velocity.x *= 2;
                particle.velocity.y *= 2;
                particles.push(particle);
            }
        }, 100);
    } else if (type === 'snake') {
        snakeFireworks.push(new SnakeFirework(x, y));
    } else if (type === 'shape') {
        const shapes = ['snake', 'heart', 'star', 'circle'];
        const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
        shapeFireworks.push(new ShapeFirework(x, y, randomShape));
    }
}

// Cập nhật hàm animation với vị trí bắn pháo hoa đa dạng hơn
function animate() {
    requestAnimationFrame(animate);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Cập nhật các particle
    particles = particles.filter(particle => particle.alpha > 0);
    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });

    // Cập nhật pháo hoa hình đặc biệt
    shapeFireworks = shapeFireworks.filter(firework => firework.update());
    shapeFireworks.forEach(firework => {
        firework.draw();
    });

    // Tạo pháo hoa ở nhiều vị trí khác nhau
    if (Math.random() < 0.15) {
        const x = Math.random() * canvas.width;
        // Điều chỉnh vị trí bắn theo chiều cao
        const y = canvas.height - Math.random() * (canvas.height * 0.5); // Bắn từ giữa màn hình trở xuống
        const types = ['normal', 'shape', 'normal'];
        const randomType = types[Math.floor(Math.random() * types.length)];
        createFirework(x, y, randomType);
    }

    // Thêm pháo hoa ở các vị trí cao
    if (Math.random() < 0.05) {
        const x = Math.random() * canvas.width;
        // Bắn ở vị trí cao hơn
        const y = canvas.height * (0.2 + Math.random() * 0.3); // Bắn ở 20-50% chiều cao màn hình
        createFirework(x, y, 'shape');
    }

    // Thêm pháo hoa ở các góc màn hình
    if (Math.random() < 0.01) {
        const positions = [
            { x: canvas.width * 0.2, y: canvas.height * 0.3 },
            { x: canvas.width * 0.8, y: canvas.height * 0.3 },
            { x: canvas.width * 0.5, y: canvas.height * 0.2 }
        ];
        const pos = positions[Math.floor(Math.random() * positions.length)];
        createFirework(pos.x, pos.y, Math.random() < 0.3 ? 'normal' : 'shape');
    }
}

// Cập nhật sự kiện click
canvas.addEventListener('click', (e) => {
    for (let i = 0; i < 3; i++) {
        setTimeout(() => {
            const randomHeight = e.clientY - Math.random() * 200;
            createFirework(
                e.clientX + (Math.random() - 0.5) * 100,
                randomHeight,
                Math.random() < 0.4 ? 'normal' : 'shape'
            );
        }, i * 150);
    }
});

// Cập nhật interval tạo pháo hoa
setInterval(() => {
    const x = Math.random() * canvas.width;
    const y = canvas.height * (0.3 + Math.random() * 0.4);
    createFirework(x, y, 'shape');
}, 4000);

// Bắt đầu animation
animate();

