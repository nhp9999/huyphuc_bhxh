--
-- PostgreSQL database dump
--

-- Dumped from database version 16.6 (Debian 16.6-1.pgdg120+1)
-- Dumped by pg_dump version 16.6

-- Started on 2025-01-23 23:58:41

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
-- TOC entry 256 (class 1255 OID 16398)
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
-- TOC entry 260 (class 1255 OID 16815)
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
-- TOC entry 257 (class 1255 OID 16399)
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
-- TOC entry 258 (class 1255 OID 16400)
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
-- TOC entry 259 (class 1255 OID 16401)
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
-- TOC entry 3620 (class 0 OID 0)
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
-- TOC entry 3621 (class 0 OID 0)
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
-- TOC entry 3622 (class 0 OID 0)
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
-- TOC entry 3623 (class 0 OID 0)
-- Dependencies: 224
-- Name: TABLE declarations; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON TABLE public.declarations IS 'Bảng lưu thông tin kê khai BHXH';


--
-- TOC entry 3624 (class 0 OID 0)
-- Dependencies: 224
-- Name: COLUMN declarations.so_cmnd; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.declarations.so_cmnd IS 'Số CCCD/CMND của người kê khai (có thể để trống)';


--
-- TOC entry 3625 (class 0 OID 0)
-- Dependencies: 224
-- Name: COLUMN declarations.actual_amount; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.declarations.actual_amount IS 'Số tiền thực tế phải đóng';


--
-- TOC entry 3626 (class 0 OID 0)
-- Dependencies: 224
-- Name: COLUMN declarations.support_amount; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.declarations.support_amount IS 'Số tiền hỗ trợ';


--
-- TOC entry 3627 (class 0 OID 0)
-- Dependencies: 224
-- Name: COLUMN declarations.total_amount; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.declarations.total_amount IS 'Tổng số tiền (actual_amount - support_amount)';


--
-- TOC entry 3628 (class 0 OID 0)
-- Dependencies: 224
-- Name: COLUMN declarations.payment_status; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.declarations.payment_status IS 'Trạng thái thanh toán';


--
-- TOC entry 3629 (class 0 OID 0)
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
-- TOC entry 3630 (class 0 OID 0)
-- Dependencies: 223
-- Name: declarations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: bhxh_system_user
--

ALTER SEQUENCE public.declarations_id_seq OWNED BY public.declarations.id;


--
-- TOC entry 244 (class 1259 OID 17035)
-- Name: dot_ke_khai; Type: TABLE; Schema: public; Owner: bhxh_system_user
--

CREATE TABLE public.dot_ke_khai (
    id integer NOT NULL,
    ten_dot character varying(200) NOT NULL,
    so_dot integer NOT NULL,
    thang integer NOT NULL,
    nam integer NOT NULL,
    ngay_bat_dau timestamp without time zone NOT NULL,
    ngay_ket_thuc timestamp without time zone NOT NULL,
    ghi_chu text,
    trang_thai boolean DEFAULT true,
    ngay_tao timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    nguoi_tao character varying(100),
    CONSTRAINT dot_ke_khai_nam_check CHECK ((nam >= 2000)),
    CONSTRAINT dot_ke_khai_thang_check CHECK (((thang >= 1) AND (thang <= 12)))
);


ALTER TABLE public.dot_ke_khai OWNER TO bhxh_system_user;

--
-- TOC entry 3631 (class 0 OID 0)
-- Dependencies: 244
-- Name: TABLE dot_ke_khai; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON TABLE public.dot_ke_khai IS 'Bảng lưu trữ thông tin đợt kê khai';


--
-- TOC entry 3632 (class 0 OID 0)
-- Dependencies: 244
-- Name: COLUMN dot_ke_khai.id; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.dot_ke_khai.id IS 'ID đợt kê khai';


--
-- TOC entry 3633 (class 0 OID 0)
-- Dependencies: 244
-- Name: COLUMN dot_ke_khai.ten_dot; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.dot_ke_khai.ten_dot IS 'Tên đợt kê khai';


--
-- TOC entry 3634 (class 0 OID 0)
-- Dependencies: 244
-- Name: COLUMN dot_ke_khai.so_dot; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.dot_ke_khai.so_dot IS 'Số đợt kê khai';


--
-- TOC entry 3635 (class 0 OID 0)
-- Dependencies: 244
-- Name: COLUMN dot_ke_khai.thang; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.dot_ke_khai.thang IS 'Tháng kê khai (1-12)';


