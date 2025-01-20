--
-- PostgreSQL database dump
--

-- Dumped from database version 16.6 (Debian 16.6-1.pgdg120+1)
-- Dumped by pg_dump version 16.6

-- Started on 2025-01-20 18:13:44

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
-- TOC entry 5 (class 2615 OID 2200)
-- Name: public; Type: SCHEMA; Schema: -; Owner: bhxh_system_user
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO bhxh_system_user;

--
-- TOC entry 244 (class 1255 OID 16398)
-- Name: mark_batch_as_paid(integer, integer); Type: FUNCTION; Schema: public; Owner: bhxh_system_user
--

CREATE FUNCTION public.mark_batch_as_paid(p_batch_id integer, p_user_id integer) RETURNS boolean
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Kiểm tra trạng thái hiện tại
    IF NOT EXISTS (
        SELECT 1 FROM declaration_batch 
        WHERE id = p_batch_id 
        AND status = 'approved'
    ) THEN
        RETURN FALSE;
    END IF;

    -- Cập nhật trạng thái
    UPDATE declaration_batch 
    SET status = 'paid',
        updated_at = CURRENT_TIMESTAMP,
        updated_by = p_user_id
    WHERE id = p_batch_id;

    RETURN TRUE;
END;
$$;


ALTER FUNCTION public.mark_batch_as_paid(p_batch_id integer, p_user_id integer) OWNER TO bhxh_system_user;

--
-- TOC entry 248 (class 1255 OID 16815)
-- Name: update_adjustments_updated_at(); Type: FUNCTION; Schema: public; Owner: bhxh_system_user
--

CREATE FUNCTION public.update_adjustments_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_adjustments_updated_at() OWNER TO bhxh_system_user;

--
-- TOC entry 245 (class 1255 OID 16399)
-- Name: update_batch_payment_amount(); Type: FUNCTION; Schema: public; Owner: bhxh_system_user
--

CREATE FUNCTION public.update_batch_payment_amount() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Cập nhật payment_amount bằng tổng actual_amount trừ đi tổng số tiền hỗ trợ
    UPDATE declaration_batch
    SET payment_amount = (
        SELECT COALESCE(SUM(d.actual_amount), 0) - (COALESCE(declaration_batch.support_amount, 0) * COUNT(d.id))
        FROM declarations d
        WHERE d.batch_id = declaration_batch.id
        AND d.deleted_at IS NULL
    )
    WHERE id = NEW.batch_id;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_batch_payment_amount() OWNER TO bhxh_system_user;

--
-- TOC entry 246 (class 1255 OID 16400)
-- Name: update_payment_amount_on_support_change(); Type: FUNCTION; Schema: public; Owner: bhxh_system_user
--

CREATE FUNCTION public.update_payment_amount_on_support_change() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Cập nhật payment_amount khi support_amount thay đổi
    UPDATE declaration_batch
    SET payment_amount = (
        SELECT COALESCE(SUM(d.actual_amount), 0) - (NEW.support_amount * COUNT(d.id))
        FROM declarations d
        WHERE d.batch_id = NEW.id
        AND d.deleted_at IS NULL
    )
    WHERE id = NEW.id;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_payment_amount_on_support_change() OWNER TO bhxh_system_user;

--
-- TOC entry 247 (class 1255 OID 16401)
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: bhxh_system_user
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO bhxh_system_user;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 232 (class 1259 OID 16862)
-- Name: adjustment_requests; Type: TABLE; Schema: public; Owner: bhxh_system_user
--

CREATE TABLE public.adjustment_requests (
    id integer NOT NULL,
    note text NOT NULL,
    image_url text NOT NULL,
    public_id text,
    status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    created_by integer NOT NULL,
    admin_note text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    is_urgent boolean DEFAULT false,
    adjustment_code character varying(50)
);


ALTER TABLE public.adjustment_requests OWNER TO bhxh_system_user;

--
-- TOC entry 231 (class 1259 OID 16861)
-- Name: adjustment_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: bhxh_system_user
--

CREATE SEQUENCE public.adjustment_requests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.adjustment_requests_id_seq OWNER TO bhxh_system_user;

