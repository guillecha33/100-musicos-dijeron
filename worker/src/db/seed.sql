-- ============================================================
-- 100 MÚSICOS DIJERON — Seed inicial (20 preguntas, 5 respuestas c/u)
-- Ejecutar con: wrangler d1 execute 100-musicos-db --file=src/db/seed.sql
-- ============================================================

INSERT INTO questions (id, text, category, is_active) VALUES
  ('q01','Menciona algo que no puede faltar en un concierto','Conciertos',1),
  ('q02','Menciona un instrumento musical que casi todos conocen','Instrumentos',1),
  ('q03','Menciona un género musical que se escucha en fiestas','Géneros',1),
  ('q04','Menciona algo que hace un músico antes de subir al escenario','Artistas',1),
  ('q05','Menciona algo que molesta en un concierto','Conciertos',1),
  ('q06','Menciona un artista o banda mexicana que mucha gente conoce','Artistas',1),
  ('q07','Menciona una razón por la que alguien deja una banda de música','Artistas',1),
  ('q08','Menciona algo que un cantante cuida mucho','Artistas',1),
  ('q09','Menciona algo que se vende en un concierto','Conciertos',1),
  ('q10','Menciona algo que puede salir mal en una presentación musical','Conciertos',1),
  ('q11','Menciona un tipo de lugar donde se presenta música en vivo','Conciertos',1),
  ('q12','Menciona qué lleva la gente a un festival de música','Conciertos',1),
  ('q13','Menciona algo que los fanáticos hacen en un concierto','Conciertos',1),
  ('q14','Menciona un elemento visual típico en el escenario de un gran artista','Conciertos',1),
  ('q15','Menciona algo que hace un músico después de un concierto','Artistas',1),
  ('q16','Menciona un instrumento de percusión','Instrumentos',1),
  ('q17','Menciona algo que caracteriza a la música de los años 80','Historia',1),
  ('q18','Menciona algo que hace un DJ en una fiesta','Artistas',1),
  ('q19','Menciona una razón por la que alguien toma clases de música','Cultura',1),
  ('q20','Menciona algo que define el estilo de un artista musical','Artistas',1);

