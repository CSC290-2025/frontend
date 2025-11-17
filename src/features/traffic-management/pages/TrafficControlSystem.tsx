import { useState, useEffect, useRef } from 'react';
import { database } from '@/lib/firebase';
import { ref, set, get, update, onValue } from 'firebase/database';

interface Light {
  color: 'red' | 'yellow' | 'green';
  remainingTime: number;
}

interface Junction {
  name: string;
  currentActive: string;
  mode: 'auto' | 'manual';
  lights: Record<string, Light>;
}

interface LogEntry {
  time: string;
  message: string;
}

interface LocalCountdown {
  remainingTime: number;
  phase: 'green' | 'yellow';
}

export default function TrafficControlSystem() {
  const [teamId, setTeamId] = useState('10');
  const [numDirections, setNumDirections] = useState(4);
  const [greenDuration, setGreenDuration] = useState(30);
  const [yellowDuration, setYellowDuration] = useState(5);
  const [mode, setMode] = useState<'auto' | 'manual'>('auto');
  const [junctions, setJunctions] = useState<Record<string, Junction>>({});
  const [isConnected, setIsConnected] = useState(false);
  const [statusText, setStatusText] = useState(
    'Ready - Configure and Load Junctions'
  );
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const currentSequenceRef = useRef<Record<string, number>>({});
  const localCountdownsRef = useRef<Record<string, LocalCountdown>>({});
  const isRunningRef = useRef(false);

  // Sync isRunning state with ref
  useEffect(() => {
    isRunningRef.current = isRunning;
  }, [isRunning]);

  // Generate direction labels dynamically
  const getDirections = () => {
    const directions: string[] = [];
    for (let i = 0; i < numDirections; i++) {
      directions.push(String.fromCharCode(65 + i)); // A, B, C, D, E, F, G, H
    }
    return directions;
  };

  // Add log entry
  const addLog = (message: string) => {
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [{ time, message }, ...prev].slice(0, 50));
  };

  // Update status display
  const updateStatus = (message: string, connected: boolean) => {
    setStatusText(message);
    setIsConnected(connected);
  };

  // Load junctions from Firebase
  const loadJunctions = async () => {
    if (!teamId) {
      addLog('Error: Please enter a Team ID');
      return;
    }

    addLog(`Loading junctions for team: ${teamId}...`);
    updateStatus('Loading junctions...', false);

    const junctionsRef = ref(database, `teams/${teamId}/junctions`);

    try {
      const snapshot = await get(junctionsRef);
      if (snapshot.exists()) {
        const loadedJunctions = snapshot.val();
        setJunctions(loadedJunctions);
        addLog(`Loaded ${Object.keys(loadedJunctions).length} junction(s)`);
        updateStatus(
          `${Object.keys(loadedJunctions).length} junction(s) loaded`,
          true
        );
        setupRealtimeListeners(loadedJunctions);
      } else {
        addLog('No junctions found. Creating default junction...');
        await createDefaultJunction();
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      addLog(`Error loading junctions: ${errorMessage}`);
      updateStatus('Error loading junctions', false);
    }
  };

  // Create default junction
  const createDefaultJunction = async () => {
    const directions = getDirections();
    const defaultJunction: Junction = {
      name: 'Junction 1',
      currentActive: directions[0],
      mode: 'auto',
      lights: {},
    };

    directions.forEach((dir) => {
      defaultJunction.lights[dir] = {
        color: 'red',
        remainingTime: 0,
      };
    });

    const junctionRef = ref(database, `teams/${teamId}/junctions/junction1`);
    await set(junctionRef, defaultJunction);

    setJunctions({ junction1: defaultJunction });
    addLog('Created default junction');
    updateStatus('1 junction created and loaded', true);
    setupRealtimeListeners({ junction1: defaultJunction });
  };

  // Setup realtime listeners for junctions
  const setupRealtimeListeners = (
    junctionsToListen: Record<string, Junction>
  ) => {
    Object.keys(junctionsToListen).forEach((junctionId) => {
      const junctionRef = ref(
        database,
        `teams/${teamId}/junctions/${junctionId}`
      );
      onValue(junctionRef, (snapshot) => {
        if (snapshot.exists()) {
          setJunctions((prev) => ({
            ...prev,
            [junctionId]: snapshot.val(),
          }));
        }
      });
    });
  };

  // Update lights in Firebase
  const updateLights = async (
    junctionId: string,
    activeDirection: string,
    color: 'red' | 'yellow' | 'green',
    remainingTime: number,
    allDirections: string[]
  ) => {
    const junctionRef = ref(
      database,
      `teams/${teamId}/junctions/${junctionId}`
    );
    const updates: Record<string, any> = {};
    const cycleTime = greenDuration + yellowDuration;
    const currentIndex = allDirections.indexOf(activeDirection);

    allDirections.forEach((dir, index) => {
      if (dir === activeDirection) {
        updates[`lights/${dir}/color`] = color;
        updates[`lights/${dir}/remainingTime`] = remainingTime;
      } else {
        let cyclesAhead =
          (index - currentIndex + allDirections.length) % allDirections.length;
        if (cyclesAhead === 0) cyclesAhead = allDirections.length;

        let totalWaitTime: number;
        if (color === 'green') {
          totalWaitTime =
            remainingTime + yellowDuration + (cyclesAhead - 1) * cycleTime;
        } else if (color === 'yellow') {
          totalWaitTime = remainingTime + (cyclesAhead - 1) * cycleTime;
        } else {
          totalWaitTime = remainingTime + (cyclesAhead - 1) * cycleTime;
        }

        updates[`lights/${dir}/color`] = 'red';
        updates[`lights/${dir}/remainingTime`] = totalWaitTime;
      }
    });

    updates['currentActive'] = activeDirection;
    await update(junctionRef, updates);
  };

  // Update remaining times in Firebase during countdown
  const updateRemainingTimes = async (
    junctionId: string,
    activeDirection: string,
    currentTime: number,
    allDirections: string[],
    currentPhase: 'green' | 'yellow'
  ) => {
    const junctionRef = ref(
      database,
      `teams/${teamId}/junctions/${junctionId}`
    );
    const updates: Record<string, any> = {};
    const cycleTime = greenDuration + yellowDuration;
    const currentIndex = allDirections.indexOf(activeDirection);

    allDirections.forEach((dir, index) => {
      if (dir === activeDirection) {
        updates[`lights/${dir}/remainingTime`] = currentTime;
      } else {
        let cyclesAhead =
          (index - currentIndex + allDirections.length) % allDirections.length;
        if (cyclesAhead === 0) cyclesAhead = allDirections.length;

        const totalWaitTime =
          currentPhase === 'green'
            ? currentTime + yellowDuration + (cyclesAhead - 1) * cycleTime
            : currentTime + (cyclesAhead - 1) * cycleTime;

        updates[`lights/${dir}/remainingTime`] = totalWaitTime;
      }
    });

    await update(junctionRef, updates);
  };

  // Sleep utility
  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  // Traffic light sequence logic
  const runTrafficSequence = async (junctionId: string) => {
    const directions = getDirections();

    if (!currentSequenceRef.current[junctionId]) {
      currentSequenceRef.current[junctionId] = 0;
    }

    const currentDirection = directions[currentSequenceRef.current[junctionId]];

    // Phase 1: Green light
    addLog(
      `${junctionId}: Direction ${currentDirection} - GREEN (${greenDuration}s)`
    );
    await updateLights(
      junctionId,
      currentDirection,
      'green',
      greenDuration,
      directions
    );

    for (let i = greenDuration; i > 0 && isRunningRef.current; i--) {
      directions.forEach((dir) => {
        localCountdownsRef.current[`${junctionId}-${dir}`] = {
          remainingTime: i,
          phase: 'green',
        };
      });

      await updateRemainingTimes(
        junctionId,
        currentDirection,
        i,
        directions,
        'green'
      );
      await sleep(1000);
    }

    if (!isRunningRef.current) return;

    // Phase 2: Yellow light
    addLog(
      `${junctionId}: Direction ${currentDirection} - YELLOW (${yellowDuration}s)`
    );
    await updateLights(
      junctionId,
      currentDirection,
      'yellow',
      yellowDuration,
      directions
    );

    for (let i = yellowDuration; i > 0 && isRunningRef.current; i--) {
      directions.forEach((dir) => {
        localCountdownsRef.current[`${junctionId}-${dir}`] = {
          remainingTime: i,
          phase: 'yellow',
        };
      });

      await updateRemainingTimes(
        junctionId,
        currentDirection,
        i,
        directions,
        'yellow'
      );
      await sleep(1000);
    }

    if (!isRunningRef.current) return;

    // Phase 3: Red light and move to next direction
    await updateLights(junctionId, currentDirection, 'red', 0, directions);

    currentSequenceRef.current[junctionId] =
      (currentSequenceRef.current[junctionId] + 1) % directions.length;
  };

  // Run continuous loop for a junction
  const runJunctionLoop = async (junctionId: string) => {
    while (isRunningRef.current) {
      await runTrafficSequence(junctionId);
    }
  };

  // Start automation
  const startAutomation = () => {
    if (isRunning) {
      addLog('System already running');
      return;
    }

    if (Object.keys(junctions).length === 0) {
      addLog('No junctions loaded. Please load junctions first.');
      return;
    }

    setIsRunning(true);
    addLog('Starting traffic light automation system...');
    updateStatus('System Running', true);

    Object.keys(junctions).forEach((junctionId) => {
      runJunctionLoop(junctionId);
    });
  };

  // Stop automation
  const stopAutomation = () => {
    setIsRunning(false);
    localCountdownsRef.current = {};
    addLog('Traffic light system stopped');
    updateStatus('System Stopped', true);
  };

  // Emergency stop - all lights to red
  const emergencyStop = async () => {
    setIsRunning(false);
    localCountdownsRef.current = {};
    addLog('EMERGENCY STOP - All lights set to RED');
    updateStatus('Emergency Stop Active', true);

    const directions = getDirections();

    for (const junctionId of Object.keys(junctions)) {
      const junctionRef = ref(
        database,
        `teams/${teamId}/junctions/${junctionId}`
      );
      const updates: Record<string, any> = {};

      directions.forEach((dir) => {
        updates[`lights/${dir}/color`] = 'red';
        updates[`lights/${dir}/remainingTime`] = 0;
      });

      await update(junctionRef, updates);
    }
  };

  // Initialize
  useEffect(() => {
    addLog(
      'System initialized. Configure directions, enter Team ID and click "Load Junctions" to begin.'
    );
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-5">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-5 rounded-lg bg-gray-800 p-6 text-white shadow-md">
          <h1 className="mb-2 text-3xl font-bold">
            Traffic Light Control System
          </h1>
          <p className="text-sm opacity-90">
            Smart City Traffic Management Dashboard
          </p>
        </div>

        {/* Controls */}
        <div className="mb-5 rounded-lg bg-white p-5 shadow-md">
          <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-800">
                Team ID
              </label>
              <input
                type="text"
                value={teamId}
                onChange={(e) => setTeamId(e.target.value)}
                placeholder="Enter team ID"
                className="rounded border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-800">
                Directions
              </label>
              <input
                type="number"
                value={numDirections}
                onChange={(e) => setNumDirections(Number(e.target.value))}
                min={2}
                max={8}
                placeholder="2-8"
                className="rounded border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-800">
                Green Duration (s)
              </label>
              <input
                type="number"
                value={greenDuration}
                onChange={(e) => setGreenDuration(Number(e.target.value))}
                min={5}
                max={120}
                className="rounded border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-800">
                Yellow Duration (s)
              </label>
              <input
                type="number"
                value={yellowDuration}
                onChange={(e) => setYellowDuration(Number(e.target.value))}
                min={3}
                max={10}
                className="rounded border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-800">
                Mode
              </label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as 'auto' | 'manual')}
                className="rounded border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              >
                <option value="auto">Auto</option>
                <option value="manual">Manual</option>
              </select>
            </div>
          </div>

          {/* Button Group */}
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            <button
              onClick={loadJunctions}
              className="rounded bg-gray-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-700"
            >
              Load Junctions
            </button>
            <button
              onClick={startAutomation}
              className="rounded bg-green-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-700"
            >
              Start System
            </button>
            <button
              onClick={stopAutomation}
              className="rounded bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              Stop System
            </button>
            <button
              onClick={emergencyStop}
              className="rounded bg-yellow-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-yellow-600"
            >
              Emergency Stop
            </button>
          </div>
        </div>

        {/* Status */}
        <div className="mb-5 flex items-center gap-2.5 rounded-lg bg-white px-5 py-4 shadow-md">
          <div
            className={`h-3 w-3 rounded-full ${
              isConnected ? 'animate-pulse bg-green-600' : 'bg-gray-400'
            }`}
          />
          <span className="text-sm">{statusText}</span>
        </div>

        {/* Junctions Grid */}
        <div className="mb-5 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Object.entries(junctions).map(([junctionId, junction]) => (
            <JunctionCard
              key={junctionId}
              junctionId={junctionId}
              junction={junction}
              directions={getDirections()}
            />
          ))}
        </div>

        {/* Logs */}
        <div className="rounded-lg bg-white p-5 shadow-md">
          <h3 className="mb-4 text-lg font-semibold text-gray-800">
            System Logs
          </h3>
          <div className="h-52 overflow-y-auto rounded bg-gray-800 p-4 font-mono text-xs text-gray-100">
            {logs.map((log, index) => (
              <div key={index} className="mb-1 py-0.5">
                <span className="text-gray-400">[{log.time}]</span>{' '}
                {log.message}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Junction Card Component
interface JunctionCardProps {
  junctionId: string;
  junction: Junction;
  directions: string[];
}

function JunctionCard({ junctionId, junction, directions }: JunctionCardProps) {
  const currentActive = junction.currentActive || directions[0];

  return (
    <div className="rounded-lg bg-white p-5 shadow-md">
      {/* Junction Header */}
      <div className="mb-4 flex items-center justify-between border-b-2 border-gray-200 pb-4">
        <div className="text-lg font-semibold text-gray-800">
          {junction.name || junctionId}
        </div>
        <div
          className={`rounded-xl px-3 py-1 text-xs font-semibold ${
            junction.mode === 'auto'
              ? 'bg-green-600 text-white'
              : 'bg-yellow-500 text-white'
          }`}
        >
          {junction.mode?.toUpperCase() || 'AUTO'}
        </div>
      </div>

      {/* Lights Container */}
      <div className="grid grid-cols-1 gap-2">
        {directions.map((dir) => {
          const light = junction.lights?.[dir] || {
            color: 'red',
            remainingTime: 0,
          };
          const isActive = dir === currentActive;

          return (
            <div
              key={dir}
              className={`flex items-center gap-4 rounded-md border-2 p-3 transition ${
                isActive ? 'border-green-600 bg-green-50' : 'border-gray-200'
              }`}
            >
              <div className="flex flex-1 flex-col gap-1">
                <div className="text-base font-semibold text-gray-800">
                  Direction {dir}
                </div>
                <div className="flex items-center gap-1">
                  <div
                    className={`h-3 w-3 rounded-full border ${getLightColor(light.color)}`}
                  />
                </div>
              </div>
              <div className="min-w-20 text-right text-3xl font-bold text-gray-800">
                {light.remainingTime}s
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Helper function for light colors
function getLightColor(color: 'red' | 'yellow' | 'green'): string {
  const colors = {
    red: 'bg-red-500 shadow-red-500/50 shadow-lg border-red-600',
    yellow:
      'bg-yellow-500 shadow-yellow-500/50 shadow-lg border-yellow-600 animate-pulse',
    green: 'bg-green-500 shadow-green-500/50 shadow-lg border-green-600',
  };
  return colors[color];
}
