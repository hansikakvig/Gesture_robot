import React, { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import {
  FilesetResolver,
  GestureRecognizer,
  DrawingUtils,
} from "@mediapipe/tasks-vision";

const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task";

const ACTIONS = {
  None: {
    label: "WAITING",
    emoji: "•",
    color: "#8a8f98",
  },

  Open_Palm: {
    label: "WAVE",
    emoji: "✋",
    color: "#00e5ff",
  },

  Closed_Fist: {
    label: "POWER",
    emoji: "✊",
    color: "#ffb000",
  },

  Pointing_Up: {
    label: "POINT",
    emoji: "☝️",
    color: "#9cff00",
  },

  Victory: {
    label: "DANCE",
    emoji: "✌️",
    color: "#ff4fd8",
  },

  Thumb_Up: {
    label: "YES",
    emoji: "👍",
    color: "#7cff6b",
  },

  Thumb_Down: {
    label: "NO",
    emoji: "👎",
    color: "#ff5b6e",
  },

  ILoveYou: {
    label: "LOVE",
    emoji: "🤟",
    color: "#a878ff",
  },
};

/* =========================================================
   3D ROBOT
========================================================= */

function Robot({ gesture }) {
  const group = useRef(null);

  const leftArm = useRef(null);
  const rightArm = useRef(null);

  const leftForearm = useRef(null);
  const rightForearm = useRef(null);

  const leftLeg = useRef(null);
  const rightLeg = useRef(null);

  const head = useRef(null);

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;

    if (!group.current) return;

    /* Floating effect */
    group.current.position.y =
      -1.05 + Math.sin(time * 1.7) * 0.035;

    /* Slow body rotation */
    group.current.rotation.y += delta * 0.08;

    /* Correct Three.js rotation interpolation */
    const lerpRotation = (object, axis, target, speed = 7) => {
      if (!object.current) return;

      object.current.rotation[axis] = THREE.MathUtils.lerp(
        object.current.rotation[axis],
        target,
        1 - Math.exp(-speed * delta)
      );
    };

    let leftArmTarget = 0;
    let rightArmTarget = 0;

    let leftForearmTarget = 0;
    let rightForearmTarget = 0;

    let leftLegTarget = 0;
    let rightLegTarget = 0;

    let headTarget = 0;

    /* -----------------------------------------
       OPEN PALM = WAVE
    ----------------------------------------- */

    if (gesture === "Open_Palm") {
      leftArmTarget = -0.8;
      rightArmTarget = 0.8;

      leftForearmTarget = -0.4;
      rightForearmTarget =
        Math.sin(time * 8) * 0.8;
    }

    /* -----------------------------------------
       CLOSED FIST = POWER
    ----------------------------------------- */

    else if (gesture === "Closed_Fist") {
      leftArmTarget = -0.55;
      rightArmTarget = 0.55;

      leftForearmTarget = -0.9;
      rightForearmTarget = 0.9;

      headTarget = Math.sin(time * 8) * 0.06;
    }

    /* -----------------------------------------
       POINTING UP = POINT
    ----------------------------------------- */

    else if (gesture === "Pointing_Up") {
      leftArmTarget = -0.15;
      rightArmTarget = 0.35;

      leftForearmTarget = 0;
      rightForearmTarget = -1.15;

      headTarget = Math.sin(time * 4) * 0.18;
    }

    /* -----------------------------------------
       VICTORY = DANCE
    ----------------------------------------- */

    else if (gesture === "Victory") {
      leftArmTarget = -1.2;
      rightArmTarget = 1.2;

      leftForearmTarget = -0.9;
      rightForearmTarget = 0.9;

      leftLegTarget =
        Math.sin(time * 7) * 0.35;

      rightLegTarget =
        -Math.sin(time * 7) * 0.35;

      headTarget =
        Math.sin(time * 7) * 0.12;
    }

    /* -----------------------------------------
       THUMB UP = YES
    ----------------------------------------- */

    else if (gesture === "Thumb_Up") {
      leftArmTarget = -0.2;
      rightArmTarget = 0.65;

      rightForearmTarget = -0.85;
    }

    /* -----------------------------------------
       THUMB DOWN = NO
    ----------------------------------------- */

    else if (gesture === "Thumb_Down") {
      rightArmTarget = -0.45;
      rightForearmTarget = 0.9;
    }

    /* -----------------------------------------
       I LOVE YOU
    ----------------------------------------- */

    else if (gesture === "ILoveYou") {
      leftArmTarget = -0.8;
      rightArmTarget = 0.8;

      leftForearmTarget = -0.5;
      rightForearmTarget = 0.5;

      headTarget =
        Math.sin(time * 5) * 0.12;
    }

    /* Apply rotations */

    lerpRotation(leftArm, "z", leftArmTarget);
    lerpRotation(rightArm, "z", rightArmTarget);

    lerpRotation(
      leftForearm,
      "z",
      leftForearmTarget
    );

    lerpRotation(
      rightForearm,
      "z",
      rightForearmTarget
    );

    lerpRotation(
      leftLeg,
      "z",
      leftLegTarget
    );

    lerpRotation(
      rightLeg,
      "z",
      rightLegTarget
    );

    lerpRotation(
      head,
      "y",
      headTarget
    );
  });

  /* Materials */

  const metal = new THREE.MeshStandardMaterial({
    color: "#e6e9ef",
    metalness: 0.75,
    roughness: 0.22,
  });

  const dark = new THREE.MeshStandardMaterial({
    color: "#20252d",
    metalness: 0.55,
    roughness: 0.3,
  });

  const yellow = new THREE.MeshStandardMaterial({
    color: "#f4c400",
    metalness: 0.45,
    roughness: 0.25,
  });

  const cyan = new THREE.MeshStandardMaterial({
    color: "#00d9ff",
    emissive: "#00aacc",
    emissiveIntensity: 1.7,
  });

  return (
    <group
      ref={group}
      position={[0, -1.05, 0]}
    >

      {/* ================= BODY ================= */}

      <mesh
        position={[0, 1.7, 0]}
        material={dark}
      >
        <boxGeometry
          args={[1.35, 1.25, 0.65]}
        />
      </mesh>

      <mesh
        position={[0, 1.7, 0.34]}
        material={cyan}
      >
        <boxGeometry
          args={[0.65, 0.55, 0.035]}
        />
      </mesh>

      <mesh
        position={[0, 1.7, 0.38]}
        material={metal}
      >
        <boxGeometry
          args={[0.42, 0.12, 0.03]}
        />
      </mesh>

      {/* ================= NECK ================= */}

      <mesh
        position={[0, 2.42, 0]}
        material={yellow}
      >
        <cylinderGeometry
          args={[0.2, 0.2, 0.22, 16]}
        />
      </mesh>

      {/* ================= HEAD ================= */}

      <group
        ref={head}
        position={[0, 2.82, 0]}
      >

        <mesh material={yellow}>
          <boxGeometry
            args={[0.82, 0.65, 0.7]}
          />
        </mesh>

        {/* Eyes */}

        <mesh
          position={[-0.18, 0.06, 0.36]}
          material={dark}
        >
          <sphereGeometry
            args={[0.065, 12, 12]}
          />
        </mesh>

        <mesh
          position={[0.18, 0.06, 0.36]}
          material={dark}
        >
          <sphereGeometry
            args={[0.065, 12, 12]}
          />
        </mesh>

        {/* Mouth */}

        <mesh
          position={[0, -0.14, 0.36]}
          material={dark}
        >
          <boxGeometry
            args={[0.27, 0.05, 0.03]}
          />
        </mesh>

        {/* Antenna */}

        <mesh
          position={[0, 0.34, 0]}
          material={metal}
        >
          <boxGeometry
            args={[0.16, 0.13, 0.18]}
          />
        </mesh>

      </group>

      {/* ================= SHOULDERS ================= */}

      <mesh
        position={[-0.84, 2.05, 0]}
        material={yellow}
      >
        <sphereGeometry
          args={[0.2, 16, 16]}
        />
      </mesh>

      <mesh
        position={[0.84, 2.05, 0]}
        material={yellow}
      >
        <sphereGeometry
          args={[0.2, 16, 16]}
        />
      </mesh>

      {/* ================= LEFT ARM ================= */}

      <group
        ref={leftArm}
        position={[-0.92, 1.85, 0]}
      >

        <mesh
          position={[0, -0.42, 0]}
          material={metal}
        >
          <boxGeometry
            args={[0.28, 0.82, 0.28]}
          />
        </mesh>

        <group
          ref={leftForearm}
          position={[0, -0.85, 0]}
        >

          <mesh
            position={[0, -0.34, 0]}
            material={yellow}
          >
            <boxGeometry
              args={[0.25, 0.68, 0.25]}
            />
          </mesh>

          <mesh
            position={[0, -0.73, 0]}
            material={dark}
          >
            <boxGeometry
              args={[0.32, 0.22, 0.32]}
            />
          </mesh>

        </group>

      </group>

      {/* ================= RIGHT ARM ================= */}

      <group
        ref={rightArm}
        position={[0.92, 1.85, 0]}
      >

        <mesh
          position={[0, -0.42, 0]}
          material={metal}
        >
          <boxGeometry
            args={[0.28, 0.82, 0.28]}
          />
        </mesh>

        <group
          ref={rightForearm}
          position={[0, -0.85, 0]}
        >

          <mesh
            position={[0, -0.34, 0]}
            material={yellow}
          >
            <boxGeometry
              args={[0.25, 0.68, 0.25]}
            />
          </mesh>

          <mesh
            position={[0, -0.73, 0]}
            material={dark}
          >
            <boxGeometry
              args={[0.32, 0.22, 0.32]}
            />
          </mesh>

        </group>

      </group>

      {/* ================= LEFT LEG ================= */}

      <group
        ref={leftLeg}
        position={[-0.4, 0.92, 0]}
      >

        <mesh
          position={[0, -0.55, 0]}
          material={yellow}
        >
          <boxGeometry
            args={[0.38, 1.05, 0.4]}
          />
        </mesh>

        <mesh
          position={[0, -1.12, 0.08]}
          material={dark}
        >
          <boxGeometry
            args={[0.48, 0.28, 0.7]}
          />
        </mesh>

      </group>

      {/* ================= RIGHT LEG ================= */}

      <group
        ref={rightLeg}
        position={[0.4, 0.92, 0]}
      >

        <mesh
          position={[0, -0.55, 0]}
          material={yellow}
        >
          <boxGeometry
            args={[0.38, 1.05, 0.4]}
          />
        </mesh>

        <mesh
          position={[0, -1.12, 0.08]}
          material={dark}
        >
          <boxGeometry
            args={[0.48, 0.28, 0.7]}
          />
        </mesh>

      </group>

    </group>
  );
}


