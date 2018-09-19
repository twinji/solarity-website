var PI = Math.PI;
var canvas, c, background;
var lastTime = window.performance.now(), delta, time, timeSpeed = 1.5;
var maxScaleFactor = 10, minScaleFactor = 1.1, scaleFactor = minScaleFactor;
var star, stars, sun, planet, planets, moon, satellite, transport, fleet, station, units, asteroidBelt, AB, KB;
var cover = {width: window.innerWidth, height: window.innerHeight}, aspectRatio;

function setup() {
    cover = {width: window.innerWidth, height: window.innerHeight};
    aspectRatio = cover.width / cover.height;
    canvas = document.getElementById("canvas");
    background = document.getElementById("background");
    c = canvas.getContext("2d");
    b = background.getContext("2d");
    canvas.width = cover.width;
    canvas.height = cover.height;
    background.width = cover.width;
    background.height = cover.height;
}

function rescale() {
    if (window.innerWidth / window.innerHeight != aspectRatio) {
        cover.width = window.innerWidth;
        canvas.width = cover.width;
        background.width = cover.width;
        aspectRatio = cover.width / cover.height;
    }
}

function main() {
    setup();
    init();
    var gameLoop = function() {
        var thisTime = window.performance.now();
        delta = (thisTime - lastTime) / 20;
        lastTime = thisTime;
        time = timeSpeed;
        update();
        render();
        window.requestAnimationFrame(gameLoop, canvas);
    }
    window.requestAnimationFrame(gameLoop, canvas);
}

function init() {
    stars.create(0.1, 1, 170);
    AB = new asteroidBelt(250, 1.85, 0.4, 20);
    AB.create(200);
    KB = new asteroidBelt(490, 1.7, 0.4, 40);
    KB.create(300);
    
    planets.add(80, 2, "MERCURY", 0.9, "darkgrey", 0);
    planets.add(120, 3, "VENUS", 0.4, "darkkhaki", 0);
    planets.add(170, 4, "EARTH", 0.2, "dodgerblue", 100000);
        planets.planetsList[2].addMoon(11, 0.85, "MOON", 2, "lightgrey", 0);
    planets.add(210, 3, "MARS", 0.3, "darkorange", 0);
        planets.planetsList[3].addMoon(8, 0.4, "DEIMOS", 0.9, "grey", 0);
        planets.planetsList[3].addMoon(10, 0.8, "PHOBOS", 1.8, "darkgrey", 0);
    planets.add(295, 10, "JUPITER", 0.1, "darksalmon", 0);
        planets.planetsList[4].addMoon(20, 0.8, "EUROPA", 1.8, "cadetblue", 0);
        planets.planetsList[4].addMoon(17.5, 0.5, "IO", 1.3, "gold", 0);
        planets.planetsList[4].addMoon(22.5, 0.65, "GANYMEDE", 1.1, "purple", 0);
        planets.planetsList[4].addMoon(24.45, 0.725, "CALLISTO", 1.4, "grey", 0);
    planets.add(340, 8, "SATURN", 0.078, "burlywood", 0);
        planets.planetsList[5].addMoon(12.5, 0.725, "TITAN", 1.4, "darkcyan", 0);
        planets.planetsList[5].addMoon(14.95, 0.45, "ENCELADUS", 1.9, "white", 0);
    planets.add(380, 6, "URANUS", 0.058, "lightblue", 0);
    planets.add(416, 6, "NEPTUNE", 0.045, "blue", 0);
	planets.add(450, 0.7, "PLUTO", 0.023, "white", 0);
	    planets.planetsList[8].addMoon(5, 0.5, "CHARON", 1.0, "grey", 0);
}

function update() {    
    planets.update();
    AB.update();
    KB.update();
}

function render() {
    b.clearRect(0, 0, background.width, background.height);
    c.clearRect(0, 0, cover.width, cover.height);
    stars.render();
    sun.render();
    AB.render();
    KB.render();
    planets.render();
}

function drawLineGlow(x, y, a, radius, num, color, alpha) {
    this.gap = 3 * alpha;
    a.save();  
    a.lineCap = "round";
    a.strokeStyle = "white";
    a.lineWidth = 1 / scaleFactor;
    for (var i = 1; i <= num; i++) {
		a.globalAlpha = alpha / i;
        a.beginPath();
		a.strokeStyle = color;
        a.arc(x, y, radius + (i * this.gap), 0, 2 * PI, false);
        a.stroke();
        a.closePath();
    }
    a.restore();
}