--
-- TOC entry 3533 (class 0 OID 0)
-- Dependencies: 231
-- Name: adjustment_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: bhxh_system_user
--

ALTER SEQUENCE public.adjustment_requests_id_seq OWNED BY public.adjustment_requests.id;


--
-- TOC entry 230 (class 1259 OID 16791)
-- Name: adjustments; Type: TABLE; Schema: public; Owner: bhxh_system_user
--

CREATE TABLE public.adjustments (
    id integer NOT NULL,
    user_id integer NOT NULL,
    adjustment_type character varying(50) NOT NULL,
    current_info text NOT NULL,
    requested_change text NOT NULL,
    reason text NOT NULL,
    images text[] DEFAULT '{}'::text[],
    status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    admin_note text,
    processed_by integer,
    processed_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.adjustments OWNER TO bhxh_system_user;

--
-- TOC entry 229 (class 1259 OID 16790)
-- Name: adjustments_id_seq; Type: SEQUENCE; Schema: public; Owner: bhxh_system_user
--

CREATE SEQUENCE public.adjustments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.adjustments_id_seq OWNER TO bhxh_system_user;

--
-- TOC entry 3534 (class 0 OID 0)
-- Dependencies: 229
-- Name: adjustments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: bhxh_system_user
--

ALTER SEQUENCE public.adjustments_id_seq OWNED BY public.adjustments.id;


--
-- TOC entry 215 (class 1259 OID 16402)
-- Name: declaration_batch; Type: TABLE; Schema: public; Owner: bhxh_system_user
--

CREATE TABLE public.declaration_batch (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    month integer NOT NULL,
    year integer NOT NULL,
    batch_number integer NOT NULL,
    department_code character varying(50) NOT NULL,
    object_type character varying(10) NOT NULL,
    service_type character varying(10) NOT NULL,
    status character varying(20) DEFAULT 'pending'::character varying,
    total_declarations integer DEFAULT 0,
    notes text,
    created_by integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_by integer,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    submitted_at timestamp without time zone,
    submitted_by integer,
    approved_by integer,
    approved_at timestamp without time zone,
    rejected_by integer,
    rejected_at timestamp without time zone,
    admin_notes text,
    total_amount numeric(12,2) DEFAULT 0,
    payment_date date,
    payment_amount numeric(12,2),
    payment_bill_url text,
    payment_status character varying(50) DEFAULT 'unpaid'::character varying,
    payment_verified_by integer,
    payment_verified_at timestamp without time zone,
    payment_notes text,
    deleted_at timestamp without time zone,
    deleted_by integer,
    support_amount numeric(15,2) DEFAULT 0,
    total_support_amount numeric(15,2) DEFAULT 0,
    file_code character varying(100),
    bill_image character varying(255),
    completed_at timestamp without time zone,
    CONSTRAINT check_payment_status CHECK (((payment_status)::text = ANY (ARRAY['unpaid'::text, 'paid'::text]))),
    CONSTRAINT check_status CHECK (((status)::text = ANY (ARRAY['pending'::text, 'submitted'::text, 'approved'::text, 'processing'::text, 'completed'::text, 'rejected'::text]))),
    CONSTRAINT declaration_batch_month_check CHECK (((month >= 1) AND (month <= 12))),
    CONSTRAINT declaration_batch_object_type_check CHECK (((object_type)::text = ANY (ARRAY[('HGD'::character varying)::text, ('DTTS'::character varying)::text, ('NLNN'::character varying)::text]))),
    CONSTRAINT declaration_batch_service_type_check CHECK (((service_type)::text = ANY (ARRAY[('BHYT'::character varying)::text, ('BHXH'::character varying)::text])))
);


ALTER TABLE public.declaration_batch OWNER TO bhxh_system_user;

--
-- TOC entry 216 (class 1259 OID 16420)
-- Name: declaration_batch_id_seq; Type: SEQUENCE; Schema: public; Owner: bhxh_system_user
--

CREATE SEQUENCE public.declaration_batch_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.declaration_batch_id_seq OWNER TO bhxh_system_user;

--
-- TOC entry 3535 (class 0 OID 0)
-- Dependencies: 216
-- Name: declaration_batch_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: bhxh_system_user
--

ALTER SEQUENCE public.declaration_batch_id_seq OWNED BY public.declaration_batch.id;


--
-- TOC entry 224 (class 1259 OID 16705)
-- Name: declarations; Type: TABLE; Schema: public; Owner: bhxh_system_user
--

CREATE TABLE public.declarations (
    id integer NOT NULL,
    batch_id integer,
    unit_id integer,
    object_type character varying(50) DEFAULT 'import'::character varying,
    bhxh_code character varying(20),
    ho_ten character varying(100),
    ngay_sinh character varying(10),
    gioi_tinh character varying(10),
    so_cmnd character varying(20),
    so_dien_thoai character varying(20),
    email character varying(100),
    address text,
    "position" character varying(100),
    new_card_effective_date date,
    old_card_number character varying(50),
    old_card_issue_date date,
    old_card_expiry_date date,
    old_primary_care_facility character varying(200),
    old_primary_care_facility_code character varying(50),
    reason text,
    status character varying(20) DEFAULT 'pending'::character varying,
    rejection_reason text,
    amount numeric(10,2) DEFAULT 0.00,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_by integer,
    updated_by integer,
    approved_by integer,
    approved_at timestamp without time zone,
    rejected_by integer,
    rejected_at timestamp without time zone,
    deleted_at timestamp without time zone,
    sokcb character varying(50),
    user_id integer,
    ngay_bien_lai date,
    receipt_number character varying(20),
    participant_number character varying(10),
    months character varying(10),
    plan character varying(20),
    ten_tinh_nkq character varying(100),
    ten_huyen_nkq character varying(100),
    ten_xa_nkq character varying(100),
    hamlet character varying(100),
    hospital_code character varying(100),
    actual_amount numeric(15,2) DEFAULT 0,
    support_amount numeric(15,2) DEFAULT 0,
    total_amount numeric(15,2) DEFAULT 0,
    payment_status character varying(20) DEFAULT 'pending'::character varying,
    household_id integer,
    relationship_with_head character varying(50),
    new_card_expiry_date character varying(10),
    is_urgent boolean DEFAULT false,
    tenbenhvien character varying(200),
    "maDoiTuong" character varying(10),
    "tenXaKs" character varying(200),
    "tenHuyenKs" character varying(200),
    "tenTinhKs" character varying(200),
    "maCqbh" character varying(20),
    "ghiChu" text,
    "loaiDuLieu" character varying(20) DEFAULT 'NHAP_TAY'::character varying,
    "danToc" character varying(50),
    deleted_by integer,
    "quocTich" character varying(50),
    "maHoGiaDinh" character varying(50),
    "soTheBHYT" character varying(50),
    "phuongAn" character varying(50),
    "moTa" text,
    "maTinhKS" character varying(50),
    "maHuyenKS" character varying(50),
    "maXaKS" character varying(50),
    "maTinhNkq" character varying(50),
    "maHuyenNkq" character varying(50),
    "maXaNkq" character varying(50),
    "tinhKCB" character varying(50),
    "maBenhVien" character varying(50),
    "tuNgayTheCu" character varying(50),
    "denNgayTheCu" character varying(50),
    ccns character varying(50),
    "isThamGiaBb" integer DEFAULT 0,
    "noiNhanHoSo" character varying(255),
    "tenBenhVien" character varying(255),
    ten_benh_vien character varying(255)
);


ALTER TABLE public.declarations OWNER TO bhxh_system_user;

--
-- TOC entry 3536 (class 0 OID 0)
-- Dependencies: 224
-- Name: TABLE declarations; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON TABLE public.declarations IS 'Bảng lưu thông tin kê khai BHXH';


--
-- TOC entry 3537 (class 0 OID 0)
-- Dependencies: 224
-- Name: COLUMN declarations.so_cmnd; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.declarations.so_cmnd IS 'Số CCCD/CMND của người kê khai (có thể để trống)';


--
-- TOC entry 3538 (class 0 OID 0)
-- Dependencies: 224
-- Name: COLUMN declarations.actual_amount; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.declarations.actual_amount IS 'Số tiền thực tế phải đóng';


--
-- TOC entry 3539 (class 0 OID 0)
-- Dependencies: 224
-- Name: COLUMN declarations.support_amount; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.declarations.support_amount IS 'Số tiền hỗ trợ';


--
-- TOC entry 3540 (class 0 OID 0)
-- Dependencies: 224
-- Name: COLUMN declarations.total_amount; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.declarations.total_amount IS 'Tổng số tiền (actual_amount - support_amount)';


--
-- TOC entry 3541 (class 0 OID 0)
-- Dependencies: 224
-- Name: COLUMN declarations.payment_status; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.declarations.payment_status IS 'Trạng thái thanh toán';


--
-- TOC entry 3542 (class 0 OID 0)
-- Dependencies: 224
-- Name: COLUMN declarations.deleted_by; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.declarations.deleted_by IS 'ID của người thực hiện xóa mềm';


--
-- TOC entry 223 (class 1259 OID 16704)
-- Name: declarations_id_seq; Type: SEQUENCE; Schema: public; Owner: bhxh_system_user
--

CREATE SEQUENCE public.declarations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.declarations_id_seq OWNER TO bhxh_system_user;

--
-- TOC entry 3543 (class 0 OID 0)
-- Dependencies: 223
-- Name: declarations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: bhxh_system_user
--

ALTER SEQUENCE public.declarations_id_seq OWNED BY public.declarations.id;


--
-- TOC entry 226 (class 1259 OID 16743)
-- Name: households; Type: TABLE; Schema: public; Owner: bhxh_system_user
--

CREATE TABLE public.households (
    id integer NOT NULL,
    household_code character varying(50) NOT NULL,
    household_head character varying(100) NOT NULL,
    address text NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    deleted_at timestamp with time zone
);


ALTER TABLE public.households OWNER TO bhxh_system_user;

--
-- TOC entry 225 (class 1259 OID 16742)
-- Name: households_id_seq; Type: SEQUENCE; Schema: public; Owner: bhxh_system_user
--

CREATE SEQUENCE public.households_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.households_id_seq OWNER TO bhxh_system_user;

--
-- TOC entry 3544 (class 0 OID 0)
-- Dependencies: 225
-- Name: households_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: bhxh_system_user
--

ALTER SEQUENCE public.households_id_seq OWNED BY public.households.id;


--
-- TOC entry 228 (class 1259 OID 16772)
-- Name: notifications; Type: TABLE; Schema: public; Owner: bhxh_system_user
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    user_id integer NOT NULL,
    title character varying(255) NOT NULL,
    message text NOT NULL,
    type character varying(50) DEFAULT 'info'::character varying,
    is_read boolean DEFAULT false,
    link character varying(255),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT notifications_type_check CHECK (((type)::text = ANY ((ARRAY['info'::character varying, 'success'::character varying, 'warning'::character varying, 'error'::character varying])::text[])))
);


