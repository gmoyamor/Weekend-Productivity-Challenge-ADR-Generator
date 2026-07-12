# Requirements Document

## Introduction

Herramienta de productividad personal impulsada por IA para generar Architecture Decision Records (ADRs) de forma rápida e intuitiva. El usuario proporciona una descripción breve del contexto y la decisión arquitectónica, y el sistema genera un ADR completo en formato markdown utilizando Amazon Bedrock. Diseñado para ser construido en un fin de semana como parte del AWS Builder Center Weekend Productivity Challenge (Julio 10-13, 2026).

**Stack tecnológico:** Next.js en AWS Amplify, Lambda + API Gateway, Amazon Bedrock (Nova o Claude), S3 para almacenamiento de archivos markdown.

## Glossary

- **ADR_Generator**: Sistema web que genera Architecture Decision Records usando inteligencia artificial. Es una herramienta personal de un solo u suario, sin autenticación
- **ADR**: Architecture Decision Record — documento markdown que registra una decisión arquitectónica, su contexto, alternativas consideradas y consecuencias
- **Usuario**: Desarrollador o arquitecto que utiliza la herramienta para documentar decisiones arquitectónicas
- **AI_Service**: Servicio backend que invoca Amazon Bedrock para generar el contenido del ADR
- **ADR_Store**: Servicio de almacenamiento en S3 donde se persisten los ADRs generados en formato markdown. No hay separación por usuario ya que es una herramienta personal
- **Formulario_de_Entrada**: Interfaz donde el usuario proporciona el contexto y parámetros para generar un ADR
- **Nivel_de_Detalle**: Parámetro que controla la extensión del ADR generado. Valores posibles: Breve (ADR conciso, ~1 párrafo por sección, ideal para decisiones simples), Estándar (ADR con contexto completo, 2-3 alternativas bien explicadas — valor por defecto), Detallado (ADR extenso con análisis profundo de alternativas, trade-offs y referencias)
- **Modal_de_Confirmación**: Diálogo que solicita confirmación explícita del usuario antes de ejecutar una acción destructiva, con opciones de confirmar o cancelar

## Requirements

### Requirement 1: Generar un ADR mediante IA

**User Story:** Como usuario, quiero generar un ADR completo a partir de una descripción breve de mi decisión arquitectónica, para documentar decisiones de forma rápida sin escribir todo manualmente.

#### Acceptance Criteria

1. WHEN el Usuario envía el Formulario_de_Entrada con un título y descripción del contexto, THE AI_Service SHALL generar un ADR completo en un máximo de 30 segundos que incluya las secciones: Título, Fecha (fecha actual de generación), Estado (valor inicial "Propuesto"), Contexto, Decisión, Alternativas Consideradas (mínimo 2 alternativas) y Consecuencias
2. WHEN el AI_Service genera un ADR exitosamente, THE ADR_Generator SHALL mostrar el ADR generado al Usuario renderizado como markdown con sus secciones claramente separadas
3. WHEN el AI_Service genera un ADR exitosamente, THE ADR_Store SHALL persistir el ADR como archivo markdown en S3 y THE ADR_Generator SHALL mostrar una confirmación de guardado al Usuario
4. IF el AI_Service no puede generar el ADR por un error de servicio, THEN THE ADR_Generator SHALL mostrar un mensaje de error al Usuario indicando que la generación falló y sugiriendo reintentar la solicitud
5. THE Formulario_de_Entrada SHALL requerir un título (mínimo 5 caracteres, máximo 100 caracteres) y una descripción del contexto (mínimo 20 caracteres, máximo 2000 caracteres) para enviar la solicitud
6. IF el ADR_Store no puede persistir el archivo en S3 después de una generación exitosa, THEN THE ADR_Generator SHALL mostrar el ADR generado al Usuario con un mensaje de error indicando que el guardado falló y ofreciendo la opción de reintentar el guardado

### Requirement 2: Listar ADRs generados

**User Story:** Como usuario, quiero ver una lista de todos mis ADRs generados previamente, para poder consultar decisiones arquitectónicas anteriores.

#### Acceptance Criteria

1. WHEN el Usuario accede a la vista de listado, THE ADR_Generator SHALL mostrar todos los ADRs almacenados ordenados por fecha de creación descendente
2. THE ADR_Generator SHALL mostrar para cada ADR en la lista: título, fecha de creación en formato "DD/MM/YYYY" y estado (valores posibles: Propuesto, Aceptado, Deprecado, Reemplazado)
3. WHEN el Usuario selecciona un ADR de la lista, THE ADR_Generator SHALL mostrar el contenido completo del ADR con el markdown renderizado como texto formateado
4. WHILE no existan ADRs almacenados, THE ADR_Generator SHALL mostrar un mensaje indicando que no hay ADRs y un enlace para crear el primer ADR
5. IF el ADR_Generator no puede recuperar la lista de ADRs del ADR_Store, THEN THE ADR_Generator SHALL mostrar un mensaje de error indicando que no se pudo cargar la lista y ofrecer la opción de reintentar

### Requirement 3: Descargar ADR como archivo markdown

**User Story:** Como usuario, quiero descargar un ADR individual como archivo markdown, para poder integrarlo en mi repositorio de documentación.

#### Acceptance Criteria