stars = {
    starsList: [],
    create: function(minRadius, maxRadius, number) {
        var posX, posY, radius;
        for (var i = 0; i < number; i++) {
            posX = Math.random() * cover.width;
            posY = Math.random() * cover.height;
            radius = minRadius + (Math.random() * (maxRadius - minRadius));
            this.starsList.push(new star(posX, posY, radius)); 
        }
    },
    render: function() {
        for (var i = 0; i < this.starsList.length; i++) {
            this.starsList[i].render();
        }
    }
};

star = function(x, y, radius) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.alpha = Math.random() * 0.85;
    this.render = function() {
        b.globalAlpha = this.alpha;
        b.fillStyle = "white";
        b.beginPath();
        b.arc(this.x, this.y, this.radius / scaleFactor, 0, 2 * PI, false);
        b.closePath();
        b.fill();
        b.globalAlpha = 1;
    }
};

sun = {
    x: cover.width / 2,
    y: cover.height / 2,
    glowRadius: 640,
    radius: 1,
	drawGoldiZone: true,
	goldiPos: 170,
	goldiWidth: 45,
    setPos: function(x, y) {
        this.x = x;
        this.y = y;
    },
    render: function() {
        var g = c.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.glowRadius);
		g.addColorStop(0, "rgba(255, 215, 175, 1)");
        g.addColorStop(0, "rgba(255, 179, 139, 1)");
        g.addColorStop(0.1, "rgba(255, 175, 135, 0.72)");
        g.addColorStop(0.35, "rgba(255, 135, 115, 0.23)");
        g.addColorStop(0.6, "rgba(42, 20, 96, 0.005)");
        g.addColorStop(0.73, "rgba(32, 20, 96, 0.01)");
        g.addColorStop(1, "transparent");
        
        c.fillStyle = g;
        c.beginPath();
        c.arc(this.x, this.y, this.glowRadius, 0, 2 * PI, false);
		c.fill();
        c.closePath();
		
		drawLineGlow(this.x, this.y, c, this.radius, 5, "rgba(255, 215, 175, 1)", 0.5);
        
        c.fillStyle = "rgba(255, 215, 175, 1)";
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, 2 * PI, false);
        c.closePath();
        c.fill();
		
		if (this.drawGoldiZone) {
			c.globalAlpha = 0.075;
			c.strokeStyle = "white";
			c.lineWidth = this.goldiWidth;
			c.beginPath();
			c.arc(this.x, this.y, this.goldiPos, 0, 2 * PI, false);
			c.closePath();
			c.stroke();
			c.lineWidth = 1;
			c.textAlign = "center";
			c.fillStyle = "white";
			c.textAlign = "left";
			c.globalAlpha = 1;
		}
    }  
};

planets = {
    planetsList: [],
    add: function(disFromSun, radius, name, speed, color, population) {
        this.planetsList.push(new planet(disFromSun, radius, name, speed, color, population));
    },
	remove: function(num) { 
        this.planetsList.splice(num, 1);
	},
    update: function() {
        for (var i = 0; i < this.planetsList.length; i++) {
            this.planetsList[i].update();
        }
    },
    render: function() {
        for (var i = 0; i < this.planetsList.length; i++) {this.planetsList[i].render();}
    }
};