/* =========================================================
   THREE.JS ROBOT SCENE
========================================================= */

function RobotScene({ gesture }) {
  return (
    <Canvas
      gl={{ antialias: true }}
      dpr={[1, 2]}
    >

      <PerspectiveCamera
        makeDefault
        position={[0, 1.1, 7]}
        fov={38}
      />

      <ambientLight intensity={1.3} />

      <directionalLight
        position={[4, 6, 5]}
        intensity={3}
      />

      <pointLight
        position={[-4, 2, 3]}
        intensity={2}
        color="#00d9ff"
      />

      <pointLight
        position={[4, 1, -2]}
        intensity={1.5}
        color="#ffcc33"
      />

      <Robot gesture={gesture} />

      {/* Robot platform */}

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -2.2, 0]}
      >
        <circleGeometry
          args={[2.3, 64]}
        />

        <meshStandardMaterial
          color="#11151c"
          metalness={0.4}
          roughness={0.7}
        />
      </mesh>

      <OrbitControls
        enablePan={false}
        minDistance={5}
        maxDistance={9}
      />

    </Canvas>
  );
}


/* =========================================================
   MAIN APP
========================================================= */

function App() {

  const videoRef = useRef(null);
  const overlayRef = useRef(null);

  const recognizerRef = useRef(null);
  const streamRef = useRef(null);
  const animationRef = useRef(null);

  const lastVideoTimeRef = useRef(-1);
  const lastGestureRef = useRef("None");

  const [cameraOn, setCameraOn] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [status, setStatus] =
    useState("Camera OFF");

  const [gesture, setGesture] =
    useState("None");

  const [confidence, setConfidence] =
    useState(0);

  const [history, setHistory] =
    useState([]);

  /* =====================================================
     CLEANUP
  ===================================================== */

  useEffect(() => {

    return () => {
      stopCamera();
    };

  }, []);

  /* =====================================================
     CREATE MEDIAPIPE
  ===================================================== */

  async function createRecognizer() {

    if (recognizerRef.current) {
      return recognizerRef.current;
    }

    const vision =
      await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );

    recognizerRef.current =
      await GestureRecognizer.createFromOptions(
        vision,
        {
          baseOptions: {
            modelAssetPath: MODEL_URL,
            delegate: "GPU",
          },

          runningMode: "VIDEO",

          numHands: 1,
        }
      );

    return recognizerRef.current;
  }

  /* =====================================================
     START CAMERA
  ===================================================== */

  async function startCamera() {

    try {

      setLoading(true);

      setStatus(
        "Loading hand recognition..."
      );

      /* Check browser support */

      if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
      ) {
        throw new Error(
          "Camera API is not supported by this browser."
        );
      }

      /* Load MediaPipe */

      const recognizer =
        await createRecognizer();

      /* Ask for camera */

      const stream =
        await navigator.mediaDevices.getUserMedia(
          {
            video: {
              width: {
                ideal: 1280,
              },

              height: {
                ideal: 720,
              },

              facingMode: "user",
            },

            audio: false,
          }
        );

      streamRef.current = stream;

      const video = videoRef.current;

      video.srcObject = stream;

      await video.play();

      setCameraOn(true);

      setLoading(false);

      setStatus(
        "Camera ON • Show your hand"
      );

      detectLoop(recognizer);

    } catch (error) {

      console.error(
        "CAMERA ERROR:",
        error
      );

      setLoading(false);

      if (
        error.name ===
        "NotAllowedError"
      ) {

        setStatus(
          "Camera permission denied"
        );

      } else if (
        error.name ===
        "NotFoundError"
      ) {

        setStatus(
          "No camera found"
        );

      } else if (
        error.name ===
        "NotReadableError"
      ) {

        setStatus(
          "Camera is being used by another app"
        );

      } else {

        setStatus(
          "Could not start camera"
        );
      }
    }
  }

  /* =====================================================
     STOP CAMERA
  ===================================================== */

  function stopCamera() {

    if (animationRef.current) {

      cancelAnimationFrame(
        animationRef.current
      );

      animationRef.current = null;
    }

    if (streamRef.current) {

      streamRef.current
        .getTracks()
        .forEach((track) => {
          track.stop();
        });

      streamRef.current = null;
    }

    if (videoRef.current) {

      videoRef.current.pause();

      videoRef.current.srcObject = null;
    }

    setCameraOn(false);

    setStatus("Camera OFF");

    setGesture("None");

    setConfidence(0);
  }

  /* =====================================================
     HAND DETECTION
  ===================================================== */

  function detectLoop(recognizer) {

    const video = videoRef.current;

    const canvas = overlayRef.current;

    if (!video || !canvas) {
      return;
    }

    const ctx =
      canvas.getContext("2d");

    const drawingUtils =
      new DrawingUtils(ctx);

    function loop() {

      if (
        !streamRef.current ||
        video.readyState < 2
      ) {

        animationRef.current =
          requestAnimationFrame(loop);

        return;
      }

      if (
        video.currentTime !==
        lastVideoTimeRef.current
      ) {

        lastVideoTimeRef.current =
          video.currentTime;

        canvas.width =
          video.videoWidth;

        canvas.height =
          video.videoHeight;

        ctx.clearRect(
          0,
          0,
          canvas.width,
          canvas.height
        );

        try {

          const result =
            recognizer.recognizeForVideo(
              video,
              performance.now()
            );

          /* Draw hand */

          if (
            result.landmarks &&
            result.landmarks.length
          ) {

            for (
              const landmarks of result.landmarks
            ) {

              drawingUtils.drawConnectors(
                landmarks,
                GestureRecognizer.HAND_CONNECTIONS,
                {
                  color: "#00e5ff",
                  lineWidth: 3,
                }
              );

              drawingUtils.drawLandmarks(
                landmarks,
                {
                  color: "#ffffff",
                  fillColor: "#00e5ff",
                  radius: 4,
                }
              );
            }
          }

          /* Gesture */

          const top =
            result.gestures?.[0]?.[0];

          const detectedName =
            top?.categoryName || "None";

          const score =
            top?.score || 0;

          const stableGesture =
            score >= 0.55
              ? detectedName
              : "None";

          if (
            stableGesture !==
            lastGestureRef.current
          ) {

            lastGestureRef.current =
              stableGesture;

            setGesture(
              stableGesture
            );

            setHistory((old) => [

              {
                gesture:
                  stableGesture,

                time:
                  new Date()
                    .toLocaleTimeString(),
              },

              ...old,

            ].slice(0, 8));
          }

          setConfidence(score);

        } catch (error) {

          console.error(
            "GESTURE ERROR:",
            error
          );
        }
      }

      animationRef.current =
        requestAnimationFrame(loop);
    }

    loop();
  }

  const action =
    ACTIONS[gesture] ||
    ACTIONS.None;

  /* =====================================================
     UI
  ===================================================== */

  return (

    <div className="app">

      {/* HEADER */}

      <header className="topbar">

        <div>

          <div className="eyebrow">
            AI • COMPUTER VISION • THREE.JS
          </div>

          <h1>
            GESTURE ROBOT LAB
          </h1>

        </div>

        <div
          className={`status-pill ${
            cameraOn ? "live" : ""
          }`}
        >

          <span className="dot" />

          {status}

        </div>

      </header>


      {/* DASHBOARD */}

      <main className="dashboard">

        {/* CAMERA */}

        <section className="camera-card panel">

          <div className="panel-title">

            <span>
              CAMERA INPUT
            </span>

            <span className="tiny">
              MEDIAPIPE HAND TRACKING
            </span>

          </div>


          <div className="camera-wrap">

            <video
              ref={videoRef}
              className="video"
              playsInline
              muted
            />

            <canvas
              ref={overlayRef}
              className="overlay"
            />


            {!cameraOn && (

              <div className="camera-placeholder">

                <div className="camera-icon">
                  ⌾
                </div>

                <b>
                  Camera is offline
                </b>

                <span>
                  Click START CAMERA to begin
                </span>

              </div>

            )}


            <div className="camera-corner">
              LIVE CV FEED
            </div>

          </div>


          {/* CONTROLS */}

          <div className="controls">

            {!cameraOn ? (

              <button
                onClick={startCamera}
                disabled={loading}
              >

                {loading
                  ? "LOADING AI..."
                  : "START CAMERA"}

              </button>

            ) : (

              <button
                className="danger"
                onClick={stopCamera}
              >
                STOP CAMERA
              </button>

            )}


            <div className="mini-stat">

              <span>
                CONFIDENCE
              </span>

              <b>
                {Math.round(
                  confidence * 100
                )}
                %
              </b>

            </div>


            <div className="mini-stat">

              <span>
                HANDS
              </span>

              <b>
                {cameraOn &&
                gesture !== "None"
                  ? "1"
                  : "0"}
              </b>

            </div>

          </div>

        </section>


        {/* ROBOT */}

        <section className="robot-card panel">

          <div className="panel-title">

            <span>
              ROBOT OUTPUT
            </span>

            <span className="tiny">
              REAL-TIME ACTION
            </span>

          </div>


          <div className="robot-stage">

            <RobotScene
              gesture={gesture}
            />


            <div className="action-overlay">

              <span>
                CURRENT ACTION
              </span>

              <strong
                style={{
                  color: action.color,
                }}
              >

                {action.emoji}{" "}
                {action.label}

              </strong>

            </div>

          </div>


          {/* READOUT */}

          <div className="gesture-readout">

            <div>

              <span>
                DETECTED GESTURE
              </span>

              <b>
                {gesture.replaceAll(
                  "_",
                  " "
                )}
              </b>

            </div>


            <div
              className="action-badge"
              style={{
                borderColor:
                  action.color,
              }}
            >

              {action.emoji}{" "}
              {action.label}

            </div>

          </div>

        </section>


        {/* GESTURES */}

        <section className="panel gestures-panel">

          <div className="panel-title">

            <span>
              GESTURE COMMANDS
            </span>

            <span className="tiny">
              SHOW ONE HAND
            </span>

          </div>


          <div className="gesture-grid">

            {Object.entries(ACTIONS)

              .filter(
                ([name]) =>
                  name !== "None"
              )

              .map(
                ([name, data]) => (

                  <div
                    className={`gesture-item ${
                      gesture === name
                        ? "active"
                        : ""
                    }`}
                    key={name}
                    style={{
                      "--accent":
                        data.color,
                    }}
                  >

                    <span className="gesture-emoji">
                      {data.emoji}
                    </span>

                    <div>

                      <b>
                        {name.replaceAll(
                          "_",
                          " "
                        )}
                      </b>

                      <small>
                        {data.label}
                      </small>

                    </div>

                  </div>

                )
              )}

          </div>

        </section>


        {/* HISTORY */}

        <section className="panel history-panel">

          <div className="panel-title">

            <span>
              EVENT LOG
            </span>

            <span className="tiny">
              LATEST DETECTIONS
            </span>

          </div>


          <div className="history">

            {history.length === 0 ? (

              <div className="empty">
                No gesture events yet.
              </div>

            ) : (

              history.map(
                (item, index) => (

                  <div
                    className="history-row"
                    key={index}
                  >

                    <span>
                      {item.time}
                    </span>

                    <b>
                      {item.gesture.replaceAll(
                        "_",
                        " "
                      )}
                    </b>

                    <span className="ok">
                      DETECTED
                    </span>

                  </div>

                )
              )

            )}

          </div>

        </section>

      </main>


      <footer>
        Gesture Robot Lab • React + Three.js + MediaPipe
      </footer>

    </div>
  );
}

export default App;