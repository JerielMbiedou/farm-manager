-- =====================================================================
-- Sauvegarde des données LEGACY de production avant migration P9
-- Générée le 2026-05-02T21:24:46.230Z par lecture directe de la prod
-- Tables: depenses_batiment, depenses_puits, devis_construction, puits_items_devis, sorties_argent, sorties_carburant
-- =====================================================================
-- Pour restaurer ces données dans une base vide PostgreSQL:
--   1. Recréer les tables (voir DDL en commentaire ci-dessous)
--   2. psql $DATABASE_URL -f ce-fichier.sql
-- =====================================================================

-- ===== depenses_batiment (87 lignes) =====
-- Colonnes:
--   id integer
--   designation text
--   quantite numeric
--   prix_unitaire numeric
--   categorie text
--   date date
--   commentaire text
INSERT INTO depenses_batiment (id, designation, quantite, prix_unitaire, categorie, date, commentaire) VALUES (1, 'Achats de planches', 1, 400000, 'materiaux', NULL, NULL);
INSERT INTO depenses_batiment (id, designation, quantite, prix_unitaire, categorie, date, commentaire) VALUES (2, 'Défrichage', 1, 25000, 'main_oeuvre', NULL, NULL);
INSERT INTO depenses_batiment (id, designation, quantite, prix_unitaire, categorie, date, commentaire) VALUES (3, 'Creusage fouille bâtiment principal', 1, 25000, 'main_oeuvre', NULL, NULL);
INSERT INTO depenses_batiment (id, designation, quantite, prix_unitaire, categorie, date, commentaire) VALUES (4, 'Devis bâtiment', 1, 10000, 'divers', NULL, NULL);
INSERT INTO depenses_batiment (id, designation, quantite, prix_unitaire, categorie, date, commentaire) VALUES (5, 'Tonnes de graviers 5/15', 21, 7500, 'materiaux', NULL, NULL);
INSERT INTO depenses_batiment (id, designation, quantite, prix_unitaire, categorie, date, commentaire) VALUES (6, 'Tonnes de sable carrière', 22, 5500, 'materiaux', NULL, NULL);
INSERT INTO depenses_batiment (id, designation, quantite, prix_unitaire, categorie, date, commentaire) VALUES (7, 'Transports sables + Taxe', 1, 40000, 'transport', NULL, NULL);
INSERT INTO depenses_batiment (id, designation, quantite, prix_unitaire, categorie, date, commentaire) VALUES (8, 'Transports graviers + Taxe', 1, 40000, 'transport', NULL, NULL);
INSERT INTO depenses_batiment (id, designation, quantite, prix_unitaire, categorie, date, commentaire) VALUES (9, 'Carburant', 1, 15000, 'carburant', NULL, NULL);
INSERT INTO depenses_batiment (id, designation, quantite, prix_unitaire, categorie, date, commentaire) VALUES (10, 'Boissons', 1, 3700, 'divers', NULL, NULL);
INSERT INTO depenses_batiment (id, designation, quantite, prix_unitaire, categorie, date, commentaire) VALUES (11, 'Coupage de bois', 1, 35000, 'materiaux', NULL, NULL);
INSERT INTO depenses_batiment (id, designation, quantite, prix_unitaire, categorie, date, commentaire) VALUES (12, 'Creusage fouille annexe', 1, 15000, 'main_oeuvre', NULL, NULL);
INSERT INTO depenses_batiment (id, designation, quantite, prix_unitaire, categorie, date, commentaire) VALUES (13, 'Location chambre pour le matériel (1 mois)', 1, 5000, 'divers', NULL, NULL);
INSERT INTO depenses_batiment (id, designation, quantite, prix_unitaire, categorie, date, commentaire) VALUES (14, 'Cubitainer d''eau', 1, 5000, 'divers', NULL, NULL);
INSERT INTO depenses_batiment (id, designation, quantite, prix_unitaire, categorie, date, commentaire) VALUES (15, 'Location cubitainer d''eau', 1, 2500, 'divers', NULL, NULL);
INSERT INTO depenses_batiment (id, designation, quantite, prix_unitaire, categorie, date, commentaire) VALUES (16, 'Dédommagement découpage arbre', 1, 5000, 'divers', NULL, NULL);
INSERT INTO depenses_batiment (id, designation, quantite, prix_unitaire, categorie, date, commentaire) VALUES (17, 'Carburant', 1, 15000, 'carburant', NULL, NULL);
INSERT INTO depenses_batiment (id, designation, quantite, prix_unitaire, categorie, date, commentaire) VALUES (18, 'Matériaux de construction (divers)', 1, 115000, 'materiaux', NULL, NULL);
INSERT INTO depenses_batiment (id, designation, quantite, prix_unitaire, categorie, date, commentaire) VALUES (19, 'Avance matériaux de construction', 1, 100000, 'materiaux', NULL, NULL);
INSERT INTO depenses_batiment (id, designation, quantite, prix_unitaire, categorie, date, commentaire) VALUES (20, 'Carburant', 1, 10000, 'carburant', NULL, NULL);
INSERT INTO depenses_batiment (id, designation, quantite, prix_unitaire, categorie, date, commentaire) VALUES (21, 'Sac de ciment', 4, 5100, 'materiaux', NULL, NULL);
INSERT INTO depenses_batiment (id, designation, quantite, prix_unitaire, categorie, date, commentaire) VALUES (22, 'Barres de fer de 6 + barres de fer de 8', 1, 9000, 'materiaux', NULL, NULL);
INSERT INTO depenses_batiment (id, designation, quantite, prix_unitaire, categorie, date, commentaire) VALUES (23, 'Parpaings', 40, 200, 'materiaux', NULL, NULL);
INSERT INTO depenses_batiment (id, designation, quantite, prix_unitaire, categorie, date, commentaire) VALUES (24, 'Solde parpaings', 1, 15000, 'materiaux', NULL, NULL);
INSERT INTO depenses_batiment (id, designation, quantite, prix_unitaire, categorie, date, commentaire) VALUES (25, 'Main-d''œuvre', 1, 13000, 'main_oeuvre', NULL, NULL);
INSERT INTO depenses_batiment (id, designation, quantite, prix_unitaire, categorie, date, commentaire) VALUES (26, 'Déjeuner', 1, 1000, 'divers', NULL, NULL);
INSERT INTO depenses_batiment (id, designation, quantite, prix_unitaire, categorie, date, commentaire) VALUES (27, 'Garage (réparation véhicule)', 1, 5000, 'transport', NULL, NULL);
INSERT INTO depenses_batiment (id, designation, quantite, prix_unitaire, categorie, date, commentaire) VALUES (28, 'Sac de ciment', 2, 5200, 'materiaux', NULL, NULL);
INSERT INTO depenses_batiment (id, designation, quantite, prix_unitaire, categorie, date, commentaire) VALUES (29, 'Location chambre', 1, 5000, 'divers', NULL, NULL);
INSERT INTO depenses_batiment (id, designation, quantite, prix_unitaire, categorie, date, commentaire) VALUES (30, 'Carburant', 1, 5000, 'carburant', NULL, NULL);
INSERT INTO depenses_batiment (id, designation, quantite, prix_unitaire, categorie, date, commentaire) VALUES (31, 'Déjeuner', 1, 1000, 'divers', NULL, NULL);
INSERT INTO depenses_batiment (id, designation, quantite, prix_unitaire, categorie, date, commentaire) VALUES (32, 'Main-d''œuvre', 1, 10000, 'main_oeuvre', NULL, NULL);
INSERT INTO depenses_batiment (id, designation, quantite, prix_unitaire, categorie, date, commentaire) VALUES (33, 'Parpaings', 100, 200, 'materiaux', NULL, NULL);
INSERT INTO depenses_batiment (id, designation, quantite, prix_unitaire, categorie, date, commentaire) VALUES (34, 'Parpaings', 400, 225, 'materiaux', NULL, NULL);
INSERT INTO depenses_batiment (id, designation, quantite, prix_unitaire, categorie, date, commentaire) VALUES (35, 'Fers de 8', 6, 2900, 'materiaux', NULL, NULL);
INSERT INTO depenses_batiment (id, designation, quantite, prix_unitaire, categorie, date, commentaire) VALUES (36, 'Sacs de ciment', 4, 5100, 'materiaux', NULL, NULL);
INSERT INTO depenses_batiment (id, designation, quantite, prix_unitaire, categorie, date, commentaire) VALUES (37, 'pelle ronde', 1, 2250, 'divers', NULL, NULL);
INSERT INTO depenses_batiment (id, designation, quantite, prix_unitaire, categorie, date, commentaire) VALUES (38, 'Fil d''attache', 1, 2100, 'materiaux', NULL, NULL);
INSERT INTO depenses_batiment (id, designation, quantite, prix_unitaire, categorie, date, commentaire) VALUES (39, 'Cadres + étriers', 1, 10000, 'materiaux', NULL, NULL);
INSERT INTO depenses_batiment (id, designation, quantite, prix_unitaire, categorie, date, commentaire) VALUES (40, 'Main-d''œuvre', 1, 13000, 'main_oeuvre', NULL, NULL);
INSERT INTO depenses_batiment (id, designation, quantite, prix_unitaire, categorie, date, commentaire) VALUES (41, 'Déjeuner', 1, 2000, 'divers', NULL, NULL);
INSERT INTO depenses_batiment (id, designation, quantite, prix_unitaire, categorie, date, commentaire) VALUES (43, 'Fers de 8', 3, 2850, 'materiaux', NULL, NULL);
INSERT INTO depenses_batiment (id, designation, quantite, prix_unitaire, categorie, date, commentaire) VALUES (44, 'Sacs de ciment', 3, 5100, 'materiaux', NULL, NULL);
INSERT INTO depenses_batiment (id, designation, quantite, prix_unitaire, categorie, date, commentaire) VALUES (45, 'Main-d''œuvre', 1, 10000, 'main_oeuvre', NULL, NULL);
INSERT INTO depenses_batiment (id, designation, quantite, prix_unitaire, categorie, date, commentaire) VALUES (46, 'Déjeuner', 1, 1500, 'divers', NULL, NULL);
INSERT INTO depenses_batiment (id, designation, quantite, prix_unitaire, categorie, date, commentaire) VALUES (47, '2e versement eau', 1, 5000, 'divers', NULL, NULL);
INSERT INTO depenses_batiment (id, designation, quantite, prix_unitaire, categorie, date, commentaire) VALUES (48, 'Sacs de ciment', 3, 5200, 'materiaux', NULL, NULL);
INSERT INTO depenses_batiment (id, designation, quantite, prix_unitaire, categorie, date, commentaire) VALUES (49, 'Fer de 8', 1, 2900, 'materiaux', NULL, NULL);
INSERT INTO depenses_batiment (id, designation, quantite, prix_unitaire, categorie, date, commentaire) VALUES (50, 'Fer de 6', 1, 1600, 'materiaux', NULL, NULL);
INSERT INTO depenses_batiment (id, designation, quantite, prix_unitaire, categorie, date, commentaire) VALUES (51, 'Manche de pioche', 1, 250, 'divers', NULL, NULL);
INSERT INTO depenses_batiment (id, designation, quantite, prix_unitaire, categorie, date, commentaire) VALUES (52, 'Main-d''œuvre', 1, 10000, 'main_oeuvre', NULL, NULL);
INSERT INTO depenses_batiment (id, designation, quantite, prix_unitaire, categorie, date, commentaire) VALUES (54, 'Sac de ciment', 1, 5300, 'materiaux', NULL, NULL);
INSERT INTO depenses_batiment (id, designation, quantite, prix_unitaire, categorie, date, commentaire) VALUES (55, 'Main-d''œuvre', 1, 13000, 'main_oeuvre', NULL, NULL);
INSERT INTO depenses_batiment (id, designation, quantite, prix_unitaire, categorie, date, commentaire) VALUES (56, 'Parpaings de 12', 1, 30000, 'materiaux', NULL, NULL);
INSERT INTO depenses_batiment (id, designation, quantite, prix_unitaire, categorie, date, commentaire) VALUES (57, 'Carburant', 1, 5000, 'carburant', NULL, NULL);
INSERT INTO depenses_batiment (id, designation, quantite, prix_unitaire, categorie, date, commentaire) VALUES (58, 'Déjeuner', 1, 2000, 'divers', NULL, NULL);
INSERT INTO depenses_batiment (id, designation, quantite, prix_unitaire, categorie, date, commentaire) VALUES (59, 'Sacs de ciment', 2, 5200, 'materiaux', NULL, NULL);
INSERT INTO depenses_batiment (id, designation, quantite, prix_unitaire, categorie, date, commentaire) VALUES (60, 'Main-d''œuvre', 1, 10000, 'main_oeuvre', NULL, NULL);
INSERT INTO depenses_batiment (id, designation, quantite, prix_unitaire, categorie, date, commentaire) VALUES (61, 'Déjeuner', 1, 1500, 'divers', NULL, NULL);
INSERT INTO depenses_batiment (id, designation, quantite, prix_unitaire, categorie, date, commentaire) VALUES (62, 'Transport', 1, 1500, 'transport', NULL, NULL);
INSERT INTO depenses_batiment (id, designation, quantite, prix_unitaire, categorie, date, commentaire) VALUES (63, 'Ciment', 4, 5200, 'materiaux', NULL, NULL);
INSERT INTO depenses_batiment (id, designation, quantite, prix_unitaire, categorie, date, commentaire) VALUES (64, 'Parpaings', 400, 225, 'materiaux', NULL, NULL);
INSERT INTO depenses_batiment (id, designation, quantite, prix_unitaire, categorie, date, commentaire) VALUES (65, 'Main-d''œuvre', 1, 10000, 'main_oeuvre', NULL, NULL);
INSERT INTO depenses_batiment (id, designation, quantite, prix_unitaire, categorie, date, commentaire) VALUES (66, 'Fers de 8', 5, 27400, 'materiaux', NULL, NULL);
INSERT INTO depenses_batiment (id, designation, quantite, prix_unitaire, categorie, date, commentaire) VALUES (67, 'Main-d''œuvre', 1, 10000, 'main_oeuvre', NULL, NULL);
INSERT INTO depenses_batiment (id, designation, quantite, prix_unitaire, categorie, date, commentaire) VALUES (69, 'Dépense + transport', 1, 3000, 'transport', NULL, NULL);
INSERT INTO depenses_batiment (id, designation, quantite, prix_unitaire, categorie, date, commentaire) VALUES (70, 'Fers de 8', 6, 2900, 'materiaux', NULL, NULL);
INSERT INTO depenses_batiment (id, designation, quantite, prix_unitaire, categorie, date, commentaire) VALUES (71, 'Fer de 6', 1, 1500, 'materiaux', NULL, NULL);
INSERT INTO depenses_batiment (id, designation, quantite, prix_unitaire, categorie, date, commentaire) VALUES (72, 'Sacs de ciment', 2, 5200, 'materiaux', NULL, NULL);
INSERT INTO depenses_batiment (id, designation, quantite, prix_unitaire, categorie, date, commentaire) VALUES (73, 'Fil d''attache', 2, 750, 'materiaux', NULL, NULL);
INSERT INTO depenses_batiment (id, designation, quantite, prix_unitaire, categorie, date, commentaire) VALUES (74, 'Parpaings de 12', 20, 200, 'materiaux', NULL, NULL);
INSERT INTO depenses_batiment (id, designation, quantite, prix_unitaire, categorie, date, commentaire) VALUES (75, 'Transport', 1, 1500, 'transport', NULL, NULL);
INSERT INTO depenses_batiment (id, designation, quantite, prix_unitaire, categorie, date, commentaire) VALUES (76, 'Main-d''œuvre', 1, 10000, 'main_oeuvre', NULL, NULL);
INSERT INTO depenses_batiment (id, designation, quantite, prix_unitaire, categorie, date, commentaire) VALUES (77, 'Garage (réparation véhicule)', 1, 8500, 'transport', NULL, NULL);
INSERT INTO depenses_batiment (id, designation, quantite, prix_unitaire, categorie, date, commentaire) VALUES (78, 'Transport', 1, 2000, 'transport', '2026-04-07', NULL);
INSERT INTO depenses_batiment (id, designation, quantite, prix_unitaire, categorie, date, commentaire) VALUES (79, 'Sac de ciment ', 4, 5200, 'materiaux', '2026-04-07', NULL);
INSERT INTO depenses_batiment (id, designation, quantite, prix_unitaire, categorie, date, commentaire) VALUES (80, 'Parpaing', 100, 200, 'materiaux', '2026-04-07', NULL);
INSERT INTO depenses_batiment (id, designation, quantite, prix_unitaire, categorie, date, commentaire) VALUES (81, 'Main d‘oeuvre', 1, 13000, 'main_oeuvre', '2026-04-07', NULL);
INSERT INTO depenses_batiment (id, designation, quantite, prix_unitaire, categorie, date, commentaire) VALUES (82, 'Fonds de 15 pour coffrage ', 2, 2500, 'materiaux', '2026-04-07', NULL);
INSERT INTO depenses_batiment (id, designation, quantite, prix_unitaire, categorie, date, commentaire) VALUES (83, 'Déjeuner', 1, 1000, 'divers', '2026-04-07', NULL);
INSERT INTO depenses_batiment (id, designation, quantite, prix_unitaire, categorie, date, commentaire) VALUES (84, 'Fers de 8', 4, 2900, 'materiaux', '2026-04-08', NULL);
INSERT INTO depenses_batiment (id, designation, quantite, prix_unitaire, categorie, date, commentaire) VALUES (85, 'Fil pour etriller lisse en 5.5 prometal en 12M', 2, 1600, 'materiaux', '2026-04-08', NULL);
INSERT INTO depenses_batiment (id, designation, quantite, prix_unitaire, categorie, date, commentaire) VALUES (86, 'Fil d''attache', 2, 850, 'materiaux', '2026-04-08', NULL);
INSERT INTO depenses_batiment (id, designation, quantite, prix_unitaire, categorie, date, commentaire) VALUES (87, 'Main-d''œuvre', 1, 10000, 'main_oeuvre', '2026-04-08', NULL);
INSERT INTO depenses_batiment (id, designation, quantite, prix_unitaire, categorie, date, commentaire) VALUES (42, 'Carburant', 1, 5000, 'carburant', NULL, NULL);
INSERT INTO depenses_batiment (id, designation, quantite, prix_unitaire, categorie, date, commentaire) VALUES (53, 'Carburant', 1, 5000, 'carburant', NULL, NULL);
INSERT INTO depenses_batiment (id, designation, quantite, prix_unitaire, categorie, date, commentaire) VALUES (68, 'Carburant', 1, 10000, 'carburant', NULL, NULL);

