# 🍷 CatalogoLage - Sistema de Gestión de Catálogo Digital

<div align="center">
  <img src="https://almaceneslage.com/wp-content/uploads/2016/12/logo_LAGE.png" alt="Almacenes Lage" height="60"/>
  
  **Sistema interno de gestión y visualización del catálogo de productos**
  
  [![.NET 8](https://img.shields.io/badge/.NET-8.0-purple.svg)](https://dotnet.microsoft.com/)
  [![ASP.NET Core](https://img.shields.io/badge/ASP.NET%20Core-8.0-blue.svg)](https://docs.microsoft.com/en-us/aspnet/core/)
  [![Entity Framework](https://img.shields.io/badge/Entity%20Framework-8.0-green.svg)](https://docs.microsoft.com/en-us/ef/)
  [![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)
</div>

---

## 📋 Descripción General

**CatalogoLage** es la plataforma digital interna de Almacenes Lage para la gestión y presentación del catálogo de productos de bebidas premium. La aplicación está desarrollada con tecnología ASP.NET Core 8 y proporciona una interfaz moderna e intuitiva para empleados de la empresa.

### 🎯 Propósito del Sistema

- **Centralizar** toda la información de productos en una plataforma digital única
- **Facilitar** la consulta rápida de productos por parte del equipo comercial
- **Modernizar** la presentación visual del catálogo mediante organización matricial
- **Optimizar** los procesos de actualización y mantenimiento del inventario

---

## 👥 Usuarios del Sistema

### 🔍 **Visualizadores de Catálogo (CatalogViewer)**
**Personal comercial y de ventas**
- Acceso completo al catálogo de productos
- Herramientas de búsqueda y filtrado avanzadas
- Visualización detallada de información de productos
- Navegación por categorías especializadas

### ⚙️ **Administradores (Admin)**
**Personal de gestión e inventario**
- **Todas las funciones de visualización**
- Gestión completa de productos (crear, editar, eliminar)
- Organización visual del catálogo mediante drag-and-drop
- Administración de categorías y tipos de uva
- Configuración de la presentación matricial

---

## 🛍️ Catálogo de Productos

### 📦 Categorías Principales
- **🍷 Vinos** - Tintos, blancos, rosados, espumosos
- **🥃 Destilados** - Whisky, ron, ginebra, vodka, licores
- **☕ Café e Infusiones** - Cafés especiales, tés, infusiones

### 📋 Información de Productos
Cada producto incluye información detallada:
- **Datos básicos**: Nombre, fabricante/bodega, categoría
- **Características técnicas**: Tamaño, porcentaje alcohólico, origen
- **Información comercial**: Precio (opcional), descripción
- **Clasificación vinícola**: Tipo de uva, denominación de origen
- **Recursos visuales**: Imagen del producto

---

## ✨ Funcionalidades Principales

### 🔍 **Sistema de Búsqueda Avanzada**
- **Búsqueda libre por texto** en todos los campos del producto
- **Filtros especializados**:
  - Por categoría de producto
  - Por bodega/fabricante específico
  - Por denominación de origen
  - Por tipo de uva
- **Combinación múltiple** de filtros para búsquedas precisas
- **Resultados dinámicos** que se actualizan en tiempo real

### 🎨 **Organización Visual Matricial**
- **Vista matricial organizada** que simula la disposición física en almacén
- **Función drag-and-drop** para reorganizar productos (solo administradores)
- **Títulos de sección** configurables para estructurar el catálogo
- **Coordinadas visuales** para ubicación precisa de productos
- **Zona de productos sin asignar** para elementos nuevos

### 🛠️ **Gestión Administrativa**
- **CRUD completo** para todos los elementos del catálogo
- **Gestión de taxonomías**: categorías y tipos de uva
- **Modo edición visual** con controles específicos para administradores
- **Validaciones automáticas** para mantener consistencia de datos

---

## 🖥️ Interfaz de Usuario

### 👀 **Experiencia de Visualización**
- **Tarjetas de producto** con información completa y visual
- **Diseño responsive** optimizado para tablets y dispositivos móviles
- **Navegación intuitiva** por categorías desde el menú principal
- **Detalles expandidos** con toda la información técnica y comercial

### ⚡ **Modo Administración**
- **Activación del modo edición** mediante botón específico
- **Controles de arrastre** visibles en cada tarjeta de producto
- **Indicadores de posición** para ubicación precisa en la matriz
- **Formularios de gestión** integrados para edición rápida

---

## 🚀 Guía de Instalación

### 📋 Prerrequisitos Técnicos
- .NET 8 SDK o superior
- SQL Server (LocalDB o instancia completa)
- Visual Studio 2022 o VS Code
- Docker (opcional para contenedores)

---

## 📖 Manual de Uso

### 👤 **Para Personal Comercial (CatalogViewer)**

1. **Acceso al Sistema**
   - Iniciar sesión con credenciales proporcionadas
   - Navegar a "Catálogo" desde el menú principal

2. **Búsqueda de Productos**
   - Utilizar la barra de búsqueda para términos específicos
   - Aplicar filtros por categoría, bodega, origen o tipo de uva
   - Combinar múltiples filtros para búsquedas precisas

3. **Consulta de Información**
   - Revisar detalles completos en cada tarjeta de producto
   - Verificar precios, tamaños, y características técnicas
   - Localizar productos por su posición en la matriz visual

### 🔧 **Para Administradores del Sistema**

1. **Gestión de Productos**
   - Acceder a "Administración" → "Productos"
   - Crear nuevos productos con información completa
   - Editar datos existentes y actualizar precios
   - Eliminar productos descontinuados

2. **Organización del Catálogo**
   - Activar "Modo edición de matriz" en la vista de catálogo
   - Arrastrar productos desde el área de control hasta la posición deseada
   - Crear títulos de sección para estructurar por categorías
   - Gestionar productos sin posición asignada

3. **Mantenimiento de Taxonomías**
   - Administrar categorías de productos desde "Administración" → "Categorías"
   - Gestionar tipos de uva desde "Administración" → "Tipos de uva"
   - Mantener consistencia en denominaciones y clasificaciones

---
