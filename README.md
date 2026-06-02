# 🎵 100 Músicos Dijeron

Juego de encuestas musicales estilo **Family Feud** para usar en eventos, clases de música, fiestas y dinámicas grupales. Dos equipos compiten respondiendo encuestas populares de temática musical.

## Stack Tecnológico

- **Next.js 15** con App Router
- **React 19** + **TypeScript**
- **Tailwind CSS** con diseño TV Show personalizado
- **shadcn/ui** (componentes pre-instalados)
- **Framer Motion** — animaciones del tablero
- **Supabase** — PostgreSQL + Realtime
- **Vercel** — deploy

---

## Pantallas

| Ruta | Descripción |
|------|-------------|
| `/` | Inicio — crear o unirse a partida |
| `/screen/[gameId]` | Tablero para TV / proyector |
| `/host/[gameId]` | Panel del conductor |
| `/join/[gameId]` | Página de unión con código |
| `/admin` | CRUD de preguntas |

---

## Instalación Local

### 1. Requisitos

- Node.js 18+
- Cuenta en [Supabase](https://supabase.com) (gratuita)

### 2. Clonar y instalar

```bash
git clone <repo-url>
cd 100-musicos-dijeron
npm install
```

### 3. Variables de entorno

```bash
cp .env.local.example .env.local
```

Edita `.env.local` con tus credenciales de Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

### 4. Configurar Supabase

#### a) Crear proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) → **New Project**
2. Elige nombre y región
3. Copia la URL y la `anon key` de **Project Settings → API**

#### b) Ejecutar migraciones

Copia el contenido de `supabase/migrations/001_schema.sql` y ejecútalo en:

**Supabase Dashboard → SQL Editor → New Query**

Ejecuta el archivo completo.

#### c) Cargar preguntas iniciales

Ejecuta también el contenido de `supabase/seed.sql` en el mismo SQL Editor.

#### d) Habilitar Realtime

En **Supabase Dashboard → Database → Replication**:

1. Habilita la publicación `supabase_realtime`
2. Agrega las tablas: `games`, `rounds`, `fast_money_sessions`

O ejecuta en SQL Editor:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE games;
ALTER PUBLICATION supabase_realtime ADD TABLE rounds;
ALTER PUBLICATION supabase_realtime ADD TABLE fast_money_sessions;
```

### 5. Correr localmente

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

---

## Cómo Usar el Juego

### Flujo completo

1. **Conductor** abre `/` → **Crear Partida** → se abre `/host/[gameId]`
2. El código de 6 letras aparece en el panel del conductor
3. Abrir `/screen/[gameId]` en la TV o proyector
4. Los espectadores pueden entrar con el código en la página de inicio

### Panel del conductor `/host/[gameId]`

- **Izquierda**: Controles de equipos (nombres, puntos, control de turno), strikes, selector de preguntas
- **Derecha**: Vista previa del tablero en tiempo real

#### Controles principales:

| Botón | Acción |
|-------|--------|
| Iniciar Ronda | Selecciona pregunta y multiplier, inicia la ronda |
| Revelar respuesta | Muestra la respuesta en el tablero |
| + Strike | Suma un strike al equipo activo |
| Dar Control → E1/E2 | Asigna el turno de juego |
| Activar Robo | Tras 3 strikes, da oportunidad al otro equipo |
| Pts → E1/E2 | Otorga los puntos acumulados de la ronda |
| Siguiente Ronda | Termina la ronda actual |
| ⚡ Dinero Rápido | Activa el modo final |

### Reglas del juego

1. El conductor lee la pregunta en voz alta
2. **Cara a cara**: un representante de cada equipo dice una respuesta
3. El equipo que acierte la respuesta más popular **controla la ronda**
4. El equipo en control va respondiendo (revelando) las respuestas
5. Si fallan, se marca un **strike**
6. Con **3 strikes**: el otro equipo tiene una oportunidad de **robo**
   - Si el robo acierta → ganan los puntos acumulados
   - Si el robo falla → los puntos van al equipo original
7. El primer equipo en llegar a **300 puntos** gana
8. Opcional: **Dinero Rápido Musical** como bonus

### Multiplicadores

- **×1 (Normal)**: Ronda estándar
- **×2 (Doble)**: Los puntos valen el doble
- **×3 (Triple)**: Los puntos valen el triple

### Dinero Rápido Musical

1. Dos jugadores del equipo ganador responden 5 preguntas
2. **Jugador 1**: responde con tiempo límite (20 seg por defecto)
3. **Jugador 2**: responde las mismas preguntas, no puede repetir respuestas del J1
4. Meta: **200 puntos** entre ambos

---

## Administración de Preguntas `/admin`

- Ver, crear, editar y eliminar preguntas
- Activar o desactivar preguntas (solo las activas aparecen en el juego)
- Cada pregunta requiere:
  - Texto de la pregunta
  - Categoría
  - Entre **4 y 8 respuestas**
  - Suma de puntos **≤ 100**

---

## Deploy en Vercel

### 1. Conectar repositorio

```bash
git init && git add -A && git commit -m "feat: initial setup"
```

Sube a GitHub y conecta en [vercel.com](https://vercel.com).

### 2. Variables de entorno en Vercel

En tu proyecto de Vercel → **Settings → Environment Variables**:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

### 3. Deploy automático

Vercel despliega automáticamente en cada push a `main`.

---

## Estructura del Proyecto

```
100-musicos-dijeron/
├── app/
│   ├── api/
│   │   ├── games/                  # POST crear, GET buscar por código
│   │   │   └── [gameId]/
│   │   │       ├── route.ts        # GET estado del juego
│   │   │       └── actions/route.ts # POST acciones del conductor
│   │   ├── questions/              # CRUD preguntas
│   │   └── fast-money/[gameId]/    # PATCH respuestas dinero rápido
│   ├── admin/                      # Panel de administración
│   ├── host/[gameId]/              # Panel del conductor
│   ├── screen/[gameId]/            # Pantalla para TV
│   ├── join/[gameId]/              # Página de unión
│   ├── layout.tsx
│   ├── page.tsx                    # Página de inicio
│   └── globals.css
├── components/
│   ├── game/                       # Tablero, respuestas, strikes, etc.
│   ├── host/                       # Controles del conductor
│   ├── admin/                      # Formularios de preguntas
│   └── ui/                         # Componentes base (shadcn style)
├── hooks/
│   ├── use-game.ts                 # Acciones del juego (API calls)
│   ├── use-realtime.ts             # Suscripción Supabase Realtime
│   └── use-sound.ts                # Web Audio API para sonidos
├── lib/
│   ├── supabase/
│   │   ├── client.ts               # Browser client
│   │   └── server.ts               # Server client
│   ├── types.ts                    # TypeScript types
│   ├── game-utils.ts               # Utilidades del juego
│   └── utils.ts                    # cn() helper
└── supabase/
    ├── migrations/001_schema.sql   # Schema completo
    └── seed.sql                    # 20 preguntas iniciales
```

---

## Sonidos

Los sonidos se generan con la **Web Audio API** (sin archivos externos):
- **Revelar respuesta**: Acorde ascendente
- **Strike**: Buzzer
- **Victoria de ronda**: Fanfarria
- **Puntos otorgados**: Caja registradora

Se pueden desactivar desde el panel del conductor con el switch de sonidos.

---

## Configuración de Realtime (Importante)

Para que la pantalla se actualice en tiempo real sin recargar:

1. En Supabase Dashboard → **Database → Replication**
2. Click en el nombre de la publicación `supabase_realtime`
3. Habilita las tablas: `games`, `rounds`, `fast_money_sessions`

Si la suscripción no funciona, verifica:
- Las tablas están en la publicación
- RLS está habilitado con política `Allow all`
- Las variables de entorno son correctas

---

## Licencia

MIT — Uso libre para eventos educativos y comunitarios.
