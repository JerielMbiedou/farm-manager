--
-- PostgreSQL database dump
--

\restrict 9pc7Nqf5OnPqN3tRNfZhKKlyTVFsEOOQ8lXYKB1hdVAO2ljJEkOa8OcejQPmpDl

-- Dumped from database version 16.12 (8dbf2dd)
-- Dumped by pg_dump version 16.10

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: _system; Type: SCHEMA; Schema: -; Owner: neondb_owner
--

CREATE SCHEMA _system;


ALTER SCHEMA _system OWNER TO neondb_owner;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: replit_database_migrations_v1; Type: TABLE; Schema: _system; Owner: neondb_owner
--

CREATE TABLE _system.replit_database_migrations_v1 (
    id bigint NOT NULL,
    build_id text NOT NULL,
    deployment_id text NOT NULL,
    statement_count bigint NOT NULL,
    applied_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE _system.replit_database_migrations_v1 OWNER TO neondb_owner;

--
-- Name: replit_database_migrations_v1_id_seq; Type: SEQUENCE; Schema: _system; Owner: neondb_owner
--

CREATE SEQUENCE _system.replit_database_migrations_v1_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE _system.replit_database_migrations_v1_id_seq OWNER TO neondb_owner;

--
-- Name: replit_database_migrations_v1_id_seq; Type: SEQUENCE OWNED BY; Schema: _system; Owner: neondb_owner
--

ALTER SEQUENCE _system.replit_database_migrations_v1_id_seq OWNED BY _system.replit_database_migrations_v1.id;


--
-- Name: activity_log; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.activity_log (
    id integer NOT NULL,
    user_id integer,
    user_nom text NOT NULL,
    action text NOT NULL,
    details text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.activity_log OWNER TO neondb_owner;

--
-- Name: activity_log_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.activity_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.activity_log_id_seq OWNER TO neondb_owner;

--
-- Name: activity_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.activity_log_id_seq OWNED BY public.activity_log.id;


--
-- Name: bande_depenses; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.bande_depenses (
    id integer NOT NULL,
    bande_id integer NOT NULL,
    designation text NOT NULL,
    categorie text NOT NULL,
    quantite numeric(15,2) NOT NULL,
    prix_unitaire numeric(15,2) NOT NULL
);


ALTER TABLE public.bande_depenses OWNER TO neondb_owner;

--
-- Name: bande_depenses_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.bande_depenses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.bande_depenses_id_seq OWNER TO neondb_owner;

--
-- Name: bande_depenses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.bande_depenses_id_seq OWNED BY public.bande_depenses.id;


--
-- Name: bande_ventes; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.bande_ventes (
    id integer NOT NULL,
    bande_id integer NOT NULL,
    date date NOT NULL,
    quantite_vendue integer NOT NULL,
    prix_unitaire numeric(15,2) NOT NULL
);


ALTER TABLE public.bande_ventes OWNER TO neondb_owner;

--
-- Name: bande_ventes_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.bande_ventes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.bande_ventes_id_seq OWNER TO neondb_owner;

--
-- Name: bande_ventes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.bande_ventes_id_seq OWNED BY public.bande_ventes.id;


--
-- Name: bandes; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.bandes (
    id integer NOT NULL,
    numero integer NOT NULL,
    nom text NOT NULL,
    sujets_depart integer NOT NULL,
    nombre_deces integer DEFAULT 0 NOT NULL,
    valeur_materiel_fixe numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    statut text DEFAULT 'active'::text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    date_de_depart date NOT NULL
);


ALTER TABLE public.bandes OWNER TO neondb_owner;

--
-- Name: bandes_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.bandes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.bandes_id_seq OWNER TO neondb_owner;

--
-- Name: bandes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.bandes_id_seq OWNED BY public.bandes.id;


--
-- Name: charges_fixes; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.charges_fixes (
    id integer NOT NULL,
    bande_id integer NOT NULL,
    loyer numeric(15,2) DEFAULT '0'::numeric NOT NULL
);


ALTER TABLE public.charges_fixes OWNER TO neondb_owner;

--
-- Name: charges_fixes_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.charges_fixes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.charges_fixes_id_seq OWNER TO neondb_owner;

--
-- Name: charges_fixes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.charges_fixes_id_seq OWNED BY public.charges_fixes.id;


--
-- Name: consommation_aliment; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.consommation_aliment (
    id integer NOT NULL,
    bande_id integer NOT NULL,
    date date NOT NULL,
    quantite_kg numeric(10,2) NOT NULL
);


ALTER TABLE public.consommation_aliment OWNER TO neondb_owner;

--
-- Name: consommation_aliment_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.consommation_aliment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.consommation_aliment_id_seq OWNER TO neondb_owner;

--
-- Name: consommation_aliment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.consommation_aliment_id_seq OWNED BY public.consommation_aliment.id;


--
-- Name: consommation_eau; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.consommation_eau (
    id integer NOT NULL,
    bande_id integer NOT NULL,
    date date NOT NULL,
    age_jours integer NOT NULL,
    quantite_litres numeric(10,2) NOT NULL
);


ALTER TABLE public.consommation_eau OWNER TO neondb_owner;

--
-- Name: consommation_eau_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.consommation_eau_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.consommation_eau_id_seq OWNER TO neondb_owner;

--
-- Name: consommation_eau_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.consommation_eau_id_seq OWNED BY public.consommation_eau.id;


--
-- Name: depenses_batiment; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.depenses_batiment (
    id integer NOT NULL,
    designation text NOT NULL,
    quantite numeric(15,2) NOT NULL,
    prix_unitaire numeric(15,2) NOT NULL,
    categorie text DEFAULT 'materiaux'::text,
    date date,
    commentaire text
);


ALTER TABLE public.depenses_batiment OWNER TO neondb_owner;

--
-- Name: depenses_batiment_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.depenses_batiment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.depenses_batiment_id_seq OWNER TO neondb_owner;

--
-- Name: depenses_batiment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.depenses_batiment_id_seq OWNED BY public.depenses_batiment.id;


--
-- Name: depenses_puits; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.depenses_puits (
    id integer NOT NULL,
    designation text NOT NULL,
    quantite numeric(15,2) NOT NULL,
    prix_unitaire numeric(15,2) NOT NULL,
    categorie text DEFAULT 'materiaux'::text,
    date date,
    commentaire text
);


ALTER TABLE public.depenses_puits OWNER TO neondb_owner;

--
-- Name: depenses_puits_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.depenses_puits_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.depenses_puits_id_seq OWNER TO neondb_owner;

--
-- Name: depenses_puits_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.depenses_puits_id_seq OWNED BY public.depenses_puits.id;


--
-- Name: depenses_vente; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.depenses_vente (
    id integer NOT NULL,
    bande_id integer NOT NULL,
    designation text NOT NULL,
    montant numeric(15,2) NOT NULL
);


ALTER TABLE public.depenses_vente OWNER TO neondb_owner;

--
-- Name: depenses_vente_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.depenses_vente_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.depenses_vente_id_seq OWNER TO neondb_owner;

--
-- Name: depenses_vente_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.depenses_vente_id_seq OWNED BY public.depenses_vente.id;


--
-- Name: devis_construction; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.devis_construction (
    id integer NOT NULL,
    batiment_estime numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    batiment_notes text,
    carburant_estime numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.devis_construction OWNER TO neondb_owner;

--
-- Name: devis_construction_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.devis_construction_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.devis_construction_id_seq OWNER TO neondb_owner;

--
-- Name: devis_construction_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.devis_construction_id_seq OWNED BY public.devis_construction.id;


--
-- Name: financement; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.financement (
    id integer NOT NULL,
    nom text NOT NULL,
    montant numeric(15,2) NOT NULL,
    date date NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.financement OWNER TO neondb_owner;

--
-- Name: financement_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.financement_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.financement_id_seq OWNER TO neondb_owner;

--
-- Name: financement_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.financement_id_seq OWNED BY public.financement.id;


--
-- Name: mortalite_journaliere; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.mortalite_journaliere (
    id integer NOT NULL,
    bande_id integer NOT NULL,
    date date NOT NULL,
    age_jours integer NOT NULL,
    deces_jour integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.mortalite_journaliere OWNER TO neondb_owner;

--
-- Name: mortalite_journaliere_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.mortalite_journaliere_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.mortalite_journaliere_id_seq OWNER TO neondb_owner;

--
-- Name: mortalite_journaliere_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.mortalite_journaliere_id_seq OWNED BY public.mortalite_journaliere.id;


--
-- Name: observations_journal; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.observations_journal (
    id integer NOT NULL,
    bande_id integer NOT NULL,
    date date NOT NULL,
    age_jours integer NOT NULL,
    contenu text NOT NULL
);


ALTER TABLE public.observations_journal OWNER TO neondb_owner;

--
-- Name: observations_journal_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.observations_journal_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.observations_journal_id_seq OWNER TO neondb_owner;

--
-- Name: observations_journal_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.observations_journal_id_seq OWNED BY public.observations_journal.id;


--
-- Name: parametres; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.parametres (
    id integer NOT NULL,
    cle text NOT NULL,
    valeur text NOT NULL,
    description text NOT NULL,
    categorie text NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.parametres OWNER TO neondb_owner;

--
-- Name: parametres_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.parametres_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.parametres_id_seq OWNER TO neondb_owner;

--
-- Name: parametres_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.parametres_id_seq OWNED BY public.parametres.id;


--
-- Name: pesees; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.pesees (
    id integer NOT NULL,
    bande_id integer NOT NULL,
    date date NOT NULL,
    age_jours integer NOT NULL,
    poids_moyen_g numeric(10,2) NOT NULL,
    objectif_poids_g numeric(10,2)
);


ALTER TABLE public.pesees OWNER TO neondb_owner;

--
-- Name: pesees_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.pesees_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pesees_id_seq OWNER TO neondb_owner;

--
-- Name: pesees_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.pesees_id_seq OWNED BY public.pesees.id;


--
-- Name: puits_items_devis; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.puits_items_devis (
    id integer NOT NULL,
    designation text NOT NULL,
    quantite numeric(15,2) NOT NULL,
    prix_unitaire numeric(15,2) NOT NULL
);


ALTER TABLE public.puits_items_devis OWNER TO neondb_owner;

--
-- Name: puits_items_devis_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.puits_items_devis_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.puits_items_devis_id_seq OWNER TO neondb_owner;

--
-- Name: puits_items_devis_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.puits_items_devis_id_seq OWNED BY public.puits_items_devis.id;


--
-- Name: remboursements; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.remboursements (
    id integer NOT NULL,
    investisseur_nom text NOT NULL,
    montant numeric(15,2) NOT NULL,
    date date NOT NULL,
    commentaire text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.remboursements OWNER TO neondb_owner;

--
-- Name: remboursements_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.remboursements_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.remboursements_id_seq OWNER TO neondb_owner;

--
-- Name: remboursements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.remboursements_id_seq OWNED BY public.remboursements.id;


--
-- Name: session; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.session (
    sid character varying NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL
);


ALTER TABLE public.session OWNER TO neondb_owner;

--
-- Name: sorties_argent; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.sorties_argent (
    id integer NOT NULL,
    date date NOT NULL,
    decaisse numeric(15,2) NOT NULL,
    depense numeric(15,2) NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    commentaire text,
    photo_url text
);


ALTER TABLE public.sorties_argent OWNER TO neondb_owner;

--
-- Name: sorties_argent_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.sorties_argent_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sorties_argent_id_seq OWNER TO neondb_owner;

--
-- Name: sorties_argent_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.sorties_argent_id_seq OWNED BY public.sorties_argent.id;


--
-- Name: sorties_carburant; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.sorties_carburant (
    id integer NOT NULL,
    date date NOT NULL,
    montant numeric(15,2) NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    commentaire text,
    photo_url text
);


ALTER TABLE public.sorties_carburant OWNER TO neondb_owner;

--
-- Name: sorties_carburant_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.sorties_carburant_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sorties_carburant_id_seq OWNER TO neondb_owner;

--
-- Name: sorties_carburant_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.sorties_carburant_id_seq OWNED BY public.sorties_carburant.id;


--
-- Name: stock_aliments; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.stock_aliments (
    id integer NOT NULL,
    designation text NOT NULL,
    type text DEFAULT 'entree'::text NOT NULL,
    quantite_kg numeric(12,2) NOT NULL,
    prix_unitaire numeric(15,2),
    fournisseur text,
    date date NOT NULL,
    commentaire text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.stock_aliments OWNER TO neondb_owner;

--
-- Name: stock_aliments_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.stock_aliments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.stock_aliments_id_seq OWNER TO neondb_owner;

--
-- Name: stock_aliments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.stock_aliments_id_seq OWNED BY public.stock_aliments.id;


--
-- Name: stock_medicaments; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.stock_medicaments (
    id integer NOT NULL,
    nom text NOT NULL,
    type text DEFAULT 'entree'::text NOT NULL,
    quantite numeric(12,2) NOT NULL,
    unite text DEFAULT 'unité'::text NOT NULL,
    date_peremption date,
    fournisseur text,
    date date NOT NULL,
    commentaire text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.stock_medicaments OWNER TO neondb_owner;

--
-- Name: stock_medicaments_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.stock_medicaments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.stock_medicaments_id_seq OWNER TO neondb_owner;

--
-- Name: stock_medicaments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.stock_medicaments_id_seq OWNED BY public.stock_medicaments.id;


--
-- Name: traitements; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.traitements (
    id integer NOT NULL,
    bande_id integer NOT NULL,
    date date NOT NULL,
    age_jours integer NOT NULL,
    produit text NOT NULL,
    type text DEFAULT 'traitement'::text NOT NULL,
    dosage text,
    observations text
);


ALTER TABLE public.traitements OWNER TO neondb_owner;

--
-- Name: traitements_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.traitements_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.traitements_id_seq OWNER TO neondb_owner;

--
-- Name: traitements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.traitements_id_seq OWNED BY public.traitements.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username text NOT NULL,
    password text NOT NULL,
    role text DEFAULT 'gestionnaire'::text NOT NULL,
    nom text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.users OWNER TO neondb_owner;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO neondb_owner;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: vaccinations; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.vaccinations (
    id integer NOT NULL,
    bande_id integer NOT NULL,
    jour_prevu integer NOT NULL,
    nom text NOT NULL,
    description text,
    fait text DEFAULT 'non'::text NOT NULL,
    date_fait date,
    commentaire text
);


ALTER TABLE public.vaccinations OWNER TO neondb_owner;

--
-- Name: vaccinations_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.vaccinations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.vaccinations_id_seq OWNER TO neondb_owner;

--
-- Name: vaccinations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.vaccinations_id_seq OWNED BY public.vaccinations.id;


--
-- Name: replit_database_migrations_v1 id; Type: DEFAULT; Schema: _system; Owner: neondb_owner
--

ALTER TABLE ONLY _system.replit_database_migrations_v1 ALTER COLUMN id SET DEFAULT nextval('_system.replit_database_migrations_v1_id_seq'::regclass);


--
-- Name: activity_log id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.activity_log ALTER COLUMN id SET DEFAULT nextval('public.activity_log_id_seq'::regclass);


--
-- Name: bande_depenses id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.bande_depenses ALTER COLUMN id SET DEFAULT nextval('public.bande_depenses_id_seq'::regclass);


--
-- Name: bande_ventes id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.bande_ventes ALTER COLUMN id SET DEFAULT nextval('public.bande_ventes_id_seq'::regclass);


--
-- Name: bandes id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.bandes ALTER COLUMN id SET DEFAULT nextval('public.bandes_id_seq'::regclass);


--
-- Name: charges_fixes id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.charges_fixes ALTER COLUMN id SET DEFAULT nextval('public.charges_fixes_id_seq'::regclass);


--
-- Name: consommation_aliment id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.consommation_aliment ALTER COLUMN id SET DEFAULT nextval('public.consommation_aliment_id_seq'::regclass);


--
-- Name: consommation_eau id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.consommation_eau ALTER COLUMN id SET DEFAULT nextval('public.consommation_eau_id_seq'::regclass);


--
-- Name: depenses_batiment id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.depenses_batiment ALTER COLUMN id SET DEFAULT nextval('public.depenses_batiment_id_seq'::regclass);


--
-- Name: depenses_puits id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.depenses_puits ALTER COLUMN id SET DEFAULT nextval('public.depenses_puits_id_seq'::regclass);


--
-- Name: depenses_vente id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.depenses_vente ALTER COLUMN id SET DEFAULT nextval('public.depenses_vente_id_seq'::regclass);


--
-- Name: devis_construction id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.devis_construction ALTER COLUMN id SET DEFAULT nextval('public.devis_construction_id_seq'::regclass);


--
-- Name: financement id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.financement ALTER COLUMN id SET DEFAULT nextval('public.financement_id_seq'::regclass);


--
-- Name: mortalite_journaliere id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.mortalite_journaliere ALTER COLUMN id SET DEFAULT nextval('public.mortalite_journaliere_id_seq'::regclass);


--
-- Name: observations_journal id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.observations_journal ALTER COLUMN id SET DEFAULT nextval('public.observations_journal_id_seq'::regclass);


--
-- Name: parametres id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.parametres ALTER COLUMN id SET DEFAULT nextval('public.parametres_id_seq'::regclass);


--
-- Name: pesees id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.pesees ALTER COLUMN id SET DEFAULT nextval('public.pesees_id_seq'::regclass);


--
-- Name: puits_items_devis id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.puits_items_devis ALTER COLUMN id SET DEFAULT nextval('public.puits_items_devis_id_seq'::regclass);


--
-- Name: remboursements id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.remboursements ALTER COLUMN id SET DEFAULT nextval('public.remboursements_id_seq'::regclass);


--
-- Name: sorties_argent id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.sorties_argent ALTER COLUMN id SET DEFAULT nextval('public.sorties_argent_id_seq'::regclass);


--
-- Name: sorties_carburant id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.sorties_carburant ALTER COLUMN id SET DEFAULT nextval('public.sorties_carburant_id_seq'::regclass);


--
-- Name: stock_aliments id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.stock_aliments ALTER COLUMN id SET DEFAULT nextval('public.stock_aliments_id_seq'::regclass);


--
-- Name: stock_medicaments id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.stock_medicaments ALTER COLUMN id SET DEFAULT nextval('public.stock_medicaments_id_seq'::regclass);


--
-- Name: traitements id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.traitements ALTER COLUMN id SET DEFAULT nextval('public.traitements_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: vaccinations id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.vaccinations ALTER COLUMN id SET DEFAULT nextval('public.vaccinations_id_seq'::regclass);


--
-- Data for Name: replit_database_migrations_v1; Type: TABLE DATA; Schema: _system; Owner: neondb_owner
--

COPY _system.replit_database_migrations_v1 (id, build_id, deployment_id, statement_count, applied_at) FROM stdin;
1	51917906-4c21-4952-ae5a-18a88a70e114	9a346b1e-6109-475f-a2e0-a1e3896d5012	2	2026-04-07 23:01:22.544303+00
2	ba202dfb-7b68-4523-9359-bb597d91dcf1	9a346b1e-6109-475f-a2e0-a1e3896d5012	6	2026-04-07 23:31:00.092224+00
3	afb59563-91a3-43c5-a65f-d52b5ecbd2ff	9a346b1e-6109-475f-a2e0-a1e3896d5012	3	2026-04-08 17:33:20.227604+00
\.


--
-- Data for Name: activity_log; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.activity_log (id, user_id, user_nom, action, details, created_at) FROM stdin;
1	4	Jeriel Mbiedou 	Ajout dépense bâtiment	Transport - 2000 FCFA	2026-04-07 20:11:11.851783
2	4	Jeriel Mbiedou 	Ajout dépense bâtiment	Sac de ciment  - 20800 FCFA	2026-04-07 20:12:18.872689
3	4	Jeriel Mbiedou 	Ajout dépense bâtiment	Parpaing - 20000 FCFA	2026-04-07 20:12:55.095141
4	4	Jeriel Mbiedou 	Ajout dépense bâtiment	Main d‘oeuvre - 13000 FCFA	2026-04-07 20:13:41.496371
5	4	Jeriel Mbiedou 	Ajout dépense bâtiment	Fonds de 15 pour coffrage  - 5000 FCFA	2026-04-07 20:14:51.827105
6	4	Jeriel Mbiedou 	Ajout dépense bâtiment	Déjeuner - 1000 FCFA	2026-04-07 20:15:43.814742
7	4	Jeriel Mbiedou 	Modification dépense bâtiment	Déjeuner	2026-04-07 20:15:59.496879
8	\N	Système	Création bande	Test Bande - real data - 3901 sujets	2026-04-08 16:33:50.207604
9	1	Administrateur	Ajout mortalité	3 décès - Bande ID: 6	2026-04-08 17:37:56.111103
10	1	Administrateur	Ajout mortalité	12 décès - Bande ID: 6	2026-04-08 17:37:57.579325
11	1	Administrateur	Ajout mortalité	16 décès - Bande ID: 6	2026-04-08 17:37:58.787662
12	1	Administrateur	Ajout mortalité	13 décès - Bande ID: 6	2026-04-08 17:38:00.338332
13	1	Administrateur	Ajout mortalité	9 décès - Bande ID: 6	2026-04-08 17:38:01.870896
14	1	Administrateur	Ajout mortalité	10 décès - Bande ID: 6	2026-04-08 17:38:03.091241
15	1	Administrateur	Ajout mortalité	4 décès - Bande ID: 6	2026-04-08 17:38:04.217491
16	1	Administrateur	Modification bande	Bande 1	2026-04-08 17:41:18.579016
17	1	Administrateur	Ajout mortalité	3 décès - Bande ID: 6	2026-04-08 18:36:20.92074
18	1	Administrateur	Ajout mortalité	5 décès - Bande ID: 6	2026-04-08 18:36:22.364778
19	1	Administrateur	Ajout mortalité	5 décès - Bande ID: 6	2026-04-08 18:36:23.47848
20	1	Administrateur	Ajout mortalité	4 décès - Bande ID: 6	2026-04-08 18:36:24.56463
21	1	Administrateur	Ajout mortalité	1 décès - Bande ID: 6	2026-04-08 18:36:25.966635
22	1	Administrateur	Ajout mortalité	6 décès - Bande ID: 6	2026-04-08 18:36:27.359207
23	1	Administrateur	Ajout mortalité	3 décès - Bande ID: 6	2026-04-08 19:01:31.770528
24	1	Administrateur	Ajout mortalité	12 décès - Bande ID: 6	2026-04-08 19:01:33.535156
25	1	Administrateur	Ajout mortalité	16 décès - Bande ID: 6	2026-04-08 19:01:34.935824
26	1	Administrateur	Ajout mortalité	13 décès - Bande ID: 6	2026-04-08 19:01:36.337447
27	1	Administrateur	Ajout mortalité	9 décès - Bande ID: 6	2026-04-08 19:01:38.054914
28	1	Administrateur	Ajout mortalité	10 décès - Bande ID: 6	2026-04-08 19:01:39.734032
29	1	Administrateur	Ajout mortalité	4 décès - Bande ID: 6	2026-04-08 19:01:41.1766
30	1	Administrateur	Suppression bande	ID: 6	2026-04-08 19:07:14.401985
31	1	Administrateur	Création bande	Bande Test2 - 3901 sujets	2026-04-08 19:12:55.678822
32	1	Administrateur	Ajout mortalité	3 décès - Bande ID: 7	2026-04-08 19:14:57.222426
33	1	Administrateur	Ajout mortalité	12 décès - Bande ID: 7	2026-04-08 19:14:58.921269
34	1	Administrateur	Ajout mortalité	16 décès - Bande ID: 7	2026-04-08 19:15:00.307925
35	1	Administrateur	Ajout mortalité	13 décès - Bande ID: 7	2026-04-08 19:15:01.697598
36	1	Administrateur	Ajout mortalité	9 décès - Bande ID: 7	2026-04-08 19:15:03.074804
37	1	Administrateur	Ajout mortalité	10 décès - Bande ID: 7	2026-04-08 19:15:04.745173
38	1	Administrateur	Ajout mortalité	4 décès - Bande ID: 7	2026-04-08 19:15:06.142904
39	1	Administrateur	Ajout mortalité	3 décès - Bande ID: 7	2026-04-08 19:18:35.617171
40	1	Administrateur	Ajout mortalité	5 décès - Bande ID: 7	2026-04-08 19:18:37.064777
41	1	Administrateur	Ajout mortalité	5 décès - Bande ID: 7	2026-04-08 19:18:38.466371
42	1	Administrateur	Ajout mortalité	4 décès - Bande ID: 7	2026-04-08 19:18:40.142925
43	1	Administrateur	Ajout mortalité	1 décès - Bande ID: 7	2026-04-08 19:18:41.524654
44	1	Administrateur	Ajout mortalité	6 décès - Bande ID: 7	2026-04-08 19:18:42.934735
45	1	Administrateur	Ajout mortalité	10 décès - Bande ID: 7	2026-04-08 19:29:44.074409
46	1	Administrateur	Ajout dépense bande	Aliment croissance - 2000 FCFA	2026-04-08 19:48:03.883313
47	1	Administrateur	Ajout vente bande	1 sujets à 500 FCFA	2026-04-08 19:48:16.892522
48	1	Administrateur	Suppression bande	ID: 7	2026-04-08 19:49:19.264987
49	1	Administrateur	Création bande	Bande 2 - 3901 sujets	2026-04-08 19:51:10.472872
50	1	Administrateur	Ajout mortalité	3 décès - Bande ID: 8	2026-04-08 19:52:51.243918
51	1	Administrateur	Ajout mortalité	12 décès - Bande ID: 8	2026-04-08 19:52:52.808389
52	1	Administrateur	Ajout mortalité	16 décès - Bande ID: 8	2026-04-08 19:52:54.145599
53	1	Administrateur	Ajout mortalité	13 décès - Bande ID: 8	2026-04-08 19:52:55.462759
54	1	Administrateur	Ajout mortalité	9 décès - Bande ID: 8	2026-04-08 19:52:57.056276
55	1	Administrateur	Ajout mortalité	10 décès - Bande ID: 8	2026-04-08 19:52:58.634484
56	1	Administrateur	Ajout mortalité	4 décès - Bande ID: 8	2026-04-08 19:52:59.8731
57	1	Administrateur	Ajout mortalité	3 décès - Bande ID: 8	2026-04-08 19:57:27.835192
58	1	Administrateur	Ajout mortalité	5 décès - Bande ID: 8	2026-04-08 19:57:29.460389
59	1	Administrateur	Ajout mortalité	5 décès - Bande ID: 8	2026-04-08 19:57:31.23515
60	1	Administrateur	Ajout mortalité	4 décès - Bande ID: 8	2026-04-08 19:57:32.956113
61	1	Administrateur	Ajout mortalité	1 décès - Bande ID: 8	2026-04-08 19:57:34.252453
62	1	Administrateur	Ajout mortalité	6 décès - Bande ID: 8	2026-04-08 19:57:35.596031
63	1	Administrateur	Suppression bande	ID: 8	2026-04-08 20:18:29.386095
64	1	Administrateur	Création bande	Bande 2 - 3901 sujets	2026-04-08 20:18:55.317645
65	1	Administrateur	Ajout mortalité	3 décès - Bande ID: 9	2026-04-08 20:22:18.238302
66	1	Administrateur	Ajout mortalité	12 décès - Bande ID: 9	2026-04-08 20:22:20.187842
67	1	Administrateur	Ajout mortalité	16 décès - Bande ID: 9	2026-04-08 20:22:21.63858
68	1	Administrateur	Ajout mortalité	13 décès - Bande ID: 9	2026-04-08 20:22:23.114296
69	1	Administrateur	Ajout mortalité	9 décès - Bande ID: 9	2026-04-08 20:22:24.757024
70	1	Administrateur	Ajout mortalité	10 décès - Bande ID: 9	2026-04-08 20:22:26.409321
71	1	Administrateur	Ajout mortalité	4 décès - Bande ID: 9	2026-04-08 20:22:27.930165
72	1	Administrateur	Ajout mortalité	3 décès - Bande ID: 9	2026-04-08 20:24:23.059325
73	1	Administrateur	Ajout mortalité	5 décès - Bande ID: 9	2026-04-08 20:24:24.902836
74	1	Administrateur	Ajout mortalité	5 décès - Bande ID: 9	2026-04-08 20:24:26.611661
75	1	Administrateur	Ajout mortalité	4 décès - Bande ID: 9	2026-04-08 20:24:28.240892
76	1	Administrateur	Ajout mortalité	1 décès - Bande ID: 9	2026-04-08 20:24:29.570535
77	1	Administrateur	Ajout mortalité	6 décès - Bande ID: 9	2026-04-08 20:24:30.911815
78	1	Administrateur	Ajout mortalité	1 décès - Bande ID: 9	2026-04-08 20:31:56.88703
79	1	Administrateur	Ajout mortalité	3 décès - Bande ID: 9	2026-04-08 20:31:58.851342
80	1	Administrateur	Ajout mortalité	1 décès - Bande ID: 9	2026-04-08 20:32:00.588417
81	1	Administrateur	Ajout mortalité	1 décès - Bande ID: 9	2026-04-08 20:32:02.199081
82	1	Administrateur	Ajout mortalité	3 décès - Bande ID: 9	2026-04-08 20:32:04.866951
83	1	Administrateur	Ajout mortalité	4 décès - Bande ID: 9	2026-04-08 20:32:06.340291
84	1	Administrateur	Ajout mortalité	2 décès - Bande ID: 9	2026-04-08 20:34:38.674084
85	1	Administrateur	Ajout mortalité	4 décès - Bande ID: 9	2026-04-08 20:34:40.108246
86	1	Administrateur	Ajout mortalité	2 décès - Bande ID: 9	2026-04-08 20:34:41.533906
87	1	Administrateur	Ajout mortalité	3 décès - Bande ID: 9	2026-04-08 20:34:44.184484
88	1	Administrateur	Ajout mortalité	2 décès - Bande ID: 9	2026-04-08 20:34:45.569314
89	1	Administrateur	Ajout mortalité	4 décès - Bande ID: 9	2026-04-08 20:38:56.162219
90	1	Administrateur	Ajout mortalité	3 décès - Bande ID: 9	2026-04-08 20:38:57.483713
91	1	Administrateur	Ajout mortalité	2 décès - Bande ID: 9	2026-04-08 20:38:58.514627
92	1	Administrateur	Ajout mortalité	3 décès - Bande ID: 9	2026-04-08 20:38:59.514409
93	1	Administrateur	Ajout mortalité	3 décès - Bande ID: 9	2026-04-08 20:39:00.774353
94	1	Administrateur	Ajout mortalité	3 décès - Bande ID: 9	2026-04-08 20:39:01.82527
95	1	Administrateur	Ajout dépense forage	Boissons - 9000 FCFA	2026-04-09 06:39:13.47477
96	1	Administrateur	Ajout dépense forage	??? - 60000 FCFA	2026-04-09 06:40:57.466289
97	1	Administrateur	Ajout dépense bâtiment	Fers de 8 - 11600 FCFA	2026-04-09 06:43:34.605678
98	1	Administrateur	Ajout dépense bâtiment	Fil pour etriller lisse en 5.5 prometal en 12M - 3200 FCFA	2026-04-09 06:45:20.483083
99	1	Administrateur	Ajout dépense bâtiment	Fil d'attache - 1700 FCFA	2026-04-09 06:45:44.550312
100	1	Administrateur	Ajout dépense bâtiment	Main-d'œuvre - 10000 FCFA	2026-04-09 06:46:52.236339
101	1	Administrateur	Modification dépense forage	Avance main-d'œuvre	2026-04-09 06:47:31.64485
102	1	Administrateur	Modification dépense bâtiment	Carburant	2026-04-09 06:51:52.638195
103	1	Administrateur	Modification dépense bâtiment	Carburant	2026-04-09 06:52:12.689566
104	1	Administrateur	Modification dépense bâtiment	Carburant	2026-04-09 06:52:27.425506
105	1	Administrateur	Ajout dépense bande	Concentré - 208000 FCFA	2026-04-10 12:29:14.972248
106	1	Administrateur	Ajout dépense bande	Aliment finition - 313600 FCFA	2026-04-10 12:29:57.498811
107	1	Administrateur	Ajout dépense bande	Carburant - 15000 FCFA	2026-04-10 12:30:26.948695
108	1	Administrateur	Ajout dépense bande	Aliment finition - 68070 FCFA	2026-04-10 12:31:15.77464
109	1	Administrateur	Ajout dépense bande	Aliment finition - 135010 FCFA	2026-04-10 12:31:33.182443
110	1	Administrateur	Ajout vente bande	370 sujets à 3100 FCFA	2026-04-10 12:33:24.078346
111	1	Administrateur	Ajout vente bande	33 sujets à 3000 FCFA	2026-04-10 12:33:50.85923
112	1	Administrateur	Ajout vente bande	6 sujets à 2800 FCFA	2026-04-10 12:34:18.46367
113	1	Administrateur	Ajout vente bande	61 sujets à 3100 FCFA	2026-04-10 12:34:51.095103
114	1	Administrateur	Ajout vente bande	17 sujets à 3400 FCFA	2026-04-10 12:38:48.079263
115	1	Administrateur	Ajout vente bande	46 sujets à 3300 FCFA	2026-04-10 12:39:16.202424
116	1	Administrateur	Ajout vente bande	33 sujets à 3200 FCFA	2026-04-10 12:39:36.840088
117	1	Administrateur	Ajout vente bande	7 sujets à 3000 FCFA	2026-04-10 12:39:57.351166
118	1	Administrateur	Ajout vente bande	5 sujets à 3100 FCFA	2026-04-10 12:40:11.027574
119	1	Administrateur	Ajout vente bande	1 sujets à 2700 FCFA	2026-04-10 12:40:21.69874
120	1	Administrateur	Ajout vente bande	11 sujets à 2900 FCFA	2026-04-10 12:40:48.22372
121	1	Administrateur	Ajout vente bande	8 sujets à 2800 FCFA	2026-04-10 12:41:14.857075
122	1	Administrateur	Ajout vente bande	131 sujets à 3100 FCFA	2026-04-10 12:41:34.534664
123	1	Administrateur	Ajout vente bande	222 sujets à 3100 FCFA	2026-04-10 12:42:15.497995
124	1	Administrateur	Ajout vente bande	401 sujets à 2800 FCFA	2026-04-10 12:43:04.734366
125	1	Administrateur	Ajout vente bande	60 sujets à 3200 FCFA	2026-04-10 12:43:37.919305
126	1	Administrateur	Ajout vente bande	31 sujets à 3100 FCFA	2026-04-10 12:44:08.810128
127	1	Administrateur	Ajout vente bande	46 sujets à 3100 FCFA	2026-04-10 12:44:44.821997
128	1	Administrateur	Ajout vente bande	24 sujets à 3200 FCFA	2026-04-10 12:45:17.372274
129	1	Administrateur	Ajout vente bande	8 sujets à 3200 FCFA	2026-04-10 12:45:43.711731
130	1	Administrateur	Ajout vente bande	3 sujets à 4500 FCFA	2026-04-10 12:45:58.942727
131	1	Administrateur	Ajout vente bande	92 sujets à 3200 FCFA	2026-04-10 12:46:41.810908
132	1	Administrateur	Ajout vente bande	8 sujets à 3100 FCFA	2026-04-10 12:47:01.733354
133	1	Administrateur	Ajout vente bande	13 sujets à 4500 FCFA	2026-04-10 12:47:49.83119
134	1	Administrateur	Ajout vente bande	6 sujets à 3000 FCFA	2026-04-10 12:48:04.42224
135	1	Administrateur	Ajout vente bande	1 sujets à 5000 FCFA	2026-04-10 12:48:19.056879
136	1	Administrateur	Ajout vente bande	40 sujets à 3200 FCFA	2026-04-10 12:48:40.151311
137	1	Administrateur	Ajout vente bande	11 sujets à 3500 FCFA	2026-04-10 12:48:55.547665
138	1	Administrateur	Ajout vente bande	1 sujets à 5000 FCFA	2026-04-10 12:49:06.446049
139	1	Administrateur	Ajout vente bande	2 sujets à 4500 FCFA	2026-04-10 12:49:21.13388
140	1	Administrateur	Ajout vente bande	31 sujets à 4500 FCFA	2026-04-10 12:50:04.230271
141	1	Administrateur	Ajout vente bande	4 sujets à 4300 FCFA	2026-04-10 12:50:26.121655
142	1	Administrateur	Ajout vente bande	72 sujets à 3300 FCFA	2026-04-10 12:50:43.948337
143	1	Administrateur	Ajout vente bande	6 sujets à 3000 FCFA	2026-04-10 12:51:00.467872
144	1	Administrateur	Ajout vente bande	3 sujets à 2900 FCFA	2026-04-10 12:51:17.103465
145	1	Administrateur	Ajout vente bande	3 sujets à 3000 FCFA	2026-04-10 12:51:28.762223
146	1	Administrateur	Ajout vente bande	6 sujets à 5000 FCFA	2026-04-10 12:51:57.441156
147	1	Administrateur	Ajout vente bande	8 sujets à 3300 FCFA	2026-04-10 12:52:14.170393
148	1	Administrateur	Ajout vente bande	65 sujets à 4600 FCFA	2026-04-10 12:52:35.438598
149	1	Administrateur	Ajout vente bande	5 sujets à 4500 FCFA	2026-04-10 12:52:57.587475
150	1	Administrateur	Ajout vente bande	25 sujets à 4200 FCFA	2026-04-10 12:53:10.785774
151	1	Administrateur	Ajout vente bande	4 sujets à 3000 FCFA	2026-04-10 12:53:23.966542
152	1	Administrateur	Ajout vente bande	3 sujets à 4000 FCFA	2026-04-10 12:53:43.714508
153	1	Administrateur	Ajout vente bande	12 sujets à 5000 FCFA	2026-04-10 12:54:03.572834
154	1	Administrateur	Ajout vente bande	66 sujets à 4800 FCFA	2026-04-10 12:54:45.834961
155	1	Administrateur	Ajout vente bande	21 sujets à 4600 FCFA	2026-04-10 12:55:01.508169
156	1	Administrateur	Ajout vente bande	6 sujets à 4500 FCFA	2026-04-10 12:55:39.47452
157	1	Administrateur	Ajout vente bande	11 sujets à 3200 FCFA	2026-04-10 12:56:25.683369
158	1	Administrateur	Ajout vente bande	4 sujets à 3000 FCFA	2026-04-10 12:56:39.097547
159	1	Administrateur	Ajout vente bande	1 sujets à 2000 FCFA	2026-04-10 12:56:52.228815
160	1	Administrateur	Ajout vente bande	105 sujets à 4800 FCFA	2026-04-10 12:57:16.260105
161	1	Administrateur	Ajout vente bande	25 sujets à 4800 FCFA	2026-04-10 12:58:03.639887
162	1	Administrateur	Ajout vente bande	50 sujets à 3300 FCFA	2026-04-10 12:58:25.474215
163	1	Administrateur	Ajout vente bande	3 sujets à 3500 FCFA	2026-04-10 12:58:40.552441
164	1	Administrateur	Ajout vente bande	76 sujets à 4800 FCFA	2026-04-10 12:58:54.739961
165	1	Administrateur	Ajout vente bande	13 sujets à 5000 FCFA	2026-04-10 12:59:08.719495
166	1	Administrateur	Ajout vente bande	1 sujets à 5500 FCFA	2026-04-10 12:59:20.202336
167	1	Administrateur	Ajout vente bande	13 sujets à 3200 FCFA	2026-04-10 12:59:31.964121
168	1	Administrateur	Ajout vente bande	2 sujets à 3100 FCFA	2026-04-10 12:59:43.980552
169	1	Administrateur	Ajout vente bande	5 sujets à 4500 FCFA	2026-04-10 13:00:00.614361
170	1	Administrateur	Ajout vente bande	4 sujets à 2000 FCFA	2026-04-10 13:00:13.119579
171	1	Administrateur	Ajout vente bande	6 sujets à 1500 FCFA	2026-04-10 13:00:30.676397
172	1	Administrateur	Ajout vente bande	7 sujets à 3500 FCFA	2026-04-10 13:00:54.716976
173	1	Administrateur	Ajout vente bande	1 sujets à 4000 FCFA	2026-04-10 13:01:24.998456
174	1	Administrateur	Ajout mortalité	1000 décès - Bande ID: 1	2026-04-10 15:15:12.735914
175	1	Administrateur	Suppression bande	ID: 9	2026-04-10 19:11:48.912864
176	1	Administrateur	Suppression bande	ID: 5	2026-04-10 19:11:55.310322
177	1	Administrateur	Suppression bande	ID: 4	2026-04-10 19:11:58.148159
178	1	Administrateur	Suppression bande	ID: 2	2026-04-10 19:12:00.702676
179	1	Administrateur	Suppression bande	ID: 3	2026-04-10 19:12:03.860033
\.


--
-- Data for Name: bande_depenses; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.bande_depenses (id, bande_id, designation, categorie, quantite, prix_unitaire) FROM stdin;
1	1	Poussin 1 j	poussins	3750.00	550.00
2	1	Koppo	autre	20.00	500.00
3	1	Bois	autre	1.00	100000.00
5	1	Pointes	autre	1.00	1000.00
6	1	Aliments	aliments	10.00	12745.00
9	1	Police	autre	1.00	1000.00
10	1	Carburant	transport	1.00	30000.00
12	1	Poulets	autre	1.00	10000.00
14	1	Carburant Mr Denis	transport	1.00	10000.00
17	1	Carburant	transport	1.00	5000.00
18	1	Carburant	transport	1.00	10000.00
23	1	Aliment croissance	aliments	60.00	7494.00
24	1	Aliment croissance	aliments	20.00	7809.00
26	1	Aliment croissance	aliments	15.00	7136.00
28	1	Marteau	autre	1.00	2000.00
29	1	Fide	autre	1.00	2500.00
31	1	Carburant	transport	1.00	5000.00
32	1	Balance	autre	1.00	2000.00
33	1	Koppo	autre	10.00	500.00
35	1	Ampoules	autre	1.00	7000.00
36	1	Koppo	autre	5.00	500.00
43	1	Salaire du mois de mars	main_oeuvre	1.00	110000.00
46	1	Mangeoires	autre	1.00	25000.00
15	1	Aliments démarrage	aliments	15.00	8370.00
19	1	Aliment démarrage	aliments	20.00	13161.00
20	1	Aliment démarrage	aliments	5.00	7375.00
21	1	Aliment démarrage	aliments	35.00	7521.00
34	1	Aliment finition	aliments	70.00	7404.00
40	1	Aliment finition	aliments	60.00	7543.00
41	1	Aliment finition	aliments	40.00	7585.00
22	1	Électricité	autre	1.00	9500.00
47	1	Électricité	autre	1.00	12000.00
48	1	Complément aliment	aliments	1.00	12000.00
42	1	Salaire du mois de février	main_oeuvre	1.00	110000.00
44	1	Salaire ventes et trésorerie	main_oeuvre	1.00	200000.00
11	1	Lait	aliments	1.00	25000.00
27	1	Compteur	autre	1.00	5000.00
45	1	Carburant	transport	1.00	15000.00
25	1	Concentré	aliments	8.00	52000.00
37	1	Concentré	aliments	7.00	52000.00
39	1	Concentré	aliments	10.00	52000.00
7	1	Concentré	aliments	3.00	52000.00
8	1	Concentré	aliments	7.00	52000.00
30	1	Sacs vides	autre	1.00	1000.00
38	1	Sacs vides	autre	1.00	1500.00
16	1	Vaccin	prophylaxie	1.00	14000.00
4	1	Désinfectant	prophylaxie	1.00	10000.00
13	1	Médicaments	prophylaxie	1.00	220000.00
50	1	Concentré	concentre	4.00	52000.00
51	1	Aliment finition	aliments	40.00	7840.00
52	1	Carburant	carburant	1.00	15000.00
53	1	Aliment finition	aliments	5.00	13614.00
54	1	Aliment finition	aliments	10.00	13501.00
\.


--
-- Data for Name: bande_ventes; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.bande_ventes (id, bande_id, date, quantite_vendue, prix_unitaire) FROM stdin;
2	1	2026-03-31	370	3100.00
3	1	2026-03-31	33	3000.00
4	1	2026-03-31	6	2800.00
5	1	2026-03-31	61	3100.00
6	1	2026-04-01	17	3400.00
7	1	2026-04-01	46	3300.00
8	1	2026-04-01	33	3200.00
9	1	2026-04-01	7	3000.00
10	1	2026-04-01	5	3100.00
11	1	2026-04-01	1	2700.00
12	1	2026-04-02	11	2900.00
13	1	2026-04-02	8	2800.00
14	1	2026-04-02	131	3100.00
15	1	2026-03-31	222	3100.00
16	1	2020-09-29	401	2800.00
17	1	2026-03-30	60	3200.00
18	1	2026-03-30	31	3100.00
19	1	2026-04-03	46	3100.00
20	1	2026-04-03	24	3200.00
21	1	2026-04-03	8	3200.00
22	1	2026-04-03	3	4500.00
23	1	2026-04-05	92	3200.00
24	1	2026-04-05	8	3100.00
25	1	2026-04-05	13	4500.00
26	1	2026-04-05	6	3000.00
27	1	2026-04-05	1	5000.00
28	1	2026-04-04	40	3200.00
29	1	2026-04-04	11	3500.00
30	1	2026-04-04	1	5000.00
31	1	2026-04-04	2	4500.00
32	1	2026-04-06	31	4500.00
33	1	2026-04-06	4	4300.00
34	1	2026-04-06	72	3300.00
35	1	2026-04-06	6	3000.00
36	1	2026-04-06	3	2900.00
37	1	2026-04-06	3	3000.00
38	1	2026-04-07	6	5000.00
39	1	2026-04-07	8	3300.00
40	1	2026-04-07	65	4600.00
41	1	2026-04-07	5	4500.00
42	1	2026-04-07	25	4200.00
43	1	2026-04-07	4	3000.00
44	1	2026-04-07	3	4000.00
45	1	2026-04-08	12	5000.00
46	1	2026-04-08	66	4800.00
47	1	2026-04-08	21	4600.00
48	1	2026-04-08	6	4500.00
49	1	2026-04-08	11	3200.00
50	1	2026-04-08	4	3000.00
51	1	2026-04-08	1	2000.00
52	1	2026-04-09	105	4800.00
53	1	2026-04-09	25	4800.00
54	1	2026-04-09	50	3300.00
55	1	2026-04-09	3	3500.00
56	1	2026-04-09	76	4800.00
57	1	2026-04-09	13	5000.00
58	1	2026-04-09	1	5500.00
59	1	2026-04-09	13	3200.00
60	1	2026-04-09	2	3100.00
61	1	2026-04-09	5	4500.00
62	1	2026-04-09	4	2000.00
63	1	2026-04-09	6	1500.00
64	1	2026-04-09	7	3500.00
65	1	2026-04-09	1	4000.00
\.


--
-- Data for Name: bandes; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.bandes (id, numero, nom, sujets_depart, nombre_deces, valeur_materiel_fixe, statut, created_at, date_de_depart) FROM stdin;
1	1	Bande 1	3901	176	6000000.00	active	2026-04-07 17:13:54.443368	2026-02-17
\.


--
-- Data for Name: charges_fixes; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.charges_fixes (id, bande_id, loyer) FROM stdin;
1	1	50000.00
\.


--
-- Data for Name: consommation_aliment; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.consommation_aliment (id, bande_id, date, quantite_kg) FROM stdin;
159	1	2026-02-17	70.00
160	1	2026-02-18	80.00
161	1	2026-02-19	100.00
162	1	2026-02-20	120.00
163	1	2026-02-21	120.00
164	1	2026-02-22	120.00
165	1	2026-02-24	130.00
166	1	2026-02-25	150.00
167	1	2026-02-26	150.00
168	1	2026-02-27	150.00
169	1	2026-02-28	150.00
170	1	2026-03-01	280.00
171	1	2026-03-02	280.00
172	1	2026-03-10	450.00
173	1	2026-03-11	500.00
174	1	2026-03-12	400.00
175	1	2026-03-13	400.00
176	1	2026-03-14	500.00
177	1	2026-03-15	500.00
178	1	2026-03-17	500.00
179	1	2026-03-18	250.00
180	1	2026-03-19	1100.00
181	1	2026-03-20	400.00
182	1	2026-03-21	500.00
183	1	2026-03-22	650.00
184	1	2026-03-24	450.00
185	1	2026-03-25	1000.00
186	1	2026-03-26	300.00
187	1	2026-03-27	300.00
188	1	2026-03-28	900.00
189	1	2026-03-29	350.00
190	1	2026-03-30	1600.00
191	1	2026-03-31	0.00
192	1	2026-04-01	200.00
193	1	2026-04-02	650.00
194	1	2026-04-03	500.00
195	1	2026-04-04	500.00
196	1	2026-04-05	100.00
197	1	2026-04-06	900.00
198	1	2026-04-07	195.00
\.


--
-- Data for Name: consommation_eau; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.consommation_eau (id, bande_id, date, age_jours, quantite_litres) FROM stdin;
217	1	2026-02-17	1	80.00
218	1	2026-02-18	2	120.00
219	1	2026-02-19	3	180.00
220	1	2026-02-20	4	300.00
221	1	2026-02-21	5	320.00
222	1	2026-02-22	6	320.00
223	1	2026-02-24	8	330.00
224	1	2026-02-25	9	350.00
225	1	2026-02-26	10	350.00
226	1	2026-02-27	11	380.00
227	1	2026-02-28	12	400.00
228	1	2026-03-01	13	420.00
229	1	2026-03-02	14	450.00
230	1	2026-03-10	22	630.00
231	1	2026-03-11	23	650.00
232	1	2026-03-12	24	670.00
233	1	2026-03-13	25	670.00
234	1	2026-03-14	26	680.00
235	1	2026-03-15	27	680.00
236	1	2026-03-17	29	700.00
237	1	2026-03-18	30	700.00
238	1	2026-03-19	31	720.00
239	1	2026-03-20	32	740.00
240	1	2026-03-21	33	740.00
241	1	2026-03-22	34	740.00
242	1	2026-03-24	36	750.00
243	1	2026-03-25	37	750.00
244	1	2026-03-26	38	780.00
245	1	2026-03-27	39	800.00
246	1	2026-03-28	40	800.00
247	1	2026-03-29	41	820.00
248	1	2026-03-30	42	820.00
249	1	2026-03-31	43	880.00
250	1	2026-04-01	44	850.00
251	1	2026-04-02	45	850.00
252	1	2026-04-03	46	850.00
253	1	2026-04-04	47	850.00
254	1	2026-04-05	48	850.00
255	1	2026-04-06	49	850.00
256	1	2026-04-07	50	850.00
\.


--
-- Data for Name: depenses_batiment; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.depenses_batiment (id, designation, quantite, prix_unitaire, categorie, date, commentaire) FROM stdin;
1	Achats de planches	1.00	400000.00	materiaux	\N	\N
2	Défrichage	1.00	25000.00	main_oeuvre	\N	\N
3	Creusage fouille bâtiment principal	1.00	25000.00	main_oeuvre	\N	\N
4	Devis bâtiment	1.00	10000.00	divers	\N	\N
5	Tonnes de graviers 5/15	21.00	7500.00	materiaux	\N	\N
6	Tonnes de sable carrière	22.00	5500.00	materiaux	\N	\N
7	Transports sables + Taxe	1.00	40000.00	transport	\N	\N
8	Transports graviers + Taxe	1.00	40000.00	transport	\N	\N
9	Carburant	1.00	15000.00	carburant	\N	\N
10	Boissons	1.00	3700.00	divers	\N	\N
11	Coupage de bois	1.00	35000.00	materiaux	\N	\N
12	Creusage fouille annexe	1.00	15000.00	main_oeuvre	\N	\N
13	Location chambre pour le matériel (1 mois)	1.00	5000.00	divers	\N	\N
14	Cubitainer d'eau	1.00	5000.00	divers	\N	\N
15	Location cubitainer d'eau	1.00	2500.00	divers	\N	\N
16	Dédommagement découpage arbre	1.00	5000.00	divers	\N	\N
17	Carburant	1.00	15000.00	carburant	\N	\N
18	Matériaux de construction (divers)	1.00	115000.00	materiaux	\N	\N
19	Avance matériaux de construction	1.00	100000.00	materiaux	\N	\N
20	Carburant	1.00	10000.00	carburant	\N	\N
21	Sac de ciment	4.00	5100.00	materiaux	\N	\N
22	Barres de fer de 6 + barres de fer de 8	1.00	9000.00	materiaux	\N	\N
23	Parpaings	40.00	200.00	materiaux	\N	\N
24	Solde parpaings	1.00	15000.00	materiaux	\N	\N
25	Main-d'œuvre	1.00	13000.00	main_oeuvre	\N	\N
26	Déjeuner	1.00	1000.00	divers	\N	\N
27	Garage (réparation véhicule)	1.00	5000.00	transport	\N	\N
28	Sac de ciment	2.00	5200.00	materiaux	\N	\N
29	Location chambre	1.00	5000.00	divers	\N	\N
30	Carburant	1.00	5000.00	carburant	\N	\N
31	Déjeuner	1.00	1000.00	divers	\N	\N
32	Main-d'œuvre	1.00	10000.00	main_oeuvre	\N	\N
33	Parpaings	100.00	200.00	materiaux	\N	\N
34	Parpaings	400.00	225.00	materiaux	\N	\N
35	Fers de 8	6.00	2900.00	materiaux	\N	\N
36	Sacs de ciment	4.00	5100.00	materiaux	\N	\N
37	pelle ronde	1.00	2250.00	divers	\N	\N
38	Fil d'attache	1.00	2100.00	materiaux	\N	\N
39	Cadres + étriers	1.00	10000.00	materiaux	\N	\N
40	Main-d'œuvre	1.00	13000.00	main_oeuvre	\N	\N
41	Déjeuner	1.00	2000.00	divers	\N	\N
43	Fers de 8	3.00	2850.00	materiaux	\N	\N
44	Sacs de ciment	3.00	5100.00	materiaux	\N	\N
45	Main-d'œuvre	1.00	10000.00	main_oeuvre	\N	\N
46	Déjeuner	1.00	1500.00	divers	\N	\N
47	2e versement eau	1.00	5000.00	divers	\N	\N
48	Sacs de ciment	3.00	5200.00	materiaux	\N	\N
49	Fer de 8	1.00	2900.00	materiaux	\N	\N
50	Fer de 6	1.00	1600.00	materiaux	\N	\N
51	Manche de pioche	1.00	250.00	divers	\N	\N
52	Main-d'œuvre	1.00	10000.00	main_oeuvre	\N	\N
54	Sac de ciment	1.00	5300.00	materiaux	\N	\N
55	Main-d'œuvre	1.00	13000.00	main_oeuvre	\N	\N
56	Parpaings de 12	1.00	30000.00	materiaux	\N	\N
57	Carburant	1.00	5000.00	carburant	\N	\N
58	Déjeuner	1.00	2000.00	divers	\N	\N
59	Sacs de ciment	2.00	5200.00	materiaux	\N	\N
60	Main-d'œuvre	1.00	10000.00	main_oeuvre	\N	\N
61	Déjeuner	1.00	1500.00	divers	\N	\N
62	Transport	1.00	1500.00	transport	\N	\N
63	Ciment	4.00	5200.00	materiaux	\N	\N
64	Parpaings	400.00	225.00	materiaux	\N	\N
65	Main-d'œuvre	1.00	10000.00	main_oeuvre	\N	\N
66	Fers de 8	5.00	27400.00	materiaux	\N	\N
67	Main-d'œuvre	1.00	10000.00	main_oeuvre	\N	\N
69	Dépense + transport	1.00	3000.00	transport	\N	\N
70	Fers de 8	6.00	2900.00	materiaux	\N	\N
71	Fer de 6	1.00	1500.00	materiaux	\N	\N
72	Sacs de ciment	2.00	5200.00	materiaux	\N	\N
73	Fil d'attache	2.00	750.00	materiaux	\N	\N
74	Parpaings de 12	20.00	200.00	materiaux	\N	\N
75	Transport	1.00	1500.00	transport	\N	\N
76	Main-d'œuvre	1.00	10000.00	main_oeuvre	\N	\N
77	Garage (réparation véhicule)	1.00	8500.00	transport	\N	\N
78	Transport	1.00	2000.00	transport	2026-04-07	\N
79	Sac de ciment 	4.00	5200.00	materiaux	2026-04-07	\N
80	Parpaing	100.00	200.00	materiaux	2026-04-07	\N
81	Main d‘oeuvre	1.00	13000.00	main_oeuvre	2026-04-07	\N
82	Fonds de 15 pour coffrage 	2.00	2500.00	materiaux	2026-04-07	\N
83	Déjeuner	1.00	1000.00	divers	2026-04-07	\N
84	Fers de 8	4.00	2900.00	materiaux	2026-04-08	\N
85	Fil pour etriller lisse en 5.5 prometal en 12M	2.00	1600.00	materiaux	2026-04-08	\N
86	Fil d'attache	2.00	850.00	materiaux	2026-04-08	\N
87	Main-d'œuvre	1.00	10000.00	main_oeuvre	2026-04-08	\N
42	Carburant	1.00	5000.00	carburant	\N	\N
53	Carburant	1.00	5000.00	carburant	\N	\N
68	Carburant	1.00	10000.00	carburant	\N	\N
\.


--
-- Data for Name: depenses_puits; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.depenses_puits (id, designation, quantite, prix_unitaire, categorie, date, commentaire) FROM stdin;
1	Avance main-d'œuvre	1.00	50000.00	main_oeuvre	\N	\N
2	Flash Band de 10 (détail)	2.00	1000.00	materiaux	\N	\N
3	Avance main-d'œuvre	1.00	50000.00	main_oeuvre	\N	\N
4	Avance main-d'œuvre	1.00	50000.00	main_oeuvre	\N	\N
5	Corde	1.00	19000.00	materiaux	\N	\N
6	Buse	18.00	13000.00	materiaux	\N	\N
7	Avance main-d'œuvre	1.00	100000.00	main_oeuvre	\N	\N
8	Boissons	1.00	9000.00	divers	2026-04-08	Casier de biere pour creuseur de puit
9	Avance main-d'œuvre	1.00	60000.00	main_oeuvre	2026-04-08	À confirmer chez papa
\.


--
-- Data for Name: depenses_vente; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.depenses_vente (id, bande_id, designation, montant) FROM stdin;
\.


--
-- Data for Name: devis_construction; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.devis_construction (id, batiment_estime, batiment_notes, carburant_estime, updated_at) FROM stdin;
1	3525000.00	\N	150000.00	2026-04-07 17:13:54.240631
\.


--
-- Data for Name: financement; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.financement (id, nom, montant, date, created_at) FROM stdin;
1	Papa	600000.00	2024-01-01	2026-04-07 17:13:54.192016
2	Maman	1500000.00	2024-01-01	2026-04-07 17:13:54.192016
3	Murielle	1200000.00	2024-01-01	2026-04-07 17:13:54.192016
4	Jeriel	1800000.00	2024-01-01	2026-04-07 17:13:54.192016
\.


--
-- Data for Name: mortalite_journaliere; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.mortalite_journaliere (id, bande_id, date, age_jours, deces_jour) FROM stdin;
162	1	2026-02-17	1	3
163	1	2026-02-18	2	12
164	1	2026-02-19	3	16
165	1	2026-02-20	4	13
166	1	2026-02-21	5	9
167	1	2026-02-22	6	10
168	1	2026-02-23	7	4
169	1	2026-02-24	8	0
170	1	2026-02-25	9	3
171	1	2026-02-26	10	5
172	1	2026-02-27	11	5
173	1	2026-02-28	12	4
174	1	2026-03-01	13	1
175	1	2026-03-02	14	6
176	1	2026-03-10	22	1
177	1	2026-03-11	23	3
178	1	2026-03-12	24	1
179	1	2026-03-13	25	1
180	1	2026-03-14	26	0
181	1	2026-03-15	27	3
182	1	2026-03-16	28	4
183	1	2026-03-17	29	2
184	1	2026-03-18	30	4
185	1	2026-03-19	31	2
186	1	2026-03-20	32	0
187	1	2026-03-21	33	3
188	1	2026-03-22	34	2
189	1	2026-03-23	35	0
190	1	2026-03-24	36	0
191	1	2026-03-25	37	4
192	1	2026-03-26	38	3
193	1	2026-03-27	39	2
194	1	2026-03-28	40	3
195	1	2026-03-29	41	3
196	1	2026-03-30	42	3
197	1	2026-03-31	43	0
198	1	2026-04-01	44	0
199	1	2026-04-02	45	1
200	1	2026-04-03	46	3
201	1	2026-04-04	47	1
202	1	2026-04-05	48	5
203	1	2026-04-06	49	22
204	1	2026-04-07	50	9
\.


--
-- Data for Name: observations_journal; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.observations_journal (id, bande_id, date, age_jours, contenu) FROM stdin;
\.


--
-- Data for Name: parametres; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.parametres (id, cle, valeur, description, categorie, updated_at) FROM stdin;
1	taux_depreciation_materiel	10	Taux de dépréciation annuel du matériel fixe (%)	Charges fixes	2026-04-07 17:13:54.645867
3	seuil_mortalite_alerte_jour	3	Taux de mortalité journalier déclenchant une alerte rouge (%)	Alertes	2026-04-07 17:13:54.645867
4	seuil_mortalite_alerte_cumul	5	Taux de mortalité cumulé affiché en rouge (%)	Alertes	2026-04-07 17:13:54.645867
5	seuil_poids_alerte	90	Pourcentage minimum du poids objectif avant alerte (%)	Alertes	2026-04-07 17:13:54.645867
6	ic_bon	1.8	Indice de conversion considéré comme bon (≤)	Indice de conversion	2026-04-07 17:13:54.645867
7	ic_moyen	2.2	Indice de conversion considéré comme moyen (≤)	Indice de conversion	2026-04-07 17:13:54.645867
8	budget_batiment_defaut	3525000	Budget bâtiment par défaut si aucun devis (FCFA)	Budget construction	2026-04-07 17:13:54.645867
9	budget_carburant_defaut	150000	Budget carburant par défaut si aucun devis (FCFA)	Budget construction	2026-04-07 17:13:54.645867
10	vaccin_j1_nom	Désinfection et installation	Nom du traitement jour 1	Calendrier vaccinal	2026-04-07 17:13:54.645867
11	vaccin_j1_jour	1	Jour prévu pour le traitement 1	Calendrier vaccinal	2026-04-07 17:13:54.645867
12	vaccin_j1_description	Préparation du poulailler	Description du traitement jour 1	Calendrier vaccinal	2026-04-07 17:13:54.645867
13	vaccin_j7_nom	Vaccin Newcastle	Nom du vaccin jour 7	Calendrier vaccinal	2026-04-07 17:13:54.645867
14	vaccin_j7_jour	7	Jour prévu pour le vaccin Newcastle	Calendrier vaccinal	2026-04-07 17:13:54.645867
15	vaccin_j7_description	Première vaccination contre Newcastle	Description vaccin jour 7	Calendrier vaccinal	2026-04-07 17:13:54.645867
16	vaccin_j14_nom	Vaccin Gumboro	Nom du vaccin jour 14	Calendrier vaccinal	2026-04-07 17:13:54.645867
17	vaccin_j14_jour	14	Jour prévu pour le vaccin Gumboro	Calendrier vaccinal	2026-04-07 17:13:54.645867
18	vaccin_j14_description	Vaccination contre la maladie de Gumboro	Description vaccin jour 14	Calendrier vaccinal	2026-04-07 17:13:54.645867
19	vaccin_j21_nom	Rappel Newcastle	Nom du vaccin jour 21	Calendrier vaccinal	2026-04-07 17:13:54.645867
20	vaccin_j21_jour	21	Jour prévu pour le rappel Newcastle	Calendrier vaccinal	2026-04-07 17:13:54.645867
21	vaccin_j21_description	Rappel de vaccination Newcastle	Description vaccin jour 21	Calendrier vaccinal	2026-04-07 17:13:54.645867
22	vaccin_j28_nom	Vaccin Bronchite infectieuse	Nom du vaccin jour 28	Calendrier vaccinal	2026-04-07 17:13:54.645867
23	vaccin_j28_jour	28	Jour prévu pour le vaccin bronchite infectieuse	Calendrier vaccinal	2026-04-07 17:13:54.645867
24	vaccin_j28_description	Vaccination contre la bronchite infectieuse	Description vaccin jour 28	Calendrier vaccinal	2026-04-07 17:13:54.645867
2	taux_imprevus	0	Taux pour imprévus sur dépenses de production (%)	Charges fixes	2026-04-07 17:42:50.017
\.


--
-- Data for Name: pesees; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.pesees (id, bande_id, date, age_jours, poids_moyen_g, objectif_poids_g) FROM stdin;
150	1	2026-02-18	2	95.00	\N
151	1	2026-02-19	3	135.00	\N
152	1	2026-02-20	4	140.00	\N
153	1	2026-02-21	5	155.00	\N
154	1	2026-03-02	14	470.00	\N
155	1	2026-03-10	22	1190.00	\N
156	1	2026-03-11	23	1250.00	\N
157	1	2026-03-12	24	1355.00	\N
158	1	2026-03-13	25	1408.00	\N
159	1	2026-03-14	26	1350.00	\N
160	1	2026-03-17	29	1410.00	\N
161	1	2026-03-18	30	1445.00	\N
162	1	2026-03-19	31	1630.00	\N
163	1	2026-03-20	32	1905.00	\N
164	1	2026-03-21	33	1945.00	\N
165	1	2026-03-24	36	2000.00	\N
166	1	2026-03-25	37	2138.00	\N
167	1	2026-03-27	39	2438.00	\N
\.


--
-- Data for Name: puits_items_devis; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.puits_items_devis (id, designation, quantite, prix_unitaire) FROM stdin;
1	Puits (forage et équipement)	1.00	1370000.00
\.


--
-- Data for Name: remboursements; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.remboursements (id, investisseur_nom, montant, date, commentaire, created_at) FROM stdin;
\.


--
-- Data for Name: session; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.session (sid, sess, expire) FROM stdin;
Ts8PoLoYJWfpfvuPkbump73RDBvVbcp1	{"cookie":{"originalMaxAge":604800000,"expires":"2026-04-17T12:28:04.708Z","secure":true,"httpOnly":true,"path":"/","sameSite":"lax"},"userId":1}	2026-04-17 17:13:42
A7o3B27IuOi2uOugBoct2z7RWsKYoK25	{"cookie":{"originalMaxAge":604800000,"expires":"2026-04-15T17:35:16.830Z","secure":true,"httpOnly":true,"path":"/","sameSite":"lax"},"userId":1}	2026-04-17 21:18:09
8groTdrO8Y3pQFBNdpir5-EgvwCANqzJ	{"cookie":{"originalMaxAge":604800000,"expires":"2026-04-15T21:54:16.815Z","secure":true,"httpOnly":true,"path":"/","sameSite":"lax"},"userId":4}	2026-04-17 16:40:18
\.


--
-- Data for Name: sorties_argent; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.sorties_argent (id, date, decaisse, depense, created_at, commentaire, photo_url) FROM stdin;
\.


--
-- Data for Name: sorties_carburant; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.sorties_carburant (id, date, montant, created_at, commentaire, photo_url) FROM stdin;
\.


--
-- Data for Name: stock_aliments; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.stock_aliments (id, designation, type, quantite_kg, prix_unitaire, fournisseur, date, commentaire, created_at) FROM stdin;
\.


--
-- Data for Name: stock_medicaments; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.stock_medicaments (id, nom, type, quantite, unite, date_peremption, fournisseur, date, commentaire, created_at) FROM stdin;
\.


--
-- Data for Name: traitements; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.traitements (id, bande_id, date, age_jours, produit, type, dosage, observations) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.users (id, username, password, role, nom, created_at) FROM stdin;
1	admin	$2b$10$E6yX.mgXNCbhlLGPtVxafe50bXuRKOoRtFvgXDXfl2cqFSeXnTtxK	admin	Administrateur	2026-04-07 17:13:54.142694
3	gestionnaire	gest123	gestionnaire	Gestionnaire	2026-04-07 17:13:54.142694
4	jeriel	$2b$10$lrG.vrCcAyvLE1xanQguAOXi4sTIGF24gjVW6icg1NfzFHyTBUPzq	admin	Jeriel Mbiedou 	2026-04-07 17:24:25.14737
5	Murielle	$2b$10$PJz/uLsllZnCoBw7ogZam.v89.jPooLkh.rhTXhtqj1jbyKmN8Zr2	lecteur	Murielle Mbiedou	2026-04-08 15:38:45.974021
\.


--
-- Data for Name: vaccinations; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.vaccinations (id, bande_id, jour_prevu, nom, description, fait, date_fait, commentaire) FROM stdin;
1	1	1	Désinfection et installation	Préparation du poulailler	oui	2026-04-07	\N
2	1	7	Vaccin Newcastle	Première vaccination contre Newcastle	oui	2026-04-10	\N
3	1	14	Vaccin Gumboro	Vaccination contre la maladie de Gumboro	oui	2026-04-10	\N
4	1	21	Rappel Newcastle	Rappel de vaccination Newcastle	oui	2026-04-10	\N
5	1	28	Vaccin Bronchite infectieuse	Vaccination contre la bronchite infectieuse	oui	2026-04-10	\N
\.


--
-- Name: replit_database_migrations_v1_id_seq; Type: SEQUENCE SET; Schema: _system; Owner: neondb_owner
--

SELECT pg_catalog.setval('_system.replit_database_migrations_v1_id_seq', 3, true);


--
-- Name: activity_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.activity_log_id_seq', 179, true);


--
-- Name: bande_depenses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.bande_depenses_id_seq', 54, true);


--
-- Name: bande_ventes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.bande_ventes_id_seq', 65, true);


--
-- Name: bandes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.bandes_id_seq', 9, true);


--
-- Name: charges_fixes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.charges_fixes_id_seq', 8, true);


--
-- Name: consommation_aliment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.consommation_aliment_id_seq', 275, true);


--
-- Name: consommation_eau_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.consommation_eau_id_seq', 334, true);


--
-- Name: depenses_batiment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.depenses_batiment_id_seq', 87, true);


--
-- Name: depenses_puits_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.depenses_puits_id_seq', 9, true);


--
-- Name: depenses_vente_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.depenses_vente_id_seq', 1, true);


--
-- Name: devis_construction_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.devis_construction_id_seq', 1, true);


--
-- Name: financement_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.financement_id_seq', 4, true);


--
-- Name: mortalite_journaliere_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.mortalite_journaliere_id_seq', 275, true);


--
-- Name: observations_journal_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.observations_journal_id_seq', 99, true);


--
-- Name: parametres_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.parametres_id_seq', 24, true);


--
-- Name: pesees_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.pesees_id_seq', 228, true);


--
-- Name: puits_items_devis_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.puits_items_devis_id_seq', 1, true);


--
-- Name: remboursements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.remboursements_id_seq', 1, false);


--
-- Name: sorties_argent_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.sorties_argent_id_seq', 1, false);


--
-- Name: sorties_carburant_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.sorties_carburant_id_seq', 1, false);


--
-- Name: stock_aliments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.stock_aliments_id_seq', 1, false);


--
-- Name: stock_medicaments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.stock_medicaments_id_seq', 1, false);


--
-- Name: traitements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.traitements_id_seq', 80, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.users_id_seq', 5, true);


--
-- Name: vaccinations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.vaccinations_id_seq', 27, true);


--
-- Name: replit_database_migrations_v1 replit_database_migrations_v1_pkey; Type: CONSTRAINT; Schema: _system; Owner: neondb_owner
--

ALTER TABLE ONLY _system.replit_database_migrations_v1
    ADD CONSTRAINT replit_database_migrations_v1_pkey PRIMARY KEY (id);


--
-- Name: activity_log activity_log_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.activity_log
    ADD CONSTRAINT activity_log_pkey PRIMARY KEY (id);


--
-- Name: bande_depenses bande_depenses_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.bande_depenses
    ADD CONSTRAINT bande_depenses_pkey PRIMARY KEY (id);


--
-- Name: bande_ventes bande_ventes_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.bande_ventes
    ADD CONSTRAINT bande_ventes_pkey PRIMARY KEY (id);


--
-- Name: bandes bandes_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.bandes
    ADD CONSTRAINT bandes_pkey PRIMARY KEY (id);


--
-- Name: charges_fixes charges_fixes_bande_id_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.charges_fixes
    ADD CONSTRAINT charges_fixes_bande_id_unique UNIQUE (bande_id);


--
-- Name: charges_fixes charges_fixes_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.charges_fixes
    ADD CONSTRAINT charges_fixes_pkey PRIMARY KEY (id);


--
-- Name: consommation_aliment consommation_aliment_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.consommation_aliment
    ADD CONSTRAINT consommation_aliment_pkey PRIMARY KEY (id);


--
-- Name: consommation_eau consommation_eau_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.consommation_eau
    ADD CONSTRAINT consommation_eau_pkey PRIMARY KEY (id);


--
-- Name: depenses_batiment depenses_batiment_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.depenses_batiment
    ADD CONSTRAINT depenses_batiment_pkey PRIMARY KEY (id);


--
-- Name: depenses_puits depenses_puits_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.depenses_puits
    ADD CONSTRAINT depenses_puits_pkey PRIMARY KEY (id);


--
-- Name: depenses_vente depenses_vente_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.depenses_vente
    ADD CONSTRAINT depenses_vente_pkey PRIMARY KEY (id);


--
-- Name: devis_construction devis_construction_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.devis_construction
    ADD CONSTRAINT devis_construction_pkey PRIMARY KEY (id);


--
-- Name: financement financement_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.financement
    ADD CONSTRAINT financement_pkey PRIMARY KEY (id);


--
-- Name: mortalite_journaliere mortalite_journaliere_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.mortalite_journaliere
    ADD CONSTRAINT mortalite_journaliere_pkey PRIMARY KEY (id);


--
-- Name: observations_journal observations_journal_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.observations_journal
    ADD CONSTRAINT observations_journal_pkey PRIMARY KEY (id);


--
-- Name: parametres parametres_cle_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.parametres
    ADD CONSTRAINT parametres_cle_unique UNIQUE (cle);


--
-- Name: parametres parametres_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.parametres
    ADD CONSTRAINT parametres_pkey PRIMARY KEY (id);


--
-- Name: pesees pesees_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.pesees
    ADD CONSTRAINT pesees_pkey PRIMARY KEY (id);


--
-- Name: puits_items_devis puits_items_devis_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.puits_items_devis
    ADD CONSTRAINT puits_items_devis_pkey PRIMARY KEY (id);


--
-- Name: remboursements remboursements_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.remboursements
    ADD CONSTRAINT remboursements_pkey PRIMARY KEY (id);


--
-- Name: session session_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (sid);


--
-- Name: sorties_argent sorties_argent_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.sorties_argent
    ADD CONSTRAINT sorties_argent_pkey PRIMARY KEY (id);


--
-- Name: sorties_carburant sorties_carburant_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.sorties_carburant
    ADD CONSTRAINT sorties_carburant_pkey PRIMARY KEY (id);


--
-- Name: stock_aliments stock_aliments_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.stock_aliments
    ADD CONSTRAINT stock_aliments_pkey PRIMARY KEY (id);


--
-- Name: stock_medicaments stock_medicaments_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.stock_medicaments
    ADD CONSTRAINT stock_medicaments_pkey PRIMARY KEY (id);


--
-- Name: traitements traitements_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.traitements
    ADD CONSTRAINT traitements_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_unique UNIQUE (username);


--
-- Name: vaccinations vaccinations_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.vaccinations
    ADD CONSTRAINT vaccinations_pkey PRIMARY KEY (id);


--
-- Name: idx_replit_database_migrations_v1_build_id; Type: INDEX; Schema: _system; Owner: neondb_owner
--

CREATE UNIQUE INDEX idx_replit_database_migrations_v1_build_id ON _system.replit_database_migrations_v1 USING btree (build_id);


--
-- Name: IDX_session_expire; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "IDX_session_expire" ON public.session USING btree (expire);


--
-- Name: idx_session_expire; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_session_expire ON public.session USING btree (expire);


--
-- Name: activity_log activity_log_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.activity_log
    ADD CONSTRAINT activity_log_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: bande_depenses bande_depenses_bande_id_bandes_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.bande_depenses
    ADD CONSTRAINT bande_depenses_bande_id_bandes_id_fk FOREIGN KEY (bande_id) REFERENCES public.bandes(id) ON DELETE CASCADE;


--
-- Name: bande_ventes bande_ventes_bande_id_bandes_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.bande_ventes
    ADD CONSTRAINT bande_ventes_bande_id_bandes_id_fk FOREIGN KEY (bande_id) REFERENCES public.bandes(id) ON DELETE CASCADE;


--
-- Name: charges_fixes charges_fixes_bande_id_bandes_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.charges_fixes
    ADD CONSTRAINT charges_fixes_bande_id_bandes_id_fk FOREIGN KEY (bande_id) REFERENCES public.bandes(id) ON DELETE CASCADE;


--
-- Name: consommation_aliment consommation_aliment_bande_id_bandes_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.consommation_aliment
    ADD CONSTRAINT consommation_aliment_bande_id_bandes_id_fk FOREIGN KEY (bande_id) REFERENCES public.bandes(id) ON DELETE CASCADE;


--
-- Name: consommation_eau consommation_eau_bande_id_bandes_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.consommation_eau
    ADD CONSTRAINT consommation_eau_bande_id_bandes_id_fk FOREIGN KEY (bande_id) REFERENCES public.bandes(id) ON DELETE CASCADE;


--
-- Name: depenses_vente depenses_vente_bande_id_bandes_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.depenses_vente
    ADD CONSTRAINT depenses_vente_bande_id_bandes_id_fk FOREIGN KEY (bande_id) REFERENCES public.bandes(id) ON DELETE CASCADE;


--
-- Name: mortalite_journaliere mortalite_journaliere_bande_id_bandes_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.mortalite_journaliere
    ADD CONSTRAINT mortalite_journaliere_bande_id_bandes_id_fk FOREIGN KEY (bande_id) REFERENCES public.bandes(id) ON DELETE CASCADE;


--
-- Name: observations_journal observations_journal_bande_id_bandes_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.observations_journal
    ADD CONSTRAINT observations_journal_bande_id_bandes_id_fk FOREIGN KEY (bande_id) REFERENCES public.bandes(id) ON DELETE CASCADE;


--
-- Name: pesees pesees_bande_id_bandes_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.pesees
    ADD CONSTRAINT pesees_bande_id_bandes_id_fk FOREIGN KEY (bande_id) REFERENCES public.bandes(id) ON DELETE CASCADE;


--
-- Name: traitements traitements_bande_id_bandes_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.traitements
    ADD CONSTRAINT traitements_bande_id_bandes_id_fk FOREIGN KEY (bande_id) REFERENCES public.bandes(id) ON DELETE CASCADE;


--
-- Name: vaccinations vaccinations_bande_id_bandes_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.vaccinations
    ADD CONSTRAINT vaccinations_bande_id_bandes_id_fk FOREIGN KEY (bande_id) REFERENCES public.bandes(id) ON DELETE CASCADE;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


--
-- PostgreSQL database dump complete
--

\unrestrict 9pc7Nqf5OnPqN3tRNfZhKKlyTVFsEOOQ8lXYKB1hdVAO2ljJEkOa8OcejQPmpDl