--
-- TOC entry 3636 (class 0 OID 0)
-- Dependencies: 244
-- Name: COLUMN dot_ke_khai.nam; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.dot_ke_khai.nam IS 'Năm kê khai';


--
-- TOC entry 3637 (class 0 OID 0)
-- Dependencies: 244
-- Name: COLUMN dot_ke_khai.ngay_bat_dau; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.dot_ke_khai.ngay_bat_dau IS 'Ngày bắt đầu đợt kê khai';


--
-- TOC entry 3638 (class 0 OID 0)
-- Dependencies: 244
-- Name: COLUMN dot_ke_khai.ngay_ket_thuc; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.dot_ke_khai.ngay_ket_thuc IS 'Ngày kết thúc đợt kê khai';


--
-- TOC entry 3639 (class 0 OID 0)
-- Dependencies: 244
-- Name: COLUMN dot_ke_khai.ghi_chu; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.dot_ke_khai.ghi_chu IS 'Ghi chú cho đợt kê khai';


--
-- TOC entry 3640 (class 0 OID 0)
-- Dependencies: 244
-- Name: COLUMN dot_ke_khai.trang_thai; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.dot_ke_khai.trang_thai IS 'Trạng thái hoạt động của đợt kê khai';


--
-- TOC entry 3641 (class 0 OID 0)
-- Dependencies: 244
-- Name: COLUMN dot_ke_khai.ngay_tao; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.dot_ke_khai.ngay_tao IS 'Ngày tạo đợt kê khai';


--
-- TOC entry 3642 (class 0 OID 0)
-- Dependencies: 244
-- Name: COLUMN dot_ke_khai.nguoi_tao; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.dot_ke_khai.nguoi_tao IS 'Người tạo đợt kê khai';


--
-- TOC entry 243 (class 1259 OID 17034)
-- Name: dot_ke_khai_id_seq; Type: SEQUENCE; Schema: public; Owner: bhxh_system_user
--

CREATE SEQUENCE public.dot_ke_khai_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.dot_ke_khai_id_seq OWNER TO bhxh_system_user;

--
-- TOC entry 3643 (class 0 OID 0)
-- Dependencies: 243
-- Name: dot_ke_khai_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: bhxh_system_user
--

ALTER SEQUENCE public.dot_ke_khai_id_seq OWNED BY public.dot_ke_khai.id;


--
-- TOC entry 238 (class 1259 OID 16984)
-- Name: ds_huyen; Type: TABLE; Schema: public; Owner: bhxh_system_user
--

