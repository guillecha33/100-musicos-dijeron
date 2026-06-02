-- ============================================================
-- 100 MÚSICOS DIJERON — Preguntas Iniciales (20 preguntas)
-- ============================================================

-- Insertar preguntas y respuestas
DO $$
DECLARE
  q_id UUID;
BEGIN

-- ============================================================
-- PREGUNTA 1: Conciertos
-- ============================================================
INSERT INTO questions (text, category, is_active)
VALUES ('Menciona algo que no puede faltar en un concierto', 'Conciertos', true)
RETURNING id INTO q_id;

INSERT INTO answers (question_id, text, points, position) VALUES
  (q_id, 'Luces / Iluminación', 32, 1),
  (q_id, 'Micrófonos', 24, 2),
  (q_id, 'Bocinas / Amplificadores', 18, 3),
  (q_id, 'Público / Audiencia', 12, 4),
  (q_id, 'Instrumentos musicales', 8, 5),
  (q_id, 'Seguridad', 6, 6);

-- ============================================================
-- PREGUNTA 2: Instrumentos
-- ============================================================
INSERT INTO questions (text, category, is_active)
VALUES ('Menciona un instrumento musical que casi todos conocen', 'Instrumentos', true)
RETURNING id INTO q_id;

INSERT INTO answers (question_id, text, points, position) VALUES
  (q_id, 'Guitarra', 38, 1),
  (q_id, 'Piano', 25, 2),
  (q_id, 'Batería', 17, 3),
  (q_id, 'Violín', 10, 4),
  (q_id, 'Flauta', 6, 5),
  (q_id, 'Trompeta', 4, 6);

-- ============================================================
-- PREGUNTA 3: Géneros
-- ============================================================
INSERT INTO questions (text, category, is_active)
VALUES ('Menciona un género musical que se escucha en fiestas', 'Géneros', true)
RETURNING id INTO q_id;

INSERT INTO answers (question_id, text, points, position) VALUES
  (q_id, 'Reggaeton', 35, 1),
  (q_id, 'Cumbia', 22, 2),
  (q_id, 'Salsa', 18, 3),
  (q_id, 'Pop', 12, 4),
  (q_id, 'Banda / Norteño', 8, 5),
  (q_id, 'Electronic / DJ', 5, 6);

-- ============================================================
-- PREGUNTA 4: Rutina antes del escenario
-- ============================================================
INSERT INTO questions (text, category, is_active)
VALUES ('Menciona algo que hace un músico antes de subir al escenario', 'Artistas', true)
RETURNING id INTO q_id;

INSERT INTO answers (question_id, text, points, position) VALUES
  (q_id, 'Calentar la voz', 28, 1),
  (q_id, 'Afinar los instrumentos', 22, 2),
  (q_id, 'Concentrarse / Meditar', 18, 3),
  (q_id, 'Rezar', 12, 4),
  (q_id, 'Tomar agua', 12, 5),
  (q_id, 'Hacer ejercicios', 8, 6);

-- ============================================================
-- PREGUNTA 5: Molestias en un concierto
-- ============================================================
INSERT INTO questions (text, category, is_active)
VALUES ('Menciona algo que molesta en un concierto', 'Conciertos', true)
RETURNING id INTO q_id;

INSERT INTO answers (question_id, text, points, position) VALUES
  (q_id, 'Gente muy alta adelante', 30, 1),
  (q_id, 'Empujones del público', 25, 2),
  (q_id, 'Personas filmando con el celular', 18, 3),
  (q_id, 'Borrachos ruidosos', 15, 4),
  (q_id, 'Mal sonido / Feedback', 12, 5);

-- ============================================================
-- PREGUNTA 6: Artistas mexicanos
-- ============================================================
INSERT INTO questions (text, category, is_active)
VALUES ('Menciona un artista o banda mexicana que mucha gente conoce', 'Artistas', true)
RETURNING id INTO q_id;

INSERT INTO answers (question_id, text, points, position) VALUES
  (q_id, 'Luis Miguel', 32, 1),
  (q_id, 'Juan Gabriel', 28, 2),
  (q_id, 'Maná', 18, 3),
  (q_id, 'Alejandro Fernández', 12, 4),
  (q_id, 'Julieta Venegas', 10, 5);

-- ============================================================
-- PREGUNTA 7: Razones para dejar una banda
-- ============================================================
INSERT INTO questions (text, category, is_active)
VALUES ('Menciona una razón por la que alguien deja una banda de música', 'Artistas', true)
RETURNING id INTO q_id;

