// SECTION Classes ---------------------------------------------
class PhysicsBodyType {
  type = "box";
  width = 1;
  height = 1;
  radius = 1;
  static = false;
}

class GameObject {
  //the base class for every object that will be contained by scenes in the game, the building block of the engine
  /**
   * @param {Engine} engine
   * @param {string} name
   * @param {number} x
   * @param {number} y
   * @param {number} z
   * @param {number} rotation
   * @param {string} imageSRC
   * @param {PhysicsBodyType} bodyType
   */
  constructor(engine, name, x, y, z, rotation, imageSRC, bodyType = null) {
    this.engine = engine;
    this.name = name;
    this.z = z;
    this.x = x;
    this.y = y;
    this.rotation = rotation;
    if (imageSRC != null) {
      this.sImage = new Image();
      this.sImage.src = imageSRC;
    }

    // generate physics with matter.js
    if (bodyType != null) {
      switch (bodyType.type) {
        case "box":
          this.body = Matter.Bodies.rectangle(
            x,
            y,
            bodyType.width,
            bodyType.height,
            { isStatic: bodyType.static }
          );
          this.body.width = bodyType.width;
          this.body.height = bodyType.height;
          break;
        case "circle":
          this.body = Matter.Bodies.circle(x, y, bodyType.radius, {
            isStatic: bodyType.static,
          });
          this.body.radius = bodyType.radius;
          break;
        default:
          this.body = null;
          break;
      }
    }
  }

  name;
  x;
  y;
  z;
  rotation;
  sImage;
  body;
  engine;

  // Methods
  Start = () => {}; //will be overridden by derivative classes, gets called once every time the InitScene() function is called

  Update = (delta) => {}; //will be overridden by derivative classes, gets called by the engine at every ick

  OnTouchDown = () => {}; //will be overridden by derivative classes, gets called by the engine ONCE when a touch is within the boundaries of the GameObject
  OnTouch = () => {}; //will be overridden by derivative classes, gets called by the engine when a touch is within the boundaries of the GameObject
  OnTouchUp = () => {}; //will be overridden by derivative classes, gets called by the engine ONCE when a touch is within the boundaries of the GameObject

  OnCollision = (collider) => {}; //gets called by the engine whenever this object is colliding with another one, in the CollisionDetection() function

  Render = (delta) => {
    //gets called every tick by the engine, just before the particle systems are rendered
    if (this.sImage != null) {
      if (this.body != null) {
        this.engine.drawImageRotated(
          this.sImage,
          this.x,
          this.y,
          this.body?.width || this.body.radius * 2,
          this.body?.height || this.body.radius * 2,
          this.rotation
        );
      } else {
        this.engine.drawImageRotated(
          this.sImage,
          this.x,
          this.y,
          this.sImage.width,
          this.sImage.height,
          this.rotation
        );
      }
    }
  };

  RenderGUI = (delta) => {}; //will be overridden by derivative classes, gets called last during the rendering routine in the engine

  //the following getters are self-explanatory
  SetPos = (newX, newY) => {
    this.x = newX;
    this.y = newY;
  };

  GetPos = () => {
    var pos = [];
    pos[0] = this.x;
    pos[1] = this.y;
    return pos;
  };

  GetSize = () => {
    let dim = { width: 0, height: 0 };
    if (this.body != null) {
      dim = {
        width: this.body?.radius * 2 || this.body.width,
        height: this.body?.radius * 2 || this.body.height,
      };
      return dim;
    }
    dim = {
      width: this.sImage.width,
      height: this.sImage.height,
    };
    return dim;
  };

  AddForce = (x, y) => {
    if (this.body != null)
      Matter.Body.applyForce(
        this.body,
        this.body.position,
        new Matter.Vector.create(x, y)
      );
  };

  AddTorque = (torque) => {
    if (this.body != null) this.body.torque = torque;
  };
}

class Scene {
  constructor(name) {
    this.name = name;
    this.objects = [];
  }
  name;
  objects = [];
  engine;

  AddSilently = (object) => {
    object.engine = this.engine;
    this.objects.push(object);
    if (object.body != null) {
      Matter.World.add(this.engine.physicsEngine.world, object.body);
    }
  };

