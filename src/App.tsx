/**
 * Jeopardy Live Show - Licenciamiento Firestore
 * Exact fidelity implementation matching the provided architecture and UI.
 */
import { useEffect, useRef } from 'react';
import type { Category, Team } from './types';
import { firebaseConfig } from './firebaseConfig';

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const STORAGE_KEY = 'jeopardy_state';

    const DEFAULT_TEAMS_TEMPLATE: Team[] = [
      { id: 'azul', name: 'Equipo Azul', color: '#2563EB', score: 0, members: [] },
      { id: 'rojo', name: 'Equipo Rojo', color: '#DC2626', score: 0, members: [] },
      { id: 'verde', name: 'Equipo Verde', color: '#16A34A', score: 0, members: [] },
      { id: 'amarillo', name: 'Equipo Amarillo', color: '#CA8A04', score: 0, members: [] },
      { id: 'morado', name: 'Equipo Morado', color: '#9333EA', score: 0, members: [] }
    ];

    const DEFAULT_CATEGORIES: Category[] = [
      {
        id: 'cat-1', title: 'Historia',
        clues: [
          { id: 'c1-100', value: 100, question: 'Año de la llegada de Cristóbal Colón al continente americano.', answer: '1492', isAnswered: false },
          { id: 'c1-200', value: 200, question: 'Civilización precolombina constructora de la ciudadela de Machu Picchu.', answer: 'Los Incas', isAnswered: false },
          { id: 'c1-300', value: 300, question: 'Primer emperador de Roma tras la caída de la República.', answer: 'César Augusto', isAnswered: false },
          { id: 'c1-400', value: 400, question: 'Tratado firmado en 1919 que selló el final de la Primera Guerra Mundial.', answer: 'Tratado de Versalles', isAnswered: false },
          { id: 'c1-500', value: 500, question: 'Pensador de la Ilustración autor de la división de poderes.', answer: 'Montesquieu', isAnswered: false }
        ]
      },
      {
        id: 'cat-2', title: 'Ciencia',
        clues: [
          { id: 'c2-100', value: 100, question: 'Elemento químico más ligero y abundante del universo.', answer: 'Hidrógeno', isAnswered: false },
          { id: 'c2-200', value: 200, question: 'Fuerza que atrae los cuerpos hacia el centro de la Tierra.', answer: 'Gravedad', isAnswered: false },
          { id: 'c2-300', value: 300, question: 'Orgánulo celular responsable de la respiración celular.', answer: 'Mitocondria', isAnswered: false },
          { id: 'c2-400', value: 400, question: 'Velocidad estimada de la luz en el vacío en km/s.', answer: '300.000 km/s', isAnswered: false },
          { id: 'c2-500', value: 500, question: 'Partícula de carga neutra en el núcleo atómico.', answer: 'Neutrón', isAnswered: false }
        ]
      },
      {
        id: 'cat-3', title: 'Geografía',
        clues: [
          { id: 'c3-100', value: 100, question: 'Río con mayor caudal y longitud del planeta Tierra.', answer: 'Río Amazonas', isAnswered: false },
          { id: 'c3-200', value: 200, question: 'País soberano con mayor superficie territorial del planeta.', answer: 'Rusia', isAnswered: false },
          { id: 'c3-300', value: 300, question: 'Cordillera continental más larga del mundo en Sudamérica.', answer: 'Cordillera de los Andes', isAnswered: false },
          { id: 'c3-400', value: 400, question: 'Ciudad capital de Australia.', answer: 'Canberra', isAnswered: false },
          { id: 'c3-500', value: 500, question: 'Desierto no polar más árido del mundo en el norte de Chile.', answer: 'Desierto de Atacama', isAnswered: false }
        ]
      },
      {
        id: 'cat-4', title: 'Cultura Pop',
        clues: [
          { id: 'c4-100', value: 100, question: 'Identidad secreta del superhéroe protector de Gotham conocido como Batman.', answer: 'Bruce Wayne', isAnswered: false },
          { id: 'c4-200', value: 200, question: 'Banda británica icónica integrada por John, Paul, George y Ringo.', answer: 'The Beatles', isAnswered: false },
          { id: 'c4-300', value: 300, question: 'Superproducción de James Cameron ambientada en Pandora.', answer: 'Avatar', isAnswered: false },
          { id: 'c4-400', value: 400, question: 'Criatura eléctrica y mascota de Pokémon.', answer: 'Pikachu', isAnswered: false },
          { id: 'c4-500', value: 500, question: 'Autor británico de "El Señor de los Anillos".', answer: 'J.R.R. Tolkien', isAnswered: false }
        ]
      },
      {
        id: 'cat-5', title: 'Deportes',
        clues: [
          { id: 'c5-100', value: 100, question: 'País con mayor cantidad de títulos en Copas Mundiales FIFA.', answer: 'Brasil (5 títulos)', isAnswered: false },
          { id: 'c5-200', value: 200, question: 'Puntaje máximo en una partida de boliche (bowling).', answer: '300 puntos', isAnswered: false },
          { id: 'c5-300', value: 300, question: 'Atleta jamaiquino plusmarquista de los 100 y 200 metros planos.', answer: 'Usain Bolt', isAnswered: false },
          { id: 'c5-400', value: 400, question: 'Grand Slam disputado sobre césped en Reino Unido.', answer: 'Wimbledon', isAnswered: false },
          { id: 'c5-500', value: 500, question: 'Número reglamentario de jugadores por equipo en cancha en básquetbol.', answer: '5 jugadores', isAnswered: false }
        ]
      }
    ];

    class SoundSynthesizer {
      ctx: AudioContext | null = null;
      init() {
        if (!this.ctx) {
          const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioCtx) this.ctx = new AudioCtx();
        }
        if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
      }
      playSelect() {
        this.init(); if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587, now);
        osc.frequency.exponentialRampToValueAtTime(1174, now + 0.08);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
        osc.connect(gain); gain.connect(this.ctx.destination);
        osc.start(now); osc.stop(now + 0.1);
      }
      playClueOpen() {
        this.init(); if (!this.ctx) return;
        const now = this.ctx.currentTime;
        [233, 293, 349, 466, 587, 700].forEach((freq, idx) => {
          if (!this.ctx) return;
          const st = now + idx * 0.05;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, st);
          gain.gain.setValueAtTime(0.2, st);
          gain.gain.exponentialRampToValueAtTime(0.001, st + 0.3);
          osc.connect(gain); gain.connect(this.ctx.destination);
          osc.start(st); osc.stop(st + 0.32);
        });
      }
      playBuzz() {
        this.init(); if (!this.ctx) return;
        const now = this.ctx.currentTime;
        [1046, 1567, 2093].forEach(freq => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);
          gain.gain.setValueAtTime(0.25, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
          osc.connect(gain); gain.connect(this.ctx.destination);
          osc.start(now); osc.stop(now + 0.62);
        });
      }
      playCorrect() {
        this.init(); if (!this.ctx) return;
        const now = this.ctx.currentTime;
        [523, 659, 783, 1046].forEach((f, i) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.frequency.setValueAtTime(f, now + i * 0.05);
          gain.gain.setValueAtTime(0.2, now + i * 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.3);
          osc.connect(gain); gain.connect(this.ctx.destination);
          osc.start(now + i * 0.05); osc.stop(now + i * 0.05 + 0.32);
        });
      }
      playWrong() {
        this.init(); if (!this.ctx) return;
        const now = this.ctx.currentTime;
        [98, 138].forEach(f => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(f, now);
          gain.gain.setValueAtTime(0.25, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
          osc.connect(gain); gain.connect(this.ctx.destination);
          osc.start(now); osc.stop(now + 0.32);
        });
      }
    }
    const sound = new SoundSynthesizer();
    const handlePointerDown = () => sound.init();
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });

    function getDefaultState(): any {
      return {
        roomCode: 'EN VIVO',
        status: 'setup',
        title: 'Torneo Jeopardy Live Show',
        categories: JSON.parse(JSON.stringify(DEFAULT_CATEGORIES)),
        teamCount: 3,
        maxMembersPerTeam: 5,
        teams: JSON.parse(JSON.stringify(DEFAULT_TEAMS_TEMPLATE.slice(0, 3))),
        activeClue: null,
        currentTurn: null,
        buzzQueue: [],
        disqualifiedTeams: [],
        buzzersUnlocked: false,
        loadingDevicesState: true,
        lastUpdated: Date.now()
      };
    }

    function loadState() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return JSON.parse(raw);
      } catch (e) {}
      return getDefaultState();
    }

    let state = loadState();

    const urlParams = new URLSearchParams(window.location.search);
    let assignedTeamId = urlParams.get('team') || null;
    let currentRole = (urlParams.get('role') === 'player' || assignedTeamId !== null) ? 'player' : 'host';

    if (currentRole === 'host') state.status = 'setup';

    let fbFirestore: any = null;
    let fbDb: any = null;
    let serverTimeOffset = 0;
    let isTeacherAuthenticated = localStorage.getItem('auth_token_jeopardy') !== null;

    try {
      if (window.firebase) {
        if (!window.firebase.apps.length) {
          if (firebaseConfig.apiKey) {
            window.firebase.initializeApp(firebaseConfig);
          } else {
            console.warn('Firebase: VITE_FIREBASE_API_KEY no detectada. Configura las variables de entorno para habilitar Firestore y Realtime Database.');
          }
        }
        if (window.firebase.apps.length) {
          fbFirestore = window.firebase.firestore();
          try {
            fbDb = window.firebase.database();
          } catch (dbErr) {
            console.warn('Realtime Database no disponible o URL no configurada:', dbErr);
          }
          setupFirebaseSync();
        }
      }
    } catch (err) {
      console.warn('Firebase init error:', err);
    }

    function getOrCreateDeviceId() {
      let devId = localStorage.getItem('jeopardy_device_id');
      if (!devId) {
        devId = `dev_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        localStorage.setItem('jeopardy_device_id', devId);
      }
      return devId;
    }

    function setupFirebaseSync() {
      if (!fbDb) return;

      fbDb.ref('.info/serverTimeOffset').on('value', (snap: any) => {
        serverTimeOffset = snap.val() || 0;
      });

      // Manejo seguro de reset global sin bucle de recarga infinito
      fbDb.ref('sessions/jeopardy_game/globalReset').on('value', (snap: any) => {
        const resetVal = snap.val();
        if (!resetVal) return;
        const resetTime = typeof resetVal === 'number' ? resetVal : (resetVal.timestamp || 0);
        const lastHandled = Number(sessionStorage.getItem('last_handled_reset') || '0');
        if (resetTime > lastHandled) {
          sessionStorage.setItem('last_handled_reset', String(resetTime));
          localStorage.removeItem('auth_token_jeopardy');
          localStorage.removeItem('jeopardy_player_name');
          localStorage.removeItem('jeopardy_player_team');
          localStorage.removeItem('jeopardy_player_id');
          localStorage.removeItem(STORAGE_KEY);
          state = getDefaultState();
          state.status = 'setup';
          isTeacherAuthenticated = false;
          render();
        }
      });

      fbDb.ref('jeopardy_game/teams').on('value', (snap: any) => {
        const val = snap.val() || {};
        state.teams.forEach((team: any) => {
          const tData = val[team.id];
          if (tData && tData.players) {
            team.members = Object.values(tData.players);
          } else {
            team.members = [];
          }
        });
        updateLiveParticipantsDOM();
      });

      fbDb.ref('sessions/jeopardy_game').on('value', (snap: any) => {
        const session = snap.val() || {};
        const prevTurn = state.currentTurn;
        const prevUnlocked = state.buzzersUnlocked;

        state.activeClue = session.activeClue || null;
        state.currentTurn = session.activeTurn || null;
        state.buzzQueue = session.buzzQueue ? Object.values(session.buzzQueue).sort((a: any, b: any) => a.timestamp - b.timestamp) : [];
        state.disqualifiedTeams = session.disqualifiedTeams || [];
        state.buzzersUnlocked = Boolean(session.buzzersUnlocked);
        state.loadingDevicesState = session.loadingDevicesState !== undefined ? Boolean(session.loadingDevicesState) : true;
        if (session.status) state.status = session.status;

        if (!prevUnlocked && state.buzzersUnlocked && currentRole === 'player') {
          sound.playSelect();
        }

        if (state.currentTurn && (!prevTurn || prevTurn.playerId !== state.currentTurn.playerId) && currentRole === 'host') {
          sound.playBuzz();
        }

        render();
      });
    }

    function updateLiveParticipantsDOM() {
      if (currentRole !== 'host') return;
      const activeTeams = state.teams.slice(0, state.teamCount);
      let total = 0;

      activeTeams.forEach((team: any) => {
        const membersList = team.members ? (Array.isArray(team.members) ? team.members : Object.values(team.members)) : [];
        const count = membersList.length;
        total += count;

        ['setup', 'qr'].forEach(prefix => {
          const countEl = document.getElementById(`${prefix}-team-count-${team.id}`);
          if (countEl) countEl.textContent = `${count} / ${state.maxMembersPerTeam} registrados`;

          const listEl = document.getElementById(`${prefix}-team-members-${team.id}`);
          if (listEl) {
            if (count === 0) {
              listEl.innerHTML = `<span class="text-[10px] text-blue-400/60 italic py-1 block text-center">Esperando...</span>`;
            } else {
              listEl.innerHTML = membersList.map((m: any) => `
                <div class="text-xs font-semibold text-gray-200 flex justify-between items-center py-0.5 border-b border-gray-800/50">
                  <span class="truncate">${escapeHtml(m.name)}</span>
                  <span class="text-green-400 text-[10px]">● Conectado</span>
                </div>
              `).join('');
            }
          }
        });
      });

      const totalSetup = document.getElementById('setup-total-connected-count');
      if (totalSetup) totalSetup.textContent = `${total} Conectados`;
      const totalQr = document.getElementById('qr-total-connected-count');
      if (totalQr) totalQr.textContent = String(total);
    }

    function openClue(catId: string, clueId: string) {
      const cat = state.categories.find((c: any) => c.id === catId);
      const clue = cat?.clues.find((cl: any) => cl.id === clueId);
      if (!clue || clue.isAnswered) return;

      state.activeClue = { ...clue, categoryTitle: cat.title, catId: cat.id };
      state.loadingDevicesState = true;
      state.currentTurn = null;
      state.buzzQueue = [];
      state.disqualifiedTeams = [];
      state.buzzersUnlocked = true;

      sound.playSelect();

      if (fbDb) {
        fbDb.ref('sessions/jeopardy_game').update({
          activeClue: state.activeClue,
          activeTurn: null,
          buzzQueue: null,
          disqualifiedTeams: null,
          buzzersUnlocked: true,
          loadingDevicesState: true
        });
      }
      persistState(state);
    }

    function deployQuestion() {
      state.loadingDevicesState = false;
      sound.playClueOpen();

      if (fbDb) {
        fbDb.ref('sessions/jeopardy_game').update({
          loadingDevicesState: false,
          buzzersUnlocked: true
        });
      }
      persistState(state);
    }

    function handleAnswerEvaluation(isCorrect: boolean) {
      if (!state.activeClue || !state.currentTurn) return;

      const currentTurn = state.currentTurn;
      const clueVal = state.activeClue.value;
      const team = state.teams.find((t: any) => t.id === currentTurn.teamId);

      if (isCorrect) {
        if (team) team.score += clueVal;
        sound.playCorrect();
        if (typeof window.confetti === 'function') window.confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });

        const cat = state.categories.find((c: any) => c.id === state.activeClue.catId);
        const cl = cat?.clues.find((x: any) => x.id === state.activeClue.id);
        if (cl) cl.isAnswered = true;

        state.activeClue = null;
        state.loadingDevicesState = true;
        state.currentTurn = null;
        state.buzzQueue = [];
        state.disqualifiedTeams = [];
        state.buzzersUnlocked = false;

        if (fbDb) {
          fbDb.ref('jeopardy_game/teams').set(state.teams);
          fbDb.ref('sessions/jeopardy_game').update({
            activeClue: null,
            activeTurn: null,
            buzzQueue: null,
            disqualifiedTeams: null,
            buzzersUnlocked: false,
            loadingDevicesState: true
          });
        }
        persistState(state);
      } else {
        if (team) team.score -= clueVal;
        sound.playWrong();

        const disq = [...(state.disqualifiedTeams || [])];
        if (!disq.includes(currentTurn.teamId)) disq.push(currentTurn.teamId);
        state.disqualifiedTeams = disq;

        const remainingQueue = (state.buzzQueue || []).filter((item: any) => !disq.includes(item.teamId));

        if (remainingQueue.length > 0) {
          const nextTurn = remainingQueue.shift();
          state.currentTurn = nextTurn;
          state.buzzQueue = remainingQueue;

          if (fbDb) {
            fbDb.ref('jeopardy_game/teams').set(state.teams);
            fbDb.ref('sessions/jeopardy_game/activeTurn').set(nextTurn);
            fbDb.ref('sessions/jeopardy_game/buzzQueue').set(remainingQueue);
            fbDb.ref('sessions/jeopardy_game/disqualifiedTeams').set(disq);
          }
        } else {
          state.currentTurn = null;
          state.buzzQueue = [];

          if (fbDb) {
            fbDb.ref('jeopardy_game/teams').set(state.teams);
            fbDb.ref('sessions/jeopardy_game/activeTurn').remove();
            fbDb.ref('sessions/jeopardy_game/buzzQueue').remove();
            fbDb.ref('sessions/jeopardy_game/disqualifiedTeams').set(disq);
            fbDb.ref('sessions/jeopardy_game/buzzersUnlocked').set(true);
          }
        }
        persistState(state);
      }
    }

    function cancelActiveClue() {
      if (!state.activeClue) return;
      const cat = state.categories.find((c: any) => c.id === state.activeClue.catId);
      const cl = cat?.clues.find((x: any) => x.id === state.activeClue.id);
      if (cl) cl.isAnswered = true;

      state.activeClue = null;
      state.loadingDevicesState = true;
      state.currentTurn = null;
      state.buzzQueue = [];
      state.disqualifiedTeams = [];
      state.buzzersUnlocked = false;

      if (fbDb) {
        fbDb.ref('sessions/jeopardy_game').update({
          activeClue: null,
          activeTurn: null,
          buzzQueue: null,
          disqualifiedTeams: null,
          buzzersUnlocked: false,
          loadingDevicesState: true
        });
      }
      persistState(state);
    }

    function executeResetBoard() {
      sound.playSelect();
      state.teams = state.teams.map((t: any) => ({ ...t, score: 0 }));
      state.categories.forEach((c: any) => c.clues.forEach((cl: any) => cl.isAnswered = false));
      state.activeClue = null;
      state.loadingDevicesState = true;
      state.currentTurn = null;
      state.buzzQueue = [];
      state.disqualifiedTeams = [];
      state.buzzersUnlocked = false;

      if (fbDb) {
        fbDb.ref('jeopardy_game/teams').set(state.teams);
        fbDb.ref('sessions/jeopardy_game').update({
          activeClue: null,
          activeTurn: null,
          buzzQueue: null,
          disqualifiedTeams: null,
          buzzersUnlocked: false,
          loadingDevicesState: true
        });
      }
      persistState(state);
    }

    function executeGlobalLogout() {
      sound.playWrong();
      localStorage.removeItem('auth_token_jeopardy');
      const now = Date.now();
      sessionStorage.setItem('last_handled_reset', String(now));
      if (fbDb) {
        fbDb.ref('jeopardy_game').remove();
        fbDb.ref('sessions/jeopardy_game').set({ globalReset: now });
      }
      sessionStorage.clear();
      state = getDefaultState();
      state.status = 'setup';
      isTeacherAuthenticated = false;
      render();
    }

    function persistState(newState: any) {
      newState.lastUpdated = Date.now();
      state = newState;
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
      if (fbDb && currentRole === 'host') {
        fbDb.ref('sessions/jeopardy_game/status').set(newState.status);
      }
      render();
    }

    function escapeHtml(str: string) {
      if (!str) return '';
      return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function downloadCSVSample() {
      const csvContent = "\uFEFF" + 
`Categoría,Puntos,Pregunta,Respuesta
Historia,100,Año de la llegada de Cristóbal Colón al continente americano.,1492
Historia,200,Civilización precolombina constructora de la ciudadela de Machu Picchu.,Los Incas
Historia,300,Primer emperador de Roma tras la caída de la República.,César Augusto
Historia,400,Tratado firmado en 1919 que selló el final de la Primera Guerra Mundial.,Tratado de Versalles
Historia,500,Pensador de la Ilustración autor de la división de poderes.,Montesquieu
Ciencia,100,Elemento químico más ligero y abundante del universo.,Hidrógeno
Ciencia,200,Fuerza que atrae los cuerpos hacia el centro de la Tierra.,Gravedad
Ciencia,300,Orgánulo celular responsable de la respiración celular.,Mitocondria
Ciencia,400,Velocidad estimada de la luz en el vacío en km/s.,300.000 km/s
Ciencia,500,Partícula de carga neutra en el núcleo atómico.,Neutrón
Geografía,100,Río con mayor caudal y longitud del planeta Tierra.,Río Amazonas
Geografía,200,País soberano con mayor superficie territorial del planeta.,Rusia
Geografía,300,Cordillera continental más larga del mundo en Sudamérica.,Cordillera de los Andes
Geografía,400,Ciudad capital de Australia.,Canberra
Geografía,500,Desierto no polar más árido del mundo en el norte de Chile.,Desierto de Atacama
Cultura Pop,100,Identidad secreta del superhéroe protector de Gotham conocido como Batman.,Bruce Wayne
Cultura Pop,200,Banda británica icónica integrada por John Paul George y Ringo.,The Beatles
Cultura Pop,300,Superproducción de James Cameron ambientada en Pandora.,Avatar
Cultura Pop,400,Criatura eléctrica y mascota de Pokémon.,Pikachu
Cultura Pop,500,Autor británico de El Señor de los Anillos.,J.R.R. Tolkien
Deportes,100,País con mayor cantidad de títulos en Copas Mundiales FIFA.,Brasil (5 títulos)
Deportes,200,Puntaje máximo en una partida de boliche (bowling).,300 puntos
Deportes,300,Atleta jamaiquino plusmarquista de los 100 y 200 metros planos.,Usain Bolt
Deportes,400,Grand Slam disputado sobre césped en Reino Unido.,Wimbledon
Deportes,500,Número reglamentario de jugadores por equipo en cancha en básquetbol.,5 jugadores`;

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'plantilla_preguntas_jeopardy.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }

    function handleCSVUpload(file: File) {
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function(e: any) {
        try {
          const text = e.target.result;
          const lines = text.split(/\r\n|\n/).map((l: string) => l.trim()).filter((l: string) => l.length > 0);
          if (lines.length < 2) {
            alert('El archivo CSV está vacío o no contiene suficientes filas.');
            return;
          }
          const headerLine = lines[0];
          let delimiter = ',';
          if (headerLine.includes(';') && !headerLine.includes(',')) delimiter = ';';
          else if (headerLine.includes('\t')) delimiter = '\t';

          const categoriesMap = new Map<string, any[]>();

          for (let i = 1; i < lines.length; i++) {
            const line = lines[i];
            const parts: string[] = [];
            let inQuote = false;
            let cur = '';
            for (let j = 0; j < line.length; j++) {
              const ch = line[j];
              if (ch === '"') {
                inQuote = !inQuote;
              } else if (ch === delimiter && !inQuote) {
                parts.push(cur.trim());
                cur = '';
              } else {
                cur += ch;
              }
            }
            parts.push(cur.trim());

            if (parts.length >= 3) {
              const catTitle = parts[0].replace(/^["']|["']$/g, '').trim();
              const valNum = parseInt(parts[1].replace(/[^0-9]/g, ''), 10) || 100;
              const question = parts[2].replace(/^["']|["']$/g, '').trim();
              const answer = (parts[3] || '').replace(/^["']|["']$/g, '').trim();

              if (!catTitle || !question) continue;

              if (!categoriesMap.has(catTitle)) {
                categoriesMap.set(catTitle, []);
              }
              const cluesArr = categoriesMap.get(catTitle)!;
              cluesArr.push({
                id: `c_${categoriesMap.size}_${cluesArr.length + 1}_${Date.now()}`,
                value: valNum,
                question: question,
                answer: answer || 'Respuesta no especificada',
                isAnswered: false
              });
            }
          }

          if (categoriesMap.size === 0) {
            alert('No se encontraron preguntas válidas en el archivo CSV.');
            return;
          }

          const newCategories: Category[] = [];
          let catIndex = 1;
          categoriesMap.forEach((clues, title) => {
            newCategories.push({
              id: `cat-${catIndex++}-${Date.now()}`,
              title: title,
              clues: clues.slice(0, 5)
            });
          });

          state.categories = newCategories;
          persistState(state);
          sound.playCorrect();
          alert(`¡Se han cargado con éxito ${newCategories.length} categorías de preguntas!`);
        } catch (err: any) {
          console.error('Error al procesar CSV:', err);
          alert('Error al leer el archivo CSV: ' + err.message);
        }
      };
      reader.readAsText(file, 'UTF-8');
    }

    function render() {
      const app = container;
      if (!app) return;

      if (currentRole === 'player') {
        renderPlayerView(app);
        return;
      }

      if (!isTeacherAuthenticated) {
        renderAuthModal(app);
        return;
      }

      if (state.status === 'setup') {
        renderSetupScreen(app);
        return;
      }

      if (state.status === 'qrcodes') {
        renderQRCodesScreen(app);
        return;
      }

      if (state.status === 'podium_teams') {
        renderPodiumTeamsScreen(app);
        return;
      }

      renderGameScreen(app);
    }

    // ESTADO DEL MODAL DE AUTENTICACIÓN (ESTILO METHAPLAN)
    let authTab = 'login'; // 'login' o 'license'
    let licenseStep = 'verify'; // 'verify' o 'register'
    let verifiedLicenseData: any = null;
    let showPassword = false;
    let authErrorMsg = '';
    let authLoading = false;

    function renderAuthModal(appContainer: HTMLElement) {
      appContainer.innerHTML = `
        <div class="fixed inset-0 bg-[#000533]/95 backdrop-blur-md z-50 flex flex-col items-center justify-center p-4">
          <div class="max-w-md w-full bg-[#000842] border-4 border-[#FFCC00] rounded-3xl p-6 shadow-[0_0_60px_rgba(255,204,0,0.3)] flex flex-col space-y-5 text-left">
            
            <div class="text-center space-y-1">
              <div class="w-14 h-14 mx-auto rounded-2xl bg-[#060CE9] border-2 border-[#FFCC00] flex items-center justify-center font-cinzel text-2xl font-black text-[#FFCC00]">🔐</div>
              <h2 class="text-xl font-black text-white uppercase font-cinzel tracking-wide">Acceso Docente</h2>
              <p class="text-xs text-blue-200">Inicia sesión o activa tu licencia institucional</p>
            </div>

            <!-- Pestañas -->
            <div class="grid grid-cols-2 gap-2 bg-[#000324] p-1.5 rounded-2xl border border-blue-900">
              <button type="button" id="tab-btn-login" class="py-2.5 rounded-xl font-bold text-xs uppercase transition ${authTab === 'login' ? 'bg-[#FFCC00] text-[#000533]' : 'text-blue-300 hover:text-white'}">
                Iniciar Sesión
              </button>
              <button type="button" id="tab-btn-license" class="py-2.5 rounded-xl font-bold text-xs uppercase transition ${authTab === 'license' ? 'bg-[#FFCC00] text-[#000533]' : 'text-blue-300 hover:text-white'}">
                Canjear Licencia
              </button>
            </div>

            ${authErrorMsg ? `<div class="bg-rose-500/20 border border-rose-500 text-rose-300 p-3 rounded-xl text-xs font-bold text-center">${authErrorMsg}</div>` : ''}

            <!-- INICIAR SESIÓN -->
            ${authTab === 'login' ? `
              <form id="form-login" class="space-y-4">
                <div>
                  <label class="block text-xs font-bold text-blue-200 mb-1">Correo Electrónico</label>
                  <input id="login-email" type="email" required placeholder="profesor@escuela.edu" class="w-full p-3 rounded-xl bg-[#000324] border border-blue-600 text-white font-bold text-sm focus:outline-none focus:border-[#FFCC00]" />
                </div>
                <div>
                  <label class="block text-xs font-bold text-blue-200 mb-1">Contraseña</label>
                  <div class="relative">
                    <input id="login-password" type="${showPassword ? 'text' : 'password'}" required placeholder="••••••••" class="w-full p-3 pr-10 rounded-xl bg-[#000324] border border-blue-600 text-white font-bold text-sm focus:outline-none focus:border-[#FFCC00]" />
                    <button type="button" id="toggle-pass-login" class="absolute right-3 top-3.5 text-blue-300 hover:text-white text-sm">
                      ${showPassword ? '👁️‍🗨️' : '👁️'}
                    </button>
                  </div>
                </div>
                <button type="submit" ${authLoading ? 'disabled' : ''} class="w-full py-3.5 bg-[#FFCC00] text-[#000533] font-black uppercase text-xs rounded-xl hover:bg-yellow-400 transition shadow-lg">
                  ${authLoading ? 'Verificando...' : 'Entrar al Sistema'}
                </button>
              </form>
            ` : `
              <!-- CANJEAR LICENCIA -->
              <div>
                ${licenseStep === 'verify' ? `
                  <form id="form-verify-license" class="space-y-4">
                    <div>
                      <label class="block text-xs font-bold text-[#FFCC00] mb-1">Código de Activación</label>
                      <input id="license-code-input" type="text" required placeholder="Ej. SUB-XXXXXX" class="w-full p-3 rounded-xl bg-[#000324] border border-amber-500 text-white font-bold text-sm uppercase focus:outline-none focus:ring-2 focus:ring-[#FFCC00]" />
                      <span class="text-[11px] text-blue-300 block mt-1">Verifica tu código en la colección 'suscripciones'.</span>
                    </div>
                    <button type="submit" ${authLoading ? 'disabled' : ''} class="w-full py-3.5 bg-blue-600 text-white font-black uppercase text-xs rounded-xl hover:bg-blue-500 transition shadow-lg">
                      ${authLoading ? 'Buscando código...' : 'Continuar al Registro ➔'}
                    </button>
                  </form>
                ` : `
                  <form id="form-register-license" class="space-y-3">
                    <div class="bg-blue-950/80 border border-blue-600 p-3 rounded-xl text-xs space-y-1">
                      <div class="text-[#FFCC00] font-bold">✓ Código Válido Encontrado</div>
                      <div class="text-blue-200">Vigencia estimada: <strong>${verifiedLicenseData?.duracionDias || 30} días</strong> de acceso institucional.</div>
                    </div>
                    <div>
                      <label class="block text-xs font-bold text-blue-200 mb-1">Correo Institucional / Docente</label>
                      <input id="reg-email" type="email" required placeholder="docente@institucion.edu" class="w-full p-3 rounded-xl bg-[#000324] border border-blue-600 text-white font-bold text-sm" />
                    </div>
                    <div>
                      <label class="block text-xs font-bold text-blue-200 mb-1">Nueva Contraseña (Mín. 6 caracteres)</label>
                      <div class="relative">
                        <input id="reg-password" type="${showPassword ? 'text' : 'password'}" required minlength="6" placeholder="••••••••" class="w-full p-3 pr-10 rounded-xl bg-[#000324] border border-blue-600 text-white font-bold text-sm" />
                        <button type="button" id="toggle-pass-reg" class="absolute right-3 top-3.5 text-blue-300 hover:text-white text-sm">
                          ${showPassword ? '👁️‍🗨️' : '👁️'}
                        </button>
                      </div>
                    </div>
                    <div class="flex gap-2 pt-1">
                      <button type="button" id="btn-back-verify" class="px-4 py-3 bg-slate-700 text-slate-200 rounded-xl font-bold text-xs uppercase">Atrás</button>
                      <button type="submit" ${authLoading ? 'disabled' : ''} class="flex-1 py-3 bg-[#FFCC00] text-[#000533] font-black uppercase text-xs rounded-xl hover:bg-yellow-400">
                        ${authLoading ? 'Activando...' : 'Completar Activación'}
                      </button>
                    </div>
                  </form>
                `}
              </div>
            `}

            <div class="pt-2 border-t border-blue-900/60 text-center">
              <span class="text-[11px] text-blue-300">¿Eres alumno con enlace de sala?</span>
              <button type="button" id="btn-student-bypass" class="text-[11px] text-[#FFCC00] font-bold underline ml-1 hover:text-white">Acceso directo como alumno</button>
            </div>

          </div>
        </div>
      `;

      document.getElementById('tab-btn-login')?.addEventListener('click', () => { authTab = 'login'; authErrorMsg = ''; render(); });
      document.getElementById('tab-btn-license')?.addEventListener('click', () => { authTab = 'license'; authErrorMsg = ''; render(); });

      document.getElementById('btn-student-bypass')?.addEventListener('click', () => {
        currentRole = 'player';
        render();
      });

      document.getElementById('toggle-pass-login')?.addEventListener('click', () => { showPassword = !showPassword; render(); });
      document.getElementById('toggle-pass-reg')?.addEventListener('click', () => { showPassword = !showPassword; render(); });

      // INICIAR SESIÓN (Método idéntico a Methaplan)
      document.getElementById('form-login')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = (document.getElementById('login-email') as HTMLInputElement).value.trim().toLowerCase();
        const pass = (document.getElementById('login-password') as HTMLInputElement).value;
        authErrorMsg = '';
        authLoading = true;
        render();

        try {
          if (!fbFirestore) throw new Error("Firestore no conectado.");
          const userRef = fbFirestore.collection('usuarios').doc(email);
          const userSnap = await userRef.get();

          if (!userSnap.exists) {
            throw new Error("El correo electrónico no está registrado en el sistema.");
          }

          const userData = userSnap.data();
          if (userData.password !== pass) {
            throw new Error("Contraseña incorrecta. Verifícala e intenta de nuevo.");
          }

          const deviceId = getOrCreateDeviceId();
          if (userData.deviceIdAutorizado && userData.deviceIdAutorizado !== deviceId) {
            throw new Error("Acceso denegado: Esta cuenta ya se encuentra vinculada y activa en otra computadora.");
          }

          if (!userData.deviceIdAutorizado) {
            await userRef.update({ deviceIdAutorizado: deviceId });
          }

          localStorage.setItem('auth_token_jeopardy', email);
          isTeacherAuthenticated = true;
          authLoading = false;
          sound.playCorrect();
          render();
        } catch (err: any) {
          authLoading = false;
          authErrorMsg = err.message || "Error al iniciar sesión.";
          sound.playWrong();
          render();
        }
      });

      // VERIFICAR CÓDIGO DE LICENCIA (Se eliminó la restricción de appAsignada)
      document.getElementById('form-verify-license')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const codeInput = (document.getElementById('license-code-input') as HTMLInputElement).value.trim().toUpperCase();
        authErrorMsg = '';
        authLoading = true;
        render();

        try {
          if (!fbFirestore) throw new Error("Firestore no conectado.");
          const subRef = fbFirestore.collection('suscripciones').doc(codeInput);
          const subSnap = await subRef.get();

          if (!subSnap.exists) {
            throw new Error("El código de activación no existe.");
          }

          const subData = subSnap.data();

          if (subData.usado || !subData.activo || subData.usadoPor) {
            throw new Error("Este código de activación ya fue utilizado o se encuentra inactivo.");
          }

          verifiedLicenseData = { id: subSnap.id, ...subData };
          authLoading = false;
          licenseStep = 'register';
          sound.playSelect();
          render();
        } catch (err: any) {
          authLoading = false;
          authErrorMsg = err.message || "Error al verificar el código.";
          sound.playWrong();
          render();
        }
      });

      // REGISTRAR CON LICENCIA Y QUEMAR CÓDIGO
      document.getElementById('form-register-license')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = (document.getElementById('reg-email') as HTMLInputElement).value.trim().toLowerCase();
        const pass = (document.getElementById('reg-password') as HTMLInputElement).value;
        authErrorMsg = '';
        authLoading = true;
        render();

        try {
          if (!fbFirestore) throw new Error("Firestore no conectado.");
          const userRef = fbFirestore.collection('usuarios').doc(email);
          const userSnap = await userRef.get();

          if (userSnap.exists) {
            throw new Error("Este correo electrónico ya se encuentra registrado.");
          }

          const deviceId = getOrCreateDeviceId();
          const fechaIso = new Date().toISOString();

          await userRef.set({
            correo: email,
            password: pass,
            codigoUsado: verifiedLicenseData.id,
            deviceIdAutorizado: deviceId,
            registradoEl: fechaIso
          });

          await fbFirestore.collection('suscripciones').doc(verifiedLicenseData.id).update({
            usado: true,
            usadoPor: email,
            fechaActivacion: fechaIso,
            activo: false
          });

          localStorage.setItem('auth_token_jeopardy', email);
          isTeacherAuthenticated = true;
          authLoading = false;
          sound.playCorrect();
          if (typeof window.confetti === 'function') window.confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
          render();
        } catch (err: any) {
          authLoading = false;
          authErrorMsg = err.message || "Error al completar el registro.";
          sound.playWrong();
          render();
        }
      });

      document.getElementById('btn-back-verify')?.addEventListener('click', () => {
        licenseStep = 'verify';
        authErrorMsg = '';
        render();
      });
    }

    // 1. PANTALLA DE CONFIGURACIÓN
    function renderSetupScreen(appContainer: HTMLElement) {
      const teamCount = state.teamCount || state.teams.length;
      const maxMembers = state.maxMembersPerTeam || 5;

      appContainer.innerHTML = `
        <div class="min-h-screen flex flex-col bg-[#000533] p-4">
          <header class="flex justify-between items-center bg-[#000222] border-2 border-[#D4AF37] rounded-2xl p-4 mb-4">
            <h1 class="text-lg font-black text-white uppercase font-cinzel">Configuración del Torneo Jeopardy</h1>
            <button id="btn-logout-setup" class="px-3.5 py-1.5 rounded-xl bg-rose-600 font-bold text-xs uppercase hover:bg-rose-500">Cerrar Sesión Global</button>
          </header>

          <main class="max-w-4xl mx-auto w-full space-y-4">
            <div class="bg-[#000842] border-2 border-blue-900 rounded-2xl p-4">
              <label class="block font-black text-xs uppercase text-[#FFCC00] mb-1 font-cinzel">1. Título del Concurso</label>
              <input id="setup-title" type="text" value="${escapeHtml(state.title)}" class="w-full p-3 rounded-xl bg-[#000324] border border-blue-600 text-white font-bold" />
            </div>

            <div class="bg-[#000842] border-2 border-blue-900 rounded-2xl p-4 space-y-4">
              <div>
                <label class="block font-black text-xs uppercase text-[#FFCC00] mb-2 font-cinzel">2. Número de Equipos</label>
                <div class="grid grid-cols-5 gap-2">
                  ${[1, 2, 3, 4, 5].map(n => `
                    <button type="button" data-count="${n}" class="team-count-btn py-2.5 rounded-xl font-black text-sm border-2 ${
                      teamCount === n ? 'bg-[#FFCC00] text-[#000533] border-white' : 'bg-blue-950 text-blue-200 border-blue-800'
                    }">${n} ${n === 1 ? 'Equipo' : 'Equipos'}</button>
                  `).join('')}
                </div>
              </div>

              <div>
                <label class="block font-black text-xs uppercase text-[#FFCC00] mb-1 font-cinzel">Participantes Máximos por Equipo</label>
                <div class="flex items-center gap-3">
                  <input id="setup-max-members" type="range" min="1" max="10" value="${maxMembers}" class="flex-1 accent-[#FFCC00]" />
                  <span id="label-max-members" class="font-black text-white text-base font-mono w-16 text-right">${maxMembers} part.</span>
                </div>
              </div>
            </div>

            <div class="bg-[#000842] border-2 border-blue-900 rounded-2xl p-4">
              <div class="flex justify-between items-center mb-2">
                <label class="block font-black text-xs uppercase text-[#FFCC00] font-cinzel">3. Banco de Preguntas y Respuestas (CSV / Excel)</label>
                <button id="btn-download-sample" class="text-xs font-bold text-[#FFCC00] hover:underline flex items-center gap-1 cursor-pointer">
                  📥 Descargar plantilla CSV de muestra
                </button>
              </div>
              <div class="flex flex-col sm:flex-row items-center gap-3">
                <input id="csv-file-input" type="file" accept=".csv,text/csv" class="hidden" />
                <button id="btn-trigger-upload" class="w-full sm:w-auto px-5 py-3 bg-blue-900 hover:bg-blue-800 border-2 border-blue-500 rounded-xl font-bold text-xs uppercase flex items-center justify-center gap-2 cursor-pointer">
                  📁 Subir archivo CSV con preguntas
                </button>
                <span class="text-xs text-blue-300 font-medium">Categorías actuales: <strong>${state.categories.length}</strong></span>
              </div>
            </div>

            <div class="bg-[#000842] border-2 border-blue-900 rounded-2xl p-4">
              <div class="flex justify-between items-center mb-2">
                <label class="font-black text-xs uppercase text-[#FFCC00] font-cinzel">4. Concursantes Conectados en Tiempo Real</label>
                <span id="setup-total-connected-count" class="text-xs font-bold text-emerald-400">0 Conectados</span>
              </div>
              <div class="grid gap-3" style="grid-template-columns: repeat(${teamCount}, minmax(0, 1fr));">
                ${state.teams.slice(0, teamCount).map((t: any) => `
                  <div class="border-2 rounded-xl p-2.5 bg-[#000428] text-center" style="border-color: ${t.color}">
                    <span class="text-xs font-black uppercase text-white block truncate">${escapeHtml(t.name)}</span>
                    <span id="setup-team-count-${t.id}" class="text-[11px] font-bold block mb-1" style="color: ${t.color}">0 / ${maxMembers} registrados</span>
                    <div class="bg-white p-2 rounded-lg inline-block my-1">
                      <div id="setup-qr-${t.id}"></div>
                    </div>
                    <div id="setup-team-members-${t.id}" class="bg-[#00021A] rounded p-1 min-h-[40px] text-[10px] text-blue-300">Esperando...</div>
                  </div>
                `).join('')}
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3 pt-2">
              <button id="btn-goto-qr" class="py-3.5 bg-blue-900 border-2 border-blue-600 rounded-xl font-black text-xs uppercase hover:bg-blue-800 cursor-pointer">Proyectar QR en Pantalla Completa ⛶</button>
              <button id="btn-start-game" class="py-3.5 bg-[#FFCC00] text-[#000533] rounded-xl font-black text-xs uppercase hover:bg-yellow-400 cursor-pointer">Comenzar Tablero ▶</button>
            </div>
          </main>
        </div>
      `;

      document.getElementById('setup-title')?.addEventListener('input', (e: any) => state.title = e.target.value.trim() || 'Jeopardy');
      document.getElementById('btn-logout-setup')?.addEventListener('click', executeGlobalLogout);
      document.getElementById('btn-goto-qr')?.addEventListener('click', () => { sound.playSelect(); state.status = 'qrcodes'; persistState(state); });
      document.getElementById('btn-start-game')?.addEventListener('click', () => { sound.playSelect(); state.status = 'game'; persistState(state); });

      document.getElementById('btn-download-sample')?.addEventListener('click', downloadCSVSample);
      const fileInput = document.getElementById('csv-file-input') as HTMLInputElement;
      document.getElementById('btn-trigger-upload')?.addEventListener('click', () => fileInput?.click());
      fileInput?.addEventListener('change', (e: any) => {
        if (e.target.files && e.target.files[0]) handleCSVUpload(e.target.files[0]);
      });

      const maxInput = document.getElementById('setup-max-members') as HTMLInputElement;
      maxInput?.addEventListener('input', (e: any) => {
        state.maxMembersPerTeam = parseInt(e.target.value, 10);
        const labelEl = document.getElementById('label-max-members');
        if (labelEl) labelEl.textContent = `${state.maxMembersPerTeam} part.`;
        updateLiveParticipantsDOM();
      });

      document.querySelectorAll('.team-count-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const count = parseInt(btn.getAttribute('data-count') || '3', 10);
          state.teamCount = count;
          state.teams = DEFAULT_TEAMS_TEMPLATE.slice(0, count).map(t => {
            const ex = state.teams.find((e: any) => e.id === t.id);
            return ex ? { ...ex } : { ...t };
          });
          render();
        });
      });

      state.teams.slice(0, teamCount).forEach((team: any) => {
        const el = document.getElementById(`setup-qr-${team.id}`);
        if (el && typeof window.QRCode === 'function') {
          el.innerHTML = '';
          new window.QRCode(el, {
            text: `${window.location.origin}${window.location.pathname}?team=${team.id}`,
            width: 100, height: 100, colorDark: '#000533', colorLight: '#ffffff'
          });
        }
      });
    }

    // 2. PANTALLA COMPLETA DE CÓDIGOS QR
    function renderQRCodesScreen(appContainer: HTMLElement) {
      const teamCount = state.teamCount || state.teams.length;
      const activeTeams = state.teams.slice(0, teamCount);

      appContainer.innerHTML = `
        <div class="min-h-screen flex flex-col justify-between bg-[#000533] p-4">
          <header class="flex justify-between items-center bg-[#000222] border-2 border-[#D4AF37] rounded-2xl p-4">
            <h1 class="text-lg font-black text-white uppercase font-cinzel">Escanear para Unirse al Concurso</h1>
            <div class="flex gap-2">
              <button id="btn-back-setup" class="px-3 py-1.5 bg-blue-900 rounded-xl text-xs font-bold uppercase hover:bg-blue-800">Configuración</button>
              <button id="btn-logout-qr" class="px-3 py-1.5 bg-rose-600 rounded-xl text-xs font-bold uppercase hover:bg-rose-500">Cerrar Sesión</button>
            </div>
          </header>

          <div class="grid gap-4 my-auto max-w-7xl mx-auto w-full pt-4" style="grid-template-columns: repeat(${teamCount}, minmax(0, 1fr));">
            ${activeTeams.map((team: any) => `
              <div class="rounded-2xl border-4 p-4 bg-[#000428] text-center shadow-xl" style="border-color: ${team.color};">
                <span class="text-white font-black text-base uppercase block truncate">${escapeHtml(team.name)}</span>
                <span id="qr-team-count-${team.id}" class="text-xs font-mono font-bold block my-1" style="color: ${team.color};">0 / ${state.maxMembersPerTeam} registrados</span>
                <div class="my-3 p-3 bg-white rounded-2xl inline-block shadow">
                  <div id="qrcode-box-${team.id}"></div>
                </div>
                <div id="qr-team-members-${team.id}" class="bg-[#00021A] rounded-xl p-2 min-h-[60px] text-xs text-blue-300">Esperando participantes...</div>
              </div>
            `).join('')}
          </div>

          <div class="flex justify-between items-center pt-3 border-t border-blue-900">
            <span class="text-xs font-bold text-blue-200">Total Conectados: <strong id="qr-total-connected-count">0</strong></span>
            <button id="btn-start-game-qr" class="px-8 py-3 bg-[#FFCC00] text-[#000533] rounded-2xl font-black text-sm uppercase hover:bg-yellow-400 cursor-pointer">Iniciar Tablero 🚀</button>
          </div>
        </div>
      `;

      document.getElementById('btn-back-setup')?.addEventListener('click', () => { sound.playSelect(); state.status = 'setup'; persistState(state); });
      document.getElementById('btn-logout-qr')?.addEventListener('click', executeGlobalLogout);
      document.getElementById('btn-start-game-qr')?.addEventListener('click', () => { sound.playSelect(); state.status = 'game'; persistState(state); });

      const qrSize = teamCount <= 2 ? 200 : 150;
      activeTeams.forEach((team: any) => {
        const el = document.getElementById(`qrcode-box-${team.id}`);
        if (el && typeof window.QRCode === 'function') {
          el.innerHTML = '';
          new window.QRCode(el, {
            text: `${window.location.origin}${window.location.pathname}?team=${team.id}`,
            width: qrSize, height: qrSize, colorDark: '#000533', colorLight: '#ffffff'
          });
        }
      });
    }

    // 3. TABLERO DE JUEGO Y MODAL CON PANTALLA INTERMEDIA DE CARGANDO DISPOSITIVOS
    function renderGameScreen(appContainer: HTMLElement) {
      const teamCount = state.teamCount || state.teams.length;
      const activeTeams = state.teams.slice(0, teamCount);

      appContainer.innerHTML = `
        <div class="min-h-screen flex flex-col bg-[#000533]">
          <header class="bg-[#000222] border-b-2 border-[#D4AF37] px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-30">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-[#060CE9] border-2 border-[#FFCC00] flex items-center justify-center font-cinzel font-black text-[#FFCC00] text-xl shadow">J!</div>
              <h1 class="text-base sm:text-lg font-black text-white uppercase font-cinzel leading-none">${escapeHtml(state.title)}</h1>
            </div>

            <div class="flex flex-wrap items-center gap-2">
              ${activeTeams.map((t: any) => `
                <div class="flex items-center gap-2 px-3 py-1.5 rounded-xl border-2" style="background-color: ${t.color}22; border-color:${t.color};">
                  <span class="text-xs uppercase font-black" style="color: ${t.color}">${escapeHtml(t.name)}:</span>
                  <span class="text-base font-black font-mono text-white">$${t.score}</span>
                </div>
              `).join('')}
            </div>

            <div class="flex items-center gap-2">
              <button id="btn-finish-game" class="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-black text-xs uppercase hover:bg-emerald-500 shadow cursor-pointer">Terminar Juego 🏆</button>
              <button id="btn-view-qrcodes" class="px-3 py-1.5 rounded-xl bg-amber-500 text-black font-black text-xs uppercase hover:bg-amber-400 cursor-pointer">Ver QR</button>
              <button id="btn-game-setup" class="px-3 py-1.5 rounded-xl bg-blue-900 text-blue-200 font-bold text-xs uppercase border border-blue-700 hover:bg-blue-800 cursor-pointer">Configuración</button>
              <button id="btn-game-reset" class="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-200 font-bold text-xs uppercase border border-slate-600 hover:bg-slate-700 cursor-pointer">Reiniciar</button>
              <button id="btn-game-logout" class="px-3 py-1.5 rounded-xl bg-rose-600 text-white font-black text-xs uppercase hover:bg-rose-500 cursor-pointer">Cerrar Sesión</button>
            </div>
          </header>

          <main class="flex-1 p-4 flex flex-col justify-center max-w-7xl mx-auto w-full">
            <div class="tv-studio-frame rounded-2xl p-4 grid gap-3 flex-1" style="grid-template-columns: repeat(${state.categories.length}, minmax(0, 1fr));">
              ${state.categories.map((cat: any) => `
                <div class="flex flex-col gap-3">
                  <div class="h-16 bg-gradient-to-b from-[#0e16fa] to-[#0408a8] border-2 border-[#FFCC00] rounded-xl flex items-center justify-center p-2 text-center shadow">
                    <span class="font-cinzel text-sm sm:text-base font-black text-[#FFCC00] uppercase">${escapeHtml(cat.title)}</span>
                  </div>
                  ${cat.clues.map((clue: any) => `
                    <button
                      data-cat="${cat.id}" data-clue="${clue.id}"
                      ${clue.isAnswered ? 'disabled' : ''}
                      class="clue-btn flex-1 min-h-[65px] rounded-xl border-2 sm:border-3 font-bebas text-3xl transition-all cursor-pointer ${
                        clue.isAnswered ? 'answered-card' : 'glossy-clue-card bg-gradient-to-b from-[#0e17fa] to-[#03068e] border-[#FFCC00] text-[#FFCC00]'
                      }"
                    >
                      ${clue.isAnswered ? '' : `$${clue.value}`}
                    </button>
                  `).join('')}
                </div>
              `).join('')}
            </div>
          </main>

          <!-- MODAL DE PREGUNTA / PANTALLA INTERMEDIA -->
          ${state.activeClue ? `
            <div class="fixed inset-0 bg-[#000533]/95 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 animate-clue-zoom">
              <div class="max-w-4xl w-full bg-[#000842] border-4 border-[#FFCC00] rounded-3xl p-8 shadow-[0_0_80px_rgba(255,204,0,0.4)] flex flex-col items-center text-center relative space-y-6 min-h-[460px] justify-between">
                
                <div class="flex justify-between items-center w-full border-b border-blue-900/80 pb-4">
                  <span class="font-cinzel text-lg font-black text-[#FFCC00] uppercase">${escapeHtml(state.activeClue.categoryTitle)}</span>
                  <span class="font-bebas text-4xl text-[#FFCC00]">$${state.activeClue.value}</span>
                </div>

                <!-- PANTALLA 1: CARGANDO DISPOSITIVOS -->
                ${state.loadingDevicesState ? `
                  <div class="my-auto flex flex-col items-center justify-center space-y-6">
                    <div class="w-16 h-16 border-4 border-[#FFCC00] border-t-transparent rounded-full animate-spin"></div>
                    <div class="text-3xl sm:text-5xl font-black text-white font-cinzel tracking-wider uppercase animate-pulse text-[#FFCC00]">
                      Cargando dispositivos...
                    </div>
                    <div class="bg-amber-500/20 border-2 border-amber-400 text-amber-300 px-6 py-4 rounded-2xl text-xs sm:text-sm font-bold uppercase tracking-wide text-center leading-relaxed shadow-lg max-w-xl">
                      ⚠️ LOS PULSADORES ESTÁN ACTIVOS EN LOS DISPOSITIVOS.<br>NO OPRIMIR HASTA QUE SE DESPLIEGUE LA PREGUNTA.
                    </div>
                    <p class="text-xs text-blue-300 italic">Verifica que los equipos estén listos y presiona el botón inferior para desplegar la pregunta.</p>
                  </div>

                  <div class="flex flex-wrap items-center justify-center gap-4 w-full pt-4">
                    <button id="btn-deploy-question" class="px-8 py-4 bg-[#FFCC00] hover:bg-yellow-400 text-[#000533] rounded-2xl font-black text-base uppercase shadow-xl cursor-pointer">
                      Desplegar Pregunta 🚀
                    </button>
                    <button id="btn-cancel-clue" class="px-6 py-4 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl font-bold text-sm uppercase cursor-pointer">
                      Cancelar Pregunta
                    </button>
                  </div>
                ` : `
                  <!-- PANTALLA 2: PREGUNTA REVELADA -->
                  <div class="my-auto">
                    <p class="text-3xl sm:text-5xl font-black text-white leading-relaxed">
                      "${escapeHtml(state.activeClue.question)}"
                    </p>
                  </div>

                  <div class="w-full bg-[#000324] border-2 ${state.currentTurn ? 'border-emerald-400' : 'border-blue-700'} rounded-2xl p-4">
                    ${state.currentTurn ? `
                      <div class="space-y-1">
                        <span class="text-xs uppercase tracking-widest text-emerald-400 font-black animate-pulse">¡TIENE EL TURNO PARA RESPONDER!</span>
                        <h3 class="text-3xl font-black text-white uppercase">${escapeHtml(state.currentTurn.playerName)}</h3>
                        <span class="text-sm font-bold uppercase" style="color: ${state.currentTurn.teamColor}">Equipo: ${escapeHtml(state.currentTurn.teamName)}</span>
                      </div>
                    ` : `
                      <div class="flex items-center justify-center gap-2 text-emerald-300 font-bold text-sm">
                        <span class="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span>TIMBRES ACTIVOS: ¡Cualquiera puede pulsar ahora!</span>
                      </div>
                    `}
                  </div>

                  ${(state.buzzQueue && state.buzzQueue.length > 0) ? `
                    <div class="w-full bg-[#00021A] rounded-xl p-3 border border-blue-900 text-left">
                      <span class="text-[11px] font-black uppercase text-[#FFCC00] block mb-1 font-cinzel">Fila de espera:</span>
                      <div class="flex flex-wrap gap-2">
                        ${state.buzzQueue.map((item: any, idx: number) => `
                          <div class="px-2.5 py-1 rounded bg-blue-950 border text-xs font-bold flex items-center gap-1.5" style="border-color: ${item.teamColor}">
                            <span class="text-slate-400 font-mono">#${idx + 2}</span>
                            <span class="text-white">${escapeHtml(item.playerName)}</span>
                            <span class="text-[10px] uppercase font-bold" style="color: ${item.teamColor}">(${escapeHtml(item.teamName)})</span>
                          </div>
                        `).join('')}
                      </div>
                    </div>
                  ` : ''}

                  <div class="flex flex-wrap items-center justify-center gap-4 w-full pt-4">
                    ${state.currentTurn ? `
                      <button id="btn-mark-correct" class="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-sm uppercase shadow cursor-pointer">
                        ✓ Correcto (+$${state.activeClue.value})
                      </button>
                      <button id="btn-mark-wrong" class="px-6 py-3.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-black text-sm uppercase shadow cursor-pointer">
                        ✗ Incorrecto (-$${state.activeClue.value}) y Pasar Turno
                      </button>
                    ` : ''}
                    <button id="btn-cancel-clue" class="px-6 py-3.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl font-bold text-sm uppercase cursor-pointer">
                      Cerrar Pregunta
                    </button>
                  </div>
                `}

              </div>
            </div>
          ` : ''}

        </div>
      `;

      document.getElementById('btn-finish-game')?.addEventListener('click', () => {
        sound.playCorrect();
        state.status = 'podium_teams';
        persistState(state);
      });
      document.getElementById('btn-view-qrcodes')?.addEventListener('click', () => { sound.playSelect(); state.status = 'qrcodes'; persistState(state); });
      document.getElementById('btn-game-setup')?.addEventListener('click', () => { sound.playSelect(); state.status = 'setup'; persistState(state); });
      document.getElementById('btn-game-reset')?.addEventListener('click', executeResetBoard);
      document.getElementById('btn-game-logout')?.addEventListener('click', executeGlobalLogout);

      document.querySelectorAll('.clue-btn').forEach(b => {
        b.addEventListener('click', () => {
          const cat = b.getAttribute('data-cat');
          const clue = b.getAttribute('data-clue');
          if (cat && clue) openClue(cat, clue);
        });
      });

      if (state.activeClue) {
        document.getElementById('btn-cancel-clue')?.addEventListener('click', cancelActiveClue);
        document.getElementById('btn-deploy-question')?.addEventListener('click', deployQuestion);
        document.getElementById('btn-mark-correct')?.addEventListener('click', () => handleAnswerEvaluation(true));
        document.getElementById('btn-mark-wrong')?.addEventListener('click', () => handleAnswerEvaluation(false));
      }
    }

    // 4. PANTALLA DE PODIUM
    function renderPodiumTeamsScreen(appContainer: HTMLElement) {
      const activeTeams = [...state.teams.slice(0, state.teamCount)].sort((a: any, b: any) => b.score - a.score);
      const winner = activeTeams[0] || { name: 'Sin ganador', color: '#FFCC00', score: 0 };
      if (typeof window.confetti === 'function') window.confetti({ particleCount: 120, spread: 90, origin: { y: 0.5 } });

      appContainer.innerHTML = `
        <div class="min-h-screen bg-[#000533] p-6 flex flex-col justify-between items-center text-center">
          <header class="w-full max-w-4xl flex justify-between items-center bg-[#000222] border-2 border-[#D4AF37] rounded-2xl p-4">
            <h1 class="text-xl font-black text-[#FFCC00] uppercase font-cinzel">🏆 PODIUM DE EQUIPOS GANADORES 🏆</h1>
            <button id="btn-logout-podium-teams" class="px-3.5 py-1.5 bg-rose-600 rounded-xl text-xs font-bold uppercase hover:bg-rose-500 cursor-pointer">Cerrar Sesión</button>
          </header>

          <main class="my-auto max-w-4xl w-full space-y-6">
            <div class="p-6 rounded-3xl bg-gradient-to-b from-[#0e17fa]/40 to-[#03068e]/40 border-4 border-[#FFCC00] shadow-[0_0_50px_rgba(255,204,0,0.4)]">
              <span class="text-sm font-black uppercase text-[#FFCC00] font-cinzel tracking-widest">¡EQUIPO CAMPEÓN!</span>
              <h2 class="text-5xl sm:text-7xl font-black text-white uppercase font-cinzel my-2" style="color: ${winner.color}">${escapeHtml(winner.name)}</h2>
              <span class="text-3xl font-mono font-bold text-emerald-400">$${winner.score}</span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              ${activeTeams.map((t: any, idx: number) => `
                <div class="p-4 rounded-2xl border-2 bg-[#000428] flex flex-col items-center justify-center" style="border-color: ${t.color}">
                  <span class="text-xs font-bold text-slate-400">#${idx + 1} Lugar</span>
                  <span class="text-lg font-black uppercase text-white truncate w-full">${escapeHtml(t.name)}</span>
                  <span class="text-xl font-mono font-bold text-[#FFCC00]">$${t.score}</span>
                </div>
              `).join('')}
            </div>
          </main>

          <footer class="w-full max-w-4xl flex justify-end">
            <button id="btn-back-setup-podium" class="px-8 py-3.5 bg-blue-900 border-2 border-blue-500 text-white rounded-2xl font-black text-base uppercase hover:bg-blue-800 shadow-lg cursor-pointer">
              Volver a Configuración ⚙️
            </button>
          </footer>
        </div>
      `;

      document.getElementById('btn-logout-podium-teams')?.addEventListener('click', executeGlobalLogout);
      document.getElementById('btn-back-setup-podium')?.addEventListener('click', () => {
        sound.playSelect();
        state.status = 'setup';
        persistState(state);
      });
    }

    // 5. VISTA MÓVIL DEL PARTICIPANTE
    function renderPlayerView(appContainer: HTMLElement) {
      const myTeamId = assignedTeamId || localStorage.getItem('jeopardy_player_team') || 'azul';
      const myName = localStorage.getItem('jeopardy_player_name') || '';
      const myId = localStorage.getItem('jeopardy_player_id') || '';

      if (!myName) {
        appContainer.innerHTML = `
          <div class="min-h-screen bg-[#000533] p-4 flex items-center justify-center">
            <div class="w-full max-w-sm bg-[#000842] border-4 border-[#FFCC00] rounded-3xl p-6 text-center space-y-4">
              <div class="w-16 h-16 mx-auto rounded-2xl bg-[#060CE9] border-2 border-[#FFCC00] flex items-center justify-center font-cinzel text-3xl font-black text-[#FFCC00]">J!</div>
              <h2 class="text-xl font-black text-white uppercase font-cinzel">Registro de Concursante</h2>
              <div class="p-2.5 rounded-xl bg-blue-950 border border-blue-600">
                <span class="text-xs uppercase text-blue-300 font-bold">Equipo:</span>
                <span class="text-base font-black text-[#FFCC00] uppercase block">${escapeHtml(myTeamId)}</span>
              </div>
              <form id="mobile-join-form" class="space-y-4 text-left">
                <div>
                  <label class="block text-xs font-bold text-blue-200 mb-1">Tu Nombre:</label>
                  <input id="mobile-name" type="text" required placeholder="Escribe tu nombre..." class="w-full p-3.5 rounded-xl bg-[#000324] border-2 border-blue-500 text-white font-bold" />
                </div>
                <button type="submit" class="w-full py-3.5 bg-[#FFCC00] text-[#000533] font-black uppercase rounded-xl hover:bg-yellow-400 cursor-pointer">Entrar al Juego</button>
              </form>
            </div>
          </div>
        `;

        document.getElementById('mobile-join-form')?.addEventListener('submit', (e) => {
          e.preventDefault();
          const name = (document.getElementById('mobile-name') as HTMLInputElement).value.trim();
          if (!name) return;
          const pId = 'p-' + Date.now();

          localStorage.setItem('jeopardy_player_name', name);
          localStorage.setItem('jeopardy_player_team', myTeamId);
          localStorage.setItem('jeopardy_player_id', pId);

          if (fbDb) {
            const pData = { id: pId, name: name, timestamp: Date.now() };
            fbDb.ref(`jeopardy_game/teams/${myTeamId}/players/${pId}`).set(pData);
          }
          sound.playSelect();
          render();
        });
        return;
      }

      if (state.status === 'podium_teams') {
        appContainer.innerHTML = `
          <div class="min-h-screen bg-[#000533] p-6 flex flex-col justify-center items-center text-center space-y-4">
            <div class="w-20 h-20 rounded-2xl bg-[#060CE9] border-2 border-[#FFCC00] flex items-center justify-center font-cinzel text-4xl font-black text-[#FFCC00] shadow-lg">🏆</div>
            <h2 class="text-2xl font-black text-[#FFCC00] uppercase font-cinzel">¡Juego Finalizado!</h2>
            <p class="text-sm text-blue-200">Consulta los resultados y podium en la pantalla principal del profesor.</p>
            <button id="btn-player-exit" class="mt-6 px-6 py-3 bg-blue-900 border border-blue-500 rounded-xl text-xs font-bold uppercase text-white cursor-pointer">Salir de la Sesión</button>
          </div>
        `;
        document.getElementById('btn-player-exit')?.addEventListener('click', () => {
          localStorage.clear();
          location.reload();
        });
        return;
      }

      const isDisqualified = (state.disqualifiedTeams || []).includes(myTeamId);
      const didIWin = state.currentTurn?.playerId === myId;
      const someoneFromMyTeamInQueue = (state.currentTurn?.teamId === myTeamId) || 
        (state.buzzQueue || []).some((q: any) => q.teamId === myTeamId);

      const isBuzzerOpen = state.activeClue !== null && state.buzzersUnlocked && !isDisqualified && !someoneFromMyTeamInQueue;

      let statusMessage = "Esperando pregunta en el tablero...";
      if (state.activeClue && state.loadingDevicesState) {
        statusMessage = "● ¡PULSADORES ACTIVOS! (Espera la pregunta)";
      } else if (didIWin) {
        statusMessage = "¡TIENES EL TURNO! RESPONDE EN VOZ ALTA";
      } else if (someoneFromMyTeamInQueue) {
        statusMessage = "¡Tu equipo ya pulsó el botón! Esperando respuesta...";
      } else if (isDisqualified) {
        statusMessage = "Tu equipo falló esta pregunta. Bloqueado en esta ronda.";
      } else if (isBuzzerOpen) {
        statusMessage = "● ¡TIMBRE LIBRE! ¡PULSA AHORA!";
      }

      appContainer.innerHTML = `
        <div class="min-h-screen bg-[#000533] p-4 flex flex-col justify-between items-center text-center">
          <div class="pt-4 space-y-1">
            <span class="text-xs uppercase font-bold text-blue-300 block">Equipo: <strong class="text-white">${escapeHtml(myTeamId.toUpperCase())}</strong></span>
            <span class="text-lg font-black text-[#FFCC00] block">${escapeHtml(myName)}</span>
            <span class="text-xs font-black uppercase block ${
              didIWin ? 'text-emerald-400 animate-bounce' : 
              (isBuzzerOpen ? 'text-emerald-400' : (isDisqualified ? 'text-rose-400' : 'text-blue-300'))
            }">${statusMessage}</span>
          </div>

          <div class="my-auto py-6">
            <button
              id="mobile-buzzer-btn"
              ${!isBuzzerOpen ? 'disabled' : ''}
              class="w-64 h-64 rounded-full ${isBuzzerOpen ? 'buzzer-dome-red border-4 border-yellow-300 active:scale-95 cursor-pointer' : 'buzzer-disabled border-4 border-slate-700'} font-cinzel font-black text-3xl uppercase text-white shadow-2xl flex flex-col items-center justify-center transition-all"
            >
              <span class="text-4xl mb-1">${isBuzzerOpen ? '⚡' : '🔒'}</span>
              <span>PULSAR</span>
            </button>
          </div>

          <div class="pb-4">
            <button id="btn-player-change" class="text-xs text-blue-400 underline cursor-pointer">
              Cambiar de nombre o equipo
            </button>
          </div>
        </div>
      `;

      document.getElementById('btn-player-change')?.addEventListener('click', () => {
        localStorage.clear();
        location.reload();
      });

      document.getElementById('mobile-buzzer-btn')?.addEventListener('click', () => {
        if (!isBuzzerOpen) return;
        sound.playBuzz();
        if ('vibrate' in navigator) navigator.vibrate(200);

        if (fbDb) {
          const teamObj = state.teams.find((t: any) => t.id === myTeamId);
          const accurateTimestamp = Date.now() + serverTimeOffset;

          const buzzData = {
            playerId: myId,
            playerName: myName,
            teamId: myTeamId,
            teamName: teamObj ? teamObj.name : myTeamId,
            teamColor: teamObj ? teamObj.color : '#FFCC00',
            timestamp: accurateTimestamp
          };

          fbDb.ref('sessions/jeopardy_game/activeTurn').transaction((current: any) => {
            if (current === null) return buzzData;
            return current;
          }, (error: any, committed: boolean) => {
            if (!committed) {
              fbDb.ref(`sessions/jeopardy_game/buzzQueue/${myTeamId}`).set(buzzData);
            }
          });
        }
      });
    }

    render();

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
    };
  }, []);

  return <div id="app" ref={containerRef} className="min-h-screen flex flex-col" />;
}