-- ===== depenses_puits (9 lignes) =====
-- Colonnes:
--   id integer
--   designation text
--   quantite numeric
--   prix_unitaire numeric
--   categorie text
--   date date
--   commentaire text
INSERT INTO depenses_puits (id, designation, quantite, prix_unitaire, categorie, date, commentaire) VALUES (1, 'Avance main-d''œuvre', 1, 50000, 'main_oeuvre', NULL, NULL);
INSERT INTO depenses_puits (id, designation, quantite, prix_unitaire, categorie, date, commentaire) VALUES (2, 'Flash Band de 10 (détail)', 2, 1000, 'materiaux', NULL, NULL);
INSERT INTO depenses_puits (id, designation, quantite, prix_unitaire, categorie, date, commentaire) VALUES (3, 'Avance main-d''œuvre', 1, 50000, 'main_oeuvre', NULL, NULL);
INSERT INTO depenses_puits (id, designation, quantite, prix_unitaire, categorie, date, commentaire) VALUES (4, 'Avance main-d''œuvre', 1, 50000, 'main_oeuvre', NULL, NULL);
INSERT INTO depenses_puits (id, designation, quantite, prix_unitaire, categorie, date, commentaire) VALUES (5, 'Corde', 1, 19000, 'materiaux', NULL, NULL);
INSERT INTO depenses_puits (id, designation, quantite, prix_unitaire, categorie, date, commentaire) VALUES (6, 'Buse', 18, 13000, 'materiaux', NULL, NULL);
INSERT INTO depenses_puits (id, designation, quantite, prix_unitaire, categorie, date, commentaire) VALUES (7, 'Avance main-d''œuvre', 1, 100000, 'main_oeuvre', NULL, NULL);
INSERT INTO depenses_puits (id, designation, quantite, prix_unitaire, categorie, date, commentaire) VALUES (8, 'Boissons', 1, 9000, 'divers', '2026-04-08', 'Casier de biere pour creuseur de puit');
INSERT INTO depenses_puits (id, designation, quantite, prix_unitaire, categorie, date, commentaire) VALUES (9, 'Avance main-d''œuvre', 1, 60000, 'main_oeuvre', '2026-04-08', 'À confirmer chez papa');

-- ===== devis_construction (1 lignes) =====
-- Colonnes:
--   id integer
--   batiment_estime numeric
--   batiment_notes text
--   carburant_estime numeric
--   updated_at timestamp without time zone
INSERT INTO devis_construction (id, batiment_estime, batiment_notes, carburant_estime, updated_at) VALUES (1, 3525000, NULL, 150000, '2026-04-07T17:13:54.240631');

-- ===== puits_items_devis (1 lignes) =====
-- Colonnes:
--   id integer
--   designation text
--   quantite numeric
--   prix_unitaire numeric
INSERT INTO puits_items_devis (id, designation, quantite, prix_unitaire) VALUES (1, 'Puits (forage et équipement)', 1, 1370000);

-- ===== sorties_argent (0 lignes) =====
-- Colonnes:
--   id integer
--   date date
--   decaisse numeric
--   depense numeric
--   created_at timestamp without time zone
--   commentaire text
--   photo_url text
-- (table vide)

-- ===== sorties_carburant (0 lignes) =====
-- Colonnes:
--   id integer
--   date date
--   montant numeric
--   created_at timestamp without time zone
--   commentaire text
--   photo_url text
-- (table vide)
