/**
 * Jeopardy Live Show - Licenciamiento Firestore
 * Exact fidelity implementation matching the provided architecture and UI.
 */
import { useEffect, useRef } from 'react';
import type { Category, Team, SavedProgram } from './types';
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
    const roleParam = urlParams.get('role');
    let currentRole: 'player' | 'host' | 'instructor' = 'host';

    if (roleParam === 'instructor') {
      currentRole = 'instructor';
    } else if (roleParam === 'player' || assignedTeamId !== null) {
      currentRole = 'player';
    } else {
      currentRole = 'host';
    }

    let isTeacherAuthenticated = localStorage.getItem('auth_token_jeopardy') !== null;
    if (currentRole === 'instructor') {
      // El instructor que entra mediante el QR (?role=instructor) se autentica de inmediato sin pedir credenciales
      isTeacherAuthenticated = true;
    }

    // SINCRONIZACIÓN Y RESILIENCIA:
    // Si hay una partida activa guardada ('game', 'qrcodes' o 'podium_teams'), se preserva
    // para evitar que un refresco accidental o parpadeo de red reinicie la pantalla a 'setup'.
    if (currentRole === 'host') {
      if (!state.status) {
        state.status = 'setup';
      }
    }

    // PROTECCIÓN DE ESTADO ANTE RECARGA O CIERRE (beforeunload / pagehide)
    // Guarda de forma segura el estado crítico en localStorage para tolerar refrescos accidentales
    const handleHostTabExit = () => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (e) {}
    };

    window.addEventListener('beforeunload', handleHostTabExit);
    window.addEventListener('pagehide', handleHostTabExit);

    function getInstructorUrl(): string {
      return `${window.location.origin}${window.location.pathname}?role=instructor`;
    }

    let fbFirestore: any = null;
    let fbDb: any = null;
    let serverTimeOffset = 0;

    const SAVED_PROGRAMS_KEY = 'jeopardy_saved_programs';
    function loadSavedProgramsLocal(): SavedProgram[] {
      try {
        const raw = localStorage.getItem(SAVED_PROGRAMS_KEY);
        if (raw) return JSON.parse(raw);
      } catch (e) {}
      return [];
    }

    let savedPrograms: SavedProgram[] = loadSavedProgramsLocal();

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
          setupProgramsListener();
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

      // 1. CONSULTA INMEDIATA Y ROBUSTA DEL ESTADO REAL EN FIREBASE AL ARRANCAR
      // Si la partida estaba en curso ('game'), en QR ('qrcodes') o en podio, restaura la vista de inmediato
      fbDb.ref('sessions/jeopardy_game').once('value', (snap: any) => {
        const session = snap.val();
        if (session && session.status) {
          state.status = session.status;
          if (session.title) state.title = session.title;
          if (session.categories && Array.isArray(session.categories) && session.categories.length > 0) {
            state.categories = session.categories;
          }
          if (session.teamCount && typeof session.teamCount === 'number') {
            state.teamCount = session.teamCount;
          }
          if (session.maxMembersPerTeam && typeof session.maxMembersPerTeam === 'number') {
            state.maxMembersPerTeam = session.maxMembersPerTeam;
          }
          state.activeClue = session.activeClue || null;
          state.currentTurn = session.activeTurn || null;
          state.buzzQueue = session.buzzQueue ? Object.values(session.buzzQueue).sort((a: any, b: any) => a.timestamp - b.timestamp) : [];
          state.disqualifiedTeams = session.disqualifiedTeams || [];
          state.buzzersUnlocked = Boolean(session.buzzersUnlocked);
          state.loadingDevicesState = session.loadingDevicesState !== undefined ? Boolean(session.loadingDevicesState) : true;
          try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
          render();
        } else if (currentRole === 'host') {
          fbDb.ref('sessions/jeopardy_game').update({
            status: state.status || 'setup',
            title: state.title,
            categories: state.categories,
            teamCount: state.teamCount,
            maxMembersPerTeam: state.maxMembersPerTeam,
            lastUpdated: Date.now()
          });
        }
      });

      // 2. PROTECCIÓN Y RESTAURACIÓN DE MARCADORES DESDE FIREBASE
      fbDb.ref('jeopardy_game/teams').once('value', (snap: any) => {
        const teamsData = snap.val();
        if (teamsData) {
          if (Array.isArray(teamsData) && teamsData.length > 0) {
            teamsData.forEach((savedTeam: any) => {
              const localTeam = state.teams.find((t: any) => t.id === savedTeam.id);
              if (localTeam) {
                if (typeof savedTeam.score === 'number') localTeam.score = savedTeam.score;
                if (savedTeam.name) localTeam.name = savedTeam.name;
                if (savedTeam.members) localTeam.members = Array.isArray(savedTeam.members) ? savedTeam.members : Object.values(savedTeam.members);
              }
            });
            try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
            render();
          }
        }
      });

      // 3. ESCUCHA DE EQUIPOS Y JUGADORES EN VIVO
      fbDb.ref('jeopardy_game/teams').on('value', (snap: any) => {
        const val = snap.val() || {};
        if (Array.isArray(val)) {
          val.forEach((savedTeam: any) => {
            const localTeam = state.teams.find((t: any) => t.id === savedTeam.id);
            if (localTeam) {
              if (typeof savedTeam.score === 'number') localTeam.score = savedTeam.score;
              if (savedTeam.members) {
                localTeam.members = Array.isArray(savedTeam.members) ? savedTeam.members : Object.values(savedTeam.members);
              }
            }
          });
        } else {
          state.teams.forEach((team: any) => {
            const tData = val[team.id];
            if (tData) {
              if (typeof tData.score === 'number') team.score = tData.score;
              if (tData.players) {
                team.members = Object.values(tData.players);
              } else if (tData.members) {
                team.members = Array.isArray(tData.members) ? tData.members : Object.values(tData.members);
              } else {
                team.members = [];
              }
            } else {
              team.members = [];
            }
          });
        }
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
        updateLiveParticipantsDOM();
        updateScoreboardDOM();
        if (state.status === 'podium_teams') {
          render();
        }
      });

      // 4. ESCUCHA DE SESIÓN EN TIEMPO REAL
      fbDb.ref('sessions/jeopardy_game').on('value', (snap: any) => {
        const session = snap.val() || {};
        const prevTurn = state.currentTurn;
        const prevUnlocked = state.buzzersUnlocked;

        if (session.status) state.status = session.status;
        if (session.title) state.title = session.title;
        if (session.categories && Array.isArray(session.categories) && session.categories.length > 0) {
          state.categories = session.categories;
        }
        if (session.teamCount && typeof session.teamCount === 'number') {
          state.teamCount = session.teamCount;
        }
        if (session.maxMembersPerTeam && typeof session.maxMembersPerTeam === 'number') {
          state.maxMembersPerTeam = session.maxMembersPerTeam;
        }
        if (session.teams && Array.isArray(session.teams) && session.teams.length > 0) {
          session.teams.forEach((st: any) => {
            const local = state.teams.find((t: any) => t.id === st.id);
            if (local && typeof st.score === 'number') {
              local.score = st.score;
            }
          });
        }
        state.activeClue = session.activeClue || null;
        state.currentTurn = session.activeTurn || null;
        state.buzzQueue = session.buzzQueue ? Object.values(session.buzzQueue).sort((a: any, b: any) => a.timestamp - b.timestamp) : [];
        state.disqualifiedTeams = session.disqualifiedTeams || [];
        state.buzzersUnlocked = Boolean(session.buzzersUnlocked);
        state.loadingDevicesState = session.loadingDevicesState !== undefined ? Boolean(session.loadingDevicesState) : true;

        if (!prevUnlocked && state.buzzersUnlocked && currentRole === 'player') {
          sound.playSelect();
        }

        if (state.currentTurn && (!prevTurn || prevTurn.playerId !== state.currentTurn.playerId) && (currentRole === 'host' || currentRole === 'instructor')) {
          sound.playBuzz();
        }

        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
        render();
        updateScoreboardDOM();
      });
    }

    function mergePrograms(newList: SavedProgram[]) {
      const map = new Map<string, SavedProgram>();
      savedPrograms.forEach(p => map.set(p.id, p));
      newList.forEach(p => {
        if (p && p.id) {
          map.set(p.id, p);
        }
      });
      savedPrograms = Array.from(map.values()).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      try {
        localStorage.setItem(SAVED_PROGRAMS_KEY, JSON.stringify(savedPrograms));
      } catch (e) {}
      updateProgramsDropdownDOM();
    }

    function setupProgramsListener() {
      updateProgramsDropdownDOM();

      if (fbDb) {
        fbDb.ref('jeopardy_programas').on('value', (snap: any) => {
          const val = snap.val();
          if (val) {
            const list: SavedProgram[] = Object.keys(val).map(key => ({
              ...val[key],
              id: key
            }));
            mergePrograms(list);
          }
        });
      }

      if (fbFirestore) {
        try {
          fbFirestore.collection('jeopardy_programas').onSnapshot((snapshot: any) => {
            const list: SavedProgram[] = [];
            snapshot.forEach((doc: any) => {
              list.push({ ...doc.data(), id: doc.id });
            });
            if (list.length > 0) {
              mergePrograms(list);
            }
          }, (err: any) => {
            console.warn('Firestore snapshot warning:', err);
          });
        } catch (err) {
          console.warn('Firestore listener setup warning:', err);
        }
      }
    }

    function updateProgramsDropdownDOM() {
      const selectEl = document.getElementById('select-saved-program') as HTMLSelectElement;
      if (!selectEl) return;

      const curVal = selectEl.value;
      let html = `<option value="">-- Seleccionar programa guardado (${savedPrograms.length}) --</option>`;
      savedPrograms.forEach(p => {
        const qCount = p.totalQuestions || (p.categories ? p.categories.reduce((acc, c) => acc + (c.clues ? c.clues.length : 0), 0) : 0);
        const dateDisplay = p.dateStr || (p.createdAt ? new Date(p.createdAt).toLocaleDateString('es-ES') : '');
        html += `<option value="${escapeHtml(p.id)}">${escapeHtml(p.name)} (${p.categories?.length || 0} cat. / ${qCount} preg.) ${dateDisplay ? '· ' + dateDisplay : ''}</option>`;
      });
      selectEl.innerHTML = html;
      if (curVal && savedPrograms.some(p => p.id === curVal)) {
        selectEl.value = curVal;
      }
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

    function updateScoreboardDOM() {
      const activeTeams = state.teams.slice(0, state.teamCount || state.teams.length);
      activeTeams.forEach((t: any) => {
        // Actualizar en el encabezado del tablero de juego de la computadora
        const scoreEl = document.getElementById(`scoreboard-score-${t.id}`);
        if (scoreEl) {
          const formatted = `$${t.score}`;
          if (scoreEl.textContent !== formatted) {
            scoreEl.textContent = formatted;
            scoreEl.classList.remove('scale-100');
            scoreEl.classList.add('scale-125', 'text-[#FFCC00]');
            setTimeout(() => {
              scoreEl.classList.remove('scale-125', 'text-[#FFCC00]');
              scoreEl.classList.add('scale-100');
            }, 600);
          }
        }
        // Actualizar en el panel de control móvil del instructor si está presente
        const mobileScoreEl = document.getElementById(`instructor-mobile-score-${t.id}`);
        if (mobileScoreEl) {
          mobileScoreEl.textContent = `$${t.score}`;
        }
      });

      // Si el contenedor del scoreboard en la pantalla principal no tiene el número de tarjetas correcto, reconstruirlo
      const container = document.getElementById('game-scoreboard');
      if (container && container.children.length !== activeTeams.length) {
        container.innerHTML = activeTeams.map((t: any) => `
          <div id="scoreboard-card-${t.id}" class="flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 transition-all duration-300 shadow" style="background-color: ${t.color}22; border-color:${t.color};">
            <span class="text-xs uppercase font-black" style="color: ${t.color}">${escapeHtml(t.name)}:</span>
            <span id="scoreboard-score-${t.id}" class="text-base font-black font-mono text-white transition-all transform duration-300 scale-100">$${t.score}</span>
          </div>
        `).join('');
      }
    }

    function openClue(catId: string, clueId: string) {
      const cat = state.categories.find((c: any) => c.id === catId);
      const clue = cat?.clues.find((cl: any) => cl.id === clueId);
      if (!clue || clue.isAnswered) return;

      // Inhabilitar inmediatamente la casilla en el tablero (isAnswered = true)
      clue.isAnswered = true;

      state.activeClue = {
        ...clue,
        categoryTitle: cat.title,
        catId: cat.id,
        isAnswered: true,
        showAnswer: false
      };
      state.loadingDevicesState = true;
      state.currentTurn = null;
      state.buzzQueue = [];
      state.disqualifiedTeams = [];
      state.buzzersUnlocked = true;

      sound.playSelect();

      if (fbDb) {
        fbDb.ref('sessions/jeopardy_game').update({
          categories: state.categories,
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

    function toggleShowAnswer() {
      if (!state.activeClue) return;
      const willShow = !state.activeClue.showAnswer;
      state.activeClue.showAnswer = willShow;
      if (willShow) {
        state.loadingDevicesState = false;
        sound.playClueOpen();
      } else {
        sound.playSelect();
      }

      if (fbDb) {
        fbDb.ref('sessions/jeopardy_game').update({
          activeClue: state.activeClue,
          loadingDevicesState: state.loadingDevicesState
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
            categories: state.categories,
            activeClue: null,
            activeTurn: null,
            buzzQueue: null,
            disqualifiedTeams: null,
            buzzersUnlocked: false,
            loadingDevicesState: true,
            teams: state.teams
          });
        }
        updateScoreboardDOM();
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
            fbDb.ref('sessions/jeopardy_game').update({
              teams: state.teams,
              activeTurn: nextTurn,
              buzzQueue: remainingQueue,
              disqualifiedTeams: disq
            });
          }
        } else {
          state.currentTurn = null;
          state.buzzQueue = [];

          if (fbDb) {
            fbDb.ref('jeopardy_game/teams').set(state.teams);
            fbDb.ref('sessions/jeopardy_game').update({
              teams: state.teams,
              disqualifiedTeams: disq,
              buzzersUnlocked: true
            });
            fbDb.ref('sessions/jeopardy_game/activeTurn').remove();
            fbDb.ref('sessions/jeopardy_game/buzzQueue').remove();
          }
        }
        updateScoreboardDOM();
        persistState(state);
      }
    }

    // REINICIO Y DESBLOQUEO DE BUZZERS / TIMBRES (FALSA SALIDA O INTENTO ANTICIPADO)
    function resetAndUnlockBuzzers(allowSameTeam: boolean = true) {
      sound.playSelect();
      const earlyTeamId = state.currentTurn?.teamId;

      let disq = allowSameTeam ? [] : [...(state.disqualifiedTeams || [])];
      if (!allowSameTeam && earlyTeamId) {
        if (!disq.includes(earlyTeamId)) disq.push(earlyTeamId);
      }

      state.disqualifiedTeams = disq;
      state.currentTurn = null;
      state.buzzQueue = [];
      state.buzzersUnlocked = true;

      if (fbDb) {
        fbDb.ref('sessions/jeopardy_game').update({
          activeTurn: null,
          buzzQueue: null,
          disqualifiedTeams: disq,
          buzzersUnlocked: true
        });
      }
      persistState(state);
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
          categories: state.categories,
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
          teams: state.teams,
          categories: state.categories,
          activeClue: null,
          activeTurn: null,
          buzzQueue: null,
          disqualifiedTeams: null,
          buzzersUnlocked: false,
          loadingDevicesState: true
        });
      }
      updateScoreboardDOM();
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

    let screenHistory: string[] = [];
    try {
      const savedHist = sessionStorage.getItem('jeopardy_screen_history');
      if (savedHist) screenHistory = JSON.parse(savedHist);
    } catch (e) {}

    function pushScreenHistory(fromStatus: string) {
      if (!fromStatus) return;
      if (screenHistory.length === 0 || screenHistory[screenHistory.length - 1] !== fromStatus) {
        screenHistory.push(fromStatus);
        if (screenHistory.length > 25) screenHistory.shift();
        try { sessionStorage.setItem('jeopardy_screen_history', JSON.stringify(screenHistory)); } catch (e) {}
      }
    }

    function navigateScreen(targetStatus: string) {
      if (state.status !== targetStatus) {
        pushScreenHistory(state.status);
      }
      state.status = targetStatus;
      sound.playSelect();
      persistState(state);
    }

    function navigateBack(defaultFallback: string) {
      sound.playSelect();
      let prev: string | undefined = undefined;
      while (screenHistory.length > 0) {
        const candidate = screenHistory.pop();
        if (candidate && candidate !== state.status) {
          prev = candidate;
          break;
        }
      }
      try { sessionStorage.setItem('jeopardy_screen_history', JSON.stringify(screenHistory)); } catch (e) {}
      const target = prev || defaultFallback;
      state.status = target;
      persistState(state);
    }

    function persistState(newState: any) {
      newState.lastUpdated = Date.now();
      state = newState;
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
      if (fbDb && (currentRole === 'host' || currentRole === 'instructor')) {
        fbDb.ref('sessions/jeopardy_game').update({
          status: newState.status,
          title: newState.title || 'Torneo Jeopardy Live Show',
          categories: newState.categories || [],
          teamCount: newState.teamCount || 3,
          maxMembersPerTeam: newState.maxMembersPerTeam || 5,
          teams: newState.teams || [],
          lastUpdated: newState.lastUpdated
        });
        if (Array.isArray(newState.teams) && newState.teams.length > 0) {
          fbDb.ref('jeopardy_game/teams').set(newState.teams);
        }
      }
      render();
      updateScoreboardDOM();
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

    function downloadExcelSample() {
      try {
        if (window.XLSX) {
          const sampleRows = [
            ['Categoría', 'Puntos', 'Pregunta', 'Respuesta'],
            ['Historia', 100, 'Año de la llegada de Cristóbal Colón al continente americano.', '1492'],
            ['Historia', 200, 'Civilización precolombina constructora de la ciudadela de Machu Picchu.', 'Los Incas'],
            ['Historia', 300, 'Primer emperador de Roma tras la caída de la República.', 'César Augusto'],
            ['Historia', 400, 'Tratado firmado en 1919 que selló el final de la Primera Guerra Mundial.', 'Tratado de Versalles'],
            ['Historia', 500, 'Pensador de la Ilustración autor de la división de poderes.', 'Montesquieu'],
            ['Ciencia', 100, 'Elemento químico más ligero y abundante del universo.', 'Hidrógeno'],
            ['Ciencia', 200, 'Fuerza que atrae los cuerpos hacia el centro de la Tierra.', 'Gravedad'],
            ['Ciencia', 300, 'Orgánulo celular responsable de la respiración celular.', 'Mitocondria'],
            ['Ciencia', 400, 'Velocidad estimada de la luz en el vacío en km/s.', '300.000 km/s'],
            ['Ciencia', 500, 'Partícula de carga neutra en el núcleo atómico.', 'Neutrón'],
            ['Geografía', 100, 'Río con mayor caudal y longitud del planeta Tierra.', 'Río Amazonas'],
            ['Geografía', 200, 'País soberano con mayor superficie territorial del planeta.', 'Rusia'],
            ['Geografía', 300, 'Cordillera continental más larga del mundo en Sudamérica.', 'Cordillera de los Andes'],
            ['Geografía', 400, 'Ciudad capital de Australia.', 'Canberra'],
            ['Geografía', 500, 'Desierto no polar más árido del mundo en el norte de Chile.', 'Desierto de Atacama'],
            ['Cultura Pop', 100, 'Identidad secreta del superhéroe protector de Gotham conocido como Batman.', 'Bruce Wayne'],
            ['Cultura Pop', 200, 'Banda británica icónica integrada por John Paul George y Ringo.', 'The Beatles'],
            ['Cultura Pop', 300, 'Superproducción de James Cameron ambientada en Pandora.', 'Avatar'],
            ['Cultura Pop', 400, 'Criatura eléctrica y mascota de Pokémon.', 'Pikachu'],
            ['Cultura Pop', 500, 'Autor británico de El Señor de los Anillos.', 'J.R.R. Tolkien'],
            ['Deportes', 100, 'País con mayor cantidad de títulos en Copas Mundiales FIFA.', 'Brasil (5 títulos)'],
            ['Deportes', 200, 'Puntaje máximo en una partida de boliche (bowling).', '300 puntos'],
            ['Deportes', 300, 'Atleta jamaiquino plusmarquista de los 100 y 200 metros planos.', 'Usain Bolt'],
            ['Deportes', 400, 'Grand Slam disputado sobre césped en Reino Unido.', 'Wimbledon'],
            ['Deportes', 500, 'Número reglamentario de jugadores por equipo en cancha en básquetbol.', '5 jugadores']
          ];
          const ws = window.XLSX.utils.aoa_to_sheet(sampleRows);
          const wb = window.XLSX.utils.book_new();
          window.XLSX.utils.book_append_sheet(wb, ws, 'Preguntas');
          window.XLSX.writeFile(wb, 'plantilla_preguntas_jeopardy.xlsx');
          return;
        }
      } catch (err) {
        console.warn('Error generando Excel con SheetJS:', err);
      }
      downloadCSVSample();
    }

    async function saveProgramToFirebase(name: string, categories: Category[]): Promise<string> {
      const progId = `prog_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      const now = Date.now();
      const dateStr = new Date(now).toLocaleString('es-ES', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
      });
      const totalQuestions = categories.reduce((acc, c) => acc + (c.clues ? c.clues.length : 0), 0);

      const cleanCategories = categories.map(c => ({
        id: c.id,
        title: c.title,
        clues: (c.clues || []).map(cl => ({
          id: cl.id,
          value: cl.value,
          question: cl.question,
          answer: cl.answer,
          isAnswered: false
        }))
      }));

      const newProgram: SavedProgram = {
        id: progId,
        name: name.trim() || 'Programa Jeopardy',
        createdAt: now,
        dateStr: dateStr,
        categories: cleanCategories,
        totalQuestions: totalQuestions
      };

      mergePrograms([newProgram]);

      if (fbDb) {
        try {
          await fbDb.ref(`jeopardy_programas/${progId}`).set(newProgram);
        } catch (dbErr) {
          console.warn('Realtime Database save warning:', dbErr);
        }
      }

      if (fbFirestore) {
        try {
          await fbFirestore.collection('jeopardy_programas').doc(progId).set(newProgram);
        } catch (fsErr) {
          console.warn('Firestore save warning:', fsErr);
        }
      }

      return progId;
    }

    async function deleteProgram(programId: string) {
      const prog = savedPrograms.find(p => p.id === programId);
      if (!prog) return;
      if (!confirm(`¿Deseas eliminar el programa "${prog.name}" de la lista guardada?`)) return;

      savedPrograms = savedPrograms.filter(p => p.id !== programId);
      try {
        localStorage.setItem(SAVED_PROGRAMS_KEY, JSON.stringify(savedPrograms));
      } catch (e) {}
      updateProgramsDropdownDOM();

      if (fbDb) {
        try {
          await fbDb.ref(`jeopardy_programas/${programId}`).remove();
        } catch (e) {}
      }
      if (fbFirestore) {
        try {
          await fbFirestore.collection('jeopardy_programas').doc(programId).delete();
        } catch (e) {}
      }
      sound.playWrong();
    }

    function processParsedRows(rows: any[][], programName: string) {
      if (!rows || rows.length < 2) {
        alert('El archivo está vacío o no contiene suficientes filas.');
        return;
      }

      let headerIndex = 0;
      let catCol = 0, valCol = 1, qCol = 2, aCol = 3;

      for (let r = 0; r < Math.min(rows.length, 6); r++) {
        const row = rows[r].map(c => String(c || '').toLowerCase().trim());
        const cIdx = row.findIndex(c => c.includes('categ') || c.includes('tema'));
        const vIdx = row.findIndex(c => c.includes('punt') || c.includes('valor') || c.includes('score') || c.includes('point'));
        const qIdx = row.findIndex(c => c.includes('preg') || c.includes('clue') || c.includes('quest'));
        const aIdx = row.findIndex(c => c.includes('resp') || c.includes('ans'));

        if (cIdx !== -1 && (qIdx !== -1 || vIdx !== -1)) {
          headerIndex = r;
          catCol = cIdx;
          if (vIdx !== -1) valCol = vIdx;
          if (qIdx !== -1) qCol = qIdx;
          if (aIdx !== -1) aCol = aIdx;
          break;
        }
      }

      const categoriesMap = new Map<string, any[]>();

      for (let i = headerIndex + 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length === 0) continue;

        const catTitle = String(row[catCol] || '').replace(/^["']|["']$/g, '').trim();
        const rawVal = String(row[valCol] || '');
        const valNum = parseInt(rawVal.replace(/[^0-9]/g, ''), 10) || 100;
        const question = String(row[qCol] || '').replace(/^["']|["']$/g, '').trim();
        const answer = String(row[aCol] || '').replace(/^["']|["']$/g, '').trim();

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

      if (categoriesMap.size === 0) {
        alert('No se encontraron preguntas válidas en el archivo subido.');
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
      state.title = programName;
      persistState(state);
      sound.playCorrect();

      saveProgramToFirebase(programName, newCategories)
        .then(() => {
          alert(`¡Programa "${programName}" procesado y guardado en Firebase con éxito!\n(${newCategories.length} categorías y ${newCategories.reduce((acc, c) => acc + c.clues.length, 0)} preguntas cargadas)`);
        })
        .catch(err => {
          console.warn('Error al guardar en Firebase:', err);
          alert(`¡Preguntas cargadas a la partida!\n(Guardado localmente. Advertencia Firebase: ${err.message || err})`);
        });
    }

    function parseCSVTextManually(text: string, programName: string) {
      const lines = text.split(/\r\n|\n/).map((l: string) => l.trim()).filter((l: string) => l.length > 0);
      if (lines.length < 2) {
        alert('El archivo CSV está vacío o no contiene suficientes filas.');
        return;
      }
      const headerLine = lines[0];
      let delimiter = ',';
      if (headerLine.includes(';') && !headerLine.includes(',')) delimiter = ';';
      else if (headerLine.includes('\t')) delimiter = '\t';

      const rows: any[][] = [];
      for (let i = 0; i < lines.length; i++) {
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
        rows.push(parts);
      }

      processParsedRows(rows, programName);
    }

    function handleFileUpload(file: File) {
      if (!file) return;

      const progNameInput = document.getElementById('input-program-name') as HTMLInputElement;
      let enteredProgramName = progNameInput?.value.trim();
      if (!enteredProgramName) {
        enteredProgramName = file.name.replace(/\.[^/.]+$/, '').trim() || 'Programa Jeopardy';
        if (progNameInput) progNameInput.value = enteredProgramName;
      }

      const fileName = file.name.toLowerCase();
      const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls');

      if (isExcel && window.XLSX) {
        const reader = new FileReader();
        reader.onload = function(e: any) {
          try {
            const data = new Uint8Array(e.target.result);
            const workbook = window.XLSX.read(data, { type: 'array' });
            if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
              alert('El archivo Excel no contiene hojas de cálculo.');
              return;
            }
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const rows: any[][] = window.XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
            processParsedRows(rows, enteredProgramName);
          } catch (err: any) {
            console.error('Error al procesar archivo Excel:', err);
            alert('Error al leer el archivo Excel: ' + (err.message || err));
          }
        };
        reader.readAsArrayBuffer(file);
      } else {
        const reader = new FileReader();
        reader.onload = function(e: any) {
          try {
            if (window.XLSX && (fileName.endsWith('.xlsx') || fileName.endsWith('.xls'))) {
              const workbook = window.XLSX.read(e.target.result, { type: 'binary' });
              const worksheet = workbook.Sheets[workbook.SheetNames[0]];
              const rows: any[][] = window.XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
              processParsedRows(rows, enteredProgramName);
            } else {
              parseCSVTextManually(e.target.result, enteredProgramName);
            }
          } catch (err: any) {
            console.error('Error al procesar archivo:', err);
            alert('Error al leer el archivo: ' + (err.message || err));
          }
        };
        if (isExcel) {
          reader.readAsBinaryString(file);
        } else {
          reader.readAsText(file, 'UTF-8');
        }
      }
    }

    function render() {
      const app = container;
      if (!app) return;

      if (currentRole === 'player') {
        renderPlayerView(app);
        return;
      }

      if (currentRole === 'instructor') {
        renderInstructorMobileView(app);
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
          <header class="flex flex-wrap justify-between items-center bg-[#000222] border-2 border-[#D4AF37] rounded-2xl p-4 mb-4 gap-3 shadow-lg">
            <div class="flex items-center gap-3">
              <button id="btn-back-setup-header" title="Volver a la pantalla anterior" class="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-900 to-indigo-900 hover:from-blue-800 hover:to-indigo-800 border-2 border-blue-400 text-white font-black text-xs uppercase flex items-center gap-2 transition cursor-pointer shadow-md transform active:scale-95">
                <span class="text-base">⬅</span>
                <span>Volver / Regresar</span>
              </button>
              <div>
                <h1 class="text-base sm:text-lg font-black text-white uppercase font-cinzel leading-none">Configuración del Torneo Jeopardy</h1>
                <span class="text-[10px] text-blue-300 font-medium">Ajustes, categorías y banco de preguntas</span>
              </div>
            </div>
            <button id="btn-logout-setup" class="px-3.5 py-2 rounded-xl bg-rose-600/90 font-bold text-xs uppercase text-white hover:bg-rose-500 transition cursor-pointer shadow">Cerrar Sesión Global</button>
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

            <div class="bg-[#000842] border-2 border-blue-900 rounded-2xl p-4 space-y-4">
              <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b border-blue-900/60">
                <div>
                  <label class="block font-black text-xs uppercase text-[#FFCC00] font-cinzel">3. Banco de Preguntas y Gestión de Programas (Excel / CSV)</label>
                  <p class="text-[11px] text-blue-200 mt-0.5">Sube tus archivos de Excel (.xlsx, .xls) o CSV y guárdalos en Firebase para usarlos cuando quieras.</p>
                </div>
                <div class="flex items-center gap-2 self-end sm:self-auto">
                  <button id="btn-download-excel" class="px-2.5 py-1.5 bg-emerald-700/80 hover:bg-emerald-600 border border-emerald-400 rounded-lg text-xs font-bold text-white flex items-center gap-1 cursor-pointer transition">
                    📊 Plantilla Excel (.xlsx)
                  </button>
                  <button id="btn-download-sample" class="px-2.5 py-1.5 bg-blue-900 hover:bg-blue-800 border border-blue-600 rounded-lg text-xs font-bold text-blue-200 flex items-center gap-1 cursor-pointer transition">
                    📄 Plantilla CSV
                  </button>
                </div>
              </div>

              <!-- Carga de nuevo archivo y Nombre del Programa -->
              <div class="bg-[#000428] border border-blue-800/80 rounded-xl p-3 space-y-3">
                <span class="text-xs font-bold uppercase text-blue-300 block tracking-wider font-cinzel">A. Cargar Nuevo Archivo y Guardar Programa</span>
                
                <div>
                  <label for="input-program-name" class="block text-xs font-semibold text-gray-300 mb-1">Nombre del Programa / Sesión:</label>
                  <input id="input-program-name" type="text" value="${escapeHtml(state.title || 'Torneo Jeopardy')}" placeholder="Ej: Ciencias e Historia - 2º Bimestre" class="w-full p-2.5 rounded-lg bg-[#00021A] border border-blue-600 text-white font-bold text-sm focus:border-[#FFCC00] focus:outline-none" />
                </div>

                <div class="flex flex-col sm:flex-row items-center gap-3 pt-1">
                  <input id="excel-file-input" type="file" accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv" class="hidden" />
                  <button id="btn-trigger-upload" class="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 border-2 border-emerald-400 rounded-xl font-bold text-xs uppercase flex items-center justify-center gap-2 cursor-pointer text-white shadow-md transition">
                    📁 Subir Archivo Excel (.xlsx) o CSV
                  </button>
                  <button id="btn-save-current-program" class="w-full sm:w-auto px-4 py-2.5 bg-blue-900 hover:bg-blue-800 border border-blue-500 rounded-xl font-bold text-xs uppercase flex items-center justify-center gap-1.5 cursor-pointer text-blue-200 transition">
                    💾 Guardar actual en Firebase
                  </button>
                  <div class="text-xs text-blue-300 font-medium ml-auto">
                    Categorías activas: <strong class="text-[#FFCC00] font-mono text-sm">${state.categories.length}</strong> (${state.categories.reduce((acc: number, c: any) => acc + (c.clues ? c.clues.length : 0), 0)} preguntas)
                  </div>
                </div>
              </div>

              <!-- Programas guardados en Firebase -->
              <div class="bg-[#000428] border border-blue-800/80 rounded-xl p-3 space-y-2">
                <span class="text-xs font-bold uppercase text-blue-300 block tracking-wider font-cinzel">B. Programas Guardados en Firebase</span>
                <p class="text-[11px] text-gray-400">Selecciona un programa guardado previamente para cargarlo instantáneamente a la partida en vivo:</p>
                <div class="flex flex-col sm:flex-row items-center gap-2">
                  <select id="select-saved-program" class="flex-1 w-full p-2.5 rounded-lg bg-[#00021A] border border-blue-600 text-white font-medium text-xs focus:border-[#FFCC00] focus:outline-none cursor-pointer">
                    <option value="">Cargando programas guardados...</option>
                  </select>
                  <div class="flex items-center gap-2 w-full sm:w-auto">
                    <button id="btn-load-program" class="flex-1 sm:flex-none px-4 py-2.5 bg-[#FFCC00] hover:bg-yellow-400 text-[#000533] rounded-lg font-black text-xs uppercase flex items-center justify-center gap-1.5 cursor-pointer transition">
                      ⚡ Cargar a Partida
                    </button>
                    <button id="btn-delete-program" title="Eliminar programa seleccionado" class="px-3 py-2.5 bg-rose-900/80 hover:bg-rose-700 border border-rose-500 rounded-lg text-white font-bold text-xs flex items-center justify-center cursor-pointer transition">
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Panel Informativo de Estado de Partida -->
            <div class="bg-[#000428] border-2 border-blue-900/80 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow">
              <div class="space-y-1">
                <span class="text-xs uppercase font-black text-[#FFCC00] font-cinzel block">Resumen de Configuración Activa:</span>
                <p class="text-xs text-blue-200">
                  <strong class="text-white">${teamCount} equipos</strong> (máx. ${maxMembers} alumnos c/u) · 
                  <strong class="text-[#FFCC00]">${state.categories.length} categorías</strong> (${state.categories.reduce((acc: number, c: any) => acc + (c.clues ? c.clues.length : 0), 0)} preguntas listas)
                </p>
              </div>
              <div class="flex items-center gap-2 bg-[#00021A] px-3 py-1.5 rounded-xl border border-blue-800">
                <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span id="setup-total-connected-count" class="text-xs font-bold text-emerald-400">0 Conectados</span>
              </div>
            </div>

            <!-- Botones de Acción: Botón Principal Ver Códigos QR -->
            <div class="space-y-3 pt-2">
              <button id="btn-goto-qr" class="w-full py-4 bg-gradient-to-r from-amber-500 via-[#FFCC00] to-yellow-400 hover:from-yellow-400 hover:to-amber-500 text-[#000533] rounded-2xl font-black text-base uppercase shadow-[0_0_35px_rgba(255,204,0,0.4)] flex items-center justify-center gap-3 cursor-pointer transition transform active:scale-98">
                <span class="text-2xl">📲</span>
                <span>Ver Códigos QR (QR)</span>
              </button>
              <button id="btn-start-game" class="w-full py-3 bg-blue-950 hover:bg-blue-900 text-blue-200 border border-blue-700 rounded-xl font-bold text-xs uppercase cursor-pointer transition flex items-center justify-center gap-2">
                <span>Comenzar Tablero Directamente ▶</span>
              </button>
            </div>
          </main>
        </div>
      `;

      document.getElementById('setup-title')?.addEventListener('input', (e: any) => {
        const val = e.target.value.trim();
        state.title = val || 'Jeopardy';
        const progInput = document.getElementById('input-program-name') as HTMLInputElement;
        if (progInput) progInput.value = state.title;
      });
      document.getElementById('btn-back-setup-header')?.addEventListener('click', () => navigateBack('game'));
      document.getElementById('btn-logout-setup')?.addEventListener('click', executeGlobalLogout);
      document.getElementById('btn-goto-qr')?.addEventListener('click', () => navigateScreen('qrcodes'));
      document.getElementById('btn-start-game')?.addEventListener('click', () => navigateScreen('game'));

      document.getElementById('btn-download-excel')?.addEventListener('click', downloadExcelSample);
      document.getElementById('btn-download-sample')?.addEventListener('click', downloadCSVSample);

      const fileInput = document.getElementById('excel-file-input') as HTMLInputElement;
      document.getElementById('btn-trigger-upload')?.addEventListener('click', () => fileInput?.click());
      fileInput?.addEventListener('change', (e: any) => {
        if (e.target.files && e.target.files[0]) handleFileUpload(e.target.files[0]);
      });

      const progNameInput = document.getElementById('input-program-name') as HTMLInputElement;
      progNameInput?.addEventListener('input', (e: any) => {
        const val = e.target.value.trim();
        state.title = val || 'Jeopardy';
        const setupTitle = document.getElementById('setup-title') as HTMLInputElement;
        if (setupTitle) setupTitle.value = state.title;
      });

      document.getElementById('btn-save-current-program')?.addEventListener('click', async () => {
        const name = (document.getElementById('input-program-name') as HTMLInputElement)?.value.trim() || state.title || 'Programa Jeopardy';
        if (!state.categories || state.categories.length === 0) {
          alert('No hay categorías ni preguntas activas para guardar.');
          return;
        }
        try {
          await saveProgramToFirebase(name, state.categories);
          sound.playCorrect();
          alert(`¡Programa "${name}" guardado exitosamente en Firebase!`);
        } catch (err: any) {
          alert('Error al guardar programa: ' + (err.message || err));
        }
      });

      document.getElementById('btn-load-program')?.addEventListener('click', () => {
        const selectEl = document.getElementById('select-saved-program') as HTMLSelectElement;
        const selectedId = selectEl?.value;
        if (!selectedId) {
          alert('Por favor selecciona un programa de la lista desplegable.');
          return;
        }
        const prog = savedPrograms.find(p => p.id === selectedId);
        if (!prog) {
          alert('No se encontró el programa seleccionado.');
          return;
        }
        if (prog.categories && prog.categories.length > 0) {
          state.categories = JSON.parse(JSON.stringify(prog.categories));
          state.title = prog.name;
          if (progNameInput) progNameInput.value = prog.name;
          const setupTitle = document.getElementById('setup-title') as HTMLInputElement;
          if (setupTitle) setupTitle.value = prog.name;
          persistState(state);
          sound.playSelect();
          alert(`¡Programa "${prog.name}" cargado a la partida con éxito!\n(${prog.categories.length} categorías listas)`);
        } else {
          alert('El programa seleccionado no contiene categorías válidas.');
        }
      });

      document.getElementById('btn-delete-program')?.addEventListener('click', () => {
        const selectEl = document.getElementById('select-saved-program') as HTMLSelectElement;
        const selectedId = selectEl?.value;
        if (!selectedId) {
          alert('Por favor selecciona un programa de la lista desplegable para eliminar.');
          return;
        }
        deleteProgram(selectedId);
      });

      updateProgramsDropdownDOM();

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
    }

    // 2. PANTALLA COMPLETA DE CÓDIGOS QR
    function renderQRCodesScreen(appContainer: HTMLElement) {
      const teamCount = state.teamCount || state.teams.length;
      const activeTeams = state.teams.slice(0, teamCount);

      appContainer.innerHTML = `
        <div class="min-h-screen flex flex-col justify-between bg-[#000533] p-4">
          <header class="flex flex-wrap justify-between items-center bg-[#000222] border-2 border-[#D4AF37] rounded-2xl p-4 gap-3 shadow-lg">
            <div class="flex items-center gap-3">
              <button id="btn-back-qr-header" title="Volver a la pantalla anterior" class="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-900 to-indigo-900 hover:from-blue-800 hover:to-indigo-800 border-2 border-blue-400 text-white font-black text-xs uppercase flex items-center gap-2 transition cursor-pointer shadow-md transform active:scale-95">
                <span class="text-base">⬅</span>
                <span>Volver / Regresar</span>
              </button>
              <div>
                <h1 class="text-base sm:text-lg font-black text-white uppercase font-cinzel leading-none">Escanear para Unirse al Concurso</h1>
                <span class="text-[10px] text-blue-300 font-medium">Códigos QR para equipos y control móvil del instructor</span>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <button id="btn-back-setup" class="px-3 py-2 bg-blue-950 border border-blue-700 text-blue-200 rounded-xl text-xs font-bold uppercase hover:bg-blue-900 transition cursor-pointer">Configuración</button>
              <button id="btn-logout-qr" class="px-3.5 py-2 bg-rose-600/90 rounded-xl text-xs font-bold uppercase text-white hover:bg-rose-500 transition cursor-pointer shadow">Cerrar Sesión</button>
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

          <!-- Mando Móvil del Instructor (?role=instructor) -->
          <div class="max-w-7xl mx-auto w-full bg-gradient-to-r from-[#000842] via-[#1a1400] to-[#000842] border-2 border-[#FFCC00] rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-xl my-2">
            <div class="flex items-center gap-3.5">
              <div class="bg-white p-2 rounded-xl inline-block shadow shrink-0">
                <div id="qrcode-box-instructor"></div>
              </div>
              <div class="text-left space-y-1">
                <div class="flex items-center gap-2">
                  <span class="text-xl">📱</span>
                  <h3 class="font-cinzel font-black text-white uppercase text-base sm:text-lg">Código QR para Control Móvil del Instructor</h3>
                  <span class="bg-[#FFCC00] text-[#000533] text-[10px] font-black uppercase px-2 py-0.5 rounded-md">Exclusivo Docente</span>
                </div>
                <p class="text-xs text-blue-200">
                  Escanea desde tu móvil para moderar la partida en vivo: verás la pregunta, la respuesta correcta secreta y los controles de calificación.
                </p>
                <div class="text-[11px] text-amber-300 font-mono truncate max-w-md sm:max-w-xl">
                  ${getInstructorUrl()}
                </div>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <button id="btn-copy-instructor-qr-url" class="px-3.5 py-2.5 bg-blue-900 border border-blue-600 rounded-xl text-xs font-bold text-white hover:bg-blue-800 transition cursor-pointer">
                Copiar Enlace
              </button>
              <button id="btn-open-instructor-qr-url" class="px-4 py-2.5 bg-[#FFCC00] text-[#000533] rounded-xl text-xs font-black uppercase hover:bg-yellow-400 transition cursor-pointer">
                Abrir Control ↗
              </button>
            </div>
          </div>

          <div class="flex justify-between items-center pt-3 border-t border-blue-900">
            <span class="text-xs font-bold text-blue-200">Total Conectados: <strong id="qr-total-connected-count">0</strong></span>
            <button id="btn-start-game-qr" class="px-8 py-3 bg-[#FFCC00] text-[#000533] rounded-2xl font-black text-sm uppercase hover:bg-yellow-400 cursor-pointer">Iniciar Tablero 🚀</button>
          </div>
        </div>
      `;

      document.getElementById('btn-back-qr-header')?.addEventListener('click', () => navigateBack('setup'));
      document.getElementById('btn-back-setup')?.addEventListener('click', () => navigateScreen('setup'));
      document.getElementById('btn-logout-qr')?.addEventListener('click', executeGlobalLogout);
      document.getElementById('btn-start-game-qr')?.addEventListener('click', () => navigateScreen('game'));

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

      // Generar QR de Instructor en pantalla de QR
      const instQrBox = document.getElementById('qrcode-box-instructor');
      if (instQrBox && typeof window.QRCode === 'function') {
        instQrBox.innerHTML = '';
        new window.QRCode(instQrBox, {
          text: getInstructorUrl(),
          width: 100, height: 100, colorDark: '#000533', colorLight: '#ffffff'
        });
      }

      document.getElementById('btn-copy-instructor-qr-url')?.addEventListener('click', () => {
        const u = getInstructorUrl();
        navigator.clipboard?.writeText(u).then(() => {
          alert('¡Enlace del instructor copiado!');
        }).catch(() => {
          prompt('Enlace del instructor:', u);
        });
      });

      document.getElementById('btn-open-instructor-qr-url')?.addEventListener('click', () => {
        window.open(getInstructorUrl(), '_blank');
      });
    }

    // 3. TABLERO DE JUEGO Y MODAL CON PANTALLA INTERMEDIA DE CARGANDO DISPOSITIVOS
    function renderGameScreen(appContainer: HTMLElement) {
      const teamCount = state.teamCount || state.teams.length;
      const activeTeams = state.teams.slice(0, teamCount);

      appContainer.innerHTML = `
        <div class="min-h-screen flex flex-col bg-[#000533]">
          <header class="bg-[#000222] border-b-2 border-[#D4AF37] px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-30 shadow-lg">
            <div class="flex items-center gap-3">
              <button id="btn-game-back" title="Volver a la pantalla anterior" class="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-900 to-indigo-900 hover:from-blue-800 hover:to-indigo-800 border-2 border-blue-400 text-white font-black text-xs uppercase flex items-center gap-1.5 transition cursor-pointer shadow-md transform active:scale-95">
                <span class="text-base">⬅</span>
                <span>Volver / Regresar</span>
              </button>
              <div class="w-10 h-10 rounded-xl bg-[#060CE9] border-2 border-[#FFCC00] flex items-center justify-center font-cinzel font-black text-[#FFCC00] text-xl shadow shrink-0">J!</div>
              <h1 class="text-base sm:text-lg font-black text-white uppercase font-cinzel leading-none truncate max-w-[200px] lg:max-w-none">${escapeHtml(state.title)}</h1>
            </div>

            <div id="game-scoreboard" class="flex flex-wrap items-center gap-2">
              ${activeTeams.map((t: any) => `
                <div id="scoreboard-card-${t.id}" class="flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 transition-all duration-300 shadow" style="background-color: ${t.color}22; border-color:${t.color};">
                  <span class="text-xs uppercase font-black" style="color: ${t.color}">${escapeHtml(t.name)}:</span>
                  <span id="scoreboard-score-${t.id}" class="text-base font-black font-mono text-white transition-all transform duration-300 scale-100">$${t.score}</span>
                </div>
              `).join('')}
            </div>

            <div class="flex items-center gap-2">
              <button id="btn-toggle-fullscreen" title="Activar/Desactivar Pantalla Completa" class="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase shadow cursor-pointer flex items-center gap-1.5 transition">
                <span id="fullscreen-icon">⛶</span>
                <span id="fullscreen-text">Pantalla Completa</span>
              </button>
              <button id="btn-finish-game" class="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-black text-xs uppercase hover:bg-emerald-500 shadow cursor-pointer">Terminar Juego 🏆</button>
              <button id="btn-open-instructor-modal" class="px-3 py-1.5 rounded-xl bg-amber-500/25 text-amber-300 border border-amber-400/60 font-black text-xs uppercase hover:bg-amber-500/40 cursor-pointer flex items-center gap-1">📱 Mando Móvil</button>
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
                      class="clue-btn flex-1 min-h-[65px] rounded-xl border-2 sm:border-3 font-bebas text-3xl transition-all ${
                        clue.isAnswered ? 'answered-card pointer-events-none cursor-not-allowed' : 'glossy-clue-card bg-gradient-to-b from-[#0e17fa] to-[#03068e] border-[#FFCC00] text-[#FFCC00] cursor-pointer'
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
                  <div class="my-auto space-y-4 w-full">
                    <p class="text-3xl sm:text-5xl font-black text-white leading-relaxed">
                      "${escapeHtml(state.activeClue.question)}"
                    </p>

                    <!-- DESPLIEGUE DE LA RESPUESTA CORRECTA EN PANTALLA PRINCIPAL -->
                    ${state.activeClue.showAnswer ? `
                      <div class="w-full max-w-2xl mx-auto bg-gradient-to-r from-amber-500/25 via-yellow-400/30 to-amber-500/25 border-3 border-[#FFCC00] rounded-2xl p-5 shadow-[0_0_60px_rgba(255,204,0,0.6)] animate-clue-zoom text-center space-y-2 mt-4">
                        <div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FFCC00] text-[#000533] font-cinzel font-black text-xs uppercase tracking-widest shadow">
                          <span>💡</span> RESPUESTA CORRECTA
                        </div>
                        <div class="text-2xl sm:text-4xl md:text-5xl font-black text-amber-300 font-cinzel tracking-wide drop-shadow-lg">
                          ${escapeHtml(state.activeClue.answer || 'Sin respuesta registrada')}
                        </div>
                      </div>
                    ` : ''}
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

                  <div class="flex flex-wrap items-center justify-center gap-3 w-full pt-4">
                    <button id="btn-toggle-show-answer-host" class="px-6 py-3.5 ${state.activeClue.showAnswer ? 'bg-amber-600 hover:bg-amber-500 text-white' : 'bg-[#FFCC00] hover:bg-yellow-400 text-[#000533]'} rounded-xl font-black text-sm uppercase shadow cursor-pointer transition flex items-center gap-1.5">
                      <span>${state.activeClue.showAnswer ? '🙈 Ocultar Respuesta' : '💡 Mostrar Respuesta'}</span>
                    </button>
                    ${state.currentTurn ? `
                      <button id="btn-mark-correct" class="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-sm uppercase shadow cursor-pointer">
                        ✓ Correcto (+$${state.activeClue.value})
                      </button>
                      <button id="btn-mark-wrong" class="px-6 py-3.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-black text-sm uppercase shadow cursor-pointer">
                        ✗ Incorrecto (-$${state.activeClue.value}) y Pasar Turno
                      </button>
                      <button id="btn-reset-buzzers-host" class="px-5 py-3.5 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white rounded-xl font-black text-sm uppercase shadow cursor-pointer transition flex items-center gap-1.5">
                        <span>⚡</span> Falsa Salida: Reiniciar Timbres
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

      document.getElementById('btn-toggle-fullscreen')?.addEventListener('click', () => {
        sound.playSelect();
        if (!document.fullscreenElement) {
          if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().catch(() => {});
          }
        } else {
          if (document.exitFullscreen) {
            document.exitFullscreen().catch(() => {});
          }
        }
      });

      const handleFsChange = () => {
        const icon = document.getElementById('fullscreen-icon');
        const text = document.getElementById('fullscreen-text');
        const isFs = Boolean(document.fullscreenElement);
        if (icon) icon.textContent = isFs ? '🗗' : '⛶';
        if (text) text.textContent = isFs ? 'Salir Pantalla' : 'Pantalla Completa';
      };
      document.addEventListener('fullscreenchange', handleFsChange);

      document.getElementById('btn-game-back')?.addEventListener('click', () => navigateBack('qrcodes'));
      document.getElementById('btn-finish-game')?.addEventListener('click', () => {
        sound.playCorrect();
        navigateScreen('podium_teams');
      });
      document.getElementById('btn-view-qrcodes')?.addEventListener('click', () => navigateScreen('qrcodes'));
      document.getElementById('btn-open-instructor-modal')?.addEventListener('click', () => {
        sound.playSelect();
        const existing = document.getElementById('modal-instructor-qr-overlay');
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.id = 'modal-instructor-qr-overlay';
        modal.className = 'fixed inset-0 bg-[#000533]/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-clue-zoom';
        modal.innerHTML = `
          <div class="bg-[#000842] border-3 border-[#FFCC00] rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-[0_0_50px_rgba(255,204,0,0.3)]">
            <div class="flex justify-between items-center pb-2 border-b border-blue-900">
              <span class="font-cinzel font-black text-[#FFCC00] text-sm uppercase">📱 Control Remoto Instructor</span>
              <button id="btn-close-instructor-modal" class="text-gray-400 hover:text-white font-black text-lg cursor-pointer">✕</button>
            </div>
            <p class="text-xs text-blue-200">Escanea este código con tu teléfono o tablet para controlar la partida en vivo:</p>
            <div class="bg-white p-3 rounded-2xl inline-block shadow mx-auto">
              <div id="game-modal-instructor-qr"></div>
            </div>
            <div class="text-[11px] text-amber-300 font-mono break-all bg-[#000324] p-2 rounded-lg border border-blue-800">
              ${getInstructorUrl()}
            </div>
            <div class="flex gap-2">
              <button id="btn-copy-game-inst-url" class="flex-1 py-2.5 bg-blue-900 hover:bg-blue-800 border border-blue-600 rounded-xl text-xs font-bold text-white uppercase cursor-pointer">Copiar Enlace</button>
              <button id="btn-open-game-inst-url" class="py-2.5 px-4 bg-[#FFCC00] hover:bg-yellow-400 text-[#000533] rounded-xl text-xs font-black uppercase cursor-pointer">Abrir ↗</button>
            </div>
          </div>
        `;
        document.body.appendChild(modal);

        const qrTarget = document.getElementById('game-modal-instructor-qr');
        if (qrTarget && typeof window.QRCode === 'function') {
          new window.QRCode(qrTarget, {
            text: getInstructorUrl(),
            width: 140, height: 140, colorDark: '#000533', colorLight: '#ffffff'
          });
        }

        document.getElementById('btn-close-instructor-modal')?.addEventListener('click', () => {
          modal.remove();
        });
        document.getElementById('btn-copy-game-inst-url')?.addEventListener('click', () => {
          navigator.clipboard?.writeText(getInstructorUrl()).then(() => alert('¡Enlace del instructor copiado!')).catch(() => prompt('Copia:', getInstructorUrl()));
        });
        document.getElementById('btn-open-game-inst-url')?.addEventListener('click', () => {
          window.open(getInstructorUrl(), '_blank');
        });
      });
      document.getElementById('btn-game-setup')?.addEventListener('click', () => navigateScreen('setup'));
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
        document.getElementById('btn-toggle-show-answer-host')?.addEventListener('click', toggleShowAnswer);
        document.getElementById('btn-cancel-clue')?.addEventListener('click', cancelActiveClue);
        document.getElementById('btn-deploy-question')?.addEventListener('click', deployQuestion);
        document.getElementById('btn-mark-correct')?.addEventListener('click', () => handleAnswerEvaluation(true));
        document.getElementById('btn-mark-wrong')?.addEventListener('click', () => handleAnswerEvaluation(false));
        document.getElementById('btn-reset-buzzers-host')?.addEventListener('click', () => resetAndUnlockBuzzers(true));
      }
    }

    // 4. PANTALLA DE PODIUM
    function renderPodiumTeamsScreen(appContainer: HTMLElement) {
      const activeTeams = [...state.teams.slice(0, state.teamCount)].sort((a: any, b: any) => b.score - a.score);
      const winner = activeTeams[0] || { name: 'Sin ganador', color: '#FFCC00', score: 0 };
      if (typeof window.confetti === 'function') window.confetti({ particleCount: 120, spread: 90, origin: { y: 0.5 } });

      appContainer.innerHTML = `
        <div class="min-h-screen bg-[#000533] p-6 flex flex-col justify-between items-center text-center">
          <header class="w-full max-w-4xl flex flex-wrap justify-between items-center bg-[#000222] border-2 border-[#D4AF37] rounded-2xl p-4 gap-3 shadow-lg">
            <div class="flex items-center gap-3">
              <button id="btn-back-podium-header" title="Volver a la pantalla anterior" class="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-900 to-indigo-900 hover:from-blue-800 hover:to-indigo-800 border-2 border-blue-400 text-white font-black text-xs uppercase flex items-center gap-2 transition cursor-pointer shadow-md transform active:scale-95">
                <span class="text-base">⬅</span>
                <span>Volver / Regresar</span>
              </button>
              <h1 class="text-lg sm:text-xl font-black text-[#FFCC00] uppercase font-cinzel leading-tight">🏆 PODIUM DE EQUIPOS GANADORES 🏆</h1>
            </div>
            <button id="btn-logout-podium-teams" class="px-3.5 py-2 bg-rose-600/90 rounded-xl text-xs font-bold uppercase text-white hover:bg-rose-500 transition cursor-pointer shadow">Cerrar Sesión</button>
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

          <footer class="w-full max-w-4xl flex flex-wrap justify-between items-center gap-3 pt-4">
            <button id="btn-back-game-podium-footer" class="px-6 py-3.5 bg-gradient-to-r from-blue-900 to-indigo-900 hover:from-blue-800 hover:to-indigo-800 border-2 border-blue-400 text-white rounded-2xl font-black text-sm uppercase shadow-lg cursor-pointer flex items-center gap-2 transition transform active:scale-95">
              <span>⬅</span>
              <span>Volver al Tablero de Juego</span>
            </button>
            <button id="btn-back-setup-podium" class="px-6 py-3.5 bg-blue-950 border border-blue-700 text-blue-200 rounded-2xl font-bold text-sm uppercase hover:bg-blue-900 shadow cursor-pointer transition">
              Ir a Configuración ⚙️
            </button>
          </footer>
        </div>
      `;

      document.getElementById('btn-back-podium-header')?.addEventListener('click', () => navigateBack('game'));
      document.getElementById('btn-back-game-podium-footer')?.addEventListener('click', () => navigateBack('game'));
      document.getElementById('btn-back-setup-podium')?.addEventListener('click', () => navigateScreen('setup'));
      document.getElementById('btn-logout-podium-teams')?.addEventListener('click', executeGlobalLogout);
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

    // 6. VISTA MÓVIL DE CONTROL PARA EL INSTRUCTOR (?role=instructor)
    function renderInstructorMobileView(appContainer: HTMLElement) {
      const teamCount = state.teamCount || state.teams.length;
      const activeTeams = state.teams.slice(0, teamCount);
      const activeClue = state.activeClue;

      appContainer.innerHTML = `
        <div class="min-h-screen bg-[#000533] text-white flex flex-col justify-between">
          <!-- BARRA SUPERIOR DE ESTADO DEL INSTRUCTOR -->
          <header class="bg-[#000222] border-b-2 border-amber-500 px-4 py-3 sticky top-0 z-40 shadow-lg">
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-center gap-2">
                <span class="w-8 h-8 rounded-lg bg-amber-500 text-[#000533] flex items-center justify-center font-cinzel font-black text-sm">📱</span>
                <div>
                  <h1 class="text-xs sm:text-sm font-black text-[#FFCC00] uppercase font-cinzel leading-none truncate max-w-[200px] sm:max-w-none">
                    ${escapeHtml(state.title || 'Control Instructor')}
                  </h1>
                  <span class="text-[10px] text-emerald-400 font-bold flex items-center gap-1 mt-0.5">
                    <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    Mando Remoto en Vivo
                  </span>
                </div>
              </div>

              <div class="flex items-center gap-1.5">
                <button id="btn-instructor-refresh" title="Refrescar vista" class="px-2.5 py-1.5 bg-blue-950 border border-blue-700 rounded-lg text-xs font-bold text-blue-200 hover:bg-blue-900 cursor-pointer">
                  🔄
                </button>
                <button id="btn-instructor-exit" class="px-2.5 py-1.5 bg-rose-600/90 hover:bg-rose-500 rounded-lg text-xs font-bold text-white uppercase cursor-pointer">
                  Salir
                </button>
              </div>
            </div>

            <!-- Resumen de puntuaciones de equipos -->
            <div class="flex items-center gap-2 overflow-x-auto py-2 mt-2 border-t border-blue-900/60 no-scrollbar">
              ${activeTeams.map((t: any) => `
                <div class="flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold" style="background-color: ${t.color}22; border-color: ${t.color};">
                  <span class="w-2 h-2 rounded-full" style="background-color: ${t.color};"></span>
                  <span class="text-[11px] text-gray-200 uppercase truncate max-w-[80px]">${escapeHtml(t.name)}:</span>
                  <span id="instructor-mobile-score-${t.id}" class="font-mono font-black text-white">$${t.score}</span>
                </div>
              `).join('')}
            </div>
          </header>

          <!-- CONTENIDO PRINCIPAL -->
          <main class="flex-1 p-4 max-w-2xl mx-auto w-full flex flex-col justify-start">
            ${activeClue ? `
              <!-- TARJETA DE PREGUNTA ACTIVA CON DETALLES SECRETOS PARA EL INSTRUCTOR -->
              <div class="bg-[#000842] border-3 border-[#FFCC00] rounded-2xl p-4 sm:p-5 shadow-[0_0_40px_rgba(255,204,0,0.25)] space-y-4">
                
                <!-- Encabezado de la Clue: Categoría y Puntos -->
                <div class="flex justify-between items-center border-b border-blue-900/80 pb-3">
                  <div>
                    <span class="text-[10px] text-amber-400 uppercase font-black tracking-widest block">Categoría</span>
                    <h2 class="font-cinzel text-base sm:text-lg font-black text-white uppercase">${escapeHtml(activeClue.categoryTitle || '')}</h2>
                  </div>
                  <div class="text-right">
                    <span class="text-[10px] text-blue-300 uppercase font-bold block">Valor</span>
                    <span class="font-bebas text-3xl sm:text-4xl text-[#FFCC00]">$${activeClue.value}</span>
                  </div>
                </div>

                <!-- Estado del Flujo de la Pregunta -->
                <div class="p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                  state.loadingDevicesState 
                    ? 'bg-amber-500/15 border-amber-400 text-amber-300 animate-pulse' 
                    : 'bg-emerald-500/15 border-emerald-400 text-emerald-300'
                }">
                  <span class="text-base">${state.loadingDevicesState ? '⏳' : '📢'}</span>
                  <span>
                    ${state.loadingDevicesState 
                      ? 'Estado: CARGANDO DISPOSITIVOS (Oculta en pantalla grande)' 
                      : 'Estado: PREGUNTA VISIBLE EN PANTALLA PRINCIPAL'}
                  </span>
                </div>

                <!-- PREGUNTA ACTUAL -->
                <div class="space-y-1">
                  <span class="text-[11px] font-black uppercase text-blue-300 tracking-wider font-cinzel">Pregunta Actual:</span>
                  <div class="p-3.5 bg-[#000324] rounded-xl border border-blue-700 text-white font-bold text-base sm:text-lg leading-snug">
                    "${escapeHtml(activeClue.question)}"
                  </div>
                </div>

                <!-- RESPUESTA CORRECTA: EXCLUSIVA DEL INSTRUCTOR CON BOTÓN DE DESPLIEGUE EN VIVO -->
                <div class="space-y-3 p-4 bg-gradient-to-b from-[#00103a] to-[#000824] rounded-2xl border-2 border-amber-400 shadow-lg">
                  <div class="flex items-center justify-between">
                    <span class="text-[11px] font-black uppercase text-amber-400 tracking-wider font-cinzel flex items-center gap-1.5">
                      <span>👁️ RESPUESTA CORRECTA</span>
                      <span class="bg-amber-500 text-[#000533] text-[9px] font-black px-1.5 py-0.5 rounded uppercase">Mando Móvil</span>
                    </span>
                    <span class="text-[10px] ${activeClue.showAnswer ? 'text-emerald-400 font-black' : 'text-slate-400 italic'}">
                      ${activeClue.showAnswer ? '● VISIBLE EN PANTALLA' : '○ Oculta en pantalla'}
                    </span>
                  </div>

                  <!-- Tarjeta con la respuesta -->
                  <div class="p-3.5 bg-[#000524] rounded-xl border border-amber-500/60 text-amber-300 font-black text-lg sm:text-xl flex items-center gap-2.5 shadow-inner">
                    <span class="text-amber-400 text-xl">💡</span>
                    <span class="font-sans flex-1">${escapeHtml(activeClue.answer || 'Sin respuesta registrada')}</span>
                  </div>

                  ${activeClue.showAnswer ? `
                    <div class="p-2 rounded-xl bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-xs font-bold flex items-center justify-center gap-2 animate-pulse">
                      <span class="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                      <span>¡RESPUESTA DESPLEGADA EN EL ESTUDIO!</span>
                    </div>
                  ` : ''}

                  <!-- Botón interactivo y visible para desplegar la respuesta desde el móvil -->
                  <button
                    id="instructor-btn-toggle-answer"
                    class="w-full py-4 px-4 rounded-xl font-black text-sm uppercase shadow-xl flex items-center justify-center gap-2 cursor-pointer transition transform active:scale-95 ${
                      activeClue.showAnswer
                        ? 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-2 border-amber-400/70'
                        : 'bg-gradient-to-r from-amber-400 via-[#FFCC00] to-yellow-400 hover:brightness-110 text-[#000533] border-2 border-yellow-200 shadow-[0_0_20px_rgba(255,204,0,0.3)]'
                    }"
                  >
                    <span class="text-xl">${activeClue.showAnswer ? '🙈' : '📢'}</span>
                    <span>${activeClue.showAnswer ? 'Ocultar Respuesta en Pantalla' : 'Mostrar Respuesta en Pantalla'}</span>
                  </button>
                </div>

                <!-- ESTADO DEL TURNO / PULSADORES -->
                <div class="p-3.5 rounded-xl border-2 ${state.currentTurn ? 'bg-emerald-950/40 border-emerald-400' : 'bg-blue-950/40 border-blue-700'} space-y-2">
                  ${state.currentTurn ? `
                    <div class="flex items-center justify-between">
                      <span class="text-[10px] uppercase font-black tracking-widest text-emerald-400 animate-pulse">¡TIENE EL TURNO PARA RESPONDER!</span>
                      <span class="text-[10px] font-mono text-slate-300">Pulsó primero</span>
                    </div>
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg text-white" style="background-color: ${state.currentTurn.teamColor}">
                        ${escapeHtml(state.currentTurn.teamName.charAt(0) || 'E')}
                      </div>
                      <div>
                        <h4 class="text-lg font-black text-white uppercase">${escapeHtml(state.currentTurn.playerName)}</h4>
                        <span class="text-xs font-bold uppercase" style="color: ${state.currentTurn.teamColor}">
                          ${escapeHtml(state.currentTurn.teamName)}
                        </span>
                      </div>
                    </div>
                  ` : `
                    <div class="text-center py-1">
                      <div class="text-xs font-bold text-blue-200 flex items-center justify-center gap-1.5">
                        <span class="w-2 h-2 rounded-full ${state.buzzersUnlocked ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}"></span>
                        <span>${state.buzzersUnlocked ? 'Timbres activos en dispositivos móviles. Esperando pulsador...' : 'Timbres bloqueados.'}</span>
                      </div>
                    </div>
                  `}

                  <!-- Cola de espera si otros pulsaron después -->
                  ${(state.buzzQueue && state.buzzQueue.length > 0) ? `
                    <div class="pt-2 border-t border-blue-900/60">
                      <span class="text-[10px] font-bold uppercase text-slate-400 block mb-1">En cola de espera:</span>
                      <div class="flex flex-wrap gap-1.5">
                        ${state.buzzQueue.map((item: any, idx: number) => `
                          <span class="px-2 py-0.5 rounded bg-blue-900 text-[10px] font-bold text-white border border-blue-600">
                            #${idx + 2} ${escapeHtml(item.playerName)} (${escapeHtml(item.teamName)})
                          </span>
                        `).join('')}
                      </div>
                    </div>
                  ` : ''}

                  <!-- Equipos penalizados en esta pregunta -->
                  ${(state.disqualifiedTeams && state.disqualifiedTeams.length > 0) ? `
                    <div class="pt-1 text-[10px] text-rose-300">
                      ✗ Equipos que ya fallaron: <strong>${state.disqualifiedTeams.join(', ')}</strong>
                    </div>
                  ` : ''}
                </div>

                <!-- BOTONES DE ACCIÓN EN TIEMPO REAL -->
                <div class="space-y-2 pt-2">
                  <span class="text-[11px] font-black uppercase text-[#FFCC00] tracking-wider font-cinzel block">
                    Acciones de Control en Tiempo Real:
                  </span>

                  <!-- Botón 1: Desplegar Pregunta -->
                  ${state.loadingDevicesState ? `
                    <button id="instructor-btn-deploy" class="w-full py-4 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-[#000533] rounded-xl font-black text-sm uppercase shadow-lg flex items-center justify-center gap-2 cursor-pointer transition transform active:scale-98">
                      <span class="text-lg">🚀</span> Desplegar Pregunta
                    </button>
                  ` : ''}

                  <!-- Botones de Calificación cuando alguien pulsó -->
                  ${state.currentTurn ? `
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button id="instructor-btn-correct" class="py-3.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-xs uppercase shadow-md flex items-center justify-center gap-1.5 cursor-pointer transition active:scale-98">
                        <span>✓</span> Marcar Correcto (+$${activeClue.value})
                      </button>
                      <button id="instructor-btn-wrong" class="py-3.5 px-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-black text-xs uppercase shadow-md flex items-center justify-center gap-1.5 cursor-pointer transition active:scale-98">
                        <span>✗</span> Marcar Incorrecto / Pasar Turno
                      </button>
                    </div>

                    <!-- CONTROL DE FALSA SALIDA / REINICIO DE TIMBRES -->
                    <div class="p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/70 via-orange-950/60 to-amber-950/70 border-2 border-amber-400 space-y-2.5 shadow-lg">
                      <div class="flex items-center justify-between">
                        <span class="text-xs font-black uppercase text-amber-300 flex items-center gap-1.5 font-cinzel">
                          <span>⚡</span> Falsa Salida / Intento Anticipado
                        </span>
                        <span class="text-[9px] bg-amber-400 text-[#000533] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">Control Buzzer</span>
                      </div>
                      <p class="text-xs text-amber-100/90 leading-tight">
                        ¿<strong>${escapeHtml(state.currentTurn.playerName)}</strong> (${escapeHtml(state.currentTurn.teamName)}) oprimió antes de tiempo? Invalida este timbre sin quitarle puntos:
                      </p>
                      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        <button
                          id="instructor-btn-reset-buzzers-all"
                          class="py-3 px-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-[#000533] font-black text-xs uppercase rounded-xl shadow flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition"
                        >
                          <span>⚡</span> Reiniciar Timbres (Permitir a Todos)
                        </button>
                        <button
                          id="instructor-btn-penalize-early"
                          class="py-3 px-2 bg-rose-900/90 hover:bg-rose-800 text-rose-100 border border-rose-500 font-black text-xs uppercase rounded-xl shadow flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition"
                        >
                          <span>🚫</span> Bloquear ${escapeHtml(state.currentTurn.teamName)} y Reabrir Resto
                        </button>
                      </div>
                    </div>
                  ` : ''}

                  <!-- Botón: Cerrar Pregunta y Desbloquear Timbres -->
                  <div class="flex items-center gap-2 pt-1">
                    <button id="instructor-btn-cancel" class="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 rounded-xl font-bold text-xs uppercase cursor-pointer transition flex items-center justify-center gap-1">
                      <span>✖</span> Cerrar Pregunta
                    </button>
                    ${!state.currentTurn ? `
                      <button id="instructor-btn-reunlock" title="Reactivar y desbloquear timbres en celulares" class="py-3 px-3 bg-gradient-to-r from-blue-900 to-indigo-900 hover:from-blue-800 hover:to-indigo-800 text-blue-100 border-2 border-blue-400 rounded-xl font-bold text-xs uppercase cursor-pointer flex items-center gap-1 shadow">
                        <span>🔓</span> Desbloquear Timbres
                      </button>
                    ` : ''}
                  </div>
                </div>

              </div>
            ` : `
              <!-- CUANDO NO HAY PREGUNTA ACTIVA: SELECCIONAR PREGUNTA DESDE EL CELULAR -->
              <div class="space-y-4">
                <div class="bg-[#000842] border-2 border-blue-900 rounded-2xl p-4 text-center space-y-2 shadow">
                  <div class="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-900 text-2xl mb-1">📋</div>
                  <h3 class="font-cinzel font-black text-base sm:text-lg text-[#FFCC00] uppercase">Tablero de Preguntas</h3>
                  <p class="text-xs text-blue-200">
                    Toca cualquier casilla para abrir la pregunta directamente desde tu móvil. Se proyectará en la pantalla principal.
                  </p>
                </div>

                <!-- Matriz de categorías y preguntas -->
                <div class="space-y-3">
                  ${state.categories.map((cat: any) => `
                    <div class="bg-[#000428] border border-blue-900 rounded-xl p-3 space-y-2">
                      <div class="flex justify-between items-center">
                        <span class="font-cinzel text-xs font-black text-[#FFCC00] uppercase truncate">${escapeHtml(cat.title)}</span>
                        <span class="text-[10px] text-blue-300 font-mono">
                          ${cat.clues.filter((c: any) => !c.isAnswered).length} disp.
                        </span>
                      </div>
                      <div class="grid grid-cols-5 gap-1.5">
                        ${cat.clues.map((cl: any) => `
                          <button
                            data-cat="${cat.id}" data-clue="${cl.id}"
                            ${cl.isAnswered ? 'disabled' : ''}
                            class="instructor-clue-btn py-2.5 rounded-lg border font-mono font-bold text-xs transition ${
                              cl.isAnswered 
                                ? 'bg-blue-950/40 border-blue-900/40 text-blue-900 line-through cursor-not-allowed pointer-events-none opacity-25' 
                                : 'bg-blue-900/80 hover:bg-amber-500 hover:text-[#000533] border-blue-600 text-yellow-300 active:scale-95 cursor-pointer'
                            }"
                          >
                            ${cl.isAnswered ? '✓' : `$${cl.value}`}
                          </button>
                        `).join('')}
                      </div>
                    </div>
                  `).join('')}
                </div>

                <!-- Controles globales para el instructor -->
                <div class="bg-[#000428] border border-blue-900/60 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2">
                  ${state.status === 'podium_teams' ? `
                    <button id="instructor-btn-back-board" class="flex-1 py-2.5 bg-blue-900 hover:bg-blue-800 text-white border-2 border-blue-400 rounded-lg text-xs font-black uppercase transition cursor-pointer flex items-center justify-center gap-1.5 shadow">
                      <span>⬅</span> <span>Volver al Tablero</span>
                    </button>
                  ` : `
                    <button id="instructor-btn-finish-game" class="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold uppercase transition cursor-pointer">
                      🏆 Ir al Podio
                    </button>
                  `}
                  <button id="instructor-btn-reset-board" class="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 rounded-lg text-xs font-bold uppercase transition cursor-pointer">
                    Reiniciar Tablero
                  </button>
                </div>
              </div>
            `}
          </main>

          <footer class="bg-[#000222] border-t border-blue-900/60 px-4 py-2 text-center text-[10px] text-blue-300">
            Jeopardy Live Show · Panel Móvil de Instructor sincronizado con Firebase
          </footer>
        </div>
      `;

      // Event listeners para el instructor
      document.getElementById('btn-instructor-refresh')?.addEventListener('click', () => {
        sound.playSelect();
        render();
      });

      document.getElementById('btn-instructor-exit')?.addEventListener('click', () => {
        if (confirm('¿Deseas salir del panel de instructor?')) {
          window.location.search = '';
        }
      });

      // Desplegar u ocultar respuesta correcta en tiempo real
      document.getElementById('instructor-btn-toggle-answer')?.addEventListener('click', () => {
        toggleShowAnswer();
      });

      // Selección de preguntas desde el celular
      document.querySelectorAll('.instructor-clue-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const catId = btn.getAttribute('data-cat');
          const clueId = btn.getAttribute('data-clue');
          if (catId && clueId) {
            openClue(catId, clueId);
          }
        });
      });

      // Desplegar pregunta
      document.getElementById('instructor-btn-deploy')?.addEventListener('click', () => {
        deployQuestion();
      });

      // Marcar correcto
      document.getElementById('instructor-btn-correct')?.addEventListener('click', () => {
        handleAnswerEvaluation(true);
      });

      // Marcar incorrecto / pasar turno
      document.getElementById('instructor-btn-wrong')?.addEventListener('click', () => {
        handleAnswerEvaluation(false);
      });

      // Cerrar / cancelar pregunta
      document.getElementById('instructor-btn-cancel')?.addEventListener('click', () => {
        cancelActiveClue();
      });

      // Falsa salida: Reiniciar timbres para todos (sin descontar puntos)
      document.getElementById('instructor-btn-reset-buzzers-all')?.addEventListener('click', () => {
        resetAndUnlockBuzzers(true);
      });

      // Falsa salida: Bloquear al equipo que se adelantó y reabrir timbres para los demás
      document.getElementById('instructor-btn-penalize-early')?.addEventListener('click', () => {
        resetAndUnlockBuzzers(false);
      });

      // Reabrir / forzar desbloqueo de timbres
      document.getElementById('instructor-btn-reunlock')?.addEventListener('click', () => {
        resetAndUnlockBuzzers(true);
      });

      // Ir al podio o volver al tablero
      document.getElementById('instructor-btn-finish-game')?.addEventListener('click', () => {
        sound.playCorrect();
        navigateScreen('podium_teams');
      });

      document.getElementById('instructor-btn-back-board')?.addEventListener('click', () => {
        sound.playSelect();
        navigateScreen('game');
      });

      // Reiniciar tablero
      document.getElementById('instructor-btn-reset-board')?.addEventListener('click', () => {
        if (confirm('¿Estás seguro de reiniciar los puntajes y preguntas del tablero?')) {
          executeResetBoard();
        }
      });
    }

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('beforeunload', handleHostTabExit);
      window.removeEventListener('pagehide', handleHostTabExit);
    };
  }, []);

  return <div id="app" ref={containerRef} className="min-h-screen flex flex-col" />;
}
