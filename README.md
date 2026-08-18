# 🌌 FireGuard

> **"Donde el fuego avanza, la información salva vidas."**  
> Una plataforma web progresiva (PWA) de coordinación y alerta temprana para emergencias por incendios forestales, impulsada por datos satelitales en tiempo real de la NASA, análisis de riesgo climático y mensajería multicanal offline-first.

[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=Vite&logoColor=white)](https://vitejs.dev/)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/es/docs/Web/JavaScript)
[![Leaflet](https://img.shields.io/badge/Leaflet-199900?style=for-the-badge&logo=Leaflet&logoColor=white)](https://leafletjs.com/)
[![PWA](https://img.shields.io/badge/PWA-5A0FC8?style=for-the-badge&logo=progressive-web-apps&logoColor=white)](https://web.dev/explore/progressive-web-apps)

https://github.com/user-attachments/assets/40bc6c7a-9dd2-44b4-8dfd-9c94ea0626b3

Proyecto para **hack@latam** (15-17 mayo 2026). **Finalista** (top 3 / 1,240). Desarrollo individual por **nightstar73**.

---

## 📌 Resumen del Proyecto

Durante las temporadas críticas de incendios forestales en Chile y Latinoamérica, la descoordinación terrestre y la caída de infraestructura de red móvil suelen costar vidas. Los brigadistas arriesgan su seguridad haciendo reconocimiento visual sin datos, y los adultos mayores o familias vulnerables quedan aisladas en zonas "invisibles" para el catastro oficial.

**FireGuard** es una respuesta tecnológica resiliente, diseñada tanto para personal de emergencia como para comunidades aisladas. La plataforma fusiona datos satelitales aeroespaciales con coordinación comunitaria terrestre y alertas que superan la barrera del internet móvil.

---

## ⚡ Características Clave (MVP v1)

### 1. 🛰️ Capa Satelital NASA FIRMS
*   Conexión directa en tiempo real con el satélite **VIIRS (Suomi-NPP)** de la NASA.
*   Georreferenciación instantánea de focos de calor activos sobre el territorio chileno.

### 2. 🌡️ Scoring de Riesgo Climático en Tiempo Real
*   Integración con la API de **Open-Meteo** para obtener datos climatológicos hiperlocales.
*   Algoritmo propietario **Fire Risk Score**: cruce dinámico de temperatura, humedad relativa y velocidad del viento para clasificar focos en categorías de riesgo (*Bajo, Moderado, Alto y Crítico*).

### 3. 👥 Capa Terrestre Comunitaria
*   **Registro de Personas Vulnerables:** Ubicación exacta, edad, necesidades especiales y contactos de emergencia para personas o adultos mayores en riesgo de quedar aislados.
*   **Puntos de Ayuda Física:** Mapeo de ollas comunes, centros de acopio de víveres, albergues operativos y fuentes de agua crítica.

### 4. 💬 Alerta Temprana SMS/WhatsApp (Zavu API)
*   **Mensajería sin Internet:** Envío instantáneo de alertas de evacuación personalizadas y localizadas mediante redes telefónicas analógicas clásicas (SMS) y WhatsApp.
*   Diseñado para llegar a los dispositivos más básicos de adultos mayores en zonas aisladas sin señal de datos.

### 5. 🛡️ Arquitectura Offline-First (Resiliencia PWA)
*   Equipada con **Service Workers** robustos que pre-almacenan la interfaz y el motor de mapas localmente.
*   Si la red móvil colapsa, FireGuard carga al instante en modo offline, permitiendo mapear puntos de ayuda locales y resguardar la base de datos de manera local hasta que se recupere la conexión.

---

## 🛠️ Stack Tecnológico

*   **Core:** HTML5 Semántico, JavaScript (ES6+), Vanilla CSS (Temática Dark Mode Premium).
*   **Visualización:** Leaflet.js con capas personalizadas estilo Dark Mode (CartoDB Dark Matter).
*   **Integraciones:**
    *   [NASA FIRMS API](https://firms.modaps.eosdis.nasa.gov/api/area/) (Datos Satelitales).
    *   [Open-Meteo API](https://open-meteo.com/) (Pronóstico y datos meteorológicos).
    *   [Zavu Message API](https://api.zavu.dev/) (Motor multicanal de SMS y WhatsApp).
*   **Build System:** Vite.

---

## ⚙️ Configuración e Instalación Local

### Requisitos Previos
*   [Node.js](https://nodejs.org/) (v16 o superior).
*   Una cuenta y credenciales en la API de Zavu (zv_test_...).
*   Un `MAP_KEY` de la API de NASA FIRMS (puedes obtenerlo gratuitamente o usar los datos demo autogenerados por defecto si no se configura).

### 1. Clonar el Repositorio
```bash
git clone https://github.com/MatiAlevMe/nightstar73.git
cd nightstar73
```

### 2. Instalar Dependencias
```bash
npm install
```

### 3. Configurar Variables de Entorno
Crea un archivo `.env` en la raíz del proyecto y añade tus llaves:
```env
# NASA FIRMS API Map Key
VITE_FIRMS_MAP_KEY="tu_llave_nasa_firms_aqui"

# Zavu API Key para alertas SMS/WhatsApp
VITE_ZAVU_API_KEY="zv_test_tu_llave_zavu_aqui"
```

### 4. Ejecutar el Servidor de Desarrollo
```bash
npm run dev
```
La aplicación estará disponible en `http://localhost:3000`.

---

## 🗺️ Roadmap de Escalamiento (Fase 2)

FireGuard está diseñado para expandir su valor público en etapas posteriores. Los siguientes pilares componen nuestra propuesta de evolución:

1.  **Clustering de "Zonas Activas":** Agrupamiento algorítmico (K-Means/Voronoi) de focos cercanos para crear polígonos de "Zonas Rojas de Riesgo", facilitando alertas masivas segmentadas por comunas en lugar de focos puntuales.
2.  **Modelado de Propagación de Fuego:** Integración de mapas topográficos y elevación para proyectar la dirección y velocidad del avance del fuego a 4 horas.
3.  **Triage de Emergencias con IA:** Incorporación del modelo **LLM MiniMax** vía Zavu API para procesar y clasificar de forma autónoma mensajes entrantes de emergencia vía SMS (ej: salud, rescate, desabastecimiento) y posicionarlos dinámicamente en el mapa municipal.
4.  **Red Local Vecinal Peer-to-Peer:** Protocolo P2P local (vía Bluetooth o Wi-Fi Direct) integrado directamente en la PWA para comunicar teléfonos cercanos en zonas de colapso de antenas, hasta que el mensaje logre saltar a una central con enlace Starlink.

---

## 🔗 Enlaces de interés

- 🚀 Deploy: https://nightstar73.vercel.app/
- 🎬 Demo: https://youtu.be/abEFfYC2CoM
- 📊 Presentación: https://tundra-willow-810.faces.site/8q840644wptu
- 🌐 hack@latam (2026): https://hack.indies.la/

---

## 📄 Licencia

Este proyecto fue desarrollado bajo los términos de la Hackathon Faces y está licenciado bajo la **GNU Affero General Public License v3.0 (AGPL-3.0)**.
