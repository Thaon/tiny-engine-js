function StartGame() {
  const engine = new Engine();

  const scene = engine.sceneManager.AddScene("game");
  engine.debugPhysics = true;

  const ground = engine.AddGameObject(
    "ground",
    engine.center.x,
    1300,
    0,
    0,
    null,
    {
      type: "box",
      width: engine.canvas.width,
      height: 100,
      static: true,
    }
  );

  const box = engine.AddGameObject(
    "box",
    engine.center.x - 50,
    500,
    0,
    0,
    "./assets/Ship.jpg",
    {
      type: "box",
      width: 100,
      height: 150,
      static: false,
    }
  );

  box.OnTouch = () => {
    box.AddTorque(1);
  };

  const circle = engine.AddGameObject(
    "circle",
    engine.center.x,
    0,
    0,
    0,
    "./assets/Asteroid.png",
    {
      type: "circle",
      radius: 50,
      static: false,
    }
  );

  circle.OnTouchUp = () => {
    circle.AddForce(0, -1);
  };

  scene.AddSilently(ground);
  scene.AddSilently(circle);
  scene.AddSilently(box);

  engine.init(scene);
}
