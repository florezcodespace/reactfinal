# Cosmos Explorer API

Backend para la seccion `My Cosmos` con Node.js, Express y MongoDB Atlas.

## Endpoints disponibles

- `GET /api/health`
- `GET /api/expenses?userEmail=<email>`
- `POST /api/expenses`
- `PUT /api/expenses/:id`
- `DELETE /api/expenses/:id?userEmail=<email>`

## Variables de entorno

1. Copia `server/.env.example` a `server/.env`.
2. Reemplaza `MONGODB_URI` por tu cadena real de MongoDB Atlas.
3. Asegurate de permitir tu IP en `Network Access` dentro de Atlas.
4. Verifica que el usuario de base de datos de Atlas tenga permisos de lectura y escritura.

## Arranque local

1. Ejecuta `npm install` en `vitexd/server`.
2. Ejecuta `npm run dev` en `vitexd/server`.
3. Copia `vitexd/.env.example` a `vitexd/.env`.
4. Ejecuta `npm install` y `npm run dev` en `vitexd`.

## Ejemplo de payload

```json
{
  "concept": "Filtro lunar premium",
  "category": "Equipo orbital",
  "amount": 120,
  "date": "2026-04-03",
  "notes": "Ideal para reducir brillo en observacion de Luna llena.",
  "userEmail": "astronauta@cosmos.dev"
}
```
