async function StartGame() {
  const engine = new Engine();
  engine.debugPhysics = true;
  engine.physicsEngine.gravity = { x: 0, y: 0 };
  const level = await engine.levelManager.LoadLevel(
    "test",
    "./assets/Level3.js"
  );

  // setup scene and add gameobjects
  const scene = engine.sceneManager.AddScene("game");
  // parse the level we loaded
  level.forEach((object, index) => {
    const obj = engine.AddGameObject(
      object.imageName + index,
      object.x,
      object.y,
      1,
      100,
      100,
      object.rotation,
      object.scaleX,
      object.scaleY
    );
    obj.SetSprite(object.imageName, true);
    // we tell the engine to match the physics body to the sprite size
    obj.matchPhysics = true;

    // setup physics for the asteroid
    if (object.imageName == "Asteroid") {
      obj.SetRigidBody({
        type: "circle",
        radius: "auto",
        static: false,
      });
      obj.OnTouch = () => {
        // rotate right
        obj.AddTorque(5);
        let forward = obj.GetForwardVector();
        // forward points right, let's rotate it by -90 degrees
        let rotated = Matter.Vector.rotate(forward, -Math.PI / 2);
        obj.AddForce(Matter.Vector.mult(rotated, 0.01));
      };
    }

    // setup physics for the ship
    if (object.imageName == "Ship") {
      obj.SetRigidBody({
        type: "box",
        width: "auto",
        height: "auto",
        static: false,
      });

      obj.Update = (delta) => {
        // follow camera
        let camera = engine.camera;
        camera.SetPosition(obj.GetPos().x, obj.GetPos().y);
        // set zoom based on velocity
        let velocity = Matter.Vector.magnitudeSquared(obj.GetVelocity());
        let maxVelocity = 100;
        let minZoom = 0.5;
        let maxZoom = 1.5;
        let zoom = 1;
        // zoom out when moving fast
        zoom = engine.Lerp(minZoom, maxZoom, 1 - velocity / maxVelocity);
        zoom = engine.Clamp(zoom, minZoom, maxZoom);
        // smoothly zoom
        zoom = engine.Lerp(camera.zoom, zoom, 0.01);
        camera.SetZoom(zoom);
      };

      obj.RenderGUI = () => {
        // draw text for the camera coords
        engine.DrawText(
          "Camera: " +
            engine.camera.x.toFixed(0) +
            ", " +
            engine.camera.y.toFixed(0),
          10,
          40,
          "#fff",
          40
        );
      };

      obj.PhysicsUpdate = () => {
        if (engine.inputManager.OnTouch()) {
          // seek the mouse position
          let mousePos = engine.inputManager.GetMousePosition();
          let desiredVelocity = Matter.Vector.sub(mousePos, obj.GetPos());
          desiredVelocity = Matter.Vector.normalise(desiredVelocity);
          desiredVelocity = Matter.Vector.mult(desiredVelocity, 0.01);
          obj.AddForce(desiredVelocity);
          // rotate towards the velocity
          let velocity = Matter.Vector.normalise(obj.GetVelocity());

          // draw line to show desired velocity vector with engine.drawLine(x1, y1, x2, y2, color = "#fff", width = 1)
          engine.DrawLine(
            obj.GetPos().x,
            obj.GetPos().y,
            mousePos.x,
            mousePos.y,
            "#0f0",
            4
          );

          //draw line to show velocity vector with engine.drawLine(x1, y1, x2, y2, color = "#fff", width = 1)
          engine.DrawLine(
            obj.GetPos().x,
            obj.GetPos().y,
            obj.GetPos().x + obj.GetVelocity().x * 10,
            obj.GetPos().y + obj.GetVelocity().y * 10,
            "#f00",
            4
          );

          let angleRad = Math.atan2(velocity.y, velocity.x);
          // rotate 90 degrees as the forward vector is pointing right
          angleRad += Math.PI / 2;
          // rotate the object to align with the velocity vector
          obj.SetRotationRad(angleRad);
        }
      };
    }

    // we add objects silently because this does not call the Start method on them
    scene.Add(obj);
  });

  // we finally initialise the engine with the scene we want to start with
  engine.Run(scene);
}