INSERT INTO answers (question_id, text, points, position) VALUES
  (q_id, 'Diferencias musicales', 30, 1),
  (q_id, 'Problemas de dinero', 25, 2),
  (q_id, 'Problemas personales entre miembros', 22, 3),
  (q_id, 'Querer hacer carrera solista', 15, 4),
  (q_id, 'Cansancio / Burnout', 8, 5);

-- ============================================================
-- PREGUNTA 8: Lo que cuida un cantante
-- ============================================================
INSERT INTO questions (text, category, is_active)
VALUES ('Menciona algo que un cantante cuida mucho', 'Artistas', true)
RETURNING id INTO q_id;

INSERT INTO answers (question_id, text, points, position) VALUES
  (q_id, 'La voz', 40, 1),
  (q_id, 'La apariencia física', 22, 2),
  (q_id, 'La alimentación / Dieta', 18, 3),
  (q_id, 'El descanso / Sueño', 12, 4),
  (q_id, 'Su imagen pública', 8, 5);

-- ============================================================
-- PREGUNTA 9: Lo que se vende en un concierto
-- ============================================================
INSERT INTO questions (text, category, is_active)
VALUES ('Menciona algo que se vende en un concierto', 'Conciertos', true)
RETURNING id INTO q_id;

INSERT INTO answers (question_id, text, points, position) VALUES
  (q_id, 'Playeras / Merchandise', 32, 1),
  (q_id, 'Bebidas / Alcohol', 25, 2),
  (q_id, 'Comida', 18, 3),
  (q_id, 'Pósters / Afiches', 12, 4),
  (q_id, 'Acceso VIP', 8, 5),
  (q_id, 'Llaveros / Pines', 5, 6);

-- ============================================================
-- PREGUNTA 10: Qué puede salir mal
-- ============================================================
INSERT INTO questions (text, category, is_active)
VALUES ('Menciona algo que puede salir mal en una presentación musical', 'Conciertos', true)
RETURNING id INTO q_id;

INSERT INTO answers (question_id, text, points, position) VALUES
  (q_id, 'Falla el sonido', 30, 1),
  (q_id, 'Se va la luz', 22, 2),
  (q_id, 'Se rompe una cuerda', 18, 3),
  (q_id, 'Se olvida la letra', 15, 4),
  (q_id, 'Falla el micrófono', 10, 5),
  (q_id, 'Casi nadie llega al show', 5, 6);

-- ============================================================
-- PREGUNTA 11: Lugares de música en vivo
-- ============================================================
INSERT INTO questions (text, category, is_active)
VALUES ('Menciona un tipo de lugar donde se presenta música en vivo', 'Conciertos', true)
RETURNING id INTO q_id;

INSERT INTO answers (question_id, text, points, position) VALUES
  (q_id, 'Bar o cantina', 28, 1),
  (q_id, 'Teatro', 22, 2),
  (q_id, 'Estadio', 20, 3),
  (q_id, 'Festival al aire libre', 18, 4),
  (q_id, 'Plaza pública', 12, 5);

-- ============================================================
-- PREGUNTA 12: Qué llevar a un festival
-- ============================================================
INSERT INTO questions (text, category, is_active)
VALUES ('Menciona qué lleva la gente a un festival de música', 'Conciertos', true)
RETURNING id INTO q_id;

INSERT INTO answers (question_id, text, points, position) VALUES
  (q_id, 'Ropa cómoda', 28, 1),
  (q_id, 'Comida y bebida', 22, 2),
  (q_id, 'Cargador de celular', 20, 3),
  (q_id, 'Silla plegable o cobija', 18, 4),
  (q_id, 'Bloqueador solar', 12, 5);

-- ============================================================
-- PREGUNTA 13: Lo que hacen los fans
-- ============================================================
INSERT INTO questions (text, category, is_active)
VALUES ('Menciona algo que los fanáticos hacen en un concierto', 'Conciertos', true)
RETURNING id INTO q_id;

INSERT INTO answers (question_id, text, points, position) VALUES
  (q_id, 'Cantar todas las canciones', 35, 1),
  (q_id, 'Tomar fotos o videos', 25, 2),
  (q_id, 'Gritar el nombre del artista', 20, 3),
  (q_id, 'Llorar de emoción', 12, 4),
  (q_id, 'Bailar sin parar', 8, 5);

