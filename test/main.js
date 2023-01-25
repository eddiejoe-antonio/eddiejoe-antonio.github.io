console.log("this works!")

var Utils = {
	
	createRequestAnimationFramePolyfill : function() {

		//Request animation frame syncs your javascript calls with the browser's rendering loop.
		//This is a polyfill for older browsers that still have the function prefixed.

		window.requestAnimFrame = (
			window.requestAnimationFrame		||
			window.webkitRequestAnimationFrame	||
			window.mozRequestAnimationFrame		||
			function( callback ){
				window.setTimeout(callback, 1000 / 60);
			}
		);

	},
	
	rgbToFillStyle : function(r, g, b, a) {
		if(a === undefined) {
			return ["rgb(",r,",",g,",",b,")"].join('');
		} else {
			return ["rgba(",r,",",g,",",b,",",a,")"].join('');
		}
	},
	
	hslToFillStyle : function(h, s, l, a) {
		if(a === undefined) {
			return ["hsl(",h,",",s,"%,",l,"%)"].join('');
		} else {
			return ["hsla(",h,",",s,"%,",l,"%,",a,")"].join('');
		}
	}
};

var Scene = function() {

			//This is the constructor which will load up the scene, an instance is created at the bottom of the page.
	
			this.currTime = this.prevTime = new Date().getTime();	//Timing variables
	
			this.canvas = document.getElementById('example-canvas');
			this.context = this.canvas.getContext( '2d' );
			
			this.mouse = new Mouse( this );
			
			this.dotManager = new DotManager(2000, this);
			
			//--------------------------------------------------------------
			// Start the loop!

			//Note that this is a little different from the post to add a start/stop button
			this.started = false;
			$('.start-stop').click(function() {
				this.started = ! this.started;
				
				if(this.started) {
					this.loop();
				}
				return false;
			}.bind(this));
			this.update( 16 ) //Draw Once
	
		};
		
		Scene.prototype = {
				
			loop : function() {
		
				//this is the change in time in milliseconds
				var dt;
				
				if(! this.started ) return;

				this.currTime = new Date().getTime();

				dt = Math.min( this.currTime - this.prevTime, 100);

				//Update then request a new animation frame
				this.update( dt );
				requestAnimationFrame( this.loop.bind(this) );
		
				this.prevTime = this.currTime;

			},
	
			update : function( dt ) {
		
				//Clear the canvas
				this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
		
				//Start your update code here
				this.dotManager.update( dt );
		
			}
	
		};
		
		function Dot( x, y, scene ) {
		
			var speed = 0.007;

			this.scene = scene;
		
			this.size = 4;
			this.wavePosition = 0;
			
			this.position = new THREE.Vector2(x,y);
			this.direction = new THREE.Vector2(
				speed * Math.random() - speed / 2,
				speed * Math.random() - speed / 2
			);
			
			this.attractSpeed = 1000 * Math.random() + 500;
			this.attractDistance = (150 * Math.random()) + 180;
			
			
			this.color = Utils.hslToFillStyle(this.position.x / this.scene.canvas.width * 360, 50, 50, 0.5);
			
		}
	
		Dot.prototype = {

			update : function( dt ) {
				this.updatePosition( dt );
				this.updateWave( dt );
				this.attractMouse( dt );
				this.draw( dt );
			},
		
			updatePosition : function() {

				//This is a little trick to create a variable outside of the render loop
				//It's expensive to allocate memory inside of the loop.
				//The variable is only accessible to the function below.

				var moveDistance = new THREE.Vector2();

				//This is the actual function
				return function( dt ) {

					moveDistance.copy( this.direction );
					moveDistance.multiplyScalar( dt );

					this.position.add( moveDistance );
					
					//Keep the dot on the screen
					this.position.x = (this.position.x + this.scene.canvas.width) % this.scene.canvas.width;
					this.position.y = (this.position.y + this.scene.canvas.height) % this.scene.canvas.height;
					
				}

			}(), //Note that this function is immediately executed and returns a different function
			
			attractMouse : function() {
				
				//Again, create some private variables for this method
				var vectorToMouse = new THREE.Vector2(),
					vectorToMove = new THREE.Vector2();
				
				//This is the actual public method
				return function(dt) {
					
					var distanceToMouse, distanceToMove;
					
					//Get a vector that represents the x and y distance from the dot to the mouse
					//Check out the three.js documentation for more information on how these vectors work
					vectorToMouse
						.copy( this.scene.mouse.position )
						.sub( this.position );

					//Get the distance to the mouse from the vector
					distanceToMouse = vectorToMouse.length();

					//Use the individual scalar values for the dot to adjust the distance moved
					moveLength = dt * (this.attractDistance - distanceToMouse) / this.attractSpeed;
		
					//Only move the dot if it's being attracted
					if( moveLength > 0 ) {
						
						//Resize the vector to the mouse to the desired move length
						vectorToMove
							.copy( vectorToMouse )
							.divideScalar( distanceToMouse )
							.multiplyScalar( moveLength );
			
						//Go ahead and add it to the current position now, rather than in the draw call
						this.position.add(
							vectorToMove
						);
					
					}
				};
				
			}(), //Note that this function is immediately executed and returns a different function
			
			updateWave : function( dt, time ) {
				this.wavePosition = Math.sin( this.scene.currTime / 500 + this.position.x / this.scene.canvas.width * 4 ) * 20;
			},
			
			draw : function(dt) {	
				
				//Get a short variable name for convenience
				var ctx = this.scene.context;
				
				ctx.beginPath();
				ctx.fillStyle = this.color;
				ctx.fillRect(this.position.x, this.position.y + this.wavePosition, this.size, this.size);
			}
			
		};
		
		var DotManager = function( numberOfDots, scene ) {
		
			this.dots = [];
			this.numberOfDots = numberOfDots;
			this.scene = scene;
		
			for(var i=0; i < numberOfDots; i++) {
				this.dots.push( new Dot(
					Math.random() * this.scene.canvas.width,
					Math.random() * this.scene.canvas.height,
					this.scene
				));
			}
		
		};

		DotManager.prototype = {
			update : function( dt ) {
				for(var i=0; i < this.numberOfDots; i++) {
					this.dots[i].update( dt );
				}
			}
		}

		var Mouse = function( scene ) {

			this.scene = scene;
			this.position = new THREE.Vector2(-10000, -10000);

			$(window).mousemove( this.onMouseMove.bind(this) );

		};

		Mouse.prototype = {
	
			onMouseMove : function(e) {
		
				var canvas = this.scene.canvas;
				
				if(typeof(e.pageX) == "number") {
					//Note that this is a little different from the article to allow for responsively resizing the canvas
					this.position.x = e.pageX * canvas.width / $(canvas).width();
					this.position.y = e.pageY * canvas.height / $(canvas).height();
				} else {
					this.position.x = -100000;
					this.position.y = -100000;
				}

			},

			copyPosition : function( vector ) {
				vector.copy( this.position );
			},

			getPosition : function() {
				return this.position.clone();
			}

		};
		
		new Scene();