  Instantiate = (object) => {
    object.engine = this.engine;
    this.objects.push(object);
    if (object.body != null) {
      Matter.World.add(this.engine.physicsEngine.world, object.body);
    }
    object.Start();
  };
}

class ParticleSystem {
  // Create an array for the particles
  particles = [];

  createParticleArray = (
    xPos,
    yPos,
    theCanvasContext,
    spd,
    rad,
    partNumber
  ) => {
    // Adds particles to the array
    for (var i = 0; i < partNumber; i++) {
      this.particles.push(new create(xPos, yPos, spd, rad));
    }
    this.renderParticles(theCanvasContext);
  };

  create = (startX, startY, speed, radius) => {
    // Point of touch
    this.x = startX;
    this.y = startY;

    // Add random velocity to each particle
    this.vx = RandomRange(-speed, speed);
    this.vy = RandomRange(-speed, speed);

    //Random shade of red will do for the explosion
    var red = Math.round(RandomRange(0, 255));
    var green = 0;
    var blue = 0;
    this.color = "rgba(" + red + ", " + green + ", " + blue + ", 0.5)";

    //Random size
    this.radius = RandomRange(radius, radius * 1.5);

    // fade value
    this.fade = RandomRange(0, 500);

    // particle dead
    this.dead = false;
  };

  // Render and move the particle
  renderParticles = (theCanvasContext) => {
    if (this.particles.length <= 0) return;

    var aCanvasContext = theCanvasContext;
    aCanvasContext.globalCompositeOperation = "source-over";
    // Reduce the opacity of the BG paint
    aCanvasContext.fillStyle = "rgba(0, 0, 0, 0.3)";
    // Blend the particle with the background
    aCanvasContext.globalCompositeOperation = "lighter";

    // Render the particles
    for (var t = 0; t < this.particles.length; t++) {
      var p = this.particles[t];

      aCanvasContext.beginPath();

      // Mix the colours
      var gradient = aCanvasContext.createRadialGradient(
        p.x,
        p.y,
        0,
        p.x,
        p.y,
        p.radius
      );
      gradient.addColorStop(0, "white");
      gradient.addColorStop(0.4, "white");
      gradient.addColorStop(0.4, p.color);
      gradient.addColorStop(1, "black");

      aCanvasContext.fillStyle = gradient;
      aCanvasContext.arc(p.x, p.y, p.radius, Math.PI * 2, false);
      aCanvasContext.fill();

      // Add velocity
      p.x += p.vx;
      p.y += p.vy;

      // Decrease fade and if particle is dead remove it
      p.fade -= 10;

      if (p.fade < 0) {
        p.dead = true;
      }

      if (p.dead == true) {
        this.particles.splice(t, 1);
      }
    }

    // Restore the opacity of the BG
    aCanvasContext.fillStyle = "rgba(0, 0, 0, 1)";
    aCanvasContext.globalCompositeOperation = "source-over";
  };

  //Random Range function from: https://stackoverflow.com/questions/1527803/generating-random-whole-numbers-in-javascript-in-a-specific-range
  RandomRange = (min, max) => {
    return Math.random() * (max - min) + min;
  };
}

class AudioManager {
  //the audio manager takes care of loading, storing, playing and stopping sounds, it is explained in more detail in the blog and wiki
  clips = [];
  names = [];

  LoadAudio(name, path) {
    let audioClip = new Audio();
    audioClip.src = path;
    this.clips.push(audioClip);
    this.names.push(name);
  }

  PlayAudio(name, looping) {
    for (let i = 0; i < this.clips.length; i++) {
      if (this.names[i] == name) {
        this.clips[i].loop = looping;
        this.clips[i].play();
      }
    }
  }

  StopAllAudio() {
    for (let i = 0; i < this.clips.length; i++) {
      {
        this.clips[i].pause();
        this.clips[i].currentTime = 0;
      }
    }
  }
}

class InputManager {
  lastPt = null;
  activeScene;

