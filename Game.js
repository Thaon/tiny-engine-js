async function StartGame() {
  const engine = new Engine();
  engine.debugPhysics = true;

  // load in the sprites we are going to use
  await engine.spritesManager.LoadSprite("ship", "./assets/Ship.jpg");
  await engine.spritesManager.LoadSprite("asteroid", "./assets/Asteroid.png");

  // add and customise the ground
  const ground = engine.AddGameObject("ground", engine.center.x, 1300, 0, 0);

  ground.SetRigidBody({
    type: "box",
    width: engine.canvas.width,
    height: 100,
    static: true,
  });

  // add and customise the ship
  const box = engine.AddGameObject(
    "box",
    engine.center.x - 50,
    500,
    0,
    100,
    100,
    0
  );
  box.SetSprite("ship", true);
  box.SetRigidBody({
    type: "box",
    width: 100,
    height: 150,
    static: false,
  });

  // and interactions
  box.OnTouch = () => {
    box.AddTorque(1);
  };

  // add and customise the circle
  const circle = engine.AddGameObject(
    "circle",
    engine.center.x,
    0,
    0,
    100,
    100,
    0
  );
  circle.SetSprite("asteroid");
  circle.SetRigidBody({
    type: "circle",
    radius: 50,
    static: false,
  });
  // and interactions
  circle.OnTouchUp = () => {
    circle.AddForce(0, -0.5);
  };

  // setup scene and add gameobjects
  const scene = engine.sceneManager.AddScene("game");
  // we add objects silently because this does not call the Start method on them
  scene.AddSilently(ground);
  scene.AddSilently(circle);
  scene.AddSilently(box);

  // we finally initialise the engine with the scene we want to start with
  engine.init(scene);
}