ALTER TABLE public.notifications OWNER TO bhxh_system_user;

--
-- TOC entry 227 (class 1259 OID 16771)
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: bhxh_system_user
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notifications_id_seq OWNER TO bhxh_system_user;

--
-- TOC entry 3545 (class 0 OID 0)
-- Dependencies: 227
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: bhxh_system_user
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- TOC entry 217 (class 1259 OID 16453)
-- Name: payment_bills; Type: TABLE; Schema: public; Owner: bhxh_system_user
--

CREATE TABLE public.payment_bills (
    id integer NOT NULL,
    batch_id integer,
    file_url character varying(500),
    cloudinary_public_id character varying(255),
    uploaded_by integer,
    uploaded_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.payment_bills OWNER TO bhxh_system_user;

--
-- TOC entry 218 (class 1259 OID 16459)
-- Name: payment_bills_id_seq; Type: SEQUENCE; Schema: public; Owner: bhxh_system_user
--

CREATE SEQUENCE public.payment_bills_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.payment_bills_id_seq OWNER TO bhxh_system_user;

--
-- TOC entry 3546 (class 0 OID 0)
-- Dependencies: 218
-- Name: payment_bills_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: bhxh_system_user
--

ALTER SEQUENCE public.payment_bills_id_seq OWNED BY public.payment_bills.id;


--
-- TOC entry 219 (class 1259 OID 16460)
-- Name: units; Type: TABLE; Schema: public; Owner: bhxh_system_user
--

CREATE TABLE public.units (
    id integer NOT NULL,
    code character varying(50) NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    status character varying(20) DEFAULT 'active'::character varying,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.units OWNER TO bhxh_system_user;

--
-- TOC entry 220 (class 1259 OID 16468)
-- Name: units_id_seq; Type: SEQUENCE; Schema: public; Owner: bhxh_system_user
--

CREATE SEQUENCE public.units_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.units_id_seq OWNER TO bhxh_system_user;

--
-- TOC entry 3547 (class 0 OID 0)
-- Dependencies: 220
-- Name: units_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: bhxh_system_user
--

ALTER SEQUENCE public.units_id_seq OWNED BY public.units.id;


--
-- TOC entry 221 (class 1259 OID 16469)
-- Name: users; Type: TABLE; Schema: public; Owner: bhxh_system_user
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    password character varying(100) NOT NULL,
    ho_ten character varying(100),
    email character varying(100),
    so_dien_thoai character varying(15),
    role character varying(20),
    department_code character varying(50),
    unit character varying(100),
    unit_id integer,
    status character varying(20) DEFAULT 'active'::character varying,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    province character varying(50),
    district character varying(50),
    commune character varying(50),
    hamlet character varying(50),
    address text,
    last_login_at timestamp with time zone,
    first_login boolean DEFAULT true,
    password_changed boolean DEFAULT false,
    deleted_at timestamp without time zone,
    last_login_ip character varying(45),
    last_login_location text,
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['admin'::character varying, 'employee'::character varying, 'bhxh'::character varying])::text[])))
);