CREATE TABLE public.ds_huyen (
    id integer NOT NULL,
    ma character varying(3) NOT NULL,
    ten character varying(100) NOT NULL,
    text character varying(100) NOT NULL,
    ma_tinh character varying(2) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.ds_huyen OWNER TO bhxh_system_user;

--
-- TOC entry 237 (class 1259 OID 16983)
-- Name: ds_huyen_id_seq; Type: SEQUENCE; Schema: public; Owner: bhxh_system_user
--

CREATE SEQUENCE public.ds_huyen_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ds_huyen_id_seq OWNER TO bhxh_system_user;

--
-- TOC entry 3644 (class 0 OID 0)
-- Dependencies: 237
-- Name: ds_huyen_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: bhxh_system_user
--

ALTER SEQUENCE public.ds_huyen_id_seq OWNED BY public.ds_huyen.id;


--
-- TOC entry 236 (class 1259 OID 16963)
-- Name: ds_tinh; Type: TABLE; Schema: public; Owner: bhxh_system_user
--

CREATE TABLE public.ds_tinh (
    id integer NOT NULL,
    ma character varying(2) NOT NULL,
    ten character varying(100) NOT NULL,
    text character varying(100) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.ds_tinh OWNER TO bhxh_system_user;

--
-- TOC entry 235 (class 1259 OID 16962)
-- Name: ds_tinh_id_seq; Type: SEQUENCE; Schema: public; Owner: bhxh_system_user
--

CREATE SEQUENCE public.ds_tinh_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ds_tinh_id_seq OWNER TO bhxh_system_user;

--
-- TOC entry 3645 (class 0 OID 0)
-- Dependencies: 235
-- Name: ds_tinh_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: bhxh_system_user
--

ALTER SEQUENCE public.ds_tinh_id_seq OWNED BY public.ds_tinh.id;


--
-- TOC entry 240 (class 1259 OID 17001)
-- Name: ds_xa; Type: TABLE; Schema: public; Owner: bhxh_system_user
--

CREATE TABLE public.ds_xa (
    id integer NOT NULL,
    ma character varying(5),
    ten character varying(100) NOT NULL,
    text character varying(100) NOT NULL,
    ma_huyen character varying(3) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.ds_xa OWNER TO bhxh_system_user;

--
-- TOC entry 239 (class 1259 OID 17000)
-- Name: ds_xa_id_seq; Type: SEQUENCE; Schema: public; Owner: bhxh_system_user
--

CREATE SEQUENCE public.ds_xa_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ds_xa_id_seq OWNER TO bhxh_system_user;

--
-- TOC entry 3646 (class 0 OID 0)
-- Dependencies: 239
-- Name: ds_xa_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: bhxh_system_user
--

ALTER SEQUENCE public.ds_xa_id_seq OWNED BY public.ds_xa.id;


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
-- TOC entry 3647 (class 0 OID 0)
-- Dependencies: 225
-- Name: households_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: bhxh_system_user
--

ALTER SEQUENCE public.households_id_seq OWNED BY public.households.id;


--
-- TOC entry 242 (class 1259 OID 17017)
-- Name: nguoi_dung; Type: TABLE; Schema: public; Owner: bhxh_system_user
--

CREATE TABLE public.nguoi_dung (
    id integer NOT NULL,
    ten_dang_nhap character varying(50) NOT NULL,
    mat_khau character varying(100) NOT NULL,
    ho_ten character varying(100),
    email character varying(100),
    so_dien_thoai character varying(15),
    vai_tro character varying(20),
    ma_phong_ban character varying(50),
    don_vi character varying(100),
    ma_don_vi integer,
    trang_thai character varying(20) DEFAULT 'active'::character varying,
    ngay_tao timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    ngay_cap_nhat timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    tinh character varying(50),
    huyen character varying(50),
    xa character varying(50),
    thon character varying(50),
    dia_chi text,
    lan_dang_nhap_cuoi timestamp without time zone,
    dang_nhap_lan_dau boolean DEFAULT true,
    da_doi_mat_khau boolean DEFAULT false,
    ngay_xoa timestamp without time zone,
    ip_dang_nhap_cuoi character varying(45),
    vi_tri_dang_nhap_cuoi text
);


ALTER TABLE public.nguoi_dung OWNER TO bhxh_system_user;

--
-- TOC entry 241 (class 1259 OID 17016)
-- Name: nguoi_dung_id_seq; Type: SEQUENCE; Schema: public; Owner: bhxh_system_user
--

CREATE SEQUENCE public.nguoi_dung_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.nguoi_dung_id_seq OWNER TO bhxh_system_user;

--
-- TOC entry 3648 (class 0 OID 0)
-- Dependencies: 241
-- Name: nguoi_dung_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: bhxh_system_user
--

ALTER SEQUENCE public.nguoi_dung_id_seq OWNED BY public.nguoi_dung.id;


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
-- TOC entry 3649 (class 0 OID 0)
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
-- TOC entry 3650 (class 0 OID 0)
-- Dependencies: 218
-- Name: payment_bills_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: bhxh_system_user
--

ALTER SEQUENCE public.payment_bills_id_seq OWNED BY public.payment_bills.id;


--
-- TOC entry 234 (class 1259 OID 16946)
-- Name: refresh_tokens; Type: TABLE; Schema: public; Owner: bhxh_system_user
--

CREATE TABLE public.refresh_tokens (
    id integer NOT NULL,
    user_id integer NOT NULL,
    token character varying(255) NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by_ip character varying(45),
    revoked_at timestamp without time zone,
    revoked_by_ip character varying(45),
    replaced_by_token character varying(255),
    reason_revoked character varying(255)
);


ALTER TABLE public.refresh_tokens OWNER TO bhxh_system_user;

--
-- TOC entry 233 (class 1259 OID 16945)
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: bhxh_system_user
--

CREATE SEQUENCE public.refresh_tokens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.refresh_tokens_id_seq OWNER TO bhxh_system_user;

--
-- TOC entry 3651 (class 0 OID 0)
-- Dependencies: 233
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: bhxh_system_user
--

ALTER SEQUENCE public.refresh_tokens_id_seq OWNED BY public.refresh_tokens.id;


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
-- TOC entry 3652 (class 0 OID 0)
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
-- TOC entry 3653 (class 0 OID 0)
-- Dependencies: 222
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: bhxh_system_user
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 3329 (class 2604 OID 16865)
-- Name: adjustment_requests id; Type: DEFAULT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.adjustment_requests ALTER COLUMN id SET DEFAULT nextval('public.adjustment_requests_id_seq'::regclass);


--
-- TOC entry 3324 (class 2604 OID 16794)
-- Name: adjustments id; Type: DEFAULT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.adjustments ALTER COLUMN id SET DEFAULT nextval('public.adjustments_id_seq'::regclass);


--
-- TOC entry 3282 (class 2604 OID 16479)
-- Name: declaration_batch id; Type: DEFAULT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.declaration_batch ALTER COLUMN id SET DEFAULT nextval('public.declaration_batch_id_seq'::regclass);


--
-- TOC entry 3303 (class 2604 OID 16708)
-- Name: declarations id; Type: DEFAULT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.declarations ALTER COLUMN id SET DEFAULT nextval('public.declarations_id_seq'::regclass);


--
-- TOC entry 3348 (class 2604 OID 17038)
-- Name: dot_ke_khai id; Type: DEFAULT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.dot_ke_khai ALTER COLUMN id SET DEFAULT nextval('public.dot_ke_khai_id_seq'::regclass);


--
-- TOC entry 3338 (class 2604 OID 16987)
-- Name: ds_huyen id; Type: DEFAULT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.ds_huyen ALTER COLUMN id SET DEFAULT nextval('public.ds_huyen_id_seq'::regclass);


--
-- TOC entry 3336 (class 2604 OID 16966)
-- Name: ds_tinh id; Type: DEFAULT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.ds_tinh ALTER COLUMN id SET DEFAULT nextval('public.ds_tinh_id_seq'::regclass);


--
-- TOC entry 3340 (class 2604 OID 17004)
-- Name: ds_xa id; Type: DEFAULT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.ds_xa ALTER COLUMN id SET DEFAULT nextval('public.ds_xa_id_seq'::regclass);


--
-- TOC entry 3316 (class 2604 OID 16746)
-- Name: households id; Type: DEFAULT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.households ALTER COLUMN id SET DEFAULT nextval('public.households_id_seq'::regclass);


--
-- TOC entry 3342 (class 2604 OID 17020)
-- Name: nguoi_dung id; Type: DEFAULT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.nguoi_dung ALTER COLUMN id SET DEFAULT nextval('public.nguoi_dung_id_seq'::regclass);


--
-- TOC entry 3319 (class 2604 OID 16775)
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- TOC entry 3291 (class 2604 OID 16483)
-- Name: payment_bills id; Type: DEFAULT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.payment_bills ALTER COLUMN id SET DEFAULT nextval('public.payment_bills_id_seq'::regclass);


--
-- TOC entry 3334 (class 2604 OID 16949)
-- Name: refresh_tokens id; Type: DEFAULT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('public.refresh_tokens_id_seq'::regclass);


--
-- TOC entry 3293 (class 2604 OID 16484)
-- Name: units id; Type: DEFAULT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.units ALTER COLUMN id SET DEFAULT nextval('public.units_id_seq'::regclass);


--
-- TOC entry 3297 (class 2604 OID 16485)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 3406 (class 2606 OID 16872)
-- Name: adjustment_requests adjustment_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.adjustment_requests
    ADD CONSTRAINT adjustment_requests_pkey PRIMARY KEY (id);


--
-- TOC entry 3402 (class 2606 OID 16802)
-- Name: adjustments adjustments_pkey; Type: CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.adjustments
    ADD CONSTRAINT adjustments_pkey PRIMARY KEY (id);


--
-- TOC entry 3361 (class 2606 OID 16487)
-- Name: declaration_batch declaration_batch_month_year_batch_number_department_code_o_key; Type: CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.declaration_batch
    ADD CONSTRAINT declaration_batch_month_year_batch_number_department_code_o_key UNIQUE (month, year, batch_number, department_code, object_type, service_type);


--
-- TOC entry 3363 (class 2606 OID 16489)
-- Name: declaration_batch declaration_batch_pkey; Type: CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.declaration_batch
    ADD CONSTRAINT declaration_batch_pkey PRIMARY KEY (id);


--
-- TOC entry 3365 (class 2606 OID 16491)
-- Name: declaration_batch declaration_batch_unique_key; Type: CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.declaration_batch
    ADD CONSTRAINT declaration_batch_unique_key UNIQUE (month, year, batch_number, department_code, object_type, service_type);


--
-- TOC entry 3388 (class 2606 OID 16717)
-- Name: declarations declarations_pkey; Type: CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.declarations
    ADD CONSTRAINT declarations_pkey PRIMARY KEY (id);


--
-- TOC entry 3437 (class 2606 OID 17046)
-- Name: dot_ke_khai dot_ke_khai_pkey; Type: CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.dot_ke_khai
    ADD CONSTRAINT dot_ke_khai_pkey PRIMARY KEY (id);


--
-- TOC entry 3421 (class 2606 OID 16992)
-- Name: ds_huyen ds_huyen_ma_key; Type: CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.ds_huyen
    ADD CONSTRAINT ds_huyen_ma_key UNIQUE (ma);


--
-- TOC entry 3423 (class 2606 OID 16990)
-- Name: ds_huyen ds_huyen_pkey; Type: CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.ds_huyen
    ADD CONSTRAINT ds_huyen_pkey PRIMARY KEY (id);


--
-- TOC entry 3416 (class 2606 OID 16982)
-- Name: ds_tinh ds_tinh_ma_unique; Type: CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.ds_tinh
    ADD CONSTRAINT ds_tinh_ma_unique UNIQUE (ma);


--
-- TOC entry 3418 (class 2606 OID 16969)
-- Name: ds_tinh ds_tinh_pkey; Type: CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.ds_tinh
    ADD CONSTRAINT ds_tinh_pkey PRIMARY KEY (id);


--
-- TOC entry 3426 (class 2606 OID 17009)
-- Name: ds_xa ds_xa_ma_key; Type: CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.ds_xa
    ADD CONSTRAINT ds_xa_ma_key UNIQUE (ma);


--
-- TOC entry 3428 (class 2606 OID 17007)
-- Name: ds_xa ds_xa_pkey; Type: CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.ds_xa
    ADD CONSTRAINT ds_xa_pkey PRIMARY KEY (id);


--
-- TOC entry 3396 (class 2606 OID 16754)
-- Name: households households_household_code_key; Type: CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.households
    ADD CONSTRAINT households_household_code_key UNIQUE (household_code);


--
-- TOC entry 3398 (class 2606 OID 16752)
-- Name: households households_pkey; Type: CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.households
    ADD CONSTRAINT households_pkey PRIMARY KEY (id);


--
-- TOC entry 3435 (class 2606 OID 17029)
-- Name: nguoi_dung nguoi_dung_pkey; Type: CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.nguoi_dung
    ADD CONSTRAINT nguoi_dung_pkey PRIMARY KEY (id);


--
-- TOC entry 3400 (class 2606 OID 16784)
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- TOC entry 3373 (class 2606 OID 16499)
-- Name: payment_bills payment_bills_pkey; Type: CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.payment_bills
    ADD CONSTRAINT payment_bills_pkey PRIMARY KEY (id);


--
-- TOC entry 3414 (class 2606 OID 16954)
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- TOC entry 3445 (class 2606 OID 17054)
-- Name: dot_ke_khai unique_thang_nam_so_dot; Type: CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.dot_ke_khai
    ADD CONSTRAINT unique_thang_nam_so_dot UNIQUE (thang, nam, so_dot);


--
-- TOC entry 3377 (class 2606 OID 16501)
-- Name: units units_code_key; Type: CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.units
    ADD CONSTRAINT units_code_key UNIQUE (code);


--
-- TOC entry 3379 (class 2606 OID 16503)
-- Name: units units_pkey; Type: CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.units
    ADD CONSTRAINT units_pkey PRIMARY KEY (id);


--
-- TOC entry 3384 (class 2606 OID 16505)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 3386 (class 2606 OID 16507)
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- TOC entry 3407 (class 1259 OID 16884)
-- Name: idx_adjustment_code; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE UNIQUE INDEX idx_adjustment_code ON public.adjustment_requests USING btree (adjustment_code);


--
-- TOC entry 3408 (class 1259 OID 16878)
-- Name: idx_adjustment_requests_created_by; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_adjustment_requests_created_by ON public.adjustment_requests USING btree (created_by);


--
-- TOC entry 3409 (class 1259 OID 16883)
-- Name: idx_adjustment_requests_is_urgent; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_adjustment_requests_is_urgent ON public.adjustment_requests USING btree (is_urgent);


--
-- TOC entry 3410 (class 1259 OID 16879)
-- Name: idx_adjustment_requests_status; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_adjustment_requests_status ON public.adjustment_requests USING btree (status);


--
-- TOC entry 3403 (class 1259 OID 16814)
-- Name: idx_adjustments_status; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_adjustments_status ON public.adjustments USING btree (status);


--
-- TOC entry 3404 (class 1259 OID 16813)
-- Name: idx_adjustments_user_id; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_adjustments_user_id ON public.adjustments USING btree (user_id);


--
-- TOC entry 3366 (class 1259 OID 16603)
-- Name: idx_declaration_batch_created_by; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_declaration_batch_created_by ON public.declaration_batch USING btree (created_by);


--
-- TOC entry 3367 (class 1259 OID 16508)
-- Name: idx_declaration_batch_deleted_at; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_declaration_batch_deleted_at ON public.declaration_batch USING btree (deleted_at);


--
-- TOC entry 3368 (class 1259 OID 16607)
-- Name: idx_declaration_batch_department; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_declaration_batch_department ON public.declaration_batch USING btree (department_code);


--
-- TOC entry 3369 (class 1259 OID 16605)
-- Name: idx_declaration_batch_month_year; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_declaration_batch_month_year ON public.declaration_batch USING btree (month, year);


--
-- TOC entry 3370 (class 1259 OID 16606)
-- Name: idx_declaration_batch_object_type; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_declaration_batch_object_type ON public.declaration_batch USING btree (object_type);


--
-- TOC entry 3371 (class 1259 OID 16604)
-- Name: idx_declaration_batch_status; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_declaration_batch_status ON public.declaration_batch USING btree (status);


--
-- TOC entry 3389 (class 1259 OID 16719)
-- Name: idx_declarations_bhxh_code; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_declarations_bhxh_code ON public.declarations USING btree (bhxh_code);


--
-- TOC entry 3390 (class 1259 OID 16721)
-- Name: idx_declarations_created_at; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_declarations_created_at ON public.declarations USING btree (created_at);


--
-- TOC entry 3391 (class 1259 OID 16760)
-- Name: idx_declarations_household_id; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_declarations_household_id ON public.declarations USING btree (household_id);


--
-- TOC entry 3392 (class 1259 OID 16890)
-- Name: idx_declarations_is_urgent; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_declarations_is_urgent ON public.declarations USING btree (is_urgent);


--
-- TOC entry 3393 (class 1259 OID 16720)
-- Name: idx_declarations_status; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_declarations_status ON public.declarations USING btree (status);


--
-- TOC entry 3394 (class 1259 OID 16732)
-- Name: idx_declarations_user_id; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_declarations_user_id ON public.declarations USING btree (user_id);


--
-- TOC entry 3438 (class 1259 OID 17050)
-- Name: idx_dot_ke_khai_ngay_bat_dau; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_dot_ke_khai_ngay_bat_dau ON public.dot_ke_khai USING btree (ngay_bat_dau);


--
-- TOC entry 3439 (class 1259 OID 17051)
-- Name: idx_dot_ke_khai_ngay_ket_thuc; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_dot_ke_khai_ngay_ket_thuc ON public.dot_ke_khai USING btree (ngay_ket_thuc);


--
-- TOC entry 3440 (class 1259 OID 17048)
-- Name: idx_dot_ke_khai_so_dot; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_dot_ke_khai_so_dot ON public.dot_ke_khai USING btree (so_dot);


--
-- TOC entry 3441 (class 1259 OID 17047)
-- Name: idx_dot_ke_khai_ten_dot; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_dot_ke_khai_ten_dot ON public.dot_ke_khai USING btree (ten_dot);


--
-- TOC entry 3442 (class 1259 OID 17049)
-- Name: idx_dot_ke_khai_thang_nam; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_dot_ke_khai_thang_nam ON public.dot_ke_khai USING btree (thang, nam);


--
-- TOC entry 3443 (class 1259 OID 17052)
-- Name: idx_dot_ke_khai_trang_thai; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_dot_ke_khai_trang_thai ON public.dot_ke_khai USING btree (trang_thai);


--
-- TOC entry 3424 (class 1259 OID 16998)
-- Name: idx_ds_huyen_ma_tinh; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_ds_huyen_ma_tinh ON public.ds_huyen USING btree (ma_tinh);


--
-- TOC entry 3419 (class 1259 OID 16970)
-- Name: idx_ds_tinh_ma; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_ds_tinh_ma ON public.ds_tinh USING btree (ma);


--
-- TOC entry 3429 (class 1259 OID 17015)
-- Name: idx_ds_xa_ma_huyen; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_ds_xa_ma_huyen ON public.ds_xa USING btree (ma_huyen);


--
-- TOC entry 3430 (class 1259 OID 17031)
-- Name: idx_nguoi_dung_email; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_nguoi_dung_email ON public.nguoi_dung USING btree (email);


--
-- TOC entry 3431 (class 1259 OID 17033)
-- Name: idx_nguoi_dung_ma_phong_ban; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_nguoi_dung_ma_phong_ban ON public.nguoi_dung USING btree (ma_phong_ban);


--
-- TOC entry 3432 (class 1259 OID 17030)
-- Name: idx_nguoi_dung_ten_dang_nhap; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_nguoi_dung_ten_dang_nhap ON public.nguoi_dung USING btree (ten_dang_nhap);


--
-- TOC entry 3433 (class 1259 OID 17032)
-- Name: idx_nguoi_dung_trang_thai; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_nguoi_dung_trang_thai ON public.nguoi_dung USING btree (trang_thai);


--
-- TOC entry 3411 (class 1259 OID 16960)
-- Name: idx_refresh_tokens_token; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_refresh_tokens_token ON public.refresh_tokens USING btree (token);


--
-- TOC entry 3412 (class 1259 OID 16961)
-- Name: idx_refresh_tokens_user_id; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_refresh_tokens_user_id ON public.refresh_tokens USING btree (user_id);


--
-- TOC entry 3374 (class 1259 OID 16518)
-- Name: idx_units_code; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_units_code ON public.units USING btree (code);


--
-- TOC entry 3375 (class 1259 OID 16519)
-- Name: idx_units_status; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_units_status ON public.units USING btree (status);


--
-- TOC entry 3380 (class 1259 OID 16520)
-- Name: idx_users_status; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_users_status ON public.users USING btree (status);


--
-- TOC entry 3381 (class 1259 OID 16521)
-- Name: idx_users_unit_id; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_users_unit_id ON public.users USING btree (unit_id);


--
-- TOC entry 3382 (class 1259 OID 16522)
-- Name: idx_users_username; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_users_username ON public.users USING btree (username);


--
-- TOC entry 3468 (class 2620 OID 16524)
-- Name: declaration_batch tr_update_payment_amount_on_support_change; Type: TRIGGER; Schema: public; Owner: bhxh_system_user
--

CREATE TRIGGER tr_update_payment_amount_on_support_change AFTER UPDATE OF support_amount ON public.declaration_batch FOR EACH ROW EXECUTE FUNCTION public.update_payment_amount_on_support_change();


--
-- TOC entry 3471 (class 2620 OID 16816)
-- Name: adjustments trigger_update_adjustments_updated_at; Type: TRIGGER; Schema: public; Owner: bhxh_system_user
--

CREATE TRIGGER trigger_update_adjustments_updated_at BEFORE UPDATE ON public.adjustments FOR EACH ROW EXECUTE FUNCTION public.update_adjustments_updated_at();


--
-- TOC entry 3469 (class 2620 OID 16525)
-- Name: units update_units_updated_at; Type: TRIGGER; Schema: public; Owner: bhxh_system_user
--

CREATE TRIGGER update_units_updated_at BEFORE UPDATE ON public.units FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 3470 (class 2620 OID 16526)
-- Name: users update_users_updated_at; Type: TRIGGER; Schema: public; Owner: bhxh_system_user
--

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 3464 (class 2606 OID 16873)
-- Name: adjustment_requests adjustment_requests_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.adjustment_requests
    ADD CONSTRAINT adjustment_requests_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- TOC entry 3462 (class 2606 OID 16808)
-- Name: adjustments adjustments_processed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.adjustments
    ADD CONSTRAINT adjustments_processed_by_fkey FOREIGN KEY (processed_by) REFERENCES public.users(id);


--
-- TOC entry 3463 (class 2606 OID 16803)
-- Name: adjustments adjustments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.adjustments
    ADD CONSTRAINT adjustments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 3446 (class 2606 OID 16527)
-- Name: declaration_batch declaration_batch_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.declaration_batch
    ADD CONSTRAINT declaration_batch_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 3447 (class 2606 OID 16532)
-- Name: declaration_batch declaration_batch_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.declaration_batch
    ADD CONSTRAINT declaration_batch_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 3448 (class 2606 OID 16537)
-- Name: declaration_batch declaration_batch_deleted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.declaration_batch
    ADD CONSTRAINT declaration_batch_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.users(id);


--
-- TOC entry 3449 (class 2606 OID 16542)
-- Name: declaration_batch declaration_batch_payment_verified_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.declaration_batch
    ADD CONSTRAINT declaration_batch_payment_verified_by_fkey FOREIGN KEY (payment_verified_by) REFERENCES public.users(id);


--
-- TOC entry 3450 (class 2606 OID 16547)
-- Name: declaration_batch declaration_batch_rejected_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.declaration_batch
    ADD CONSTRAINT declaration_batch_rejected_by_fkey FOREIGN KEY (rejected_by) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 3451 (class 2606 OID 16552)
-- Name: declaration_batch declaration_batch_submitted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.declaration_batch
    ADD CONSTRAINT declaration_batch_submitted_by_fkey FOREIGN KEY (submitted_by) REFERENCES public.users(id);


--
-- TOC entry 3452 (class 2606 OID 16557)
-- Name: declaration_batch declaration_batch_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.declaration_batch
    ADD CONSTRAINT declaration_batch_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 3456 (class 2606 OID 16913)
-- Name: declarations declarations_deleted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.declarations
    ADD CONSTRAINT declarations_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.users(id);


--
-- TOC entry 3457 (class 2606 OID 16755)
-- Name: declarations declarations_household_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.declarations
    ADD CONSTRAINT declarations_household_id_fkey FOREIGN KEY (household_id) REFERENCES public.households(id);


--
-- TOC entry 3466 (class 2606 OID 16993)
-- Name: ds_huyen ds_huyen_ma_tinh_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.ds_huyen
    ADD CONSTRAINT ds_huyen_ma_tinh_fkey FOREIGN KEY (ma_tinh) REFERENCES public.ds_tinh(ma) ON DELETE CASCADE;


--
-- TOC entry 3467 (class 2606 OID 17010)
-- Name: ds_xa ds_xa_ma_huyen_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.ds_xa
    ADD CONSTRAINT ds_xa_ma_huyen_fkey FOREIGN KEY (ma_huyen) REFERENCES public.ds_huyen(ma) ON DELETE CASCADE;


--
-- TOC entry 3458 (class 2606 OID 16722)
-- Name: declarations fk_declarations_batch; Type: FK CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.declarations
    ADD CONSTRAINT fk_declarations_batch FOREIGN KEY (batch_id) REFERENCES public.declaration_batch(id) ON DELETE SET NULL;


--
-- TOC entry 3459 (class 2606 OID 16727)
-- Name: declarations fk_declarations_unit; Type: FK CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.declarations
    ADD CONSTRAINT fk_declarations_unit FOREIGN KEY (unit_id) REFERENCES public.units(id) ON DELETE SET NULL;


--
-- TOC entry 3460 (class 2606 OID 16733)
-- Name: declarations fk_declarations_user; Type: FK CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.declarations
    ADD CONSTRAINT fk_declarations_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 3461 (class 2606 OID 16785)
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 3453 (class 2606 OID 16587)
-- Name: payment_bills payment_bills_batch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.payment_bills
    ADD CONSTRAINT payment_bills_batch_id_fkey FOREIGN KEY (batch_id) REFERENCES public.declaration_batch(id);


--
-- TOC entry 3454 (class 2606 OID 16592)
-- Name: payment_bills payment_bills_uploaded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.payment_bills
    ADD CONSTRAINT payment_bills_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.users(id);


--
-- TOC entry 3465 (class 2606 OID 16955)
-- Name: refresh_tokens refresh_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 3455 (class 2606 OID 16597)
-- Name: users users_unit_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_unit_id_fkey FOREIGN KEY (unit_id) REFERENCES public.units(id);


--
-- TOC entry 2114 (class 826 OID 16391)
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: -; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT ALL ON SEQUENCES TO bhxh_system_user;


--
-- TOC entry 2116 (class 826 OID 16393)
-- Name: DEFAULT PRIVILEGES FOR TYPES; Type: DEFAULT ACL; Schema: -; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT ALL ON TYPES TO bhxh_system_user;


--
-- TOC entry 2115 (class 826 OID 16392)
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: -; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT ALL ON FUNCTIONS TO bhxh_system_user;


--
-- TOC entry 2113 (class 826 OID 16390)
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: -; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT ALL ON TABLES TO bhxh_system_user;


-- Completed on 2025-01-23 23:58:47

--
-- PostgreSQL database dump complete
--

