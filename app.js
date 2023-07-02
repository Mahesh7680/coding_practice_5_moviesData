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

//  get all movie names         API - 1

app.get("/movies/", async (request, response) => {
  const getAllMoviesQuery = `
    SELECT
      movie_name
    FROM
      movie;
    `;
  const responseObj = await db.all(getAllMoviesQuery);
  response.send(responseObj.map((each) => convertSnakeCaseIntoCamelCase(each)));
});

// get one movie name           API - 3

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getAllMoviesQuery = `
    SELECT
      *
    FROM
      movie
    WHERE
      movie_id = ${movieId};
    `;
  const responseObj = await db.run(getAllMoviesQuery);
  response.send(convertSnakeCaseIntoCamelCase(responseObj));
});

//POST MOVIE DETAILS            API - 2

app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const add_new_movie_query = `
    INSERT INTO 
        movie(director_id, movie_name, lead_actor)
    VALUES
    (
        ${directorId},
        '${movieName}',
        '${leadActor}'
    );`;
  const dbResponse = await db.run(add_new_movie_query);
  const movieId = dbResponse.lastId;
  response.send("Movie Successfully Added");
});

// PUT MOVIE DETAILS        API - 4

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const updateMovieQuery = `
  UPDATE
    movie
  SET 
    director_id = ${directorId},
    movie_name = '${movieName}',
    lead_actor = '${leadActor}'
    WHERE
    movie_id = ${movieId};
  `;
  const dbResponse = await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

// DELETE MOVIE         API - 5

app.delete("/movies/:movieId/", (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
      DELETE FROM 
        movie
      WHERE
        movie_id = ${movieId};
    `;
  db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

const convertSnakeCaseToCamelCase = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

//  GET DIRECTOR        API - 6

app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `
    SELECT
      *
    FROM
      director;`;
  const dbResponse = await db.all(getDirectorsQuery);
  response.send(
    dbResponse.map((eachPlayer) => convertSnakeCaseToCamelCase(eachPlayer))
  );
});