ALTER TABLE public.users OWNER TO bhxh_system_user;

--
-- TOC entry 222 (class 1259 OID 16478)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: bhxh_system_user
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO bhxh_system_user;

--
-- TOC entry 3548 (class 0 OID 0)
-- Dependencies: 222
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: bhxh_system_user
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 3299 (class 2604 OID 16865)
-- Name: adjustment_requests id; Type: DEFAULT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.adjustment_requests ALTER COLUMN id SET DEFAULT nextval('public.adjustment_requests_id_seq'::regclass);


--
-- TOC entry 3294 (class 2604 OID 16794)
-- Name: adjustments id; Type: DEFAULT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.adjustments ALTER COLUMN id SET DEFAULT nextval('public.adjustments_id_seq'::regclass);


--
-- TOC entry 3252 (class 2604 OID 16479)
-- Name: declaration_batch id; Type: DEFAULT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.declaration_batch ALTER COLUMN id SET DEFAULT nextval('public.declaration_batch_id_seq'::regclass);


--
-- TOC entry 3273 (class 2604 OID 16708)
-- Name: declarations id; Type: DEFAULT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.declarations ALTER COLUMN id SET DEFAULT nextval('public.declarations_id_seq'::regclass);


--
-- TOC entry 3286 (class 2604 OID 16746)
-- Name: households id; Type: DEFAULT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.households ALTER COLUMN id SET DEFAULT nextval('public.households_id_seq'::regclass);


