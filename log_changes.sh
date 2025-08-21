#!/bin/bash

# Log de cambios realizados en el backend

# Fecha actual
fecha=$(date "+%Y-%m-%d %H:%M:%S")

# Mensaje del commit, si hay cambios que agregar
echo "----------------------------------------" >> changes.log
echo "Fecha de los cambios: $fecha" >> changes.log

# Registra los archivos modificados desde el último commit
echo "Archivos modificados:" >> changes.log
git status --short | awk '{print $2}' >> changes.log

# Agregar los cambios al área de staging (si es necesario)
git add .

# Realizar commit
echo "Introduzca el mensaje del commit: "
read mensaje_commit
git commit -m "$mensaje_commit"

# Subir los cambios al repositorio remoto
git push origin main

# Escribir el mensaje de commit en el log
echo "Mensaje del commit: $mensaje_commit" >> changes.log
echo "----------------------------------------" >> changes.log
echo "" >> changes.log

# Mostrar el log de cambios
cat changes.log