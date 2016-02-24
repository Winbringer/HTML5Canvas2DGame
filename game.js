;(function(){
    var LevelUp;
    LevelUp = function (bodies, game,spd,mth) {
        var ii = 0;
        for (var i = 0; i < bodies.length; i++) {
            if (bodies[i] instanceof Invader) ++ii;
        }
        if (ii < 1) {
            for(var i=0;i<24;i++){
                var x=30+(i%8)*30;
                var y=30+(i%3)*30;
                bodies.push(new Invader(game,{x:x,y:y},spd,mth));
            }
            game.sd++;
            game.mt+=0.01;
            game.y+=0.5;
        }
        }
	var Game = function(canvasId){
		var canvas=document.getElementById(canvasId);
        var screen=canvas.getContext('2d');
        var tick;
        this.sd=1;
        this.mt=0.01;
        this.y=2;
        var gameSize={
            x:canvas.width,
            y:canvas.height
        };
        //this.bodies=[new Player(this,gameSize)];
        this.bodies=createInvaders(this).concat([new Player(this,gameSize)]);
        var self=this;
		var FPS=60;
		var nextFrameTime= Date.now();
		var FrameDuration = 1000 / FPS;
		var MaxFrameSkip = 10;
		var loops=0;
        loadSound("shoot.wav",function(shootSound){
           self.shootSound=shootSound;
            tick = function () {
                loops=0;
				if(Date.now()>nextFrameTime&&loops<MaxFrameSkip){
                self.update(gameSize);
				nextFrameTime+=FrameDuration;
				loops++;
				}
                self.draw(screen, gameSize);
                LevelUp(self.bodies,self,self.sd,self.mt);
                requestAnimationFrame(tick);
            }
            tick();
        });
	}

    Game.prototype={
        update:function(gameSize){
            var bodies=this.bodies;
            var notCollidingWithAnything=function(b1){
                return bodies.filter(function(b2){
                  return colliding(b1,b2);
                }).length==0;
            }
            this.bodies=this.bodies.filter(notCollidingWithAnything);
            for(var i=0;i<this.bodies.length;++i){
                if(this.bodies[i].position.y<0 || this.bodies[i].position.y>600)this.bodies.splice(i,1);
            }
            for(var i=0;i<this.bodies.length;++i)this.bodies[i].update();
        },
        draw:function(screen,gameSize){
            clearCanvas(screen,gameSize);
           for(var i=0;i<this.bodies.length;i++)drawRect(screen, this.bodies[i]);
        },
        addBody:function(body){
            this.bodies.push(body);
        },
        invadersBelow: function(invader){
            return this.bodies.filter(function(b){
                return b instanceof Invader &&
                    b.position.y> invader.position.y &&
                    b.position.x-invader.position.x<invader.size.width;
            }).length>0;
        }
    }
    var Player=function(game,gameSize){
        this.bullets=0;
        this.game=game;
        this.size={width:16,height:16};
        this.position={x:gameSize.x/2-this.size.width/2,y:330};
        this.keyboarder=new Keyboarder();
        this.timer=0;
    }
    Player.prototype={
        update:function(){			
if(this.keyboarder.isDown(this.keyboarder.KEYS.LEFT))if(this.position.x> 40)this.position.x -= 2;
            if(this.keyboarder.isDown(this.keyboarder.KEYS.RIGHT)) if(this.position.x<760-this.size.width)this.position.x += 2;
			
            if(this.keyboarder.isDown(this.keyboarder.KEYS.SPACE)){
                if(this.bullets<5) {
                    var bullet = new Bullet({
                        x: this.position.x + this.size.width / 2 - 3 / 2,
                        y: this.position.y-4
                    }, {x: 0, y: -6});
                    this.game.addBody(bullet);
                    this.bullets++;
                    this.game.shootSound.load();
                    this.game.shootSound.play();
                }
            }
            this.timer++;
            if(this.timer%12==0) this.bullets=0;
        }
    }
    var Bullet=function(position,velocity){
        this.size={width:3,height:3};
        this.position=position;
        this.velocity=velocity;
    }
    Bullet.prototype={
        update:function(){
            this.position.x+=this.velocity.x;
            this.position.y+=this.velocity.y;
            }
        }

    var Keyboarder;
    Keyboarder = function () {
        var keyState = {};
        window.onkeydown = function (e) {
            keyState[e.keyCode] = true;
        }
        window.onkeyup = function (e) {
            keyState[e.keyCode] = false;
        }
        this.isDown = function (keyCode) {
            return keyState[keyCode] === true;
        }
        this.KEYS = {LEFT: 37, RIGHT: 39, SPACE: 32};
    };
    var drawRect=function(screen,body){
        screen.fillRect(body.position.x,body.position.y,body.size.width, body.size.height);
            }
    var clearCanvas=function(screen,gameSize){
        screen.clearRect(0,0,gameSize.x,gameSize.y);
    };


    var Invader=function(game,position,speed,math){
        this.game=game;
        this.size={width:16, height:15};
        this.position=position;
        this.patrolX=0;
        this.speedX=speed;
		this.math =math;
    }
    Invader.prototype={
        update:function(){
         if(this.patrolX<0||this.patrolX>530){
             this.speedX=-this.speedX;
         }
            this.position.x +=this.speedX;
            this.patrolX+=this.speedX;
            if(Math.random()<this.math && !this.game.invadersBelow(this)) {
                var bullet = new Bullet({
                    x: this.position.x + this.size.width / 2 - 3 / 2,
                    y: this.position.y + this.size.height/2
                }, {x: Math.random() - 0.5, y: this.game.y});
                this.game.addBody(bullet);
            }
        }
    }
    var createInvaders=function(game){
        var invaders=[];
        for(var i=0;i<24;i++){
            var x=30+(i%8)*30;
            var y=30+(i%3)*30;
            invaders.push(new Invader(game,{x:x,y:y},1,0.01));
        }
        return invaders;
    }
    var colliding = function(b1,b2){
        return !(b1==b2||
        b1.position.x+b1.size.width/2<b2.position.x-b2.size.width/2 ||
        b1.position.y+b1.size.height/2<b2.position.y-b2.size.height/2 ||
        b1.position.x-b1.size.width/2>b2.position.x+b2.size.width/2 ||
        b1.position.y-b1.size.height/2>b2.position.y+b2.size.height/2);
    }
    var loadSound= function (url,callback) {
        var loaded= function(){
            callback(sound);
            sound.removeEventListener("canplaythrough",loaded);
        }
        var sound = new Audio(url);
        sound.addEventListener("canplaythrough",loaded);
        sound.load();
    }
	
	window.onload=function(){ 
	new Game("screen");
	}
	})();