--
-- TOC entry 3289 (class 2604 OID 16775)
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- TOC entry 3261 (class 2604 OID 16483)
-- Name: payment_bills id; Type: DEFAULT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.payment_bills ALTER COLUMN id SET DEFAULT nextval('public.payment_bills_id_seq'::regclass);


--
-- TOC entry 3263 (class 2604 OID 16484)
-- Name: units id; Type: DEFAULT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.units ALTER COLUMN id SET DEFAULT nextval('public.units_id_seq'::regclass);


--
-- TOC entry 3267 (class 2604 OID 16485)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 3357 (class 2606 OID 16872)
-- Name: adjustment_requests adjustment_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.adjustment_requests
    ADD CONSTRAINT adjustment_requests_pkey PRIMARY KEY (id);


--
-- TOC entry 3353 (class 2606 OID 16802)
-- Name: adjustments adjustments_pkey; Type: CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.adjustments
    ADD CONSTRAINT adjustments_pkey PRIMARY KEY (id);


--
-- TOC entry 3312 (class 2606 OID 16487)
-- Name: declaration_batch declaration_batch_month_year_batch_number_department_code_o_key; Type: CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.declaration_batch
    ADD CONSTRAINT declaration_batch_month_year_batch_number_department_code_o_key UNIQUE (month, year, batch_number, department_code, object_type, service_type);


