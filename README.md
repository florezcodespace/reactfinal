# Cosmos Explorer

Aplicacion web desarrollada con React y Vite para explorar contenido espacial, consultar datos abiertos de NASA y llevar un registro privado de gastos astronomicos persistidos en MongoDB Atlas.

## Descripcion y caracteristicas principales

- Dashboard principal con visual espacial, APOD dinamico y radar de asteroides cercanos.
- Seccion `Explore` para navegar recursos e imagenes relacionados con exploracion espacial.
- Seccion `Events` para consultar informacion astronomica destacada.
- Modulo `My Cosmos` con autenticacion local y gestion de gastos conectada a backend.
- Backend en Node.js + Express con persistencia en MongoDB Atlas.
- Preparado para despliegue de frontend en Vercel y backend en Render.

## Instalacion

### Frontend

```bash
cd vitexd
npm install
```

### Backend

```bash
cd vitexd/server
npm install
```

## Configuracion de entorno

### Frontend `vitexd/.env`

```env
VITE_NASA_API_KEY=tu_api_key
VITE_API_URL=http://localhost:4000/api
VITE_REPO_URL=
VITE_DEPLOY_URL=
```

### Backend `vitexd/server/.env`

```env
PORT=4000
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://usuario:password@host1:27017,host2:27017,host3:27017/cosmos-explorer?ssl=true&replicaSet=tuReplicaSet&authSource=admin&retryWrites=true&w=majority
```

## Ejecucion

### Iniciar backend

```bash
cd vitexd/server
npm run dev
```

### Iniciar frontend

```bash
cd vitexd
npm run dev
```

### Build de produccion

```bash
cd vitexd
npm run build
```

## Tecnologias

- React 19
- Vite 8
- React Router
- Tailwind CSS
- Node.js
- Express
- MongoDB Atlas
- Mongoose
- Vite PWA

## Arquitectura o encarpetado

```text
vitexd/
|- public/                # Activos publicos y manifest
|- src/
|  |- assets/             # Imagenes y recursos graficos
|  |- components/         # Componentes reutilizables
|  |- config/             # Configuracion del cliente
|  |- context/            # Estado global de autenticacion
|  |- data/               # Datos locales de apoyo
|  |- lib/                # Clientes HTTP y utilidades
|  `- pages/              # Paginas principales
|- server/
|  |- src/
|  |  |- config/          # Variables de entorno
|  |  |- controllers/     # Logica de endpoints
|  |  |- db/              # Conexion a MongoDB
|  |  |- models/          # Modelos Mongoose
|  |  |- routes/          # Rutas de la API
|  |  |- app.js           # App Express
|  |  `- server.js        # Arranque del servidor
|- vercel.json            # Configuracion del deploy frontend
`- render.yaml            # Configuracion base del deploy backend
```

## Screenshot de la interfaz grafica

![Vista principal de Cosmos Explorer](./docs/screenshot-home.png)

## Subida a GitHub por consola

Ejecuta estos comandos desde la carpeta `vitexd` cuando crees tu repositorio remoto:

```bash
git init
git add .
git commit -m "feat: entrega inicial cosmos explorer"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
git push -u origin main
```

Si ya existe un repositorio Git mas arriba en tu equipo, trabaja dentro de `vitexd` con un repositorio propio para no mezclar archivos ajenos al proyecto.

## Deploy

### Frontend en Vercel

1. Importa el repositorio en Vercel.
2. Framework: `Vite`.
3. Root directory: `vitexd` si el repo padre contiene mas carpetas; si el repo es solo este proyecto, usa la raiz.
4. Variables:
   - `VITE_API_URL`
   - `VITE_NASA_API_KEY`
   - `VITE_REPO_URL`
   - `VITE_DEPLOY_URL`

### Backend en Render

1. Crea un servicio `Web Service`.
2. Root directory: `server`.
3. Build command: `npm install`
4. Start command: `npm start`
5. Variables:
   - `MONGODB_URI`
   - `CLIENT_URL`
   - `PORT=4000`

## Autor

- Nombre: Andres Florez
- Rol: Desarrollador del proyecto
- Proyecto academico: Cosmos Explorer
- GitHub: Agregar URL del repositorio cuando lo publiques
- Deploy: Agregar URL final desplegada en `VITE_DEPLOY_URL`
