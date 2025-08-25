# Football API ⚽️

Proyecto fullstack para gestionar jugadores de fútbol (NestJS + Angular + MySQL).

---

## 🚀 Pasos para correr con Docker

1. **Instalar Docker Desktop:**  
   Asegurate de tener Docker y Docker Compose instalados.

2. **Clonar el repositorio:**
   ```bash
   git clone <git@github.com:wenceaguirre/football-api.git>
   cd football-api
   ```

3. **Configurar variables de entorno:**  
   Copiá el archivo de ejemplo `.env.sample` a `.env`:
   ```bash
   cp .env.sample .env
   ```

4. **Levantar los servicios con Docker Compose:**
   ```bash
   docker compose up -d
   ```

5. **Verificar que los contenedores estén corriendo:**
   ```bash
   docker ps
   ```

Con esto, se levantara todo el proyecto 

---

## 🔄 Reiniciar los datos
Si querés borrar la base de datos y recrearla desde cero:
```bash
docker compose down -v   # Elimina contenedores y volúmenes
docker compose up -d     # Recrea todo, incluyendo la DB desde init.sql
```

---

## 🗄️ Conectarse a MySQL
Podés conectarte manualmente al contenedor de la base de datos:

```bash
mysql -h 127.0.0.1 -P 3306 --user=football_api --password=admin
```

Comandos útiles:
```sql
SHOW TABLES;
SELECT * FROM users;
exit;
```

---

## 📖 Documentación de la API
Una vez corriendo el backend, accedé a Swagger en:  
👉 [http://localhost:3000/api/docs](http://localhost:3000/api/docs)

---

## Para iniciar sesion podes crear una cuenta nueva o ingresar con este usuario:
```
email: wence@XAcademy.dev
contraseña: admin123

```

---

## ⚠️ Errores conocidos

- **Paginación en el frontend:** al importar datos, la lista no siempre reinicia en la página 1.  
- **Carga de imágenes de jugadores:** las URLs de imágenes se guardan en DB, pero no se renderizan correctamente en la vista del frontend.

---

## 👨‍💻 Autor **Wenceslao Aguirre**