--
-- TOC entry 3314 (class 2606 OID 16489)
-- Name: declaration_batch declaration_batch_pkey; Type: CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.declaration_batch
    ADD CONSTRAINT declaration_batch_pkey PRIMARY KEY (id);


--
-- TOC entry 3316 (class 2606 OID 16491)
-- Name: declaration_batch declaration_batch_unique_key; Type: CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.declaration_batch
    ADD CONSTRAINT declaration_batch_unique_key UNIQUE (month, year, batch_number, department_code, object_type, service_type);


--
-- TOC entry 3339 (class 2606 OID 16717)
-- Name: declarations declarations_pkey; Type: CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.declarations
    ADD CONSTRAINT declarations_pkey PRIMARY KEY (id);


--
-- TOC entry 3347 (class 2606 OID 16754)
-- Name: households households_household_code_key; Type: CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.households
    ADD CONSTRAINT households_household_code_key UNIQUE (household_code);


--
-- TOC entry 3349 (class 2606 OID 16752)
-- Name: households households_pkey; Type: CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.households
    ADD CONSTRAINT households_pkey PRIMARY KEY (id);


--
-- TOC entry 3351 (class 2606 OID 16784)
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- TOC entry 3324 (class 2606 OID 16499)
-- Name: payment_bills payment_bills_pkey; Type: CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.payment_bills
    ADD CONSTRAINT payment_bills_pkey PRIMARY KEY (id);


--
-- TOC entry 3328 (class 2606 OID 16501)
-- Name: units units_code_key; Type: CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.units
    ADD CONSTRAINT units_code_key UNIQUE (code);


--
-- TOC entry 3330 (class 2606 OID 16503)
-- Name: units units_pkey; Type: CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.units
    ADD CONSTRAINT units_pkey PRIMARY KEY (id);


--
-- TOC entry 3335 (class 2606 OID 16505)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 3337 (class 2606 OID 16507)
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- TOC entry 3358 (class 1259 OID 16884)
-- Name: idx_adjustment_code; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE UNIQUE INDEX idx_adjustment_code ON public.adjustment_requests USING btree (adjustment_code);


--
-- TOC entry 3359 (class 1259 OID 16878)
-- Name: idx_adjustment_requests_created_by; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_adjustment_requests_created_by ON public.adjustment_requests USING btree (created_by);


--
-- TOC entry 3360 (class 1259 OID 16883)
-- Name: idx_adjustment_requests_is_urgent; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_adjustment_requests_is_urgent ON public.adjustment_requests USING btree (is_urgent);


--
-- TOC entry 3361 (class 1259 OID 16879)
-- Name: idx_adjustment_requests_status; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_adjustment_requests_status ON public.adjustment_requests USING btree (status);


--
-- TOC entry 3354 (class 1259 OID 16814)
-- Name: idx_adjustments_status; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_adjustments_status ON public.adjustments USING btree (status);


--
-- TOC entry 3355 (class 1259 OID 16813)
-- Name: idx_adjustments_user_id; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_adjustments_user_id ON public.adjustments USING btree (user_id);


--
-- TOC entry 3317 (class 1259 OID 16603)
-- Name: idx_declaration_batch_created_by; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_declaration_batch_created_by ON public.declaration_batch USING btree (created_by);


--
-- TOC entry 3318 (class 1259 OID 16508)
-- Name: idx_declaration_batch_deleted_at; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_declaration_batch_deleted_at ON public.declaration_batch USING btree (deleted_at);


--
-- TOC entry 3319 (class 1259 OID 16607)
-- Name: idx_declaration_batch_department; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_declaration_batch_department ON public.declaration_batch USING btree (department_code);