-- ============================================================
-- PREGUNTA 14: Elementos visuales del escenario
-- ============================================================
INSERT INTO questions (text, category, is_active)
VALUES ('Menciona un elemento visual típico en el escenario de un gran artista', 'Conciertos', true)
RETURNING id INTO q_id;

INSERT INTO answers (question_id, text, points, position) VALUES
  (q_id, 'Pantallas gigantes', 34, 1),
  (q_id, 'Fuegos artificiales / Pirotecnia', 25, 2),
  (q_id, 'Luces láser', 22, 3),
  (q_id, 'Bailarines', 12, 4),
  (q_id, 'Confeti', 7, 5);

-- ============================================================
-- PREGUNTA 15: Después del concierto
-- ============================================================
INSERT INTO questions (text, category, is_active)
VALUES ('Menciona algo que hace un músico después de un concierto', 'Artistas', true)
RETURNING id INTO q_id;

INSERT INTO answers (question_id, text, points, position) VALUES
  (q_id, 'Firmar autógrafos', 28, 1),
  (q_id, 'Celebrar con el equipo', 22, 2),
  (q_id, 'Descansar', 20, 3),
  (q_id, 'Saludar fans en backstage', 18, 4),
  (q_id, 'Comer algo', 12, 5);

-- ============================================================
-- PREGUNTA 16: Instrumentos de percusión
-- ============================================================
INSERT INTO questions (text, category, is_active)
VALUES ('Menciona un instrumento de percusión', 'Instrumentos', true)
RETURNING id INTO q_id;

INSERT INTO answers (question_id, text, points, position) VALUES
  (q_id, 'Batería', 35, 1),
  (q_id, 'Bongos', 22, 2),
  (q_id, 'Cajón peruano', 18, 3),
  (q_id, 'Xilófono', 12, 4),
  (q_id, 'Maracas', 8, 5),
  (q_id, 'Pandero', 5, 6);

-- ============================================================
-- PREGUNTA 17: Música de los 80s
-- ============================================================
INSERT INTO questions (text, category, is_active)
VALUES ('Menciona algo que caracteriza a la música de los años 80', 'Historia', true)
RETURNING id INTO q_id;

INSERT INTO answers (question_id, text, points, position) VALUES
  (q_id, 'Sintetizadores', 30, 1),
  (q_id, 'Cabello exagerado / Estilo Glam', 22, 2),
  (q_id, 'Casetes', 20, 3),
  (q_id, 'Guitarras eléctricas con distorsión', 15, 4),
  (q_id, 'Baladas románticas', 13, 5);

-- ============================================================
-- PREGUNTA 18: Lo que hace un DJ
-- ============================================================
INSERT INTO questions (text, category, is_active)
VALUES ('Menciona algo que hace un DJ en una fiesta', 'Artistas', true)
RETURNING id INTO q_id;

INSERT INTO answers (question_id, text, points, position) VALUES
  (q_id, 'Mezcla la música', 32, 1),
  (q_id, 'Lee el ambiente del público', 24, 2),
  (q_id, 'Pone canciones por petición', 18, 3),
  (q_id, 'Anima a la gente con el micrófono', 15, 4),
  (q_id, 'Controla el volumen y los tiempos', 11, 5);

-- ============================================================
-- PREGUNTA 19: Por qué tomar clases de música
-- ============================================================
INSERT INTO questions (text, category, is_active)
VALUES ('Menciona una razón por la que alguien empieza a tomar clases de música', 'Cultura', true)
RETURNING id INTO q_id;

INSERT INTO answers (question_id, text, points, position) VALUES
  (q_id, 'Para aprender a tocar un instrumento', 32, 1),
  (q_id, 'Para mejorar su técnica musical', 24, 2),
  (q_id, 'Como hobby o pasatiempo', 18, 3),
  (q_id, 'Para hacer carrera musical profesional', 15, 4),
  (q_id, 'Para cantar mejor', 11, 5);

-- ============================================================
-- PREGUNTA 20: El estilo de un artista
-- ============================================================
INSERT INTO questions (text, category, is_active)
VALUES ('Menciona algo que define el estilo de un artista musical', 'Artistas', true)
RETURNING id INTO q_id;

INSERT INTO answers (question_id, text, points, position) VALUES
  (q_id, 'La ropa y vestuario', 30, 1),
  (q_id, 'La voz o forma de cantar', 25, 2),
  (q_id, 'Los movimientos en el escenario', 20, 3),
  (q_id, 'El tipo de música que hace', 15, 4),
  (q_id, 'El nombre artístico', 10, 5);

END $$;
