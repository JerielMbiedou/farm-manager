--
-- PostgreSQL database dump
--

\restrict 8RwfSCtcJcM51uJfZEtdCTjH9JGdNDai69u3at3QQCtNKJpr5pr9qcy2O3f4BwI

-- Dumped from database version 16.10
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

ALTER TABLE IF EXISTS ONLY public.vaccinations DROP CONSTRAINT IF EXISTS vaccinations_bande_id_bandes_id_fk;
ALTER TABLE IF EXISTS ONLY public.traitements DROP CONSTRAINT IF EXISTS traitements_bande_id_bandes_id_fk;
ALTER TABLE IF EXISTS ONLY public.pesees DROP CONSTRAINT IF EXISTS pesees_bande_id_bandes_id_fk;
ALTER TABLE IF EXISTS ONLY public.observations_journal DROP CONSTRAINT IF EXISTS observations_journal_bande_id_bandes_id_fk;
ALTER TABLE IF EXISTS ONLY public.mortalite_journaliere DROP CONSTRAINT IF EXISTS mortalite_journaliere_bande_id_bandes_id_fk;
ALTER TABLE IF EXISTS ONLY public.depenses_vente DROP CONSTRAINT IF EXISTS depenses_vente_bande_id_bandes_id_fk;
ALTER TABLE IF EXISTS ONLY public.consommation_eau DROP CONSTRAINT IF EXISTS consommation_eau_bande_id_bandes_id_fk;
ALTER TABLE IF EXISTS ONLY public.consommation_aliment DROP CONSTRAINT IF EXISTS consommation_aliment_bande_id_bandes_id_fk;
ALTER TABLE IF EXISTS ONLY public.charges_fixes DROP CONSTRAINT IF EXISTS charges_fixes_bande_id_bandes_id_fk;
ALTER TABLE IF EXISTS ONLY public.chantier_lots DROP CONSTRAINT IF EXISTS chantier_lots_chantier_id_chantiers_id_fk;
ALTER TABLE IF EXISTS ONLY public.chantier_devis_lignes DROP CONSTRAINT IF EXISTS chantier_devis_lignes_lot_id_chantier_lots_id_fk;
ALTER TABLE IF EXISTS ONLY public.chantier_devis_lignes DROP CONSTRAINT IF EXISTS chantier_devis_lignes_chantier_id_chantiers_id_fk;
ALTER TABLE IF EXISTS ONLY public.chantier_depenses DROP CONSTRAINT IF EXISTS chantier_depenses_lot_id_chantier_lots_id_fk;
ALTER TABLE IF EXISTS ONLY public.chantier_depenses DROP CONSTRAINT IF EXISTS chantier_depenses_chantier_id_chantiers_id_fk;
ALTER TABLE IF EXISTS ONLY public.bande_ventes DROP CONSTRAINT IF EXISTS bande_ventes_bande_id_bandes_id_fk;
ALTER TABLE IF EXISTS ONLY public.bande_depenses DROP CONSTRAINT IF EXISTS bande_depenses_bande_id_bandes_id_fk;
ALTER TABLE IF EXISTS ONLY public.bande_actifs DROP CONSTRAINT IF EXISTS bande_actifs_bande_id_bandes_id_fk;
ALTER TABLE IF EXISTS ONLY public.bande_actifs DROP CONSTRAINT IF EXISTS bande_actifs_actif_id_actifs_id_fk;
ALTER TABLE IF EXISTS ONLY public.activity_log DROP CONSTRAINT IF EXISTS activity_log_user_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.actifs DROP CONSTRAINT IF EXISTS actifs_chantier_id_chantiers_id_fk;
DROP INDEX IF EXISTS public.vaccinations_bande_id_idx;
DROP INDEX IF EXISTS public.traitements_bande_id_idx;
DROP INDEX IF EXISTS public.pesees_bande_id_idx;
DROP INDEX IF EXISTS public.observations_journal_bande_id_idx;
DROP INDEX IF EXISTS public.mortalite_journaliere_bande_id_idx;
DROP INDEX IF EXISTS public.depenses_vente_bande_id_idx;
DROP INDEX IF EXISTS public.consommation_eau_bande_id_idx;
DROP INDEX IF EXISTS public.consommation_aliment_bande_id_idx;
DROP INDEX IF EXISTS public.chantier_devis_lignes_chantier_id_idx;
DROP INDEX IF EXISTS public.chantier_depenses_lot_id_idx;
DROP INDEX IF EXISTS public.chantier_depenses_chantier_id_idx;
DROP INDEX IF EXISTS public.bande_ventes_bande_id_idx;
DROP INDEX IF EXISTS public.bande_depenses_bande_id_idx;
DROP INDEX IF EXISTS public.activity_log_user_id_idx;
DROP INDEX IF EXISTS public."IDX_session_expire";
ALTER TABLE IF EXISTS ONLY public.vaccinations DROP CONSTRAINT IF EXISTS vaccinations_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_username_unique;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.traitements DROP CONSTRAINT IF EXISTS traitements_pkey;
ALTER TABLE IF EXISTS ONLY public.stock_medicaments DROP CONSTRAINT IF EXISTS stock_medicaments_pkey;
ALTER TABLE IF EXISTS ONLY public.stock_aliments DROP CONSTRAINT IF EXISTS stock_aliments_pkey;
ALTER TABLE IF EXISTS ONLY public.session DROP CONSTRAINT IF EXISTS session_pkey;
ALTER TABLE IF EXISTS ONLY public.remboursements DROP CONSTRAINT IF EXISTS remboursements_pkey;
ALTER TABLE IF EXISTS ONLY public.pesees DROP CONSTRAINT IF EXISTS pesees_pkey;
ALTER TABLE IF EXISTS ONLY public.parametres DROP CONSTRAINT IF EXISTS parametres_pkey;
ALTER TABLE IF EXISTS ONLY public.parametres DROP CONSTRAINT IF EXISTS parametres_cle_unique;
ALTER TABLE IF EXISTS ONLY public.observations_journal DROP CONSTRAINT IF EXISTS observations_journal_pkey;
ALTER TABLE IF EXISTS ONLY public.mortalite_journaliere DROP CONSTRAINT IF EXISTS mortalite_journaliere_pkey;
ALTER TABLE IF EXISTS ONLY public.financement DROP CONSTRAINT IF EXISTS financement_pkey;
ALTER TABLE IF EXISTS ONLY public.depenses_vente DROP CONSTRAINT IF EXISTS depenses_vente_pkey;
ALTER TABLE IF EXISTS ONLY public.consommation_eau DROP CONSTRAINT IF EXISTS consommation_eau_pkey;
ALTER TABLE IF EXISTS ONLY public.consommation_aliment DROP CONSTRAINT IF EXISTS consommation_aliment_pkey;
ALTER TABLE IF EXISTS ONLY public.charges_fixes DROP CONSTRAINT IF EXISTS charges_fixes_pkey;
ALTER TABLE IF EXISTS ONLY public.charges_fixes DROP CONSTRAINT IF EXISTS charges_fixes_bande_id_unique;
ALTER TABLE IF EXISTS ONLY public.chantiers DROP CONSTRAINT IF EXISTS chantiers_pkey;
ALTER TABLE IF EXISTS ONLY public.chantier_lots DROP CONSTRAINT IF EXISTS chantier_lots_pkey;
ALTER TABLE IF EXISTS ONLY public.chantier_devis_lignes DROP CONSTRAINT IF EXISTS chantier_devis_lignes_pkey;
ALTER TABLE IF EXISTS ONLY public.chantier_depenses DROP CONSTRAINT IF EXISTS chantier_depenses_pkey;
ALTER TABLE IF EXISTS ONLY public.bandes DROP CONSTRAINT IF EXISTS bandes_pkey;
ALTER TABLE IF EXISTS ONLY public.bande_ventes DROP CONSTRAINT IF EXISTS bande_ventes_pkey;
ALTER TABLE IF EXISTS ONLY public.bande_depenses DROP CONSTRAINT IF EXISTS bande_depenses_pkey;
ALTER TABLE IF EXISTS ONLY public.bande_actifs DROP CONSTRAINT IF EXISTS bande_actifs_pkey;
ALTER TABLE IF EXISTS ONLY public.activity_log DROP CONSTRAINT IF EXISTS activity_log_pkey;
ALTER TABLE IF EXISTS ONLY public.actifs DROP CONSTRAINT IF EXISTS actifs_pkey;
ALTER TABLE IF EXISTS public.vaccinations ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.users ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.traitements ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.stock_medicaments ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.stock_aliments ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.remboursements ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.pesees ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.parametres ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.observations_journal ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.mortalite_journaliere ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.financement ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.depenses_vente ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.consommation_eau ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.consommation_aliment ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.charges_fixes ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.chantiers ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.chantier_lots ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.chantier_devis_lignes ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.chantier_depenses ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.bandes ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.bande_ventes ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.bande_depenses ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.bande_actifs ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.activity_log ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.actifs ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE IF EXISTS public.vaccinations_id_seq;
DROP TABLE IF EXISTS public.vaccinations;
DROP SEQUENCE IF EXISTS public.users_id_seq;
DROP TABLE IF EXISTS public.users;
DROP SEQUENCE IF EXISTS public.traitements_id_seq;
DROP TABLE IF EXISTS public.traitements;
DROP SEQUENCE IF EXISTS public.stock_medicaments_id_seq;
DROP TABLE IF EXISTS public.stock_medicaments;
DROP SEQUENCE IF EXISTS public.stock_aliments_id_seq;
DROP TABLE IF EXISTS public.stock_aliments;
DROP TABLE IF EXISTS public.session;
DROP SEQUENCE IF EXISTS public.remboursements_id_seq;
DROP TABLE IF EXISTS public.remboursements;
DROP SEQUENCE IF EXISTS public.pesees_id_seq;
DROP TABLE IF EXISTS public.pesees;
DROP SEQUENCE IF EXISTS public.parametres_id_seq;
DROP TABLE IF EXISTS public.parametres;
DROP SEQUENCE IF EXISTS public.observations_journal_id_seq;
DROP TABLE IF EXISTS public.observations_journal;
DROP SEQUENCE IF EXISTS public.mortalite_journaliere_id_seq;
DROP TABLE IF EXISTS public.mortalite_journaliere;
DROP SEQUENCE IF EXISTS public.financement_id_seq;
DROP TABLE IF EXISTS public.financement;
DROP SEQUENCE IF EXISTS public.depenses_vente_id_seq;
DROP TABLE IF EXISTS public.depenses_vente;
DROP SEQUENCE IF EXISTS public.consommation_eau_id_seq;
DROP TABLE IF EXISTS public.consommation_eau;
DROP SEQUENCE IF EXISTS public.consommation_aliment_id_seq;
DROP TABLE IF EXISTS public.consommation_aliment;
DROP SEQUENCE IF EXISTS public.charges_fixes_id_seq;
DROP TABLE IF EXISTS public.charges_fixes;
DROP SEQUENCE IF EXISTS public.chantiers_id_seq;
DROP TABLE IF EXISTS public.chantiers;
DROP SEQUENCE IF EXISTS public.chantier_lots_id_seq;
DROP TABLE IF EXISTS public.chantier_lots;
DROP SEQUENCE IF EXISTS public.chantier_devis_lignes_id_seq;
DROP TABLE IF EXISTS public.chantier_devis_lignes;
DROP SEQUENCE IF EXISTS public.chantier_depenses_id_seq;
DROP TABLE IF EXISTS public.chantier_depenses;
DROP SEQUENCE IF EXISTS public.bandes_id_seq;
DROP TABLE IF EXISTS public.bandes;
DROP SEQUENCE IF EXISTS public.bande_ventes_id_seq;
DROP TABLE IF EXISTS public.bande_ventes;
DROP SEQUENCE IF EXISTS public.bande_depenses_id_seq;
DROP TABLE IF EXISTS public.bande_depenses;
DROP SEQUENCE IF EXISTS public.bande_actifs_id_seq;
DROP TABLE IF EXISTS public.bande_actifs;
DROP SEQUENCE IF EXISTS public.activity_log_id_seq;
DROP TABLE IF EXISTS public.activity_log;
DROP SEQUENCE IF EXISTS public.actifs_id_seq;
DROP TABLE IF EXISTS public.actifs;
SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: actifs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.actifs (
    id integer NOT NULL,
    nom text NOT NULL,
    type text NOT NULL,
    valeur numeric(15,2) NOT NULL,
    taux_amortissement_annuel numeric(5,2) DEFAULT 0 NOT NULL,
    date_acquisition date NOT NULL,
    description text,
    chantier_id integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: actifs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.actifs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: actifs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.actifs_id_seq OWNED BY public.actifs.id;


--
-- Name: activity_log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.activity_log (
    id integer NOT NULL,
    user_id integer,
    user_nom text NOT NULL,
    action text NOT NULL,
    details text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: activity_log_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.activity_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: activity_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.activity_log_id_seq OWNED BY public.activity_log.id;


--
-- Name: bande_actifs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bande_actifs (
    id integer NOT NULL,
    bande_id integer NOT NULL,
    actif_id integer NOT NULL,
    fraction_utilisee numeric(5,4) DEFAULT 1 NOT NULL
);


--
-- Name: bande_actifs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.bande_actifs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: bande_actifs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.bande_actifs_id_seq OWNED BY public.bande_actifs.id;


--
-- Name: bande_depenses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bande_depenses (
    id integer NOT NULL,
    bande_id integer NOT NULL,
    designation text NOT NULL,
    categorie text NOT NULL,
    quantite numeric(15,2) NOT NULL,
    prix_unitaire numeric(15,2) NOT NULL,
    date date
);


--
-- Name: bande_depenses_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.bande_depenses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: bande_depenses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.bande_depenses_id_seq OWNED BY public.bande_depenses.id;


--
-- Name: bande_ventes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bande_ventes (
    id integer NOT NULL,
    bande_id integer NOT NULL,
    date date NOT NULL,
    quantite_vendue integer NOT NULL,
    prix_unitaire numeric(15,2) NOT NULL
);


--
-- Name: bande_ventes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.bande_ventes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: bande_ventes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.bande_ventes_id_seq OWNED BY public.bande_ventes.id;


--
-- Name: bandes; Type: TABLE; Schema: public; Owner: -
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
    date_de_depart date NOT NULL,
    date_cloture date
);


--
-- Name: bandes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.bandes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: bandes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.bandes_id_seq OWNED BY public.bandes.id;


--
-- Name: chantier_depenses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.chantier_depenses (
    id integer NOT NULL,
    chantier_id integer NOT NULL,
    designation text NOT NULL,
    quantite numeric(15,2) DEFAULT 1 NOT NULL,
    prix_unitaire numeric(15,2) DEFAULT 0 NOT NULL,
    categorie text DEFAULT 'materiaux'::text,
    date date,
    commentaire text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    lot_id integer
);


--
-- Name: chantier_depenses_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.chantier_depenses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: chantier_depenses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.chantier_depenses_id_seq OWNED BY public.chantier_depenses.id;


--
-- Name: chantier_devis_lignes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.chantier_devis_lignes (
    id integer NOT NULL,
    chantier_id integer NOT NULL,
    poste text NOT NULL,
    montant_prevu numeric(15,2) DEFAULT 0 NOT NULL,
    ordre integer DEFAULT 0 NOT NULL,
    lot_id integer
);


--
-- Name: chantier_devis_lignes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.chantier_devis_lignes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: chantier_devis_lignes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.chantier_devis_lignes_id_seq OWNED BY public.chantier_devis_lignes.id;


--
-- Name: chantier_lots; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.chantier_lots (
    id integer NOT NULL,
    chantier_id integer NOT NULL,
    nom text NOT NULL,
    description text,
    ordre integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: chantier_lots_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.chantier_lots_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: chantier_lots_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.chantier_lots_id_seq OWNED BY public.chantier_lots.id;


--
-- Name: chantiers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.chantiers (
    id integer NOT NULL,
    nom text NOT NULL,
    description text,
    statut text DEFAULT 'en_cours'::text NOT NULL,
    date_debut date,
    date_cloture date,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: chantiers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.chantiers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: chantiers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.chantiers_id_seq OWNED BY public.chantiers.id;


--
-- Name: charges_fixes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.charges_fixes (
    id integer NOT NULL,
    bande_id integer NOT NULL,
    loyer numeric(15,2) DEFAULT '0'::numeric NOT NULL
);


--
-- Name: charges_fixes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.charges_fixes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: charges_fixes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.charges_fixes_id_seq OWNED BY public.charges_fixes.id;


--
-- Name: consommation_aliment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.consommation_aliment (
    id integer NOT NULL,
    bande_id integer NOT NULL,
    date date NOT NULL,
    quantite_kg numeric(10,2) NOT NULL
);


--
-- Name: consommation_aliment_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.consommation_aliment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: consommation_aliment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.consommation_aliment_id_seq OWNED BY public.consommation_aliment.id;


--
-- Name: consommation_eau; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.consommation_eau (
    id integer NOT NULL,
    bande_id integer NOT NULL,
    date date NOT NULL,
    age_jours integer NOT NULL,
    quantite_litres numeric(10,2) NOT NULL
);


--
-- Name: consommation_eau_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.consommation_eau_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: consommation_eau_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.consommation_eau_id_seq OWNED BY public.consommation_eau.id;


--
-- Name: depenses_vente; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.depenses_vente (
    id integer NOT NULL,
    bande_id integer NOT NULL,
    designation text NOT NULL,
    montant numeric(15,2) NOT NULL
);


--
-- Name: depenses_vente_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.depenses_vente_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: depenses_vente_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.depenses_vente_id_seq OWNED BY public.depenses_vente.id;


--
-- Name: financement; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.financement (
    id integer NOT NULL,
    nom text NOT NULL,
    montant numeric(15,2) NOT NULL,
    date date NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    type text DEFAULT 'apport'::text NOT NULL,
    taux_interet numeric(5,2) DEFAULT '0'::numeric NOT NULL,
    date_remboursement_prevue date
);


--
-- Name: financement_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.financement_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: financement_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.financement_id_seq OWNED BY public.financement.id;


--
-- Name: mortalite_journaliere; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mortalite_journaliere (
    id integer NOT NULL,
    bande_id integer NOT NULL,
    date date NOT NULL,
    age_jours integer NOT NULL,
    deces_jour integer DEFAULT 0 NOT NULL
);


--
-- Name: mortalite_journaliere_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.mortalite_journaliere_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: mortalite_journaliere_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.mortalite_journaliere_id_seq OWNED BY public.mortalite_journaliere.id;


--
-- Name: observations_journal; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.observations_journal (
    id integer NOT NULL,
    bande_id integer NOT NULL,
    date date NOT NULL,
    age_jours integer NOT NULL,
    contenu text NOT NULL
);


--
-- Name: observations_journal_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.observations_journal_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: observations_journal_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.observations_journal_id_seq OWNED BY public.observations_journal.id;


--
-- Name: parametres; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.parametres (
    id integer NOT NULL,
    cle text NOT NULL,
    valeur text NOT NULL,
    description text NOT NULL,
    categorie text NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: parametres_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.parametres_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: parametres_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.parametres_id_seq OWNED BY public.parametres.id;


--
-- Name: pesees; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pesees (
    id integer NOT NULL,
    bande_id integer NOT NULL,
    date date NOT NULL,
    age_jours integer NOT NULL,
    poids_moyen_g numeric(10,2) NOT NULL,
    poids_min_g numeric(10,2),
    poids_max_g numeric(10,2),
    objectif_poids_g numeric(10,2)
);


--
-- Name: pesees_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.pesees_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: pesees_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.pesees_id_seq OWNED BY public.pesees.id;


--
-- Name: remboursements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.remboursements (
    id integer NOT NULL,
    investisseur_nom text NOT NULL,
    montant numeric(15,2) NOT NULL,
    date date NOT NULL,
    commentaire text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: remboursements_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.remboursements_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: remboursements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.remboursements_id_seq OWNED BY public.remboursements.id;


--
-- Name: session; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.session (
    sid character varying NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL
);


--
-- Name: stock_aliments; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: stock_aliments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.stock_aliments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: stock_aliments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.stock_aliments_id_seq OWNED BY public.stock_aliments.id;


--
-- Name: stock_medicaments; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: stock_medicaments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.stock_medicaments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: stock_medicaments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.stock_medicaments_id_seq OWNED BY public.stock_medicaments.id;


--
-- Name: traitements; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: traitements_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.traitements_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: traitements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.traitements_id_seq OWNED BY public.traitements.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username text NOT NULL,
    password text NOT NULL,
    role text DEFAULT 'gestionnaire'::text NOT NULL,
    nom text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: vaccinations; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: vaccinations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.vaccinations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: vaccinations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.vaccinations_id_seq OWNED BY public.vaccinations.id;


--
-- Name: actifs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.actifs ALTER COLUMN id SET DEFAULT nextval('public.actifs_id_seq'::regclass);


--
-- Name: activity_log id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_log ALTER COLUMN id SET DEFAULT nextval('public.activity_log_id_seq'::regclass);


--
-- Name: bande_actifs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bande_actifs ALTER COLUMN id SET DEFAULT nextval('public.bande_actifs_id_seq'::regclass);


--
-- Name: bande_depenses id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bande_depenses ALTER COLUMN id SET DEFAULT nextval('public.bande_depenses_id_seq'::regclass);


--
-- Name: bande_ventes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bande_ventes ALTER COLUMN id SET DEFAULT nextval('public.bande_ventes_id_seq'::regclass);


--
-- Name: bandes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bandes ALTER COLUMN id SET DEFAULT nextval('public.bandes_id_seq'::regclass);


--
-- Name: chantier_depenses id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chantier_depenses ALTER COLUMN id SET DEFAULT nextval('public.chantier_depenses_id_seq'::regclass);


--
-- Name: chantier_devis_lignes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chantier_devis_lignes ALTER COLUMN id SET DEFAULT nextval('public.chantier_devis_lignes_id_seq'::regclass);


--
-- Name: chantier_lots id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chantier_lots ALTER COLUMN id SET DEFAULT nextval('public.chantier_lots_id_seq'::regclass);


--
-- Name: chantiers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chantiers ALTER COLUMN id SET DEFAULT nextval('public.chantiers_id_seq'::regclass);


--
-- Name: charges_fixes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.charges_fixes ALTER COLUMN id SET DEFAULT nextval('public.charges_fixes_id_seq'::regclass);


--
-- Name: consommation_aliment id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.consommation_aliment ALTER COLUMN id SET DEFAULT nextval('public.consommation_aliment_id_seq'::regclass);


--
-- Name: consommation_eau id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.consommation_eau ALTER COLUMN id SET DEFAULT nextval('public.consommation_eau_id_seq'::regclass);


--
-- Name: depenses_vente id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.depenses_vente ALTER COLUMN id SET DEFAULT nextval('public.depenses_vente_id_seq'::regclass);


--
-- Name: financement id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.financement ALTER COLUMN id SET DEFAULT nextval('public.financement_id_seq'::regclass);


--
-- Name: mortalite_journaliere id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mortalite_journaliere ALTER COLUMN id SET DEFAULT nextval('public.mortalite_journaliere_id_seq'::regclass);


--
-- Name: observations_journal id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.observations_journal ALTER COLUMN id SET DEFAULT nextval('public.observations_journal_id_seq'::regclass);


--
-- Name: parametres id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.parametres ALTER COLUMN id SET DEFAULT nextval('public.parametres_id_seq'::regclass);


--
-- Name: pesees id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pesees ALTER COLUMN id SET DEFAULT nextval('public.pesees_id_seq'::regclass);


--
-- Name: remboursements id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.remboursements ALTER COLUMN id SET DEFAULT nextval('public.remboursements_id_seq'::regclass);


--
-- Name: stock_aliments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_aliments ALTER COLUMN id SET DEFAULT nextval('public.stock_aliments_id_seq'::regclass);


--
-- Name: stock_medicaments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_medicaments ALTER COLUMN id SET DEFAULT nextval('public.stock_medicaments_id_seq'::regclass);


--
-- Name: traitements id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.traitements ALTER COLUMN id SET DEFAULT nextval('public.traitements_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: vaccinations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vaccinations ALTER COLUMN id SET DEFAULT nextval('public.vaccinations_id_seq'::regclass);


--
-- Data for Name: actifs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.actifs (id, nom, type, valeur, taux_amortissement_annuel, date_acquisition, description, chantier_id, created_at) FROM stdin;
1	Construction de la ferme Mbiedou	batiment	2424650.00	5.00	2026-04-01	Bâtiment principal + forage et puits	1	2026-04-14 20:12:25.015184
2	Terrain	terrain	14000000.00	0.00	2025-12-01		\N	2026-05-02 19:53:19.054538
\.


--
-- Data for Name: activity_log; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.activity_log (id, user_id, user_nom, action, details, created_at) FROM stdin;
1	1	Administrateur	Modification dépense bâtiment	Defrichage	2026-04-07 15:36:06.44838
2	1	Administrateur	Modification dépense bâtiment	Creusage fouille bâtiment principal	2026-04-07 15:36:06.466758
3	1	Administrateur	Modification dépense bâtiment	Devis batiment	2026-04-07 15:36:06.480505
4	1	Administrateur	Modification dépense bâtiment	Transports sables + Taxe	2026-04-07 15:36:06.490621
5	1	Administrateur	Modification dépense bâtiment	Transports graviers + Taxe	2026-04-07 15:36:06.50129
6	1	Administrateur	Modification dépense bâtiment	Carburant	2026-04-07 15:36:06.511651
7	1	Administrateur	Modification dépense bâtiment	Boissons	2026-04-07 15:36:06.52459
8	1	Administrateur	Modification dépense bâtiment	Creusage fouille annexe	2026-04-07 15:36:06.534774
9	1	Administrateur	Modification dépense bâtiment	mois location chambre pour le materiel	2026-04-07 15:36:06.54724
10	1	Administrateur	Modification dépense bâtiment	cubitenaire d'eau	2026-04-07 15:36:06.565692
11	1	Administrateur	Modification dépense bâtiment	location cubitenaire d'eau	2026-04-07 15:36:06.580436
12	1	Administrateur	Modification dépense bâtiment	dedommage decoupage arbre	2026-04-07 15:36:06.590684
13	1	Administrateur	Modification dépense bâtiment	Carburant	2026-04-07 15:36:06.601793
14	1	Administrateur	Modification dépense bâtiment	Carburant	2026-04-07 15:36:06.614622
15	1	Administrateur	Modification dépense bâtiment	Main d'oeuvre	2026-04-07 15:36:06.62768
16	1	Administrateur	Modification dépense bâtiment	Dejeuner	2026-04-07 15:36:06.638109
17	1	Administrateur	Modification dépense bâtiment	Garage	2026-04-07 15:36:06.647915
18	1	Administrateur	Modification dépense bâtiment	Location chambre	2026-04-07 15:36:06.661365
19	1	Administrateur	Modification dépense bâtiment	Carburant	2026-04-07 15:36:06.670963
20	1	Administrateur	Modification dépense bâtiment	dejeuner	2026-04-07 15:36:06.681616
21	1	Administrateur	Modification dépense bâtiment	Main d'oeuvre	2026-04-07 15:36:06.690096
22	1	Administrateur	Modification dépense bâtiment	pelle ronde	2026-04-07 15:36:06.699156
23	1	Administrateur	Modification dépense bâtiment	Main d'oeuvre	2026-04-07 15:36:06.710122
24	1	Administrateur	Modification dépense bâtiment	dejeuner	2026-04-07 15:36:06.720771
25	1	Administrateur	Modification dépense bâtiment	carburant	2026-04-07 15:36:06.729971
26	1	Administrateur	Modification dépense bâtiment	Main d'oeuvre	2026-04-07 15:36:06.738372
27	1	Administrateur	Modification dépense bâtiment	dejeuner	2026-04-07 15:36:06.748779
28	1	Administrateur	Modification dépense bâtiment	2eme versement eau	2026-04-07 15:36:06.758422
29	1	Administrateur	Modification dépense bâtiment	manche pioche	2026-04-07 15:36:06.767059
30	1	Administrateur	Modification dépense bâtiment	Main d'oeuvre	2026-04-07 15:36:06.775367
31	1	Administrateur	Modification dépense bâtiment	carburant	2026-04-07 15:36:06.784737
32	1	Administrateur	Modification dépense bâtiment	Main d'oeuvre	2026-04-07 15:36:06.795419
33	1	Administrateur	Modification dépense bâtiment	Carburant	2026-04-07 15:36:06.804475
34	1	Administrateur	Modification dépense bâtiment	dejeuner	2026-04-07 15:36:06.812461
35	1	Administrateur	Modification dépense bâtiment	Main d'oeuvre	2026-04-07 15:36:06.821039
36	1	Administrateur	Modification dépense bâtiment	dejeuner	2026-04-07 15:36:06.82967
37	1	Administrateur	Modification dépense bâtiment	transport	2026-04-07 15:36:06.838656
38	1	Administrateur	Modification dépense bâtiment	Main d'oeuvre	2026-04-07 15:36:06.847635
39	1	Administrateur	Modification dépense bâtiment	Main d'oeuvre	2026-04-07 15:36:06.859641
40	1	Administrateur	Modification dépense bâtiment	carburant	2026-04-07 15:36:06.868172
41	1	Administrateur	Modification dépense bâtiment	Depense + Transport	2026-04-07 15:36:06.875929
42	1	Administrateur	Modification dépense bâtiment	transport	2026-04-07 15:36:06.884525
43	1	Administrateur	Modification dépense bâtiment	main d'oeuvre	2026-04-07 15:36:06.892378
44	1	Administrateur	Modification dépense bâtiment	garage	2026-04-07 15:36:06.900418
45	1	Administrateur	Ajout carburant	15000 FCFA	2026-04-07 15:36:27.002212
46	1	Administrateur	Ajout carburant	10000 FCFA	2026-04-07 15:36:27.019459
47	1	Administrateur	Création bande	Bande 1 - 3750 sujets	2026-04-07 15:36:27.031871
48	1	Administrateur	Ajout dépense bande	Poussin 1 j - 2062500 FCFA	2026-04-07 15:36:27.048628
49	1	Administrateur	Ajout dépense bande	Koppo - 10000 FCFA	2026-04-07 15:36:27.058569
50	1	Administrateur	Ajout dépense bande	Bois - 100000 FCFA	2026-04-07 15:36:27.069341
51	1	Administrateur	Ajout dépense bande	Desinfectant - 10000 FCFA	2026-04-07 15:36:27.078537
52	1	Administrateur	Ajout dépense bande	Pointes - 1000 FCFA	2026-04-07 15:36:27.08791
53	1	Administrateur	Ajout dépense bande	Aliments - 127450 FCFA	2026-04-07 15:36:27.096261
54	1	Administrateur	Ajout dépense bande	Concentre - 156000 FCFA	2026-04-07 15:36:27.10478
55	1	Administrateur	Ajout dépense bande	Concentre - 364000 FCFA	2026-04-07 15:36:27.112396
56	1	Administrateur	Ajout dépense bande	Police - 1000 FCFA	2026-04-07 15:36:27.120758
57	1	Administrateur	Ajout dépense bande	Carburant - 30000 FCFA	2026-04-07 15:36:27.129418
58	1	Administrateur	Ajout dépense bande	lait - 25000 FCFA	2026-04-07 15:36:27.137507
59	1	Administrateur	Ajout dépense bande	Poulets - 10000 FCFA	2026-04-07 15:36:27.145471
60	1	Administrateur	Ajout dépense bande	Medicaments - 220000 FCFA	2026-04-07 15:36:27.154847
61	1	Administrateur	Ajout dépense bande	Carburant Mr Denis - 10000 FCFA	2026-04-07 15:36:27.163007
62	1	Administrateur	Ajout dépense bande	Aliments demarrage - 125550 FCFA	2026-04-07 15:36:27.171844
63	1	Administrateur	Ajout dépense bande	Vaccin - 14000 FCFA	2026-04-07 15:36:27.179221
64	1	Administrateur	Ajout dépense bande	Carburant - 5000 FCFA	2026-04-07 15:36:27.188242
65	1	Administrateur	Ajout dépense bande	Carburant - 10000 FCFA	2026-04-07 15:36:27.195938
66	1	Administrateur	Ajout dépense bande	Aliment demarrage - 263220 FCFA	2026-04-07 15:36:27.205802
67	1	Administrateur	Ajout dépense bande	Aliment demarrage - 36875 FCFA	2026-04-07 15:36:27.214156
68	1	Administrateur	Ajout dépense bande	Aliment demarrage - 263235 FCFA	2026-04-07 15:36:27.222646
69	1	Administrateur	Ajout dépense bande	Electricite - 9500 FCFA	2026-04-07 15:36:27.230853
70	1	Administrateur	Ajout dépense bande	Aliment croissance - 449640 FCFA	2026-04-07 15:36:27.238791
71	1	Administrateur	Ajout dépense bande	Aliment croissance - 156180 FCFA	2026-04-07 15:36:27.245888
72	1	Administrateur	Ajout dépense bande	concentre - 416000 FCFA	2026-04-07 15:36:27.254772
73	1	Administrateur	Ajout dépense bande	Aliment croissance - 107040 FCFA	2026-04-07 15:36:27.262595
74	1	Administrateur	Ajout dépense bande	compteur - 5000 FCFA	2026-04-07 15:36:27.271682
75	1	Administrateur	Ajout dépense bande	Marteau - 2000 FCFA	2026-04-07 15:36:27.279808
76	1	Administrateur	Ajout dépense bande	Fide - 2500 FCFA	2026-04-07 15:36:27.289257
77	1	Administrateur	Ajout dépense bande	Sacs vide - 1000 FCFA	2026-04-07 15:36:27.299152
78	1	Administrateur	Ajout dépense bande	Carburant - 5000 FCFA	2026-04-07 15:36:27.305937
79	1	Administrateur	Ajout dépense bande	Balance - 2000 FCFA	2026-04-07 15:36:27.314252
80	1	Administrateur	Ajout dépense bande	Koppo - 5000 FCFA	2026-04-07 15:36:27.321521
81	1	Administrateur	Ajout dépense bande	Aliment finitions - 518280 FCFA	2026-04-07 15:36:27.328503
82	1	Administrateur	Ajout dépense bande	Ampoules - 7000 FCFA	2026-04-07 15:36:27.336373
83	1	Administrateur	Ajout dépense bande	Koppo - 2500 FCFA	2026-04-07 15:36:27.345356
84	1	Administrateur	Ajout dépense bande	concentre - 364000 FCFA	2026-04-07 15:36:27.352416
85	1	Administrateur	Ajout dépense bande	Sacs vide - 1500 FCFA	2026-04-07 15:36:27.359716
86	1	Administrateur	Ajout dépense bande	concentre - 520000 FCFA	2026-04-07 15:36:27.366853
87	1	Administrateur	Ajout dépense bande	Aliments finition - 452580 FCFA	2026-04-07 15:36:27.374778
88	1	Administrateur	Ajout dépense bande	Aliments finition - 303400 FCFA	2026-04-07 15:36:27.382416
89	1	Administrateur	Ajout dépense bande	Salaire du mois de Fevrier - 110000 FCFA	2026-04-07 15:36:27.390421
90	1	Administrateur	Ajout dépense bande	Salaire du mois de mars - 110000 FCFA	2026-04-07 15:36:27.397209
91	1	Administrateur	Ajout dépense bande	Salaire ventes et tresoreries - 200000 FCFA	2026-04-07 15:36:27.405516
92	1	Administrateur	Ajout dépense bande	carburant - 15000 FCFA	2026-04-07 15:36:27.413531
93	1	Administrateur	Ajout dépense bande	Mangeoires - 25000 FCFA	2026-04-07 15:36:27.421421
94	1	Administrateur	Ajout dépense bande	Electricite - 12000 FCFA	2026-04-07 15:36:27.429271
95	1	Administrateur	Ajout dépense bande	Complement aliment - 12000 FCFA	2026-04-07 15:36:27.437137
96	1	Administrateur	Modification devis construction	\N	2026-04-07 15:41:20.806317
97	1	Administrateur	Modification devis construction	\N	2026-04-07 15:41:52.71013
98	1	Administrateur	Suppression carburant	ID: 3	2026-04-07 15:57:41.934864
99	1	Administrateur	Suppression carburant	ID: 4	2026-04-07 15:57:41.954922
100	1	Administrateur	Modification dépense forage	Avance main d'oeuvre	2026-04-07 15:57:41.972501
101	1	Administrateur	Modification dépense forage	Flash Band de 10 Detail	2026-04-07 15:57:41.981845
102	1	Administrateur	Modification dépense forage	Avance main d'oeuvre	2026-04-07 15:57:41.990773
103	1	Administrateur	Modification dépense forage	Avance main d'oeuvre	2026-04-07 15:57:42.00012
104	1	Administrateur	Modification dépense forage	Corde	2026-04-07 15:57:42.011205
105	1	Administrateur	Modification dépense forage	Buse	2026-04-07 15:57:42.019688
106	1	Administrateur	Modification dépense forage	Avance main d'oeuvre	2026-04-07 15:57:42.028712
107	1	Administrateur	Création bande	Test Bande - 500 sujets	2026-04-07 22:41:27.559205
108	1	Administrateur	Modification bande	Bande 1	2026-04-08 17:12:39.422533
109	1	Administrateur	Modification bande	Bande 1	2026-04-08 17:14:14.068039
110	1	Administrateur	Modification bande	Bande 1	2026-04-08 17:14:56.005627
111	1	Administrateur	Création bande	Test bande 2 - 3901 sujets	2026-04-08 18:15:19.418572
112	1	Administrateur	Suppression bande	ID: 5	2026-04-08 18:15:24.245661
113	1	Administrateur	Ajout mortalité	3 décès - Bande ID: 10	2026-04-08 18:16:09.329584
114	1	Administrateur	Ajout mortalité	12 décès - Bande ID: 10	2026-04-08 18:16:09.851277
115	1	Administrateur	Ajout mortalité	16 décès - Bande ID: 10	2026-04-08 18:16:10.360453
116	1	Administrateur	Ajout mortalité	13 décès - Bande ID: 10	2026-04-08 18:16:10.866227
117	1	Administrateur	Ajout mortalité	9 décès - Bande ID: 10	2026-04-08 18:16:11.243961
118	1	Administrateur	Ajout mortalité	10 décès - Bande ID: 10	2026-04-08 18:16:11.752481
119	1	Administrateur	Ajout mortalité	4 décès - Bande ID: 10	2026-04-08 18:16:12.128691
120	1	Administrateur	Ajout mortalité	3 décès - Bande ID: 10	2026-04-08 18:27:14.882697
121	1	Administrateur	Ajout mortalité	12 décès - Bande ID: 10	2026-04-08 18:27:15.884071
122	1	Administrateur	Ajout mortalité	16 décès - Bande ID: 10	2026-04-08 18:27:16.286898
123	1	Administrateur	Ajout mortalité	13 décès - Bande ID: 10	2026-04-08 18:27:16.729867
124	1	Administrateur	Ajout mortalité	9 décès - Bande ID: 10	2026-04-08 18:27:17.11107
125	1	Administrateur	Ajout mortalité	10 décès - Bande ID: 10	2026-04-08 18:27:17.630241
126	1	Administrateur	Ajout mortalité	4 décès - Bande ID: 10	2026-04-08 18:27:18.142294
127	1	Administrateur	Suppression bande	ID: 10	2026-04-08 18:30:04.91527
128	1	Administrateur	Création bande	test - 1000 sujets	2026-04-08 19:35:37.589349
129	1	Administrateur	Ajout dépense bande	Aliment croissance - 250 FCFA	2026-04-08 19:39:15.754521
130	1	Administrateur	Ajout vente bande	1 sujets à 2500 FCFA	2026-04-08 19:39:15.797524
131	1	Administrateur	Suppression dépense bande	ID: 97	2026-04-08 19:39:25.033947
132	1	Administrateur	Suppression vente bande	ID: 1	2026-04-08 19:39:25.076014
133	1	Administrateur	Ajout vente bande	1 sujets à 0 FCFA	2026-04-08 19:40:08.325813
134	1	Administrateur	Ajout dépense bande	Aliment croissance - 0 FCFA	2026-04-08 19:40:31.09599
135	1	Administrateur	Ajout vente bande	1 sujets à 100 FCFA	2026-04-10 15:18:35.146568
136	1	Administrateur	Ajout vente bande	1 sujets à 100 FCFA	2026-04-10 15:18:35.836278
137	1	Administrateur	Ajout vente bande	1 sujets à 130 FCFA	2026-04-10 15:18:50.180794
138	1	Administrateur	Ajout vente bande	1 sujets à 130 FCFA	2026-04-10 15:18:51.233502
139	1	Administrateur	Ajout mortalité	1 décès - Bande ID: 11	2026-04-10 15:22:32.644595
140	1	Administrateur	Ajout vente bande	1 sujets à 0 FCFA	2026-04-10 15:40:10.900802
141	1	Administrateur	Clôture bande	Bande 1 clôturée au 2026-05-02	2026-05-02 17:10:52.567473
142	1	Administrateur	Réouverture bande	Bande 1	2026-05-02 17:12:02.866654
143	1	Administrateur	Clôture bande	Bande 1 clôturée au 2026-05-02	2026-05-02 17:16:14.801139
144	1	Administrateur	Réouverture bande	Bande 1	2026-05-02 17:16:15.020522
145	1	Administrateur	Ajout financement	TEST_LOAN | prêt 5% | 5000 FCFA	2026-05-02 19:43:03.835571
146	1	Administrateur	Suppression financement	TEST_LOAN | 5000 FCFA | 2026-05-02	2026-05-02 19:44:10.717256
147	1	Administrateur	Ajout actif	Terrain (terrain) | 14000000 FCFA	2026-05-02 19:53:19.062068
148	1	Administrateur	Ajout financement	Reunion  | prêt 0% | 14000000 FCFA	2026-05-02 19:58:03.298359
149	1	Administrateur	Création chantier	test a	2026-05-02 19:58:58.306227
150	1	Administrateur	Création bande	bande ### - 1000 sujets	2026-05-02 20:42:14.395977
\.


--
-- Data for Name: bande_actifs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.bande_actifs (id, bande_id, actif_id, fraction_utilisee) FROM stdin;
1	4	1	1.0000
2	15	1	1.0000
\.


--
-- Data for Name: bande_depenses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.bande_depenses (id, bande_id, designation, categorie, quantite, prix_unitaire, date) FROM stdin;
49	4	Poussin 1 j	poussins	3750.00	550.00	\N
50	4	Koppo	autre	20.00	500.00	\N
51	4	Bois	autre	1.00	100000.00	\N
53	4	Pointes	autre	1.00	1000.00	\N
54	4	Aliments	aliments	10.00	12745.00	\N
57	4	Police	autre	1.00	1000.00	\N
60	4	Poulets	autre	1.00	10000.00	\N
62	4	Carburant Mr Denis	transport	1.00	10000.00	\N
76	4	Marteau	autre	1.00	2000.00	\N
77	4	Fide	autre	1.00	2500.00	\N
80	4	Balance	autre	1.00	2000.00	\N
81	4	Koppo	autre	10.00	500.00	\N
83	4	Ampoules	autre	1.00	7000.00	\N
84	4	Koppo	autre	5.00	500.00	\N
91	4	Salaire du mois de mars	main_oeuvre	1.00	110000.00	\N
94	4	Mangeoires	autre	1.00	25000.00	\N
63	4	Aliment démarrage	aliments	15.00	8370.00	\N
67	4	Aliment démarrage	aliments	20.00	13161.00	\N
68	4	Aliment démarrage	aliments	5.00	7375.00	\N
69	4	Aliment démarrage	aliments	35.00	7521.00	\N
71	4	Aliment croissance	aliments	60.00	7494.00	\N
72	4	Aliment croissance	aliments	20.00	7809.00	\N
74	4	Aliment croissance	aliments	15.00	7136.00	\N
82	4	Aliment finition	aliments	70.00	7404.00	\N
88	4	Aliment finition	aliments	60.00	7543.00	\N
89	4	Aliment finition	aliments	40.00	7585.00	\N
55	4	Concentré	aliments	3.00	52000.00	\N
56	4	Concentré	aliments	7.00	52000.00	\N
73	4	Concentré	aliments	8.00	52000.00	\N
85	4	Concentré	aliments	7.00	52000.00	\N
87	4	Concentré	aliments	10.00	52000.00	\N
58	4	Carburant	transport	1.00	30000.00	\N
65	4	Carburant	transport	1.00	5000.00	\N
66	4	Carburant	transport	1.00	10000.00	\N
79	4	Carburant	transport	1.00	5000.00	\N
93	4	Carburant	transport	1.00	15000.00	\N
96	4	Complément aliment	aliments	1.00	12000.00	\N
70	4	Électricité	autre	1.00	9500.00	\N
95	4	Électricité	autre	1.00	12000.00	\N
64	4	Vaccin	prophylaxie	1.00	14000.00	\N
52	4	Désinfectant	prophylaxie	1.00	10000.00	\N
61	4	Médicaments	prophylaxie	1.00	220000.00	\N
90	4	Salaire du mois de février	main_oeuvre	1.00	110000.00	\N
92	4	Salaire ventes et trésorerie	main_oeuvre	1.00	200000.00	\N
59	4	Lait	aliments	1.00	25000.00	\N
75	4	Compteur	autre	1.00	5000.00	\N
78	4	Sacs vides	autre	1.00	1000.00	\N
86	4	Sacs vides	autre	1.00	1500.00	\N
\.


--
-- Data for Name: bande_ventes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.bande_ventes (id, bande_id, date, quantite_vendue, prix_unitaire) FROM stdin;
3	4	2026-04-10	1	100.00
4	4	2026-04-10	1	100.00
5	4	2026-04-09	1	130.00
6	4	2026-04-09	1	130.00
7	4	2026-04-13	1	0.00
\.


--
-- Data for Name: bandes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.bandes (id, numero, nom, sujets_depart, nombre_deces, valeur_materiel_fixe, statut, created_at, date_de_depart, date_cloture) FROM stdin;
12	-3	Historique A — Biofarm (2024)	4079	116	0.00	terminee	2026-04-10 21:02:00.789532	2024-06-14	\N
13	-2	Historique B — Biofarm (2025)	4087	0	0.00	terminee	2026-04-10 21:02:01.30565	2025-04-03	\N
14	-1	Historique C — Biofarm (2025)	3022	233	0.00	terminee	2026-04-10 21:02:01.704132	2025-06-17	\N
4	1	Bande 1	3750	176	6000000.00	active	2026-04-07 15:36:27.027738	2026-02-17	\N
15	5	bande ###	1000	0	0.00	active	2026-05-02 20:42:14.359244	2026-05-02	\N
\.


--
-- Data for Name: chantier_depenses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.chantier_depenses (id, chantier_id, designation, quantite, prix_unitaire, categorie, date, commentaire, created_at, lot_id) FROM stdin;
1	1	Achats de planches	1.00	400000.00	materiaux	\N	\N	2026-04-10 22:21:23.970949	1
2	1	Coupage de bois	1.00	35000.00	materiaux	\N	\N	2026-04-10 22:21:23.970949	1
3	1	Carburant	1.00	15000.00	carburant	\N	\N	2026-04-10 22:21:23.970949	1
4	1	Carburant	1.00	15000.00	carburant	\N	\N	2026-04-10 22:21:23.970949	1
5	1	Carburant	1.00	10000.00	carburant	\N	\N	2026-04-10 22:21:23.970949	1
6	1	Transports sables + Taxe	1.00	40000.00	transport	\N	\N	2026-04-10 22:21:23.970949	1
7	1	Transports graviers + Taxe	1.00	40000.00	transport	\N	\N	2026-04-10 22:21:23.970949	1
8	1	Boissons	1.00	3700.00	divers	\N	\N	2026-04-10 22:21:23.970949	1
9	1	Creusage fouille annexe	1.00	15000.00	main_oeuvre	\N	\N	2026-04-10 22:21:23.970949	1
10	1	Carburant	1.00	5000.00	carburant	\N	\N	2026-04-10 22:21:23.970949	1
11	1	Carburant	1.00	5000.00	carburant	\N	\N	2026-04-10 22:21:23.970949	1
12	1	Carburant	1.00	5000.00	carburant	\N	\N	2026-04-10 22:21:23.970949	1
13	1	Carburant	1.00	5000.00	carburant	\N	\N	2026-04-10 22:21:23.970949	1
14	1	Carburant	1.00	10000.00	carburant	\N	\N	2026-04-10 22:21:23.970949	1
15	1	Sacs de ciment	4.00	5100.00	materiaux	\N	\N	2026-04-10 22:21:23.970949	1
16	1	Sacs de ciment	2.00	5200.00	materiaux	\N	\N	2026-04-10 22:21:23.970949	1
17	1	Location chambre	1.00	5000.00	divers	\N	\N	2026-04-10 22:21:23.970949	1
18	1	Sacs de ciment	4.00	5100.00	materiaux	\N	\N	2026-04-10 22:21:23.970949	1
19	1	Sacs de ciment	3.00	5100.00	materiaux	\N	\N	2026-04-10 22:21:23.970949	1
20	1	pelle ronde	1.00	2250.00	divers	\N	\N	2026-04-10 22:21:23.970949	1
21	1	Sacs de ciment	3.00	5200.00	materiaux	\N	\N	2026-04-10 22:21:23.970949	1
22	1	Sacs de ciment	1.00	5300.00	materiaux	\N	\N	2026-04-10 22:21:23.970949	1
23	1	Fers de 8	6.00	2900.00	materiaux	\N	\N	2026-04-10 22:21:23.970949	1
24	1	Fers de 8	3.00	2850.00	materiaux	\N	\N	2026-04-10 22:21:23.970949	1
25	1	Fers de 8	1.00	2900.00	materiaux	\N	\N	2026-04-10 22:21:23.970949	1
26	1	Fer de 6	1.00	1600.00	materiaux	\N	\N	2026-04-10 22:21:23.970949	1
27	1	Défrichage	1.00	25000.00	main_oeuvre	\N	\N	2026-04-10 22:21:23.970949	1
28	1	Creusage fouille bâtiment principal	1.00	25000.00	main_oeuvre	\N	\N	2026-04-10 22:21:23.970949	1
29	1	Devis bâtiment	1.00	10000.00	divers	\N	\N	2026-04-10 22:21:23.970949	1
30	1	Tonnes de graviers 5/15	21.00	7500.00	materiaux	\N	\N	2026-04-10 22:21:23.970949	1
31	1	Tonnes de sable carrière	22.00	5500.00	materiaux	\N	\N	2026-04-10 22:21:23.970949	1
32	1	Location chambre pour le matériel (1 mois)	1.00	5000.00	divers	\N	\N	2026-04-10 22:21:23.970949	1
33	1	Cubitainer d'eau	1.00	5000.00	divers	\N	\N	2026-04-10 22:21:23.970949	1
34	1	Location cubitainer d'eau	1.00	2500.00	divers	\N	\N	2026-04-10 22:21:23.970949	1
35	1	Dédommagement découpage arbre	1.00	5000.00	divers	\N	\N	2026-04-10 22:21:23.970949	1
36	1	Matériaux de construction (divers)	1.00	115000.00	materiaux	\N	\N	2026-04-10 22:21:23.970949	1
37	1	Avance matériaux de construction	1.00	100000.00	materiaux	\N	\N	2026-04-10 22:21:23.970949	1
38	1	Barres de fer de 6 + barres de fer de 8	1.00	9000.00	materiaux	\N	\N	2026-04-10 22:21:23.970949	1
39	1	Parpaings	40.00	200.00	materiaux	\N	\N	2026-04-10 22:21:23.970949	1
40	1	Solde parpaings	1.00	15000.00	materiaux	\N	\N	2026-04-10 22:21:23.970949	1
41	1	Main-d'œuvre	1.00	13000.00	main_oeuvre	\N	\N	2026-04-10 22:21:23.970949	1
42	1	Déjeuner	1.00	1000.00	divers	\N	\N	2026-04-10 22:21:23.970949	1
43	1	Garage (réparation véhicule)	1.00	5000.00	transport	\N	\N	2026-04-10 22:21:23.970949	1
44	1	Déjeuner	1.00	1000.00	divers	\N	\N	2026-04-10 22:21:23.970949	1
45	1	Main-d'œuvre	1.00	10000.00	main_oeuvre	\N	\N	2026-04-10 22:21:23.970949	1
46	1	Parpaings	100.00	200.00	materiaux	\N	\N	2026-04-10 22:21:23.970949	1
47	1	Parpaings	400.00	225.00	materiaux	\N	\N	2026-04-10 22:21:23.970949	1
48	1	Fil d'attache	1.00	2100.00	materiaux	\N	\N	2026-04-10 22:21:23.970949	1
49	1	Cadres + étriers	1.00	10000.00	materiaux	\N	\N	2026-04-10 22:21:23.970949	1
50	1	Main-d'œuvre	1.00	13000.00	main_oeuvre	\N	\N	2026-04-10 22:21:23.970949	1
51	1	Déjeuner	1.00	2000.00	divers	\N	\N	2026-04-10 22:21:23.970949	1
52	1	Main-d'œuvre	1.00	10000.00	main_oeuvre	\N	\N	2026-04-10 22:21:23.970949	1
53	1	Déjeuner	1.00	1500.00	divers	\N	\N	2026-04-10 22:21:23.970949	1
54	1	2e versement eau	1.00	5000.00	divers	\N	\N	2026-04-10 22:21:23.970949	1
55	1	Manche de pioche	1.00	250.00	divers	\N	\N	2026-04-10 22:21:23.970949	1
56	1	Main-d'œuvre	1.00	10000.00	main_oeuvre	\N	\N	2026-04-10 22:21:23.970949	1
57	1	Main-d'œuvre	1.00	13000.00	main_oeuvre	\N	\N	2026-04-10 22:21:23.970949	1
58	1	Parpaings de 12	1.00	30000.00	materiaux	\N	\N	2026-04-10 22:21:23.970949	1
59	1	Déjeuner	1.00	2000.00	divers	\N	\N	2026-04-10 22:21:23.970949	1
60	1	Main-d'œuvre	1.00	10000.00	main_oeuvre	\N	\N	2026-04-10 22:21:23.970949	1
61	1	Déjeuner	1.00	1500.00	divers	\N	\N	2026-04-10 22:21:23.970949	1
62	1	Transport	1.00	1500.00	transport	\N	\N	2026-04-10 22:21:23.970949	1
63	1	Ciment	4.00	5200.00	materiaux	\N	\N	2026-04-10 22:21:23.970949	1
64	1	Parpaings	400.00	225.00	materiaux	\N	\N	2026-04-10 22:21:23.970949	1
65	1	Main-d'œuvre	1.00	10000.00	main_oeuvre	\N	\N	2026-04-10 22:21:23.970949	1
66	1	Main-d'œuvre	1.00	10000.00	main_oeuvre	\N	\N	2026-04-10 22:21:23.970949	1
67	1	Dépense + transport	1.00	3000.00	transport	\N	\N	2026-04-10 22:21:23.970949	1
68	1	Fil d'attache	2.00	750.00	materiaux	\N	\N	2026-04-10 22:21:23.970949	1
69	1	Parpaings de 12	20.00	200.00	materiaux	\N	\N	2026-04-10 22:21:23.970949	1
70	1	Transport	1.00	1500.00	transport	\N	\N	2026-04-10 22:21:23.970949	1
71	1	Main-d'œuvre	1.00	10000.00	main_oeuvre	\N	\N	2026-04-10 22:21:23.970949	1
72	1	Garage (réparation véhicule)	1.00	8500.00	transport	\N	\N	2026-04-10 22:21:23.970949	1
73	1	Sacs de ciment	2.00	5200.00	materiaux	\N	\N	2026-04-10 22:21:23.970949	1
74	1	Sacs de ciment	2.00	5200.00	materiaux	\N	\N	2026-04-10 22:21:23.970949	1
75	1	Fers de 8	5.00	27400.00	materiaux	\N	\N	2026-04-10 22:21:23.970949	1
76	1	Fers de 8	6.00	2900.00	materiaux	\N	\N	2026-04-10 22:21:23.970949	1
77	1	Fer de 6	1.00	1500.00	materiaux	\N	\N	2026-04-10 22:21:23.970949	1
78	1	Corde	1.00	19000.00	materiaux	\N	\N	2026-04-10 22:21:27.776299	2
79	1	Buse	18.00	13000.00	materiaux	\N	\N	2026-04-10 22:21:27.776299	2
80	1	Avance main-d'œuvre	1.00	50000.00	main_oeuvre	\N	\N	2026-04-10 22:21:27.776299	2
81	1	Flash Band de 10 (détail)	2.00	1000.00	materiaux	\N	\N	2026-04-10 22:21:27.776299	2
82	1	Avance main-d'œuvre	1.00	50000.00	main_oeuvre	\N	\N	2026-04-10 22:21:27.776299	2
83	1	Avance main-d'œuvre	1.00	50000.00	main_oeuvre	\N	\N	2026-04-10 22:21:27.776299	2
84	1	Avance main-d'œuvre	1.00	100000.00	main_oeuvre	\N	\N	2026-04-10 22:21:27.776299	2
\.


--
-- Data for Name: chantier_devis_lignes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.chantier_devis_lignes (id, chantier_id, poste, montant_prevu, ordre, lot_id) FROM stdin;
1	1	Bâtiment estimé (devis initial)	3525000.00	0	1
2	1	Carburant estimé (devis initial)	150000.00	1	1
3	1	Puits — forage et équipement	1370000.00	0	2
\.


--
-- Data for Name: chantier_lots; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.chantier_lots (id, chantier_id, nom, description, ordre, created_at) FROM stdin;
1	1	Bâtiment principal	Construction du bâtiment d'élevage principal	0	2026-04-10 22:21:08.328638
2	1	Forage et puits	Creusement du forage et construction du puits	1	2026-04-10 22:21:12.112384
3	2	principal		0	2026-04-10 22:24:35.345541
\.


--
-- Data for Name: chantiers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.chantiers (id, nom, description, statut, date_debut, date_cloture, created_at) FROM stdin;
1	Construction de la ferme Mbiedou		cloture	2026-04-27	2024-01-01	2026-04-10 21:13:46.905964
2	test		en_cours	2026-04-15	\N	2026-04-10 22:24:08.743275
3	test a		en_cours	2026-05-02	\N	2026-05-02 19:58:58.301538
\.


--
-- Data for Name: charges_fixes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.charges_fixes (id, bande_id, loyer) FROM stdin;
3	4	50000.00
8	12	0.00
9	13	0.00
10	14	0.00
11	15	0.00
\.


--
-- Data for Name: consommation_aliment; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.consommation_aliment (id, bande_id, date, quantite_kg) FROM stdin;
152	4	2026-02-17	70.00
153	4	2026-02-18	80.00
154	4	2026-02-19	100.00
155	4	2026-02-20	120.00
156	4	2026-02-21	120.00
157	4	2026-02-22	120.00
158	4	2026-02-24	130.00
159	4	2026-02-25	150.00
160	4	2026-02-26	150.00
161	4	2026-02-27	150.00
162	4	2026-02-28	150.00
163	4	2026-03-01	280.00
164	4	2026-03-02	280.00
165	4	2026-03-10	450.00
166	4	2026-03-11	500.00
167	4	2026-03-12	400.00
168	4	2026-03-13	400.00
169	4	2026-03-14	500.00
170	4	2026-03-15	500.00
171	4	2026-03-17	500.00
172	4	2026-03-18	250.00
173	4	2026-03-19	1100.00
174	4	2026-03-20	400.00
175	4	2026-03-21	500.00
176	4	2026-03-22	650.00
177	4	2026-03-24	450.00
178	4	2026-03-25	1000.00
179	4	2026-03-26	300.00
180	4	2026-03-27	300.00
181	4	2026-03-28	900.00
182	4	2026-03-29	350.00
183	4	2026-03-30	1600.00
184	4	2026-03-31	0.00
185	4	2026-04-01	200.00
186	4	2026-04-02	650.00
187	4	2026-04-03	500.00
188	4	2026-04-04	500.00
189	4	2026-04-05	100.00
190	4	2026-04-06	900.00
191	4	2026-04-07	195.00
207	12	2024-06-14	40.00
208	12	2024-06-15	40.00
209	12	2024-06-16	50.00
210	12	2024-06-17	80.00
211	12	2024-06-18	100.00
212	12	2024-06-19	140.00
213	12	2024-06-20	200.00
214	12	2024-06-21	250.00
215	12	2024-06-22	300.00
216	12	2024-06-23	350.00
217	12	2024-06-24	350.00
218	12	2024-06-25	350.00
219	12	2024-06-26	300.00
220	12	2024-06-27	350.00
221	12	2024-06-28	350.00
222	12	2024-06-29	350.00
223	12	2024-06-30	350.00
224	12	2024-07-01	350.00
225	12	2024-07-02	400.00
226	12	2024-07-03	400.00
227	12	2024-07-04	250.00
228	12	2024-07-05	200.00
229	12	2024-07-06	500.00
230	12	2024-07-07	300.00
231	12	2024-07-08	300.00
232	12	2024-07-09	350.00
233	12	2024-07-10	550.00
234	12	2024-07-11	600.00
235	12	2024-07-12	400.00
236	12	2024-07-13	650.00
237	12	2024-07-14	650.00
238	12	2024-07-15	550.00
239	12	2024-07-16	500.00
240	12	2024-07-17	700.00
241	12	2024-07-18	500.00
242	12	2024-07-19	500.00
243	12	2024-07-20	750.00
244	12	2024-07-21	500.00
245	12	2024-07-22	950.00
246	12	2024-07-23	450.00
247	12	2024-07-24	650.00
248	12	2024-07-25	550.00
249	12	2024-07-26	200.00
250	12	2024-07-27	1000.00
251	12	2024-07-28	350.00
252	12	2024-07-29	900.00
253	12	2024-07-30	350.00
254	12	2024-07-31	900.00
255	14	2025-06-17	20.00
256	14	2025-06-18	30.00
257	14	2025-06-19	35.00
258	14	2025-06-20	65.00
259	14	2025-06-21	80.00
260	14	2025-06-22	45.00
261	14	2025-06-24	100.00
262	14	2025-06-25	130.00
263	14	2025-06-26	170.00
264	14	2025-06-27	200.00
265	14	2025-06-28	200.00
266	14	2025-06-29	200.00
267	14	2025-06-30	200.00
268	14	2025-07-01	200.00
269	14	2025-07-02	258.00
270	14	2025-07-03	250.00
271	14	2025-07-04	250.00
272	14	2025-07-05	250.00
273	14	2025-07-06	250.00
274	14	2025-07-07	300.00
275	14	2025-07-08	350.00
276	14	2025-07-09	300.00
277	14	2025-07-10	350.00
278	14	2025-07-11	400.00
279	14	2025-07-12	350.00
280	14	2025-07-13	350.00
281	14	2025-07-14	350.00
282	14	2025-07-15	250.00
283	14	2025-07-16	350.00
284	14	2025-07-17	550.00
285	14	2025-07-18	350.00
286	14	2025-07-19	400.00
287	14	2025-07-20	450.00
288	14	2025-07-21	350.00
289	14	2025-07-22	250.00
290	14	2025-07-23	700.00
291	14	2025-07-24	400.00
292	14	2025-07-25	250.00
293	14	2025-07-26	250.00
294	14	2025-07-27	250.00
295	14	2025-07-28	550.00
296	14	2025-07-29	250.00
297	14	2025-07-30	250.00
298	14	2025-07-31	300.00
299	14	2025-08-02	650.00
300	14	2025-08-03	200.00
301	14	2025-08-04	150.00
302	14	2025-08-05	250.00
303	14	2025-08-06	200.00
304	14	2025-08-07	200.00
305	14	2025-08-08	200.00
306	14	2025-08-09	250.00
307	14	2025-08-10	200.00
308	14	2025-08-11	50.00
309	14	2025-08-12	100.00
\.


--
-- Data for Name: consommation_eau; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.consommation_eau (id, bande_id, date, age_jours, quantite_litres) FROM stdin;
210	4	2026-02-17	1	80.00
211	4	2026-02-18	2	120.00
212	4	2026-02-19	3	180.00
213	4	2026-02-20	4	300.00
214	4	2026-02-21	5	320.00
215	4	2026-02-22	6	320.00
216	4	2026-02-24	8	330.00
217	4	2026-02-25	9	350.00
218	4	2026-02-26	10	350.00
219	4	2026-02-27	11	380.00
220	4	2026-02-28	12	400.00
221	4	2026-03-01	13	420.00
222	4	2026-03-02	14	450.00
223	4	2026-03-10	22	630.00
224	4	2026-03-11	23	650.00
225	4	2026-03-12	24	670.00
226	4	2026-03-13	25	670.00
227	4	2026-03-14	26	680.00
228	4	2026-03-15	27	680.00
229	4	2026-03-17	29	700.00
230	4	2026-03-18	30	700.00
231	4	2026-03-19	31	720.00
232	4	2026-03-20	32	740.00
233	4	2026-03-21	33	740.00
234	4	2026-03-22	34	740.00
235	4	2026-03-24	36	750.00
236	4	2026-03-25	37	750.00
237	4	2026-03-26	38	780.00
238	4	2026-03-27	39	800.00
239	4	2026-03-28	40	800.00
240	4	2026-03-29	41	820.00
241	4	2026-03-30	42	820.00
242	4	2026-03-31	43	880.00
243	4	2026-04-01	44	850.00
244	4	2026-04-02	45	850.00
245	4	2026-04-03	46	850.00
246	4	2026-04-04	47	850.00
247	4	2026-04-05	48	850.00
248	4	2026-04-06	49	850.00
249	4	2026-04-07	50	850.00
265	12	2024-06-14	1	40.00
266	12	2024-06-15	2	80.00
267	12	2024-06-16	3	160.00
268	12	2024-06-17	4	210.00
269	12	2024-06-18	5	220.00
270	12	2024-06-19	6	240.00
271	12	2024-06-20	7	320.00
272	12	2024-06-21	8	470.00
273	12	2024-06-22	9	540.00
274	12	2024-06-23	10	540.00
275	12	2024-06-24	11	540.00
276	12	2024-06-25	12	600.00
277	12	2024-06-26	13	540.00
278	12	2024-06-27	14	600.00
279	12	2024-06-28	15	600.00
280	12	2024-06-29	16	600.00
281	12	2024-06-30	17	600.00
282	12	2024-07-01	18	600.00
283	12	2024-07-02	19	740.00
284	12	2024-07-03	20	740.00
285	12	2024-07-04	21	740.00
286	12	2024-07-05	22	780.00
287	12	2024-07-06	23	1000.00
288	12	2024-07-07	24	1000.00
289	12	2024-07-08	25	1000.00
290	12	2024-07-09	26	1000.00
291	12	2024-07-10	27	1000.00
292	12	2024-07-11	28	1400.00
293	12	2024-07-12	29	1500.00
294	12	2024-07-13	30	1600.00
295	12	2024-07-14	31	1600.00
296	12	2024-07-15	32	1600.00
297	12	2024-07-16	33	1720.00
298	12	2024-07-17	34	1200.00
299	12	2024-07-18	35	1900.00
300	12	2024-07-19	36	2000.00
301	12	2024-07-20	37	2000.00
302	12	2024-07-21	38	2000.00
303	12	2024-07-22	39	2000.00
304	12	2024-07-23	40	2000.00
305	12	2024-07-24	41	2000.00
306	12	2024-07-25	42	2000.00
307	12	2024-07-26	43	2000.00
308	12	2024-07-27	44	2000.00
309	12	2024-07-28	45	2000.00
310	12	2024-07-29	46	2000.00
311	12	2024-07-30	47	2000.00
312	12	2024-07-31	48	2000.00
313	12	2024-08-01	49	1700.00
314	13	2025-04-03	1	80.00
315	13	2025-04-04	2	90.00
316	13	2025-04-05	3	170.00
317	13	2025-04-06	4	160.00
318	13	2025-04-07	5	200.00
319	13	2025-04-08	6	220.00
320	13	2025-04-10	8	280.00
321	13	2025-04-11	9	390.00
322	13	2025-04-12	10	400.00
323	13	2025-04-13	11	420.00
324	13	2025-04-14	12	480.00
325	13	2025-04-15	13	420.00
326	13	2025-04-16	14	500.00
327	13	2025-04-17	15	520.00
328	13	2025-04-18	16	520.00
329	13	2025-04-19	17	600.00
330	13	2025-04-20	18	700.00
331	13	2025-04-21	19	700.00
332	13	2025-04-22	20	750.00
333	13	2025-04-23	21	750.00
334	13	2025-04-24	22	900.00
335	13	2025-04-25	23	1100.00
336	13	2025-04-26	24	1250.00
337	13	2025-04-27	25	1300.00
338	13	2025-04-28	26	1300.00
339	13	2025-04-29	27	1300.00
340	13	2025-04-30	28	1800.00
341	13	2025-05-01	29	7300.00
342	13	2025-05-02	30	7300.00
343	13	2025-05-03	31	8450.00
344	13	2025-05-04	32	9000.00
345	13	2025-05-05	33	9500.00
346	13	2025-05-06	34	1000.00
347	13	2025-05-07	35	2200.00
348	13	2025-05-08	36	2200.00
349	13	2025-05-09	37	2400.00
350	13	2025-05-10	38	2400.00
351	13	2025-05-11	39	2400.00
352	13	2025-05-12	40	2400.00
353	13	2025-05-13	41	2400.00
354	13	2025-05-14	42	2600.00
355	13	2025-05-15	43	2600.00
356	13	2025-05-16	44	2400.00
357	13	2025-05-17	45	2000.00
358	13	2025-05-18	46	2000.00
359	13	2025-05-19	47	1800.00
360	13	2025-05-20	48	1600.00
361	13	2025-05-21	49	1400.00
362	13	2025-05-22	50	1200.00
363	13	2025-05-23	51	1200.00
364	13	2025-05-24	52	1200.00
365	13	2025-05-25	53	1200.00
366	13	2025-05-26	54	1000.00
367	13	2025-05-27	55	1000.00
368	13	2025-05-29	57	1000.00
369	14	2025-06-17	1	40.00
370	14	2025-06-18	2	55.00
371	14	2025-06-19	3	80.00
372	14	2025-06-20	4	160.00
373	14	2025-06-21	5	84.00
374	14	2025-06-22	6	91.00
375	14	2025-06-24	8	220.00
376	14	2025-06-25	9	250.00
377	14	2025-06-26	10	320.00
378	14	2025-06-27	11	350.00
379	14	2025-06-28	12	400.00
380	14	2025-06-29	13	400.00
381	14	2025-06-30	14	400.00
382	14	2025-07-01	15	480.00
383	14	2025-07-02	16	560.00
384	14	2025-07-03	17	600.00
385	14	2025-07-04	18	640.00
386	14	2025-07-05	19	650.00
387	14	2025-07-06	20	670.00
388	14	2025-07-07	21	690.00
389	14	2025-07-08	22	880.00
390	14	2025-07-09	23	760.00
391	14	2025-07-10	24	800.00
392	14	2025-07-11	25	900.00
393	14	2025-07-12	26	900.00
394	14	2025-07-13	27	900.00
395	14	2025-07-14	28	950.00
396	14	2025-07-15	29	920.00
397	14	2025-07-16	30	950.00
398	14	2025-07-17	31	1290.00
399	14	2025-07-18	32	1290.00
400	14	2025-07-19	33	1600.00
401	14	2025-07-20	34	1600.00
402	14	2025-07-21	35	1600.00
403	14	2025-07-22	36	1600.00
404	14	2025-07-23	37	1600.00
405	14	2025-07-24	38	1700.00
406	14	2025-07-25	39	1700.00
407	14	2025-07-26	40	1700.00
408	14	2025-07-27	41	1700.00
409	14	2025-07-28	42	1700.00
410	14	2025-07-29	43	1800.00
411	14	2025-07-30	44	1800.00
412	14	2025-07-31	45	1800.00
413	14	2025-08-01	46	1800.00
414	14	2025-08-02	47	1800.00
415	14	2025-08-03	48	1700.00
416	14	2025-08-04	49	1600.00
417	14	2025-08-05	50	1300.00
418	14	2025-08-06	51	1300.00
419	14	2025-08-07	52	1200.00
420	14	2025-08-08	53	1200.00
421	14	2025-08-09	54	1200.00
422	14	2025-08-10	55	1100.00
423	14	2025-08-11	56	1000.00
424	14	2025-08-12	57	1000.00
\.


--
-- Data for Name: depenses_vente; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.depenses_vente (id, bande_id, designation, montant) FROM stdin;
\.


--
-- Data for Name: financement; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.financement (id, nom, montant, date, created_at, type, taux_interet, date_remboursement_prevue) FROM stdin;
1	Papa	600000.00	2024-01-01	2026-04-01 09:09:32.119697	apport	0.00	\N
2	Maman	1500000.00	2024-01-01	2026-04-01 09:09:32.119697	apport	0.00	\N
3	Murielle	1200000.00	2024-01-01	2026-04-01 09:09:32.119697	apport	0.00	\N
4	Jeriel	1800000.00	2024-01-01	2026-04-01 09:09:32.119697	apport	0.00	\N
6	Reunion 	14000000.00	2026-05-02	2026-05-02 19:58:03.2936	pret	0.00	\N
\.


--
-- Data for Name: mortalite_journaliere; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.mortalite_journaliere (id, bande_id, date, age_jours, deces_jour) FROM stdin;
157	4	2026-02-17	1	3
158	4	2026-02-18	2	12
159	4	2026-02-19	3	16
160	4	2026-02-20	4	13
161	4	2026-02-21	5	9
162	4	2026-02-22	6	10
163	4	2026-02-23	7	4
164	4	2026-02-24	8	0
165	4	2026-02-25	9	3
166	4	2026-02-26	10	5
167	4	2026-02-27	11	5
168	4	2026-02-28	12	4
169	4	2026-03-01	13	1
170	4	2026-03-02	14	6
171	4	2026-03-10	22	1
172	4	2026-03-11	23	3
173	4	2026-03-12	24	1
174	4	2026-03-13	25	1
175	4	2026-03-14	26	0
176	4	2026-03-15	27	3
177	4	2026-03-16	28	4
178	4	2026-03-17	29	2
179	4	2026-03-18	30	4
180	4	2026-03-19	31	2
181	4	2026-03-20	32	0
182	4	2026-03-21	33	3
183	4	2026-03-22	34	2
184	4	2026-03-23	35	0
185	4	2026-03-24	36	0
186	4	2026-03-25	37	4
187	4	2026-03-26	38	3
188	4	2026-03-27	39	2
189	4	2026-03-28	40	3
190	4	2026-03-29	41	3
191	4	2026-03-30	42	3
192	4	2026-03-31	43	0
193	4	2026-04-01	44	0
194	4	2026-04-02	45	1
195	4	2026-04-03	46	3
196	4	2026-04-04	47	1
197	4	2026-04-05	48	5
198	4	2026-04-06	49	22
199	4	2026-04-07	50	9
215	12	2024-06-14	1	2
216	12	2024-06-15	2	6
217	12	2024-06-16	3	5
218	12	2024-06-17	4	5
219	12	2024-06-18	5	3
220	12	2024-06-19	6	5
221	12	2024-06-20	7	5
222	12	2024-06-21	8	2
223	12	2024-06-22	9	5
224	12	2024-06-23	10	3
225	12	2024-06-24	11	2
226	12	2024-06-25	12	0
227	12	2024-06-26	13	0
228	12	2024-06-27	14	0
229	12	2024-06-28	15	1
230	12	2024-06-29	16	3
231	12	2024-06-30	17	1
232	12	2024-07-01	18	1
233	12	2024-07-02	19	3
234	12	2024-07-03	20	1
235	12	2024-07-04	21	1
236	12	2024-07-05	22	1
237	12	2024-07-06	23	1
238	12	2024-07-07	24	1
239	12	2024-07-08	25	3
240	12	2024-07-09	26	3
241	12	2024-07-10	27	4
242	12	2024-07-11	28	2
243	12	2024-07-12	29	5
244	12	2024-07-13	30	2
245	12	2024-07-14	31	2
246	12	2024-07-15	32	1
247	12	2024-07-16	33	1
248	12	2024-07-17	34	3
249	12	2024-07-18	35	1
250	12	2024-07-19	36	0
251	12	2024-07-20	37	1
252	12	2024-07-21	38	1
253	12	2024-07-22	39	0
254	12	2024-07-23	40	3
255	12	2024-07-24	41	0
256	12	2024-07-25	42	2
257	12	2024-07-26	43	1
258	12	2024-07-27	44	2
259	12	2024-07-28	45	1
260	12	2024-07-29	46	1
261	12	2024-07-30	47	0
262	12	2024-07-31	48	1
263	12	2024-08-01	49	2
264	12	2024-08-02	50	2
265	12	2024-08-03	51	2
266	12	2024-08-04	52	1
267	12	2024-08-05	53	1
268	12	2024-08-06	54	0
269	12	2024-08-07	55	1
270	12	2024-08-08	56	6
271	12	2024-08-09	57	2
272	12	2024-08-10	58	1
273	12	2024-08-11	59	1
274	14	2025-06-17	1	0
275	14	2025-06-18	2	2
276	14	2025-06-19	3	4
277	14	2025-06-20	4	4
278	14	2025-06-21	5	7
279	14	2025-06-22	6	2
280	14	2025-06-24	8	3
281	14	2025-06-25	9	2
282	14	2025-06-26	10	2
283	14	2025-06-27	11	4
284	14	2025-06-28	12	1
285	14	2025-06-29	13	1
286	14	2025-06-30	14	0
287	14	2025-07-01	15	1
288	14	2025-07-02	16	3
289	14	2025-07-03	17	1
290	14	2025-07-04	18	2
291	14	2025-07-05	19	3
292	14	2025-07-06	20	1
293	14	2025-07-07	21	1
294	14	2025-07-08	22	2
295	14	2025-07-09	23	0
296	14	2025-07-10	24	1
297	14	2025-07-11	25	1
298	14	2025-07-12	26	2
299	14	2025-07-13	27	0
300	14	2025-07-14	28	1
301	14	2025-07-15	29	1
302	14	2025-07-16	30	2
303	14	2025-07-17	31	7
304	14	2025-07-18	32	4
305	14	2025-07-19	33	1
306	14	2025-07-20	34	6
307	14	2025-07-21	35	4
308	14	2025-07-22	36	1
309	14	2025-07-23	37	2
310	14	2025-07-24	38	24
311	14	2025-07-25	39	4
312	14	2025-07-26	40	2
313	14	2025-07-27	41	4
314	14	2025-07-28	42	18
315	14	2025-07-29	43	15
316	14	2025-07-30	44	9
317	14	2025-07-31	45	4
318	14	2025-08-01	46	10
319	14	2025-08-02	47	6
320	14	2025-08-03	48	5
321	14	2025-08-04	49	9
322	14	2025-08-05	50	8
323	14	2025-08-06	51	7
324	14	2025-08-07	52	8
325	14	2025-08-08	53	9
326	14	2025-08-09	54	5
327	14	2025-08-10	55	2
328	14	2025-08-11	56	3
329	14	2025-08-12	57	2
\.


--
-- Data for Name: observations_journal; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.observations_journal (id, bande_id, date, age_jours, contenu) FROM stdin;
62	13	2025-04-03	1	a l`installation= l´ail+miel+ACV pendant 2 heures
63	13	2025-04-04	2	l´ail+miel+ACV pendant 2 heures
64	13	2025-04-05	3	l´ail+miel+ACV pendant 2 heures
65	13	2025-04-06	4	TT8+mineral+duritique+ antistress
66	13	2025-04-07	5	mourigha+ X-mold
67	13	2025-04-08	6	mourigha+ X-mold
68	13	2025-04-16	14	Vit + vironet
69	13	2025-04-17	15	vaccin le voir vit + mineral + its
70	13	2025-04-18	16	minerale + vit+ its+ x-mold
71	13	2025-04-19	17	minerale + vit+ its+ x-mold
72	13	2025-04-20	18	minerale + vit+ its+ x-mold
73	13	2025-04-21	19	minerale + vit+ its+ x-mold
74	13	2025-04-22	20	minerale + vit+ its+ x-mold
75	13	2025-04-23	21	minerale + vit+ its+ x-mold
76	14	2025-06-17	1	Instalation avec composition de ali.+ acv + parametre a 2 heures
77	14	2025-06-18	2	Instalation avec composition de ali.+ acv + parametre  a 2 heures
78	14	2025-06-19	3	Instalation avec composition de ali.+ acv + parametre  2 heures
79	14	2025-06-20	4	l´ail, mid + acv le matin
80	14	2025-06-21	5	moringha 4 l/20 litres, moulac 50 ml/20 litres d´eau, parametre prise a 14 heures
81	14	2025-06-22	6	moringha 4 l/20 litres, moulac 50 ml/20 litres d´eau, parametre prise a 14 heures
82	14	2025-06-24	8	melanger 50g / sac de 50 kg d´aliment de moringha
83	14	2025-06-25	9	en soirée moringha + moulac
84	14	2025-06-26	10	en soirée moringha + moulac
85	14	2025-06-27	11	moulac 60 ml/20l a partir du 10ème jours
86	14	2025-06-30	14	vaccin gomborc + IB-NB Duo le soir moulac
87	14	2025-07-01	15	moulac + moringha
88	14	2025-07-02	16	moulac + moringha
89	14	2025-07-08	22	melange piment + djindja+tumanque dans l´aliment, moulac en soirèe
90	14	2025-07-09	23	melange piment + djindja+tumanque dans l´aliment, moulac en soirèe
91	14	2025-07-10	24	melange piment + djindja+tumanque dans l´aliment, moulac en soirèe
92	14	2025-07-11	25	eau simple
93	14	2025-07-12	26	eau simple
94	14	2025-07-13	27	eau simple
95	14	2025-07-14	28	melange piment + djindja+tumanque dans l´aliment, moulac en soirèe
96	14	2025-07-15	29	melange piment + djindja+tumanque dans l´aliment, moulac en soirèe
97	14	2025-07-16	30	eau simple
98	14	2025-07-17	31	eau simple
99	14	2025-07-20	34	ail
100	14	2025-07-21	35	melange: djindja + tumerique+moringha dans l´aliment, moulac en soirée
101	14	2025-07-22	36	melange: djindja + tumerique+moringha dans l´aliment, moulac en soirée
102	14	2025-07-23	37	anticoc
103	14	2025-07-24	38	eau simple
104	14	2025-07-25	39	eau simple
105	14	2025-07-26	40	eau simple
106	14	2025-07-28	42	paul fresh-Vitamine
\.


--
-- Data for Name: parametres; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.parametres (id, cle, valeur, description, categorie, updated_at) FROM stdin;
3	seuil_mortalite_alerte_jour	3	Taux de mortalité journalier déclenchant une alerte rouge (%)	Alertes	2026-04-07 16:36:23.554892
4	seuil_mortalite_alerte_cumul	5	Taux de mortalité cumulé affiché en rouge (%)	Alertes	2026-04-07 16:36:23.554892
5	seuil_poids_alerte	90	Pourcentage minimum du poids objectif avant alerte (%)	Alertes	2026-04-07 16:36:23.554892
6	ic_bon	1.8	Indice de conversion considéré comme bon (≤)	Indice de conversion	2026-04-07 16:36:23.554892
7	ic_moyen	2.2	Indice de conversion considéré comme moyen (≤)	Indice de conversion	2026-04-07 16:36:23.554892
8	budget_batiment_defaut	3525000	Budget bâtiment par défaut si aucun devis (FCFA)	Budget construction	2026-04-07 16:36:23.554892
9	budget_carburant_defaut	150000	Budget carburant par défaut si aucun devis (FCFA)	Budget construction	2026-04-07 16:36:23.554892
10	vaccin_j1_nom	Désinfection et installation	Nom du traitement jour 1	Calendrier vaccinal	2026-04-07 16:36:23.554892
11	vaccin_j1_jour	1	Jour prévu pour le traitement 1	Calendrier vaccinal	2026-04-07 16:36:23.554892
12	vaccin_j1_description	Préparation du poulailler	Description du traitement jour 1	Calendrier vaccinal	2026-04-07 16:36:23.554892
13	vaccin_j7_nom	Vaccin Newcastle	Nom du vaccin jour 7	Calendrier vaccinal	2026-04-07 16:36:23.554892
14	vaccin_j7_jour	7	Jour prévu pour le vaccin Newcastle	Calendrier vaccinal	2026-04-07 16:36:23.554892
15	vaccin_j7_description	Première vaccination contre Newcastle	Description vaccin jour 7	Calendrier vaccinal	2026-04-07 16:36:23.554892
16	vaccin_j14_nom	Vaccin Gumboro	Nom du vaccin jour 14	Calendrier vaccinal	2026-04-07 16:36:23.554892
17	vaccin_j14_jour	14	Jour prévu pour le vaccin Gumboro	Calendrier vaccinal	2026-04-07 16:36:23.554892
18	vaccin_j14_description	Vaccination contre la maladie de Gumboro	Description vaccin jour 14	Calendrier vaccinal	2026-04-07 16:36:23.554892
19	vaccin_j21_nom	Rappel Newcastle	Nom du vaccin jour 21	Calendrier vaccinal	2026-04-07 16:36:23.554892
20	vaccin_j21_jour	21	Jour prévu pour le rappel Newcastle	Calendrier vaccinal	2026-04-07 16:36:23.554892
21	vaccin_j21_description	Rappel de vaccination Newcastle	Description vaccin jour 21	Calendrier vaccinal	2026-04-07 16:36:23.554892
22	vaccin_j28_nom	Vaccin Bronchite infectieuse	Nom du vaccin jour 28	Calendrier vaccinal	2026-04-07 16:36:23.554892
23	vaccin_j28_jour	28	Jour prévu pour le vaccin bronchite infectieuse	Calendrier vaccinal	2026-04-07 16:36:23.554892
24	vaccin_j28_description	Vaccination contre la bronchite infectieuse	Description vaccin jour 28	Calendrier vaccinal	2026-04-07 16:36:23.554892
1	taux_depreciation_materiel	10	Taux de dépréciation annuel du matériel fixe (%)	Charges fixes	2026-04-07 16:43:26.864
2	taux_imprevus	0	Taux pour imprévus sur dépenses de production (%)	Charges fixes	2026-04-08 16:54:20.594
\.


--
-- Data for Name: pesees; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.pesees (id, bande_id, date, age_jours, poids_moyen_g, poids_min_g, poids_max_g, objectif_poids_g) FROM stdin;
150	4	2026-02-18	2	95.00	\N	\N	\N
151	4	2026-02-19	3	135.00	\N	\N	\N
152	4	2026-02-20	4	140.00	\N	\N	\N
153	4	2026-02-21	5	155.00	\N	\N	\N
154	4	2026-03-02	14	470.00	\N	\N	\N
155	4	2026-03-10	22	1190.00	\N	\N	\N
156	4	2026-03-11	23	1250.00	\N	\N	\N
157	4	2026-03-12	24	1355.00	\N	\N	\N
158	4	2026-03-13	25	1408.00	\N	\N	\N
159	4	2026-03-14	26	1350.00	\N	\N	\N
160	4	2026-03-17	29	1410.00	\N	\N	\N
161	4	2026-03-18	30	1445.00	\N	\N	\N
162	4	2026-03-19	31	1630.00	\N	\N	\N
163	4	2026-03-20	32	1905.00	\N	\N	\N
164	4	2026-03-21	33	1945.00	\N	\N	\N
165	4	2026-03-24	36	2000.00	\N	\N	\N
166	4	2026-03-25	37	2138.00	\N	\N	\N
167	4	2026-03-27	39	2438.00	\N	\N	\N
169	12	2024-06-14	1	45.00	\N	\N	\N
170	12	2024-06-15	2	53.00	\N	\N	\N
171	12	2024-06-16	3	63.00	\N	\N	\N
172	12	2024-06-17	4	77.00	\N	\N	\N
173	12	2024-06-18	5	88.00	\N	\N	\N
174	12	2024-06-19	6	13.00	\N	\N	\N
175	12	2024-06-20	7	15.00	\N	\N	\N
176	12	2024-06-21	8	148.00	\N	\N	\N
177	12	2024-06-22	9	195.00	\N	\N	\N
178	12	2024-06-23	10	225.00	\N	\N	\N
179	12	2024-06-24	11	265.00	\N	\N	\N
180	12	2024-06-25	12	293.00	\N	\N	\N
181	12	2024-06-26	13	318.00	\N	\N	\N
182	12	2024-06-27	14	380.00	\N	\N	\N
183	12	2024-06-28	15	430.00	\N	\N	\N
184	12	2024-06-29	16	500.00	\N	\N	\N
185	12	2024-06-30	17	548.00	\N	\N	\N
186	12	2024-07-01	18	535.00	\N	\N	\N
187	12	2024-07-02	19	595.00	\N	\N	\N
188	12	2024-07-03	20	630.00	\N	\N	\N
189	12	2024-07-04	21	670.00	\N	\N	\N
190	12	2024-07-05	22	720.00	\N	\N	\N
191	12	2024-07-06	23	695.00	\N	\N	\N
192	12	2024-07-07	24	46.00	\N	\N	\N
193	12	2024-07-08	25	818.00	\N	\N	\N
194	12	2024-07-09	26	1058.00	\N	\N	\N
195	12	2024-07-10	27	1183.00	\N	\N	\N
196	12	2024-07-11	28	1138.00	\N	\N	\N
197	12	2024-07-12	29	1255.00	\N	\N	\N
198	12	2024-07-13	30	1353.00	\N	\N	\N
199	12	2024-07-14	31	1415.00	\N	\N	\N
200	12	2024-07-15	32	1481.00	\N	\N	\N
201	12	2024-08-01	49	1870.00	\N	\N	\N
202	13	2025-04-07	5	150.00	\N	\N	\N
203	13	2025-04-08	6	140.00	\N	\N	\N
204	13	2025-04-09	7	200.00	\N	\N	\N
205	13	2025-04-10	8	245.00	\N	\N	\N
206	13	2025-04-11	9	300.00	\N	\N	\N
207	13	2025-04-12	10	305.00	\N	\N	\N
208	13	2025-04-13	11	335.00	\N	\N	\N
209	13	2025-04-14	12	399.00	\N	\N	\N
210	13	2025-04-16	14	490.00	\N	\N	\N
211	13	2025-04-17	15	545.00	\N	\N	\N
212	13	2025-04-18	16	565.00	\N	\N	\N
213	13	2025-04-19	17	665.00	\N	\N	\N
214	13	2025-04-20	18	760.00	\N	\N	\N
215	13	2025-04-21	19	810.00	\N	\N	\N
216	13	2025-04-22	20	890.00	\N	\N	\N
217	13	2025-04-23	21	990.00	\N	\N	\N
218	13	2025-04-24	22	1010.00	\N	\N	\N
219	13	2025-04-25	23	1080.00	\N	\N	\N
220	13	2025-04-26	24	1140.00	\N	\N	\N
221	13	2025-04-27	25	1170.00	\N	\N	\N
222	13	2025-04-28	26	1285.00	\N	\N	\N
223	13	2025-04-29	27	1285.00	\N	\N	\N
224	13	2025-04-30	28	1500.00	\N	\N	\N
225	13	2025-05-01	29	1580.00	\N	\N	\N
226	13	2025-05-02	30	1560.00	\N	\N	\N
227	13	2025-05-03	31	1560.00	\N	\N	\N
228	13	2025-05-05	33	1800.00	\N	\N	\N
229	13	2025-05-06	34	700.00	\N	\N	\N
230	13	2025-05-07	35	2190.00	\N	\N	\N
231	13	2025-05-08	36	2310.00	\N	\N	\N
232	13	2025-05-09	37	2425.00	\N	\N	\N
233	13	2025-05-14	42	2700.00	\N	\N	\N
234	13	2025-05-15	43	2900.00	\N	\N	\N
235	13	2025-05-16	44	2800.00	\N	\N	\N
236	13	2025-05-22	50	3200.00	\N	\N	\N
237	13	2025-05-23	51	3400.00	\N	\N	\N
238	13	2025-05-24	52	3500.00	\N	\N	\N
239	13	2025-05-25	53	3600.00	\N	\N	\N
240	13	2025-05-26	54	4100.00	\N	\N	\N
241	13	2025-05-27	55	3600.00	\N	\N	\N
242	13	2025-05-29	57	4100.00	\N	\N	\N
243	14	2025-06-17	1	40.00	\N	\N	\N
244	14	2025-06-18	2	50.00	\N	\N	\N
245	14	2025-06-19	3	62.00	\N	\N	\N
246	14	2025-06-20	4	84.00	\N	\N	\N
247	14	2025-06-21	5	91.00	\N	\N	\N
248	14	2025-06-22	6	117.00	\N	\N	\N
249	14	2025-06-24	8	162.00	\N	\N	\N
250	14	2025-06-25	9	185.00	\N	\N	\N
251	14	2025-06-26	10	236.00	\N	\N	\N
252	14	2025-06-27	11	274.00	\N	\N	\N
253	14	2025-06-28	12	341.00	\N	\N	\N
254	14	2025-06-29	13	391.00	\N	\N	\N
255	14	2025-06-30	14	452.00	\N	\N	\N
256	14	2025-07-01	15	491.00	\N	\N	\N
257	14	2025-07-02	16	550.00	\N	\N	\N
258	14	2025-07-03	17	573.00	\N	\N	\N
259	14	2025-07-04	18	686.00	\N	\N	\N
260	14	2025-07-06	20	800.00	\N	\N	\N
261	14	2025-07-07	21	921.00	\N	\N	\N
262	14	2025-07-08	22	625.00	\N	\N	\N
263	14	2025-07-09	23	715.00	\N	\N	\N
264	14	2025-07-10	24	55.00	\N	\N	\N
265	14	2025-07-11	25	955.00	\N	\N	\N
266	14	2025-07-12	26	895.00	\N	\N	\N
267	14	2025-07-13	27	1050.00	\N	\N	\N
268	14	2025-07-14	28	1000.00	\N	\N	\N
269	14	2025-07-15	29	1245.00	\N	\N	\N
270	14	2025-07-16	30	1170.00	\N	\N	\N
271	14	2025-07-17	31	1265.00	\N	\N	\N
272	14	2025-07-18	32	1335.00	\N	\N	\N
273	14	2025-07-19	33	1535.00	\N	\N	\N
274	14	2025-07-20	34	1600.00	\N	\N	\N
275	14	2025-07-21	35	1550.00	\N	\N	\N
276	14	2025-07-22	36	1500.00	\N	\N	\N
277	14	2025-07-23	37	1800.00	\N	\N	\N
278	14	2025-07-24	38	1840.00	\N	\N	\N
279	14	2025-07-25	39	1845.00	\N	\N	\N
280	14	2025-07-26	40	2040.00	\N	\N	\N
281	14	2025-07-27	41	2050.00	\N	\N	\N
282	14	2025-07-28	42	2230.00	\N	\N	\N
283	14	2025-07-29	43	1740.00	\N	\N	\N
284	14	2025-07-30	44	1400.00	\N	\N	\N
\.


--
-- Data for Name: remboursements; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.remboursements (id, investisseur_nom, montant, date, commentaire, created_at) FROM stdin;
\.


--
-- Data for Name: session; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.session (sid, sess, expire) FROM stdin;
Jvi8GZafRGjjSe1osWH2XF-LTapYQLFD	{"cookie":{"originalMaxAge":604800000,"expires":"2026-05-09T19:10:55.689Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"userId":1}	2026-05-09 19:10:57
XXu_dlQIGTSmMAoLW6XLaY2g8EPBMtz1	{"cookie":{"originalMaxAge":604800000,"expires":"2026-05-09T19:40:21.697Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"userId":1}	2026-05-09 19:40:22
inlY2b2XDMEJ2038sqwwjHRtjzoJ39az	{"cookie":{"originalMaxAge":604800000,"expires":"2026-05-09T19:42:14.350Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"userId":1}	2026-05-09 19:44:45
Ry2hUcRGUKmDhI1hupEesKU5lRjkQIFM	{"cookie":{"originalMaxAge":604800000,"expires":"2026-05-09T19:48:53.611Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"userId":1}	2026-05-09 19:48:54
hjyD0w7xS93HJVTNJ7aNaYZNPlduimsn	{"cookie":{"originalMaxAge":604800000,"expires":"2026-05-09T19:51:36.095Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"userId":1}	2026-05-09 21:06:07
\.


--
-- Data for Name: stock_aliments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.stock_aliments (id, designation, type, quantite_kg, prix_unitaire, fournisseur, date, commentaire, created_at) FROM stdin;
\.


--
-- Data for Name: stock_medicaments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.stock_medicaments (id, nom, type, quantite, unite, date_peremption, fournisseur, date, commentaire, created_at) FROM stdin;
\.


--
-- Data for Name: traitements; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.traitements (id, bande_id, date, age_jours, produit, type, dosage, observations) FROM stdin;
79	13	2025-04-03	1	Antibiotic+vitamine+miniral+duretique+antistress	traitement	\N	\N
80	13	2025-04-04	2	Antibiotic+vitamine+miniral+duretique+antistress	traitement	\N	\N
81	13	2025-04-05	3	Antibiotic+vitamine+miniral+duretique+antistress	traitement	\N	\N
82	13	2025-04-06	4	Antibiotic+vitamine+miniral+duretique+antistress	traitement	\N	\N
83	13	2025-04-07	5	Antibiotic+vitamine+miniral+duretique+antistress	traitement	\N	\N
84	13	2025-04-08	6	X-mold + moringha	traitement	\N	\N
85	13	2025-04-10	8	anti stress vaccin	traitement	\N	\N
86	13	2025-04-11	9	Vit, mineral, duretique	traitement	\N	\N
87	13	2025-04-12	10	Anticoc	traitement	\N	\N
88	13	2025-04-13	11	Anticoc	traitement	\N	\N
89	13	2025-04-14	12	Anticoc	traitement	\N	\N
90	13	2025-04-15	13	eau simple	traitement	\N	\N
91	13	2025-04-16	14	eau simple	traitement	\N	\N
92	13	2025-04-17	15	Antistress	traitement	\N	\N
93	13	2025-04-18	16	minerale + vit + its+ miel	traitement	\N	\N
94	13	2025-04-19	17	minerale + vit + its+ miel	traitement	\N	\N
95	13	2025-04-20	18	eau simple	traitement	\N	\N
96	13	2025-04-21	19	eau simple	traitement	\N	\N
97	13	2025-04-22	20	antibiotique	traitement	\N	\N
98	13	2025-04-23	21	antibiotique	traitement	\N	\N
99	13	2025-04-24	22	minerale + vit + its+ miel	traitement	\N	\N
100	13	2025-04-25	23	minerale + vit + its+ miel	traitement	\N	\N
101	13	2025-04-26	24	vironet+ ail+ antibiotique	traitement	\N	\N
102	13	2025-04-27	25	antibiotique	traitement	\N	\N
103	13	2025-04-28	26	eau simple	traitement	\N	\N
104	13	2025-04-29	27	anticoc	traitement	\N	\N
105	13	2025-04-30	28	anticoc	traitement	\N	\N
106	13	2025-05-01	29	anticoc	traitement	\N	\N
107	13	2025-05-02	30	anticoc	traitement	\N	\N
108	13	2025-05-03	31	eau simple	traitement	\N	\N
109	13	2025-05-04	32	eau simple	traitement	\N	\N
110	13	2025-05-05	33	eau simple	traitement	\N	\N
111	13	2025-05-06	34	eau simple	traitement	\N	\N
112	13	2025-05-07	35	vironet + antibiotique+ paul ereth	traitement	\N	\N
113	13	2025-05-08	36	Antibiotiqur+ paul erth+ duretique	traitement	\N	\N
114	13	2025-05-09	37	paul fresh+ vit+ duretique+ djindja+ piment	traitement	\N	\N
115	13	2025-05-11	39	paul fresh + piment + djindja+ duretique+ ail	traitement	\N	\N
116	13	2025-05-14	42	eau simple	traitement	\N	\N
117	13	2025-05-25	53	paul fresh	traitement	\N	\N
118	14	2025-06-17	1	T.ts+ Vit+ antistress + mineral + duretique	traitement	\N	\N
119	14	2025-06-18	2	T.ts+ Vit+ antistress + mineral + duretique	traitement	\N	\N
120	14	2025-06-19	3	antistress + vitamine	traitement	\N	\N
121	14	2025-06-20	4	antistress + vitamine	traitement	\N	\N
122	14	2025-06-21	5	antistress + vitamine	traitement	\N	\N
123	14	2025-06-22	6	Moringha + moulac	traitement	\N	\N
124	14	2025-06-24	8	oxytesrat, vitamine + mineral+ duretique	traitement	\N	\N
125	14	2025-06-25	9	oxytesrat, vitamine + mineral+ duretique	traitement	\N	\N
126	14	2025-06-26	10	anticoc	traitement	\N	\N
127	14	2025-06-27	11	anticoc	traitement	\N	\N
128	14	2025-06-28	12	anticoc	traitement	\N	\N
129	14	2025-06-29	13	anticoc	traitement	\N	\N
130	14	2025-06-30	14	antibiotic apres vaccin	traitement	\N	\N
131	14	2025-07-01	15	Vit. + minerale + TTS	traitement	\N	\N
132	14	2025-07-02	16	Vit. + minerale + Oxytetra	traitement	\N	\N
133	14	2025-07-03	17	Vit. + minerale + Oxytetra	traitement	\N	\N
134	14	2025-07-04	18	Vit.  + Oxytetra	traitement	\N	\N
135	14	2025-07-07	21	vironet + moulac	traitement	\N	\N
136	14	2025-07-08	22	vaccin 21ème jour+ Antistress	traitement	\N	\N
137	14	2025-07-09	23	vetclin total	traitement	\N	\N
138	14	2025-07-10	24	vetclin total	traitement	\N	\N
139	14	2025-07-11	25	anticoc	traitement	\N	\N
140	14	2025-07-12	26	anticoc	traitement	\N	\N
141	14	2025-07-13	27	anticoc	traitement	\N	\N
142	14	2025-07-14	28	anticoc	traitement	\N	\N
143	14	2025-07-15	29	vironet 5cl/1oml vetclin total	traitement	\N	\N
144	14	2025-07-16	30	vironet 5cl/1oml vetclin total	traitement	\N	\N
145	14	2025-07-17	31	vironet 5cl/1oml vetclin total	traitement	\N	\N
146	14	2025-07-18	32	eau simple	traitement	\N	\N
147	14	2025-07-19	33	eau simple	traitement	\N	\N
148	14	2025-07-20	34	ail+ paul fresh	traitement	\N	\N
149	14	2025-07-21	35	ashialben	traitement	\N	\N
150	14	2025-07-22	36	viremet+ paul fresh	traitement	\N	\N
151	14	2025-07-23	37	anticoc + paul fresh	traitement	\N	\N
152	14	2025-07-24	38	eau simple + paul fresh	traitement	\N	\N
153	14	2025-07-25	39	paul fresh	traitement	\N	\N
154	14	2025-07-26	40	paul fresh	traitement	\N	\N
155	14	2025-07-27	41	ail+ paul fresh	traitement	\N	\N
156	14	2025-07-28	42	ail+ paul fresh + vitamine	traitement	\N	\N
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, username, password, role, nom, created_at) FROM stdin;
2	papa	papa123	investisseur	Papa	2026-04-01 09:09:32.119697
3	gestionnaire	gest123	gestionnaire	Gestionnaire	2026-04-01 09:09:32.119697
1	admin	$2b$10$Qu184VuE3/sPeZcPz5Kir.jLmCL4YF.TGO2Txekzncc9OI.QoucN2	admin	Administrateur	2026-04-01 09:09:32.119697
\.


--
-- Data for Name: vaccinations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.vaccinations (id, bande_id, jour_prevu, nom, description, fait, date_fait, commentaire) FROM stdin;
11	4	1	Désinfection et installation	Préparation du poulailler	non	\N	\N
12	4	7	Vaccin Newcastle	Première vaccination contre Newcastle	non	\N	\N
13	4	14	Vaccin Gumboro	Vaccination contre la maladie de Gumboro	non	\N	\N
14	4	21	Rappel Newcastle	Rappel de vaccination Newcastle	non	\N	\N
15	4	28	Vaccin Bronchite infectieuse	Vaccination contre la bronchite infectieuse	non	\N	\N
28	15	1	Désinfection et installation	Préparation du poulailler	non	\N	\N
29	15	14	Vaccin Gumboro	Vaccination contre la maladie de Gumboro	non	\N	\N
30	15	21	Rappel Newcastle	Rappel de vaccination Newcastle	non	\N	\N
\.


--
-- Name: actifs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.actifs_id_seq', 2, true);


--
-- Name: activity_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.activity_log_id_seq', 150, true);


--
-- Name: bande_actifs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.bande_actifs_id_seq', 2, true);


--
-- Name: bande_depenses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.bande_depenses_id_seq', 98, true);


--
-- Name: bande_ventes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.bande_ventes_id_seq', 7, true);


--
-- Name: bandes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.bandes_id_seq', 15, true);


--
-- Name: chantier_depenses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.chantier_depenses_id_seq', 84, true);


--
-- Name: chantier_devis_lignes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.chantier_devis_lignes_id_seq', 3, true);


--
-- Name: chantier_lots_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.chantier_lots_id_seq', 3, true);


--
-- Name: chantiers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.chantiers_id_seq', 3, true);


--
-- Name: charges_fixes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.charges_fixes_id_seq', 11, true);


--
-- Name: consommation_aliment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.consommation_aliment_id_seq', 309, true);


--
-- Name: consommation_eau_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.consommation_eau_id_seq', 424, true);


--
-- Name: depenses_vente_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.depenses_vente_id_seq', 2, true);


--
-- Name: financement_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.financement_id_seq', 6, true);


--
-- Name: mortalite_journaliere_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.mortalite_journaliere_id_seq', 329, true);


--
-- Name: observations_journal_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.observations_journal_id_seq', 106, true);


--
-- Name: parametres_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.parametres_id_seq', 24, true);


--
-- Name: pesees_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.pesees_id_seq', 284, true);


--
-- Name: remboursements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.remboursements_id_seq', 1, false);


--
-- Name: stock_aliments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.stock_aliments_id_seq', 1, false);


--
-- Name: stock_medicaments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.stock_medicaments_id_seq', 1, false);


--
-- Name: traitements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.traitements_id_seq', 156, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 5, true);


--
-- Name: vaccinations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.vaccinations_id_seq', 30, true);


--
-- Name: actifs actifs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.actifs
    ADD CONSTRAINT actifs_pkey PRIMARY KEY (id);


--
-- Name: activity_log activity_log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_log
    ADD CONSTRAINT activity_log_pkey PRIMARY KEY (id);


--
-- Name: bande_actifs bande_actifs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bande_actifs
    ADD CONSTRAINT bande_actifs_pkey PRIMARY KEY (id);


--
-- Name: bande_depenses bande_depenses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bande_depenses
    ADD CONSTRAINT bande_depenses_pkey PRIMARY KEY (id);


--
-- Name: bande_ventes bande_ventes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bande_ventes
    ADD CONSTRAINT bande_ventes_pkey PRIMARY KEY (id);


--
-- Name: bandes bandes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bandes
    ADD CONSTRAINT bandes_pkey PRIMARY KEY (id);


--
-- Name: chantier_depenses chantier_depenses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chantier_depenses
    ADD CONSTRAINT chantier_depenses_pkey PRIMARY KEY (id);


--
-- Name: chantier_devis_lignes chantier_devis_lignes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chantier_devis_lignes
    ADD CONSTRAINT chantier_devis_lignes_pkey PRIMARY KEY (id);


--
-- Name: chantier_lots chantier_lots_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chantier_lots
    ADD CONSTRAINT chantier_lots_pkey PRIMARY KEY (id);


--
-- Name: chantiers chantiers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chantiers
    ADD CONSTRAINT chantiers_pkey PRIMARY KEY (id);


--
-- Name: charges_fixes charges_fixes_bande_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.charges_fixes
    ADD CONSTRAINT charges_fixes_bande_id_unique UNIQUE (bande_id);


--
-- Name: charges_fixes charges_fixes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.charges_fixes
    ADD CONSTRAINT charges_fixes_pkey PRIMARY KEY (id);


--
-- Name: consommation_aliment consommation_aliment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.consommation_aliment
    ADD CONSTRAINT consommation_aliment_pkey PRIMARY KEY (id);


--
-- Name: consommation_eau consommation_eau_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.consommation_eau
    ADD CONSTRAINT consommation_eau_pkey PRIMARY KEY (id);


--
-- Name: depenses_vente depenses_vente_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.depenses_vente
    ADD CONSTRAINT depenses_vente_pkey PRIMARY KEY (id);


--
-- Name: financement financement_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.financement
    ADD CONSTRAINT financement_pkey PRIMARY KEY (id);


--
-- Name: mortalite_journaliere mortalite_journaliere_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mortalite_journaliere
    ADD CONSTRAINT mortalite_journaliere_pkey PRIMARY KEY (id);


--
-- Name: observations_journal observations_journal_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.observations_journal
    ADD CONSTRAINT observations_journal_pkey PRIMARY KEY (id);


--
-- Name: parametres parametres_cle_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.parametres
    ADD CONSTRAINT parametres_cle_unique UNIQUE (cle);


--
-- Name: parametres parametres_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.parametres
    ADD CONSTRAINT parametres_pkey PRIMARY KEY (id);


--
-- Name: pesees pesees_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pesees
    ADD CONSTRAINT pesees_pkey PRIMARY KEY (id);


--
-- Name: remboursements remboursements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.remboursements
    ADD CONSTRAINT remboursements_pkey PRIMARY KEY (id);


--
-- Name: session session_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (sid);


--
-- Name: stock_aliments stock_aliments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_aliments
    ADD CONSTRAINT stock_aliments_pkey PRIMARY KEY (id);


--
-- Name: stock_medicaments stock_medicaments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_medicaments
    ADD CONSTRAINT stock_medicaments_pkey PRIMARY KEY (id);


--
-- Name: traitements traitements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.traitements
    ADD CONSTRAINT traitements_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_unique UNIQUE (username);


--
-- Name: vaccinations vaccinations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vaccinations
    ADD CONSTRAINT vaccinations_pkey PRIMARY KEY (id);


--
-- Name: IDX_session_expire; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_session_expire" ON public.session USING btree (expire);


--
-- Name: activity_log_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX activity_log_user_id_idx ON public.activity_log USING btree (user_id);


--
-- Name: bande_depenses_bande_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX bande_depenses_bande_id_idx ON public.bande_depenses USING btree (bande_id);


--
-- Name: bande_ventes_bande_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX bande_ventes_bande_id_idx ON public.bande_ventes USING btree (bande_id);


--
-- Name: chantier_depenses_chantier_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX chantier_depenses_chantier_id_idx ON public.chantier_depenses USING btree (chantier_id);


--
-- Name: chantier_depenses_lot_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX chantier_depenses_lot_id_idx ON public.chantier_depenses USING btree (lot_id);


--
-- Name: chantier_devis_lignes_chantier_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX chantier_devis_lignes_chantier_id_idx ON public.chantier_devis_lignes USING btree (chantier_id);


--
-- Name: consommation_aliment_bande_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX consommation_aliment_bande_id_idx ON public.consommation_aliment USING btree (bande_id);


--
-- Name: consommation_eau_bande_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX consommation_eau_bande_id_idx ON public.consommation_eau USING btree (bande_id);


--
-- Name: depenses_vente_bande_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX depenses_vente_bande_id_idx ON public.depenses_vente USING btree (bande_id);


--
-- Name: mortalite_journaliere_bande_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX mortalite_journaliere_bande_id_idx ON public.mortalite_journaliere USING btree (bande_id);


--
-- Name: observations_journal_bande_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX observations_journal_bande_id_idx ON public.observations_journal USING btree (bande_id);


--
-- Name: pesees_bande_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pesees_bande_id_idx ON public.pesees USING btree (bande_id);


--
-- Name: traitements_bande_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX traitements_bande_id_idx ON public.traitements USING btree (bande_id);


--
-- Name: vaccinations_bande_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX vaccinations_bande_id_idx ON public.vaccinations USING btree (bande_id);


--
-- Name: actifs actifs_chantier_id_chantiers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.actifs
    ADD CONSTRAINT actifs_chantier_id_chantiers_id_fk FOREIGN KEY (chantier_id) REFERENCES public.chantiers(id) ON DELETE SET NULL;


--
-- Name: activity_log activity_log_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_log
    ADD CONSTRAINT activity_log_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: bande_actifs bande_actifs_actif_id_actifs_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bande_actifs
    ADD CONSTRAINT bande_actifs_actif_id_actifs_id_fk FOREIGN KEY (actif_id) REFERENCES public.actifs(id) ON DELETE CASCADE;


--
-- Name: bande_actifs bande_actifs_bande_id_bandes_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bande_actifs
    ADD CONSTRAINT bande_actifs_bande_id_bandes_id_fk FOREIGN KEY (bande_id) REFERENCES public.bandes(id) ON DELETE CASCADE;


--
-- Name: bande_depenses bande_depenses_bande_id_bandes_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bande_depenses
    ADD CONSTRAINT bande_depenses_bande_id_bandes_id_fk FOREIGN KEY (bande_id) REFERENCES public.bandes(id) ON DELETE CASCADE;


--
-- Name: bande_ventes bande_ventes_bande_id_bandes_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bande_ventes
    ADD CONSTRAINT bande_ventes_bande_id_bandes_id_fk FOREIGN KEY (bande_id) REFERENCES public.bandes(id) ON DELETE CASCADE;


--
-- Name: chantier_depenses chantier_depenses_chantier_id_chantiers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chantier_depenses
    ADD CONSTRAINT chantier_depenses_chantier_id_chantiers_id_fk FOREIGN KEY (chantier_id) REFERENCES public.chantiers(id) ON DELETE CASCADE;


--
-- Name: chantier_depenses chantier_depenses_lot_id_chantier_lots_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chantier_depenses
    ADD CONSTRAINT chantier_depenses_lot_id_chantier_lots_id_fk FOREIGN KEY (lot_id) REFERENCES public.chantier_lots(id) ON DELETE SET NULL;


--
-- Name: chantier_devis_lignes chantier_devis_lignes_chantier_id_chantiers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chantier_devis_lignes
    ADD CONSTRAINT chantier_devis_lignes_chantier_id_chantiers_id_fk FOREIGN KEY (chantier_id) REFERENCES public.chantiers(id) ON DELETE CASCADE;


--
-- Name: chantier_devis_lignes chantier_devis_lignes_lot_id_chantier_lots_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chantier_devis_lignes
    ADD CONSTRAINT chantier_devis_lignes_lot_id_chantier_lots_id_fk FOREIGN KEY (lot_id) REFERENCES public.chantier_lots(id) ON DELETE SET NULL;


--
-- Name: chantier_lots chantier_lots_chantier_id_chantiers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chantier_lots
    ADD CONSTRAINT chantier_lots_chantier_id_chantiers_id_fk FOREIGN KEY (chantier_id) REFERENCES public.chantiers(id) ON DELETE CASCADE;


--
-- Name: charges_fixes charges_fixes_bande_id_bandes_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.charges_fixes
    ADD CONSTRAINT charges_fixes_bande_id_bandes_id_fk FOREIGN KEY (bande_id) REFERENCES public.bandes(id) ON DELETE CASCADE;


--
-- Name: consommation_aliment consommation_aliment_bande_id_bandes_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.consommation_aliment
    ADD CONSTRAINT consommation_aliment_bande_id_bandes_id_fk FOREIGN KEY (bande_id) REFERENCES public.bandes(id) ON DELETE CASCADE;


--
-- Name: consommation_eau consommation_eau_bande_id_bandes_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.consommation_eau
    ADD CONSTRAINT consommation_eau_bande_id_bandes_id_fk FOREIGN KEY (bande_id) REFERENCES public.bandes(id) ON DELETE CASCADE;


--
-- Name: depenses_vente depenses_vente_bande_id_bandes_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.depenses_vente
    ADD CONSTRAINT depenses_vente_bande_id_bandes_id_fk FOREIGN KEY (bande_id) REFERENCES public.bandes(id) ON DELETE CASCADE;


--
-- Name: mortalite_journaliere mortalite_journaliere_bande_id_bandes_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mortalite_journaliere
    ADD CONSTRAINT mortalite_journaliere_bande_id_bandes_id_fk FOREIGN KEY (bande_id) REFERENCES public.bandes(id) ON DELETE CASCADE;


--
-- Name: observations_journal observations_journal_bande_id_bandes_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.observations_journal
    ADD CONSTRAINT observations_journal_bande_id_bandes_id_fk FOREIGN KEY (bande_id) REFERENCES public.bandes(id) ON DELETE CASCADE;


--
-- Name: pesees pesees_bande_id_bandes_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pesees
    ADD CONSTRAINT pesees_bande_id_bandes_id_fk FOREIGN KEY (bande_id) REFERENCES public.bandes(id) ON DELETE CASCADE;


--
-- Name: traitements traitements_bande_id_bandes_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.traitements
    ADD CONSTRAINT traitements_bande_id_bandes_id_fk FOREIGN KEY (bande_id) REFERENCES public.bandes(id) ON DELETE CASCADE;


--
-- Name: vaccinations vaccinations_bande_id_bandes_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vaccinations
    ADD CONSTRAINT vaccinations_bande_id_bandes_id_fk FOREIGN KEY (bande_id) REFERENCES public.bandes(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict 8RwfSCtcJcM51uJfZEtdCTjH9JGdNDai69u3at3QQCtNKJpr5pr9qcy2O3f4BwI