--
-- TOC entry 3320 (class 1259 OID 16605)
-- Name: idx_declaration_batch_month_year; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_declaration_batch_month_year ON public.declaration_batch USING btree (month, year);


--
-- TOC entry 3321 (class 1259 OID 16606)
-- Name: idx_declaration_batch_object_type; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_declaration_batch_object_type ON public.declaration_batch USING btree (object_type);


--
-- TOC entry 3322 (class 1259 OID 16604)
-- Name: idx_declaration_batch_status; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_declaration_batch_status ON public.declaration_batch USING btree (status);


--
-- TOC entry 3340 (class 1259 OID 16719)
-- Name: idx_declarations_bhxh_code; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_declarations_bhxh_code ON public.declarations USING btree (bhxh_code);


--
-- TOC entry 3341 (class 1259 OID 16721)
-- Name: idx_declarations_created_at; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_declarations_created_at ON public.declarations USING btree (created_at);


--
-- TOC entry 3342 (class 1259 OID 16760)
-- Name: idx_declarations_household_id; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_declarations_household_id ON public.declarations USING btree (household_id);


--
-- TOC entry 3343 (class 1259 OID 16890)
-- Name: idx_declarations_is_urgent; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_declarations_is_urgent ON public.declarations USING btree (is_urgent);


--
-- TOC entry 3344 (class 1259 OID 16720)
-- Name: idx_declarations_status; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_declarations_status ON public.declarations USING btree (status);


--
-- TOC entry 3345 (class 1259 OID 16732)
-- Name: idx_declarations_user_id; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_declarations_user_id ON public.declarations USING btree (user_id);


--
-- TOC entry 3325 (class 1259 OID 16518)
-- Name: idx_units_code; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_units_code ON public.units USING btree (code);


--
-- TOC entry 3326 (class 1259 OID 16519)
-- Name: idx_units_status; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_units_status ON public.units USING btree (status);


--
-- TOC entry 3331 (class 1259 OID 16520)
-- Name: idx_users_status; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_users_status ON public.users USING btree (status);


--
-- TOC entry 3332 (class 1259 OID 16521)
-- Name: idx_users_unit_id; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_users_unit_id ON public.users USING btree (unit_id);


--
-- TOC entry 3333 (class 1259 OID 16522)
-- Name: idx_users_username; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_users_username ON public.users USING btree (username);


--
-- TOC entry 3381 (class 2620 OID 16524)
-- Name: declaration_batch tr_update_payment_amount_on_support_change; Type: TRIGGER; Schema: public; Owner: bhxh_system_user
--

CREATE TRIGGER tr_update_payment_amount_on_support_change AFTER UPDATE OF support_amount ON public.declaration_batch FOR EACH ROW EXECUTE FUNCTION public.update_payment_amount_on_support_change();


--
-- TOC entry 3384 (class 2620 OID 16816)
-- Name: adjustments trigger_update_adjustments_updated_at; Type: TRIGGER; Schema: public; Owner: bhxh_system_user
--

CREATE TRIGGER trigger_update_adjustments_updated_at BEFORE UPDATE ON public.adjustments FOR EACH ROW EXECUTE FUNCTION public.update_adjustments_updated_at();


--
-- TOC entry 3382 (class 2620 OID 16525)
-- Name: units update_units_updated_at; Type: TRIGGER; Schema: public; Owner: bhxh_system_user
--

CREATE TRIGGER update_units_updated_at BEFORE UPDATE ON public.units FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 3383 (class 2620 OID 16526)
-- Name: users update_users_updated_at; Type: TRIGGER; Schema: public; Owner: bhxh_system_user
--

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 3380 (class 2606 OID 16873)
-- Name: adjustment_requests adjustment_requests_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.adjustment_requests
    ADD CONSTRAINT adjustment_requests_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- TOC entry 3378 (class 2606 OID 16808)
-- Name: adjustments adjustments_processed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.adjustments
    ADD CONSTRAINT adjustments_processed_by_fkey FOREIGN KEY (processed_by) REFERENCES public.users(id);


--
-- TOC entry 3379 (class 2606 OID 16803)
-- Name: adjustments adjustments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.adjustments
    ADD CONSTRAINT adjustments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 3362 (class 2606 OID 16527)