INSERT INTO answers (id, question_id, text, points, position) VALUES
  -- q01
  ('a01a','q01','Luces / Iluminación',35,1),
  ('a01b','q01','Micrófonos',25,2),
  ('a01c','q01','Bocinas / Amplificadores',20,3),
  ('a01d','q01','Público / Audiencia',12,4),
  ('a01e','q01','Instrumentos musicales',8,5),
  -- q02
  ('a02a','q02','Guitarra',40,1),
  ('a02b','q02','Piano',26,2),
  ('a02c','q02','Batería',18,3),
  ('a02d','q02','Violín',10,4),
  ('a02e','q02','Flauta',6,5),
  -- q03
  ('a03a','q03','Reggaeton',37,1),
  ('a03b','q03','Cumbia',24,2),
  ('a03c','q03','Salsa',18,3),
  ('a03d','q03','Pop',13,4),
  ('a03e','q03','Banda / Norteño',8,5),
  -- q04
  ('a04a','q04','Calentar la voz',30,1),
  ('a04b','q04','Afinar los instrumentos',25,2),
  ('a04c','q04','Concentrarse / Meditar',20,3),
  ('a04d','q04','Rezar',14,4),
  ('a04e','q04','Tomar agua',11,5),
  -- q05
  ('a05a','q05','Gente muy alta adelante',30,1),
  ('a05b','q05','Empujones del público',25,2),
  ('a05c','q05','Personas filmando con el celular',20,3),
  ('a05d','q05','Borrachos ruidosos',15,4),
  ('a05e','q05','Mal sonido / Feedback',10,5),
  -- q06
  ('a06a','q06','Luis Miguel',35,1),
  ('a06b','q06','Juan Gabriel',28,2),
  ('a06c','q06','Maná',20,3),
  ('a06d','q06','Alejandro Fernández',12,4),
  ('a06e','q06','Julieta Venegas',5,5),
  -- q07
  ('a07a','q07','Diferencias musicales',32,1),
  ('a07b','q07','Problemas de dinero',26,2),
  ('a07c','q07','Problemas personales entre miembros',22,3),
  ('a07d','q07','Querer hacer carrera solista',13,4),
  ('a07e','q07','Cansancio / Burnout',7,5),
  -- q08
  ('a08a','q08','La voz',40,1),
  ('a08b','q08','La apariencia física',24,2),
  ('a08c','q08','La alimentación / Dieta',18,3),
  ('a08d','q08','El descanso / Sueño',12,4),
  ('a08e','q08','Su imagen pública',6,5),
  -- q09
  ('a09a','q09','Playeras / Merchandise',35,1),
  ('a09b','q09','Bebidas / Alcohol',27,2),
  ('a09c','q09','Comida',20,3),
  ('a09d','q09','Pósters / Afiches',12,4),
  ('a09e','q09','Acceso VIP',6,5),
  -- q10
  ('a10a','q10','Falla el sonido',32,1),
  ('a10b','q10','Se va la luz',24,2),
  ('a10c','q10','Se rompe una cuerda',20,3),
  ('a10d','q10','Se olvida la letra',15,4),
  ('a10e','q10','Falla el micrófono',9,5),
  -- q11
  ('a11a','q11','Bar o cantina',28,1),
  ('a11b','q11','Teatro',24,2),
  ('a11c','q11','Estadio',22,3),
  ('a11d','q11','Festival al aire libre',18,4),
  ('a11e','q11','Plaza pública',8,5),
  -- q12
  ('a12a','q12','Ropa cómoda',30,1),
  ('a12b','q12','Comida y bebida',25,2),
  ('a12c','q12','Cargador de celular',22,3),
  ('a12d','q12','Silla plegable o cobija',15,4),
  ('a12e','q12','Bloqueador solar',8,5),
  -- q13
  ('a13a','q13','Cantar todas las canciones',38,1),
  ('a13b','q13','Tomar fotos o videos',26,2),
  ('a13c','q13','Gritar el nombre del artista',20,3),
  ('a13d','q13','Llorar de emoción',10,4),
  ('a13e','q13','Bailar sin parar',6,5),
  -- q14
  ('a14a','q14','Pantallas gigantes',36,1),
  ('a14b','q14','Fuegos artificiales / Pirotecnia',26,2),
  ('a14c','q14','Luces láser',22,3),
  ('a14d','q14','Bailarines',11,4),
  ('a14e','q14','Confeti',5,5),
  -- q15
  ('a15a','q15','Firmar autógrafos',30,1),
  ('a15b','q15','Celebrar con el equipo',24,2),
  ('a15c','q15','Descansar',22,3),
  ('a15d','q15','Saludar fans en backstage',16,4),
  ('a15e','q15','Comer algo',8,5),
  -- q16
  ('a16a','q16','Batería',38,1),
  ('a16b','q16','Bongos',24,2),
  ('a16c','q16','Cajón peruano',20,3),
  ('a16d','q16','Xilófono',12,4),
  ('a16e','q16','Maracas',6,5),
  -- q17
  ('a17a','q17','Sintetizadores',30,1),
  ('a17b','q17','Cabello exagerado / Estilo Glam',25,2),
  ('a17c','q17','Casetes',22,3),
  ('a17d','q17','Guitarras eléctricas con distorsión',15,4),
  ('a17e','q17','Baladas románticas',8,5),
  -- q18
  ('a18a','q18','Mezcla la música',34,1),
  ('a18b','q18','Lee el ambiente del público',26,2),
  ('a18c','q18','Pone canciones por petición',20,3),
  ('a18d','q18','Anima a la gente con el micrófono',13,4),
  ('a18e','q18','Controla el volumen y los tiempos',7,5),
  -- q19
  ('a19a','q19','Para aprender a tocar un instrumento',34,1),
  ('a19b','q19','Para mejorar su técnica musical',26,2),
  ('a19c','q19','Como hobby o pasatiempo',20,3),
  ('a19d','q19','Para hacer carrera musical profesional',13,4),
  ('a19e','q19','Para cantar mejor',7,5),
  -- q20
  ('a20a','q20','La ropa y vestuario',32,1),
  ('a20b','q20','La voz o forma de cantar',27,2),
  ('a20c','q20','Los movimientos en el escenario',22,3),
  ('a20d','q20','El tipo de música que hace',13,4),
  ('a20e','q20','El nombre artístico',6,5);