  init = (canvas) => {
    canvas.addEventListener("touchstart", this.touchDown, false);
    canvas.addEventListener("touchmove", this.touchXY, true);
    canvas.addEventListener("touchend", this.touchUp, false);

    document.body.addEventListener("touchcancel", this.touchUp, false);
  };

  touchUp = (evt) => {
    evt.preventDefault();

    this.checkClick("OnTouchUp");

    // Terminate touch path
    this.lastPt = null;
  };

  touchDown = (evt) => {
    //joke to be made aout american football is unfortunately missing
    evt.preventDefault();
    this.lastPt = { x: evt.touches[0].pageX, y: evt.touches[0].pageY };

    //we also check if we clicked on an object
    this.checkClick("OnTouchDown");
  };

  touchXY = (evt) => {
    //other than setting up our last touched position
    evt.preventDefault();
    this.lastPt = { x: evt.touches[0].pageX, y: evt.touches[0].pageY };

    //we also check if we clicked on an object
    this.checkClick("OnTouch");
  };

  checkClick = (method) => {
    //check we clicked on an object
    for (var i = 0; i < this.activeScene.objects.length; i++) {
      let obj = this.activeScene.objects[i];
      let size = obj.GetSize();

      if (
        this.lastPt.x > obj.x - size.width / 2 &&
        this.lastPt.y > obj.y - size.height / 2 &&
        this.lastPt.x < obj.x + size.width / 2 &&
        this.lastPt.y < obj.y + size.height / 2
      )
        obj[method]();
    }
  };
}

class SceneManager {
  //the scene manager is responsible for loading, unloading and switching scenes, it is explained in more detail in the blog and wiki
  engine;
  activeScene = null;

  AddScene(name) {
    let scene = new Scene(name);
    scene.engine = this.engine;

    return scene;
  }

  LoadScene(scene) {
    this.activeScene = scene;
    this.engine.inputManager.activeScene = scene;

    this.activeScene.objects.forEach(function (object) {
      object?.Start();
    });
  }

  UpdateScene(delta) {
    this.activeScene.objects.forEach(function (object) {
      // first we process physics
      if (object.body != null) {
        object.x = object.body.position.x;
        object.y = object.body.position.y;
        object.rotation = object.body.angle;
      }
      object?.Update(delta);
    });
  }

  Instantiate(object) {
    object.engine = this.engine;
    this.activeScene.objects.push(object);
    object.Start();
  }

  Destroy(object) {
    let index = this.activeScene.objects.indexOf(object);
    this.activeScene.objects.splice(index, 1);
  }

  RenderScene(delta) {
    this.activeScene.objects.forEach(function (object) {
      object?.Render(delta);
    });
  }

  RenderGUI(delta) {
    this.activeScene.objects.forEach(function (object) {
      object?.RenderGUI(delta);
    });
  }
}

// SECTION Game Engine ---------------------------------------------

class Engine {
  constructor() {
    this.canvas = document.getElementById("gameCanvas");
    this.canvasContext = this.canvas.getContext("2d");

    if (this.canvas.getContext) {
      //Set Event Listeners for window, mouse and touch
      window.addEventListener("resize", this.resizeCanvas, false);
      window.addEventListener("orientationchange", this.resizeCanvas, false);
    }
    this.resizeCanvas();

    this.sceneManager = new SceneManager();
    this.sceneManager.engine = this;
    this.particleManager = new ParticleSystem();
    this.audioManager = new AudioManager();
    this.inputManager = new InputManager();
    this.physicsEngine = Matter.Engine.create();
  }

  // context
  canvas;
  center = { x: 0, y: 0 };
  canvasContext;
  startTimeMS;

  // managers
  sceneManager;
  particleManager;
  audioManager;
  inputManager;

  // physics
  debugPhysics = false;
  physicsEngine;
  physicsRunner;

  resizeCanvas = () => {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.center = { x: this.canvas.width / 2, y: this.canvas.height / 2 };
  };

  init = (startingScene) => {
    //called when the page is loaded

    this.start(startingScene);
  };