-- Name: declaration_batch declaration_batch_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.declaration_batch
    ADD CONSTRAINT declaration_batch_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 3363 (class 2606 OID 16532)
-- Name: declaration_batch declaration_batch_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.declaration_batch
    ADD CONSTRAINT declaration_batch_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 3364 (class 2606 OID 16537)
-- Name: declaration_batch declaration_batch_deleted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.declaration_batch
    ADD CONSTRAINT declaration_batch_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.users(id);


--
-- TOC entry 3365 (class 2606 OID 16542)
-- Name: declaration_batch declaration_batch_payment_verified_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.declaration_batch
    ADD CONSTRAINT declaration_batch_payment_verified_by_fkey FOREIGN KEY (payment_verified_by) REFERENCES public.users(id);


--
-- TOC entry 3366 (class 2606 OID 16547)
-- Name: declaration_batch declaration_batch_rejected_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.declaration_batch
    ADD CONSTRAINT declaration_batch_rejected_by_fkey FOREIGN KEY (rejected_by) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 3367 (class 2606 OID 16552)
-- Name: declaration_batch declaration_batch_submitted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.declaration_batch
    ADD CONSTRAINT declaration_batch_submitted_by_fkey FOREIGN KEY (submitted_by) REFERENCES public.users(id);


--
-- TOC entry 3368 (class 2606 OID 16557)
-- Name: declaration_batch declaration_batch_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.declaration_batch
    ADD CONSTRAINT declaration_batch_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 3372 (class 2606 OID 16913)
-- Name: declarations declarations_deleted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.declarations
    ADD CONSTRAINT declarations_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.users(id);


--
-- TOC entry 3373 (class 2606 OID 16755)
-- Name: declarations declarations_household_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.declarations
    ADD CONSTRAINT declarations_household_id_fkey FOREIGN KEY (household_id) REFERENCES public.households(id);


--
-- TOC entry 3374 (class 2606 OID 16722)
-- Name: declarations fk_declarations_batch; Type: FK CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.declarations
    ADD CONSTRAINT fk_declarations_batch FOREIGN KEY (batch_id) REFERENCES public.declaration_batch(id) ON DELETE SET NULL;


--
-- TOC entry 3375 (class 2606 OID 16727)
-- Name: declarations fk_declarations_unit; Type: FK CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.declarations
    ADD CONSTRAINT fk_declarations_unit FOREIGN KEY (unit_id) REFERENCES public.units(id) ON DELETE SET NULL;


--
-- TOC entry 3376 (class 2606 OID 16733)
-- Name: declarations fk_declarations_user; Type: FK CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.declarations
    ADD CONSTRAINT fk_declarations_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 3377 (class 2606 OID 16785)
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 3369 (class 2606 OID 16587)
-- Name: payment_bills payment_bills_batch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.payment_bills
    ADD CONSTRAINT payment_bills_batch_id_fkey FOREIGN KEY (batch_id) REFERENCES public.declaration_batch(id);


--
-- TOC entry 3370 (class 2606 OID 16592)
-- Name: payment_bills payment_bills_uploaded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.payment_bills
    ADD CONSTRAINT payment_bills_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.users(id);


--
-- TOC entry 3371 (class 2606 OID 16597)
-- Name: users users_unit_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_unit_id_fkey FOREIGN KEY (unit_id) REFERENCES public.units(id);


--
-- TOC entry 2084 (class 826 OID 16391)
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: -; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT ALL ON SEQUENCES TO bhxh_system_user;


--
-- TOC entry 2086 (class 826 OID 16393)
-- Name: DEFAULT PRIVILEGES FOR TYPES; Type: DEFAULT ACL; Schema: -; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT ALL ON TYPES TO bhxh_system_user;


--
-- TOC entry 2085 (class 826 OID 16392)
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: -; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT ALL ON FUNCTIONS TO bhxh_system_user;


--
-- TOC entry 2083 (class 826 OID 16390)
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: -; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT ALL ON TABLES TO bhxh_system_user;


-- Completed on 2025-01-20 18:13:48

--
-- PostgreSQL database dump complete
--

