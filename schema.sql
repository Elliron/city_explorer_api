DROP TABLE IF EXISTS imatable;

CREATE TABLE imatable(
id SERIAL PRIMARY KEY,
search_query VARCHAR(255),
formatted_query VARCHAR(255),
latitude DECIMAL(9, 7),
longitude DECIMAL(9, 7)
)