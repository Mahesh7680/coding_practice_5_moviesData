const express = require("express");
const app = express();
const path = require("path");
app.use(express.json());

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const dbPath = path.join(__dirname, "moviesData.db");
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server running on http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error : ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

module.exports = app;

const convertSnakeCaseIntoCamelCase = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

app.get("/movies/", async (request, response) => {
  const getAllMoviesQuery = `
    SELECT
      movie_name
    FROM
      movie;
    `;
  const responseObj = await db.all(getAllMoviesQuery);
  response.send(
    responseObj.map((each) => {
      convertSnakeCaseIntoCamelCase(each);
    })
  );
});