  start = (startingScene) => {
    this.startTimeMS = Date.now();

    this.inputManager.init(this.canvas);

    this.sceneManager.engine = this;
    this.sceneManager.LoadScene(startingScene);

    this.physicsRunner = Matter.Runner.create();
    Matter.Runner.run(this.physicsRunner, this.physicsEngine);

    this.gameLoop();
  };

  gameLoop = () => {
    let elapsed = (Date.now() - this.startTimeMS) / 1000;

    this.sceneManager.UpdateScene(elapsed);
    this.collisionDetection();
    this.render(elapsed);

    this.startTimeMS = Date.now();
    requestAnimationFrame(this.gameLoop);
  };

  render = (delta) => {
    this.canvasContext.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.canvasContext.fillRect(0, 0, this.canvas.width, this.canvas.height);

    //render all GameObjects
    this.sceneManager.RenderScene(delta);

    // debug physics
    if (this.debugPhysics) this.debugRenderPhysics();

    //render particle systems on top
    this.particleManager.renderParticles(this.canvasContext);

    //finally render GUI
    this.sceneManager.RenderGUI(delta);
  };

  debugRenderPhysics = () => {
    let bodies = Matter.Composite.allBodies(this.physicsEngine.world);

    this.canvasContext.beginPath();

    for (var i = 0; i < bodies.length; i += 1) {
      var vertices = bodies[i].vertices;

      this.canvasContext.moveTo(vertices[0].x, vertices[0].y);

      for (var j = 1; j < vertices.length; j += 1) {
        this.canvasContext.lineTo(vertices[j].x, vertices[j].y);
      }

      this.canvasContext.lineTo(vertices[0].x, vertices[0].y);
    }

    this.canvasContext.lineWidth = 1;
    this.canvasContext.strokeStyle = "#fff";
    this.canvasContext.stroke();
  };

  collisionDetection = () => {
    //simple AABB collision check that notifies colliders of the collision
    for (var i = 0; i < this.sceneManager.activeScene.length - 1; i++) {
      var coll1 = this.sceneManager.activeScene[i];
      for (var j = i; j < this.sceneManager.activeScene.length; j++) {
        var coll2 = this.sceneManager.activeScene[j];
        //check for AABB collisions
        if (
          coll1.x + coll1.sImage.width > coll2.x &&
          coll1.y + coll1.sImage.height > coll2.y &&
          coll1.x < coll2.x + coll2.sImage.width &&
          coll1.y < coll2.y + coll2.sImage.height
        ) {
          //notify colliders
          coll1.OnCollision(coll2);
          coll2.OnCollision(coll1);
        }
      }
    }
  };

  // Utilities

  /**
   * @param {Engine} engine
   * @param {string} name
   * @param {number} x
   * @param {number} y
   * @param {number} z
   * @param {number} rotation
   * @param {string} imageSRC
   * @param {PhysicsBodyType} bodyType
   */
  AddGameObject = (name, x, y, z, rotation, imageSRC, bodyType = null) => {
    let object = new GameObject(
      this,
      name,
      x,
      y,
      z,
      rotation,
      imageSRC,
      bodyType
    );

    return object;
  };

  drawImage = (image, x, y) => {
    this.canvasContext.save();
    this.canvasContext.translate(x, y);
    this.canvasContext.drawImage(image, 0, 0);
    this.canvasContext.restore();
  };

  drawImageSize = (image, x, y, width, height) => {
    this.canvasContext.save();
    this.canvasContext.translate(x, y);
    this.canvasContext.drawImage(image, 0, 0, width, height);
    this.canvasContext.restore();
  };

  drawImageRotated = (image, x, y, width, height, angle) => {
    this.canvasContext.save();
    this.canvasContext.translate(x, y);
    this.canvasContext.rotate(angle);
    this.canvasContext.drawImage(image, -width / 2, -height / 2, width, height);
    this.canvasContext.restore();
  };

  styleText = (txtColour, txtFont, txtAlign, txtBaseline) => {
    //utility function ised to style text in a single call
    this.canvasContext.fillStyle = txtColour;
    this.canvasContext.font = txtFont;
    this.canvasContext.textAlign = txtAlign;
    this.canvasContext.textBaseline = txtBaseline;
  };
}