1. WHEN el Usuario solicita la descarga de un ADR, THE ADR_Generator SHALL generar un archivo markdown con el contenido completo del ADR incluyendo todas las secciones (Título, Fecha, Estado, Contexto, Decisión, Alternativas Consideradas y Consecuencias)
2. THE ADR_Generator SHALL nombrar el archivo descargado con el formato: `NNN-titulo-en-kebab-case.md` donde NNN es el número secuencial del ADR con 3 dígitos rellenados con ceros (001, 002, ...), y el título convertido a kebab-case con un máximo de 50 caracteres (truncado sin cortar palabras), eliminando caracteres especiales y acentos
3. WHEN el Usuario descarga el ADR, THE ADR_Generator SHALL incluir front matter YAML al inicio del archivo con exactamente los campos: título, fecha de creación y estado del ADR. IF la generación del front matter falla pero el contenido del ADR se genera correctamente, THEN THE ADR_Generator SHALL completar la descarga sin front matter
4. IF la descarga del archivo falla por un error de red o de servicio, THEN THE ADR_Generator SHALL mostrar un mensaje de error al Usuario indicando que la descarga no pudo completarse

### Requirement 4: Personalizar parámetros de generación

**User Story:** Como usuario, quiero poder ajustar parámetros opcionales antes de generar un ADR, para que el resultado se adapte mejor a mi contexto específico.

#### Acceptance Criteria

1. THE Formulario_de_Entrada SHALL ofrecer campos opcionales para: stack tecnológico (máximo 200 caracteres), restricciones conocidas (máximo 500 caracteres) y Nivel_de_Detalle
2. THE Formulario_de_Entrada SHALL mostrar una descripción visible de cada Nivel_de_Detalle (Breve: conciso ~1 párrafo por sección; Estándar: contexto completo con 2-3 alternativas; Detallado: análisis profundo con trade-offs y referencias) y SHALL pre-seleccionar Estándar como valor por defecto
3. WHEN el Usuario especifica stack tecnológico o restricciones conocidas, THE AI_Service SHALL generar un ADR cuyo contenido haga referencia explícita al stack o restricciones proporcionados en las secciones de Contexto o Alternativas Consideradas. IF el campo de restricciones está vacío, THE AI_Service SHALL incluir la indicación "Sin restricciones específicas" en la sección correspondiente. THE ADR_Generator SHALL aceptar cualquier output del AI_Service sin validar si las referencias fueron incorporadas adecuadamente
4. IF el Usuario no proporciona parámetros opcionales, THEN THE AI_Service SHALL generar el ADR utilizando Nivel_de_Detalle Estándar y sin restricciones adicionales
5. IF el Usuario ingresa solo espacios en blanco en un campo opcional, THEN THE Formulario_de_Entrada SHALL tratar ese campo como vacío y no enviarlo al AI_Service

### Requirement 5: Interfaz simple e intuitiva

**User Story:** Como usuario, quiero una interfaz limpia y fácil de usar, para poder generar ADRs sin fricción y en pocos pasos.

#### Acceptance Criteria

1. THE ADR_Generator SHALL presentar un acceso directo al Formulario_de_Entrada visible en la página de inicio sin necesidad de scroll, accesible en un solo clic
2. THE ADR_Generator SHALL mostrar una navegación persistente visible en todas las vistas que permita acceder a la vista de generación y a la vista de listado de ADRs sin necesidad de scroll
3. WHILE el AI_Service está procesando una solicitud, THE ADR_Generator SHALL mostrar un indicador de carga visible al Usuario que incluya una referencia de tiempo transcurrido desde el inicio de la solicitud
4. IF el AI_Service no responde dentro de 30 segundos, THEN THE ADR_Generator SHALL mostrar un mensaje de error indicando que la solicitud excedió el tiempo de espera y permitir al Usuario reintentar
5. THE ADR_Generator SHALL ser responsivo, garantizando que todos los elementos interactivos sean operables y el contenido legible sin scroll horizontal en viewports desde 768px de ancho en adelante

### Requirement 6: Eliminar un ADR

**User Story:** Como usuario, quiero poder eliminar un ADR que ya no sea relevante, para mantener mi lista de decisiones organizada.

#### Acceptance Criteria

1. WHEN el Usuario solicita eliminar un ADR, THE ADR_Generator SHALL mostrar un Modal_de_Confirmación que incluya el título del ADR a eliminar y las opciones de confirmar o cancelar
2. WHEN el Usuario confirma la eliminación en el Modal_de_Confirmación, THE ADR_Generator SHALL mantener el modal abierto mostrando un estado de procesamiento hasta que la eliminación se complete, THEN THE ADR_Store SHALL eliminar permanentemente el archivo markdown de S3 y THE ADR_Generator SHALL cerrar el modal
3. WHEN el Usuario cancela la eliminación en el Modal_de_Confirmación, THE ADR_Generator SHALL cerrar el modal sin realizar cambios
4. WHEN el ADR es eliminado exitosamente, THE ADR_Generator SHALL actualizar la lista removiendo el ADR eliminado y mostrar una confirmación visual de la eliminación exitosa durante al menos 3 segundos
5. IF la eliminación del ADR falla por un error de servicio, THEN THE ADR_Generator SHALL mostrar un mensaje de error indicando que la eliminación no se completó y mantener el ADR en la lista sin modificaciones
