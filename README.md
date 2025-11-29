<a name="readme-top"></a>

<div align="center">

## Aplicación System Inventario

System Inventario es una aplicación híbrida desarrollada con Ionic y Angular que simplifica la gestión de registros, productos y inventarios. Esta aplicación esta dirigida a la empresa "System"

</div>

## Problema y solución  
Los micro-emprendimientos gastronómicos suelen gestionar mesas y cuentas en papeo o en notas moviles, lo que genera errores de cobro y una gran perdida de tiempo en algunos casos.  
**Table Master** digitaliza el flujo de trabajo completo sin costo de hardware adicional: basta tener un un smartphone o tablet con un sistema operativo Android/iOS.

## Características principales
- **100 % híbrido** – Instalación única para Android y iOS.  
- **Interfaz temática café** con iconografía personalizada (taza, recibo y billete).  
- **Gestión dinámica de mesas**: crea, reserva, ocupa, asigna un garzón y libera mesas.  
- **CRUD de productos** con stock ilimitado y precios configurables.  
- **Carrito por mesa** con subtotales instantaneos.  
- **Cálculo de propina (%)** opcional y total final automático.  
- **Historial de ventas** con fecha `dd/MM/yyyy` y busqueda por mesa o garzón.  
- **Animaciones sutiles** (flash de mesa, transiciones de modal/FAB).  
- **Operación offline-first** (datos locales en RxJS) En la próxima versión se usara algun sistema de cloud.  

## Tecnologías
- **Ionic 7** + **Angular**
- **Angular Material UI / Ionic Components**
- **RxJS** `BehaviorSubject` (estado en memoria)
- **TypeScript** | **SCSS**  

## Para empezar

### Prerequisitos

- Node.js v14 o superior

- NPM

  ```sh
  npm install npm@latest -g
  ```

- Ionic Cli

  ```sh
  npm install @ionic/cli -g
  ```
- Angular

  ```sh
  npm install -g @angular/cli
  ```

### Instalación

1. Clona el repositorio

   ```sh
   git clone https://github.com/benxh7/SkeletonAPP.git
   ```

2. Instala los paquetes de NPM

   ```sh
   npm install
   ```

3. Ejecuta el proyecto

   ```sh
   ionic serve
   ```
   Se abrirá la aplicación en http://localhost:8100/.

### Estilos y temas

- Paleta de colores oscuros con variables CSS definidas en cada SCSS.
- Estilos de Angular Material adaptados a tema oscuro con ::ng-deep.

## Contribuciones

¡Bienvenidas! Para contribuir, haz un fork del repositorio, crea una rama con tu feature y envía un pull request.

## Licencia

- MIT © 2025