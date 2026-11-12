# wcacapulco2027 — Primera propuesta (template) del sitio web

**Copa del Mundo ISSF de Escopeta · Acapulco, Guerrero, México · 2027**

> ⚠️ **PROPUESTA / BORRADOR — NO PUBLICADO.** Este sitio es un template para aprobación. No se ha publicado, no se ha comprado dominio y no hay deploy. Todo dato marcado **"Ejemplo / Example"** es ficticio y debe reemplazarse por datos reales.

## Cómo abrirlo

- **Opción 1 (más simple):** doble clic en `index.html`. Funciona sin servidor ni internet (salvo los enlaces externos).
- **Opción 2 (servidor local):** en esta carpeta ejecuta `python3 -m http.server 8000` y abre <http://localhost:8000>.

No requiere build, Node ni dependencias: HTML, CSS y JavaScript puros.

## Estructura

```
wcacapulco2027/
├── index.html          Inicio: hero, cuenta regresiva, accesos a módulos, noticias, próximas fechas, historia 2010–2019
├── informacion.html    Información general: ficha del evento, pruebas, visas, armas, cuotas, documentos/formularios
├── programa.html       Programa preliminar (estructura de ejemplo por día)
├── sede.html           Sede y campo de tiro: Club Caza, Tiro y Pesca de Acapulco, cómo llegar
├── registros.html      Módulo 1 · Registros (equipos, atletas, oficiales) + enlace al registro oficial ISSF
├── documentos.html     Módulo 2 · Documentos y permisos (armas/municiones, SEDENA, aduanas, pago de derechos) por delegación
├── logistica.html      Módulo 3 · Logística (hoteles, transporte aeropuerto/campo, otros servicios)
├── finanzas.html       Módulo 4 · Finanzas (ingresos, egresos, balance, resumen por categoría)
├── resultados.html     Resultados: enlaces a ISSF y Sius + ediciones anteriores
├── contacto.html       Contacto: directorio (ejemplo) y formulario demo
├── css/styles.css      Estilos (paleta tomada del logo, mobile-first)
├── js/layout.js        Banner de borrador, header, menú, footer, cambio de idioma ES/EN y utilidades
├── js/home.js          Cuenta regresiva
├── js/registros.js     Lógica del módulo Registros
├── js/documentos.js    Lógica del módulo Documentos y permisos
├── js/logistica.js     Lógica del módulo Logística
├── js/finanzas.js      Lógica del módulo Finanzas
├── assets/img/         Logo propuesto (original, emblema recortado, 512 px, favicon)
└── capturas/           Capturas de verificación (escritorio, móvil y módulos)
```

## Características

- **Bilingüe ES/EN** con botón en la barra superior; español por defecto. El idioma elegido se recuerda en el navegador.
- **Responsive / mobile-first**: menú hamburguesa en celular; tablas con scroll horizontal; Finanzas en tarjetas en móvil.
- **Layout inspirado en issf-sports.org**: barra superior, header con navegación, hero, bloques de noticias y eventos, footer institucional.
- **Paleta del logo** (muestreo de píxeles): verde `#00573a`, rojo `#ce0f1a`, oro `#d98a1c`, naranja (plato) `#ea5f13`, azul (mar) `#017197`, tinta `#0a0b0d`.
- **Módulos demo interactivos**: los datos se guardan solo en el navegador (`localStorage`); nada se envía a ningún servidor. Cada módulo tiene "Restaurar ejemplo" y exportación CSV.
- **Formato de cantidades**: comas de miles y punto decimal (ej. 12,345.67). Moneda única en Finanzas y Logística: MXN.
- `noindex, nofollow` en todas las páginas mientras sea borrador.

## Reglas ISSF reflejadas en el diseño

- **Art. 14 (Guidelines 2026):** el comité organizador debe tener página del campeonato → este sitio.
- **Art. 6:** Información General y formularios en línea ≥ 6 meses antes, con aprobación del Delegado Técnico → sección "Documentos y formularios" (marcada como pendiente).
- **Art. 12:** permisos de importación/exportación de armas → módulo Documentos y permisos.
- **Art. 13.1:** aprobación del logo por la ISSF → aviso en el footer.
- **Rule Book 3.8.3.2:** la inscripción oficial es en <https://shootingsportscloud.com> → el sitio solo enlaza; el módulo Registros es logística local.
- **Art. 8:** resultados oficiales los emite el proveedor ISSF (Sius) → la página Resultados solo enlaza.
- El dominio no usa la marca ISSF.

## Datos usados y su fuente

- Fechas **11–20 de marzo de 2027**, organizador **FEMETI** y sede **Club Caza, Tiro y Pesca de Acapulco**: tomados del resumen ejecutivo del 11-nov-2026 (`resumen-ejecutivo-paginas-web-acapulco-2027.pdf`). Se muestran como **preliminares / por confirmar**.
- Ediciones anteriores (2010, 2013, 2015, 2017, 2019): enlaces a las fichas ISSF del mismo resumen.
- Todo lo demás (hoteles, tarifas, montos, contactos, noticias, delegaciones, programa por día) es **ejemplo**.

## Pendientes

1. **Dominio `wcacapulco2027.com`**: otro agente lo vio libre el 12-nov-2026 a las 12:02 (hora de CDMX); **no lo hemos verificado**. No se ha comprado. Alternativas vistas libres el 11-nov: `acapulco27shotgun.com`, `acapulcowcshotgun2027.com`.
2. **Logo**: es propuesta; requiere aprobación ISSF (art. 13.1: preliminar 6 meses antes, final 4 meses antes).
3. **Delegado Técnico**: aprobar Información General y formularios (art. 6).
4. **Datos reales**: fechas oficiales, programa, cuotas, hoteles y tarifas, transporte, dirección del club, contactos oficiales (evitar correos Hotmail), textos de visas y permisos.
5. **Producción**: los módulos de Registros, Documentos, Logística y Finanzas son maquetas. Para uso real necesitan backend con autenticación por delegación, almacenamiento seguro de archivos, respaldo y control de acceso (Finanzas debería ser solo interno).
6. **Fotos** del campo de tiro y de Acapulco, y mapa (hoy son placeholders).
7. Enlace exacto de resultados en vivo (Sius) y ficha ISSF 2027 cuando existan.
8. Revisión de textos en inglés por un nativo.