planet = function(disFromSun, radius, name, speed, color, population) {
	this.index = planets.planetsList.length + 1;
    this.disFromSun = disFromSun;
    this.radius = radius;
    this.name = name;
    this.speed = speed;
    this.color = color;
    this.population = population;
    this.rot = Math.random() * (2 * PI);
	
    this.x = sun.x + this.disFromSun * Math.cos(this.rot);
    this.y = sun.y + this.disFromSun * Math.sin(this.rot);
	
	this.hoverOffset = 15;
	this.highlightRot = 0;
    this.opacity = 0;
    this.trailLength = 8;
	this.trailGap = 23;
	this.trailCounter = 0;
	this.trailArray = [];
	this.trail = function(x, y, color) {
		this.x = x;
		this.y = y;
		this.color = color;
		this.counter = 1;
		this.update = function() {
			this.counter -= 0.002 * Math.abs(time);
			this.counter = Math.max(this.counter, 0);
		};
		this.render = function() {
			c.save();
			c.globalAlpha = this.counter;
			c.fillStyle = this.color;
			c.fillRect(this.x - 1 / scaleFactor, this.y - 1 / scaleFactor, 2 / scaleFactor, 2 / scaleFactor);
			c.globalAlpha = 1;
			c.restore();
		};
	}
    this.moons = [];
    this.addMoon = function(disFromPlanet, radius, type, speed, color, pop) {
        this.moons.push(new moon(this, disFromPlanet, radius, type, speed, color, pop));
    };
	this.clearTrails = function() {
		for (var i = 0; i < this.trailArray.length; i++) {
			if (this.trailArray[i].counter <= 0) {
				this.trailArray.splice(i, 1);
			}
		}
	}
    this.update = function() {   
        this.opacity -= 0.01 * time;
        this.opacity = Math.min(1, Math.max(this.opacity, 0));
        
        this.rot -= 0.01 * speed * time;
        this.x = sun.x + this.disFromSun * Math.cos(this.rot);
        this.y = sun.y + this.disFromSun * Math.sin(this.rot);
        
        if (this.rot <= 0) {
            this.rot += (2 * PI);
        }
		this.clearTrails();
		
        for (var i = 0; i < this.moons.length; i++) {
            this.moons[i].update();    
        }
		for (var i = 0; i < this.trailArray.length; i++) {
			this.trailArray[i].update();	
		}
        
		this.trailCounter += 1 * Math.abs(time);
		if (this.trailCounter >= this.trailGap) {
        	this.trailArray.push(new this.trail(this.x, this.y, this.color));
			this.trailCounter = 0;
		}
    };
    this.render = function() {
		for (var i = 0; i < this.trailArray.length; i++) {
			this.trailArray[i].render();	
		}
		
        c.save();
        c.fillStyle = this.color;
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, 2 * PI, false);
        c.closePath();
        c.fill();
        c.restore();

        for (var i = 0; i < this.moons.length; i++) {
            this.moons[i].render();    
        }
    };
};

moon = function(host, disFromPlanet, radius, name, speed, color, population) {
    this.host = host;
    this.disFromPlanet = disFromPlanet;
    this.radius = radius;
    this.name = name;
    this.speed = speed;
    this.color = color;
    this.population = population;
    this.x = sun.x - this.disFromSun;
    this.y = sun.y;
    this.rot = 0;
    this.trailLength = 8;
    this.alpha = 0;
    this.bounds = 1;
    this.update = function() {
        this.rot -= 0.01 * speed * time;
        this.x = this.host.x + this.disFromPlanet * Math.cos(this.rot);
        this.y = this.host.y + this.disFromPlanet * Math.sin(this.rot);
    };
    this.render = function() {
        c.fillStyle = this.color;
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, 2 * PI, false);
        c.closePath();
        c.fill();
        
        this.alpha = Math.min(1, Math.max(0, this.alpha));
        
        c.save();
        c.globalAlpha = this.alpha;
        c.font = "2.8px Arial";
        c.textBaseline = "top";
        c.textAlign = "center";
        c.fillStyle = "rgba(255, 255, 255, 0.45)";
        c.fillText(this.name, this.x, this.y + 1);
        c.globalAlpha = 1;
        c.restore();
    };
};

asteroidBelt = function(disFromSun, maxSize, minSize, beltWidth) {
	this.asteroids = [];
	this.disFromSun = disFromSun;
	this.maxSize = maxSize;
	this.minSize = minSize;
    this.create = function(num) {
        for (var i = 0; i < num; i++) {
            this.asteroids.push(new this.asteroid(this.disFromSun, this.maxSize, this.minSize));	
        }
	};
	this.asteroid = function(disFromSun, maxSize, minSize) {
        this.x = null;
        this.y = null;
        this.offset = (Math.random() - Math.random()) * beltWidth;
		this.disFromSun = disFromSun + this.offset;
        this.angle = ((2 * PI)) * Math.random();
		this.size = minSize + (Math.random() * (maxSize - minSize));
		this.update = function() {
			this.angle -= Math.abs(0.0005 * this.size) * time;
            this.x = sun.x + this.disFromSun * Math.cos(this.angle);
            this.y = sun.y + this.disFromSun * Math.sin(this.angle);
		};
		this.render = function() {
            c.save();
			c.beginPath();
            c.fillStyle = "dimgrey";
            c.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
            c.closePath();
            c.restore();
		};
	};
    this.update = function() {
        for (var i = 0; i < this.asteroids.length; i++) {
            this.asteroids[i].update();   
        }
    };
    this.render = function() {
        for (var i = 0; i < this.asteroids.length; i++) {
            this.asteroids[i].render();   
        }
    };
};