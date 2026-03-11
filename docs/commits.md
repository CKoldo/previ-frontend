# Instrucciones para Mensajes de Commit

## Formato Convencional

- Utiliza el formato de [Conventional Commits](https://www.conventionalcommits.org/es/v1.0.0/):
  ```
  tipo(área): mensaje breve
  ```
  Ejemplo:
  ```
  feat(auth): agrega validación de token en login
  fix(survey): corrige error en la fase 2 del formulario
  ```

## Reglas Específicas

- **Tiempo presente:** Escribe el mensaje en tiempo presente.
  - Ejemplo: `refactor(stage): simplifica lógica de agrupación de tareas`
- **Breve y conciso:** Limita el mensaje a una sola línea clara y directa.
- **Propósito del cambio:** Explica el objetivo principal del commit.
- **Referencia de issues:** Si corresponde, incluye el número de issue relacionado.
  - Ejemplo: `fix(ui): ajusta estilos en p-datepicker. Closes #123`
- **Agregar Emoji** Agregale un emoji al final para identificar que tipo de commit corresponde.
- **Idiomar** Dame el commit en español

## Tipos de Commit

- `feat`: Nueva funcionalidad
- `fix`: Corrección de errores
- `docs`: Cambios en documentación
- `style`: Formato, estilos, sin cambios de lógica
- `refactor`: Refactorización de código
- `test`: Agrega o corrige pruebas
- `chore`: Tareas menores, configuración, dependencias

## Ejemplos

```
feat(survey): agrega fase 4 al flujo de encuestas 👧
fix(auth): corrige error de validación en login 👩‍🦰
docs(readme): actualiza instrucciones de instalación 👱‍♂️
refactor(shared): optimiza servicio de fechas 🤶
```

---

¿Necesitas agregar reglas para commits de merge, revert o algún flujo especial? Indícalo para ajustar el documento.
